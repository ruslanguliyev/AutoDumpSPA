import { GraphQLError } from 'graphql';

export type AiErrorCode = 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_RESULT' | 'INVALID_INPUT' | 'INVALID_IMAGE';

export function aiError(code: AiErrorCode): GraphQLError {
  return new GraphQLError(code, { extensions: { code } });
}
