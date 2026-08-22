import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class SignageDisplayGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => ID, { nullable: true })
  deck_id?: string;

  @Field(() => ID, { nullable: true })
  device_id?: string;

  @Field(() => String, { nullable: true })
  port_label?: string;

  @Field(() => String, { nullable: true })
  last_seen_at?: string;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@ObjectType()
export class SignageDeckGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  config?: any;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@InputType()
export class CreateSignageDeckInputGQL {
  @Field(() => String)
  name!: string;
}

@InputType()
export class UpdateSignageDeckInputGQL {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  config?: any;
}

@InputType()
export class CreateSignageDisplayInputGQL {
  @Field(() => String)
  name!: string;

  @Field(() => ID, { nullable: true })
  deck_id?: string;
}

@InputType()
export class UpdateSignageDisplayInputGQL {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  deck_id?: string;
}
