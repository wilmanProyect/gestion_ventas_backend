import { LotItem } from './lot-item.model';

export class Lot {
  constructor(
    private readonly id: string,
    private readonly lotNumber: string,
    private readonly receiptUrl: string,
    private readonly createdAt: Date,
    private readonly items: LotItem[] = [],
  ) {}

  getId(): string {
    return this.id;
  }

  getLotNumber(): string {
    return this.lotNumber;
  }

  getReceiptUrl(): string {
    return this.receiptUrl;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getItems(): LotItem[] {
    return this.items;
  }
}
