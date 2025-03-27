import { PaymentMethod, PaymentStatus } from '../schemas/payment.schema';

export class CreatePaymentDto {
  orderId: number;
  userId: number;
  amount: number;
  method: PaymentMethod;
  paymentToken?: string;
}

export class PaymentResponseDto {
  id: string;
  orderId: number;
  userId: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RefundPaymentDto {
  reason?: string;
  amount?: number;
}

export class PaymentIntentDto {
  clientSecret: string;
  paymentIntentId: string;
}