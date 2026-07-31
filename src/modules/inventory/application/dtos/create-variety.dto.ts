import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateVarietyDto {
  @ApiProperty({ example: 'Tucán', description: 'Nombre de la variedad de arroz' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Arroz de grano largo y alta calidad', description: 'Descripción detallada de la variedad' })
  @IsOptional()
  @IsString()
  description?: string;
}
