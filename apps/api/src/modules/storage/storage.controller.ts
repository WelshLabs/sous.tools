import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { SupabaseAuthGuard } from "../../core/guards/supabase-auth.guard";
import { ApiResponse } from "@soustools/api-types";
import { randomUUID } from "crypto";
import { supabase } from "../../core/database/supabase";

class UploadUrlDto {
  @ApiProperty({ description: "Name of the file", example: "image.png" })
  fileName!: string;
}

@Controller("storage")
export class StorageController {
  /**
   * Generates a signed upload URL for direct client-side storage uploads.
   * Prevents proxying large binary data payloads through the NestJS server.
   */
  @Post("upload-url")
  @UseGuards(SupabaseAuthGuard)
  @ApiBody({ type: UploadUrlDto })
  async getUploadUrl(
    @Body() body: UploadUrlDto,
    @Req() req: any,
  ): Promise<
    ApiResponse<{ signedUrl: string; publicUrl: string; filePath: string }>
  > {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    const fileId = randomUUID();
    const fileName = body?.fileName || "file.bin";
    const ext = fileName.split(".").pop() || "bin";
    const filePath = `${user.id}/${fileId}.${ext}`;

    const { data, error } = await supabase.storage
      .from("ingestion-sources")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error(error?.message || "Failed to create signed upload URL");
    }

    const { data: publicUrlData } = supabase.storage
      .from("ingestion-sources")
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        publicUrl: publicUrlData.publicUrl,
        filePath,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
