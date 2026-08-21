import { Field, ObjectType, InputType } from "@nestjs/graphql";

@ObjectType()
export class UploadUrlPayload {
  @Field(() => String)
  signedUrl!: string;

  @Field(() => String)
  publicUrl!: string;

  @Field(() => String)
  filePath!: string;

  @Field(() => String, { nullable: true })
  token?: string;
}

@InputType()
export class GenerateUploadUrlInput {
  @Field(() => String)
  fileName!: string;
}
