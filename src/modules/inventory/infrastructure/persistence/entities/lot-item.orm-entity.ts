import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LotOrmEntity } from './lot.orm-entity';
import { RiceVarietyOrmEntity } from './rice-variety.orm-entity';

@Entity('lot_items')
export class LotItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'lot_id' })
  lotId: string;

  @Column({ name: 'variety_id' })
  varietyId: string;

  @Column({ type: 'decimal', name: 'quantity_initial', precision: 10, scale: 2 })
  quantityInitial: number;

  @Column({ type: 'decimal', name: 'quantity_current', precision: 10, scale: 2 })
  quantityCurrent: number;

  @Column({ type: 'decimal', name: 'price_per_quintal', precision: 10, scale: 2 })
  pricePerQuintal: number;

  @ManyToOne(() => LotOrmEntity, (lot) => lot.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lot_id' })
  lot: LotOrmEntity;

  @ManyToOne(() => RiceVarietyOrmEntity, { eager: true })
  @JoinColumn({ name: 'variety_id' })
  variety: RiceVarietyOrmEntity;
}
