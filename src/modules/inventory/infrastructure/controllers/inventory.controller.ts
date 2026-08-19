import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Req,
  Inject,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '@modules/auth/infrastructure/decorators/require-permissions.decorator';
import { CreateVarietyUseCase } from '../../application/use-cases/create-variety.use-case';
import { CreateLotUseCase } from '../../application/use-cases/create-lot.use-case';
import { RegisterMovementUseCase } from '../../application/use-cases/register-movement.use-case';
import { ListInventoryUseCase } from '../../application/use-cases/list-inventory.use-case';
import { CreateVarietyDto } from '../../application/dtos/create-variety.dto';
import { CreateLotDto } from '../../application/dtos/create-lot.dto';
import { RegisterMovementDto } from '../../application/dtos/register-movement.dto';
import { INVENTORY_REPOSITORY } from '../../domain/repositories/inventory.repository.interface';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repository.interface';

@ApiTags('Inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly createVarietyUseCase: CreateVarietyUseCase,
    private readonly createLotUseCase: CreateLotUseCase,
    private readonly registerMovementUseCase: RegisterMovementUseCase,
    private readonly listInventoryUseCase: ListInventoryUseCase,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  @Post('varieties')
  @RequirePermissions('create:variety')
  @ApiOperation({ summary: 'Registrar una nueva variedad de arroz' })
  @ApiResponse({ status: 201, description: 'Variedad creada exitosamente.' })
  async createVariety(@Body() dto: CreateVarietyDto) {
    const variety = await this.createVarietyUseCase.execute(dto);
    return {
      id: variety.getId(),
      name: variety.getName(),
      description: variety.getDescription(),
    };
  }

  @Get('varieties')
  @RequirePermissions('view:inventory')
  @ApiOperation({ summary: 'Obtener todas las variedades de arroz registradas' })
  async getVarieties() {
    const list = await this.inventoryRepository.findAllRiceVarieties();
    return list.map(v => ({
      id: v.getId(),
      name: v.getName(),
      description: v.getDescription(),
    }));
  }

  @Post('lots')
  @RequirePermissions('create:lot')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('receipt'))
  @ApiOperation({ summary: 'Registrar la entrada de un nuevo lote de arroz con su factura/comprobante' })
  async createLot(
    @Body() body: any,
    @UploadedFile() receipt: Express.Multer.File,
  ) {
    // Si los datos del lote se envían serializados en multipart/form-data
    let itemsParsed = body.items;
    if (typeof body.items === 'string') {
      try {
        itemsParsed = JSON.parse(body.items);
      } catch (e) {
        throw new BadRequestException('El campo items debe ser un JSON válido');
      }
    }

    const dto: CreateLotDto = {
      lotNumber: body.lotNumber,
      branchId: body.branchId,
      items: itemsParsed,
    };

    const lot = await this.createLotUseCase.execute(dto, receipt);
    return {
      id: lot.getId(),
      lotNumber: lot.getLotNumber(),
      receiptUrl: lot.getReceiptUrl(),
      branchId: lot.getBranchId(),
      createdAt: lot.getCreatedAt(),
      items: lot.getItems().map(item => ({
        id: item.getId(),
        varietyId: item.getVariety().getId(),
        varietyName: item.getVariety().getName(),
        quantityInitial: item.getQuantityInitial(),
        quantityCurrent: item.getQuantityCurrent(),
        pricePerQuintal: item.getPricePerQuintal(),
      })),
    };
  }

  @Post('movements')
  @RequirePermissions('register:movement')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('attachment'))
  @ApiOperation({ summary: 'Registrar un movimiento interno o externo (salida/entrada) ajeno a la venta' })
  async registerMovement(
    @Body() body: any,
    @Req() req: any,
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    const dto: RegisterMovementDto = {
      lotItemId: body.lotItemId,
      type: body.type,
      quantity: Number(body.quantity),
      reason: body.reason,
    };

    const movement = await this.registerMovementUseCase.execute(dto, req.user.id, attachment);
    return {
      id: movement.getId(),
      lotItemId: movement.getLotItemId(),
      type: movement.getType(),
      quantity: movement.getQuantity(),
      reason: movement.getReason(),
      registeredById: movement.getRegisteredById(),
      attachmentUrl: movement.getAttachmentUrl(),
      createdAt: movement.getCreatedAt(),
    };
  }

  @Get()
  @RequirePermissions('view:inventory')
  @ApiOperation({ summary: 'Obtener consolidado de stock y listado de lotes con inventario' })
  async getInventory() {
    return this.listInventoryUseCase.execute();
  }
}
