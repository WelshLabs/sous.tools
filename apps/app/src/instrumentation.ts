/**
 * Next.js instrumentation file for server-side initialization.
 * Patches global console methods to route through the centralized pino logger.
 * @tenant-docs-export
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { patchConsole } = await import("@soustools/logger");
    patchConsole();
  }
}
