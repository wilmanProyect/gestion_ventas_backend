import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SaleOrmEntity } from './sale.orm-entity';
import { UserOrmEntity } from '@modules/users/infrastructure/persistence/entities/user.orm-entity';
import { ReturnItemOrmEntity } from './return-item.orm-entity';

@Entity('returns')
export class ReturnOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'sale_id' })
  saleId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'registered_by_id' })
  registeredById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => SaleOrmEntity)
  @JoinColumn({ name: 'sale_id' })
  sale: SaleOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy: UserOrmEntity;

  @OneToMany(() => ReturnItemOrmEntity, (item) => item.ret, { cascade: true })
  items: ReturnItemOrmEntity[];
}
