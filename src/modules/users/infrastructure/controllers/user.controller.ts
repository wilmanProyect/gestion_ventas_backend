import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { AssignRolesUseCase } from '../../application/use-cases/assign-roles.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { UpdateUserStatusUseCase } from '../../application/use-cases/update-user-status.use-case';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { AssignRolesDto } from '../../application/dtos/assign-roles.dto';
import { UpdateUserStatusDto } from '../../application/dtos/update-user-status.dto';

@ApiTags('Usuarios')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly assignRolesUseCase: AssignRolesUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario con roles opcionales' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(createUserDto);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      isActive: user.getIsActive(),
      roles: user.getRoles().map(r => ({
        id: r.getId(),
        name: r.getName(),
      })),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida.' })
  async findAll() {
    const users = await this.listUsersUseCase.execute();
    return users.map(user => ({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      isActive: user.getIsActive(),
      roles: user.getRoles().map(r => ({
        id: r.getId(),
        name: r.getName(),
        permissions: r.getPermissions().map(p => p.getName()),
      })),
    }));
  }

  @Put(':id/roles')
  @ApiOperation({ summary: 'Asignar o actualizar los roles de un usuario' })
  @ApiResponse({ status: 200, description: 'Roles asignados exitosamente.' })
  async assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    const user = await this.assignRolesUseCase.execute(id, assignRolesDto);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      isActive: user.getIsActive(),
      roles: user.getRoles().map(r => ({
        id: r.getId(),
        name: r.getName(),
      })),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario lógicamente' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  async delete(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
    return { message: 'Usuario eliminado exitosamente' };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado activo/inactivo de un usuario' })
  @ApiResponse({ status: 200, description: 'Estado del usuario actualizado exitosamente.' })
  async updateStatus(@Param('id') id: string, @Body() updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.updateUserStatusUseCase.execute(id, updateUserStatusDto);
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      isActive: user.getIsActive(),
    };
  }
}
