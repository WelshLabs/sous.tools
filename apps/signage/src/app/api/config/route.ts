import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supabaseUrl, supabaseAnonKey, orgId, deviceId } = body;

    // We write this to a local volume mounted at /data inside the Docker container
    const envContent = `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${supabaseAnonKey}\nORG_ID=${orgId}\nDEVICE_ID=${deviceId}\n`;
    
    const filePath = "/data/sous-tenant.env";
    
    // In dev mode (not docker), /data might not exist, fallback to /tmp
    const targetPath = fs.existsSync("/data") ? filePath : "/tmp/sous-tenant.env";

    fs.writeFileSync(targetPath, envContent, { encoding: "utf8" });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
