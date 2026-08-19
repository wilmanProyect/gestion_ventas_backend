import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/models/branch.model';
import { UpdateBranchDto } from '../dtos/update-branch.dto';

@Injectable()
export class UpdateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new NotFoundException(`La sucursal con ID ${id} no existe.`);
    }

    if (branch.getDeletedAt() !== null) {
      throw new BadRequestException('Una sucursal eliminada lógicamente no puede ser modificada.');
    }

    // Si se está cambiando el nombre, validar que sea único
    if (dto.name && dto.name.trim() !== branch.getName()) {
      const existing = await this.branchRepository.findActiveByName(dto.name);
      if (existing && existing.getId() !== id) {
        throw new ConflictException(`La sucursal con el nombre "${dto.name}" ya existe.`);
      }
    }

    const updatedName = dto.name !== undefined ? dto.name : branch.getName();
    const updatedAddress = dto.address !== undefined ? dto.address : branch.getAddress();

    branch.updateInfo(updatedName, updatedAddress);

    await this.branchRepository.save(branch);
    return branch;
  }
}
