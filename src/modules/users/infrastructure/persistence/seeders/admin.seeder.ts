import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '@modules/roles-permissions/domain/repositories/role.repository.interface';
import type { IRoleRepository } from '@modules/roles-permissions/domain/repositories/role.repository.interface';
import { USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '@modules/users/domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '@modules/users/domain/ports/password-hasher.interface';
import type { IPasswordHasher } from '@modules/users/domain/ports/password-hasher.interface';

import { Role } from '@modules/roles-permissions/domain/models/role.model';
import { User } from '@modules/users/domain/models/user.model';
import { Email } from '@modules/users/domain/value-objects/email.vo';
import { Password } from '@modules/users/domain/value-objects/password.vo';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async onApplicationBootstrap() {
    // Esperar un breve instante para que PermissionSeeder termine de poblar la lista de permisos
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // 1. Obtener todas las permisos sembrados
      const allPermissions = await this.roleRepository.findAllPermissions();

      // 2. Buscar o crear el rol "Admin"
      let adminRole = await this.roleRepository.findByName('Admin');
      if (!adminRole) {
        const id = new UUID().getValue();
        adminRole = new Role(id, 'Admin', 'Rol administrador con todos los permisos', allPermissions);
        await this.roleRepository.save(adminRole);
        console.log('🌱 Rol Admin creado exitosamente con todos los permisos.');
      } else {
        // Asegurarse de que el rol Admin contenga todos los permisos actuales
        adminRole.updatePermissions(allPermissions);
        await this.roleRepository.save(adminRole);
        console.log('🌱 Rol Admin actualizado con todos los permisos.');
      }

      // 3. Buscar o crear el usuario administrador
      const emailStr = 'admin@admin.com';
      const existingUser = await this.userRepository.findByEmail(emailStr);

      if (!existingUser) {
        const passHash = await this.passwordHasher.hash('admim123');
        const userId = new UUID().getValue();
        const user = new User(
          userId,
          'Administrador',
          new Email(emailStr),
          new Password(passHash),
          true,
          [adminRole],
        );

        await this.userRepository.save(user);
        console.log('🌱 Usuario administrador creado exitosamente (admin@admin.com / admim123).');
      } else {
        // Asegurarse de que tenga asignado el rol Admin
        const hasAdminRole = existingUser.getRoles().some(r => r.getName() === 'Admin');
        if (!hasAdminRole) {
          existingUser.assignRoles([...existingUser.getRoles(), adminRole]);
          await this.userRepository.save(existingUser);
          console.log('🌱 Rol Admin asignado al usuario administrador existente.');
        }
      }
    } catch (error) {
      console.error('❌ Error al sembrar el usuario administrador:', error);
    }
  }
}
