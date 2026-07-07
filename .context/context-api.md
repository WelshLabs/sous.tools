This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/.next/**, **/out/**, **/build/**, package-lock.json, yarn.lock, pnpm-lock.yaml, **/.git/**, **/*.png, **/*.jpg, **/*.jpeg, **/*.svg, **/*.ico, **/*.spec.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
common/
  guards/
    admin.guard.ts
  pipes/
    zod-validation.pipe.ts
filters/
  all-exceptions.filter.ts
graphql/
  graphql.module.ts
health/
  health.controller.ts
  health.module.ts
  health.resolver.ts
  health.types.ts
lib/
  supabase-auth.guard.ts
  supabase.ts
modules/
  commands/
    commands.controller.ts
    commands.module.ts
    commands.service.ts
  devices/
    devices.controller.ts
    devices.module.ts
    devices.service.ts
  ingestion/
    CloudVisionService.ts
    ingestion.controller.ts
    ingestion.module.ts
    ingestion.processor.ts
    IVisionService.ts
    OllamaVisionService.ts
  integrations/
    drivers/
      base.driver.ts
      square.driver.ts
    google-drive.service.ts
    integrations.controller.ts
    integrations.module.ts
    integrations.service.ts
    pos-sync.processor.ts
    square-client.helper.ts
    square-seed-types.ts
    square-seed.helper.ts
    square-sync.helper.ts
    webhooks.controller.ts
  items/
    inventory.controller.ts
    inventory.service.ts
    items.controller.ts
    items.module.ts
    items.service.ts
    price-history.controller.ts
    price-history.service.ts
    purchase-orders.controller.ts
    purchase-orders.service.ts
    vendors.controller.ts
    vendors.service.ts
    wastage.controller.ts
    wastage.service.ts
    whiteboard.controller.ts
    whiteboard.service.ts
  metrics/
    metrics.controller.ts
    metrics.module.ts
  nutrition/
    dietary-classifier.service.ts
    label-renderer.service.ts
    nutrition.controller.ts
    nutrition.module.ts
    nutrition.service.ts
    usda-resolver.service.ts
  pos/
    pos-links.service.ts
    pos-transactions.service.ts
    pos.module.ts
  pos-simulator/
    pos-simulator.controller.ts
    pos-simulator.helpers.ts
    pos-simulator.mock.ts
    pos-simulator.module.ts
  recipe/
    ingredients.controller.ts
    ingredients.service.ts
    recipe-cost.service.ts
    recipe-meta.controller.ts
    recipe-meta.service.ts
    recipe-versions.controller.ts
    recipe.module.ts
    recipes.controller.ts
    recipes.mapper.ts
    recipes.service.ts
    vessels.controller.ts
    vessels.service.ts
  signage/
    displays.controller.ts
    displays.helpers.ts
    displays.service.ts
    layouts.controller.ts
    layouts.service.ts
    response.helper.ts
    signage.gateway.ts
    signage.module.ts
  users/
    users.controller.ts
    users.module.ts
app.controller.ts
app.module.ts
app.service.ts
main.ts
pre-bootstrap.ts
schema.gql
```

# Files

## File: common/guards/admin.guard.ts
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // In a real scenario we'd decode JWT or rely on auth middleware to set request.user
    const user = request.user;
    
    // Check if the user has an admin role
    if (user && user.role === 'admin') {
      return true;
    }
    
    throw new ForbiddenException('Admin access required');
  }
}
```

## File: common/pipes/zod-validation.pipe.ts
```typescript
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed', { cause: error });
    }
  }
}
```

## File: filters/all-exceptions.filter.ts
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { logger } from '@soustools/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof Error ? exception.message : 'Internal server error';

    logger.error({ err: exception, status, path: request?.url }, 'Exception caught by filter');

    if (response && typeof response.status === 'function') {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request?.url,
        message,
      });
    }
  }
}
```

## File: graphql/graphql.module.ts
```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: process.env.NODE_ENV === 'production' ? true : join(process.cwd(), 'apps/api/src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
  ],
})
export class AppGraphQLModule {}
```

## File: health/health.controller.ts
```typescript
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "dev-local",
    };
  }
}
```

## File: health/health.module.ts
```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthResolver } from './health.resolver';

@Module({
  controllers: [HealthController],
  providers: [HealthResolver],
})
export class HealthModule {}
```

## File: health/health.resolver.ts
```typescript
import { Query, Resolver } from '@nestjs/graphql';
import { HealthStatus } from './health.types';

@Resolver(() => HealthStatus)
export class HealthResolver {
  @Query(() => HealthStatus)
  healthCheck(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
```

## File: health/health.types.ts
```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HealthStatus {
  @Field(() => String)
  status!: string;

  @Field(() => String)
  timestamp!: string;
}
```

## File: lib/supabase-auth.guard.ts
```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { supabase } from "./supabase";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header found");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }
    request.user = user;
    return true;
  }
}
```

## File: lib/supabase.ts
```typescript
import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@soustools/supabase";

/**
 * Shared instance of the Supabase Client configured using the config package.
 */
export const supabase: SupabaseClient = createAdminClient();

/**
 * Wrapper class for the Supabase client to facilitate injection or importing within NestJS.
 */
export class SupabaseClientWrapper {
  /** The active Supabase client instance. */
  public readonly client: SupabaseClient = supabase;
}
```

## File: modules/commands/commands.controller.ts
```typescript
import { Controller, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../lib/supabase-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OmnibarCommandPayload, OmnibarCommandPayloadSchema, ApiResponse } from '@soustools/api-types';
import { CommandsService } from './commands.service';
import { runControllerAction } from '../signage/response.helper';

@Controller('commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post('/')
  @UseGuards(SupabaseAuthGuard)
  @UsePipes(new ZodValidationPipe(OmnibarCommandPayloadSchema))
  async handleCommand(@Body() payload: OmnibarCommandPayload): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      return this.commandsService.handleCommand(payload);
    });
  }
}
```

## File: modules/commands/commands.module.ts
```typescript
import { Module } from '@nestjs/common';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';

@Module({
  controllers: [CommandsController],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}
```

## File: modules/commands/commands.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OmnibarCommandPayload } from '@soustools/api-types';

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);

  async handleCommand(payload: OmnibarCommandPayload) {
    this.logger.log(`\n🤖 AI COMMAND RECEIVED [${payload.source}]: ${payload.command}`);
    if (payload.context) {
      this.logger.log(`Context: ${JSON.stringify(payload.context)}`);
    }

    return {
      action: 'ACKNOWLEDGED',
      message: 'Yes Chef.',
    };
  }
}
```

## File: modules/devices/devices.controller.ts
```typescript
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../../lib/supabase-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { DevicesService } from "./devices.service";
import { ApiResponse, SignageDevice } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { z } from "zod";

const PairSchema = z.object({
  hardwareMac: z.string().optional().default("00:00:00:00:00:00"),
  tenantAdminToken: z.string().optional().default("dummy-token"),
  requestedName: z.string().optional().default("Dummy Device"),
});

/**
 * Controller managing signage hardware device settings.
 *
 * @tenant-docs-export
 * Manages settings for paired hardware displays such as timezone and maintenance window settings.
 */
@Controller("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * Registers a new physical device, returning its assigned ID and 6-digit pairing code.
   * This is called by the Pi on first boot when it has no tenant config.
   */
  @Post("register")
  async register(): Promise<ApiResponse<{ deviceId: string; pairingCode: string }>> {
    return runControllerAction(() => this.devicesService.register());
  }

  /**
   * Poll endpoint for the Pi to check if a user has entered its pairing code.
   */
  @Get(":deviceId/status")
  async getStatus(@Param("deviceId") deviceId: string): Promise<ApiResponse<{ paired: boolean; supabaseUrl?: string; supabaseAnonKey?: string }>> {
    return runControllerAction(() => this.devicesService.getStatus(deviceId));
  }

  /**
   * Loads the paired device's current settings.
   */
  @Get(":deviceId")
  async findOne(@Param("deviceId") deviceId: string): Promise<ApiResponse<SignageDevice>> {
    return runControllerAction(() => this.devicesService.findOne(deviceId));
  }

  /**
   * Saves the updated device configuration.
   */
  @Put(":deviceId")
  async update(
    @Param("deviceId") deviceId: string,
    @Body("name") name?: string,
    @Body("timezone") timezone?: string,
    @Body("maintenanceWindow") maintenanceWindow?: {
      hour: number;
      minute: number;
      dayOfWeek: number | null;
    },
  ): Promise<ApiResponse<SignageDevice>> {
    return runControllerAction(() =>
      this.devicesService.update(deviceId, name, timezone, maintenanceWindow),
    );
  }

  /**
   * Captive Portal Handshake - Pairs a device via MAC address and Tenant Token.
   */
  @Post("pair")
  async pair(@Body() body: any): Promise<ApiResponse<{ device_pairing_token: string }>> {
    const result = PairSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    
    return runControllerAction(() => 
      this.devicesService.pair(result.data.hardwareMac, result.data.tenantAdminToken, result.data.requestedName)
    );
  }

  @Post("pair/init")
  async initPairing(@Body("deviceType") deviceType: "wearos" | "rpi"): Promise<ApiResponse<{ code: string }>> {
    return runControllerAction(() => this.devicesService.initPairing(deviceType));
  }

  @Post("pair/confirm")
  @UseGuards(SupabaseAuthGuard)
  async confirmPairing(
    @Body("code") code: string,
    @Body("deviceType") deviceType: "wearos" | "rpi",
    @Req() req: any
  ): Promise<ApiResponse<{ success: boolean }>> {
    return runControllerAction(() => this.devicesService.confirmPairing(code, deviceType, req.user));
  }

  @Get("pair/status/:code")
  async getPairingStatus(@Param("code") code: string): Promise<ApiResponse<{ status: string; token?: string }>> {
    return runControllerAction(() => this.devicesService.getPairingStatus(code));
  }

  @Post(":id/revoke")
  @UseGuards(AdminGuard)
  async revokeDevice(@Param("id") id: string): Promise<ApiResponse<{ success: boolean }>> {
    return runControllerAction(() => this.devicesService.revokeDevice(id));
  }
}
```

## File: modules/devices/devices.module.ts
```typescript
import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
```

## File: modules/devices/devices.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageDevice } from "@soustools/api-types";
import { config } from "@soustools/config";
import Redis from "ioredis";
import * as jwt from "jsonwebtoken";

interface DbDeviceRow {
  id: string;
  organization_id: string;
  name: string;
  pairing_code: string;
  is_paired: boolean;
  last_seen_at: string | null;
  timezone: string;
  maintenance_window: {
    hour: number;
    minute: number;
    day_of_week: string | number;
  };
  created_at: string;
}

interface MaintenanceWindowInput {
  hour: number;
  minute: number;
  dayOfWeek: number | null;
}

/**
 * Service managing hardware signage devices.
 * Handles loading and updating device-specific configurations
 * like timezones and maintenance windows.
 *
 * @tenant-docs-export
 * Timezones and maintenance windows can be configured per paired hardware device
 * to ensure updates and restarts occur during off-hours.
 */
@Injectable()
export class DevicesService {
  private readonly redis = new Redis({ host: config.REDIS_HOST, port: config.REDIS_PORT });

  /**
   * Registers a new device natively from the Pi, returning a pairing code.
   */
  async register(): Promise<{ deviceId: string; pairingCode: string }> {
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error } = await supabase
      .from("signage_devices")
      .insert([{
        name: "Unpaired Device",
        pairing_code: pairingCode,
        is_paired: false,
        timezone: "UTC",
        maintenance_window: { hour: 3, minute: 0, day_of_week: null },
      }])
      .select("id, pairing_code")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { deviceId: data.id, pairingCode: data.pairing_code };
  }

  /**
   * Pairs a device using a Captive Portal Handshake.
   * Returns a mock device_pairing_token locked to the organization.
   */
  async pair(_hardwareMac: string, _tenantAdminToken: string, _requestedName: string): Promise<{ device_pairing_token: string }> {
    // In a real implementation, we would decode tenantAdminToken to get the org ID,
    // and store the hardwareMac and requestedName in the database.
    // For this PoC, we blindly bypass real DB validation and return the dummy token.
    
    return { device_pairing_token: "mock_jwt_token_123" };
  }

  /**
   * Checks pairing status. If paired, returns the auth config for the Pi.
   */
  async getStatus(id: string): Promise<{ paired: boolean; supabaseUrl?: string; supabaseAnonKey?: string }> {
    const { data, error } = await supabase
      .from("signage_devices")
      .select("is_paired")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data.is_paired) {
      return {
        paired: true,
        supabaseUrl: config.SUPABASE_URL,
        supabaseAnonKey: config.SUPABASE_ANON_KEY,
      };
    }
    return { paired: false };
  }

  /**
   * Fetches a single paired hardware device's settings by ID.
   */
  async findOne(id: string): Promise<SignageDevice> {
    const { data, error } = await supabase
      .from("signage_devices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.mapRow(data as DbDeviceRow);
  }

  /**
   * Updates a paired hardware device's settings.
   */
  async update(
    id: string,
    name?: string,
    timezone?: string,
    maintenanceWindow?: MaintenanceWindowInput,
  ): Promise<SignageDevice> {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (maintenanceWindow !== undefined) {
      updateData.maintenance_window = {
        hour: maintenanceWindow.hour,
        minute: maintenanceWindow.minute,
        day_of_week: maintenanceWindow.dayOfWeek,
      };
    }

    const { data, error } = await supabase
      .from("signage_devices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.mapRow(data as DbDeviceRow);
  }

  async initPairing(deviceType: "wearos" | "rpi"): Promise<{ code: string }> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await this.redis.setex(`pairing:${code}`, 900, JSON.stringify({ deviceType, status: "pending" }));
    return { code };
  }

  async confirmPairing(code: string, deviceType: "wearos" | "rpi", user: any): Promise<{ success: boolean }> {
    const dataStr = await this.redis.get(`pairing:${code}`);
    if (!dataStr) throw new Error("Invalid or expired pairing code");
    const data = JSON.parse(dataStr);
    
    if (data.deviceType !== deviceType) throw new Error("Device type mismatch");

    const orgId = user.user_metadata?.organization_id || "mock-org-id";

    if (deviceType === "wearos") {
      data.status = "confirmed";
      data.userId = user.id;
    } else {
      data.status = "confirmed";
      data.orgId = orgId;
    }
    
    await this.redis.setex(`pairing:${code}`, 900, JSON.stringify(data));
    return { success: true };
  }

  async getPairingStatus(code: string): Promise<{ status: string; token?: string }> {
    const dataStr = await this.redis.get(`pairing:${code}`);
    if (!dataStr) return { status: "expired" };
    
    const data = JSON.parse(dataStr);
    if (data.status === "confirmed") {
      const payload = data.deviceType === "wearos" ? { sub: data.userId, deviceType: "wearos" } : { orgId: data.orgId, deviceType: "rpi" };
      const token = jwt.sign(payload, config.SUPABASE_ANON_KEY || "secret", { expiresIn: "1y" });
      
      await this.redis.del(`pairing:${code}`);
      return { status: "confirmed", token };
    }
    
    return { status: "pending" };
  }

  async revokeDevice(id: string): Promise<{ success: boolean }> {
    await this.redis.del(`device_session:${id}`);
    await supabase.from("signage_devices").update({ is_paired: false, pairing_code: null }).eq("id", id);
    return { success: true };
  }

  private mapRow(row: DbDeviceRow): SignageDevice {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      pairingCode: row.pairing_code,
      isPaired: row.is_paired,
      lastSeenAt: row.last_seen_at,
      timezone: row.timezone,
      maintenanceWindow: {
        hour: row.maintenance_window?.hour ?? 3,
        minute: row.maintenance_window?.minute ?? 0,
        dayOfWeek: typeof row.maintenance_window?.day_of_week === "number"
          ? row.maintenance_window.day_of_week
          : null,
      },
      createdAt: row.created_at,
    };
  }
}
```

## File: modules/ingestion/CloudVisionService.ts
```typescript
import { Injectable } from "@nestjs/common";
import { IVisionService } from "./IVisionService";
import { GoogleGenAI, Type } from "@google/genai";
import { config } from "@soustools/config";

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    yieldCount: { type: Type.NUMBER },
    yieldUnit: { type: Type.STRING },
    sourceBook: { type: Type.STRING, description: "Book or publication title if visible" },
    sourceAuthor: { type: Type.STRING, description: "Author of the recipe if visible" },
    sourcePageStart: { type: Type.NUMBER },
    sourcePageEnd: { type: Type.NUMBER },
    vessel: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        shape: { type: Type.STRING, enum: ["ROUND", "RECTANGULAR"] },
        length: { type: Type.NUMBER },
        width: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
        diameter: { type: Type.NUMBER },
        volumeMl: { type: Type.NUMBER }
      },
      required: ["name", "shape", "volumeMl"]
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          component: { type: Type.STRING, description: "The component or section this ingredient belongs to, e.g., 'Dough', 'Glaze', 'Filling', 'Caramelized apples'. Leave null if the recipe has no sections." },
          calculationType: { type: Type.STRING, enum: ["WEIGHT", "VOLUME", "COUNT"] },
          prepNotes: { type: Type.STRING, description: "e.g., diced, melted, room temp" }
        },
        required: ["name", "amount", "unit"]
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The instruction text" },
          stepNumber: { type: Type.NUMBER },
          timerDurationSeconds: { type: Type.NUMBER, description: "If a duration is mentioned in this step, convert it to seconds" }
        },
        required: ["text", "stepNumber"]
      }
    },
    prepTimeMinutes: { type: Type.NUMBER, description: "Preparation time in minutes" },
    cookTimeMinutes: { type: Type.NUMBER, description: "Cooking/baking/proofing time in minutes" }
  },
  required: ["title", "ingredients", "instructions"]
};

const recipeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: recipeSchema
    }
  },
  required: ["recipes"]
};

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    vendorName: { type: Type.STRING },
    invoiceNumber: { type: Type.STRING },
    date: { type: Type.STRING },
    totalAmount: { type: Type.NUMBER },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rawName: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          pricePerUnit: { type: Type.NUMBER },
          totalPrice: { type: Type.NUMBER }
        },
        required: ["rawName", "quantity", "pricePerUnit"]
      }
    }
  },
  required: ["vendorName", "items"]
};

@Injectable()
export class CloudVisionService implements IVisionService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  async processRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    return this.processDocument("recipe", imageBuffer, rawText, mimeType);
  }

  async processInvoice(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    return this.processDocument("invoice", imageBuffer, rawText, mimeType);
  }

  private async processDocument(
    documentType: "recipe" | "invoice",
    imageBuffer?: Buffer,
    rawText?: string,
    mimeType?: string
  ): Promise<any> {
    const inlineDataParts: any[] = [];

    if (imageBuffer) {
      inlineDataParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBuffer.toString("base64")
        }
      });
    }

    const genConfig = {
      responseMimeType: "application/json",
      responseSchema: documentType === "recipe" ? recipeResponseSchema : invoiceSchema,
      systemInstruction: `You are an expert culinary and back-office AI. Extract structured data from the provided document. For recipes, extract an array of ALL recipes found in the document under the 'recipes' key. 
- You MUST aggressively search for all distinct recipes and group them into the 'recipes' array. DO NOT return an empty array if you see any culinary content.
- For vessels/pans, if dimensions are mentioned (e.g., 9x13 pan), automatically calculate the volumeMl (e.g., 9 * 13 * 2 (height) * 16.387 = ~3800ml) and set shape to RECTANGULAR.
- Extract any cooking/prep times into timerDurationSeconds accurately.
The requested document type is: ${documentType}`
    };

    let responseText = "";

    if (inlineDataParts.length > 0) {
      const contents: any[] = [...inlineDataParts];
      if (rawText) contents.push({ text: rawText });
      contents.push({ text: `Extract the ${documentType} data from this document.` });
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: genConfig
      });
      responseText = response.text || "{}";
    } else if (rawText) {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: rawText,
        config: genConfig
      });
      responseText = response.text || "{}";
    } else {
      return {};
    }

    return JSON.parse(responseText);
  }
}
```

## File: modules/ingestion/ingestion.controller.ts
```typescript
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UsePipes,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  ApiResponse,
  IngestionPayload,
  OcrInvoiceIngestionPayloadSchema,
  OcrInvoiceIngestionPayload,
} from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { supabase } from "../../lib/supabase";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

