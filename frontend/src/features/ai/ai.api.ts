import { useQuery } from '@tanstack/react-query';

import { gqlRequest, GraphQLRequestError } from '@/lib/graphql';

export type AiLanguageCode = 'AZ' | 'RU' | 'EN';
export type DescriptionTone = 'NEUTRAL' | 'SALES' | 'SHORT';
export type DescriptionMode = 'GENERATE' | 'REGENERATE' | 'SHORTER' | 'LONGER';

export type AiErrorCode = 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_RESULT' | 'INVALID_INPUT' | 'GENERIC';

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

const STATUS_QUERY = `query AiStatus { aiStatus { enabled } }`;

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
  if (code === 'RATE_LIMITED' || code === 'UNAVAILABLE' || code === 'INVALID_RESULT' || code === 'INVALID_INPUT') {
    return code;
  }
  return 'GENERIC';
}

export async function fetchAiEnabled(): Promise<boolean> {
  try {
    const data = await gqlRequest<{ aiStatus?: { enabled?: boolean } }>(STATUS_QUERY);
    return data?.aiStatus?.enabled === true;
  } catch {
    return false;
  }
}

/** False while loading and when the server says AI is off, so the UI never shows a dead control. */
export function useAiEnabled(): boolean {
  const query = useQuery({
    queryKey: ['ai-status'],
    queryFn: fetchAiEnabled,
    staleTime: 60_000,
    retry: false,
  });
  return query.data === true;
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
