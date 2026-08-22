import { Module } from "@nestjs/common";
import { StorageResolver } from "./storage.resolver";
import { StorageService } from "./storage.service";
import { SupabaseService } from "../../core/database/supabase";

@Module({
  controllers: [],
  providers: [StorageService, StorageResolver, SupabaseService],
  exports: [StorageService],
})
export class StorageModule {}
