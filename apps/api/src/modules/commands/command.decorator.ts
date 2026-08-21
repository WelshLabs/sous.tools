import { SetMetadata, applyDecorators, Injectable } from "@nestjs/common";
import { CommandToolDefinition } from "./command.interface";

export const COMMAND_TOOL_METADATA = "COMMAND_TOOL_METADATA";

export type CommandMetadata = CommandToolDefinition;

/**
 * Decorator to register a class as a Command / Agent Tool in the IoC container.
 * Automatically marks the class as @Injectable() and attaches tool metadata.
 */
export function Command(metadata: CommandMetadata): ClassDecorator {
  return applyDecorators(
    Injectable(),
    SetMetadata(COMMAND_TOOL_METADATA, metadata),
  );
}

/**
 * Alias for @Command() decorator
 */
export const CommandTool = Command;
