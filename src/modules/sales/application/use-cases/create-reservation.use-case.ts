import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface';
import { INVENTORY_REPOSITORY } from '@modules/inventory/domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '@modules/inventory/domain/repositories/inventory.repository.interface';
import { MinioStorageService } from '@shared/infrastructure/storage/minio-storage.service';
import { Reservation, ReservationStatus } from '../../domain/models/reservation.model';
import { ReservationItem } from '../../domain/models/reservation-item.model';
import { Payment, PaymentMethod } from '../../domain/models/payment.model';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: ISalesRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly storageService: MinioStorageService,
  ) {}

  async execute(
    dto: CreateReservationDto,
    registeredById: string,
    proofFile?: Express.Multer.File,
  ): Promise<Reservation> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La reserva debe contener al menos un producto.');
    }

    const reservationId = new UUID().getValue();
    const reservationItems: ReservationItem[] = [];
    let calculatedTotalPrice = 0;

    // 1. Validar y descontar stock
    for (const itemDto of dto.items) {
      const variety = await this.inventoryRepository.findRiceVarietyById(itemDto.varietyId);
      if (!variety) {
        throw new NotFoundException(`La variedad de arroz con ID ${itemDto.varietyId} no existe.`);
      }

      let remainingQuantityToDeduct = itemDto.quantity;

      // Caso 1: Selección manual de lote
      if (itemDto.lotItemId) {
        const lotItem = await this.inventoryRepository.findLotItemById(itemDto.lotItemId);
        if (!lotItem) {
          throw new NotFoundException(`El lote de inventario con ID ${itemDto.lotItemId} no existe.`);
        }
        if (lotItem.getVariety().getId() !== variety.getId()) {
          throw new BadRequestException(`El lote seleccionado no corresponde a la variedad ${variety.getName()}.`);
        }

        try {
          lotItem.deductStock(remainingQuantityToDeduct);
        } catch (err: any) {
          throw new BadRequestException(`Lote ${itemDto.lotItemId}: ${err.message}`);
        }

        await this.inventoryRepository.saveLotItem(lotItem);

        const price = itemDto.pricePerUnit !== undefined ? itemDto.pricePerUnit : lotItem.getPricePerQuintal();
        const subtotal = Number((remainingQuantityToDeduct * price).toFixed(2));
        calculatedTotalPrice += subtotal;

        reservationItems.push(
          new ReservationItem(
            new UUID().getValue(),
            reservationId,
            variety.getId(),
            variety.getName(),
            remainingQuantityToDeduct,
            price,
            subtotal,
          )
        );
      }
      // Caso 2: Selección automática por defecto (FIFO)
      else {
        const activeLotItems = await this.inventoryRepository.findActiveLotItemsByVarietyId(variety.getId());
        if (activeLotItems.length === 0) {
          throw new BadRequestException(`No hay stock disponible para la variedad ${variety.getName()}.`);
        }

        const totalAvailable = activeLotItems.reduce((acc, curr) => acc + curr.getQuantityCurrent(), 0);
        if (totalAvailable < remainingQuantityToDeduct) {
          throw new BadRequestException(`Stock insuficiente para reservar ${variety.getName()}. Solicitado: ${remainingQuantityToDeduct}, Disponible consolidado: ${totalAvailable}`);
        }

        for (const lotItem of activeLotItems) {
          if (remainingQuantityToDeduct <= 0) break;

          const availableInThisLot = lotItem.getQuantityCurrent();
          const quantityToTake = Math.min(availableInThisLot, remainingQuantityToDeduct);

          lotItem.deductStock(quantityToTake);
          await this.inventoryRepository.saveLotItem(lotItem);

          const price = itemDto.pricePerUnit !== undefined ? itemDto.pricePerUnit : lotItem.getPricePerQuintal();
          const subtotal = Number((quantityToTake * price).toFixed(2));
          calculatedTotalPrice += subtotal;

          reservationItems.push(
            new ReservationItem(
              new UUID().getValue(),
              reservationId,
              variety.getId(),
              variety.getName(),
              quantityToTake,
              price,
              subtotal,
            )
          );

          remainingQuantityToDeduct -= quantityToTake;
        }
      }
    }

    calculatedTotalPrice = Number(calculatedTotalPrice.toFixed(2));

    // 2. Validar adelanto
    if (dto.downPayment > calculatedTotalPrice) {
      throw new BadRequestException(`El adelanto (${dto.downPayment}) no puede superar el total de la reserva (${calculatedTotalPrice}).`);
    }

    let cash = dto.cashAmount || 0;
    let qr = dto.qrAmount || 0;
    let transfer = dto.transferAmount || 0;

    if (dto.paymentMethod === PaymentMethod.CASH && cash === 0) {
      cash = dto.downPayment;
    } else if (dto.paymentMethod === PaymentMethod.QR && qr === 0) {
      qr = dto.downPayment;
    } else if (dto.paymentMethod === PaymentMethod.TRANSFER && transfer === 0) {
      transfer = dto.downPayment;
    }

    const totalPaid = Number((cash + qr + transfer).toFixed(2));
    if (totalPaid !== dto.downPayment) {
      throw new BadRequestException(`La suma de montos pagados (${totalPaid}) no coincide con el adelanto declarado (${dto.downPayment}).`);
    }

    // 3. Subir comprobante a MinIO
    let proofUrl: string | null = null;
    if (proofFile && (dto.paymentMethod === PaymentMethod.QR || dto.paymentMethod === PaymentMethod.TRANSFER || dto.paymentMethod === PaymentMethod.MIXED)) {
      proofUrl = await this.storageService.uploadFile(proofFile, 'reservations');
    } else if (!proofFile && (dto.paymentMethod === PaymentMethod.QR || dto.paymentMethod === PaymentMethod.TRANSFER)) {
      throw new BadRequestException(`El comprobante multimedia es obligatorio para pagos por ${dto.paymentMethod}.`);
    }

    // 4. Crear el Pago Parcial
    const payment = new Payment(
      new UUID().getValue(),
      null,
      reservationId,
      dto.paymentMethod,
      cash,
      qr,
      transfer,
      totalPaid,
      proofUrl,
      new Date(),
    );

    // 5. Crear la Reserva
    const reservationNumber = `R-${Date.now().toString().slice(-8)}`;
    const reservation = new Reservation(
      reservationId,
      reservationNumber,
      dto.customerName,
      dto.customerPhone || null,
      ReservationStatus.PENDING,
      registeredById,
      calculatedTotalPrice,
      new Date(),
      reservationItems,
      [payment],
    );

    await this.salesRepository.saveReservation(reservation);
    return reservation;
  }
}
