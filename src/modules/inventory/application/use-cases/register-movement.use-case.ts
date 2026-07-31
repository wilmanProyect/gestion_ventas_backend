import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { INVENTORY_REPOSITORY } from '../../domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface';
import { MinioStorageService } from '@shared/infrastructure/storage/minio-storage.service';
import { StockMovement, StockMovementType } from '../../domain/models/stock-movement.model';
import { RegisterMovementDto } from '../dtos/register-movement.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class RegisterMovementUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly storageService: MinioStorageService,
  ) {}

  async execute(
    dto: RegisterMovementDto,
    registeredById: string,
    attachmentFile?: Express.Multer.File,
  ): Promise<StockMovement> {
    const lotItem = await this.inventoryRepository.findLotItemById(dto.lotItemId);
    if (!lotItem) {
      throw new NotFoundException(`El ítem de lote con ID ${dto.lotItemId} no existe.`);
    }

    // Aplicar el movimiento al stock actual del ítem de lote
    if (dto.type === StockMovementType.OUTPUT) {
      try {
        lotItem.deductStock(dto.quantity);
      } catch (error: any) {
        throw new BadRequestException(error.message);
      }
    } else if (dto.type === StockMovementType.INPUT) {
      lotItem.addStock(dto.quantity);
    } else {
      throw new BadRequestException('Tipo de movimiento no soportado.');
    }

    // Subir el adjunto a MinIO si se proporciona
    let attachmentUrl: string | null = null;
    if (attachmentFile) {
      attachmentUrl = await this.storageService.uploadFile(attachmentFile, 'movements');
    }

    const movement = new StockMovement(
      new UUID().getValue(),
      lotItem.getId(),
      dto.type,
      dto.quantity,
      dto.reason,
      registeredById,
      attachmentUrl,
      new Date(),
    );

    // Persistir los cambios en base de datos
    await this.inventoryRepository.saveLotItem(lotItem);
    await this.inventoryRepository.saveMovement(movement);

    return movement;
  }
}
