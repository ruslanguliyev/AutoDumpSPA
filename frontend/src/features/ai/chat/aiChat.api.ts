import { GQL_URL, GraphQLRequestError, gqlRequest } from '@/lib/graphql';
import type { AiLanguageCode } from '@/features/ai/ai.api';

export type AiChatRole = 'USER' | 'ASSISTANT';
export type AiChatCardKind = 'CAR' | 'RENTAL' | 'PART' | 'SERVICE_CENTER' | 'SPECIALIST' | 'SELLER';
export type AiChatPriceUnit = 'DAY' | 'HOUR' | 'FROM';

/** A real catalogue entry the assistant found; every field comes from the database. */
export type AiChatCard = {
  kind: AiChatCardKind;
  id: string;
  title: string;
  subtitle: string | null;
  price: number | null;
  currency: string | null;
  priceUnit: AiChatPriceUnit | null;
  city: string | null;
  imageUrl: string | null;
  rating: number | null;
  /** Site path without the language prefix. */
  path: string;
};

export type AiChatReply = { text: string; cards: AiChatCard[] };

const CHAT_MUTATION = `
mutation AiChat($input: AiChatInput!) {
  aiChat(input: $input) {
    text
    cards {
      kind
      id
      title
      subtitle
      price
      currency
      priceUnit
      city
      imageUrl
      rating
      path
    }
  }
}
`;

export async function sendAiChat(
  messages: Array<{ role: AiChatRole; text: string }>,
  language: AiLanguageCode,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  const data = await gqlRequest<{ aiChat: AiChatReply }>(
    CHAT_MUTATION,
    { input: { messages, language } },
    undefined,
    { signal },
  );
  return data.aiChat;
}

/** REST base of the API, from the GraphQL endpoint (`…/graphql` → `…`). */
const API_BASE = GQL_URL.replace(/\/graphql\/?$/, '');

/**
 * A message with a photo. It goes as multipart to `/ai/chat`, which checks the bytes and
 * answers exactly like the `aiChat` mutation.
 */
export async function sendAiChatWithPhoto(
  messages: Array<{ role: AiChatRole; text: string }>,
  language: AiLanguageCode,
  photo: Blob,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  const form = new FormData();
  form.append('payload', JSON.stringify({ messages, language }));
  form.append('image', photo, 'photo.jpg');
  const response = await fetch(`${API_BASE}/ai/chat`, { method: 'POST', body: form, signal });
  if (response.ok) return (await response.json()) as AiChatReply;
  if (response.status === 413) throw new GraphQLRequestError('INVALID_IMAGE', 'INVALID_IMAGE');
  const body = (await response.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code ?? (response.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE');
  throw new GraphQLRequestError(code, code);
}
