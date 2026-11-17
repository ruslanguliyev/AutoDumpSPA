import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MockPaymentProvider } from './payments/mock-payment.provider';
import { PaymentProvider } from './payments/payment-provider';
import { PaymentsController } from './payments/payments.controller';
import { PromotionsResolver } from './promotions.resolver';
import { PromotionsScheduler } from './promotions.scheduler';
import { PromotionsService } from './promotions.service';

/**
 * Paid placement: the price list, checkout, the payment gateway behind it, the clock
 * that ends placements and spends bumps, and the administrator's controls.
 *
 * The gateway is bound below (`PaymentProvider` -> `MockPaymentProvider`). Only the stub
 * exists so far; a real Azerbaijani acquirer becomes a second `PaymentProvider`, and the
 * binding is switched here. There is no environment variable for the choice yet.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PaymentsController],
  providers: [
    MockPaymentProvider,
    { provide: PaymentProvider, useExisting: MockPaymentProvider },
    PromotionsService,
    PromotionsResolver,
    PromotionsScheduler,
  ],
  exports: [PromotionsService],
})
export class PromotionsModule {}
