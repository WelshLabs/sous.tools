import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class HealthStatus {
  @Field(() => String)
  status!: string;

  @Field(() => String)
  timestamp!: string;
}