@Controller("ingestion")
export class IngestionController {

  constructor(
    @InjectQueue("ingestion") private readonly ingestionQueue: Queue,
  ) {}

  @Get()
  async getReviews(): Promise<ApiResponse<any[]>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    });
  }

  @Post("submit")
  async submit(
    @Body() payload: IngestionPayload,
  ): Promise<ApiResponse<{ jobId: string }>> {
    return runControllerAction(async () => {
      // Create initial review record so it shows in the UI immediately
      const { data: review, error } = await supabase
        .from("ingestion_reviews")
        .insert({
          organization_id: payload.organizationId,
          user_id: payload.userId,
          source: payload.source,
          source_name: payload.sourceName || null,
          raw_text: "",
          parsed_data: { processing: true },
          status: "PENDING",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      let sourceDocumentUrl = "";
      if (payload.imagesBase64 && payload.imagesBase64.length > 0) {
        const primaryB64 = payload.imagesBase64[0];
        const match = primaryB64.match(/^data:(.+?);base64,(.+)$/);
        const mimeType = match ? match[1] : "image/jpeg";
        const rawB64 = match ? match[2] : primaryB64;
        const buffer = Buffer.from(rawB64, "base64");

        const ext = mimeType.split("/")[1] || "jpg";
        const fileName = `${review.id}.${ext}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("ingestion-sources")
          .upload(fileName, buffer, { contentType: mimeType, upsert: true });

        if (uploadErr) {
          console.error("Failed to upload source file:", uploadErr);
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("ingestion-sources")
            .getPublicUrl(fileName);
          sourceDocumentUrl = urlData?.publicUrl || "";

          await supabase
            .from("ingestion_reviews")
            .update({
              source_document_url: sourceDocumentUrl,
            })
            .eq("id", review.id);
        }
      }

      // Omit the huge base64 payload to prevent Redis from crashing/OOM
      const jobPayload = {
        ...payload,
        imagesBase64: undefined,
        sourceDocumentUrl,
        reviewId: review.id,
      };

      const job = await this.ingestionQueue.add(
        "process-ingestion",
        jobPayload,
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        },
      );
      return { jobId: job.id!, reviewId: review.id };
    });
  }

  @Post("review/:id/commit")
  async commitReview(@Param("id") id: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { data: review, error } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !review) throw new Error("Review not found");

      if (review.status === "APPROVED") return;

      const parsed = review.parsed_data as any;

      const recipesToCommit = parsed.recipes
        ? parsed.recipes
        : parsed.title && parsed.ingredients
          ? [parsed]
          : [];

      if (recipesToCommit.length > 0) {
        for (const recipe of recipesToCommit) {
          // Resolve vessel
          let vesselId: string | null = null;
          if (recipe.vessel?.name) {
            const { data: existingVessel } = await supabase
              .from("vessel_profiles")
              .select("id")
              .eq("organization_id", review.organization_id)
              .ilike("name", recipe.vessel.name)
              .maybeSingle();

            if (existingVessel) {
              vesselId = existingVessel.id;
            } else {
              const { data: newVessel } = await supabase
                .from("vessel_profiles")
                .insert({
                  organization_id: review.organization_id,
                  name: recipe.vessel.name,
                  shape: recipe.vessel.shape || "ROUND",
                  length: recipe.vessel.length || null,
                  width: recipe.vessel.width || null,
                  height: recipe.vessel.height || null,
                  diameter: recipe.vessel.diameter || null,
                  volume_ml: recipe.vessel.volumeMl || 0,
                })
                .select()
                .single();
              if (newVessel) vesselId = newVessel.id;
            }
          }

          // Insert recipe
          const { data: createdRecipe, error: recipeErr } = await supabase
            .from("recipes")
            .insert({
              organization_id: review.organization_id,
              title: recipe.title,
              instructions: recipe.instructions || [],
              yield_count: recipe.yieldCount || 1,
              yield_unit: recipe.yieldUnit || "servings",
              vessel_id: vesselId,
              status: "APPROVED",
              source_document_url: review.source_document_url || null,
              source_book: recipe.sourceBook || null,
              source_author: recipe.sourceAuthor || null,
              cost_per_yield: 0,
              gross_margin: 0,
            })
            .select()
            .single();

          if (recipeErr) throw new Error(recipeErr.message);

          if (recipe.ingredients) {
            for (const ing of recipe.ingredients) {
              const { data: master } = await supabase
                .from("items")
                .select("id")
                .eq("organization_id", review.organization_id)
                .ilike("name", ing.name)
                .maybeSingle();

              let mappedCalcType = "fixed_weight";
              if (
                ing.calculationType === "WEIGHT" ||
                ing.calculationType === "VOLUME" ||
                ing.calculationType === "COUNT"
              ) {
                mappedCalcType = "fixed_weight"; // Our schema doesn't differentiate volume/count yet, it's all fixed_weight unless bakers%
              } else if (ing.calculationType === "BAKERS_PERCENTAGE") {
                mappedCalcType = "bakers_percentage";
              }

              await supabase.from("recipe_ingredients").insert({
                organization_id: review.organization_id,
                recipe_id: createdRecipe.id,
                item_id: ing.itemId || master?.id || null,
                raw_name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                calculation_type: mappedCalcType,
                base_calculation_group: ing.baseCalculationGroup || false,
                component: ing.component || null,
                prep_notes: ing.prepNotes || null,
              });
            }
          }
        }
      } else if (parsed.vendorName && parsed.items) {
        // Invoice commit
        let { data: vendor } = await supabase
          .from("vendors")
          .select("id")
          .eq("organization_id", review.organization_id)
          .ilike("name", parsed.vendorName)
          .maybeSingle();

        if (!vendor) {
          const { data: newVendor, error: vErr } = await supabase
            .from("vendors")
            .insert({
              organization_id: review.organization_id,
              name: parsed.vendorName,
              order_method: "MANUAL",
            })
            .select()
            .single();
          if (vErr) throw new Error(vErr.message);
          vendor = newVendor;
        }

        const { data: po, error: poErr } = await supabase
          .from("purchase_orders")
          .insert({
            organization_id: review.organization_id,
            vendor_id: vendor!.id,
            status: "RECONCILED",
          })
          .select()
          .single();

        if (poErr) throw new Error(poErr.message);

        for (const item of parsed.items) {
          await supabase.from("purchase_order_items").insert({
            po_id: po.id,
            raw_name: item.rawName,
            ordered_qty: item.quantity || 1,
            price_per_unit: item.pricePerUnit || 0,
          });
        }
      }

      await supabase
        .from("ingestion_reviews")
        .update({ status: "APPROVED", parsed_data: parsed })
        .eq("id", id);
    });
  }

  @Delete(":id")
  async deleteReview(@Param("id") id: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const { error } = await supabase
        .from("ingestion_reviews")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    });
  }

  @Post("ocr")
  @UsePipes(new ZodValidationPipe(OcrInvoiceIngestionPayloadSchema))
  async processOcr(
    @Body() payload: OcrInvoiceIngestionPayload,
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const orgId = "d0000000-0000-0000-0000-000000000000";
      const vendorName = payload.vendor.name;

      const { data: vendor, error: findError } = await supabase
        .from("vendors")
        .select("*")
        .eq("organization_id", orgId)
        .ilike("name", vendorName)
        .maybeSingle();

      if (findError) {
        throw new Error(
          `Failed to check existing vendor: ${findError.message}`,
        );
      }

      const updateData = {
        customer_account_number: payload.vendor.customer_account_number || null,
        terms: payload.invoice_metadata.terms || null,
        route: payload.invoice_metadata.route || null,
        sales_rep: payload.invoice_metadata.sales_rep || null,
      };

      if (vendor) {
        const { data: updatedVendor, error: updateError } = await supabase
          .from("vendors")
          .update(updateData)
          .eq("id", vendor.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update vendor: ${updateError.message}`);
        }
        return {
          message: "Vendor updated successfully",
          vendor: updatedVendor,
        };
      } else {
        const { data: newVendor, error: insertError } = await supabase
          .from("vendors")
          .insert({
            organization_id: orgId,
            name: vendorName,
            order_method: "MANUAL",
            ...updateData,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to create vendor: ${insertError.message}`);
        }
        return { message: "Vendor created successfully", vendor: newVendor };
      }
    });
  }

}
```

## File: modules/ingestion/ingestion.module.ts
```typescript
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./ingestion.controller";
import { IngestionProcessor } from "./ingestion.processor";
import { IntegrationsModule } from "../integrations/integrations.module";
import { CloudVisionService } from "./CloudVisionService";
import { OllamaVisionService } from "./OllamaVisionService";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
    IntegrationsModule,
  ],
  controllers: [IngestionController],
  providers: [
    IngestionProcessor,
    {
      provide: "IVisionService",
      useFactory: () => {
        if (process.env.VISION_PROVIDER === "ollama") {
          return new OllamaVisionService();
        }
        return new CloudVisionService();
      },
    },
  ],
  exports: ["IVisionService"],
})
export class IngestionModule {}
```

## File: modules/ingestion/ingestion.processor.ts
```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { IngestionPayload } from "@soustools/api-types";
import { GoogleDriveService } from "../integrations/google-drive.service";
import { supabase } from "../../lib/supabase";
import { Inject } from "@nestjs/common";
import { IVisionService } from "./IVisionService";

@Processor("ingestion")
export class IngestionProcessor extends WorkerHost {
  constructor(
    private readonly driveService: GoogleDriveService,
    @Inject("IVisionService") private readonly visionService: IVisionService
  ) {
    super();
  }

  async process(job: Job<IngestionPayload, any, string>): Promise<any> {
    const { source, organizationId, userId, fileIds, documentType } = job.data;
    
    let rawText = "";
    let sourceDocumentUrl = "";
    let sourceName = null;

    try {
      if (source === "google_drive" && fileIds && fileIds.length > 0) {
        for (const fileId of fileIds) {
          const { text, sourceDocumentUrl: driveDocUrl, sourceName: driveSourceName } = await this.driveService.processDriveFile(fileId, organizationId, job.data.reviewId || "new");
          if (text) rawText += text + "\n";
          if (driveDocUrl && !sourceDocumentUrl) {
            sourceDocumentUrl = driveDocUrl;
          }
          if (driveSourceName && !sourceName) {
            sourceName = driveSourceName;
          }
        }
      }

      let parsedData: any = {};
      const actualSourceDocumentUrl = job.data.sourceDocumentUrl || sourceDocumentUrl;
      let buffer: Buffer | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (actualSourceDocumentUrl) {
        try {
          const fileName = actualSourceDocumentUrl.split('/').pop();
          if (fileName) {
            const { data: fileData, error: downloadErr } = await supabase.storage
              .from("ingestion-sources")
              .download(fileName);
              
            if (downloadErr) throw downloadErr;
            if (fileData) {
              const arrayBuffer = await fileData.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
              mimeType = fileData.type || "image/jpeg";
              if (actualSourceDocumentUrl.toLowerCase().endsWith(".pdf")) {
                mimeType = "application/pdf";
              }
            }
          }
        } catch (fetchErr) {
          console.error("Failed to download source document from Supabase storage:", fetchErr);
        }
      }

      if (documentType === "recipe") {
        parsedData = await this.visionService.processRecipe(buffer, rawText, mimeType);
      } else if (documentType === "invoice") {
        parsedData = await this.visionService.processInvoice(buffer, rawText, mimeType);
      } else {
        throw new Error(`Unsupported document type: ${documentType}`);
      }

      // 3. Save Ingestion Review
      if (job.data.reviewId) {
        const updatePayload: any = {
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: sourceDocumentUrl || null
        };
        if (sourceName) updatePayload.source_name = sourceName;

        await supabase.from("ingestion_reviews").update(updatePayload).eq("id", job.data.reviewId);
      } else {
        const insertPayload: any = {
          organization_id: organizationId,
          user_id: userId,
          source,
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: sourceDocumentUrl || null
        };
        if (sourceName) insertPayload.source_name = sourceName;

        const { error } = await supabase.from("ingestion_reviews").insert(insertPayload);
        if (error) throw new Error(`Failed to save ingestion review: ${error.message}`);
      }

      const { error: notifError } = await supabase.from("notifications").insert({
        organization_id: organizationId,
        user_id: userId,
        type: "INGESTION_COMPLETE",
        title: "Ingestion Ready for Review",
        message: `Your imported document from ${source} has been parsed.`,
        link: job.data.reviewId ? `/ingestion/review/${job.data.reviewId}` : `/ingestion`,
      });

      if (notifError) console.error("Failed to create notification:", notifError);
    } catch (err: any) {
      console.error(`AI Ingestion job failed for review ID ${job.data.reviewId || "unknown"}:`, err);
      if (job.data.reviewId) {
        await supabase.from("ingestion_reviews").update({
          parsed_data: { error: err.message || "Failed to process ingestion" },
          status: "FAILED",
          source_document_url: sourceDocumentUrl || null
        }).eq("id", job.data.reviewId);
      }
      throw err;
    }

    return { success: true };
  }
}
```

## File: modules/ingestion/IVisionService.ts
```typescript
export interface IVisionService {
  processRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any>;
  processInvoice(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any>;
}
```

## File: modules/ingestion/OllamaVisionService.ts
```typescript
import { Injectable } from "@nestjs/common";
import { IVisionService } from "./IVisionService";

@Injectable()
export class OllamaVisionService implements IVisionService {
  async processRecipe(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    const prompt = `You are an expert culinary AI. Extract structured recipe data from the provided document.
Return a JSON object containing a "recipes" array. Each recipe in the array must strictly follow this structure:
{
  "title": "string (name of the recipe)",
  "yieldCount": 12, // number
  "yieldUnit": "pieces/servings",
  "sourceBook": "string",
  "sourceAuthor": "string",
  "sourcePageStart": 1,
  "sourcePageEnd": 2,
  "vessel": {
    "name": "pan name",
    "shape": "ROUND" or "RECTANGULAR",
    "length": 9,
    "width": 13,
    "height": 2,
    "diameter": 0,
    "volumeMl": 3800
  },
  "ingredients": [
    {
      "name": "flour",
      "amount": 500,
      "unit": "g",
      "component": "Dough",
      "calculationType": "WEIGHT", // WEIGHT, VOLUME, or COUNT
      "prepNotes": "sifted"
    }
  ],
  "instructions": [
    {
      "text": "Mix ingredients.",
      "stepNumber": 1,
      "timerDurationSeconds": 300
    }
  ],
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30
}
${rawText ? `Additional extracted text context: ${rawText}` : ""}`;

    return this.queryOllama(prompt, imageBuffer, _mimeType);
  }

  async processInvoice(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    const prompt = `You are an expert back-office AI. Extract structured invoice data from the provided document.
Return a JSON object following this structure:
{
  "vendorName": "string",
  "invoiceNumber": "string",
  "date": "string",
  "totalAmount": 123.45,
  "items": [
    {
      "rawName": "string",
      "quantity": 2,
      "pricePerUnit": 10.50,
      "totalPrice": 21.00
    }
  ]
}
${rawText ? `Additional extracted text context: ${rawText}` : ""}`;

    return this.queryOllama(prompt, imageBuffer, _mimeType);
  }

  private async queryOllama(prompt: string, imageBuffer?: Buffer, _mimeType?: string): Promise<any> {
    let host = process.env.OLLAMA_HOST || "http://localhost:11434";
    if (!host.endsWith("/api/generate")) {
      host = host.replace(/\/$/, "") + "/api/generate";
    }

    const payload = {
      model: process.env.OLLAMA_MODEL || "llama3.2-vision",
      prompt,
      images: imageBuffer ? [imageBuffer.toString("base64")] : [],
      stream: false,
      format: "json"
    };

    const response = await fetch(host, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json() as { response?: string };
    if (!data.response) {
      throw new Error("Invalid response received from Ollama");
    }

    return JSON.parse(data.response);
  }
}
```

## File: modules/integrations/drivers/base.driver.ts
```typescript
export abstract class BaseIntegrationDriver {
  abstract exchangeTokens(code: string, orgId: string): Promise<any>;
  abstract syncData(orgId: string): Promise<void>;
  abstract createOrder(orgId: string, orderData: any): Promise<any>;
  
  protected getBaseUrl(envVar: string, defaultUrl: string): string {
    return process.env[envVar] || defaultUrl;
  }
}
```

## File: modules/integrations/drivers/square.driver.ts
```typescript
import { BaseIntegrationDriver } from './base.driver';
import { Injectable } from '@nestjs/common';
import { config } from '@soustools/config';
import { supabase } from '../../../lib/supabase';
import * as crypto from 'crypto';

@Injectable()
export class SquareDriver extends BaseIntegrationDriver {
  
  async exchangeTokens(code: string, orgId: string): Promise<any> {
    const isProd = config.SQUARE_ENVIRONMENT === 'production';
    const baseUrl = isProd ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    const clientId = config.SQUARE_CLIENT_ID;
    const clientSecret = config.SQUARE_CLIENT_SECRET;

    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to exchange Square tokens: ${errText}`);
    }

    const data = await response.json();
    
    // Map to active Supabase organization settings
    await supabase
      .from('integrations')
      .upsert({
        organization_id: orgId,
        provider: 'SQUARE',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(),
        settings: {
          merchant_id: data.merchant_id
        }
      }, { onConflict: 'organization_id,provider' });

    return data;
  }

  async syncData(orgId: string): Promise<void> {
    // Sync logic here
    console.log(`Syncing data for ${orgId}`);
  }

  async createOrder(orgId: string, orderData: { items: any[] }): Promise<any> {
    const isProd = config.SQUARE_ENVIRONMENT === 'production';
    const baseUrl = isProd ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // 1. Get access token from integrations table
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('organization_id', orgId)
      .eq('provider', 'SQUARE')
      .single();

    if (error || !integration) {
      throw new Error(`No Square integration found for organization ${orgId}`);
    }

    const token = integration.access_token;

    // 2. Fetch first location ID
    const locRes = await fetch(`${baseUrl}/v2/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!locRes.ok) {
      throw new Error(`Failed to fetch Square locations: ${await locRes.text()}`);
    }
    const locData = await locRes.json();
    const locationId = locData.locations?.[0]?.id;
    if (!locationId) {
      throw new Error("No locations found on the Square merchant profile.");
    }

    // 3. Build order payload
    const lineItems = orderData.items.map(item => {
      const modifiers = (item.modifiers || []).map((m: any) => ({
        catalog_object_id: m.external_id || undefined,
        name: m.name
      })).filter((m: any) => m.catalog_object_id);

      return {
        name: item.name,
        quantity: String(item.quantity || 1),
        base_price_money: {
          amount: Math.round(Number(item.price || 0) * 100), // convert to cents
          currency: 'USD'
        },
        modifiers: modifiers.length > 0 ? modifiers : undefined
      };
    });

    const idempotencyKey = crypto.randomUUID();

    const orderRes = await fetch(`${baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        order: {
          location_id: locationId,
          line_items: lineItems
        }
      })
    });

    if (!orderRes.ok) {
      throw new Error(`Square Order creation failed: ${await orderRes.text()}`);
    }

    const responseData = await orderRes.json();
    return responseData;
  }
}
```

## File: modules/integrations/google-drive.service.ts
```typescript
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { google } from "googleapis";
import { config } from "@soustools/config";
import { supabase } from "../../lib/supabase";

