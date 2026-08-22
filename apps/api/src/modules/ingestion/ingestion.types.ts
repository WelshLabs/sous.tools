import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class IngestionReviewRecordGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organization_id!: string;

  @Field(() => String)
  source!: string;

  @Field(() => String, { nullable: true })
  source_name?: string;

  @Field(() => String, { nullable: true })
  source_document_url?: string;

  @Field(() => String)
  status!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  parsed_data?: any;

  @Field(() => String, { nullable: true })
  created_at?: string;

  @Field(() => String, { nullable: true })
  updated_at?: string;
}

@ObjectType()
export class IngestionUploadPayloadGQL {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  jobId?: string;

  @Field(() => ID)
  reviewId!: string;

  @Field(() => String)
  message!: string;
}

@InputType()
export class IngestionPageInputGQL {
  @Field(() => Number)
  pageNumber!: number;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  rawText?: string;
}

@InputType()
export class IngestionUploadInputGQL {
  @Field(() => String, { nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  sourceName?: string;

  @Field(() => String, { nullable: true })
  sourceDocumentUrl?: string;

  @Field(() => [IngestionPageInputGQL], { nullable: true })
  pagesInput?: IngestionPageInputGQL[];

  @Field(() => ID, { nullable: true })
  conversationId?: string;
}
