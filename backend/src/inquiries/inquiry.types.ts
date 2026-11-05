import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InquiryStatus } from '@prisma/client';

registerEnumType(InquiryStatus, { name: 'InquiryStatus' });

@ObjectType()
export class InquiryObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  listingTitle: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  phone?: string | null;

  @Field(() => InquiryStatus)
  status: InquiryStatus;

  @Field()
  createdAt: Date;

  /** Sender name — only filled for the listing's seller. */
  @Field({ nullable: true })
  fromName?: string | null;

  /** Sender email — only filled for the listing's seller. */
  @Field({ nullable: true })
  fromEmail?: string | null;
}

@InputType()
export class CreateInquiryInput {
  @Field()
  listingId: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  phone?: string;
}
