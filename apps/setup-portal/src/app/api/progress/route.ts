import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { accessSync, constants } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOG_FILE = process.env.SOUS_BOOTSTRAP_LOG || '/var/log/sous-bootstrap.log';

/**
 * GET /api/progress
 * Streams the bootstrap log via Server-Sent Events (SSE).
 */
export async function GET(req: Request) {
  // Return early if client doesn't want event-stream
  if (req.headers.get('accept') !== 'text/event-stream') {
    return new NextResponse('Expected Accept: text/event-stream', { status: 400 });
  }

  // Ensure log file exists before tailing
  try {
    accessSync(LOG_FILE, constants.R_OK);
  } catch {
    // If it doesn't exist yet, wait 1s and hope it's created by bootstrap
    await new Promise(r => setTimeout(r, 1000));
    try {
      accessSync(LOG_FILE, constants.R_OK);
    } catch {
      return new NextResponse('Log file not ready', { status: 503 });
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      // Spawn tail -f on the log file
      const tail = spawn('tail', ['-n', '100', '-F', LOG_FILE]);

      tail.stdout.on('data', (data: Buffer) => {
        const lines = data.toString('utf8').split('\n');
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ line })}\n\n`));
          }
        }
      });

      tail.stderr.on('data', (data: Buffer) => {
        console.error('[/api/progress] tail stderr:', data.toString('utf8'));
      });

      tail.on('close', (code) => {
        console.log(`[/api/progress] tail process exited with code ${code}`);
        try {
          controller.close();
        } catch (e) {
          // ignore stream already closed errors
        }
      });

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        tail.kill();
        console.log('[/api/progress] Client disconnected, tail killed');
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
