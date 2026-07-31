import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { LotItemOrmEntity } from './lot-item.orm-entity';

@Entity('inventory_lots')
export class LotOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'lot_number', unique: true })
  lotNumber: string;

  @Column({ name: 'receipt_url' })
  receiptUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => LotItemOrmEntity, (item) => item.lot, { cascade: true })
  items: LotItemOrmEntity[];
}
