import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { CreatePaymentDto, PaymentIntentDto, PaymentResponseDto, RefundPaymentDto } from './dto/payment.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2022-11-15',
    });
  }

  async createPaymentIntent(createPaymentDto: CreatePaymentDto): Promise<PaymentIntentDto> {
    try {
      // Create a payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(createPaymentDto.amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: createPaymentDto.orderId.toString(),
          userId: createPaymentDto.userId.toString(),
        },
      });

      // Create a payment record in our database
      const payment = new this.paymentModel({
        orderId: createPaymentDto.orderId,
        userId: createPaymentDto.userId,
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        status: PaymentStatus.PENDING,
        paymentIntentId: paymentIntent.id,
      });

      await payment.save();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new BadRequestException(`Error creating payment intent: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({ paymentIntentId });

    if (!payment) {
      throw new NotFoundException(`Payment with intent ID ${paymentIntentId} not found`);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionId = paymentIntent.id;
        await payment.save();
      } else if (paymentIntent.status === 'canceled') {
        payment.status = PaymentStatus.FAILED;
        payment.errorMessage = 'Payment was canceled';
        await payment.save();
      }

      return this.mapToPaymentResponseDto(payment);
    } catch (error) {
      throw new BadRequestException(`Error confirming payment: ${error.message}`);
    }
  }

  async refundPayment(id: string, refundDto: RefundPaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: refundDto.amount ? Math.round(refundDto.amount * 100) : undefined,
        reason: refundDto.reason as any,
      });

      payment.status = PaymentStatus.REFUNDED;
      payment.refundId = refund.id;
      await payment.save();

      return this.mapToPaymentResponseDto(payment);
    } catch (error) {
      throw new BadRequestException(`Error refunding payment: ${error.message}`);
    }
  }

  async getPaymentByOrderId(orderId: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findOne({ orderId });

    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }

    return this.mapToPaymentResponseDto(payment);
  }

  async getPaymentById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.mapToPaymentResponseDto(payment);
  }

  async getPaymentsByUserId(userId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentModel.find({ userId });
    return payments.map(payment => this.mapToPaymentResponseDto(payment));
  }

  private mapToPaymentResponseDto(payment: PaymentDocument): PaymentResponseDto {
    return {
      id: payment._id.toString(),
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      transactionId: payment.transactionId,
      paymentIntentId: payment.paymentIntentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}