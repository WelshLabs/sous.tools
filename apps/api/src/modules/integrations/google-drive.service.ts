import { Injectable, NotFoundException } from "@nestjs/common";
import { google } from "googleapis";
import { supabase } from "../../lib/supabase";

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

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
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

    const response = await drive.files.list({
      q,
      fields: "files(id, name, mimeType, webViewLink)",
      spaces: "drive",
    });

    return response.data.files || [];
  }

  async extractFileContent(fileId: string, orgId: string): Promise<string> {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    const file = await drive.files.get({ fileId, fields: "mimeType" });
    const mimeType = file.data.mimeType;

    if (mimeType === "application/vnd.google-apps.document") {
      const response = await drive.files.export({
        fileId,
        mimeType: "text/plain",
      });
      return response.data as string;
    } else {
      // For simple text files or other readable formats
      const response = await drive.files.get({
        fileId,
        alt: "media",
      });
      return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    }
  }
}
