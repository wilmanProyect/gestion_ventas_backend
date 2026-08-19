import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchOrmEntity } from './infrastructure/persistence/entities/branch.orm-entity';
import { BRANCH_REPOSITORY } from './domain/repositories/branch.repository.interface';
import { BranchTypeormRepository } from './infrastructure/persistence/repositories/branch.typeorm.repository';
import { CreateBranchUseCase } from './application/use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from './application/use-cases/update-branch.use-case';
import { DeleteBranchUseCase } from './application/use-cases/delete-branch.use-case';
import { ListBranchesUseCase } from './application/use-cases/list-branches.use-case';
import { ToggleBranchStatusUseCase } from './application/use-cases/toggle-branch-status.use-case';
import { BranchController } from './infrastructure/controllers/branch.controller';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchOrmEntity]),
    AuthModule,
    forwardRef(() => InventoryModule),
  ],
  controllers: [BranchController],
  providers: [
    {
      provide: BRANCH_REPOSITORY,
      useClass: BranchTypeormRepository,
    },
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeleteBranchUseCase,
    ListBranchesUseCase,
    ToggleBranchStatusUseCase,
  ],
  exports: [
    BRANCH_REPOSITORY,
  ],
})
export class BranchesModule {}
