import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SaleOrmEntity } from './sale.orm-entity';
import { ReservationOrmEntity } from './reservation.orm-entity';

@Entity('payments')
export class PaymentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'sale_id', nullable: true })
  saleId: string | null;

  @Column({ name: 'reservation_id', nullable: true })
  reservationId: string | null;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'decimal', name: 'cash_amount', precision: 10, scale: 2, default: 0 })
  cashAmount: number;

  @Column({ type: 'decimal', name: 'qr_amount', precision: 10, scale: 2, default: 0 })
  qrAmount: number;

  @Column({ type: 'decimal', name: 'transfer_amount', precision: 10, scale: 2, default: 0 })
  transferAmount: number;

  @Column({ type: 'decimal', name: 'total_paid', precision: 10, scale: 2 })
  totalPaid: number;

  @Column({ type: 'varchar', name: 'proof_url', nullable: true })
  proofUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => SaleOrmEntity, (sale) => sale.payments, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale: SaleOrmEntity;

  @ManyToOne(() => ReservationOrmEntity, (res) => res.payments, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reservation_id' })
  reservation: ReservationOrmEntity;
}
