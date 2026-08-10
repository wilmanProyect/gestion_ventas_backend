import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (user.getEmail().getValue() === 'admin@admin.com') {
      throw new BadRequestException('Cannot delete system administrator user');
    }

    await this.userRepository.delete(id);
  }
}
