/**
 * Single GraphQL client for the whole app.
 *
 * - Endpoint: VITE_API_URL (falls back to legacy VITE_GRAPHQL_ENDPOINT, then localhost:4000).
 * - The auth token from localStorage is attached automatically.
 *   Pass `token` explicitly to override it (or `null` to send the request anonymously).
 */
export const GQL_URL: string =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_GRAPHQL_ENDPOINT ??
  'http://localhost:4000/graphql';

export const TOKEN_STORAGE_KEY = 'autobaz-token';

const readStoredToken = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_STORAGE_KEY);

type GraphQLResponse<T> = {
  data?: T | null;
  errors?: Array<{ message: string }>;
};

export async function gqlRequest<T = any>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null,
): Promise<T> {
  const authToken = token === undefined ? readStoredToken() : token;

  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  // GraphQL errors arrive with HTTP 200 or 4xx plus a JSON body: prefer their message.
  let json: GraphQLResponse<T> | null = null;
  try {
    json = (await res.json()) as GraphQLResponse<T>;
  } catch {
    // not JSON
  }

  if (json?.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!res.ok) {
    throw new Error(`GraphQL request failed (${res.status})`);
  }
  return (json?.data ?? null) as T;
}

/** Object-argument variant kept for modules that call `graphqlRequest({ query, variables })`. */
export const graphqlRequest = <T = any>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> => gqlRequest<T>(query, variables);
