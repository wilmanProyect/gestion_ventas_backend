import { RiceVariety } from './rice-variety.model';

export class LotItem {
  constructor(
    private readonly id: string,
    private readonly lotId: string,
    private readonly variety: RiceVariety,
    private readonly quantityInitial: number,
    private quantityCurrent: number,
    private readonly pricePerQuintal: number,
  ) {}

  getId(): string {
    return this.id;
  }

  getLotId(): string {
    return this.lotId;
  }

  getVariety(): RiceVariety {
    return this.variety;
  }

  getQuantityInitial(): number {
    return this.quantityInitial;
  }

  getQuantityCurrent(): number {
    return this.quantityCurrent;
  }

  getPricePerQuintal(): number {
    return this.pricePerQuintal;
  }

  deductStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('La cantidad a deducir debe ser mayor a cero');
    }
    if (this.quantityCurrent < amount) {
      throw new Error(`Stock insuficiente en el lote. Disponible: ${this.quantityCurrent}, Solicitado: ${amount}`);
    }
    this.quantityCurrent -= amount;
  }

  addStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('La cantidad a añadir debe ser mayor a cero');
    }
    this.quantityCurrent += amount;
  }
}
