import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { INVENTORY_REPOSITORY } from '../../domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface';
import { RiceVariety } from '../../domain/models/rice-variety.model';
import { CreateVarietyDto } from '../dtos/create-variety.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class CreateVarietyUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(dto: CreateVarietyDto): Promise<RiceVariety> {
    const existing = await this.inventoryRepository.findRiceVarietyByName(dto.name);
    if (existing) {
      throw new ConflictException(`La variedad de arroz con el nombre "${dto.name}" ya existe.`);
    }

    const variety = new RiceVariety(
      new UUID().getValue(),
      dto.name,
      dto.description || '',
    );

    await this.inventoryRepository.saveRiceVariety(variety);
    return variety;
  }
}
