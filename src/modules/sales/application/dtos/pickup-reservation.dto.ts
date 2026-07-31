import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { PaymentMethod } from '../../domain/models/payment.model';

export class PickupReservationDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH, description: 'Método de pago del saldo restante' })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsEnum(PaymentMethod, { message: 'Método de pago inválido' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 50, description: 'Monto del pago restante en efectivo' })
  @IsOptional()
  @IsNumber()
  cashAmount?: number;

  @ApiProperty({ example: 0, description: 'Monto del pago restante por QR' })
  @IsOptional()
  @IsNumber()
  qrAmount?: number;

  @ApiProperty({ example: 0, description: 'Monto del pago restante por transferencia' })
  @IsOptional()
  @IsNumber()
  transferAmount?: number;
}
