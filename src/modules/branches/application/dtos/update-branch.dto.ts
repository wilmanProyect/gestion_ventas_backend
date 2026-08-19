import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Sucursal Norte Modificada', description: 'Nombre único de la sucursal' })
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío si se proporciona' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @ApiPropertyOptional({ example: 'Nueva Av. Principal #456, Ciudad', description: 'Dirección física de la sucursal' })
  @IsOptional()
  @IsNotEmpty({ message: 'La dirección no puede estar vacía si se proporciona' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;
}
