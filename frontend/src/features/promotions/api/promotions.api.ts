import { GQL_URL, gqlRequest } from '@/lib/graphql';

/** REST lives next to the GraphQL endpoint on the same server. */
const API_ORIGIN = GQL_URL.replace(/\/graphql\/?$/, '');

export type PromotionTier = 'BUMP' | 'VIP' | 'PREMIUM';
export type PromotionTarget = 'LISTING' | 'SPECIALIST' | 'SERVICE_CENTER';
export type PromotionOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

/** Every amount from the API is in qapik, so nothing is ever a float. */
export type PromotionPackage = {
  code: string;
  tier: PromotionTier;
  days: number;
  bumps: number;
  bumpsPerDay: number;
  listAmount: number;
  creditAmount: number;
  amount: number;
  recommended: boolean;
};

export type PromotionTargetInfo = {
  targetType: PromotionTarget;
  targetId: string;
  title: string;
  imageUrl: string | null;
  href: string | null;
};

export type PromotionQuote = {
  target: PromotionTargetInfo;
  currency: string;
  packages: PromotionPackage[];
  activeTier: PromotionTier | null;
  activeUntil: string | null;
  bumpsLeft: number;
};

export type PromotionOrder = {
  token: string;
  target: PromotionTargetInfo;
  tier: PromotionTier;
  packageCode: string;
  days: number;
  bumps: number;
  listAmount: number;
  creditAmount: number;
  amount: number;
  currency: string;
  status: PromotionOrderStatus;
  expiresAt: string;
  paidAt: string | null;
  payUrl: string | null;
};

export type Promotion = {
  id: string;
  target: PromotionTargetInfo;
  tier: PromotionTier;
  startsAt: string;
  endsAt: string;
  bumpsTotal: number;
  bumpsUsed: number;
  nextBumpAt: string | null;
  active: boolean;
  endedReason: string | null;
  amount: number;
  viewsGained: number;
  contactsGained: number;
};

export type AdminPromotion = {
  id: string;
  target: PromotionTargetInfo;
  tier: PromotionTier;
  startsAt: string;
  endsAt: string;
  active: boolean;
  amount: number;
  paid: boolean;
  endedReason: string | null;
};

const TARGET_FIELDS = 'targetType targetId title imageUrl href';
const ORDER_FIELDS = `token tier packageCode days bumps listAmount creditAmount amount currency
  status expiresAt paidAt payUrl target { ${TARGET_FIELDS} }`;

export const promotionsApi = {
  quote: (targetType: PromotionTarget, targetId: string) =>
    gqlRequest<{ promotionQuote: PromotionQuote }>(
      `query($t: PromotionTarget!, $id: String!) {
        promotionQuote(targetType: $t, targetId: $id) {
          currency activeTier activeUntil bumpsLeft
          target { ${TARGET_FIELDS} }
          packages { code tier days bumps bumpsPerDay listAmount creditAmount amount recommended }
        }
      }`,
      { t: targetType, id: targetId },
    ).then((d) => d.promotionQuote),

  createOrder: (input: {
    targetType: PromotionTarget;
    targetId: string;
    packageCode: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
  }) =>
    gqlRequest<{ createPromotionOrder: PromotionOrder }>(
      `mutation($i: CreatePromotionOrderInput!) {
        createPromotionOrder(input: $i) { ${ORDER_FIELDS} }
      }`,
      { i: input },
    ).then((d) => d.createPromotionOrder),

  order: (token: string) =>
    gqlRequest<{ promotionOrder: PromotionOrder }>(
      `query($t: String!) { promotionOrder(token: $t) { ${ORDER_FIELDS} } }`,
      { t: token },
    ).then((d) => d.promotionOrder),

  cancelOrder: (token: string) =>
    gqlRequest<{ cancelPromotionOrder: boolean }>(
      `mutation($t: String!) { cancelPromotionOrder(token: $t) }`,
      { t: token },
    ).then((d) => d.cancelPromotionOrder),

  mine: () =>
    gqlRequest<{ myPromotions: Promotion[] }>(
      `{
        myPromotions {
          id tier startsAt endsAt bumpsTotal bumpsUsed nextBumpAt active endedReason
          amount viewsGained contactsGained target { ${TARGET_FIELDS} }
        }
      }`,
    ).then((d) => d.myPromotions),

  /** Counts an opened page or a revealed phone number. Never blocks the UI. */
  track: (kind: 'view' | 'contact', targetType: PromotionTarget, targetId: string) =>
    gqlRequest(
      `mutation($t: PromotionTarget!, $id: String!) {
        ${kind === 'view' ? 'trackPromotionView' : 'trackPromotionContact'}(targetType: $t, targetId: $id)
      }`,
      { t: targetType, id: targetId },
    ).catch(() => undefined),

  adminList: (activeOnly: boolean) =>
    gqlRequest<{ adminPromotions: AdminPromotion[] }>(
      `query($a: Boolean) {
        adminPromotions(activeOnly: $a) {
          id tier startsAt endsAt active amount paid endedReason target { ${TARGET_FIELDS} }
        }
      }`,
      { a: activeOnly },
    ).then((d) => d.adminPromotions),

  grant: (input: {
    targetType: PromotionTarget;
    targetId: string;
    tier: PromotionTier;
    days: number;
  }) =>
    gqlRequest<{ grantPromotion: boolean }>(
      `mutation($t: PromotionTarget!, $id: String!, $tier: PromotionTier!, $days: Int!) {
        grantPromotion(targetType: $t, targetId: $id, tier: $tier, days: $days)
      }`,
      { t: input.targetType, id: input.targetId, tier: input.tier, days: input.days },
    ).then((d) => d.grantPromotion),

  revoke: (id: string) =>
    gqlRequest<{ revokePromotion: boolean }>(
      `mutation($id: String!) { revokePromotion(id: $id) }`,
      { id },
    ).then((d) => d.revokePromotion),
};

/**
 * Tells the stub gateway how the "payment" went. It exists only while the stub
 * provider is configured; a real acquirer is reached by the browser leaving for its
 * own hosted page, and reports back to the server, never through here.
 */
export const completeMockPayment = async (token: string, outcome: 'paid' | 'failed') => {
  const res = await fetch(`${API_ORIGIN}/payments/mock/${encodeURIComponent(token)}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outcome }),
  });
  if (!res.ok) throw new Error(`Payment gateway returned ${res.status}`);
};

/** 2500 -> "25.00 AZN". Amounts travel as whole qapik and are only formatted here. */
export const formatQapik = (amount: number, currency = 'AZN'): string =>
  `${(amount / 100).toFixed(2)} ${currency}`;
