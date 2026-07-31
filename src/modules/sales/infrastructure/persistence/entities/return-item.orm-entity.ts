import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReturnOrmEntity } from './return.orm-entity';
import { RiceVarietyOrmEntity } from '@modules/inventory/infrastructure/persistence/entities/rice-variety.orm-entity';
import { LotItemOrmEntity } from '@modules/inventory/infrastructure/persistence/entities/lot-item.orm-entity';

@Entity('return_items')
export class ReturnItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'return_id' })
  returnId: string;

  @Column({ name: 'variety_id' })
  varietyId: string;

  @Column({ name: 'variety_name' })
  varietyName: string;

  @Column({ name: 'lot_item_id' })
  lotItemId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @ManyToOne(() => ReturnOrmEntity, (ret) => ret.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_id' })
  ret: ReturnOrmEntity;

  @ManyToOne(() => RiceVarietyOrmEntity)
  @JoinColumn({ name: 'variety_id' })
  variety: RiceVarietyOrmEntity;

  @ManyToOne(() => LotItemOrmEntity)
  @JoinColumn({ name: 'lot_item_id' })
  lotItem: LotItemOrmEntity;
}
