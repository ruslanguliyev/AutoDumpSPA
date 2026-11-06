import { UseGuards } from '@nestjs/common';
import { PromotionTier } from '@prisma/client';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import {
  CreateSpecialistInput,
  SpecialistObject,
  SpecialistsFilterInput,
  UpdateSpecialistInput,
} from './specialist.types';
import { SpecialistsService } from './specialists.service';

@Resolver(() => SpecialistObject)
export class SpecialistsResolver {
  constructor(private readonly specialistsService: SpecialistsService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => SpecialistObject, { nullable: true })
  async mySpecialist(
    @CurrentUser() user: AuthUser,
  ): Promise<SpecialistObject | null> {
    return this.specialistsService.getSpecialistByUserId(user.id);
  }

  /**
   * The promoted block shown above the catalogue, or on the home page when `tier` is
   * PREMIUM. Clearly separate from the ranked results, and always labelled as paid.
   */
  @Query(() => [SpecialistObject])
  async promotedSpecialists(
    @Args('tier', { type: () => PromotionTier, nullable: true }) tier?: PromotionTier | null,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number | null,
  ): Promise<SpecialistObject[]> {
    return this.specialistsService.getPromotedSpecialists(tier ?? PromotionTier.VIP, limit ?? 6);
  }

  @Query(() => SpecialistObject)
  async specialist(@Args('id') id: string): Promise<SpecialistObject> {
    return this.specialistsService.getSpecialistById(id);
  }

  @Query(() => SpecialistObject)
  async specialistBySlug(
    @Args('slug') slug: string,
  ): Promise<SpecialistObject> {
    return this.specialistsService.getSpecialistBySlug(slug);
  }

  @Query(() => [SpecialistObject])
  async specialists(
    @Args('filter', { type: () => SpecialistsFilterInput, nullable: true })
    filter?: SpecialistsFilterInput | null,
  ): Promise<SpecialistObject[]> {
    return this.specialistsService.getSpecialists(filter ?? undefined);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SpecialistObject)
  async createSpecialist(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateSpecialistInput,
  ): Promise<SpecialistObject> {
    return this.specialistsService.createSpecialist(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SpecialistObject)
  async updateSpecialist(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateSpecialistInput,
  ): Promise<SpecialistObject> {
    return this.specialistsService.updateSpecialist(user.id, input);
  }
}
