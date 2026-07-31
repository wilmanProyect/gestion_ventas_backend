export enum StockMovementType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class StockMovement {
  constructor(
    private readonly id: string,
    private readonly lotItemId: string,
    private readonly type: StockMovementType,
    private readonly quantity: number,
    private readonly reason: string,
    private readonly registeredById: string,
    private readonly attachmentUrl: string | null,
    private readonly createdAt: Date,
  ) {}

  getId(): string {
    return this.id;
  }

  getLotItemId(): string {
    return this.lotItemId;
  }

  getType(): StockMovementType {
    return this.type;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getReason(): string {
    return this.reason;
  }

  getRegisteredById(): string {
    return this.registeredById;
  }

  getAttachmentUrl(): string | null {
    return this.attachmentUrl;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
