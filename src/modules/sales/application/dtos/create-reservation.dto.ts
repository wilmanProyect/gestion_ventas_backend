import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../domain/models/payment.model';
import { CreateSaleItemDto } from './create-sale.dto';

export class CreateReservationDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cliente' })
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: '78945612', description: 'Teléfono de contacto del cliente' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'Variedades de arroz y cantidades a reservar' })
  @IsArray({ message: 'Los ítems de la reserva deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH, description: 'Método de pago del adelanto' })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsEnum(PaymentMethod, { message: 'Método de pago inválido' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 50, description: 'Monto del adelanto en efectivo' })
  @IsOptional()
  @IsNumber()
  cashAmount?: number;

  @ApiProperty({ example: 0, description: 'Monto del adelanto por QR' })
  @IsOptional()
  @IsNumber()
  qrAmount?: number;

  @ApiProperty({ example: 0, description: 'Monto del adelanto por transferencia' })
  @IsOptional()
  @IsNumber()
  transferAmount?: number;

  @ApiProperty({ example: 50, description: 'Monto total pagado como adelanto (pago parcial)' })
  @IsNotEmpty({ message: 'El monto del adelanto es requerido' })
  @IsNumber()
  @Min(0.01, { message: 'El adelanto debe ser mayor a cero' })
  downPayment: number;
}
