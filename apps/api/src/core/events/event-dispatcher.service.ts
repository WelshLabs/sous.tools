import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SupabaseService } from "../database/supabase";

export interface DomainEvent {
  eventName: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: any;
}

@Injectable()
export class EventDispatcherService {
  private readonly logger = new Logger(EventDispatcherService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly supabaseService: SupabaseService,
  ) {}

  async dispatch(event: DomainEvent): Promise<void> {
    // 1. Emit locally for immediate decoupled domain reactions (e.g. Neo4j Sync queueing)
    this.eventEmitter.emit(event.eventName, event);

    // 2. Persist to system_memories Postgres table for the SSOT Event-Driven Graph
    try {
      const client = this.supabaseService.client;
      const { error } = await client.from("system_memories").insert({
        organization_id: event.organizationId,
        entity_type: event.entityType,
        entity_id: event.entityId,
        action: event.action,
        payload: event.payload,
      });

      if (error) {
        this.logger.error(`Failed to persist domain event ${event.eventName}: ${error.message}`);
      }
    } catch (err: any) {
      this.logger.error(`Exception persisting domain event ${event.eventName}: ${err.message}`);
    }
  }
}
