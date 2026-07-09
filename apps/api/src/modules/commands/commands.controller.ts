import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  Req,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../../lib/supabase-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
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
      const orgId =
        req.user?.user_metadata?.organization_id ||
        "d0000000-0000-0000-0000-000000000000";
      return this.commandsService.handleCommand(payload, orgId);
    });
  }
}
