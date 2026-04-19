import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { ChangePasswordInput, UpdateProfileInput, UserObject } from './user.types';
import { UsersService } from './users.service';

@Resolver(() => UserObject)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => UserObject)
  async me(@CurrentUser() user: AuthUser): Promise<UserObject> {
    return this.usersService.getMe(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserObject)
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateProfileInput,
  ): Promise<UserObject> {
    return this.usersService.updateProfile(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Args('input') input: ChangePasswordInput,
  ): Promise<boolean> {
    return this.usersService.changePassword(user.id, input);
  }
}
