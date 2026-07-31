import { Payment, PaymentMethod } from '../../../domain/models/payment.model';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { SaleItem } from '../../../domain/models/sale-item.model';
import { SaleItemOrmEntity } from '../entities/sale-item.orm-entity';
import { Sale, SaleStatus } from '../../../domain/models/sale.model';
import { SaleOrmEntity } from '../entities/sale.orm-entity';
import { ReservationItem } from '../../../domain/models/reservation-item.model';
import { ReservationItemOrmEntity } from '../entities/reservation-item.orm-entity';
import { Reservation, ReservationStatus } from '../../../domain/models/reservation.model';
import { ReservationOrmEntity } from '../entities/reservation.orm-entity';
import { ReturnItem } from '../../../domain/models/return-item.model';
import { ReturnItemOrmEntity } from '../entities/return-item.orm-entity';
import { Return } from '../../../domain/models/return.model';
import { ReturnOrmEntity } from '../entities/return.orm-entity';

export class SalesMapper {
  static toPaymentDomain(orm: PaymentOrmEntity): Payment {
    return new Payment(
      orm.id,
      orm.saleId,
      orm.reservationId,
      orm.paymentMethod as PaymentMethod,
      Number(orm.cashAmount),
      Number(orm.qrAmount),
      Number(orm.transferAmount),
      Number(orm.totalPaid),
      orm.proofUrl,
      orm.createdAt,
    );
  }

  static toPaymentOrm(domain: Payment): PaymentOrmEntity {
    const orm = new PaymentOrmEntity();
    orm.id = domain.getId();
    orm.saleId = domain.getSaleId();
    orm.reservationId = domain.getReservationId();
    orm.paymentMethod = domain.getPaymentMethod();
    orm.cashAmount = domain.getCashAmount();
    orm.qrAmount = domain.getQrAmount();
    orm.transferAmount = domain.getTransferAmount();
    orm.totalPaid = domain.getTotalPaid();
    orm.proofUrl = domain.getProofUrl();
    orm.createdAt = domain.getCreatedAt();
    return orm;
  }

  static toSaleItemDomain(orm: SaleItemOrmEntity): SaleItem {
    return new SaleItem(
      orm.id,
      orm.saleId,
      orm.varietyId,
      orm.varietyName,
      orm.lotItemId,
      Number(orm.quantity),
      Number(orm.pricePerUnit),
      Number(orm.subtotal),
    );
  }

  static toSaleItemOrm(domain: SaleItem): SaleItemOrmEntity {
    const orm = new SaleItemOrmEntity();
    orm.id = domain.getId();
    orm.saleId = domain.getSaleId();
    orm.varietyId = domain.getVarietyId();
    orm.varietyName = domain.getVarietyName();
    orm.lotItemId = domain.getLotItemId();
    orm.quantity = domain.getQuantity();
    orm.pricePerUnit = domain.getPricePerUnit();
    orm.subtotal = domain.getSubtotal();
    return orm;
  }

  static toSaleDomain(orm: SaleOrmEntity): Sale {
    const items = orm.items ? orm.items.map(item => this.toSaleItemDomain(item)) : [];
    const payments = orm.payments ? orm.payments.map(pay => this.toPaymentDomain(pay)) : [];
    return new Sale(
      orm.id,
      orm.saleNumber,
      orm.registeredById,
      Number(orm.totalPrice),
      orm.status as SaleStatus,
      orm.createdAt,
      items,
      payments,
    );
  }

  static toSaleOrm(domain: Sale): SaleOrmEntity {
    const orm = new SaleOrmEntity();
    orm.id = domain.getId();
    orm.saleNumber = domain.getSaleNumber();
    orm.registeredById = domain.getRegisteredById();
    orm.totalPrice = domain.getTotalPrice();
    orm.status = domain.getStatus();
    orm.createdAt = domain.getCreatedAt();
    if (domain.getItems()) {
      orm.items = domain.getItems().map(item => this.toSaleItemOrm(item));
    }
    if (domain.getPayments()) {
      orm.payments = domain.getPayments().map(pay => this.toPaymentOrm(pay));
    }
    return orm;
  }

