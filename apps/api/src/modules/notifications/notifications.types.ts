import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
export class NotificationItemGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  message!: string;

  @Field(() => String, { nullable: true })
  link?: string | null;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String, { nullable: true })
  readAt?: string | null;
}

@ObjectType()
export class PaginatedNotificationsPayload {
  @Field(() => [NotificationItemGQL])
  data!: NotificationItemGQL[];

  @Field(() => Int)
  totalPages!: number;

  @Field(() => Int)
  total!: number;
}
