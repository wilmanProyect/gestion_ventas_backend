import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'Administrador Modificado', description: 'Nombre único del rol' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @ApiProperty({ example: 'Acceso total y auditoría', description: 'Descripción de las responsabilidades del rol' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['uuid-permission-1', 'uuid-permission-3'], description: 'Lista de IDs de permisos asignados' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
