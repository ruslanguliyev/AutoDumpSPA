import { Injectable } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';

/**
 * Populates `req.user` when a valid Bearer token is present, but never rejects
 * the request. Use on public queries that return extra data to the owner.
 */
@Injectable()
export class OptionalGqlAuthGuard extends GqlAuthGuard {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(_err: unknown, user: any) {
    return user || null;
  }
}
