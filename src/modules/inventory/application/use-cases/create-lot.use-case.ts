import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { INVENTORY_REPOSITORY } from '../../domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface';
import { BRANCH_REPOSITORY } from '../../../branches/domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../../branches/domain/repositories/branch.repository.interface';
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
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
    private readonly storageService: MinioStorageService,
  ) {}

  async execute(dto: CreateLotDto, receiptFile: Express.Multer.File): Promise<Lot> {
    if (!receiptFile) {
      throw new BadRequestException('El comprobante (factura/recibo) del lote es requerido.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El lote debe contener al menos una variedad de arroz.');
    }

    // Validar sucursal
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(`La sucursal con ID ${dto.branchId} no existe.`);
    }
    if (!branch.getIsActive() || branch.getDeletedAt() !== null) {
      throw new BadRequestException(`La sucursal "${branch.getName()}" se encuentra inactiva o eliminada.`);
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
      dto.branchId,
      new Date(),
      lotItems,
    );

    await this.inventoryRepository.saveLot(lot);
    return lot;
  }
}
