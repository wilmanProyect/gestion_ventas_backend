import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { Permission } from '../../../domain/models/permission.model';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class PermissionSeeder implements OnApplicationBootstrap {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async onApplicationBootstrap() {
    const defaultPermissions = [
      { name: 'users:create', description: 'Permite crear nuevos usuarios' },
      { name: 'users:read', description: 'Permite ver los usuarios y sus detalles' },
      { name: 'users:update', description: 'Permite actualizar la información de los usuarios' },
      { name: 'users:delete', description: 'Permite desactivar o eliminar usuarios' },
      { name: 'roles:create', description: 'Permite crear nuevos roles' },
      { name: 'roles:read', description: 'Permite ver la lista de roles y permisos' },
      { name: 'roles:update', description: 'Permite actualizar roles y sus permisos asociados' },
      { name: 'roles:delete', description: 'Permite eliminar roles' },
      { name: 'create:variety', description: 'Permite registrar nuevas variedades de arroz' },
      { name: 'view:inventory', description: 'Permite visualizar el consolidado y detalle del stock' },
      { name: 'create:lot', description: 'Permite registrar entradas de nuevos lotes de arroz' },
      { name: 'register:movement', description: 'Permite registrar salidas y entradas de stock por merma o ajustes' },
      { name: 'create:sale', description: 'Permite registrar ventas directas' },
      { name: 'create:reservation', description: 'Permite registrar nuevas reservas de stock' },
      { name: 'pickup:reservation', description: 'Permite registrar la recogida de reservas y saldo de pago' },
      { name: 'process:return', description: 'Permite procesar devoluciones de arroz' },
      { name: 'view:sales', description: 'Permite ver el listado de ventas y reservas' },
      { name: 'branches:create', description: 'Permite crear nuevas sucursales' },
      { name: 'branches:read', description: 'Permite ver las sucursales y sus detalles' },
      { name: 'branches:update', description: 'Permite actualizar la información de las sucursales' },
      { name: 'branches:delete', description: 'Permite desactivar o eliminar sucursales' },
    ];

    const existingPermissions = await this.roleRepository.findAllPermissions();
    const existingNames = new Set(existingPermissions.map(p => p.getName()));

    for (const p of defaultPermissions) {
      if (!existingNames.has(p.name)) {
        const id = new UUID().getValue();
        const permission = new Permission(id, p.name, p.description);
        await this.roleRepository.savePermission(permission);
        console.log(`🌱 Seeded permission: ${p.name}`);
      }
    }
  }
}
