export class SaleItem {
  constructor(
    private readonly id: string,
    private readonly saleId: string,
    private readonly varietyId: string,
    private readonly varietyName: string,
    private readonly lotItemId: string,
    private readonly quantity: number,
    private readonly pricePerUnit: number,
    private readonly subtotal: number,
  ) {}

  getId(): string {
    return this.id;
  }

  getSaleId(): string {
    return this.saleId;
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

  getPricePerUnit(): number {
    return this.pricePerUnit;
  }

  getSubtotal(): number {
    return this.subtotal;
  }
}
