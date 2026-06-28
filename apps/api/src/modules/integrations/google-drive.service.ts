import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { google } from "googleapis";
import { config } from "@soustools/config";
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

    const redirectUri = `${config.API_BASE_URL}/integrations/callback/google`;
    const oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      token_type: 'Bearer',
      expiry_date: integration.expires_at ? new Date(integration.expires_at).getTime() : undefined,
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
    }).catch(error => {
      if (error.code === 401 || (error.response && error.response.status === 401)) {
        throw new UnauthorizedException("Google Drive authentication failed. Please reconnect.");
      }
      if (error.code === 403 || (error.response && error.response.status === 403)) {
        throw new UnauthorizedException("Insufficient Google Drive permissions. Please reconnect and ensure you check the box to grant Drive access on the consent screen.");
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
        // For simple text files or other readable formats
        const response = await drive.files.get({
          fileId,
          alt: "media",
        });
        return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
      }
    } catch (error: any) {
      if (error.code === 401 || (error.response && error.response.status === 401)) {
        throw new UnauthorizedException("Google Drive authentication failed. Please reconnect.");
      }
      if (error.code === 403 || (error.response && error.response.status === 403)) {
        throw new UnauthorizedException("Insufficient Google Drive permissions. Please reconnect and ensure you check the box to grant Drive access on the consent screen.");
      }
      throw error;
    }
  }
}
