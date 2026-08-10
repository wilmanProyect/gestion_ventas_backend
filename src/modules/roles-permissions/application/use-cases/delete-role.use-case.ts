import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (role.getName() === 'Admin') {
      throw new BadRequestException('Cannot delete system critical Admin role');
    }

    await this.roleRepository.delete(id);
  }
}
