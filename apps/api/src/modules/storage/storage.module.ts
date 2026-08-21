import { Module } from "@nestjs/common";
import { StorageController } from "./storage.controller";
import { StorageResolver } from "./storage.resolver";
import { StorageService } from "./storage.service";
import { SupabaseService } from "../../core/database/supabase";

@Module({
  controllers: [StorageController],
  providers: [StorageService, StorageResolver, SupabaseService],
  exports: [StorageService],
})
export class StorageModule {}
