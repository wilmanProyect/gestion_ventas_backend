import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param,
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
import { CreateSaleUseCase } from '../../application/use-cases/create-sale.use-case';
import { CreateReservationUseCase } from '../../application/use-cases/create-reservation.use-case';
import { PickupReservationUseCase } from '../../application/use-cases/pickup-reservation.use-case';
import { ProcessReturnUseCase } from '../../application/use-cases/process-return.use-case';
import { CreateSaleDto } from '../../application/dtos/create-sale.dto';
import { CreateReservationDto } from '../../application/dtos/create-reservation.dto';
import { PickupReservationDto } from '../../application/dtos/pickup-reservation.dto';
import { ProcessReturnDto } from '../../application/dtos/process-return.dto';
import { SALES_REPOSITORY } from '../../domain/repositories/sales.repository.interface';
import type { ISalesRepository } from '../../domain/repositories/sales.repository.interface';

@ApiTags('Ventas y Reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sales')
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly pickupReservationUseCase: PickupReservationUseCase,
    private readonly processReturnUseCase: ProcessReturnUseCase,
    @Inject(SALES_REPOSITORY)
    private readonly salesRepository: ISalesRepository,
  ) {}

  @Post()
  @RequirePermissions('create:sale')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('proof'))
  @ApiOperation({ summary: 'Registrar una nueva venta directa' })
  async createSale(
    @Body() body: any,
    @Req() req: any,
    @UploadedFile() proof?: Express.Multer.File,
  ) {
    let itemsParsed = body.items;
    if (typeof body.items === 'string') {
      try {
        itemsParsed = JSON.parse(body.items);
      } catch (e) {
        throw new BadRequestException('El campo items debe ser un JSON válido');
      }
    }

    const dto: CreateSaleDto = {
      items: itemsParsed,
      paymentMethod: body.paymentMethod,
      cashAmount: body.cashAmount ? Number(body.cashAmount) : undefined,
      qrAmount: body.qrAmount ? Number(body.qrAmount) : undefined,
      transferAmount: body.transferAmount ? Number(body.transferAmount) : undefined,
    };

    const sale = await this.createSaleUseCase.execute(dto, req.user.id, proof);
    return {
      id: sale.getId(),
      saleNumber: sale.getSaleNumber(),
      registeredById: sale.getRegisteredById(),
      totalPrice: sale.getTotalPrice(),
      status: sale.getStatus(),
      createdAt: sale.getCreatedAt(),
      items: sale.getItems().map(item => ({
        id: item.getId(),
        varietyId: item.getVarietyId(),
        varietyName: item.getVarietyName(),
        lotItemId: item.getLotItemId(),
        quantity: item.getQuantity(),
        pricePerUnit: item.getPricePerUnit(),
        subtotal: item.getSubtotal(),
      })),
      payments: sale.getPayments().map(pay => ({
        id: pay.getId(),
        paymentMethod: pay.getPaymentMethod(),
        cashAmount: pay.getCashAmount(),
        qrAmount: pay.getQrAmount(),
        transferAmount: pay.getTransferAmount(),
        totalPaid: pay.getTotalPaid(),
        proofUrl: pay.getProofUrl(),
      })),
    };
  }

  @Post('reservations')
  @RequirePermissions('create:reservation')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('proof'))
  @ApiOperation({ summary: 'Registrar una nueva reserva con pago inicial/adelanto' })
  async createReservation(
    @Body() body: any,
    @Req() req: any,
    @UploadedFile() proof?: Express.Multer.File,
  ) {
    let itemsParsed = body.items;
    if (typeof body.items === 'string') {
      try {
        itemsParsed = JSON.parse(body.items);
      } catch (e) {
        throw new BadRequestException('El campo items debe ser un JSON válido');
      }
    }

    const dto: CreateReservationDto = {
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: itemsParsed,
      paymentMethod: body.paymentMethod,
      cashAmount: body.cashAmount ? Number(body.cashAmount) : undefined,
      qrAmount: body.qrAmount ? Number(body.qrAmount) : undefined,
      transferAmount: body.transferAmount ? Number(body.transferAmount) : undefined,
      downPayment: Number(body.downPayment),
    };

    const reservation = await this.createReservationUseCase.execute(dto, req.user.id, proof);
    return {
      id: reservation.getId(),
      reservationNumber: reservation.getReservationNumber(),
      customerName: reservation.getCustomerName(),
      customerPhone: reservation.getCustomerPhone(),
      status: reservation.getStatus(),
      registeredById: reservation.getRegisteredById(),
      totalPrice: reservation.getTotalPrice(),
      createdAt: reservation.getCreatedAt(),
      items: reservation.getItems().map(item => ({
        id: item.getId(),
        varietyId: item.getVarietyId(),
        varietyName: item.getVarietyName(),
        quantity: item.getQuantity(),
        pricePerUnit: item.getPricePerUnit(),
        subtotal: item.getSubtotal(),
      })),
      payments: reservation.getPayments().map(pay => ({
        id: pay.getId(),
        paymentMethod: pay.getPaymentMethod(),
        cashAmount: pay.getCashAmount(),
        qrAmount: pay.getQrAmount(),
        transferAmount: pay.getTransferAmount(),
        totalPaid: pay.getTotalPaid(),
        proofUrl: pay.getProofUrl(),
      })),
    };
  }

  @Post('reservations/:id/pickup')
  @RequirePermissions('pickup:reservation')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('proof'))
  @ApiOperation({ summary: 'Registrar la entrega física y el pago final de una reserva' })
  async pickupReservation(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() proof?: Express.Multer.File,
  ) {
    const dto: PickupReservationDto = {
      paymentMethod: body.paymentMethod,
      cashAmount: body.cashAmount ? Number(body.cashAmount) : undefined,
      qrAmount: body.qrAmount ? Number(body.qrAmount) : undefined,
      transferAmount: body.transferAmount ? Number(body.transferAmount) : undefined,
    };

    const reservation = await this.pickupReservationUseCase.execute(id, dto, proof);
    return {
      id: reservation.getId(),
      reservationNumber: reservation.getReservationNumber(),
      status: reservation.getStatus(),
      totalPrice: reservation.getTotalPrice(),
      payments: reservation.getPayments().map(pay => ({
        id: pay.getId(),
        paymentMethod: pay.getPaymentMethod(),
        cashAmount: pay.getCashAmount(),
        qrAmount: pay.getQrAmount(),
        transferAmount: pay.getTransferAmount(),
        totalPaid: pay.getTotalPaid(),
        proofUrl: pay.getProofUrl(),
        createdAt: pay.getCreatedAt(),
      })),
    };
  }

  @Post('returns')
  @RequirePermissions('process:return')
  @ApiOperation({ summary: 'Registrar la devolución de arroz para una venta' })
  async processReturn(
    @Body() body: any,
    @Req() req: any,
  ) {
    let itemsParsed = body.items;
    if (typeof body.items === 'string') {
      try {
        itemsParsed = JSON.parse(body.items);
      } catch (e) {
        throw new BadRequestException('El campo items debe ser un JSON válido');
      }
    }

    const dto: ProcessReturnDto = {
      saleId: body.saleId,
      reason: body.reason,
      items: itemsParsed,
    };

    const ret = await this.processReturnUseCase.execute(dto, req.user.id);
    return {
      id: ret.getId(),
      saleId: ret.getSaleId(),
      reason: ret.getReason(),
      registeredById: ret.getRegisteredById(),
      createdAt: ret.getCreatedAt(),
      items: ret.getItems().map(item => ({
        id: item.getId(),
        varietyId: item.getVarietyId(),
        varietyName: item.getVarietyName(),
        lotItemId: item.getLotItemId(),
        quantity: item.getQuantity(),
      })),
    };
  }

  @Get()
  @RequirePermissions('view:sales')
  @ApiOperation({ summary: 'Obtener todas las ventas' })
  async getSales() {
    const list = await this.salesRepository.findAllSales();
    return list.map(sale => ({
      id: sale.getId(),
      saleNumber: sale.getSaleNumber(),
      totalPrice: sale.getTotalPrice(),
      status: sale.getStatus(),
      createdAt: sale.getCreatedAt(),
    }));
  }

  @Get('reservations')
  @RequirePermissions('view:sales')
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  async getReservations() {
    const list = await this.salesRepository.findAllReservations();
    return list.map(res => ({
      id: res.getId(),
      reservationNumber: res.getReservationNumber(),
      customerName: res.getCustomerName(),
      status: res.getStatus(),
      totalPrice: res.getTotalPrice(),
      createdAt: res.getCreatedAt(),
    }));
  }
}
