import { GraphQLError } from 'graphql';

export type AiErrorCode = 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_RESULT' | 'INVALID_INPUT';

export function aiError(code: AiErrorCode): GraphQLError {
  return new GraphQLError(code, { extensions: { code } });
}
