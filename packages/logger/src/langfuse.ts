import { Langfuse } from "langfuse";

/**
 * Langfuse Tracing Utility Module
 * Follows Langfuse Agent Skill best practices:
 * 1. Descriptive trace names & observation typing (generation, agent, retriever).
 * 2. Session ID & User ID tracking.
 * 3. Token usage and cost instrumentation.
 * 4. Asynchronous flush handling on shutdown.
 */

const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
const secretKey = process.env.LANGFUSE_SECRET_KEY;
const baseUrl =
  process.env.LANGFUSE_HOST ||
  process.env.LANGFUSE_BASE_URL ||
  "https://cloud.langfuse.com";

export const langfuse = new Langfuse({
  publicKey: publicKey || "pk-lf-placeholder",
  secretKey: secretKey || "sk-lf-placeholder",
  baseUrl,
  enabled: Boolean(publicKey && secretKey),
});

export interface TraceOptions {
  name: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  input?: unknown;
}

export interface GenerationOptions {
  name: string;
  model: string;
  input: unknown;
  modelParameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a descriptive trace following Langfuse best practices.
 */
export const createTrace = (options: TraceOptions) => {
  return langfuse.trace({
    name: options.name,
    userId: options.userId,
    sessionId: options.sessionId,
    tags: options.tags || ["soustools"],
    metadata: {
      environment: process.env.NODE_ENV || "development",
      ...options.metadata,
    },
    input: options.input,
  });
};

/**
 * Flushes all pending telemetry to Langfuse asynchronously.
 */
export const flushLangfuse = async (): Promise<void> => {
  try {
    await langfuse.flushAsync();
  } catch (_err) {
    // Ignore flush errors during process exit
  }
};

// Register process shutdown hooks for graceful flush
process.on("beforeExit", () => {
  void flushLangfuse();
});
