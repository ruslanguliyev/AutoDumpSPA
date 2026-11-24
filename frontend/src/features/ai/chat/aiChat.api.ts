import { gqlRequest } from '@/lib/graphql';
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
