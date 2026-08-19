import { Injectable, Inject } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/models/branch.model';

@Injectable()
export class ListBranchesUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(): Promise<Branch[]> {
    return this.branchRepository.findAll();
  }
}
