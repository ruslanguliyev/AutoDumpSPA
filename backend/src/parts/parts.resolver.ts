import { BadRequestException, UseGuards } from '@nestjs/common';
import { PromotionTier } from '@prisma/client';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/guards/optional-gql-auth.guard';
import {
  CreatePartInput,
  PaginatedParts,
  PartObject,
  PartsFilterInput,
  PartTranslationInput,
  UpdatePartInput,
} from './part.types';
import { PartsService } from './parts.service';
import { PartTranslationService } from '../translations/part-translation.service';
import { isListingLang } from '../translations/part-translations';
import GraphQLJSON from 'graphql-type-json';

@Resolver(() => PartObject)
export class PartsResolver {
  constructor(
    private readonly partsService: PartsService,
    private readonly partTranslations: PartTranslationService,
  ) {}

  @Query(() => PaginatedParts)
  async parts(
    @Args('filter', { type: () => PartsFilterInput, nullable: true })
    filter?: PartsFilterInput | null,
  ): Promise<PaginatedParts> {
    return this.partsService.getParts(filter ?? undefined);
  }

  /**
   * The promoted block shown above the catalogue, or on the home page when `tier` is
   * PREMIUM. Clearly separate from the ranked results, and always labelled as paid.
   */
  @Query(() => [PartObject])
  async promotedParts(
    @Args('tier', { type: () => PromotionTier, nullable: true }) tier?: PromotionTier | null,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number | null,
  ): Promise<PartObject[]> {
    return this.partsService.getPromotedParts(tier ?? PromotionTier.VIP, limit ?? 6);
  }

  @Query(() => PartObject)
  async partById(@Args('id') id: string): Promise<PartObject> {
    return this.partsService.getPartById(id);
  }

  @UseGuards(OptionalGqlAuthGuard)
  @Query(() => PartObject, { nullable: true })
  async partByListing(
    @CurrentUser() user: AuthUser | null,
    @Args('listingId') listingId: string,
  ): Promise<PartObject | null> {
    return this.partsService.getPartByListingId(listingId, user?.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PartObject)
  async createPart(
    @CurrentUser() user: AuthUser,
    @Args('listingId') listingId: string,
    @Args('input') input: CreatePartInput,
  ): Promise<PartObject> {
    return this.partsService.createPart(user.id, listingId, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PartObject)
  async updatePart(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('input') input: UpdatePartInput,
  ): Promise<PartObject> {
    return this.partsService.updatePart(user.id, id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deletePart(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.partsService.deletePart(user.id, id);
  }

  /** The seller's own corrections of the AI translations of a part's name and description. */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => GraphQLJSON)
  async updatePartTranslations(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('translations', { type: () => [PartTranslationInput] }) translations: PartTranslationInput[],
  ): Promise<unknown> {
    const entries = translations.map((entry) => {
      if (!isListingLang(entry.lang)) throw new BadRequestException(`Unknown language ${entry.lang}`);
      return { lang: entry.lang, name: entry.name, description: entry.description ?? null };
    });
    return this.partTranslations.setManual(user.id, id, entries);
  }
}
