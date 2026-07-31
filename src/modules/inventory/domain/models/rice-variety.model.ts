export class RiceVariety {
  constructor(
    private readonly id: string,
    private name: string,
    private description: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  update(name: string, description: string): void {
    this.name = name;
    this.description = description;
  }
}
