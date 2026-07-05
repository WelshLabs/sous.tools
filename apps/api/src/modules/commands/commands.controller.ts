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
