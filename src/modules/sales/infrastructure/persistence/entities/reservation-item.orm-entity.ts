import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReservationOrmEntity } from './reservation.orm-entity';
import { RiceVarietyOrmEntity } from '@modules/inventory/infrastructure/persistence/entities/rice-variety.orm-entity';

@Entity('reservation_items')
export class ReservationItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'reservation_id' })
  reservationId: string;

  @Column({ name: 'variety_id' })
  varietyId: string;

  @Column({ name: 'variety_name' })
  varietyName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', name: 'price_per_unit', precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => ReservationOrmEntity, (res) => res.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: ReservationOrmEntity;

  @ManyToOne(() => RiceVarietyOrmEntity)
  @JoinColumn({ name: 'variety_id' })
  variety: RiceVarietyOrmEntity;
}