@Injectable()
export class GoogleDriveService {
  async getAuthClient(orgId: string): Promise<any> {
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("provider", "GOOGLE")
      .single();

    if (!integration) {
      throw new NotFoundException("Google Drive integration not connected.");
    }

    const redirectUri = `${config.API_BASE_URL}/integrations/callback/google`;
    const oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
      token_type: 'Bearer',
      expiry_date: integration.expires_at ? new Date(integration.expires_at).getTime() : undefined,
    });
    
    return oauth2Client;
  }

  async listFiles(orgId: string, query?: string, folderId?: string) {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    let q = query ? `name contains '${query}'` : "";
    if (folderId) {
      q = q ? `${q} and '${folderId}' in parents` : `'${folderId}' in parents`;
    }

    // Default to root if no query and no folder
    if (!q) {
      q = "'root' in parents";
    }

    const response = await drive.files.list({
      q,
      fields: "files(id, name, mimeType, webViewLink)",
      spaces: "drive",
    }).catch(error => {
      if (error.code === 401 || (error.response && error.response.status === 401)) {
        throw new UnauthorizedException("Google Drive authentication failed. Please reconnect.");
      }
      if (error.code === 403 || (error.response && error.response.status === 403)) {
        throw new UnauthorizedException("Insufficient Google Drive permissions. Please reconnect and ensure you check the box to grant Drive access on the consent screen.");
      }
      throw error;
    });

    return response.data.files || [];
  }

  async extractFileContent(fileId: string, orgId: string): Promise<string> {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    try {
      const file = await drive.files.get({ fileId, fields: "mimeType" });
      const mimeType = file.data.mimeType;

      if (mimeType === "application/vnd.google-apps.document") {
        const response = await drive.files.export({
          fileId,
          mimeType: "text/plain",
        });
        return response.data as string;
      } else {
        const response = await drive.files.get({
          fileId,
          alt: "media",
        }, { responseType: 'arraybuffer' });
        
        const buffer = Buffer.from(response.data as ArrayBuffer);
        return buffer.toString('utf8');
      }
    } catch (error: any) {
      if (error.code === 401 || (error.response && error.response.status === 401)) {
        throw new UnauthorizedException("Google Drive authentication failed. Please reconnect.");
      }
      if (error.code === 403 || (error.response && error.response.status === 403)) {
        throw new UnauthorizedException("Insufficient Google Drive permissions. Please reconnect and ensure you check the box to grant Drive access on the consent screen.");
      }
      throw error;
    }
  }

  async processDriveFile(fileId: string, orgId: string, reviewId: string): Promise<{ text?: string, sourceDocumentUrl?: string, sourceName?: string }> {
    const auth = await this.getAuthClient(orgId);
    const drive = google.drive({ version: "v3", auth });

    try {
      const file = await drive.files.get({ fileId, fields: "mimeType, name" });
      const mimeType = file.data.mimeType || "application/octet-stream";
      const name = file.data.name || "document";

      if (mimeType === "application/vnd.google-apps.document") {
        const response = await drive.files.export({
          fileId,
          mimeType: "text/plain",
        });
        return { text: response.data as string, sourceName: name };
      } else {
        const response = await drive.files.get({
          fileId,
          alt: "media",
        }, { responseType: 'arraybuffer' });
        
        const buffer = Buffer.from(response.data as ArrayBuffer);
        
        // If it's a known text format, just return text
        if (mimeType.startsWith('text/') || mimeType === 'application/json') {
           return { text: buffer.toString('utf8'), sourceName: name };
        }
        
        // Otherwise, it's an image, PDF, etc. Upload to Supabase!
        const ext = name.split('.').pop() || (mimeType === 'application/pdf' ? 'pdf' : 'jpg');
        const fileName = `${reviewId}_${fileId}.${ext}`;
        
        const { error: uploadErr } = await supabase.storage
          .from("ingestion-sources")
          .upload(fileName, buffer, { contentType: mimeType, upsert: true });

        if (uploadErr) {
          console.error("Failed to upload drive file to Supabase:", uploadErr);
          return { sourceName: name };
        }

        const { data: urlData } = supabase.storage
          .from("ingestion-sources")
          .getPublicUrl(fileName);
          
        return { sourceDocumentUrl: urlData?.publicUrl || "", sourceName: name };
      }
    } catch (error: any) {
      console.error("Drive processing error:", error);
      return {};
    }
  }
}
```

## File: modules/integrations/integrations.controller.ts
```typescript
import { Controller, Get, Post, Delete, Param, Query, Res, Body } from "@nestjs/common";
import { Response } from "express";
import { ApiResponse, IntegrationStatus } from "@soustools/api-types";
import { config } from "@soustools/config";
import { runControllerAction } from "../signage/response.helper";
import { IntegrationsService } from "./integrations.service";
import { GoogleDriveService } from "./google-drive.service";

@Controller("integrations")
export class IntegrationsController {
  constructor(
    private readonly service: IntegrationsService,
    private readonly driveService: GoogleDriveService
  ) {}

  @Get("connect/:provider")
  connect(
    @Param("provider") provider: string,
    @Query("orgId") orgId: string,
    @Res() res: Response
  ): void {
    const url = this.service.getOAuthUrl(provider, orgId);
    res.redirect(url);
  }

  @Get("callback/:provider")
  async callback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const orgId = state || "d0000000-0000-0000-0000-000000000000";
      if (provider === "google") {
        await this.service.handleGoogleCallback(code, orgId);
      } else if (provider === "square") {
        await this.service.handleSquareCallback(code, orgId);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
      res.redirect(`${config.APP_BASE_URL}/settings?tab=integrations&status=success`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.redirect(`${config.APP_BASE_URL}/settings?tab=integrations&status=error&message=${encodeURIComponent(msg)}`);
    }
  }

  @Get("status")
  async getStatus(@Query("orgId") orgId?: string): Promise<ApiResponse<IntegrationStatus[]>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      return this.service.getIntegrationStatus(targetOrgId);
    });
  }

  @Delete("disconnect/:provider")
  async disconnect(
    @Param("provider") provider: string,
    @Query("orgId") orgId?: string
  ): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      await this.service.disconnect(provider, targetOrgId);
    });
  }

  @Post("square/sync")
  async syncSquare(@Query("orgId") orgId?: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      await this.service.syncSquareCatalog(targetOrgId);
    });
  }

  @Post("square/seed")
  async seedSquare(@Query("orgId") orgId?: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      await this.service.seedSquareCatalog(targetOrgId);
    });
  }

  @Get("google/files")
  async getGoogleFiles(@Query("q") query?: string, @Query("folderId") folderId?: string, @Query("orgId") orgId?: string) {
    const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
    return this.driveService.listFiles(targetOrgId, query, folderId);
  }

  @Post("checkout")
  async checkout(@Body() body: { orgId: string; orderData: any }) {
    return runControllerAction(async () => {
      const orgId = body.orgId || "d0000000-0000-0000-0000-000000000000";
      return this.service.checkout(orgId, body.orderData);
    });
  }
}
```

## File: modules/integrations/integrations.module.ts
```typescript
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";
import { WebhooksController } from "./webhooks.controller";
import { PosSyncProcessor } from "./pos-sync.processor";
import { GoogleDriveService } from "./google-drive.service";
import { SquareDriver } from "./drivers/square.driver";

/**
 * Module responsible for third-party integrations and POS synchronization.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: "pos-sync",
    }),
  ],
  controllers: [IntegrationsController, WebhooksController],
  providers: [IntegrationsService, PosSyncProcessor, GoogleDriveService, SquareDriver],
  exports: [IntegrationsService, GoogleDriveService, SquareDriver],
})
export class IntegrationsModule {}
```

## File: modules/integrations/integrations.service.ts
```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { config } from "@soustools/config";
import { IntegrationStatus } from "@soustools/api-types";
import { supabase } from "../../lib/supabase";
import { seedSquareCatalog, syncSquareCatalog } from "./square-sync.helper";
import { SquareDriver } from "./drivers/square.driver";

@Injectable()
export class IntegrationsService {
  constructor(private readonly squareDriver: SquareDriver) {}

  async checkout(orgId: string, orderData: any): Promise<any> {
    // Route order creation through the driver
    return this.squareDriver.createOrder(orgId, orderData);
  }
  getOAuthUrl(provider: string, orgId?: string): string {
    const state = orgId || "d0000000-0000-0000-0000-000000000000";
    if (provider === "square") {
      const baseUrl = "https://connect.squareup.com";
      const scope = "MERCHANT_PROFILE_READ+ITEMS_READ+ITEMS_WRITE+INVENTORY_READ+INVENTORY_WRITE";
      return `${baseUrl}/oauth2/authorize?client_id=${config.SQUARE_CLIENT_ID}&scope=${scope}&state=${state}&redirect_uri=${config.API_BASE_URL}/integrations/callback/square&session=false`;
    } else if (provider === "google") {
      const scope = encodeURIComponent("openid email profile https://www.googleapis.com/auth/drive.readonly");
      const redirectUri = encodeURIComponent(`${config.API_BASE_URL}/integrations/callback/google`);
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }

  async handleGoogleCallback(code: string, orgId: string): Promise<void> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${config.API_BASE_URL}/integrations/callback/google`,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
    const tokenData = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string };

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    let email = "";
    if (infoRes.ok) {
      const userInfo = (await infoRes.json()) as { email: string };
      email = userInfo.email;
    }

    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null;
    const { error } = await supabase.from("integrations").upsert({
      organization_id: orgId,
      provider: "GOOGLE",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : [],
      metadata: { connectedAs: email || "Google Account" },
      updated_at: new Date().toISOString(),
    }, { onConflict: "organization_id,provider" });

    if (error) throw new Error(`Failed to save Google integration: ${error.message}`);
  }

  async handleSquareCallback(code: string, orgId: string): Promise<void> {
    const isProd = config.SQUARE_ENVIRONMENT === "production";
    const baseUrl = isProd ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
    const res = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.SQUARE_CLIENT_ID,
        client_secret: config.SQUARE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        short_lived: false,
      }),
    });
    if (!res.ok) throw new Error(`Square token exchange failed: ${await res.text()}`);
    const tokenData = (await res.json()) as { access_token: string; refresh_token?: string; expires_at?: string; merchant_id?: string };

    let businessName = "";
    const merchantRes = await fetch(`${baseUrl}/v2/merchants/me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (merchantRes.ok) {
      const mData = (await merchantRes.json()) as { merchant?: { business_name?: string } };
      businessName = mData.merchant?.business_name || "";
    }

    const { error } = await supabase.from("integrations").upsert({
      organization_id: orgId,
      provider: "SQUARE",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: tokenData.expires_at || null,
      scopes: ["MERCHANT_PROFILE_READ", "ITEMS_READ", "ITEMS_WRITE", "INVENTORY_READ", "INVENTORY_WRITE"],
      metadata: {
        connectedAs: businessName || `Square Merchant ${tokenData.merchant_id || ""}`,
        merchantId: tokenData.merchant_id
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: "organization_id,provider" });

    if (error) throw new Error(`Failed to save Square integration: ${error.message}`);
  }

  async getIntegrationStatus(orgId: string): Promise<IntegrationStatus[]> {
    const { data, error } = await supabase.from("integrations").select("provider, metadata").eq("organization_id", orgId);
    if (error) throw new Error(`Failed to fetch integrations: ${error.message}`);

    const connectedMap = new Map<string, string>();
    (data || []).forEach((row) => {
      const metadata = row.metadata as Record<string, unknown>;
      connectedMap.set(row.provider, String(metadata?.connectedAs || "Connected"));
    });

    return [
      { provider: "SQUARE", connected: connectedMap.has("SQUARE"), connectedAs: connectedMap.get("SQUARE") },
      { provider: "GOOGLE", connected: connectedMap.has("GOOGLE"), connectedAs: connectedMap.get("GOOGLE") },
    ];
  }

  async disconnect(provider: string, orgId: string): Promise<void> {
    const uProvider = provider.toUpperCase();
    const { error } = await supabase.from("integrations").delete().eq("organization_id", orgId).eq("provider", uProvider);
    if (error) throw new Error(`Failed to disconnect integration: ${error.message}`);
  }

  async syncSquareCatalog(orgId: string): Promise<void> {
    const { data: integration } = await supabase.from("integrations").select("access_token").eq("organization_id", orgId).eq("provider", "SQUARE").single();
    if (!integration) throw new NotFoundException("No active Square integration found for this organization");
    await syncSquareCatalog(integration.access_token, orgId, supabase);
  }

  async seedSquareCatalog(orgId: string): Promise<void> {
    const { data: integration } = await supabase.from("integrations").select("access_token").eq("organization_id", orgId).eq("provider", "SQUARE").single();
    if (!integration) throw new NotFoundException("No active Square integration found for this organization");
    await seedSquareCatalog(integration.access_token);
  }
}
```

## File: modules/integrations/pos-sync.processor.ts
```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";

/**
 * BullMQ processor for handling POS catalog and inventory synchronization tasks.
 */
@Processor("pos-sync")
@Injectable()
export class PosSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(PosSyncProcessor.name);

  constructor(private readonly service: IntegrationsService) {
    super();
  }

  async process(
    job: Job<{ orgId: string; type: "sync-catalog" | "webhook-inventory"; payload?: Record<string, unknown> }>
  ): Promise<void> {
    const { orgId, type } = job.data;
    this.logger.log(`Processing job ${job.id} of type ${type} for org ${orgId}`);

    if (type === "sync-catalog") {
      await this.service.syncSquareCatalog(orgId);
    } else if (type === "webhook-inventory") {
      // Instantly run catalog and inventory sync when webhook signals inventory change
      await this.service.syncSquareCatalog(orgId);
    }
  }
}
```

## File: modules/integrations/square-client.helper.ts
```typescript
import { config } from "@soustools/config";

export interface SquareCatalogObject {
  type: string;
  id: string;
  version?: number;
  item_data?: {
    name: string;
    description?: string;
    variations?: Array<{
      id: string;
      item_variation_data?: {
        track_inventory?: boolean;
        price_money?: { amount: number; currency: string };
      };
    }>;
  };
  item_variation_data?: {
    name?: string;
    track_inventory?: boolean;
    pricing_type?: string;
    price_money?: { amount: number; currency: string };
  };
}

export interface SquareInventoryCount {
  catalog_object_id: string;
  state: string;
  quantity: string;
}

