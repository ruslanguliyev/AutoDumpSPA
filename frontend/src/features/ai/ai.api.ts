import { useQuery } from '@tanstack/react-query';

import { gqlRequest, GraphQLRequestError } from '@/lib/graphql';

export type AiLanguageCode = 'AZ' | 'RU' | 'EN';
export type DescriptionTone = 'NEUTRAL' | 'SALES' | 'SHORT';
export type DescriptionMode = 'GENERATE' | 'REGENERATE' | 'SHORTER' | 'LONGER';

export type AiErrorCode =
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'INVALID_RESULT'
  | 'INVALID_INPUT'
  | 'INVALID_IMAGE'
  | 'DAILY_LIMIT'
  | 'PAUSED'
  | 'GENERIC';

export type ParsedSearchFilters = {
  brand?: string | null;
  model?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  condition?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  location?: string | null;
};

const STATUS_QUERY = `query AiStatus { aiStatus { enabled paused } }`;

const GENERATE_MUTATION = `
mutation GenerateListingDescription($input: GenerateListingDescriptionInput!) {
  generateListingDescription(input: $input) {
    text
    usedFields
    missingHints
  }
}
`;

const PARSE_MUTATION = `
mutation ParseVehicleSearchQuery($query: String!, $language: AiLanguage!) {
  parseVehicleSearchQuery(query: $query, language: $language) {
    filters {
      brand
      model
      yearFrom
      yearTo
      priceFrom
      priceTo
      condition
      fuel
      transmission
      location
    }
    unapplied
  }
}
`;

export function aiErrorCode(error: unknown): AiErrorCode {
  const code = error instanceof GraphQLRequestError ? error.code ?? error.message : error instanceof Error ? error.message : '';
  if (
    code === 'RATE_LIMITED' ||
    code === 'UNAVAILABLE' ||
    code === 'INVALID_RESULT' ||
    code === 'INVALID_INPUT' ||
    code === 'INVALID_IMAGE' ||
    code === 'DAILY_LIMIT' ||
    code === 'PAUSED'
  ) {
    return code;
  }
  return 'GENERIC';
}

export type AiStatus = { enabled: boolean; paused: boolean };

const AI_OFF: AiStatus = { enabled: false, paused: false };

export async function fetchAiStatus(): Promise<AiStatus> {
  try {
    const data = await gqlRequest<{ aiStatus?: { enabled?: boolean; paused?: boolean } }>(STATUS_QUERY);
    return { enabled: data?.aiStatus?.enabled === true, paused: data?.aiStatus?.paused === true };
  } catch {
    return AI_OFF;
  }
}

export const AI_STATUS_QUERY_KEY = ['ai-status'] as const;

/** Off while loading and when the server says AI is off, so the UI never shows a dead control. */
export function useAiStatus(): AiStatus {
  const query = useQuery({
    queryKey: AI_STATUS_QUERY_KEY,
    queryFn: fetchAiStatus,
    staleTime: 60_000,
    retry: false,
  });
  return query.data ?? AI_OFF;
}

/**
 * True when AI tools may be shown. While the site-wide daily cap is reached they hide;
 * only the chat stays visible to explain that it is resting until tomorrow.
 */
export function useAiEnabled(): boolean {
  const status = useAiStatus();
  return status.enabled && !status.paused;
}

export type DescriptionInput = {
  brand: string;
  model: string;
  generation?: string;
  trim?: string;
  year: number;
  mileage?: number;
  engineVolume?: number;
  horsepower?: number;
  transmission?: string;
  fuel?: string;
  bodyType?: string;
  condition?: string;
  city?: string;
  currentText?: string;
  tone: DescriptionTone;
  language: AiLanguageCode;
  mode: DescriptionMode;
};

export async function generateListingDescription(input: DescriptionInput, signal: AbortSignal) {
  const data = await gqlRequest<{
    generateListingDescription: { text: string; usedFields: string[]; missingHints: string[] };
  }>(GENERATE_MUTATION, { input }, undefined, { signal });
  return data.generateListingDescription;
}

export async function parseVehicleSearchQuery(query: string, language: AiLanguageCode, signal: AbortSignal) {
  const data = await gqlRequest<{
    parseVehicleSearchQuery: { filters: ParsedSearchFilters; unapplied: string[] };
  }>(PARSE_MUTATION, { query, language }, undefined, { signal });
  return data.parseVehicleSearchQuery;
}
