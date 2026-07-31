import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInventoryRepository } from '../../../domain/repositories/inventory.repository.interface';
import { Lot } from '../../../domain/models/lot.model';
import { LotItem } from '../../../domain/models/lot-item.model';
import { StockMovement } from '../../../domain/models/stock-movement.model';
import { RiceVariety } from '../../../domain/models/rice-variety.model';

import { LotOrmEntity } from '../entities/lot.orm-entity';
import { LotItemOrmEntity } from '../entities/lot-item.orm-entity';
import { StockMovementOrmEntity } from '../entities/stock-movement.orm-entity';
import { RiceVarietyOrmEntity } from '../entities/rice-variety.orm-entity';
import { InventoryMapper } from '../mappers/inventory.mapper';

@Injectable()
export class InventoryTypeormRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(LotOrmEntity)
    private readonly lotRepository: Repository<LotOrmEntity>,
    @InjectRepository(LotItemOrmEntity)
    private readonly lotItemRepository: Repository<LotItemOrmEntity>,
    @InjectRepository(StockMovementOrmEntity)
    private readonly movementRepository: Repository<StockMovementOrmEntity>,
    @InjectRepository(RiceVarietyOrmEntity)
    private readonly varietyRepository: Repository<RiceVarietyOrmEntity>,
  ) {}

  async saveLot(lot: Lot): Promise<void> {
    const orm = InventoryMapper.toLotOrm(lot);
    await this.lotRepository.save(orm);
  }

  async findLotById(id: string): Promise<Lot | null> {
    const orm = await this.lotRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    return orm ? InventoryMapper.toLotDomain(orm) : null;
  }

  async findAllLots(): Promise<Lot[]> {
    const orms = await this.lotRepository.find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => InventoryMapper.toLotDomain(orm));
  }

  async findLotItemById(id: string): Promise<LotItem | null> {
    const orm = await this.lotItemRepository.findOne({
      where: { id },
    });
    return orm ? InventoryMapper.toLotItemDomain(orm) : null;
  }

  async saveLotItem(lotItem: LotItem): Promise<void> {
    const orm = InventoryMapper.toLotItemOrm(lotItem);
    await this.lotItemRepository.save(orm);
  }

  async findActiveLotItemsByVarietyId(varietyId: string): Promise<LotItem[]> {
    // Buscar ítems de lote activos (con stock disponible) para una variedad, ordenados por la fecha del lote ASC (FIFO)
    const orms = await this.lotItemRepository
      .createQueryBuilder('lotItem')
      .innerJoinAndSelect('lotItem.lot', 'lot')
      .innerJoinAndSelect('lotItem.variety', 'variety')
      .where('lotItem.varietyId = :varietyId', { varietyId })
      .andWhere('lotItem.quantityCurrent > 0')
      .orderBy('lot.createdAt', 'ASC')
      .getMany();

    return orms.map(orm => InventoryMapper.toLotItemDomain(orm));
  }

  async saveMovement(movement: StockMovement): Promise<void> {
    const orm = InventoryMapper.toMovementOrm(movement);
    await this.movementRepository.save(orm);
  }

  async findRiceVarietyById(id: string): Promise<RiceVariety | null> {
    const orm = await this.varietyRepository.findOne({ where: { id } });
    return orm ? InventoryMapper.toVarietyDomain(orm) : null;
  }

  async findRiceVarietyByName(name: string): Promise<RiceVariety | null> {
    const orm = await this.varietyRepository.findOne({ where: { name } });
    return orm ? InventoryMapper.toVarietyDomain(orm) : null;
  }

  async findAllRiceVarieties(): Promise<RiceVariety[]> {
    const orms = await this.varietyRepository.find({ order: { name: 'ASC' } });
    return orms.map(orm => InventoryMapper.toVarietyDomain(orm));
  }

  async saveRiceVariety(variety: RiceVariety): Promise<void> {
    const orm = InventoryMapper.toVarietyOrm(variety);
    await this.varietyRepository.save(orm);
  }
}
