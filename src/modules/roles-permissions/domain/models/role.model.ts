import { Permission } from './permission.model';

export class Role {
  constructor(
    private readonly id: string,
    private name: string,
    private description: string,
    private permissions: Permission[] = [],
    private deletedAt: Date | null = null,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getPermissions(): Permission[] {
    return this.permissions;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  public delete(): void {
    this.deletedAt = new Date();
  }

  public updateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Role name cannot be empty');
    }
    this.name = name;
  }

  public updateDescription(description: string): void {
    this.description = description;
  }

  public updatePermissions(permissions: Permission[]): void {
    this.permissions = permissions;
  }
}
