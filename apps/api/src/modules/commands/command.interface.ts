import { OmniMessage } from "@soustools/api-types";

export interface CommandToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface CommandExecutionContext {
  orgId: string;
  userId?: string;
  conversationId: string;
  payload?: any;
  lastUserMessage?: OmniMessage;
  emitMessage?: (msg: OmniMessage) => void;
}

export interface CommandTool<TArgs = any, TResult = any> {
  execute(args: TArgs, context: CommandExecutionContext): Promise<TResult>;
}
