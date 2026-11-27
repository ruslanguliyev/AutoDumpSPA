import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { isListingLang } from './part-translations';
import { isTranslatableKind, TextTranslationService } from './text-translation.service';

@InputType()
export class TextTranslationInput {
  /** az, ru or en. */
  @Field()
  lang: string;

  /** description, bio, or service:<code> for a price-list title. */
  @Field()
  key: string;

  @Field()
  text: string;
}

@Resolver()
export class TextTranslationsResolver {
  constructor(private readonly translations: TextTranslationService) {}

  /**
   * The owner's corrections of the AI translations of a car description (kind "vehicle",
   * the vehicle id), a service center (kind "serviceCenter") or a master's bio ("specialist").
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => GraphQLJSON)
  async updateTextTranslations(
    @CurrentUser() user: AuthUser,
    @Args('kind') kind: string,
    @Args('id') id: string,
    @Args('translations', { type: () => [TextTranslationInput] }) translations: TextTranslationInput[],
  ): Promise<unknown> {
    if (!isTranslatableKind(kind)) throw new BadRequestException(`Unknown kind ${kind}`);
    const entries = translations.map((entry) => {
      if (!isListingLang(entry.lang)) throw new BadRequestException(`Unknown language ${entry.lang}`);
      return { lang: entry.lang, key: entry.key, text: entry.text };
    });
    return this.translations.setManual(user.id, kind, id, entries);
  }
}
