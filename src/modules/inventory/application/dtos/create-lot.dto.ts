import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLotItemDto {
  @ApiProperty({ example: 'variety-uuid', description: 'ID de la variedad de arroz' })
  @IsNotEmpty({ message: 'El ID de la variedad es requerido' })
  @IsString()
  varietyId: string;

  @ApiProperty({ example: 100, description: 'Cantidad inicial de quintales' })
  @IsNotEmpty({ message: 'La cantidad inicial es requerida' })
  @IsNumber()
  @Min(0.01, { message: 'La cantidad debe ser mayor a cero' })
  quantityInitial: number;

  @ApiProperty({ example: 25.50, description: 'Precio de venta por quintal establecido para este lote' })
  @IsNotEmpty({ message: 'El precio por quintal es requerido' })
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  pricePerQuintal: number;
}

export class CreateLotDto {
  @ApiProperty({ example: 'LOTE-001', description: 'Número identificador del lote' })
  @IsNotEmpty({ message: 'El número de lote es requerido' })
  @IsString()
  lotNumber: string;

  @ApiProperty({ example: 'branch-uuid', description: 'ID de la sucursal donde se almacenará el lote' })
  @IsNotEmpty({ message: 'El ID de la sucursal es requerido' })
  @IsString()
  branchId: string;

  @ApiProperty({ type: [CreateLotItemDto], description: 'Listado de variedades y sus cantidades/precios en este lote' })
  @IsArray({ message: 'Los ítems del lote deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateLotItemDto)
  items: CreateLotItemDto[];
}
