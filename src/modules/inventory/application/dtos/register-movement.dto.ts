import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsPositive, Min } from 'class-validator';
import { StockMovementType } from '../../domain/models/stock-movement.model';

export class RegisterMovementDto {
  @ApiProperty({ example: 'lot-item-uuid', description: 'ID de la variedad específica por lote' })
  @IsNotEmpty({ message: 'El ID del ítem de lote es requerido' })
  @IsString()
  lotItemId: string;

  @ApiProperty({ enum: StockMovementType, example: StockMovementType.OUTPUT, description: 'Tipo de movimiento (INPUT/OUTPUT)' })
  @IsNotEmpty({ message: 'El tipo de movimiento es requerido' })
  @IsEnum(StockMovementType, { message: 'El tipo de movimiento debe ser INPUT u OUTPUT' })
  type: StockMovementType;

  @ApiProperty({ example: 5.5, description: 'Cantidad de quintales a mover (debe ser mayor a cero)' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber()
  @Min(0.01, { message: 'La cantidad debe ser mayor a cero' })
  quantity: number;

  @ApiProperty({ example: 'Merma por humedad', description: 'Razón o detalle del movimiento' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  @IsString()
  reason: string;
}
