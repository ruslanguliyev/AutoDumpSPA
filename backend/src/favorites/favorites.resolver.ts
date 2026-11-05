import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { FavoriteItemObject, FavoriteRefInput } from './favorite.types';
import { FavoritesService } from './favorites.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class FavoritesResolver {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Query(() => [FavoriteItemObject])
  myFavorites(@CurrentUser() user: AuthUser) {
    return this.favoritesService.list(user.id);
  }

  @Mutation(() => Boolean)
  addFavorite(
    @CurrentUser() user: AuthUser,
    @Args('type') type: string,
    @Args('itemId') itemId: string,
  ) {
    return this.favoritesService.add(user.id, type, itemId);
  }

  @Mutation(() => Boolean)
  removeFavorite(
    @CurrentUser() user: AuthUser,
    @Args('type') type: string,
    @Args('itemId') itemId: string,
  ) {
    return this.favoritesService.remove(user.id, type, itemId);
  }

  /** Returns how many items were actually saved. */
  @Mutation(() => Int)
  syncFavorites(
    @CurrentUser() user: AuthUser,
    @Args('items', { type: () => [FavoriteRefInput] }) items: FavoriteRefInput[],
  ) {
    return this.favoritesService.addMany(user.id, items);
  }
}
