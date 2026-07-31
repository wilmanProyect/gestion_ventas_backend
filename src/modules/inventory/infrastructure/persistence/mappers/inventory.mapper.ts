import { RiceVariety } from '../../../domain/models/rice-variety.model';
import { RiceVarietyOrmEntity } from '../entities/rice-variety.orm-entity';
import { Lot } from '../../../domain/models/lot.model';
import { LotOrmEntity } from '../entities/lot.orm-entity';
import { LotItem } from '../../../domain/models/lot-item.model';
import { LotItemOrmEntity } from '../entities/lot-item.orm-entity';
import { StockMovement } from '../../../domain/models/stock-movement.model';
import { StockMovementOrmEntity } from '../entities/stock-movement.orm-entity';

export class InventoryMapper {
  static toVarietyDomain(orm: RiceVarietyOrmEntity): RiceVariety {
    return new RiceVariety(orm.id, orm.name, orm.description);
  }

  static toVarietyOrm(domain: RiceVariety): RiceVarietyOrmEntity {
    const orm = new RiceVarietyOrmEntity();
    orm.id = domain.getId();
    orm.name = domain.getName();
    orm.description = domain.getDescription();
    return orm;
  }

  static toLotDomain(orm: LotOrmEntity): Lot {
    const items = orm.items ? orm.items.map(itemOrm => this.toLotItemDomain(itemOrm)) : [];
    return new Lot(orm.id, orm.lotNumber, orm.receiptUrl, orm.createdAt, items);
  }

  static toLotOrm(domain: Lot): LotOrmEntity {
    const orm = new LotOrmEntity();
    orm.id = domain.getId();
    orm.lotNumber = domain.getLotNumber();
    orm.receiptUrl = domain.getReceiptUrl();
    orm.createdAt = domain.getCreatedAt();
    if (domain.getItems()) {
      orm.items = domain.getItems().map(item => this.toLotItemOrm(item));
    }
    return orm;
  }

  static toLotItemDomain(orm: LotItemOrmEntity): LotItem {
    return new LotItem(
      orm.id,
      orm.lotId,
      this.toVarietyDomain(orm.variety),
      Number(orm.quantityInitial),
      Number(orm.quantityCurrent),
      Number(orm.pricePerQuintal),
    );
  }

  static toLotItemOrm(domain: LotItem): LotItemOrmEntity {
    const orm = new LotItemOrmEntity();
    orm.id = domain.getId();
    orm.lotId = domain.getLotId();
    orm.varietyId = domain.getVariety().getId();
    orm.quantityInitial = domain.getQuantityInitial();
    orm.quantityCurrent = domain.getQuantityCurrent();
    orm.pricePerQuintal = domain.getPricePerQuintal();
    if (domain.getVariety()) {
      orm.variety = this.toVarietyOrm(domain.getVariety());
    }
    return orm;
  }

  static toMovementDomain(orm: StockMovementOrmEntity): StockMovement {
    return new StockMovement(
      orm.id,
      orm.lotItemId,
      orm.type as any,
      Number(orm.quantity),
      orm.reason,
      orm.registeredById,
      orm.attachmentUrl,
      orm.createdAt,
    );
  }

  static toMovementOrm(domain: StockMovement): StockMovementOrmEntity {
    const orm = new StockMovementOrmEntity();
    orm.id = domain.getId();
    orm.lotItemId = domain.getLotItemId();
    orm.type = domain.getType();
    orm.quantity = domain.getQuantity();
    orm.reason = domain.getReason();
    orm.registeredById = domain.getRegisteredById();
    orm.attachmentUrl = domain.getAttachmentUrl() || undefined as any;
    orm.createdAt = domain.getCreatedAt();
    return orm;
  }
}