export function getSquareBaseUrl(): string {
  return config.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export async function getVariationAndLocationId(
  accessToken: string,
  squareId: string
): Promise<{ variationId: string; locationId: string }> {
  const baseUrl = getSquareBaseUrl();
  const itemRes = await fetch(`${baseUrl}/v2/catalog/object/${squareId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!itemRes.ok) {
    throw new Error(`Square catalog retrieve failed: ${await itemRes.text()}`);
  }
  const itemData = (await itemRes.json()) as { object?: SquareCatalogObject };
  const firstVariation = itemData.object?.item_data?.variations?.[0];
  if (!firstVariation) {
    throw new Error(`No variation found for Square item ${squareId}`);
  }

  let locationId = "main";
  const locRes = await fetch(`${baseUrl}/v2/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (locRes.ok) {
    const locData = (await locRes.json()) as { locations?: Array<{ id: string; status: string }> };
    const activeLoc = locData.locations?.find((l) => l.status === "ACTIVE") || locData.locations?.[0];
    if (activeLoc) {
      locationId = activeLoc.id;
    }
  }
  return { variationId: firstVariation.id, locationId };
}
```

## File: modules/integrations/square-seed-types.ts
```typescript
export interface SquareModifier {
  type: string;
  id: string;
  modifier_data?: {
    name: string;
    price_money?: { amount: number; currency: string };
  };
}

export interface SquareModifierListInfo {
  modifier_list_id: string;
  min_selected_modifiers?: number;
  max_selected_modifiers?: number;
  enabled?: boolean;
}

export interface SquareVariation {
  type: string;
  id: string;
  version?: number;
  item_variation_data?: {
    name?: string;
    pricing_type?: string;
    track_inventory?: boolean;
    price_money?: { amount: number; currency: string };
  };
}

export interface SquareItemData {
  name: string;
  description?: string;
  modifier_list_info?: SquareModifierListInfo[];
  variations?: SquareVariation[];
}

export interface SquareModifierListData {
  name: string;
  selection_type?: string;
  modifiers?: SquareModifier[];
}

export interface SquareObject {
  type: string;
  id: string;
  version?: number;
  item_data?: SquareItemData;
  modifier_list_data?: SquareModifierListData;
}

export function mapModifierListToSandbox(ml: SquareObject): SquareObject {
  return {
    type: "MODIFIER_LIST",
    id: `#modlist_${ml.id}`,
    modifier_list_data: {
      name: ml.modifier_list_data?.name || "Modifiers",
      selection_type: ml.modifier_list_data?.selection_type || "SINGLE",
      modifiers: (ml.modifier_list_data?.modifiers || []).map((m) => ({
        type: "MODIFIER",
        id: `#modifier_${m.id}`,
        modifier_data: {
          name: m.modifier_data?.name || "Option",
          price_money: m.modifier_data?.price_money || { amount: 0, currency: "USD" },
        },
      })),
    },
  };
}

export function mapItemToSandbox(item: SquareObject): SquareObject {
  const mappedModifierInfo = (item.item_data?.modifier_list_info || []).map((info) => ({
    modifier_list_id: `#modlist_${info.modifier_list_id}`,
    min_selected_modifiers: info.min_selected_modifiers,
    max_selected_modifiers: info.max_selected_modifiers,
    enabled: info.enabled,
  }));

  const mappedVariations = (item.item_data?.variations || []).map((v) => ({
    type: "ITEM_VARIATION",
    id: `#var_${v.id}`,
    item_variation_data: {
      name: v.item_variation_data?.name || "Regular",
      pricing_type: v.item_variation_data?.pricing_type || "FIXED_PRICING",
      price_money: v.item_variation_data?.price_money || { amount: 1000, currency: "USD" },
    },
  }));

  return {
    type: "ITEM",
    id: `#item_${item.id}`,
    item_data: {
      name: item.item_data?.name || "Unnamed Item",
      description: item.item_data?.description || "",
      modifier_list_info: mappedModifierInfo,
      variations: mappedVariations,
    },
  };
}
```

## File: modules/integrations/square-seed.helper.ts
```typescript
import { config } from "@soustools/config";
import { getSquareBaseUrl } from "./square-client.helper";
import {
  SquareObject,
  mapModifierListToSandbox,
  mapItemToSandbox,
} from "./square-seed-types";

interface StaticSeedItem {
  name: string;
  description: string;
  price: number;
  squareId: string;
}

const STATIC_SEED_ITEMS: StaticSeedItem[] = [
  { name: "Truffle Burger", description: "Rich truffle burger", price: 1800, squareId: "item_truffle_burger" },
  { name: "Maine Lobster Roll", description: "Fresh Maine lobster roll", price: 2600, squareId: "item_lobster_roll" },
  { name: "Caesar Salad", description: "Classic caesar salad", price: 1200, squareId: "item_caesar_salad" },
  { name: "Latte", description: "Espresso with steamed milk", price: 450, squareId: "item_latte" },
  { name: "Croissant", description: "Flaky butter croissant", price: 400, squareId: "item_croissant" },
];

export async function seedSquareCatalog(accessToken: string): Promise<void> {
  const sandboxBaseUrl = getSquareBaseUrl();
  const prodToken = config.PRODUCTION_SQUARE_ACCESS_TOKEN;

  let objects: SquareObject[] = [];

  if (prodToken && !prodToken.includes("placeholder")) {
    console.log("[Square Seeding] Production token found. Querying production catalog...");
    try {
      const itemsRes = await fetch("https://connect.squareup.com/v2/catalog/list?types=ITEM", {
        headers: {
          Authorization: `Bearer ${prodToken}`,
          "Square-Version": "2024-03-20",
          "Content-Type": "application/json",
        },
      });

      if (itemsRes.ok) {
        const itemsData = (await itemsRes.json()) as { objects?: SquareObject[] };
        const prodItems = (itemsData.objects || []).slice(0, 8);

        if (prodItems.length > 0) {
          const referencedModListIds = new Set<string>();
          prodItems.forEach((item) => {
            (item.item_data?.modifier_list_info || []).forEach((info) => {
              if (info.modifier_list_id) {
                referencedModListIds.add(info.modifier_list_id);
              }
            });
          });

          const modLists: SquareObject[] = [];
          if (referencedModListIds.size > 0) {
            console.log(`[Square Seeding] Fetching ${referencedModListIds.size} referenced modifier lists...`);
            const modListsRes = await fetch("https://connect.squareup.com/v2/catalog/list?types=MODIFIER_LIST", {
              headers: {
                Authorization: `Bearer ${prodToken}`,
                "Square-Version": "2024-03-20",
                "Content-Type": "application/json",
              },
            });
            if (modListsRes.ok) {
              const modListsData = (await modListsRes.json()) as { objects?: SquareObject[] };
              (modListsData.objects || []).forEach((modList) => {
                if (referencedModListIds.has(modList.id)) {
                  modLists.push(modList);
                }
              });
            }
          }

          modLists.forEach((ml) => {
            objects.push(mapModifierListToSandbox(ml));
          });

          prodItems.forEach((item) => {
            objects.push(mapItemToSandbox(item));
          });

          console.log(`[Square Seeding] Successfully mapped ${objects.length} objects from production.`);
        }
      }
    } catch (err) {
      console.error("[Square Seeding] Failed to read production catalog. Falling back to static seed...", err);
    }
  }

  if (objects.length === 0) {
    console.log("[Square Seeding] Seeding static fallback items...");
    objects = STATIC_SEED_ITEMS.map((item) => ({
      type: "ITEM",
      id: `#${item.squareId}`,
      item_data: {
        name: item.name,
        description: item.description,
        variations: [
          {
            type: "ITEM_VARIATION",
            id: `#${item.squareId}_var`,
            item_variation_data: {
              name: "Regular",
              pricing_type: "FIXED_PRICING",
              price_money: { amount: item.price, currency: "USD" },
            },
          },
        ],
      },
    }));
  }

  console.log(`[Square Seeding] Sending batch-upsert with ${objects.length} objects to Sandbox...`);
  const res = await fetch(`${sandboxBaseUrl}/v2/catalog/batch-upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-03-20",
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      batches: [{ objects }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Square catalog seed failed: ${await res.text()}`);
  }

  console.log("[Square Seeding] Sandbox seeded successfully.");
}
```

## File: modules/integrations/square-sync.helper.ts
```typescript
import { SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, SquareInventoryCount } from "./square-client.helper";

export { getSquareBaseUrl, getVariationAndLocationId } from "./square-client.helper";
export { seedSquareCatalog } from "./square-seed.helper";

export async function syncSquareCatalog(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  // 1. Fetch Catalog Items & Modifier Lists
  const listRes = await fetch(`${baseUrl}/v2/catalog/list?types=ITEM,MODIFIER_LIST`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) {
    throw new Error(`Square catalog list failed: ${await listRes.text()}`);
  }
  const listData = (await listRes.json()) as { objects?: any[] };
  const objects = listData.objects || [];

  const items = objects.filter((o) => o.type === "ITEM");
  const modifierLists = objects.filter((o) => o.type === "MODIFIER_LIST");

  // 2. Fetch Inventory Counts for Variation IDs
  const variationIds = items.flatMap((item) =>
    (item.item_data?.variations || []).map((v: any) => v.id)
  );
  const countsMap: Record<string, number> = {};

  if (variationIds.length > 0) {
    const countsRes = await fetch(`${baseUrl}/v2/inventory/batch-retrieve-counts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ catalog_object_ids: variationIds }),
    });
    if (countsRes.ok) {
      const countsData = (await countsRes.json()) as { counts?: SquareInventoryCount[] };
      (countsData.counts || []).forEach((c) => {
        countsMap[c.catalog_object_id] = parseInt(c.quantity || "0", 10);
      });
    }
  }

  // 3. Upsert Modifier Groups
  const modifierGroupsToUpsert = modifierLists.map((ml) => ({
    organization_id: orgId,
    pos_provider: "SQUARE",
    external_id: ml.id,
    name: ml.modifier_list_data?.name || "Unnamed Modifier Group",
    min_selected_modifiers: ml.modifier_list_data?.selection_type === "SINGLE" ? 1 : 0,
    max_selected_modifiers: ml.modifier_list_data?.selection_type === "SINGLE" ? 1 : 99,
    updated_at: new Date().toISOString(),
  }));

  if (modifierGroupsToUpsert.length > 0) {
    const { error: mgErr } = await supabaseClient
      .from("pos_modifier_groups")
      .upsert(modifierGroupsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (mgErr) {
      console.error(`Failed to upsert modifier groups: ${mgErr.message}`);
    }
  }

  // Fetch updated modifier groups to map external_id to local UUID
  const { data: dbModifierGroups } = await supabaseClient
    .from("pos_modifier_groups")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const mgMap = new Map((dbModifierGroups || []).map((g) => [g.external_id, g.id]));

  // 4. Upsert Modifier Options
  const modifierOptionsToUpsert: any[] = [];
  modifierLists.forEach((ml) => {
    const localGroupId = mgMap.get(ml.id);
    if (!localGroupId) return;

    const modifiers = ml.modifier_list_data?.modifiers || [];
    modifiers.forEach((m: any) => {
      const priceAmount = m.modifier_data?.price_money?.amount || 0;
      modifierOptionsToUpsert.push({
        organization_id: orgId,
        modifier_group_id: localGroupId,
        pos_provider: "SQUARE",
        external_id: m.id,
        name: m.modifier_data?.name || "Unnamed Option",
        price: priceAmount / 100,
        is_sold_out: false,
        updated_at: new Date().toISOString(),
      });
    });
  });

  if (modifierOptionsToUpsert.length > 0) {
    const { error: moErr } = await supabaseClient
      .from("pos_modifier_options")
      .upsert(modifierOptionsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (moErr) {
      console.error(`Failed to upsert modifier options: ${moErr.message}`);
    }
  }

  // 5. Upsert POS Items
  const posItemsToUpsert = items.map((item) => {
    const firstVariation = item.item_data?.variations?.[0];
    const variationId = firstVariation?.id || "";
    const priceAmount = firstVariation?.item_variation_data?.price_money?.amount || 0;
    const price = priceAmount / 100;
    const stockQuantity = countsMap[variationId] !== undefined ? countsMap[variationId] : 1;
    return {
      organization_id: orgId,
      pos_provider: "SQUARE",
      external_id: item.id,
      name: item.item_data?.name || "Unnamed Item",
      description: item.item_data?.description || null,
      price,
      image_url: null,
      is_sold_out: stockQuantity <= 0,
      updated_at: new Date().toISOString(),
    };
  });

  if (posItemsToUpsert.length > 0) {
    const { error: itemErr } = await supabaseClient
      .from("pos_items")
      .upsert(posItemsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (itemErr) {
      throw new Error(`Failed to upsert POS items: ${itemErr.message}`);
    }
  }

  // Fetch updated POS items to map external_id to local UUID
  const { data: dbPosItems } = await supabaseClient
    .from("pos_items")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const itemMap = new Map((dbPosItems || []).map((i) => [i.external_id, i.id]));

  // 6. Upsert POS Item Modifier Groups join table
  const itemModifierGroupsToUpsert: any[] = [];
  items.forEach((item) => {
    const localItemId = itemMap.get(item.id);
    if (!localItemId) return;

    const modifierInfo = item.item_data?.modifier_list_info || [];
    modifierInfo.forEach((info: any) => {
      const localGroupId = mgMap.get(info.modifier_list_id);
      if (localGroupId) {
        itemModifierGroupsToUpsert.push({
          pos_item_id: localItemId,
          modifier_group_id: localGroupId,
        });
      }
    });
  });

  if (itemModifierGroupsToUpsert.length > 0) {
    await supabaseClient
      .from("pos_item_modifier_groups")
      .upsert(itemModifierGroupsToUpsert, { onConflict: "pos_item_id,modifier_group_id" });
  }

  // 7. Sync Transactions / Orders
  await syncSquareTransactions(accessToken, orgId, supabaseClient, itemMap);
}

async function syncSquareTransactions(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient,
  itemMap: Map<string, string>
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  // Resolve active locations
  const locRes = await fetch(`${baseUrl}/v2/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!locRes.ok) return;
  const locData = (await locRes.json()) as { locations?: Array<{ id: string; status: string }> };
  const locationIds = (locData.locations || []).filter((l) => l.status === "ACTIVE").map((l) => l.id);

  if (locationIds.length === 0) return;

  // Search orders (last 30 days)
  const beginTime = new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString();
  const ordersRes = await fetch(`${baseUrl}/v2/orders/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location_ids: locationIds,
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: beginTime,
            },
          },
          state_filter: {
            states: ["COMPLETED"],
          },
        },
        sort: {
          sort_field: "CREATED_AT",
          sort_order: "DESC",
        },
      },
    }),
  });

  if (!ordersRes.ok) {
    console.error(`Square orders search failed: ${await ordersRes.text()}`);
    return;
  }

  const ordersData = (await ordersRes.json()) as { orders?: any[] };
  const orders = ordersData.orders || [];

  const transactionsToUpsert: any[] = [];

  orders.forEach((order) => {
    const lineItems = order.line_items || [];
    lineItems.forEach((line: any, idx: number) => {
      // Find corresponding pos_item
      const externalItemId = line.catalog_object_id;
      const posItemId = itemMap.get(externalItemId) || null;

      const grossRevenue = (line.gross_sales_money?.amount || 0) / 100;
      const discountAmount = (line.total_discount_money?.amount || 0) / 100;

      transactionsToUpsert.push({
        organization_id: orgId,
        pos_item_id: posItemId,
        quantity_sold: parseInt(line.quantity || "1", 10),
        gross_revenue: grossRevenue,
        discount_amount: discountAmount,
        transaction_time: order.closed_at || order.created_at || new Date().toISOString(),
        source: "square",
        external_transaction_id: `${order.id}_${line.uid || idx}`,
      });
    });
  });

  if (transactionsToUpsert.length > 0) {
    const { error: txnErr } = await supabaseClient
      .from("pos_transactions")
      .upsert(transactionsToUpsert, { onConflict: "external_transaction_id" });
    if (txnErr) {
      console.error(`Failed to sync transactions: ${txnErr.message}`);
    }
  }
}
```

## File: modules/integrations/webhooks.controller.ts
```typescript
import { Controller, Post, Headers, Req, HttpCode, HttpStatus, UnauthorizedException, Logger, NotFoundException, Param } from "@nestjs/common";
import { Request } from "express";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import * as crypto from "crypto";
import { config } from "@soustools/config";
import { supabase } from "../../lib/supabase";

interface WebhookPayload {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  created_at?: string;
  data?: {
    id: string;
    object: Record<string, unknown>;
  };
}

@Controller("integrations/webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(@InjectQueue("pos-sync") private readonly posSyncQueue: Queue) {}

  @Post(":provider")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param("provider") provider: string,
    @Headers("x-square-hmacsha256-signature") squareSignature: string,
    @Headers("x-square-signature") squareAltSignature: string,
    @Req() req: Request
  ): Promise<{ status: string }> {
    const signature = squareSignature || squareAltSignature;
    interface RequestWithRawBody extends Request {
      rawBody?: Buffer;
    }
    const rawReq = req as RequestWithRawBody;
    const rawBody = rawReq.rawBody ? rawReq.rawBody.toString("utf-8") : "";

    this.logger.log(`Received Webhook for provider: ${provider}`);

    if (provider.toLowerCase() === "square") {
      return this.handleSquare(signature, rawBody);
    } else {
      throw new NotFoundException(`Unsupported provider webhook: ${provider}`);
    }
  }

  private async handleSquare(signature: string, rawBody: string): Promise<{ status: string }> {
    const payload = JSON.parse(rawBody) as WebhookPayload;
    const eventId = payload.event_id;
    const merchantId = payload.merchant_id;

    if (!eventId) {
      throw new UnauthorizedException("Missing event_id in webhook payload");
    }

    // 1. Idempotency Check
    const { data: existingEvent } = await supabase
      .from("processed_webhook_events")
      .select("event_id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      this.logger.log(`Duplicate event detected. Event ID: ${eventId}. Returning 200 early.`);
      return { status: "duplicate_ignored" };
    }

    if (!merchantId) {
      throw new UnauthorizedException("Invalid Square webhook payload: missing merchant_id");
    }

    // Resolve organization associated with this Square Merchant
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("organization_id, settings")
      .eq("provider", "SQUARE")
      .eq("settings->>merchant_id", merchantId)
      .maybeSingle();

    if (error || !integration) {
      this.logger.warn(`No integration found for Square merchant ID ${merchantId}`);
      throw new NotFoundException(`No integration found for merchant: ${merchantId}`);
    }

    const orgId = integration.organization_id;
    const settings = (integration.settings || {}) as Record<string, any>;
    
    // Verify signature strictly if key is configured, fallback to tenant's key
    const signatureKey = settings.webhook_signature_key || config.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const notificationUrl = `${config.API_BASE_URL}/integrations/webhooks/square`;

    if (!config.IS_MOCK_ENV && signatureKey) {
      if (!signature) {
        throw new UnauthorizedException("Missing Square signature header");
      }
      const hash = crypto
        .createHmac("sha256", signatureKey)
        .update(notificationUrl + rawBody)
        .digest("base64");
      
      if (hash !== signature) {
        this.logger.warn(`Signature mismatch. Computed: ${hash}, received: ${signature}`);
        throw new UnauthorizedException("Invalid webhook signature");
      }
    }

    // 2. Persist event ID for idempotency before processing
    await supabase
      .from("processed_webhook_events")
      .insert({ event_id: eventId, provider: "SQUARE" });

    // Queue catalog/inventory sync
    this.logger.log(`Queueing pos-sync job for organization ${orgId}`);
    await this.posSyncQueue.add("pos-sync-job", {
      orgId,
      type: "webhook-inventory",
      payload: payload.data as unknown as Record<string, unknown>
    });

    return { status: "queued" };
  }
}
```

## File: modules/items/inventory.controller.ts
```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService, AdjustStockDto } from './inventory.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller('inventory')
export class InventoryController {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  constructor(private readonly service: InventoryService) {}

  @Get()
  async getCurrentStock(): Promise<ApiResponse<unknown[]>> {
    try {
      const data = await this.service.getCurrentStock(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('adjust')
  async adjustStock(
    @Body() body: Omit<AdjustStockDto, 'orgId'>
  ): Promise<ApiResponse<void>> {
    try {
      await this.service.adjustStock({
        orgId: this.defaultOrgId,
        ...body,
      });
      return { success: true, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/inventory.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface AdjustStockDto {
  orgId: string;
  itemId: string;
  quantityG: number;
  lotNumber?: string;
  lotExpiry?: string;
  location?: string;
}

export interface StockRow {
  id: string;
  itemId: string;
  itemName: string;
  quantityG: number;
  lotNumber: string | null;
  lotExpiry: string | null;
  location: string | null;
  daysUntilExpiry: number | null;
  currentCostPerG: number | null;
  purchaseUnit: string;
  eachWeightG: number | null;
}

@Injectable()
export class InventoryService {
  async getCurrentStock(orgId: string): Promise<StockRow[]> {
    const { data, error } = await supabase
      .from('inventory_on_hand')
      .select(`
        id,
        item_id,
        quantity_g,
        lot_number,
        lot_expiry,
        location,
        items (
          name,
          shelf_life_days,
          each_weight_g,
          purchase_unit,
          current_cost_per_g
        )
      `)
      .eq('organization_id', orgId);

    if (error) {
      throw new Error(error.message);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stocks: StockRow[] = (data || []).map((row: any) => {
      let daysUntilExpiry: number | null = null;
      if (row.lot_expiry) {
        const expiry = new Date(row.lot_expiry);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        id: row.id,
        itemId: row.item_id,
        itemName: row.items?.name || 'Unknown',
        quantityG: row.quantity_g,
        lotNumber: row.lot_number,
        lotExpiry: row.lot_expiry,
        location: row.location,
        daysUntilExpiry,
        currentCostPerG: row.items?.current_cost_per_g || null,
        purchaseUnit: row.items?.purchase_unit || 'LB',
        eachWeightG: row.items?.each_weight_g || null,
      };
    });

    return stocks.sort((a, b) => {
      if (a.lotExpiry && !b.lotExpiry) return -1;
      if (!a.lotExpiry && b.lotExpiry) return 1;
      if (a.lotExpiry && b.lotExpiry) {
        const ad = new Date(a.lotExpiry).getTime();
        const bd = new Date(b.lotExpiry).getTime();
        if (ad !== bd) return ad - bd;
      }
      return a.itemName.localeCompare(b.itemName);
    });
  }

  async adjustStock(dto: AdjustStockDto): Promise<void> {
    const lotNum = dto.lotNumber || 'default';
    const { error } = await supabase
      .from('inventory_on_hand')
      .upsert({
        organization_id: dto.orgId,
        item_id: dto.itemId,
        quantity_g: dto.quantityG,
        lot_number: lotNum,
        lot_expiry: dto.lotExpiry || null,
        location: dto.location || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id,item_id,lot_number',
      });

    if (error) {
      throw new Error(error.message);
    }
  }
}
```

## File: modules/items/items.controller.ts
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ItemsService, CreateItemDto, UpdateItemDto } from './items.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller('items')
export class ItemsController {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  constructor(private readonly service: ItemsService) {}

  @Get()
  async findAll(@Query('search') search?: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.findAll(this.defaultOrgId, search);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.findOne(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(@Body() dto: CreateItemDto): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.create(this.defaultOrgId, dto);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateItemDto
  ): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.update(id, dto);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.service.remove(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/items.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PriceHistoryController } from './price-history.controller';
import { PriceHistoryService } from './price-history.service';
import { WastageController } from './wastage.controller';
import { WastageService } from './wastage.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { WhiteboardController } from './whiteboard.controller';
import { WhiteboardService } from './whiteboard.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  controllers: [
    ItemsController,
    PriceHistoryController,
    WastageController,
    InventoryController,
    VendorsController,
    WhiteboardController,
    PurchaseOrdersController,
  ],
  providers: [
    ItemsService,
    PriceHistoryService,
    WastageService,
    InventoryService,
    VendorsService,
    WhiteboardService,
    PurchaseOrdersService,
  ],
  exports: [
    ItemsService,
    PriceHistoryService,
    WastageService,
    InventoryService,
    VendorsService,
    WhiteboardService,
    PurchaseOrdersService,
  ],
})
export class ItemsModule {}
```

## File: modules/items/items.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreateItemDto {
  name: string;
  category?: string;
  purchase_unit?: string;
  units_per_case?: number;
  each_weight_g?: number;
  density_g_ml?: number;
  shelf_life_days?: number;
  allergens?: string[];
  is_animal_product?: boolean;
  is_meat?: boolean;
  is_seafood?: boolean;
  is_dairy?: boolean;
  is_egg?: boolean;
  is_gluten_source?: boolean;
  fdc_id?: number;
  nutrition_macros?: Record<string, unknown>;
}

export type UpdateItemDto = Partial<CreateItemDto>;

@Injectable()
export class ItemsService {
  async findAll(orgId: string, search?: string): Promise<Record<string, unknown>[]> {
    let q = supabase
      .from('items')
      .select('*')
      .eq('organization_id', orgId);

    if (search) {
      q = q.ilike('name', `%${search}%`);
    }

    const { data, error } = await q.order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(error?.message || `Item with ID ${id} not found`);
    }
    return data;
  }

  async create(orgId: string, dto: CreateItemDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          organization_id: orgId,
          name: dto.name,
          category: dto.category || 'INGREDIENT',
          purchase_unit: dto.purchase_unit || 'LB',
          units_per_case: dto.units_per_case,
          each_weight_g: dto.each_weight_g,
          density_g_ml: dto.density_g_ml ?? 1.0,
          shelf_life_days: dto.shelf_life_days,
          allergens: dto.allergens || [],
          is_animal_product: dto.is_animal_product ?? false,
          is_meat: dto.is_meat ?? false,
          is_seafood: dto.is_seafood ?? false,
          is_dairy: dto.is_dairy ?? false,
          is_egg: dto.is_egg ?? false,
          is_gluten_source: dto.is_gluten_source ?? false,
          fdc_id: dto.fdc_id,
          nutrition_macros: dto.nutrition_macros || {},
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, dto: UpdateItemDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
```

## File: modules/items/price-history.controller.ts
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PriceHistoryService, RecordPriceDto } from './price-history.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller('items')
export class PriceHistoryController {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  constructor(private readonly service: PriceHistoryService) {}

  @Post(':id/price')
  async recordPrice(
    @Param('id') id: string,
    @Body() body: Omit<RecordPriceDto, 'itemId' | 'orgId'>
  ): Promise<ApiResponse<void>> {
    try {
      await this.service.recordPrice({
        itemId: id,
        orgId: this.defaultOrgId,
        ...body,
      });
      return { success: true, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':id/price-history')
  async getHistory(@Param('id') id: string): Promise<ApiResponse<unknown[]>> {
    try {
      const data = await this.service.getHistory(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/price-history.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface RecordPriceDto {
  itemId: string;
  orgId: string;
  purchaseUnit: string;
  unitCost: number;
  vendorId?: string;
  purchaseOrderId?: string;
  effectiveDate?: string;
  note?: string;
}

@Injectable()
export class PriceHistoryService {
  async recordPrice(dto: RecordPriceDto): Promise<void> {
    const { error } = await supabase
      .from('price_history')
      .insert([
        {
          item_id: dto.itemId,
          organization_id: dto.orgId,
          purchase_unit: dto.purchaseUnit,
          unit_cost: dto.unitCost,
          vendor_id: dto.vendorId || null,
          purchase_order_id: dto.purchaseOrderId || null,
          effective_date: dto.effectiveDate || new Date().toISOString().split('T')[0],
          note: dto.note || null,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getHistory(itemId: string): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('item_id', itemId)
      .order('effective_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }
}
```

## File: modules/items/purchase-orders.controller.ts
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { PurchaseOrdersService, CreatePurchaseOrderDto } from './purchase-orders.service';
import { ApiResponse } from './inventory.controller';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post()
  async create(@Body() body: CreatePurchaseOrderDto): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.createPo(body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/purchase-orders.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreatePurchaseOrderDto {
  vendor_id: string;
  items: {
    whiteboard_id: string;
    raw_name: string;
    ordered_qty: number;
    price_per_unit: number;
  }[];
}

@Injectable()
export class PurchaseOrdersService {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  async createPo(dto: CreatePurchaseOrderDto): Promise<Record<string, unknown>> {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();
      
    const orgId = orgData?.id || this.defaultOrgId;

    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .insert([
        {
          organization_id: orgId,
          vendor_id: dto.vendor_id,
          status: 'DRAFT',
        },
      ])
      .select()
      .single();

    if (poErr) {
      throw new Error(poErr.message);
    }

    const itemsToInsert = dto.items.map((i) => ({
      po_id: po.id,
      raw_name: i.raw_name,
      ordered_qty: i.ordered_qty,
      price_per_unit: i.price_per_unit,
    }));

    const { error: itemsErr } = await supabase
      .from('purchase_order_items')
      .insert(itemsToInsert);

    if (itemsErr) {
      throw new Error(itemsErr.message);
    }

    // Mark whiteboard items as inactive
    for (const item of dto.items) {
      await supabase
        .from('whiteboard_items')
        .update({ is_active: false })
        .eq('id', item.whiteboard_id);
    }

    return po;
  }
}
```

## File: modules/items/vendors.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { VendorsService, CreateVendorDto, UpdateVendorDto } from './vendors.service';
import { ApiResponse } from './inventory.controller';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly service: VendorsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const data = await this.service.findAll();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.findOne(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(@Body() body: CreateVendorDto): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.create(body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateVendorDto
  ): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.update(id, body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.remove(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/vendors.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreateVendorDto {
  name: string;
  order_days?: string[];
  order_method?: 'EMAIL' | 'SMS' | 'MANUAL' | '';
  email?: string | null;
  phone?: string | null;
}

export type UpdateVendorDto = Partial<CreateVendorDto>;

@Injectable()
export class VendorsService {
  async findAll(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(error?.message || `Vendor with ID ${id} not found`);
    }
    return data;
  }

  async create(dto: CreateVendorDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .insert([
        {
          name: dto.name,
          order_days: dto.order_days || [],
          order_method: dto.order_method || null,
          email: dto.email || null,
          phone: dto.phone || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, dto: UpdateVendorDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...dto,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
```

## File: modules/items/wastage.controller.ts
```typescript
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WastageService, RecordWastageDto } from './wastage.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller('wastage')
export class WastageController {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  constructor(private readonly service: WastageService) {}

  @Post()
  async recordWastage(
    @Body() body: Omit<RecordWastageDto, 'orgId'>
  ): Promise<ApiResponse<void>> {
    try {
      await this.service.recordWastage({
        orgId: this.defaultOrgId,
        ...body,
      });
      return { success: true, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('report')
  async getWastageReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<ApiResponse<unknown[]>> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();
      const data = await this.service.getWastageReport(this.defaultOrgId, start, end);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/wastage.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface RecordWastageDto {
  orgId: string;
  itemId: string;
  amountG: number;
  reason?: string;
  recordedBy?: string;
}

export interface WastageReportRow {
  id: string;
  itemId: string;
  itemName: string;
  amountG: number;
  reason: string | null;
  recordedAt: string;
}

@Injectable()
export class WastageService {
  async recordWastage(dto: RecordWastageDto): Promise<void> {
    const { error } = await supabase
      .from('wastage_ledger')
      .insert([
        {
          organization_id: dto.orgId,
          item_id: dto.itemId,
          amount_g: dto.amountG,
          reason: dto.reason || 'OTHER',
          recorded_by: dto.recordedBy || null,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getWastageReport(
    orgId: string,
    startDate: string,
    endDate: string
  ): Promise<WastageReportRow[]> {
    const { data, error } = await supabase
      .from('wastage_ledger')
      .select('id, item_id, amount_g, reason, recorded_at, items (name)')
      .eq('organization_id', orgId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      itemId: row.item_id,
      itemName: row.items?.name || 'Unknown',
      amountG: row.amount_g,
      reason: row.reason,
      recordedAt: row.recorded_at,
    }));
  }
}
```

## File: modules/items/whiteboard.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WhiteboardService, CreateWhiteboardItemDto } from './whiteboard.service';
import { ApiResponse } from './inventory.controller';

@Controller('whiteboard')
export class WhiteboardController {
  constructor(private readonly service: WhiteboardService) {}

  @Get()
  async findAllActive(): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const data = await this.service.findAllActive();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(@Body() body: CreateWhiteboardItemDto): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.create(body);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const data = await this.service.remove(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/items/whiteboard.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreateWhiteboardItemDto {
  raw_name: string;
}

@Injectable()
export class WhiteboardService {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  async findAllActive(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('whiteboard_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async create(dto: CreateWhiteboardItemDto): Promise<Record<string, unknown>> {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();
      
    const orgId = orgData?.id || this.defaultOrgId;

    const { data, error } = await supabase
      .from('whiteboard_items')
      .insert([
        {
          organization_id: orgId,
          raw_name: dto.raw_name,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('whiteboard_items')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
```

## File: modules/metrics/metrics.controller.ts
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../lib/supabase-auth.guard';

@Controller('metrics')
@UseGuards(SupabaseAuthGuard)
export class MetricsController {
  
  @Get('sales')
  getSales() {
    return { value: "Sales: $1.2k" };
  }

  @Get('ticket-time')
  getTicketTime() {
    return { value: "Avg: 4m 12s" };
  }

  @Get('low-stock')
  getLowStock() {
    return { value: "3 Items Low" };
  }
}
```

## File: modules/metrics/metrics.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [],
})
export class MetricsModule {}
```

## File: modules/nutrition/dietary-classifier.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MasterIngredient } from '@soustools/api-types';

@Injectable()
export class DietaryClassifierService {
  private readonly logger = new Logger(DietaryClassifierService.name);

  classifyRecipe(ingredients: MasterIngredient[], perServingMacros: Record<string, any>): Record<string, boolean> {
    this.logger.debug(`Classifying recipe with ${ingredients.length} ingredients`);

    const hasAnimalProduct = ingredients.some(i => i.isAnimalProduct);
    const hasMeat = ingredients.some(i => i.isMeat);
    const hasSeafood = ingredients.some(i => i.isSeafood);
    const hasDairy = ingredients.some(i => i.isDairy);
    const hasEgg = ingredients.some(i => i.isEgg);
    const hasGlutenSource = ingredients.some(i => i.isGlutenSource);
    const hasTreeNuts = ingredients.some(i => i.allergens?.includes('tree_nuts'));
    const hasPeanuts = ingredients.some(i => i.allergens?.includes('peanuts'));

    // Keto rule: net carbs <= 20g
    const totalCarbs = perServingMacros['total_carbohydrate_g'] || 0;
    const fiber = perServingMacros['dietary_fiber_g'] || 0;
    const netCarbs = totalCarbs - fiber;
    
    const sodiumMg = perServingMacros['sodium_mg'] || 0;
    const proteinG = perServingMacros['protein_g'] || 0;

    return {
      vegan: !hasAnimalProduct,
      vegetarian: !hasMeat && !hasSeafood,
      pescetarian: !hasMeat,
      keto: netCarbs <= 20,
      gluten_free: !hasGlutenSource,
      dairy_free: !hasDairy,
      egg_free: !hasEgg,
      nut_free: !hasTreeNuts && !hasPeanuts,
      low_sodium: sodiumMg <= 140, // FDA definition
      high_protein: proteinG >= 10
    };
  }
}
```

## File: modules/nutrition/label-renderer.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RecipeNutritionCache } from '@soustools/api-types';

@Injectable()
export class LabelRendererService {
  private readonly logger = new Logger(LabelRendererService.name);

  async renderSvg(cache: RecipeNutritionCache): Promise<string> {
    this.logger.debug(`Rendering FDA label for recipe ${cache.recipeId}`);

    const n = cache.perServingNutrition;
    const s = cache.servings;

    // FDA Standard Formatting logic (simplified SVG string)
    const svg = `
      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg" style="font-family: Arial, sans-serif; background-color: white;">
        <rect width="100%" height="100%" fill="white" />
        <rect x="10" y="10" width="280" height="380" fill="none" stroke="black" stroke-width="2" />
        <text x="20" y="40" font-size="28" font-weight="900" fill="black">Nutrition Facts</text>
        <line x1="15" y1="50" x2="285" y2="50" stroke="black" stroke-width="8" />
        
        <text x="20" y="70" font-size="14" fill="black">${s} servings per container</text>
        <text x="20" y="90" font-size="14" font-weight="bold" fill="black">Serving size</text>
        <text x="280" y="90" font-size="14" font-weight="bold" text-anchor="end" fill="black">1 serving</text>
        <line x1="15" y1="100" x2="285" y2="100" stroke="black" stroke-width="4" />
        
        <text x="20" y="120" font-size="12" font-weight="bold" fill="black">Amount per serving</text>
        <text x="20" y="150" font-size="28" font-weight="900" fill="black">Calories</text>
        <text x="280" y="150" font-size="28" font-weight="900" text-anchor="end" fill="black">${Math.round(n.calories || 0)}</text>
        <line x1="15" y1="160" x2="285" y2="160" stroke="black" stroke-width="4" />
        
        <text x="280" y="175" font-size="12" font-weight="bold" text-anchor="end" fill="black">% Daily Value*</text>
        
        <!-- Total Fat -->
        <text x="20" y="195" font-size="12" font-weight="bold" fill="black">Total Fat ${Math.round(n.total_fat_g || 0)}g</text>
        <line x1="15" y1="205" x2="285" y2="205" stroke="black" stroke-width="1" />
        
        <!-- Cholesterol -->
        <text x="20" y="220" font-size="12" font-weight="bold" fill="black">Cholesterol ${Math.round(n.cholesterol_mg || 0)}mg</text>
        <line x1="15" y1="230" x2="285" y2="230" stroke="black" stroke-width="1" />
        
        <!-- Sodium -->
        <text x="20" y="245" font-size="12" font-weight="bold" fill="black">Sodium ${Math.round(n.sodium_mg || 0)}mg</text>
        <line x1="15" y1="255" x2="285" y2="255" stroke="black" stroke-width="1" />
        
        <!-- Total Carbs -->
        <text x="20" y="270" font-size="12" font-weight="bold" fill="black">Total Carbohydrate ${Math.round(n.total_carbohydrate_g || 0)}g</text>
        <line x1="15" y1="280" x2="285" y2="280" stroke="black" stroke-width="1" />
        
        <!-- Protein -->
        <text x="20" y="295" font-size="12" font-weight="bold" fill="black">Protein ${Math.round(n.protein_g || 0)}g</text>
        <line x1="15" y1="305" x2="285" y2="305" stroke="black" stroke-width="4" />
        
        <text x="20" y="325" font-size="10" fill="black">* The % Daily Value (DV) tells you how much a nutrient in</text>
        <text x="20" y="340" font-size="10" fill="black">a serving of food contributes to a daily diet.</text>
      </svg>
    `;

    return svg;
  }
}
```

## File: modules/nutrition/nutrition.controller.ts
```typescript
import {
  Controller,
  Get,
  Param,
  Query,
  Header,
  NotFoundException,
} from "@nestjs/common";
import { NutritionService } from "./nutrition.service";
import { LabelRendererService } from "./label-renderer.service";
import { UsdaResolverService } from "./usda-resolver.service";
import { createAdminClient } from "@soustools/supabase";
// import { Recipe } from "@soustools/api-types";

@Controller("recipes")
export class NutritionController {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly labelRenderer: LabelRendererService,
    private readonly usdaResolver: UsdaResolverService,
  ) {}

  @Get(":id/nutrition-label")
  @Header("Content-Type", "image/svg+xml")
  async getNutritionLabel(
    @Param("id") recipeId: string,
    @Query("format") format: "svg" | "png" | "pdf" = "svg",
    // @Query("servings") servings?: string,
  ): Promise<string> {
    const supabase = createAdminClient();

    // Try to get from cache first
    let { data: cache } = await supabase
      .from("recipe_nutrition_cache")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();

    // If no cache, compute it on the fly
    if (!cache || !cache.computed_at) {
      // Get full recipe
      const { data: recipeData } = await supabase
        .from("recipes")
        .select(
          `
          *,
          recipe_ingredients(
            amount,
            unit,
            master_ingredient:master_ingredients(
              id,
              name,
              nutrition_macros,
              allergens,
              is_animal_product,
              is_meat,
              is_seafood,
              is_dairy,
              is_egg,
              is_gluten_source
            )
          )
        `,
        )
        .eq("id", recipeId)
        .single();

      if (!recipeData) {
        throw new NotFoundException(`Recipe ${recipeId} not found`);
      }

      // Compute nutrition
      const computedCache =
        await this.nutritionService.aggregateRecipeNutrition(recipeData as any);

      // Save cache asynchronously (don't block response)
      supabase
        .from("recipe_nutrition_cache")
        .upsert(computedCache as any)
        .then();

      cache = computedCache as any;
    }

    if (format === "svg") {
      return this.labelRenderer.renderSvg(cache as any);
    } else {
      throw new Error(`Format ${format} not supported yet in renderer`);
    }
  }

  @Get(":id/nutrition")
  async getNutrition(@Param("id") recipeId: string): Promise<any> {
    const supabase = createAdminClient();

    // Try to get from cache first
    let { data: cache } = await supabase
      .from("recipe_nutrition_cache")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();

    // If no cache, compute it on the fly
    if (!cache || !cache.computed_at) {
      const { data: recipeData } = await supabase
        .from("recipes")
        .select(
          `
          *,
          recipe_ingredients(
            amount,
            unit,
            master_ingredient:master_ingredients(
              id,
              name,
              nutrition_macros,
              allergens,
              is_animal_product,
              is_meat,
              is_seafood,
              is_dairy,
              is_egg,
              is_gluten_source
            )
          )
        `,
        )
        .eq("id", recipeId)
        .single();

      if (!recipeData) {
        throw new NotFoundException(`Recipe ${recipeId} not found`);
      }

      const computedCache =
        await this.nutritionService.aggregateRecipeNutrition(recipeData as any);
      supabase
        .from("recipe_nutrition_cache")
        .upsert(computedCache as any)
        .then();

      cache = computedCache as any;
    }

    // Map DB snake_case structure back to camelCase properties for frontend if needed,
    // or just return the object.
    return {
      success: true,
      data: {
        recipeId: cache.recipe_id || cache.recipeId,
        servings: Number(cache.servings),
        perServingNutrition:
          cache.per_serving_nutrition || cache.perServingNutrition,
        per100gNutrition: cache.per_100g_nutrition || cache.per100gNutrition,
        dietaryFlags: cache.dietary_flags || cache.dietaryFlags,
        computedAt: cache.computed_at || cache.computedAt,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get("usda/search")
  async searchUsda(@Query("query") query: string): Promise<any> {
    if (!query) throw new Error("Query is required");
    const result = await this.usdaResolver.resolveIngredient(query); 
    return { success: true, data: result };
  }
}
```

## File: modules/nutrition/nutrition.module.ts
```typescript
import { Module } from "@nestjs/common";
import { NutritionController } from "./nutrition.controller";
import { NutritionService } from "./nutrition.service";
import { DietaryClassifierService } from "./dietary-classifier.service";
import { UsdaResolverService } from "./usda-resolver.service";
import { LabelRendererService } from "./label-renderer.service";
// import { SupabaseModule } from '@soustools/supabase';

@Module({
  // imports: [SupabaseModule],
  controllers: [NutritionController],
  providers: [
    NutritionService,
    DietaryClassifierService,
    UsdaResolverService,
    LabelRendererService,
  ],
  exports: [NutritionService],
})
export class NutritionModule {}
```

## File: modules/nutrition/nutrition.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { DietaryClassifierService } from './dietary-classifier.service';
import { UsdaResolverService } from './usda-resolver.service';
import { Recipe, MasterIngredient, RecipeNutritionCache } from '@soustools/api-types';

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(
    private readonly dietaryClassifier: DietaryClassifierService,
    private readonly usdaResolver: UsdaResolverService,
  ) {}

  async aggregateRecipeNutrition(recipe: Recipe): Promise<RecipeNutritionCache> {
    this.logger.debug(`Aggregating nutrition for recipe ${recipe.id}`);

    const ingredients = recipe.recipeIngredients?.map(ri => ri.masterIngredient).filter(Boolean) as MasterIngredient[] || [];
    
    // Simple aggregation assuming per 100g is normalized
    let totalWeightG = 0;
    const totals: Record<string, number> = {};

    for (const ri of recipe.recipeIngredients || []) {
      if (!ri.masterIngredient) continue;
      
      const amountG = ri.amount; // Simplify: assuming amount is in grams for this logic
      totalWeightG += amountG;

      const macros = ri.masterIngredient.nutritionMacros as Record<string, any>;
      if (!macros) continue;

      const multiplier = amountG / 100;
      for (const [key, value] of Object.entries(macros)) {
        if (typeof value === 'number') {
          totals[key] = (totals[key] || 0) + (value * multiplier);
        }
      }
    }

    const servings = recipe.yieldCount || 1;
    const perServingNutrition: Record<string, any> = {};
    const per100gNutrition: Record<string, any> = {};

    for (const [key, value] of Object.entries(totals)) {
      perServingNutrition[key] = value / servings;
      per100gNutrition[key] = totalWeightG > 0 ? (value / totalWeightG) * 100 : 0;
    }

    const dietaryFlags = this.dietaryClassifier.classifyRecipe(ingredients, perServingNutrition);

    return {
      recipeId: recipe.id,
      servings,
      perServingNutrition,
      per100gNutrition,
      dietaryFlags,
      computedAt: new Date().toISOString()
    };
  }

  async resolveAndSaveIngredientNutrition(ingredientQuery: string): Promise<any> {
    return this.usdaResolver.resolveIngredient(ingredientQuery);
  }
}
```

## File: modules/nutrition/usda-resolver.service.ts
```typescript
import { Injectable, Logger } from "@nestjs/common";
import { config } from "@soustools/config";

@Injectable()
export class UsdaResolverService {
  private readonly logger = new Logger(UsdaResolverService.name);
  private readonly baseUrl = "https://api.nal.usda.gov/fdc/v1";
  private readonly apiKey = config.USDA_FDC_API_KEY;

  async resolveIngredient(query: string): Promise<any> {
    try {
      this.logger.log(`Resolving nutrition for query: ${query}`);
      const url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`USDA API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.foods || data.foods.length === 0) {
        this.logger.warn(`No USDA match found for: ${query}`);
        return null;
      }

      const bestMatch = data.foods[0];
      return this.mapUsdaToMacros(bestMatch);
    } catch (error) {
      this.logger.error(`Failed to resolve USDA nutrition: ${error}`);
      return null;
    }
  }

  private mapUsdaToMacros(foodItem: any): Record<string, any> {
    // 1008 = Calories, 1003 = Protein, 1004 = Total lipid (fat), 1005 = Carbohydrate
    // Using NAL IDs.
    const nutrients = foodItem.foodNutrients || [];
    const getNutrient = (id: number) =>
      nutrients.find((n: any) => n.nutrientId === id)?.value || 0;

    return {
      serving_size_g: 100, // USDA FDC responses are generally per 100g
      calories: getNutrient(1008),
      total_fat_g: getNutrient(1004),
      saturated_fat_g: getNutrient(1258),
      trans_fat_g: getNutrient(1257),
      cholesterol_mg: getNutrient(1253),
      sodium_mg: getNutrient(1093),
      total_carbohydrate_g: getNutrient(1005),
      dietary_fiber_g: getNutrient(1079),
      total_sugars_g: getNutrient(2000),
      added_sugars_g: getNutrient(1235),
      protein_g: getNutrient(1003),
      vitamin_d_mcg: getNutrient(1114),
      calcium_mg: getNutrient(1087),
      iron_mg: getNutrient(1089),
      potassium_mg: getNutrient(1092),
      fdc_id: foodItem.fdcId,
      fdc_food_name: foodItem.description,
      verified: true,
    };
  }
}
```

## File: modules/pos/pos-links.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface LinkRecipeDto {
  orgId: string;
  posItemId: string;
  recipeId: string;
  portionFraction?: number;
}

@Injectable()
export class PosLinksService {
  async linkRecipeToItem(dto: LinkRecipeDto): Promise<void> {
    const { error } = await supabase
      .from('pos_item_recipe_links')
      .upsert({
        organization_id: dto.orgId,
        pos_item_id: dto.posItemId,
        recipe_id: dto.recipeId,
        portion_fraction: dto.portionFraction ?? 1.0,
      }, {
        onConflict: 'pos_item_id,recipe_id',
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getLinksForPosItem(posItemId: string): Promise<{ recipeId: string; portionFraction: number }[]> {
    const { data, error } = await supabase
      .from('pos_item_recipe_links')
      .select('recipe_id, portion_fraction')
      .eq('pos_item_id', posItemId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      recipeId: row.recipe_id,
      portionFraction: Number(row.portion_fraction) || 1.0,
    }));
  }
}
```

## File: modules/pos/pos-transactions.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface RecordTransactionDto {
  orgId: string;
  posItemId?: string;
  quantitySold: number;
  grossRevenue: number;
  transactionTime: string;
  source?: string;
  externalTransactionId?: string;
}

export interface VelocityRow {
  posItemId: string;
  units: number;
  revenue: number;
}

@Injectable()
export class PosTransactionsService {
  async recordTransaction(dto: RecordTransactionDto): Promise<void> {
    const { error } = await supabase
      .from('pos_transactions')
      .insert([
        {
          organization_id: dto.orgId,
          pos_item_id: dto.posItemId || null,
          quantity_sold: dto.quantitySold,
          gross_revenue: dto.grossRevenue,
          transaction_time: dto.transactionTime,
          source: dto.source || 'square',
          external_transaction_id: dto.externalTransactionId || null,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getSalesVelocity(orgId: string, days: 7 | 30): Promise<VelocityRow[]> {
    const tableName = days === 7 ? 'sales_velocity_7d' : 'sales_velocity_30d';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('organization_id', orgId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      posItemId: row.pos_item_id,
      units: Number(days === 7 ? row.units_7d : row.units_30d) || 0,
      revenue: Number(days === 7 ? row.revenue_7d : row.revenue_30d) || 0,
    }));
  }
}
```

## File: modules/pos/pos.module.ts
```typescript
import { Module } from '@nestjs/common';
import { PosTransactionsService } from './pos-transactions.service';
import { PosLinksService } from './pos-links.service';

@Module({
  providers: [PosTransactionsService, PosLinksService],
  exports: [PosTransactionsService, PosLinksService],
})
export class PosModule {}
```

## File: modules/pos-simulator/pos-simulator.controller.ts
```typescript
import { Controller, Get, Post, Body, Query, NotFoundException } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "../signage/signage.gateway";
import { ApiResponse } from "@soustools/api-types";
import { runControllerAction } from "../signage/response.helper";
import { getMockItems, handleSquareStockToggle, resolveItemDetails } from "./pos-simulator.helpers";

/**
 * Controller simulating Point of Sale (POS) updates from Square.
 */
@Controller("pos-simulator")
export class PosSimulatorController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly gateway: SignageGateway) {}

  @Get("items")
  async getItems(@Query("organizationId") organizationId?: string): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(async () => {
      const orgId = organizationId || this.defaultOrgId;
      const { data, error } = await supabase
        .from("pos_items")
        .select("*")
        .eq("organization_id", orgId)
        .eq("pos_provider", "SQUARE");

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    });
  }

  @Post("seed")
  async seedItems(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(async () => {
      const mockItems = getMockItems(this.defaultOrgId);

      const { data, error } = await supabase
        .from("pos_items")
        .upsert(mockItems, { onConflict: "organization_id,pos_provider,external_id" })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    });
  }

  @Post("items/toggle-sold-out")
  async toggleSoldOut(
    @Body("itemId") itemId?: string,
    @Body("squareId") squareId?: string,
    @Body("isSoldOut") isSoldOut?: boolean,
    @Body("quantity") quantity?: number,
    @Body("unlimited") unlimited?: boolean,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(async () => {
      if (isSoldOut === undefined) {
        throw new Error("isSoldOut parameter is required");
      }

      const { orgId, targetSquareId } = await resolveItemDetails(supabase, itemId, squareId, this.defaultOrgId);

      const { data: integration } = await supabase
        .from("integrations")
        .select("access_token")
        .eq("organization_id", orgId)
        .eq("provider", "SQUARE")
        .maybeSingle();

      if (integration && targetSquareId) {
        await handleSquareStockToggle(targetSquareId, isSoldOut, integration.access_token, quantity, unlimited);
      }

      let query = supabase
        .from("pos_items")
        .update({
          is_sold_out: isSoldOut,
          updated_at: new Date().toISOString(),
        });

      if (itemId) {
        query = query.eq("id", itemId);
      } else if (targetSquareId) {
        query = query.eq("external_id", targetSquareId).eq("pos_provider", "SQUARE");
      } else {
        throw new Error("Either itemId or squareId is required");
      }

      const { data, error } = await query.select().single();

      if (error || !data) {
        throw new NotFoundException(error?.message || "Item not found");
      }

      // Broadcast updated config and items list to all decks (players will hot-swap in real-time)
      const { data: decks } = await supabase
        .from("signage_decks")
        .select("id, config")
        .eq("organization_id", orgId);

      const { data: allItems } = await supabase
        .from("pos_items")
        .select("*")
        .eq("organization_id", orgId)
        .eq("pos_provider", "SQUARE");

      if (decks) {
        for (const deck of decks) {
          this.gateway.broadcastDeckUpdate(
            deck.id as string,
            deck.config as Parameters<typeof this.gateway.broadcastDeckUpdate>[1],
          );
          this.gateway.broadcastItemsUpdate(
            deck.id as string,
            allItems || [],
          );
        }
      }

      return data;
    });
  }
}
```

## File: modules/pos-simulator/pos-simulator.helpers.ts
```typescript
import { SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, getVariationAndLocationId } from "../integrations/square-sync.helper";

export { getMockItems } from "./pos-simulator.mock";
export type { MockPosItem } from "./pos-simulator.mock";

/**
 * Resolves organization ID and Square ID from optional input IDs.
 */
export async function resolveItemDetails(
  supabaseClient: SupabaseClient,
  itemId?: string,
  squareId?: string,
  defaultOrgId: string = "d0000000-0000-0000-0000-000000000000"
): Promise<{ orgId: string; targetSquareId?: string }> {
  let targetSquareId = squareId;
  let orgId = defaultOrgId;
  if (itemId) {
    const { data } = await supabaseClient.from("pos_items").select("organization_id, external_id").eq("id", itemId).single();
    if (data) { orgId = data.organization_id; targetSquareId = data.external_id || undefined; }
  }
  if (!orgId && targetSquareId) {
    const { data } = await supabaseClient.from("pos_items").select("organization_id").eq("external_id", targetSquareId).eq("pos_provider", "SQUARE").single();
    if (data) orgId = data.organization_id;
  }
  return { orgId, targetSquareId };
}


/**
 * Communicates with Square Catalog & Inventory APIs to adjust stock tracking or item counts.
 */
export async function handleSquareStockToggle(
  squareId: string,
  isSoldOut: boolean,
  accessToken: string,
  quantity?: number,
  unlimited?: boolean
): Promise<void> {
  const { variationId, locationId } = await getVariationAndLocationId(accessToken, squareId);
  const baseUrl = getSquareBaseUrl();

  if (!isSoldOut && unlimited) {
    const varRes = await fetch(`${baseUrl}/v2/catalog/object/${variationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!varRes.ok) throw new Error(`Fetch variation failed: ${await varRes.text()}`);
    const varData = (await varRes.json()) as { object?: { version?: number; item_variation_data?: Record<string, unknown> } };
    const variationObject = varData.object;
    const version = variationObject?.version;
    if (version && variationObject) {
      const updateRes = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          batches: [{
            objects: [{
              type: "ITEM_VARIATION",
              id: variationId,
              version,
              item_variation_data: {
                ...variationObject.item_variation_data,
                track_inventory: false,
              },
            }],
          }],
        }),
      });
      if (!updateRes.ok) throw new Error(`Disable stock tracking failed: ${await updateRes.text()}`);
    }
  } else {
    const varRes = await fetch(`${baseUrl}/v2/catalog/object/${variationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (varRes.ok) {
      const varData = (await varRes.json()) as { object?: { version?: number; item_variation_data?: Record<string, unknown> } };
      const variationObject = varData.object;
      const version = variationObject?.version;
      const trackInventory = variationObject?.item_variation_data?.track_inventory;
      if (version && !trackInventory && variationObject) {
        const enableRes = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            batches: [{
              objects: [{
                type: "ITEM_VARIATION",
                id: variationId,
                version,
                item_variation_data: {
                  ...variationObject.item_variation_data,
                  track_inventory: true,
                },
              }],
            }],
          }),
        });
        if (!enableRes.ok) throw new Error(`Enable stock tracking failed: ${await enableRes.text()}`);
      }
    }

    const stockQty = isSoldOut ? 0 : (quantity !== undefined ? quantity : 100);
    const changeRes = await fetch(`${baseUrl}/v2/inventory/changes/batch-create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        changes: [{
          type: "PHYSICAL_COUNT",
          physical_count: {
            catalog_object_id: variationId,
            state: "IN_STOCK",
            quantity: String(stockQty),
            location_id: locationId,
            occurred_at: new Date().toISOString(),
          },
        }],
      }),
    });
    if (!changeRes.ok) {
      throw new Error(`Failed to update inventory: ${await changeRes.text()}`);
    }
  }
}
```

## File: modules/pos-simulator/pos-simulator.mock.ts
```typescript
export interface MockPosItem {
  organization_id: string;
  pos_provider: "SQUARE" | "TOAST" | "MANUAL";
  external_id: string;
  name: string;
  description: string;
  price: number;
  is_sold_out: boolean;
}

export function getMockItems(organizationId: string): MockPosItem[] {
  return [
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_coffee",
      name: "Coffee",
      description: "Freshly brewed drip coffee",
      price: 3.5,
      is_sold_out: false,
    },
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_croissant",
      name: "Croissant",
      description: "Flaky butter croissant",
      price: 4.0,
      is_sold_out: false,
    },
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_avocado_toast",
      name: "Avocado Toast",
      description: "Sourdough toast with mashed avocado",
      price: 9.5,
      is_sold_out: false,
    },
    {
      organization_id: organizationId,
      pos_provider: "SQUARE",
      external_id: "item_latte",
      name: "Latte",
      description: "Espresso with steamed milk",
      price: 4.5,
      is_sold_out: false,
    },
  ];
}
```

## File: modules/pos-simulator/pos-simulator.module.ts
```typescript
import { Module } from "@nestjs/common";
import { PosSimulatorController } from "./pos-simulator.controller";
import { SignageModule } from "../signage/signage.module";

@Module({
  imports: [SignageModule],
  controllers: [PosSimulatorController],
})
export class PosSimulatorModule {}
```

## File: modules/recipe/ingredients.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { IngredientsService } from "./ingredients.service";
import { ApiResponse, MasterIngredient } from "@soustools/api-types";

@Controller("recipes/ingredients")
export class IngredientsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<MasterIngredient[]>> {
    try {
      const data = await this.ingredientsService.findAll(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.findOne(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(
    @Body() payload: Omit<MasterIngredient, "id" | "organizationId" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.create(this.defaultOrgId, payload);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() payload: Partial<MasterIngredient>
  ): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.update(id, payload);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<MasterIngredient>> {
    try {
      const data = await this.ingredientsService.remove(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/recipe/ingredients.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { MasterIngredient } from "@soustools/api-types";

@Injectable()
export class IngredientsService {
  async findAll(orgId: string): Promise<MasterIngredient[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRow);
  }

  async findOne(id: string): Promise<MasterIngredient> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async create(
    orgId: string,
    payload: Omit<MasterIngredient, "id" | "organizationId" | "createdAt" | "updatedAt">
  ): Promise<MasterIngredient> {
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          organization_id: orgId,
          name: payload.name,
          density_g_ml: payload.densityGMl,
          nutrition_macros: payload.nutritionMacros,
          allergens: payload.allergens,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, payload: Partial<MasterIngredient>): Promise<MasterIngredient> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.densityGMl !== undefined) updateData.density_g_ml = payload.densityGMl;
    if (payload.nutritionMacros !== undefined) updateData.nutrition_macros = payload.nutritionMacros;
    if (payload.allergens !== undefined) updateData.allergens = payload.allergens;

    const { data, error } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async remove(id: string): Promise<MasterIngredient> {
    const { data, error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  private mapRow(row: any): MasterIngredient {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      densityGMl: Number(row.density_g_ml),
      nutritionMacros: row.nutrition_macros || { calories: null, proteinG: null, carbsG: null, fatG: null },
      allergens: row.allergens || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

## File: modules/recipe/recipe-cost.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CostIngredient {
  ingredientId: string;
  name: string;
  weightG: number;
  costUsd: number;
}

export interface RecipeCost {
  totalCostUsd: number;
  costPerServingUsd: number;
  linkedSalePrice?: number;
  marginPct?: number;
  ingredients: CostIngredient[];
}

@Injectable()
export class RecipeCostService {
  async getRecipeCost(recipeId: string): Promise<RecipeCost> {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('yield_count')
      .eq('id', recipeId)
      .single();

    if (recipeError || !recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    const yieldCount = Number(recipe.yield_count) || 1;

    const { data: ingredients, error: ingError } = await supabase
      .from('recipe_ingredients')
      .select(`
        id,
        amount,
        unit,
        items (
          id,
          name,
          density_g_ml,
          each_weight_g,
          units_per_case,
          current_cost_per_g
        )
      `)
      .eq('recipe_id', recipeId);

    if (ingError) {
      throw new Error(ingError.message);
    }

    const costIngredients: CostIngredient[] = [];
    let totalCostUsd = 0;

    for (const ing of (ingredients || [])) {
      const item = ing.items as any;
      if (!item) continue;

      const density = Number(item.density_g_ml) || 1.0;
      const eachWeight = Number(item.each_weight_g) || 0;
      const unitsPerCase = Number(item.units_per_case) || 0;
      const costPerG = Number(item.current_cost_per_g) || 0;
      const amount = Number(ing.amount) || 0;
      const unit = (ing.unit || '').toUpperCase();

      let weightG = 0;
      switch (unit) {
        case 'G':
          weightG = amount;
          break;
        case 'KG':
          weightG = amount * 1000;
          break;
        case 'LB':
          weightG = amount * 453.59237;
          break;
        case 'OZ':
          weightG = amount * 28.349523;
          break;
        case 'ML':
          weightG = amount * density;
          break;
        case 'L':
          weightG = amount * density * 1000;
          break;
        case 'TSP':
          weightG = amount * density * 4.92892;
          break;
        case 'TBSP':
          weightG = amount * density * 14.7868;
          break;
        case 'CUP':
          weightG = amount * density * 236.588;
          break;
        case 'GAL':
          weightG = amount * density * 3785.41;
          break;
        case 'QT':
          weightG = amount * density * 946.353;
          break;
        case 'EACH':
          weightG = amount * eachWeight;
          break;
        case 'CASE':
          weightG = amount * eachWeight * unitsPerCase;
          break;
        default:
          weightG = amount;
      }

      const costUsd = weightG * costPerG;
      totalCostUsd += costUsd;

      costIngredients.push({
        ingredientId: item.id,
        name: item.name,
        weightG,
        costUsd,
      });
    }

    const costPerServingUsd = totalCostUsd / yieldCount;

    const { data: link, error: linkError } = await supabase
      .from('pos_item_recipe_links')
      .select('portion_fraction, pos_items (price)')
      .eq('recipe_id', recipeId)
      .limit(1)
      .maybeSingle();

    let linkedSalePrice: number | undefined;
    let marginPct: number | undefined;

    if (!linkError && link) {
      const posItem = link.pos_items as any;
      if (posItem && posItem.price) {
        const salePrice = Number(posItem.price) || 0;
        const portion = Number(link.portion_fraction) || 1.0;
        linkedSalePrice = salePrice;
        const servingPrice = salePrice * portion;
        if (servingPrice > 0) {
          marginPct = ((servingPrice - costPerServingUsd) / servingPrice) * 100;
        }
      }
    }

    return {
      totalCostUsd,
      costPerServingUsd,
      linkedSalePrice,
      marginPct,
      ingredients: costIngredients,
    };
  }
}
```

## File: modules/recipe/recipe-meta.controller.ts
```typescript
import { Controller, Get } from "@nestjs/common";
import { RecipeMetaService } from "./recipe-meta.service";
import { ApiResponse, RecipeCategory, RecipeTag } from "@soustools/api-types";

/**
 * RecipeMetaController handles categories and tags endpoints.
 * @tenant-docs-export
 */
@Controller("recipes-meta")
export class RecipeMetaController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly recipeMetaService: RecipeMetaService) {}

  @Get("categories")
  async findCategories(): Promise<ApiResponse<RecipeCategory[]>> {
    try {
      const data = await this.recipeMetaService.findAllCategories(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("tags")
  async findTags(): Promise<ApiResponse<RecipeTag[]>> {
    try {
      const data = await this.recipeMetaService.findAllTags(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/recipe/recipe-meta.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { RecipeCategory, RecipeTag } from "@soustools/api-types";

/**
 * RecipeMetaService manages recipe categories and tags metadata.
 * @tenant-docs-export
 */
@Injectable()
export class RecipeMetaService {
  async findAllCategories(orgId: string): Promise<RecipeCategory[]> {
    const { data, error } = await supabase
      .from("recipe_categories")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => ({
      id: String(row.id),
      organizationId: String(row.organization_id),
      name: String(row.name),
      parentId: row.parent_id ? String(row.parent_id) : null,
      createdAt: String(row.created_at),
    }));
  }

  async findAllTags(orgId: string): Promise<RecipeTag[]> {
    const { data, error } = await supabase
      .from("recipe_tags")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => ({
      id: String(row.id),
      organizationId: String(row.organization_id),
      name: String(row.name),
      createdAt: String(row.created_at),
    }));
  }
}
```

## File: modules/recipe/recipe-versions.controller.ts
```typescript
import { Controller, Get, Post, Param, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

@Controller('recipes')
export class RecipeVersionsController {
  @Post(':id/versions')
  async createVersion(@Param('id') id: string): Promise<ApiResponse<{ versionId: string; versionNumber: number }>> {
    try {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError || !recipe) {
        throw new NotFoundException(`Recipe with ID ${id} not found`);
      }

      const { data: ingredients, error: ingError } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', id);

      if (ingError) {
        throw new Error(ingError.message);
      }

      const { data: versions, error: verError } = await supabase
        .from('formula_versions')
        .select('version_number')
        .eq('recipe_id', id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (verError) {
        throw new Error(verError.message);
      }

      const nextVersion = versions && versions.length > 0 ? (versions[0].version_number + 1) : 1;

      const { data: inserted, error: insertError } = await supabase
        .from('formula_versions')
        .insert([
          {
            recipe_id: id,
            version_number: nextVersion,
            title: recipe.title,
            yield_count: recipe.yield_count,
            yield_unit: recipe.yield_unit,
            vessel_id: recipe.vessel_id,
            instructions: recipe.instructions,
            ingredients: ingredients || [],
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return {
        success: true,
        data: {
          versionId: inserted.id,
          versionNumber: inserted.version_number,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string): Promise<ApiResponse<unknown[]>> {
    try {
      const { data, error } = await supabase
        .from('formula_versions')
        .select('*')
        .eq('recipe_id', id)
        .order('version_number', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data || [],
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/recipe/recipe.module.ts
```typescript
import { Module } from "@nestjs/common";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";
import { IngredientsController } from "./ingredients.controller";
import { IngredientsService } from "./ingredients.service";
import { VesselsController } from "./vessels.controller";
import { VesselsService } from "./vessels.service";
import { RecipeMetaController } from "./recipe-meta.controller";
import { RecipeMetaService } from "./recipe-meta.service";
import { RecipeCostService } from "./recipe-cost.service";
import { RecipeVersionsController } from "./recipe-versions.controller";

@Module({
  controllers: [RecipesController, IngredientsController, VesselsController, RecipeMetaController, RecipeVersionsController],
  providers: [RecipesService, IngredientsService, VesselsService, RecipeMetaService, RecipeCostService],
  exports: [RecipesService, IngredientsService, VesselsService, RecipeMetaService, RecipeCostService],
})
export class RecipeModule {}
```

## File: modules/recipe/recipes.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { RecipesService } from "./recipes.service";
import { RecipeCostService } from "./recipe-cost.service";
import { ApiResponse, Recipe, RecipeIngredient } from "@soustools/api-types";

@Controller("recipes")
export class RecipesController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(
    private readonly recipesService: RecipesService,
    private readonly recipeCostService: RecipeCostService
  ) {}

  @Get()
  async findAll(): Promise<ApiResponse<Recipe[]>> {
    try {
      const data = await this.recipesService.findAll(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id/cost")
  async getRecipeCost(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    try {
      const data = await this.recipeCostService.getRecipeCost(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.findOne(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(
    @Body("recipe") recipe: Omit<Recipe, "id" | "organizationId" | "createdAt" | "recipeIngredients" | "vessel">,
    @Body("recipeIngredients") recipeIngredients: Omit<RecipeIngredient, "id" | "recipeId" | "createdAt" | "masterIngredient">[]
  ): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.create(this.defaultOrgId, recipe, recipeIngredients);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("recipe") recipe: Partial<Recipe>,
    @Body("recipeIngredients") recipeIngredients?: Omit<RecipeIngredient, "id" | "recipeId" | "createdAt" | "masterIngredient">[]
  ): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.update(id, recipe, recipeIngredients);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<Recipe>> {
    try {
      const data = await this.recipesService.remove(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/recipe/recipes.mapper.ts
```typescript
import { Recipe, VesselProfile, RecipeIngredient, MasterIngredient, NutritionMacros } from "@soustools/api-types";

/**
 * Maps database row to Recipe API type.
 * @tenant-docs-export
 */
export function mapRecipeRow(row: Record<string, unknown>): Recipe {
  const vesselRaw = row.vessel as Record<string, unknown> | null;
  const ingredientsRaw = row.recipe_ingredients as Record<string, unknown>[] | null;

  const vessel: VesselProfile | undefined = vesselRaw ? {
    id: String(vesselRaw.id),
    organizationId: String(vesselRaw.organization_id),
    name: String(vesselRaw.name),
    shape: vesselRaw.shape as "ROUND" | "RECTANGULAR",
    length: vesselRaw.length !== null ? Number(vesselRaw.length) : null,
    width: vesselRaw.width !== null ? Number(vesselRaw.width) : null,
    height: vesselRaw.height !== null ? Number(vesselRaw.height) : null,
    diameter: vesselRaw.diameter !== null ? Number(vesselRaw.diameter) : null,
    volumeMl: Number(vesselRaw.volume_ml),
    createdAt: String(vesselRaw.created_at),
  } : undefined;

  const recipeIngredients: RecipeIngredient[] = ingredientsRaw ? ingredientsRaw.map((ri) => {
    const mi = ri.items as Record<string, unknown> | null;
    const macros = (mi?.nutrition_macros || {}) as Record<string, unknown>;
    const nutritionMacros: NutritionMacros = {
      calories: macros.calories !== undefined && macros.calories !== null ? Number(macros.calories) : null,
      proteinG: macros.proteinG !== undefined && macros.proteinG !== null ? Number(macros.proteinG) : null,
      carbsG: macros.carbsG !== undefined && macros.carbsG !== null ? Number(macros.carbsG) : null,
      fatG: macros.fatG !== undefined && macros.fatG !== null ? Number(macros.fatG) : null,
    };

    const masterIngredient: MasterIngredient | undefined = mi ? {
      id: String(mi.id),
      organizationId: String(mi.organization_id),
      name: String(mi.name),
      densityGMl: Number(mi.density_g_ml),
      nutritionMacros,
      allergens: Array.isArray(mi.allergens) ? (mi.allergens as string[]) : [],
      ingredientType: mi.ingredient_type ? String(mi.ingredient_type) : null,
      isAnimalProduct: Boolean(mi.is_animal_product),
      isMeat: Boolean(mi.is_meat),
      isSeafood: Boolean(mi.is_seafood),
      isDairy: Boolean(mi.is_dairy),
      isEgg: Boolean(mi.is_egg),
      isGlutenSource: Boolean(mi.is_gluten_source),
      fdcId: mi.fdc_id !== null && mi.fdc_id !== undefined ? Number(mi.fdc_id) : null,
      nutritionVerifiedAt: mi.nutrition_verified_at ? String(mi.nutrition_verified_at) : null,
      createdAt: String(mi.created_at),
      updatedAt: String(mi.updated_at),
    } : undefined;

    return {
      id: String(ri.id),
      recipeId: String(ri.recipe_id),
      masterIngredientId: ri.item_id ? String(ri.item_id) : null,
      subRecipeId: ri.sub_recipe_id ? String(ri.sub_recipe_id) : null,
      calculationType: ri.calculation_type as "fixed_weight" | "bakers_percentage",
      baseCalculationGroup: Boolean(ri.base_calculation_group),
      amount: Number(ri.amount),
      unit: String(ri.unit),
      prepNotes: ri.prep_notes ? String(ri.prep_notes) : null,
      rawName: ri.raw_name ? String(ri.raw_name) : null,
      component: ri.component ? String(ri.component) : null,
      createdAt: String(ri.created_at),
      masterIngredient,
    };
  }) : [];

  const tagsRaw = row.recipe_tag_assignments as Record<string, unknown>[] | null;
  const tagIds = tagsRaw ? tagsRaw.map((t) => String(t.tag_id)) : [];

  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    title: String(row.title),
    yieldCount: Number(row.yield_count),
    yieldUnit: String(row.yield_unit),
    vesselId: row.vessel_id ? String(row.vessel_id) : null,
    instructions: (row.instructions || []) as Recipe["instructions"],
    createdAt: String(row.created_at),
    categoryId: row.category_id ? String(row.category_id) : null,
    status: (row.status || "PENDING_REVIEW") as Recipe["status"],
    sourceBook: row.source_book ? String(row.source_book) : null,
    sourceAuthor: row.source_author ? String(row.source_author) : null,
    sourcePageStart: row.source_page_start !== null && row.source_page_start !== undefined ? Number(row.source_page_start) : null,
    sourcePageEnd: row.source_page_end !== null && row.source_page_end !== undefined ? Number(row.source_page_end) : null,
    vessel,
    recipeIngredients,
    tagIds,
  };
}
```

## File: modules/recipe/recipes.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { Recipe, RecipeIngredient } from "@soustools/api-types";
import { mapRecipeRow } from "./recipes.mapper";

/**
 * RecipesService manages recipe queries and CRUD operations.
 * @tenant-docs-export
 */
@Injectable()
export class RecipesService {
  async findAll(orgId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, vessel:vessel_profiles(*), recipe_tag_assignments(tag_id)")
      .eq("organization_id", orgId)
      .order("title", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapRecipeRow(row as Record<string, unknown>));
  }

  async findOne(id: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        vessel:vessel_profiles(*),
        recipe_ingredients (
          *,
          items (*)
        ),
        recipe_tag_assignments(tag_id)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return mapRecipeRow(data as Record<string, unknown>);
  }

  async create(
    orgId: string,
    recipePayload: Omit<Recipe, "id" | "organizationId" | "createdAt" | "recipeIngredients" | "vessel">,
    ingredientsPayload: Omit<RecipeIngredient, "id" | "recipeId" | "createdAt" | "masterIngredient">[]
  ): Promise<Recipe> {
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          organization_id: orgId,
          title: recipePayload.title,
          yield_count: recipePayload.yieldCount,
          yield_unit: recipePayload.yieldUnit,
          vessel_id: recipePayload.vesselId,
          instructions: recipePayload.instructions,
          category_id: recipePayload.categoryId,
          status: recipePayload.status || "PENDING_REVIEW",
          source_book: recipePayload.sourceBook,
          source_author: recipePayload.sourceAuthor,
          source_page_start: recipePayload.sourcePageStart,
          source_page_end: recipePayload.sourcePageEnd,
        },
      ])
      .select()
      .single();

    if (recipeError) throw new Error(recipeError.message);

    if (ingredientsPayload && ingredientsPayload.length > 0) {
      const dbIngredients = ingredientsPayload.map((ing) => ({
        recipe_id: recipe.id,
        item_id: ing.masterIngredientId,
        calculation_type: ing.calculationType,
        base_calculation_group: ing.baseCalculationGroup || false,
        amount: ing.amount,
        unit: ing.unit,
        raw_name: ing.rawName || null,
        prep_notes: ing.prepNotes || null,
      }));

      const { error: ingError } = await supabase
        .from("recipe_ingredients")
        .insert(dbIngredients);

      if (ingError) {
        await supabase.from("recipes").delete().eq("id", recipe.id);
        throw new Error(ingError.message);
      }
    }

    return this.findOne(recipe.id);
  }

  async update(
    id: string,
    recipePayload: Partial<Recipe>,
    ingredientsPayload?: Omit<RecipeIngredient, "id" | "recipeId" | "createdAt" | "masterIngredient">[]
  ): Promise<Recipe> {
    const updateData: Record<string, unknown> = {};
    if (recipePayload.title !== undefined) updateData.title = recipePayload.title;
    if (recipePayload.yieldCount !== undefined) updateData.yield_count = recipePayload.yieldCount;
    if (recipePayload.yieldUnit !== undefined) updateData.yield_unit = recipePayload.yieldUnit;
    if (recipePayload.vesselId !== undefined) updateData.vessel_id = recipePayload.vesselId;
    if (recipePayload.instructions !== undefined) updateData.instructions = recipePayload.instructions;
    if (recipePayload.categoryId !== undefined) updateData.category_id = recipePayload.categoryId;
    if (recipePayload.status !== undefined) updateData.status = recipePayload.status;
    if (recipePayload.sourceBook !== undefined) updateData.source_book = recipePayload.sourceBook;
    if (recipePayload.sourceAuthor !== undefined) updateData.source_author = recipePayload.sourceAuthor;
    if (recipePayload.sourcePageStart !== undefined) updateData.source_page_start = recipePayload.sourcePageStart;
    if (recipePayload.sourcePageEnd !== undefined) updateData.source_page_end = recipePayload.sourcePageEnd;

    const { error: recipeError } = await supabase
      .from("recipes")
      .update(updateData)
      .eq("id", id);

    if (recipeError) throw new Error(recipeError.message);

    if (ingredientsPayload !== undefined) {
      const { error: clearError } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id);

      if (clearError) throw new Error(clearError.message);

      if (ingredientsPayload.length > 0) {
        const dbIngredients = ingredientsPayload.map((ing) => ({
          recipe_id: id,
          item_id: ing.masterIngredientId,
          calculation_type: ing.calculationType,
          base_calculation_group: ing.baseCalculationGroup || false,
          amount: ing.amount,
          unit: ing.unit,
          raw_name: ing.rawName || null,
          prep_notes: ing.prepNotes || null,
        }));

        const { error: ingError } = await supabase
          .from("recipe_ingredients")
          .insert(dbIngredients);

        if (ingError) throw new Error(ingError.message);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<Recipe> {
    const recipe = await this.findOne(id);
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return recipe;
  }
}
```

## File: modules/recipe/vessels.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { VesselsService } from "./vessels.service";
import { ApiResponse, VesselProfile } from "@soustools/api-types";

@Controller("recipes/vessels")
export class VesselsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly vesselsService: VesselsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<VesselProfile[]>> {
    try {
      const data = await this.vesselsService.findAll(this.defaultOrgId);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.findOne(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post()
  async create(
    @Body() payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">
  ): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.create(this.defaultOrgId, payload);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() payload: Partial<VesselProfile>
  ): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.update(id, payload);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<VesselProfile>> {
    try {
      const data = await this.vesselsService.remove(id);
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

## File: modules/recipe/vessels.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { VesselProfile } from "@soustools/api-types";

@Injectable()
export class VesselsService {
  async findAll(orgId: string): Promise<VesselProfile[]> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRow);
  }

  async findOne(id: string): Promise<VesselProfile> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async create(
    orgId: string,
    payload: Omit<VesselProfile, "id" | "organizationId" | "createdAt">
  ): Promise<VesselProfile> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .insert([
        {
          organization_id: orgId,
          name: payload.name,
          shape: payload.shape,
          length: payload.length,
          width: payload.width,
          height: payload.height,
          diameter: payload.diameter,
          volume_ml: payload.volumeMl,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async update(id: string, payload: Partial<VesselProfile>): Promise<VesselProfile> {
    const updateData: Record<string, any> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.shape !== undefined) updateData.shape = payload.shape;
    if (payload.length !== undefined) updateData.length = payload.length;
    if (payload.width !== undefined) updateData.width = payload.width;
    if (payload.height !== undefined) updateData.height = payload.height;
    if (payload.diameter !== undefined) updateData.diameter = payload.diameter;
    if (payload.volumeMl !== undefined) updateData.volume_ml = payload.volumeMl;

    const { data, error } = await supabase
      .from("vessel_profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async remove(id: string): Promise<VesselProfile> {
    const { data, error } = await supabase
      .from("vessel_profiles")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  private mapRow(row: any): VesselProfile {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      shape: row.shape,
      length: row.length !== null ? Number(row.length) : null,
      width: row.width !== null ? Number(row.width) : null,
      height: row.height !== null ? Number(row.height) : null,
      diameter: row.diameter !== null ? Number(row.diameter) : null,
      volumeMl: Number(row.volume_ml),
      createdAt: row.created_at,
    };
  }
}
```

## File: modules/signage/displays.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { DisplaysService } from "./displays.service";
import { SignageGateway } from "./signage.gateway";
import { ApiResponse } from "@soustools/api-types";
import { runControllerAction } from "./response.helper";

/**
 * Controller managing signage display endpoints.
 * Displays are single output ports (HDMI or browser URL).
 *
 * @tenant-docs-export
 */
@Controller("signage/displays")
export class DisplaysController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(
    private readonly displaysService: DisplaysService,
    private readonly signageGateway: SignageGateway
  ) {}

  @Get("active-connections")
  async getActiveConnections(): Promise<ApiResponse<Record<string, boolean>>> {
    return runControllerAction(async () => {
      const displays = (await this.displaysService.findAll(this.defaultOrgId)) as any[];
      const connections: Record<string, boolean> = {};
      for (const display of displays) {
        connections[display.id] = this.signageGateway.isDisplayOnline(display.id);
      }
      return connections;
    });
  }

  @Get()
  async findAll(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(() => this.displaysService.findAll(this.defaultOrgId));
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.findOne(id));
  }

  /** Creates a browser-only display (no hardware device). */
  @Post()
  async create(
    @Body("name") name: string,
    @Body("deckId") deckId?: string | null,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.create(this.defaultOrgId, name, deckId),
    );
  }

  /** Assigns a deck to a display or renames it. */
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("deckId") deckId?: string | null,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.update(id, name, deckId),
    );
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.displaysService.remove(id));
  }

  /** Player heartbeat — updates last_seen_at. */
  @Post(":id/heartbeat")
  async heartbeat(@Param("id") id: string): Promise<ApiResponse<null>> {
    return runControllerAction(async () => {
      await this.displaysService.heartbeat(id);
      return null;
    });
  }

  /** Confirm pairing of a hardware device. */
  @Post("pair/confirm")
  async confirmPairing(
    @Body("pairingCode") pairingCode: string,
    @Body("name") name: string,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.displaysService.pairDevice(this.defaultOrgId, pairingCode, name),
    );
  }
}
```

## File: modules/signage/displays.helpers.ts
```typescript
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "./signage.gateway";

/**
 * Handles validation of database results, throwing an error if one occurred.
 *
 * @param result - The database query result object.
 * @returns The queried data.
 */
export function handleDbResult<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data === null || result.data === undefined) {
    throw new Error("Resource not found");
  }
  return result.data;
}

/**
 * Generates a random alphanumeric pairing code of a specified length.
 *
 * @param length - The length of the pairing code.
 * @returns A randomly generated pairing code string.
 */
export function generatePairingCode(length = 4): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Registers a display slot with a generated unique pairing code.
 *
 * @param name - The name of the display.
 * @returns The registered display node details.
 */
export async function dbRegisterPairingCode(name?: string): Promise<unknown> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePairingCode();
    const { data, error } = await supabase
      .from("signage_displays")
      .insert([
        {
          organization_id: "d0000000-0000-0000-0000-000000000000",
          name: name || "New Display",
          pairing_code: code,
          is_paired: false,
        },
      ])
      .select()
      .single();

    if (!error) return data;
    if (error.code !== "23505") {
      throw new Error(error.message);
    }
  }
  throw new Error("Failed to generate a unique pairing code");
}

/**
 * Confirms pairing code matching for a display node.
 *
 * @param gateway - The signage gateway to broadcast layout updates.
 * @param pairingCode - The input pairing code.
 * @param name - The optional new display name.
 * @param layoutId - The optional layout ID.
 * @returns The updated and paired display details.
 */
export async function dbConfirmPairing(
  gateway: SignageGateway,
  pairingCode: string,
  name?: string,
  layoutId?: string | null,
): Promise<unknown> {
  const { data: display, error: findError } = await supabase
    .from("signage_displays")
    .select("*")
    .eq("pairing_code", pairingCode.toUpperCase())
    .single();

  if (findError || !display) {
    throw new Error("Invalid pairing code");
  }

  const { data: updated, error: updateError } = await supabase
    .from("signage_displays")
    .update({
      is_paired: true,
      pairing_code: null,
      name: name || display.name,
      layout_id: layoutId !== undefined ? layoutId : display.layout_id,
    })
    .eq("id", display.id)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Failed to confirm pairing");
  }

  gateway.broadcastLayoutUpdate(updated.id);
  return updated;
}
```

## File: modules/signage/displays.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { handleDbResult } from "./displays.helpers";
import { SignageGateway } from "./signage.gateway";

/**
 * Service managing signage displays in the database.
 * A Display is a single output (HDMI port or browser URL).
 * It belongs to a Device (hardware) or is standalone (browser-only).
 *
 * @tenant-docs-export
 */
@Injectable()
export class DisplaysService {
  constructor(private readonly gateway: SignageGateway) {}

  async findAll(orgId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("signage_displays")
      .select("*")
      .eq("organization_id", orgId);
    return handleDbResult({ data: data || [], error });
  }

  async findOne(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .select("*")
      .eq("id", id)
      .single();
    return handleDbResult({ data, error });
  }

  /** Creates a browser-only display (no device, no port label). */
  async create(orgId: string, name: string, deckId?: string | null): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .insert([{ organization_id: orgId, name, deck_id: deckId ?? null }])
      .select()
      .single();
    return handleDbResult({ data, error });
  }

  /** Updates a display's name or deck assignment. */
  async update(
    id: string,
    name?: string,
    deckId?: string | null,
  ): Promise<unknown> {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (deckId !== undefined) updateData.deck_id = deckId;

    const { data, error } = await supabase
      .from("signage_displays")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    const result = handleDbResult({ data, error });
    this.gateway.broadcastLayoutUpdate(id);
    return result;
  }

  async remove(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .delete()
      .eq("id", id)
      .select()
      .single();
    return handleDbResult({ data, error });
  }

  /** Updates the last_seen_at timestamp for a display (called by the player on heartbeat). */
  async heartbeat(id: string): Promise<void> {
    await supabase
      .from("signage_displays")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", id);
  }

  /** Pairs a hardware device and automatically registers its display ports (HDMI-1, HDMI-2). */
  async pairDevice(orgId: string, pairingCode: string, name: string): Promise<unknown> {
    const { data: device, error: deviceError } = await supabase
      .from("signage_devices")
      .select("*")
      .eq("pairing_code", pairingCode)
      .single();

    if (deviceError || !device) {
      throw new Error("Invalid pairing code");
    }

    const { data: updatedDevice, error: updateError } = await supabase
      .from("signage_devices")
      .update({ is_paired: true, name, organization_id: orgId })
      .eq("id", device.id)
      .select()
      .single();

    if (updateError || !updatedDevice) {
      throw new Error(updateError?.message || "Failed to update device");
    }

    const { data: existingDisplays, error: displaysError } = await supabase
      .from("signage_displays")
      .select("*")
      .eq("device_id", device.id);

    if (displaysError) throw new Error(displaysError.message);

    const ports = ["HDMI-1", "HDMI-2"];
    const displaysToCreate = [];

    for (const port of ports) {
      if (!existingDisplays?.some((d) => d.port_label === port)) {
        displaysToCreate.push({
          organization_id: orgId,
          name: `${name} (${port})`,
          device_id: device.id,
          port_label: port,
          deck_id: null,
        });
      }
    }

    if (displaysToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("signage_displays")
        .insert(displaysToCreate);
      if (insertError) throw new Error(insertError.message);
    }

    this.gateway.broadcastDevicePaired(device.id, orgId);

    return updatedDevice;
  }
}
```

## File: modules/signage/layouts.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { LayoutsService } from "./layouts.service";
import { ApiResponse, SignageLayoutConfig } from "@soustools/api-types";
import { runControllerAction } from "./response.helper";

/**
 * REST controller for signage deck CRUD operations.
 * Replaces the old signage_layouts table with signage_decks.
 */
@Controller("signage/layouts")
export class LayoutsController {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly layoutsService: LayoutsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<unknown[]>> {
    return runControllerAction(() => this.layoutsService.findAll(this.defaultOrgId));
  }

  @Get("slug/:orgSlug/:deckSlug")
  async findBySlug(
    @Param("orgSlug") _orgSlug: string,
    @Param("deckSlug") deckSlug: string,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.layoutsService.findBySlug(this.defaultOrgId, deckSlug),
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.layoutsService.findOne(id));
  }

  @Post()
  async create(
    @Body("name") name: string,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.layoutsService.create(this.defaultOrgId, name ?? "New Deck"),
    );
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body("name") name?: string,
    @Body("slug") slug?: string,
    @Body("config") config?: SignageLayoutConfig,
  ): Promise<ApiResponse<unknown>> {
    return runControllerAction(() =>
      this.layoutsService.update(id, name, slug, config),
    );
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    return runControllerAction(() => this.layoutsService.remove(id));
  }
}
```

## File: modules/signage/layouts.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "./signage.gateway";
import { SignageLayoutConfig } from "@soustools/api-types";

/**
 * Service for CRUD operations on signage decks.
 * Broadcasts Socket.io events to connected players after saves.
 */
@Injectable()
export class LayoutsService {
  constructor(private readonly gateway: SignageGateway) {}

  async findAll(orgId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("signage_decks")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findOne(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_decks")
      .select("*, organizations(design_tokens)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    if (data && data.organizations) {
      data.config = { ...data.config, designTokens: (data.organizations as any).design_tokens };
      delete data.organizations;
    }
    return data;
  }

  async findBySlug(orgId: string, slug: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_decks")
      .select("*, organizations(design_tokens)")
      .eq("organization_id", orgId)
      .eq("slug", slug)
      .single();

    if (error) throw new Error(error.message);
    if (data && data.organizations) {
      data.config = { ...data.config, designTokens: (data.organizations as any).design_tokens };
      delete data.organizations;
    }
    return data;
  }

  async create(orgId: string, name: string): Promise<unknown> {
    const slug = this.generateSlug(name);
    const { data, error } = await supabase
      .from("signage_decks")
      .insert([{
        organization_id: orgId,
        name,
        slug,
        config: { soldOutBehavior: "LABEL", slides: [], overlays: [] },
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    id: string,
    name?: string,
    slug?: string,
    config?: SignageLayoutConfig,
  ): Promise<unknown> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) {
      updateData.name = name;
      if (slug === undefined) updateData.slug = this.generateSlug(name);
    }
    if (slug !== undefined) updateData.slug = slug;
    if (config !== undefined) updateData.config = config;

    const { data, error } = await supabase
      .from("signage_decks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (config !== undefined && data) {
      this.gateway.broadcastDeckUpdate(id, config);
    }
    return data;
  }

  async remove(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_decks")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `deck-${Date.now()}`;
  }
}
```

## File: modules/signage/response.helper.ts
```typescript
import { ApiResponse } from "@soustools/api-types";

/**
 * Executes a controller action and wraps its return value or thrown error in a standard API response.
 *
 * @param action - A callback function containing the controller logic to execute.
 * @returns A promise resolving to a standard API response containing the result or error.
 */
export async function runControllerAction<T>(
  action: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await action();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[runControllerAction] Exception:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## File: modules/signage/signage.gateway.ts
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SignageLayoutConfig } from "@soustools/api-types";

interface JoinPayload {
  displayId?: string;
  deckId?: string;
  id?: string;
  pairingDeviceId?: string;
}

@WebSocketGateway({ cors: { origin: "*" } })
export class SignageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const { displayId, deckId, pairingDeviceId } = client.handshake.query;
    if (displayId && typeof displayId === "string") {
      client.join(`display:${displayId}`);
    }
    if (deckId && typeof deckId === "string") {
      client.join(`deck:${deckId}`);
    }
    if (pairingDeviceId && typeof pairingDeviceId === "string") {
      client.join(`pairing:${pairingDeviceId}`);
    }
  }

  handleDisconnect(_client: Socket): void {
    // No-op — socket.io auto-removes from rooms on disconnect
  }

  @SubscribeMessage("join")
  handleJoin(
    client: Socket,
    payload: JoinPayload,
  ): { status: string; joined?: string[] } {
    const joined: string[] = [];
    const displayId = payload?.displayId ?? payload?.id;
    const deckId = payload?.deckId;
    const pairingDeviceId = payload?.pairingDeviceId;

    if (displayId) {
      client.join(`display:${displayId}`);
      joined.push(`display:${displayId}`);
    }
    if (deckId) {
      client.join(`deck:${deckId}`);
      joined.push(`deck:${deckId}`);
    }
    if (pairingDeviceId) {
      client.join(`pairing:${pairingDeviceId}`);
      joined.push(`pairing:${pairingDeviceId}`);
    }
    return joined.length ? { status: "success", joined } : { status: "error" };
  }

  /**
   * Broadcasts a full deck config update to all clients subscribed to that deck.
   * Called after a deck save or a POS item change affecting this deck.
   */
  broadcastDeckUpdate(deckId: string, config: SignageLayoutConfig): void {
    if (this.server) {
      this.server
        .to(`deck:${deckId}`)
        .emit("deck_updated", { deckId, config });
    }
  }

  /** @deprecated Use broadcastDeckUpdate instead. Kept for transition compatibility. */
  broadcastLayoutUpdate(displayId: string): void {
    if (this.server) {
      this.server
        .to(`display:${displayId}`)
        .emit("layout_updated", { displayId });
    }
  }

  /** Broadcasts all updated POS items to clients subscribed to a deck room. */
  broadcastItemsUpdate(deckId: string, items: any[]): void {
    if (this.server) {
      this.server
        .to(`deck:${deckId}`)
        .emit("items_updated", { deckId, items });
    }
  }

  /**
   * Broadcasts pairing confirmation to a device listening on its pairing room.
   */
  broadcastDevicePaired(deviceId: string, orgId: string): void {
    import("@soustools/config").then(({ config }) => {
      if (this.server) {
        this.server
          .to(`pairing:${deviceId}`)
          .emit("device_paired", { 
            deviceId, 
            orgId,
            supabaseUrl: config.SUPABASE_URL,
            supabaseAnonKey: config.SUPABASE_ANON_KEY
          });
      }
    });
  }

  isDisplayOnline(displayId: string): boolean {
    if (!this.server) return false;
    const room = this.server.sockets.adapter.rooms.get(`display:${displayId}`);
    return room ? room.size > 0 : false;
  }
}
```

## File: modules/signage/signage.module.ts
```typescript
import { Module } from "@nestjs/common";
import { SignageGateway } from "./signage.gateway";
import { LayoutsService } from "./layouts.service";
import { DisplaysService } from "./displays.service";
import { LayoutsController } from "./layouts.controller";
import { DisplaysController } from "./displays.controller";

@Module({
  controllers: [LayoutsController, DisplaysController],
  providers: [SignageGateway, LayoutsService, DisplaysService],
  exports: [SignageGateway, LayoutsService, DisplaysService],
})
export class SignageModule {}
```

## File: modules/users/users.controller.ts
```typescript
import { Controller, Post, Put, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PasswordUpdateSchema, PasswordUpdateDto } from '@soustools/api-types';

@Controller('users')
export class UsersController {
  
  @Post()
  @UseGuards(AdminGuard)
  createUser(@Body() _body: any) {
    return { message: 'User created' };
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  updateUser(@Param('id') id: string, @Body() _body: any) {
    return { message: `User ${id} updated` };
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteUser(@Param('id') id: string) {
    return { message: `User ${id} deleted` };
  }

  @Put(':id/password')
  @UsePipes(new ZodValidationPipe(PasswordUpdateSchema))
  updatePassword(@Param('id') id: string, @Body() _body: PasswordUpdateDto) {
    // In reality this would call Supabase Admin API to update the password securely
    return { message: `Password for user ${id} updated` };
  }
}
```

## File: modules/users/users.module.ts
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
})
export class UsersModule {}
```

## File: app.controller.ts
```typescript
import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { AppService } from "./app.service";
import { ApiResponse, HelloResponse } from "@soustools/api-types";

/**
 * Controller handling root application routes.
 */
@Controller()
export class AppController {
  /**
   * Initializes the controller with the application service.
   *
   * @param {AppService} appService The application service logic provider.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint exposing the root GET path.
   *
   * Renders the standard workspace-defined ApiResponse wrapping HelloResponse.
   *
   * @returns {ApiResponse<HelloResponse>} A structured API response.
   */
  @Get()
  getHello(): ApiResponse<HelloResponse> {
    const helloData = this.appService.getHelloData();
    return {
      success: true,
      data: helloData,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    res.type('image/png').send(pixel);
  }
}
```

## File: app.module.ts
```typescript
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { config } from "@soustools/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SignageModule } from "./modules/signage/signage.module";
import { PosSimulatorModule } from "./modules/pos-simulator/pos-simulator.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { RecipeModule } from "./modules/recipe/recipe.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { ItemsModule } from "./modules/items/items.module";
import { PosModule } from "./modules/pos/pos.module";
import { UsersModule } from "./modules/users/users.module";
import { CommandsModule } from "./modules/commands/commands.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { MetricsModule } from "./modules/metrics/metrics.module";

import { AppGraphQLModule } from "./graphql/graphql.module";
import { HealthModule } from "./health/health.module";

/**
 * Root module of the NestJS application.
 *
 * Integrates controllers, queues, and providers for the core application.
 */
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host:
          config.REDIS_HOST === "localhost" ? "127.0.0.1" : config.REDIS_HOST,
        port: config.REDIS_PORT,
        family: 4,
        retryStrategy: (times: number) => {
          console.warn(
            `[Redis] Connection failed (attempt ${times}). Retrying gracefully...`,
          );
          return Math.min(times * 100, 3000);
        },
      },
    }),
    AppGraphQLModule,
    HealthModule,
    SignageModule,
    PosSimulatorModule,
    IntegrationsModule,
    RecipeModule,
    IngestionModule,
    NutritionModule,
    ItemsModule,
    PosModule,
    UsersModule,
    CommandsModule,
    DevicesModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## File: app.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { HelloResponse } from "@soustools/api-types";

/**
 * Service managing logic for base application endpoints.
 */
@Injectable()
export class AppService {
  /**
   * Fetches metadata for the API server greeting.
   *
   * @returns {HelloResponse} The greeting, version, and status metadata.
   */
  getHelloData(): HelloResponse {
    return {
      message: "Hello World from Sous Tools API!",
      version: process.env.APP_VERSION || "dev-local",
      status: "healthy",
    };
  }
}
```

## File: main.ts
```typescript
import "./pre-bootstrap";
import { config } from "@soustools/config";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { logger, patchConsole } from "@soustools/logger";

patchConsole();

import * as express from "express";

/**
 * Boots the NestJS application.
 *
 * Configures the Nest application instance, enables cross-origin resource sharing (CORS),
 * and starts listening on the configured PORT.
 *
 * @returns {Promise<void>} Resolves when the application has successfully started.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS for frontend integration
  app.enableCors();

  const port = config.PORT;
  await app.listen(config.PORT, "0.0.0.0");
  logger.info(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap().catch((err: unknown) => {
  logger.error(err, "Failed to start the application");
  process.exit(1);
});
```

## File: pre-bootstrap.ts
```typescript
import { config } from "@soustools/config";

/**
 * Pre-bootstrap sequence.
 * Dynamically loads New Relic APM only if enabled, avoiding loader hook interference
 * and configuration errors during local development.
 */
if (config.NEW_RELIC_ENABLED) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("newrelic");
}
```

## File: schema.gql
```graphql
# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------

type HealthStatus {
  status: String!
  timestamp: String!
}

type Query {
  healthCheck: HealthStatus!
}
```
