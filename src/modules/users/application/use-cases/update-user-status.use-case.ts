import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';
import { User } from '../../domain/models/user.model';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, dto: UpdateUserStatusDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (user.getEmail().getValue() === 'admin@admin.com' && !dto.isActive) {
      throw new BadRequestException('Cannot deactivate system administrator user');
    }

    if (dto.isActive) {
      user.activate();
    } else {
      user.deactivate();
    }

    await this.userRepository.save(user);
    return user;
  }
}
