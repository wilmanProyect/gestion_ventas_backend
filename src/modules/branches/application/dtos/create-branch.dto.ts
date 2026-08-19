import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Sucursal Norte', description: 'Nombre único de la sucursal' })
  @IsNotEmpty({ message: 'El nombre de la sucursal es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @ApiProperty({ example: 'Av. Principal #123, Ciudad', description: 'Dirección física de la sucursal' })
  @IsNotEmpty({ message: 'La dirección de la sucursal es requerida' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address: string;
}
