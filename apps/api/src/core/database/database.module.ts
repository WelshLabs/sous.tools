import { Global, Module } from "@nestjs/common";
import { SupabaseService, SupabaseClientWrapper } from "./supabase";

@Global()
@Module({
  providers: [SupabaseService, SupabaseClientWrapper],
  exports: [SupabaseService, SupabaseClientWrapper],
})
export class DatabaseModule {}
