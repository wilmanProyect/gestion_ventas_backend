export class ReturnItem {
  constructor(
    private readonly id: string,
    private readonly returnId: string,
    private readonly varietyId: string,
    private readonly varietyName: string,
    private readonly lotItemId: string,
    private readonly quantity: number,
  ) {}

  getId(): string {
    return this.id;
  }

  getReturnId(): string {
    return this.returnId;
  }

  getVarietyId(): string {
    return this.varietyId;
  }

  getVarietyName(): string {
    return this.varietyName;
  }

  getLotItemId(): string {
    return this.lotItemId;
  }

  getQuantity(): number {
    return this.quantity;
  }
}
