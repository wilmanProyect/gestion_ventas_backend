import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../domain/models/payment.model';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'variety-uuid', description: 'ID de la variedad de arroz' })
  @IsNotEmpty({ message: 'El ID de la variedad es requerido' })
  @IsString()
  varietyId: string;

  @ApiProperty({ example: 10, description: 'Cantidad de quintales a comprar' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber()
  @Min(0.01, { message: 'La cantidad debe ser mayor a cero' })
  quantity: number;

  @ApiProperty({ example: 'lot-item-uuid', description: 'Opcional. ID del ítem de lote específico para descontar stock. Si no se provee, se usará FIFO.' })
  @IsOptional()
  @IsString()
  lotItemId?: string;

  @ApiProperty({ example: 25.50, description: 'Opcional. Precio pactado. Si no se provee, se usará el precio del lote.' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  pricePerUnit?: number;
}

export class CreateSaleDto {
  @ApiProperty({ type: [CreateSaleItemDto], description: 'Items de la venta' })
  @IsArray({ message: 'Los ítems de la venta deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH, description: 'Método de pago' })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsEnum(PaymentMethod, { message: 'Método de pago inválido' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 100, description: 'Monto pagado en efectivo (obligatorio si el método es CASH o MIXED)' })
  @IsOptional()
  @IsNumber()
  cashAmount?: number;

  @ApiProperty({ example: 155, description: 'Monto pagado mediante QR (obligatorio si el método es QR o MIXED)' })
  @IsOptional()
  @IsNumber()
  qrAmount?: number;

  @ApiProperty({ example: 0, description: 'Monto pagado mediante transferencia (obligatorio si el método es TRANSFER o MIXED)' })
  @IsOptional()
  @IsNumber()
  transferAmount?: number;
}
