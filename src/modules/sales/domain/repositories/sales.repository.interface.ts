import { Sale } from '../models/sale.model';
import { Payment } from '../models/payment.model';
import { Reservation } from '../models/reservation.model';
import { Return } from '../models/return.model';

export interface ISalesRepository {
  saveSale(sale: Sale): Promise<void>;
  findSaleById(id: string): Promise<Sale | null>;
  findAllSales(): Promise<Sale[]>;

  savePayment(payment: Payment): Promise<void>;
  findPaymentsBySaleId(saleId: string): Promise<Payment[]>;
  findPaymentsByReservationId(reservationId: string): Promise<Payment[]>;

  saveReservation(reservation: Reservation): Promise<void>;
  findReservationById(id: string): Promise<Reservation | null>;
  findAllReservations(): Promise<Reservation[]>;

  saveReturn(ret: Return): Promise<void>;
  findReturnById(id: string): Promise<Return | null>;
  findAllReturns(): Promise<Return[]>;
}

export const SALES_REPOSITORY = Symbol('ISalesRepository');
