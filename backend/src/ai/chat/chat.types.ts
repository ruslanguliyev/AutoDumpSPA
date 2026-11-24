import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AiLanguage } from '../ai.types';

export enum AiChatRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export enum AiChatCardKind {
  CAR = 'CAR',
  RENTAL = 'RENTAL',
  PART = 'PART',
  SERVICE_CENTER = 'SERVICE_CENTER',
  SPECIALIST = 'SPECIALIST',
  SELLER = 'SELLER',
}

export enum AiChatPriceUnit {
  DAY = 'DAY',
  HOUR = 'HOUR',
  FROM = 'FROM',
}

registerEnumType(AiChatRole, { name: 'AiChatRole' });
registerEnumType(AiChatCardKind, { name: 'AiChatCardKind' });
registerEnumType(AiChatPriceUnit, { name: 'AiChatPriceUnit' });

@InputType()
export class AiChatMessageInput {
  @Field(() => AiChatRole)
  role: AiChatRole;

  @Field()
  text: string;
}

@InputType()
export class AiChatInput {
  /** The visible conversation so far, oldest first, ending with the user's new message. */
  @Field(() => [AiChatMessageInput])
  messages: AiChatMessageInput[];

  @Field(() => AiLanguage)
  language: AiLanguage;
}

/** A real catalogue entry the assistant found. Built from database rows only. */
@ObjectType()
export class AiChatCard {
  @Field(() => AiChatCardKind)
  kind: AiChatCardKind;

  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  subtitle: string | null;

  @Field(() => Float, { nullable: true })
  price: number | null;

  @Field(() => String, { nullable: true })
  currency: string | null;

  @Field(() => AiChatPriceUnit, { nullable: true })
  priceUnit: AiChatPriceUnit | null;

  @Field(() => String, { nullable: true })
  city: string | null;

  @Field(() => String, { nullable: true })
  imageUrl: string | null;

  @Field(() => Float, { nullable: true })
  rating: number | null;

  /** Site path without the language prefix. */
  @Field()
  path: string;
}

@ObjectType()
export class AiChatReply {
  @Field()
  text: string;

  @Field(() => [AiChatCard])
  cards: AiChatCard[];
}
