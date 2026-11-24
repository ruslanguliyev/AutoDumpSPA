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

export type AiChatStreamHooks = {
  /** A piece of the answer as the assistant writes it. */
  onText?: (text: string) => void;
  /** The assistant started searching the catalogue. */
  onSearching?: () => void;
};

type StreamEvent =
  | { type: 'text'; text: string }
  | { type: 'searching' }
  | { type: 'done'; text: string; cards: AiChatCard[] }
  | { type: 'error'; code?: string };

/**
 * Sends a message (with or without a photo) and streams the answer. The server writes one
 * JSON object per line; the final `done` line carries the full text and the cards.
 */
export async function streamAiChat(
  messages: Array<{ role: AiChatRole; text: string }>,
  language: AiLanguageCode,
  photo: Blob | null,
  hooks: AiChatStreamHooks,
  signal?: AbortSignal,
): Promise<AiChatReply> {
  const form = new FormData();
  form.append('payload', JSON.stringify({ messages, language }));
  if (photo) form.append('image', photo, 'photo.jpg');
  const response = await fetch(`${API_BASE}/ai/chat/stream`, { method: 'POST', body: form, signal });
  if (!response.ok || !response.body) {
    if (response.status === 413) throw new GraphQLRequestError('INVALID_IMAGE', 'INVALID_IMAGE');
    const body = (await response.json().catch(() => null)) as { code?: string } | null;
    const code = body?.code ?? (response.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE');
    throw new GraphQLRequestError(code, code);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const handle = (line: string): AiChatReply | null => {
    if (!line.trim()) return null;
    let event: StreamEvent;
    try {
      event = JSON.parse(line) as StreamEvent;
    } catch {
      return null;
    }
    if (event.type === 'text') hooks.onText?.(event.text);
    else if (event.type === 'searching') hooks.onSearching?.();
    else if (event.type === 'done') return { text: event.text, cards: event.cards ?? [] };
    else if (event.type === 'error') {
      const code = event.code ?? 'UNAVAILABLE';
      throw new GraphQLRequestError(code, code);
    }
    return null;
  };

  for (;;) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const reply = handle(buffer.slice(0, newline));
      buffer = buffer.slice(newline + 1);
      if (reply) return reply;
      newline = buffer.indexOf('\n');
    }
    if (done) break;
  }
  const reply = handle(buffer);
  if (reply) return reply;
  throw new GraphQLRequestError('UNAVAILABLE', 'UNAVAILABLE');
}
