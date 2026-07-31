export enum PaymentMethod {
  CASH = 'CASH',
  QR = 'QR',
  TRANSFER = 'TRANSFER',
  MIXED = 'MIXED',
}

export class Payment {
  constructor(
    private readonly id: string,
    private readonly saleId: string | null,
    private readonly reservationId: string | null,
    private readonly paymentMethod: PaymentMethod,
    private readonly cashAmount: number,
    private readonly qrAmount: number,
    private readonly transferAmount: number,
    private readonly totalPaid: number,
    private readonly proofUrl: string | null,
    private readonly createdAt: Date,
  ) {}

  getId(): string {
    return this.id;
  }

  getSaleId(): string | null {
    return this.saleId;
  }

  getReservationId(): string | null {
    return this.reservationId;
  }

  getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  getCashAmount(): number {
    return this.cashAmount;
  }

  getQrAmount(): number {
    return this.qrAmount;
  }

  getTransferAmount(): number {
    return this.transferAmount;
  }

  getTotalPaid(): number {
    return this.totalPaid;
  }

  getProofUrl(): string | null {
    return this.proofUrl;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
