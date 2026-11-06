import { createHmac, timingSafeEqual } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { getAllowedOrigins } from '../../common/config/cors';

/** What the provider tells us about one charge attempt. */
export interface PaymentResult {
  /** Our own order token, echoed back by the provider. */
  reference: string;
  /** The provider's id for the attempt. Repeating it must not charge or grant twice. */
  providerPaymentId: string;
  paid: boolean;
  /** Charged amount in qapik, checked against the order before anything is granted. */
  amount: number;
  currency: string;
  /** Kept verbatim for support and disputes. */
  raw: unknown;
}

export interface PaymentIntent {
  /** Hosted page where the buyer enters their card. We never see card details. */
  payUrl: string;
}

export interface CreatePaymentArgs {
  token: string;
  amount: number;
  currency: string;
  description: string;
}

/**
 * A payment gateway. Only the stub exists so far; a real Azerbaijani acquirer
 * (Yigim, Epoint, a bank's e-commerce) drops in as a second implementation without
 * touching the promotions service.
 */
export abstract class PaymentProvider {
  abstract readonly name: string;

  abstract createPayment(args: CreatePaymentArgs): Promise<PaymentIntent>;

  /**
   * Checks the callback really came from the provider and reads the outcome from it.
   * Throws when the signature does not match: an unsigned callback grants nothing.
   */
  abstract parseCallback(headers: Record<string, unknown>, rawBody: string): PaymentResult;
}

/** Where the browser lives, used to build return URLs. */
export function publicWebUrl(): string {
  const configured = process.env.PUBLIC_WEB_URL?.trim();
  return (configured || getAllowedOrigins()[0] || 'http://localhost:5173').replace(/\/+$/, '');
}

export function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

/** Constant-time comparison, so a wrong signature leaks nothing through timing. */
export function signatureMatches(expected: string, received: unknown): boolean {
  if (typeof received !== 'string') return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`Callback is missing ${field}`);
  }
  return value;
}
