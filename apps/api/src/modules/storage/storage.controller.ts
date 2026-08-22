import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { ApiResponse } from "@soustools/api-types";
import { StorageService } from "./storage.service";
import { UploadUrlPayload } from "./storage.types";

class UploadUrlDto {
  @ApiProperty({ description: "Name of the file", example: "image.png" })
  fileName!: string;
}

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Generates a signed upload URL for direct client-side storage uploads.
   * Prevents proxying large binary data payloads through the NestJS server.
   */
  @Post("upload-url")
  @ApiBody({ type: UploadUrlDto })
  async getUploadUrl(
    @Body() body: UploadUrlDto,
    @Req() req: any,
  ): Promise<ApiResponse<UploadUrlPayload>> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    const data = await this.storageService.generateUploadUrl(
      body?.fileName || "file.bin",
      user.id,
    );

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
