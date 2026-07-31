import { ReturnItem } from './return-item.model';

export class Return {
  constructor(
    private readonly id: string,
    private readonly saleId: string,
    private readonly reason: string,
    private readonly registeredById: string,
    private readonly createdAt: Date,
    private readonly items: ReturnItem[] = [],
  ) {}

  getId(): string {
    return this.id;
  }

  getSaleId(): string {
    return this.saleId;
  }

  getReason(): string {
    return this.reason;
  }

  getRegisteredById(): string {
    return this.registeredById;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getItems(): ReturnItem[] {
    return this.items;
  }
}