  static toReservationItemDomain(orm: ReservationItemOrmEntity): ReservationItem {
    return new ReservationItem(
      orm.id,
      orm.reservationId,
      orm.varietyId,
      orm.varietyName,
      Number(orm.quantity),
      Number(orm.pricePerUnit),
      Number(orm.subtotal),
    );
  }

  static toReservationItemOrm(domain: ReservationItem): ReservationItemOrmEntity {
    const orm = new ReservationItemOrmEntity();
    orm.id = domain.getId();
    orm.reservationId = domain.getReservationId();
    orm.varietyId = domain.getVarietyId();
    orm.varietyName = domain.getVarietyName();
    orm.quantity = domain.getQuantity();
    orm.pricePerUnit = domain.getPricePerUnit();
    orm.subtotal = domain.getSubtotal();
    return orm;
  }

  static toReservationDomain(orm: ReservationOrmEntity): Reservation {
    const items = orm.items ? orm.items.map(item => this.toReservationItemDomain(item)) : [];
    const payments = orm.payments ? orm.payments.map(pay => this.toPaymentDomain(pay)) : [];
    return new Reservation(
      orm.id,
      orm.reservationNumber,
      orm.customerName,
      orm.customerPhone,
      orm.status as ReservationStatus,
      orm.registeredById,
      Number(orm.totalPrice),
      orm.createdAt,
      items,
      payments,
    );
  }

  static toReservationOrm(domain: Reservation): ReservationOrmEntity {
    const orm = new ReservationOrmEntity();
    orm.id = domain.getId();
    orm.reservationNumber = domain.getReservationNumber();
    orm.customerName = domain.getCustomerName();
    orm.customerPhone = domain.getCustomerPhone();
    orm.status = domain.getStatus();
    orm.registeredById = domain.getRegisteredById();
    orm.totalPrice = domain.getTotalPrice();
    orm.createdAt = domain.getCreatedAt();
    if (domain.getItems()) {
      orm.items = domain.getItems().map(item => this.toReservationItemOrm(item));
    }
    if (domain.getPayments()) {
      orm.payments = domain.getPayments().map(pay => this.toPaymentOrm(pay));
    }
    return orm;
  }

  static toReturnItemDomain(orm: ReturnItemOrmEntity): ReturnItem {
    return new ReturnItem(
      orm.id,
      orm.returnId,
      orm.varietyId,
      orm.varietyName,
      orm.lotItemId,
      Number(orm.quantity),
    );
  }

  static toReturnItemOrm(domain: ReturnItem): ReturnItemOrmEntity {
    const orm = new ReturnItemOrmEntity();
    orm.id = domain.getId();
    orm.returnId = domain.getReturnId();
    orm.varietyId = domain.getVarietyId();
    orm.varietyName = domain.getVarietyName();
    orm.lotItemId = domain.getLotItemId();
    orm.quantity = domain.getQuantity();
    return orm;
  }

  static toReturnDomain(orm: ReturnOrmEntity): Return {
    const items = orm.items ? orm.items.map(item => this.toReturnItemDomain(item)) : [];
    return new Return(
      orm.id,
      orm.saleId,
      orm.reason,
      orm.registeredById,
      orm.createdAt,
      items,
    );
  }

  static toReturnOrm(domain: Return): ReturnOrmEntity {
    const orm = new ReturnOrmEntity();
    orm.id = domain.getId();
    orm.saleId = domain.getSaleId();
    orm.reason = domain.getReason();
    orm.registeredById = domain.getRegisteredById();
    orm.createdAt = domain.getCreatedAt();
    if (domain.getItems()) {
      orm.items = domain.getItems().map(item => this.toReturnItemOrm(item));
    }
    return orm;
  }
}
