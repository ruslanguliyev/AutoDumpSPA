import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { GqlAuthGuard } from './gql-auth.guard';

/** Only signed-in users with the ADMIN role may pass. */
@Injectable()
export class AdminGuard extends GqlAuthGuard {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    // Throws 401 when there is no valid token.
    const authenticated = super.handleRequest(err, user, info, context, status);
    if (authenticated.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Administrator access required');
    }
    return authenticated;
  }
}
