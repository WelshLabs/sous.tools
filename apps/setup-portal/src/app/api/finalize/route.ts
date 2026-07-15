import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KIOSK_MODE_FILE = process.env.SOUS_KIOSK_MODE_FILE || '/etc/sous/kiosk-mode';

/**
 * POST /api/finalize
 * Called by the Web Dashboard after the pairing code is successfully confirmed.
 * Transitions the compositor from mirror mode to split-screen kiosk mode.
 */
export async function POST() {
  try {
    // 1. Write the new state flag
    // The node process runs as sous, which has a NOPASSWD sudo rule for tee
    execSync(`echo kiosk | sudo tee ${KIOSK_MODE_FILE}`);

    // 2. Kill wl-mirror
    try {
      execSync('sudo pkill -x wl-mirror');
    } catch {
      // pkill returns non-zero if no process matched; that's fine
    }

    // 3. Restart Sway
    // The ExecStartPre script will read kiosk-mode and symlink the correct config
    execSync('sudo systemctl restart sous-sway.service');

    return NextResponse.json({ success: true, message: 'Transitioned to kiosk mode' });
  } catch (err) {
    console.error('[/api/finalize] Failed to transition to kiosk mode:', err);
    return NextResponse.json(
      { error: 'Transition failed', details: String(err) },
      { status: 500 }
    );
  }
}
