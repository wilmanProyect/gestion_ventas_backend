import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISalesRepository } from '../../../domain/repositories/sales.repository.interface';
import { Sale } from '../../../domain/models/sale.model';
import { Payment } from '../../../domain/models/payment.model';
import { Reservation } from '../../../domain/models/reservation.model';
import { Return } from '../../../domain/models/return.model';

import { SaleOrmEntity } from '../entities/sale.orm-entity';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { ReservationOrmEntity } from '../entities/reservation.orm-entity';
import { ReturnOrmEntity } from '../entities/return.orm-entity';
import { SalesMapper } from '../mappers/sales.mapper';

@Injectable()
export class SalesTypeormRepository implements ISalesRepository {
  constructor(
    @InjectRepository(SaleOrmEntity)
    private readonly saleRepository: Repository<SaleOrmEntity>,
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectRepository(ReservationOrmEntity)
    private readonly reservationRepository: Repository<ReservationOrmEntity>,
    @InjectRepository(ReturnOrmEntity)
    private readonly returnRepository: Repository<ReturnOrmEntity>,
  ) {}

  async saveSale(sale: Sale): Promise<void> {
    const orm = SalesMapper.toSaleOrm(sale);
    await this.saleRepository.save(orm);
  }

  async findSaleById(id: string): Promise<Sale | null> {
    const orm = await this.saleRepository.findOne({
      where: { id },
      relations: { items: true, payments: true },
    });
    return orm ? SalesMapper.toSaleDomain(orm) : null;
  }

  async findAllSales(): Promise<Sale[]> {
    const orms = await this.saleRepository.find({
      relations: { items: true, payments: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => SalesMapper.toSaleDomain(orm));
  }

  async savePayment(payment: Payment): Promise<void> {
    const orm = SalesMapper.toPaymentOrm(payment);
    await this.paymentRepository.save(orm);
  }

  async findPaymentsBySaleId(saleId: string): Promise<Payment[]> {
    const orms = await this.paymentRepository.find({ where: { saleId } });
    return orms.map(orm => SalesMapper.toPaymentDomain(orm));
  }

  async findPaymentsByReservationId(reservationId: string): Promise<Payment[]> {
    const orms = await this.paymentRepository.find({ where: { reservationId } });
    return orms.map(orm => SalesMapper.toPaymentDomain(orm));
  }

  async saveReservation(reservation: Reservation): Promise<void> {
    const orm = SalesMapper.toReservationOrm(reservation);
    await this.reservationRepository.save(orm);
  }

  async findReservationById(id: string): Promise<Reservation | null> {
    const orm = await this.reservationRepository.findOne({
      where: { id },
      relations: { items: true, payments: true },
    });
    return orm ? SalesMapper.toReservationDomain(orm) : null;
  }

  async findAllReservations(): Promise<Reservation[]> {
    const orms = await this.reservationRepository.find({
      relations: { items: true, payments: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => SalesMapper.toReservationDomain(orm));
  }

  async saveReturn(ret: Return): Promise<void> {
    const orm = SalesMapper.toReturnOrm(ret);
    await this.returnRepository.save(orm);
  }

  async findReturnById(id: string): Promise<Return | null> {
    const orm = await this.returnRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    return orm ? SalesMapper.toReturnDomain(orm) : null;
  }

  async findAllReturns(): Promise<Return[]> {
    const orms = await this.returnRepository.find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return orms.map(orm => SalesMapper.toReturnDomain(orm));
  }
}
