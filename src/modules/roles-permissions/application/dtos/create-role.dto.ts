import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrador', description: 'Nombre único del rol' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Acceso total al sistema', description: 'Descripción de las responsabilidades del rol' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['uuid-permission-1', 'uuid-permission-2'], description: 'Lista de IDs de permisos asignados' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
