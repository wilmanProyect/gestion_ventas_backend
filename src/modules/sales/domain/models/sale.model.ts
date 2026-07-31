import { SaleItem } from './sale-item.model';
import { Payment } from './payment.model';

export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export class Sale {
  constructor(
    private readonly id: string,
    private readonly saleNumber: string,
    private readonly registeredById: string,
    private readonly totalPrice: number,
    private status: SaleStatus,
    private readonly createdAt: Date,
    private readonly items: SaleItem[] = [],
    private readonly payments: Payment[] = [],
  ) {}

  getId(): string {
    return this.id;
  }

  getSaleNumber(): string {
    return this.saleNumber;
  }

  getRegisteredById(): string {
    return this.registeredById;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getStatus(): SaleStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getItems(): SaleItem[] {
    return this.items;
  }

  getPayments(): Payment[] {
    return this.payments;
  }

  cancel(): void {
    if (this.status !== SaleStatus.COMPLETED) {
      throw new Error('Solo se pueden cancelar ventas completadas');
    }
    this.status = SaleStatus.CANCELLED;
  }

  markAsReturned(): void {
    this.status = SaleStatus.RETURNED;
  }
}
