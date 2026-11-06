import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { PromotionsService } from '../promotions.service';
import { PaymentProvider, sign } from './payment-provider';
import { MockPaymentProvider } from './mock-payment.provider';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly promotions: PromotionsService,
    private readonly provider: PaymentProvider,
  ) {}

  /**
   * The provider telling us what happened to a charge. This is the only thing that
   * grants a placement: the buyer's browser coming back from the payment page proves
   * nothing and grants nothing.
   *
   * The signature is checked against the exact bytes received, so the body is read raw.
   */
  @Post(':provider/callback')
  @HttpCode(200)
  async callback(
    @Param('provider') providerName: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ ok: true }> {
    if (providerName !== this.provider.name) throw new NotFoundException();
    const raw = request.rawBody?.toString('utf8');
    if (!raw) throw new BadRequestException('Empty callback body');

    const result = this.provider.parseCallback(
      request.headers as unknown as Record<string, unknown>,
      raw,
    );
    await this.promotions.applyPaymentResult(result, this.provider.name);
    return { ok: true };
  }

  /**
   * Stands in for the bank while there is no contract with one: the stub card page
   * reports an outcome, and this signs it and sends it back through the callback
   * above, so the path that grants placements is the same one production will use.
   *
   * It exists only while the stub provider is configured.
   */
  @Post('mock/:token/complete')
  @HttpCode(200)
  async completeMockPayment(
    @Param('token') token: string,
    @Body() body: { outcome?: string },
  ): Promise<{ ok: true }> {
    const provider = this.provider;
    if (!(provider instanceof MockPaymentProvider)) throw new NotFoundException();

    const charge = await this.promotions.chargeOf(token);
    const payload = JSON.stringify({
      reference: token,
      providerPaymentId: `mock_${randomUUID()}`,
      status: body?.outcome === 'failed' ? 'failed' : 'paid',
      amount: charge.amount,
      currency: charge.currency,
    });

    const result = provider.parseCallback(
      { 'x-avtobaz-signature': sign(payload, provider.secret) },
      payload,
    );
    await this.promotions.applyPaymentResult(result, provider.name);
    return { ok: true };
  }
}
