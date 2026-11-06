import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreatePaymentArgs,
  PaymentIntent,
  PaymentProvider,
  PaymentResult,
  publicWebUrl,
  requireString,
  sign,
  signatureMatches,
} from './payment-provider';

/**
 * Stand-in for a real acquirer, so the whole checkout can be built and tested before
 * there is a contract with a bank.
 *
 * It behaves like the real thing in the ways that matter: the buyer leaves for a
 * hosted page, and the placement is granted only by a signed server-to-server
 * callback, never by the browser coming back.
 */
@Injectable()
export class MockPaymentProvider extends PaymentProvider {
  readonly name = 'mock';

  /** Shared with the fake checkout page; a real provider issues this in its dashboard. */
  get secret(): string {
    return process.env.PAYMENT_MOCK_SECRET?.trim() || 'dev-mock-secret';
  }

  createPayment(args: CreatePaymentArgs): Promise<PaymentIntent> {
    return Promise.resolve({ payUrl: `${publicWebUrl()}/promote/pay/${args.token}` });
  }

  parseCallback(headers: Record<string, unknown>, rawBody: string): PaymentResult {
    if (!signatureMatches(sign(rawBody, this.secret), headers['x-avtobaz-signature'])) {
      throw new BadRequestException('Invalid payment signature');
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      throw new BadRequestException('Callback body is not JSON');
    }

    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 0) {
      throw new BadRequestException('Callback amount must be a whole number of qapik');
    }

    return {
      reference: requireString(body.reference, 'reference'),
      providerPaymentId: requireString(body.providerPaymentId, 'providerPaymentId'),
      paid: body.status === 'paid',
      amount,
      currency: requireString(body.currency, 'currency'),
      raw: body,
    };
  }
}
