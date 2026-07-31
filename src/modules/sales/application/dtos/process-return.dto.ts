import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessReturnItemDto {
  @ApiProperty({ example: 'variety-uuid', description: 'ID de la variedad de arroz devuelta' })
  @IsNotEmpty({ message: 'El ID de la variedad es requerido' })
  @IsString()
  varietyId: string;

  @ApiProperty({ example: 'lot-item-uuid', description: 'ID del ítem del lote del cual se compró originalmente' })
  @IsNotEmpty({ message: 'El ID del lote original es requerido' })
  @IsString()
  lotItemId: string;

  @ApiProperty({ example: 2, description: 'Cantidad de quintales devueltos' })
  @IsNotEmpty({ message: 'La cantidad devuelta es requerida' })
  @IsNumber()
  @Min(0.01, { message: 'La cantidad debe ser mayor a cero' })
  quantity: number;

  @ApiProperty({ example: true, description: 'Si se debe regresar el arroz al stock de inventario (restock)' })
  @IsNotEmpty({ message: 'La propiedad restock es requerida' })
  @IsBoolean()
  restock: boolean;
}

export class ProcessReturnDto {
  @ApiProperty({ example: 'sale-uuid', description: 'ID de la venta' })
  @IsNotEmpty({ message: 'El ID de la venta es requerido' })
  @IsString()
  saleId: string;

  @ApiProperty({ example: 'Arroz húmedo, cambio solicitado', description: 'Razón de la devolución' })
  @IsNotEmpty({ message: 'La razón de la devolución es requerida' })
  @IsString()
  reason: string;

  @ApiProperty({ type: [ProcessReturnItemDto], description: 'Detalle de ítems devueltos' })
  @IsArray({ message: 'Los ítems devueltos deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => ProcessReturnItemDto)
  items: ProcessReturnItemDto[];
}
