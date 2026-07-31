import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleOrmEntity } from './infrastructure/persistence/entities/sale.orm-entity';
import { SaleItemOrmEntity } from './infrastructure/persistence/entities/sale-item.orm-entity';
import { PaymentOrmEntity } from './infrastructure/persistence/entities/payment.orm-entity';
import { ReservationOrmEntity } from './infrastructure/persistence/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from './infrastructure/persistence/entities/reservation-item.orm-entity';
import { ReturnOrmEntity } from './infrastructure/persistence/entities/return.orm-entity';
import { ReturnItemOrmEntity } from './infrastructure/persistence/entities/return-item.orm-entity';

import { SALES_REPOSITORY } from './domain/repositories/sales.repository.interface';
import { SalesTypeormRepository } from './infrastructure/persistence/repositories/sales.typeorm.repository';

import { CreateSaleUseCase } from './application/use-cases/create-sale.use-case';
import { CreateReservationUseCase } from './application/use-cases/create-reservation.use-case';
import { PickupReservationUseCase } from './application/use-cases/pickup-reservation.use-case';
import { ProcessReturnUseCase } from './application/use-cases/process-return.use-case';
import { SalesController } from './infrastructure/controllers/sales.controller';

import { InventoryModule } from '../inventory/inventory.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleOrmEntity,
      SaleItemOrmEntity,
      PaymentOrmEntity,
      ReservationOrmEntity,
      ReservationItemOrmEntity,
      ReturnOrmEntity,
      ReturnItemOrmEntity,
    ]),
    InventoryModule,
    AuthModule,
  ],
  controllers: [SalesController],
  providers: [
    {
      provide: SALES_REPOSITORY,
      useClass: SalesTypeormRepository,
    },
    CreateSaleUseCase,
    CreateReservationUseCase,
    PickupReservationUseCase,
    ProcessReturnUseCase,
  ],
  exports: [
    SALES_REPOSITORY,
  ],
})
export class SalesModule {}
