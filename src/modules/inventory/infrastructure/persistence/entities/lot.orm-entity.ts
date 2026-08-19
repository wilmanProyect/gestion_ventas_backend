import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { LotItemOrmEntity } from './lot-item.orm-entity';
import { BranchOrmEntity } from '../../../../branches/infrastructure/persistence/entities/branch.orm-entity';

@Entity('inventory_lots')
@Index('idx_inventory_lots_branch_id', ['branchId'])
export class LotOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'lot_number', unique: true })
  lotNumber: string;

  @Column({ name: 'receipt_url' })
  receiptUrl: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => LotItemOrmEntity, (item) => item.lot, { cascade: true })
  items: LotItemOrmEntity[];

  @ManyToOne(() => BranchOrmEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchOrmEntity;
}
