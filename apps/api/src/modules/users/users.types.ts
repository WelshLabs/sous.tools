import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";

@ObjectType()
export class UserProfileGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  role?: string;
}

@InputType()
export class UpdateUserProfileInputGQL {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  role?: string;
}
