import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserOrmEntity } from '@modules/users/infrastructure/persistence/entities/user.orm-entity';
import { SaleItemOrmEntity } from './sale-item.orm-entity';
import { PaymentOrmEntity } from './payment.orm-entity';

@Entity('sales')
export class SaleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'sale_number', unique: true })
  saleNumber: string;

  @Column({ name: 'registered_by_id' })
  registeredById: string;

  @Column({ type: 'decimal', name: 'total_price', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'COMPLETED' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy: UserOrmEntity;

  @OneToMany(() => SaleItemOrmEntity, (item) => item.sale, { cascade: true })
  items: SaleItemOrmEntity[];

  @OneToMany(() => PaymentOrmEntity, (payment) => payment.sale, { cascade: true })
  payments: PaymentOrmEntity[];
}
