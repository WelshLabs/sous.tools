import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UsePipes,
  Req,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../../core/guards/supabase-auth.guard";
import { ZodValidationPipe } from "../../shared/pipes/zod-validation.pipe";
import {
  type OmnibarCommandPayload,
  OmnibarCommandPayloadSchema,
  type ApiResponse,
} from "@soustools/api-types";
import { CommandsService } from "./commands.service";
import { runControllerAction } from "../signage/response.helper";

@Controller("commands")
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post("/execute")
  @UseGuards(SupabaseAuthGuard)
  @UsePipes(new ZodValidationPipe(OmnibarCommandPayloadSchema))
  async handleCommand(
    @Body() payload: OmnibarCommandPayload,
    @Req() req: any,
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const orgId = req.user?.user_metadata?.organization_id || "";
      // We pass user in payload context just to be safe
      payload.context = payload.context || {};
      payload.context.userId = req.user?.id;
      return this.commandsService.handleCommand(payload, orgId);
    });
  }

  @Get("/conversations")
  async listConversations(@Req() req: any): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const userId = req.user?.id;
      const orgId =
        req.user?.user_metadata?.organization_id ||
        req.user?.app_metadata?.organization_id;
      return this.commandsService.listConversationsForUser(userId, orgId);
    });
  }

  @Get("/conversations/:id/messages")
  async getConversationMessages(
    @Param("id") conversationId: string,
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      return this.commandsService.getConversationMessages(conversationId);
    });
  }
}
