import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface';
import { MinioStorageService } from '@shared/infrastructure/storage/minio-storage.service';
import { Reservation, ReservationStatus } from '../../domain/models/reservation.model';
import { Payment, PaymentMethod } from '../../domain/models/payment.model';
import { PickupReservationDto } from '../dtos/pickup-reservation.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class PickupReservationUseCase {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: ISalesRepository,
    private readonly storageService: MinioStorageService,
  ) {}

  async execute(
    reservationId: string,
    dto: PickupReservationDto,
    proofFile?: Express.Multer.File,
  ): Promise<Reservation> {
    const reservation = await this.salesRepository.findReservationById(reservationId);
    if (!reservation) {
      throw new NotFoundException(`La reserva con ID ${reservationId} no existe.`);
    }

    if (reservation.getStatus() !== ReservationStatus.PENDING) {
      throw new BadRequestException(`No se puede entregar una reserva con estado ${reservation.getStatus()}.`);
    }

    // Calcular el saldo ya pagado
    const totalPaidPreviously = reservation.getPayments().reduce((acc, curr) => acc + curr.getTotalPaid(), 0);
    const remainingBalance = Number((reservation.getTotalPrice() - totalPaidPreviously).toFixed(2));

    if (remainingBalance <= 0) {
      throw new BadRequestException('La reserva ya ha sido pagada en su totalidad.');
    }

    // Validar montos de pago final
    let cash = dto.cashAmount || 0;
    let qr = dto.qrAmount || 0;
    let transfer = dto.transferAmount || 0;

    if (dto.paymentMethod === PaymentMethod.CASH && cash === 0) {
      cash = remainingBalance;
    } else if (dto.paymentMethod === PaymentMethod.QR && qr === 0) {
      qr = remainingBalance;
    } else if (dto.paymentMethod === PaymentMethod.TRANSFER && transfer === 0) {
      transfer = remainingBalance;
    }

    const totalPaidNow = Number((cash + qr + transfer).toFixed(2));
    if (totalPaidNow !== remainingBalance) {
      throw new BadRequestException(`El monto pagado ahora (${totalPaidNow}) no coincide con el saldo restante de la reserva (${remainingBalance}).`);
    }

    // Subir comprobante a MinIO si el pago final es QR/TRANSFER
    let proofUrl: string | null = null;
    if (proofFile && (dto.paymentMethod === PaymentMethod.QR || dto.paymentMethod === PaymentMethod.TRANSFER || dto.paymentMethod === PaymentMethod.MIXED)) {
      proofUrl = await this.storageService.uploadFile(proofFile, 'reservations');
    } else if (!proofFile && (dto.paymentMethod === PaymentMethod.QR || dto.paymentMethod === PaymentMethod.TRANSFER)) {
      throw new BadRequestException(`El comprobante multimedia es obligatorio para pagos por ${dto.paymentMethod}.`);
    }

    // Crear el Pago del Saldo Restante
    const finalPayment = new Payment(
      new UUID().getValue(),
      null,
      reservation.getId(),
      dto.paymentMethod,
      cash,
      qr,
      transfer,
      totalPaidNow,
      proofUrl,
      new Date(),
    );

    // Cambiar estado a recogido/entregado
    reservation.pickup();
    
    // Añadir el nuevo pago a la reserva
    reservation.getPayments().push(finalPayment);

    await this.salesRepository.saveReservation(reservation);
    return reservation;
  }
}
