import { Injectable, Optional } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { serverConfig as config } from "@soustools/config/server";
import { ClsService } from "nestjs-cls";

export function createAdminClient(): SupabaseClient {
  const url =
    config.SUPABASE_URL &&
    (config.SUPABASE_URL.startsWith("http://") ||
      config.SUPABASE_URL.startsWith("https://"))
      ? config.SUPABASE_URL
      : "https://mock.supabase.co";
  const key = config.SUPABASE_SERVICE_ROLE_KEY || "mock-key";
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Shared singleton instance of the Supabase Client configured using the config package.
 */
export const supabase: SupabaseClient = createAdminClient();

/**
 * Singleton Supabase provider that reads tenant/org context from CLS.
 */
@Injectable()
export class SupabaseService {
  public readonly client: SupabaseClient = supabase;

  constructor(@Optional() private readonly cls?: ClsService) {}

  /**
   * Reads orgId from the current CLS Async Local Storage context.
   */
  get orgId(): string | undefined {
    return this.cls?.get<string>("orgId");
  }

  /**
   * Helper method to get the current orgId from CLS context.
   */
  getOrgId(): string | undefined {
    return this.cls?.get<string>("orgId");
  }

  /**
   * Reads userId from the current CLS Async Local Storage context.
   */
  get userId(): string | undefined {
    return this.cls?.get<string>("userId");
  }

  /**
   * Helper method to get the current userId from CLS context.
   */
  getUserId(): string | undefined {
    return this.cls?.get<string>("userId");
  }

  from(table: string): ReturnType<SupabaseClient["from"]> {
    return this.client.from(table);
  }
}

/**
 * Wrapper class for the Supabase client to facilitate injection or importing within NestJS.
 */
export class SupabaseClientWrapper {
  public readonly client: SupabaseClient = supabase;
}
