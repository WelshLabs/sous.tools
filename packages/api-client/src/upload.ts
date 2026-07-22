import { api } from "./rest";
import { refreshAuthSession } from "./auth-session";

export async function uploadFile(file: File): Promise<string> {
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    const { data, error } = await api.POST("/storage/upload-url", {
      body: { fileName: file.name },
    });

    if (error) {
      throw new Error(`Failed to retrieve signed upload URL: ${JSON.stringify(error)}`);
    }

    const payload = data as any;
    if (!payload?.data?.signedUrl || !payload?.data?.publicUrl) {
      throw new Error("Invalid response structure from API for signed URL");
    }

    const { signedUrl, publicUrl } = payload.data;

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
      credentials: "omit",
    });

    if (uploadRes.status === 401 && attempt < maxAttempts - 1) {
      attempt++;
      const refreshed = await refreshAuthSession();
      if (!refreshed) {
        throw new Error("SessionExpiredError");
      }
      continue;
    }

    if (!uploadRes.ok) {
      throw new Error(`Direct upload failed with status ${uploadRes.status}`);
    }

    return publicUrl;
  }

  throw new Error("File upload failed after maximum retry attempts");
}
