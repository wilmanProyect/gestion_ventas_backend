export class Branch {
  constructor(
    private readonly id: string,
    private name: string,
    private address: string,
    private isActive: boolean,
    private deletedAt: Date | null = null,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getAddress(): string {
    return this.address;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  public updateInfo(name: string, address: string): void {
    this.ensureNotDeleted();
    if (!name || name.trim() === '') {
      throw new Error('El nombre de la sucursal no puede estar vacío.');
    }
    if (!address || address.trim() === '') {
      throw new Error('La dirección de la sucursal no puede estar vacía.');
    }
    this.name = name.trim();
    this.address = address.trim();
  }

  public activate(): void {
    this.ensureNotDeleted();
    this.isActive = true;
  }

  public deactivate(): void {
    this.ensureNotDeleted();
    this.isActive = false;
  }

  public delete(): void {
    this.isActive = false;
    this.deletedAt = new Date();
  }

  private ensureNotDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Una sucursal eliminada lógicamente no puede ser modificada ni reactivada.');
    }
  }
}
