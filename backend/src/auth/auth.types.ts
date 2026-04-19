import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { SellerType, UserRole } from '@prisma/client';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role enum',
});

registerEnumType(SellerType, {
  name: 'SellerType',
  description: 'Seller type enum',
});

@ObjectType()
export class AuthUser {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  fullName: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => AuthUser)
  user: AuthUser;
}
