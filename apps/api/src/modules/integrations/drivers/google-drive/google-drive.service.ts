import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { google } from "googleapis";
import { serverConfig as config } from "@soustools/config/server";
import { supabase } from "../../../../lib/supabase";

@Injectable()
export class GoogleDriveService {
  async getAuthClient(orgId: string): Promise<any> {
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("provider", "GOOGLE")
      .single();

    if (!integration) {
      throw new NotFoundException("Google Drive integration not connected.");
    }

    const redirectUri = `${config.NEXT_PUBLIC_API_URL}/integrations/callback/google`;
    const oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      redirectUri,
    );

    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      token_type: "Bearer",
      expiry_date: integration.expires_at
        ? new Date(integration.expires_at).getTime()
        : undefined,
    });

    return oauth2Client;
  }

  async listFiles(orgId: string, query?: string, folderId?: string) {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    let q = query ? `name contains '${query}'` : "";
    if (folderId) {
      q = q ? `${q} and '${folderId}' in parents` : `'${folderId}' in parents`;
    }

    // Default to root if no query and no folder
    if (!q) {
      q = "'root' in parents";
    }

    const response = await drive.files
      .list({
        q,
        fields: "files(id, name, mimeType, webViewLink)",
        spaces: "drive",
      })
      .catch((error) => {
        if (
          error.code === 401 ||
          (error.response && error.response.status === 401)
        ) {
          throw new UnauthorizedException(
            "Google Drive authentication failed. Please reconnect.",
          );
        }
        if (
          error.code === 403 ||
          (error.response && error.response.status === 403)
        ) {
          throw new UnauthorizedException(
            "Insufficient Google Drive permissions. Please reconnect and ensure you check the box to grant Drive access on the consent screen.",
          );
        }
        throw error;
      });

    return response.data.files || [];
  }

  async extractFileContent(fileId: string, orgId: string): Promise<string> {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    try {
      const file = await drive.files.get({ fileId, fields: "mimeType" });
      const mimeType = file.data.mimeType;

      if (mimeType === "application/vnd.google-apps.document") {
        const response = await drive.files.export({
          fileId,
          mimeType: "text/plain",
        });
        return response.data as string;
      } else {
        const response = await drive.files.get(
          {
            fileId,
            alt: "media",
          },
          { responseType: "arraybuffer" },
        );

        const buffer = Buffer.from(response.data as ArrayBuffer);
        return buffer.toString("utf8");
      }
    } catch (error: any) {
      if (
        error.code === 401 ||
        (error.response && error.response.status === 401)
      ) {
        throw new UnauthorizedException(
          "Google Drive authentication failed. Please reconnect.",
        );
      }
      if (
        error.code === 403 ||
        (error.response && error.response.status === 403)
      ) {
        throw new UnauthorizedException(
          "Insufficient Google Drive permissions. Please reconnect and ensure you check the box to grant Drive access on the consent screen.",
        );
      }
      throw error;
    }
  }

  async processDriveFile(
    fileId: string,
    orgId: string,
    reviewId: string,
  ): Promise<{
    text?: string;
    sourceDocumentUrl?: string;
    sourceName?: string;
  }> {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    try {
      const file = await drive.files.get({ fileId, fields: "mimeType, name" });
      const mimeType = file.data.mimeType || "application/octet-stream";
      const name = file.data.name || "document";

      if (mimeType === "application/vnd.google-apps.document") {
        const response = await drive.files.export({
          fileId,
          mimeType: "text/plain",
        });
        return { text: response.data as string, sourceName: name };
      } else {
        const response = await drive.files.get(
          {
            fileId,
            alt: "media",
          },
          { responseType: "arraybuffer" },
        );

        const buffer = Buffer.from(response.data as ArrayBuffer);

        // If it's a known text format, just return text
        if (mimeType.startsWith("text/") || mimeType === "application/json") {
          return { text: buffer.toString("utf8"), sourceName: name };
        }

        // Otherwise, it's an image, PDF, etc. Upload to Supabase!
        const ext =
          name.split(".").pop() ||
          (mimeType === "application/pdf" ? "pdf" : "jpg");
        const fileName = `${reviewId}_${fileId}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("ingestion-sources")
          .upload(fileName, buffer, { contentType: mimeType, upsert: true });

        if (uploadErr) {
          console.error("Failed to upload drive file to Supabase:", uploadErr);
          return { sourceName: name };
        }

        const { data: urlData } = supabase.storage
          .from("ingestion-sources")
          .getPublicUrl(fileName);

        return {
          sourceDocumentUrl: urlData?.publicUrl || "",
          sourceName: name,
        };
      }
    } catch (error: any) {
      console.error("Drive processing error:", error);
      return {};
    }
  }
}
