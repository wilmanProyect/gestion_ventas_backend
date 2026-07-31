import { Lot } from '../models/lot.model';
import { LotItem } from '../models/lot-item.model';
import { StockMovement } from '../models/stock-movement.model';
import { RiceVariety } from '../models/rice-variety.model';

export interface IInventoryRepository {
  saveLot(lot: Lot): Promise<void>;
  findLotById(id: string): Promise<Lot | null>;
  findAllLots(): Promise<Lot[]>;
  
  findLotItemById(id: string): Promise<LotItem | null>;
  saveLotItem(lotItem: LotItem): Promise<void>;
  findActiveLotItemsByVarietyId(varietyId: string): Promise<LotItem[]>;

  saveMovement(movement: StockMovement): Promise<void>;

  findRiceVarietyById(id: string): Promise<RiceVariety | null>;
  findRiceVarietyByName(name: string): Promise<RiceVariety | null>;
  findAllRiceVarieties(): Promise<RiceVariety[]>;
  saveRiceVariety(variety: RiceVariety): Promise<void>;
}

export const INVENTORY_REPOSITORY = Symbol('IInventoryRepository');
