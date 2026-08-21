import { Module, Global } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EventDispatcherService } from "./event-dispatcher.service";

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      maxListeners: 20,
    }),
  ],
  providers: [EventDispatcherService],
  exports: [EventDispatcherService],
})
export class EventsModule {}
