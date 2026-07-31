import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SaleOrmEntity } from './sale.orm-entity';
import { RiceVarietyOrmEntity } from '@modules/inventory/infrastructure/persistence/entities/rice-variety.orm-entity';
import { LotItemOrmEntity } from '@modules/inventory/infrastructure/persistence/entities/lot-item.orm-entity';

@Entity('sale_items')
export class SaleItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'sale_id' })
  saleId: string;

  @Column({ name: 'variety_id' })
  varietyId: string;

  @Column({ name: 'variety_name' })
  varietyName: string;

  @Column({ name: 'lot_item_id' })
  lotItemId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', name: 'price_per_unit', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => SaleOrmEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: SaleOrmEntity;

  @ManyToOne(() => RiceVarietyOrmEntity)
  @JoinColumn({ name: 'variety_id' })
  variety: RiceVarietyOrmEntity;

  @ManyToOne(() => LotItemOrmEntity)
  @JoinColumn({ name: 'lot_item_id' })
  lotItem: LotItemOrmEntity;
}
