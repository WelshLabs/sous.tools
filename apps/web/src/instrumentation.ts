/**
 * Next.js instrumentation file for server-side initialization.
 * Patches global console methods to route through the centralized pino logger.
 * @tenant-docs-export
 */
export async function register(): Promise<void> {
  // Console monkey patching removed to prevent Next.js Webpack deadlocks
}
