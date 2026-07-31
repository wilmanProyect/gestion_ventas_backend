export class ReservationItem {
  constructor(
    private readonly id: string,
    private readonly reservationId: string,
    private readonly varietyId: string,
    private readonly varietyName: string,
    private readonly quantity: number,
    private readonly pricePerUnit: number,
    private readonly subtotal: number,
  ) {}

  getId(): string {
    return this.id;
  }

  getReservationId(): string {
    return this.reservationId;
  }

  getVarietyId(): string {
    return this.varietyId;
  }

  getVarietyName(): string {
    return this.varietyName;
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
