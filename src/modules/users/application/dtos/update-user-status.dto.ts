import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ example: true, description: 'Estado activo o inactivo del usuario' })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
