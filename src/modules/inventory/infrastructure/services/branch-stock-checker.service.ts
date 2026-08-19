import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBranchStockChecker } from '../../../branches/domain/ports/branch-stock-checker.interface';
import { LotItemOrmEntity } from '../persistence/entities/lot-item.orm-entity';

@Injectable()
export class BranchStockCheckerService implements IBranchStockChecker {
  constructor(
    @InjectRepository(LotItemOrmEntity)
    private readonly lotItemRepository: Repository<LotItemOrmEntity>,
  ) {}

  async hasActiveStock(branchId: string): Promise<boolean> {
    const count = await this.lotItemRepository
      .createQueryBuilder('lotItem')
      .innerJoin('lotItem.lot', 'lot')
      .where('lot.branch_id = :branchId', { branchId }) // database column name is branch_id
      .andWhere('lotItem.quantity_current > 0') // database column name is quantity_current
      .getCount();

    return count > 0;
  }
}
