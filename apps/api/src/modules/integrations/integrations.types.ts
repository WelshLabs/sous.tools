import { ObjectType, Field, ID } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class IntegrationStatusGQL {
  @Field(() => String)
  provider!: string;

  @Field(() => Boolean)
  connected!: boolean;

  @Field(() => String, { nullable: true })
  accountName?: string;

  @Field(() => String, { nullable: true })
  lastSyncedAt?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}

@ObjectType()
export class GoogleDriveFileGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  mimeType!: string;

  @Field(() => String, { nullable: true })
  iconLink?: string;

  @Field(() => String, { nullable: true })
  modifiedTime?: string;
}

@ObjectType()
export class GoogleDriveImportResultGQL {
  @Field(() => String)
  url!: string;

  @Field(() => String)
  name!: string;
}
