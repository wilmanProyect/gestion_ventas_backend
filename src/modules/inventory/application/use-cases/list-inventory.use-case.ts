import { Injectable, Inject } from '@nestjs/common';
import { INVENTORY_REPOSITORY } from '../../domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface';

@Injectable()
export class ListInventoryUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute() {
    const lots = await this.inventoryRepository.findAllLots();
    const varieties = await this.inventoryRepository.findAllRiceVarieties();

    // Calcular el stock consolidado disponible por cada variedad de arroz
    const summary = varieties.map(variety => {
      let totalStock = 0;
      lots.forEach(lot => {
        const item = lot.getItems().find(i => i.getVariety().getId() === variety.getId());
        if (item) {
          totalStock += item.getQuantityCurrent();
        }
      });

      return {
        varietyId: variety.getId(),
        name: variety.getName(),
        description: variety.getDescription(),
        totalStock,
      };
    });

    return {
      summary,
      lots: lots.map(lot => ({
        id: lot.getId(),
        lotNumber: lot.getLotNumber(),
        receiptUrl: lot.getReceiptUrl(),
        createdAt: lot.getCreatedAt(),
        items: lot.getItems().map(item => ({
          id: item.getId(),
          varietyId: item.getVariety().getId(),
          varietyName: item.getVariety().getName(),
          quantityInitial: item.getQuantityInitial(),
          quantityCurrent: item.getQuantityCurrent(),
          pricePerQuintal: item.getPricePerQuintal(),
        })),
      })),
    };
  }
}
