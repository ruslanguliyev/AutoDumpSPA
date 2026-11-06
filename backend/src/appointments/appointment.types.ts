import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AppointmentStatus } from '@prisma/client';
import { ReviewTargetType } from '../reviews/review.types';

registerEnumType(AppointmentStatus, { name: 'AppointmentStatus' });

@ObjectType()
export class AppointmentObject {
  @Field()
  id: string;

  @Field(() => AppointmentStatus)
  status: AppointmentStatus;

  /** Requested day, "YYYY-MM-DD". */
  @Field()
  date: string;

  /** Preferred time, "HH:mm". */
  @Field(() => String, { nullable: true })
  time: string | null;

  @Field(() => String, { nullable: true })
  vehicle: string | null;

  @Field(() => String, { nullable: true })
  message: string | null;

  /** The customer's phone number. */
  @Field()
  phone: string;

  @Field(() => ReviewTargetType)
  targetType: ReviewTargetType;

  @Field()
  targetId: string;

  @Field()
  targetName: string;

  @Field(() => String, { nullable: true })
  targetSlug: string | null;

  /** Phone of the specialist / service center, only once the visit is confirmed. */
  @Field(() => String, { nullable: true })
  targetPhone: string | null;

  @Field()
  customerName: string;

  @Field()
  customerEmail: string;

  @Field()
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  decidedAt: Date | null;
}

@InputType()
export class RequestAppointmentInput {
  @Field(() => ReviewTargetType)
  targetType: ReviewTargetType;

  @Field()
  targetId: string;

  /** "YYYY-MM-DD". */
  @Field()
  date: string;

  /** "HH:mm", optional. */
  @Field(() => String, { nullable: true })
  time?: string | null;

  /** Free text such as "BMW X5 2018". */
  @Field(() => String, { nullable: true })
  vehicle?: string | null;

  @Field(() => String, { nullable: true })
  message?: string | null;

  @Field()
  phone: string;
}
