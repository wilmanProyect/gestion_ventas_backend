import { ReservationItem } from './reservation-item.model';
import { Payment } from './payment.model';

export enum ReservationStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED',
}

export class Reservation {
  constructor(
    private readonly id: string,
    private readonly reservationNumber: string,
    private readonly customerName: string,
    private readonly customerPhone: string | null,
    private status: ReservationStatus,
    private readonly registeredById: string,
    private readonly totalPrice: number,
    private readonly createdAt: Date,
    private readonly items: ReservationItem[] = [],
    private readonly payments: Payment[] = [],
  ) {}

  getId(): string {
    return this.id;
  }

  getReservationNumber(): string {
    return this.reservationNumber;
  }

  getCustomerName(): string {
    return this.customerName;
  }

  getCustomerPhone(): string | null {
    return this.customerPhone;
  }

  getStatus(): ReservationStatus {
    return this.status;
  }

  getRegisteredById(): string {
    return this.registeredById;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getItems(): ReservationItem[] {
    return this.items;
  }

  getPayments(): Payment[] {
    return this.payments;
  }

  pickup(): void {
    if (this.status !== ReservationStatus.PENDING) {
      throw new Error('Solo se pueden recoger reservas pendientes');
    }
    this.status = ReservationStatus.PICKED_UP;
  }

  cancel(): void {
    if (this.status !== ReservationStatus.PENDING) {
      throw new Error('Solo se pueden cancelar reservas pendientes');
    }
    this.status = ReservationStatus.CANCELLED;
  }
}
