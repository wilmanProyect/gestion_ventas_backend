import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface';
import { INVENTORY_REPOSITORY } from '@modules/inventory/domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '@modules/inventory/domain/repositories/inventory.repository.interface';
import { Sale, SaleStatus } from '../../domain/models/sale.model';
import { Return } from '../../domain/models/return.model';
import { ReturnItem } from '../../domain/models/return-item.model';
import { StockMovement, StockMovementType } from '@modules/inventory/domain/models/stock-movement.model';
import { ProcessReturnDto } from '../dtos/process-return.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class ProcessReturnUseCase {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: ISalesRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(dto: ProcessReturnDto, registeredById: string): Promise<Return> {
    const sale = await this.salesRepository.findSaleById(dto.saleId);
    if (!sale) {
      throw new NotFoundException(`La venta con ID ${dto.saleId} no existe.`);
    }

    if (sale.getStatus() !== SaleStatus.COMPLETED) {
      throw new BadRequestException(`No se puede procesar una devolución para una venta con estado ${sale.getStatus()}.`);
    }

    const returnId = new UUID().getValue();
    const returnItems: ReturnItem[] = [];

    for (const itemDto of dto.items) {
      // Validar si el ítem existía en la venta
      const soldItem = sale.getItems().find(
        i => i.getVarietyId() === itemDto.varietyId && i.getLotItemId() === itemDto.lotItemId
      );

      if (!soldItem) {
        throw new BadRequestException(`El producto con variedad ID ${itemDto.varietyId} y lote ID ${itemDto.lotItemId} no formaba parte de la venta.`);
      }

      if (itemDto.quantity > soldItem.getQuantity()) {
        throw new BadRequestException(`La cantidad a devolver (${itemDto.quantity}) supera la cantidad originalmente comprada (${soldItem.getQuantity()}).`);
      }

      // Si el vendedor aprueba el reingreso al stock (restock)
      if (itemDto.restock) {
        const lotItem = await this.inventoryRepository.findLotItemById(itemDto.lotItemId);
        if (!lotItem) {
          throw new NotFoundException(`El lote de inventario con ID ${itemDto.lotItemId} no existe para reabastecimiento.`);
        }

        // Agregar de vuelta al inventario
        lotItem.addStock(itemDto.quantity);
        await this.inventoryRepository.saveLotItem(lotItem);

        // Registrar un movimiento de stock de tipo INPUT para auditoría de inventario
        const movement = new StockMovement(
          new UUID().getValue(),
          lotItem.getId(),
          StockMovementType.INPUT,
          itemDto.quantity,
          `Reingreso por devolución de venta ${sale.getSaleNumber()}`,
          registeredById,
          null,
          new Date(),
        );
        await this.inventoryRepository.saveMovement(movement);
      }

      returnItems.push(
        new ReturnItem(
          new UUID().getValue(),
          returnId,
          soldItem.getVarietyId(),
          soldItem.getVarietyName(),
          soldItem.getLotItemId(),
          itemDto.quantity,
        )
      );
    }

    // Actualizar estado de la venta
    sale.markAsReturned();
    await this.salesRepository.saveSale(sale);

    // Guardar la Devolución
    const ret = new Return(
      returnId,
      sale.getId(),
      dto.reason,
      registeredById,
      new Date(),
      returnItems,
    );

    await this.salesRepository.saveReturn(ret);
    return ret;
  }
}
