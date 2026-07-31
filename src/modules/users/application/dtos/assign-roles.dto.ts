import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ example: ['uuid-rol-1', 'uuid-rol-2'], description: 'Lista de IDs de roles a asignar al usuario' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  roleIds: string[];
}
