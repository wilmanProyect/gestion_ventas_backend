import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/models/branch.model';
import { CreateBranchDto } from '../dtos/create-branch.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class CreateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(dto: CreateBranchDto): Promise<Branch> {
    const existing = await this.branchRepository.findActiveByName(dto.name);
    if (existing) {
      throw new ConflictException(`La sucursal con el nombre "${dto.name}" ya existe.`);
    }

    const branch = new Branch(
      new UUID().getValue(),
      dto.name,
      dto.address,
      true, // Active by default
      null, // Not deleted
    );

    await this.branchRepository.save(branch);
    return branch;
  }
}
