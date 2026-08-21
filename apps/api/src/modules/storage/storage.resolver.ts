import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards, UnauthorizedException } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../core/guards/supabase-auth.guard";
import { StorageService } from "./storage.service";
import { UploadUrlPayload } from "./storage.types";

@Resolver(() => UploadUrlPayload)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Mutation(() => UploadUrlPayload, { name: "generateUploadUrl" })
  @UseGuards(SupabaseAuthGuard)
  async generateUploadUrl(
    @Args("fileName", { type: () => String }) fileName: string,
    @Context() context: any,
  ): Promise<UploadUrlPayload> {
    const req = context?.req || context?.switchToHttp?.()?.getRequest?.();
    const user = req?.user;
    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    return this.storageService.generateUploadUrl(fileName, user.id);
  }
}
