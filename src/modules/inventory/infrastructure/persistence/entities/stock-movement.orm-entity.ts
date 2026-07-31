import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LotItemOrmEntity } from './lot-item.orm-entity';
import { UserOrmEntity } from '@modules/users/infrastructure/persistence/entities/user.orm-entity';

@Entity('stock_movements')
export class StockMovementOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'lot_item_id' })
  lotItemId: string;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column()
  reason: string;

  @Column({ name: 'registered_by_id' })
  registeredById: string;

  @Column({ type: 'varchar', name: 'attachment_url', nullable: true })
  attachmentUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => LotItemOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lot_item_id' })
  lotItem: LotItemOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy: UserOrmEntity;
}
