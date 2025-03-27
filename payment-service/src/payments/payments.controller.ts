import { Controller, Post, Body, Get, Param, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentIntentDto, PaymentResponseDto, RefundPaymentDto } from './dto/payment.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createPaymentIntent(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentIntentDto> {
    return this.paymentsService.createPaymentIntent(createPaymentDto);
  }

  @Post('confirm/:paymentIntentId')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Param('paymentIntentId') paymentIntentId: string): Promise<PaymentResponseDto> {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Put(':id/refund')
  async refundPayment(
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.refundPayment(id, refundDto);
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: number): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(id);
  }

  @Get('user/:userId')
  async getPaymentsByUserId(@Param('userId') userId: number): Promise<PaymentResponseDto[]> {
    return this.paymentsService.getPaymentsByUserId(userId);
  }
}