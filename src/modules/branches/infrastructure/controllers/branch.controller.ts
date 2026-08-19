import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  ParseUUIDPipe,
  Inject,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '@modules/auth/infrastructure/decorators/require-permissions.decorator';
import { CreateBranchUseCase } from '../../application/use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from '../../application/use-cases/update-branch.use-case';
import { DeleteBranchUseCase } from '../../application/use-cases/delete-branch.use-case';
import { ListBranchesUseCase } from '../../application/use-cases/list-branches.use-case';
import { ToggleBranchStatusUseCase } from '../../application/use-cases/toggle-branch-status.use-case';
import { CreateBranchDto } from '../../application/dtos/create-branch.dto';
import { UpdateBranchDto } from '../../application/dtos/update-branch.dto';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';

@ApiTags('Sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('branches')
export class BranchController {
  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly deleteBranchUseCase: DeleteBranchUseCase,
    private readonly listBranchesUseCase: ListBranchesUseCase,
    private readonly toggleBranchStatusUseCase: ToggleBranchStatusUseCase,
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  @Post()
  @RequirePermissions('branches:create')
  @ApiOperation({ summary: 'Registrar una nueva sucursal' })
  async create(@Body() dto: CreateBranchDto) {
    const branch = await this.createBranchUseCase.execute(dto);
    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      isActive: branch.getIsActive(),
    };
  }

  @Get()
  @RequirePermissions('branches:read')
  @ApiOperation({ summary: 'Obtener todas las sucursales no eliminadas' })
  async findAll() {
    const list = await this.listBranchesUseCase.execute();
    return list.map(b => ({
      id: b.getId(),
      name: b.getName(),
      address: b.getAddress(),
      isActive: b.getIsActive(),
    }));
  }

  @Get(':id')
  @RequirePermissions('branches:read')
  @ApiOperation({ summary: 'Obtener los detalles de una sucursal por su ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const branch = await this.branchRepository.findById(id);
    if (!branch || branch.getDeletedAt() !== null) {
      throw new NotFoundException(`La sucursal con ID ${id} no existe.`);
    }
    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      isActive: branch.getIsActive(),
    };
  }

  @Patch(':id')
  @RequirePermissions('branches:update')
  @ApiOperation({ summary: 'Actualizar la información de una sucursal' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBranchDto) {
    const branch = await this.updateBranchUseCase.execute(id, dto);
    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      isActive: branch.getIsActive(),
    };
  }

  @Delete(':id')
  @RequirePermissions('branches:delete')
  @ApiOperation({ summary: 'Eliminar lógicamente una sucursal' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteBranchUseCase.execute(id);
    return { message: 'Sucursal eliminada lógicamente con éxito.' };
  }

  @Patch(':id/activate')
  @RequirePermissions('branches:update')
  @ApiOperation({ summary: 'Activar una sucursal' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    const branch = await this.toggleBranchStatusUseCase.execute(id, true);
    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      isActive: branch.getIsActive(),
    };
  }

  @Patch(':id/deactivate')
  @RequirePermissions('branches:update')
  @ApiOperation({ summary: 'Desactivar una sucursal' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const branch = await this.toggleBranchStatusUseCase.execute(id, false);
    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      isActive: branch.getIsActive(),
    };
  }
}
