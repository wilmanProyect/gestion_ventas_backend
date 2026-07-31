import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiceVarietyOrmEntity } from './infrastructure/persistence/entities/rice-variety.orm-entity';
import { LotOrmEntity } from './infrastructure/persistence/entities/lot.orm-entity';
import { LotItemOrmEntity } from './infrastructure/persistence/entities/lot-item.orm-entity';
import { StockMovementOrmEntity } from './infrastructure/persistence/entities/stock-movement.orm-entity';
import { INVENTORY_REPOSITORY } from './domain/repositories/inventory.repository.interface';
import { InventoryTypeormRepository } from './infrastructure/persistence/repositories/inventory.typeorm.repository';

import { CreateVarietyUseCase } from './application/use-cases/create-variety.use-case';
import { CreateLotUseCase } from './application/use-cases/create-lot.use-case';
import { RegisterMovementUseCase } from './application/use-cases/register-movement.use-case';
import { ListInventoryUseCase } from './application/use-cases/list-inventory.use-case';
import { InventoryController } from './infrastructure/controllers/inventory.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RiceVarietyOrmEntity,
      LotOrmEntity,
      LotItemOrmEntity,
      StockMovementOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [InventoryController],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useClass: InventoryTypeormRepository,
    },
    CreateVarietyUseCase,
    CreateLotUseCase,
    RegisterMovementUseCase,
    ListInventoryUseCase,
  ],
  exports: [
    INVENTORY_REPOSITORY,
  ],
})
export class InventoryModule {}
