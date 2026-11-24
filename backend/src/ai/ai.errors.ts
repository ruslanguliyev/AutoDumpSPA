import { GraphQLError } from 'graphql';

export type AiErrorCode = 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_RESULT' | 'INVALID_INPUT' | 'INVALID_IMAGE'
  /** This visitor used up today's AI allowance. */
  | 'DAILY_LIMIT'
  /** The site-wide daily cap is reached; the AI is paused until tomorrow. */
  | 'PAUSED';

export function aiError(code: AiErrorCode): GraphQLError {
  return new GraphQLError(code, { extensions: { code } });
}
