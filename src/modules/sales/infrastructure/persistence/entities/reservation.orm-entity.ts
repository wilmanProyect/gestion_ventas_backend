import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserOrmEntity } from '@modules/users/infrastructure/persistence/entities/user.orm-entity';
import { ReservationItemOrmEntity } from './reservation-item.orm-entity';
import { PaymentOrmEntity } from './payment.orm-entity';

@Entity('reservations')
export class ReservationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'reservation_number', unique: true })
  reservationNumber: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ type: 'varchar', name: 'customer_phone', nullable: true })
  customerPhone: string | null;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ name: 'registered_by_id' })
  registeredById: string;

  @Column({ type: 'decimal', name: 'total_price', precision: 10, scale: 2 })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy: UserOrmEntity;

  @OneToMany(() => ReservationItemOrmEntity, (item) => item.reservation, { cascade: true })
  items: ReservationItemOrmEntity[];

  @OneToMany(() => PaymentOrmEntity, (payment) => payment.reservation, { cascade: true })
  payments: PaymentOrmEntity[];
}
