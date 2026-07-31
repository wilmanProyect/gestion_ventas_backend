import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { INVENTORY_REPOSITORY } from '../../domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface';
import { MinioStorageService } from '@shared/infrastructure/storage/minio-storage.service';
import { Lot } from '../../domain/models/lot.model';
import { LotItem } from '../../domain/models/lot-item.model';
import { CreateLotDto } from '../dtos/create-lot.dto';
import { UUID } from '@shared/domain/value-objects/uuid.vo';

@Injectable()
export class CreateLotUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly storageService: MinioStorageService,
  ) {}

  async execute(dto: CreateLotDto, receiptFile: Express.Multer.File): Promise<Lot> {
    if (!receiptFile) {
      throw new BadRequestException('El comprobante (factura/recibo) del lote es requerido.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El lote debe contener al menos una variedad de arroz.');
    }

    // Subir el comprobante a MinIO en la carpeta 'lots'
    const receiptUrl = await this.storageService.uploadFile(receiptFile, 'lots');

    const lotId = new UUID().getValue();
    const lotItems: LotItem[] = [];

    for (const itemDto of dto.items) {
      const variety = await this.inventoryRepository.findRiceVarietyById(itemDto.varietyId);
      if (!variety) {
        throw new NotFoundException(`La variedad de arroz con ID ${itemDto.varietyId} no existe.`);
      }

      const item = new LotItem(
        new UUID().getValue(),
        lotId,
        variety,
        itemDto.quantityInitial,
        itemDto.quantityInitial, // quantityCurrent inicia igual que quantityInitial
        itemDto.pricePerQuintal,
      );
      lotItems.push(item);
    }

    const lot = new Lot(
      lotId,
      dto.lotNumber,
      receiptUrl,
      new Date(),
      lotItems,
    );

    await this.inventoryRepository.saveLot(lot);
    return lot;
  }
}
