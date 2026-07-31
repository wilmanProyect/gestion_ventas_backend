import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface';
import { INVENTORY_REPOSITORY } from '@modules/inventory/domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '@modules/inventory/domain/repositories/inventory.repository.interface';
import { MinioStorageService } from '@shared/infrastructure/storage/minio-storage.service';
import { Sale, SaleStatus } from '../../domain/models/sale.model';
import { SaleItem } from '../../domain/models/sale-item.model';
import { Payment, PaymentMethod } from '../../domain/models/payment.model';
import { CreateSaleDto } from '../dtos/create-sale.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: ISalesRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly storageService: MinioStorageService,
  ) {}

  async execute(
    dto: CreateSaleDto,
    registeredById: string,
    proofFile?: Express.Multer.File,
  ): Promise<Sale> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La venta debe contener al menos un producto.');
    }

    const saleId = new UUID().getValue();
    const saleItems: SaleItem[] = [];
    let calculatedTotalPrice = 0;

    // Primero calculamos precios y descontamos stock de lotes
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

        saleItems.push(
          new SaleItem(
            new UUID().getValue(),
            saleId,
            variety.getId(),
            variety.getName(),
            lotItem.getId(),
            remainingQuantityToDeduct,
            price,
            subtotal,
          )
        );
      } 
      // Caso 2: Selección automática por defecto (FIFO - First In, First Out)
      else {
        const activeLotItems = await this.inventoryRepository.findActiveLotItemsByVarietyId(variety.getId());
        if (activeLotItems.length === 0) {
          throw new BadRequestException(`No hay stock disponible para la variedad ${variety.getName()}.`);
        }

        const totalAvailable = activeLotItems.reduce((acc, curr) => acc + curr.getQuantityCurrent(), 0);
        if (totalAvailable < remainingQuantityToDeduct) {
          throw new BadRequestException(`Stock insuficiente para ${variety.getName()}. Solicitado: ${remainingQuantityToDeduct}, Disponible consolidado: ${totalAvailable}`);
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

          saleItems.push(
            new SaleItem(
              new UUID().getValue(),
              saleId,
              variety.getId(),
              variety.getName(),
              lotItem.getId(),
              quantityToTake,
              price,
              subtotal,
            )
          );

          remainingQuantityToDeduct -= quantityToTake;
        }
      }
    }

    // Redondear el precio total de la venta
    calculatedTotalPrice = Number(calculatedTotalPrice.toFixed(2));

    // Validar montos de pago
    let cash = dto.cashAmount || 0;
    let qr = dto.qrAmount || 0;
    let transfer = dto.transferAmount || 0;

    if (dto.paymentMethod === PaymentMethod.CASH && cash === 0) {
      cash = calculatedTotalPrice;
    } else if (dto.paymentMethod === PaymentMethod.QR && qr === 0) {
      qr = calculatedTotalPrice;
    } else if (dto.paymentMethod === PaymentMethod.TRANSFER && transfer === 0) {
      transfer = calculatedTotalPrice;
    }

    const totalPaid = Number((cash + qr + transfer).toFixed(2));
    if (totalPaid !== calculatedTotalPrice) {
      throw new BadRequestException(`El monto pagado (${totalPaid}) no coincide con el total de la venta (${calculatedTotalPrice}).`);
    }

    // Subir comprobante a MinIO si existe y el pago es QR/TRANSFER/MIXED
    let proofUrl: string | null = null;
    if (proofFile && (dto.paymentMethod === PaymentMethod.QR || dto.paymentMethod === PaymentMethod.TRANSFER || dto.paymentMethod === PaymentMethod.MIXED)) {
      proofUrl = await this.storageService.uploadFile(proofFile, 'payments');
    } else if (!proofFile && (dto.paymentMethod === PaymentMethod.QR || dto.paymentMethod === PaymentMethod.TRANSFER)) {
      throw new BadRequestException(`El comprobante multimedia es obligatorio para pagos por ${dto.paymentMethod}.`);
    }

    // Crear el Pago
    const payment = new Payment(
      new UUID().getValue(),
      saleId,
      null,
      dto.paymentMethod,
      cash,
      qr,
      transfer,
      totalPaid,
      proofUrl,
      new Date(),
    );

    // Crear la Venta
    const saleNumber = `V-${Date.now().toString().slice(-8)}`;
    const sale = new Sale(
      saleId,
      saleNumber,
      registeredById,
      calculatedTotalPrice,
      SaleStatus.COMPLETED,
      new Date(),
      saleItems,
      [payment],
    );

    await this.salesRepository.saveSale(sale);
    return sale;
  }
}
