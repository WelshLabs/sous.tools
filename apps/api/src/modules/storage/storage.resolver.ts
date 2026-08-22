import { Resolver, Mutation, Args, Context } from "@nestjs/graphql";
import { StorageService } from "./storage.service";
import { UploadUrlPayload, GenerateUploadUrlInput } from "./storage.types";

@Resolver(() => UploadUrlPayload)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Mutation(() => UploadUrlPayload, { name: "generateUploadUrl" })
  async generateUploadUrl(
    @Args("input") input: GenerateUploadUrlInput,
    @Context() ctx: any,
  ): Promise<UploadUrlPayload> {
    const userId = ctx.req?.user?.id || ctx.req?.user?.sub || "demo-user";
    return this.storageService.generateUploadUrl(
      input.fileName || "file.bin",
      userId,
    );
  }
}
