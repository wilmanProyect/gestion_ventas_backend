import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/models/branch.model';

@Injectable()
export class ToggleBranchStatusUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(id: string, isActive: boolean): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new NotFoundException(`La sucursal con ID ${id} no existe.`);
    }

    if (branch.getDeletedAt() !== null) {
      throw new BadRequestException('Una sucursal eliminada lógicamente no puede ser modificada.');
    }

    if (isActive) {
      branch.activate();
    } else {
      branch.deactivate();
    }

    await this.branchRepository.save(branch);
    return branch;
  }
}
