import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService, AuthResult } from './auth.service';
import { AuthPayload } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('fullName') fullName: string,
  ): Promise<AuthResult> {
    return this.authService.register(email, password, fullName);
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResult> {
    return this.authService.login(email, password);
  }
}
