import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  WALLET = 'wallet',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderId: number;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ required: true, enum: PaymentMethod })
  method: PaymentMethod;

  @Prop()
  transactionId: string;

  @Prop()
  paymentIntentId: string;

  @Prop()
  refundId: string;

  @Prop()
  errorMessage: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);