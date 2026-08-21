import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { serverConfig as config } from "@soustools/config/server";
import { supabase, SupabaseService } from "../../core/database/supabase";
import { UploadUrlPayload } from "./storage.types";

@Injectable()
export class StorageService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async generateUploadUrl(
    fileName: string = "file.bin",
    userId?: string,
  ): Promise<UploadUrlPayload> {
    const effectiveUserId =
      userId ||
      this.supabaseService.userId ||
      this.supabaseService.getUserId() ||
      "anonymous";
    const fileId = randomUUID();
    const cleanFileName = fileName || "file.bin";
    const ext = cleanFileName.split(".").pop() || "bin";
    const filePath = `${effectiveUserId}/${fileId}.${ext}`;

    const client = this.supabaseService?.client || supabase;
    const { data, error } = await client.storage
      .from("ingestion-sources")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error(error?.message || "Failed to create signed upload URL");
    }

    let signedUrl = data.signedUrl;
    if (!signedUrl.startsWith("http://") && !signedUrl.startsWith("https://")) {
      const baseUrl =
        config.SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL || "";
      if (baseUrl) {
        signedUrl = `${baseUrl.replace(/\/$/, "")}/storage/v1${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
      }
    }

    const { data: publicUrlData } = client.storage
      .from("ingestion-sources")
      .getPublicUrl(filePath);

    return {
      signedUrl,
      publicUrl: publicUrlData.publicUrl,
      filePath,
      token: (data as any).token,
    };
  }
}
