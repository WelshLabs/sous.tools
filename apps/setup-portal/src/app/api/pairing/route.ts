import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { serverConfig as config } from '@soustools/config/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONFIG_FILE = config.SOUS_DEVICE_CONFIG;

/**
 * GET /api/pairing
 * Reads the pairing code from device-config.json.
 */
export async function GET() {
  try {
    const data = readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(data);

    if (config.pairing_code) {
      return NextResponse.json({ pairing_code: config.pairing_code });
    }

    return NextResponse.json({ pairing_code: null });
  } catch (err) {
    console.error('[/api/pairing] Failed to read config:', err);
    return NextResponse.json({ pairing_code: null, error: String(err) }, { status: 500 });
  }
}
