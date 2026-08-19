import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { BRANCH_STOCK_CHECKER } from '../../domain/ports/branch-stock-checker.interface';
import type { IBranchStockChecker } from '../../domain/ports/branch-stock-checker.interface';

@Injectable()
export class DeleteBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    @Inject(BRANCH_STOCK_CHECKER)
    private readonly branchStockChecker: IBranchStockChecker,
  ) {}

  async execute(id: string): Promise<void> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new NotFoundException(`La sucursal con ID ${id} no existe.`);
    }

    const hasStock = await this.branchStockChecker.hasActiveStock(id);
    if (hasStock) {
      throw new BadRequestException('La sucursal no puede eliminarse porque aún tiene lotes con stock disponible.');
    }

    branch.delete();
    await this.branchRepository.save(branch);
  }
}
