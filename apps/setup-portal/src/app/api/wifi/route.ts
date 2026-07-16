import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface WifiConnectBody {
  ssid: string;
  password: string;
}

/**
 * POST /api/wifi
 * Connects the Pi to a WiFi network via nmcli.
 * The NM dispatcher will then detect internet, kill the AP, and run bootstrap.
 */
export async function POST(req: Request) {
  let body: WifiConnectBody;

  try {
    body = await req.json() as WifiConnectBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ssid, password } = body;

  if (!ssid || typeof ssid !== 'string' || ssid.trim().length === 0) {
    return NextResponse.json({ error: 'ssid is required' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { error: 'password must be at least 8 characters' },
      { status: 400 }
    );
  }

  // Sanitise inputs — reject any shell metacharacters
  const safeSsid = ssid.replace(/[^a-zA-Z0-9 _\-.@]/g, '');
  const safePassword = password.replace(/'/g, "'\\''"); // escape for single-quote context

  try {
    // nmcli will store credentials in /etc/NetworkManager/system-connections/
    // and immediately attempt to connect. NM dispatcher picks up the 'up' event.
    execSync(
      `nmcli device wifi connect '${safeSsid}' password '${safePassword}'`,
      { timeout: 20_000, stdio: 'pipe' }
    );

    return NextResponse.json({ success: true, ssid: safeSsid });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/wifi] nmcli error:', message);

    // nmcli exits non-zero even on "connection already exists" — handle gracefully
    if (message.includes('already')) {
      return NextResponse.json({ success: true, ssid: safeSsid, note: 'already connected' });
    }

    return NextResponse.json(
      { error: 'Failed to connect to WiFi', detail: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wifi/scan
 * Returns nearby WiFi networks for the SSID picker UI.
 */
export async function GET() {
  try {
    const raw = execSync(
      "nmcli -t -f SSID,SIGNAL,SECURITY device wifi list 2>/dev/null",
      { timeout: 10_000, encoding: 'utf8' }
    );

    const networks = raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [ssid, signal, security] = line.split(':');
        return { ssid: ssid ?? '', signal: parseInt(signal ?? '0', 10), security: security ?? '' };
      })
      .filter((n) => n.ssid.length > 0)
      // Remove duplicates (same SSID), keep strongest signal
      .reduce<{ ssid: string; signal: number; security: string }[]>((acc, n) => {
        const existing = acc.find((x) => x.ssid === n.ssid);
        if (!existing || existing.signal < n.signal) {
          return [...acc.filter((x) => x.ssid !== n.ssid), n];
        }
        return acc;
      }, [])
      .sort((a, b) => b.signal - a.signal)
      .slice(0, 20);

    return NextResponse.json({ networks });
  } catch (err) {
    return NextResponse.json({ networks: [], error: String(err) }, { status: 200 });
  }
}
