import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { COMMAND_TOOL_METADATA, CommandMetadata } from "./command.decorator";
import { CommandTool, CommandExecutionContext } from "./command.interface";

@Injectable()
export class ToolRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly tools = new Map<
    string,
    { tool: CommandTool; metadata: CommandMetadata }
  >();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    this.discoverTools();
  }

  public discoverTools(): void {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      const metadata: CommandMetadata | undefined =
        this.reflector.get(COMMAND_TOOL_METADATA, metatype) ||
        (instance.constructor
          ? this.reflector.get(COMMAND_TOOL_METADATA, instance.constructor)
          : undefined);

      if (metadata && metadata.name) {
        if (typeof (instance as CommandTool).execute !== "function") {
          this.logger.warn(
            `Provider ${metatype.name || instance.constructor?.name} is decorated with @Command, but lacks an execute() method.`,
          );
          continue;
        }

        this.tools.set(metadata.name, {
          tool: instance as CommandTool,
          metadata,
        });
        this.logger.log(
          `Registered Command Tool: ${metadata.name} (${metatype.name || instance.constructor?.name})`,
        );
      }
    }
  }

  public registerTool(tool: CommandTool, metadata: CommandMetadata): void {
    this.tools.set(metadata.name, { tool, metadata });
    this.logger.log(`Registered Command Tool (manual): ${metadata.name}`);
  }

  public getTool(name: string): CommandTool | undefined {
    return this.tools.get(name)?.tool;
  }

  public getToolMetadata(name: string): CommandMetadata | undefined {
    return this.tools.get(name)?.metadata;
  }

  public getAllTools(): Array<{
    tool: CommandTool;
    metadata: CommandMetadata;
  }> {
    return Array.from(this.tools.values());
  }

  public getAllDefinitions(): CommandMetadata[] {
    return Array.from(this.tools.values()).map((t) => t.metadata);
  }

  public formatJsonSchema(schema: any): any {
    if (!schema || typeof schema !== "object") return schema;

    const result: Record<string, any> = {};

    if (schema.type) {
      result.type =
        typeof schema.type === "string"
          ? schema.type.toLowerCase()
          : schema.type;
    }
    if (schema.description) {
      result.description = schema.description;
    }
    if (schema.enum && Array.isArray(schema.enum)) {
      result.enum = schema.enum;
    }
    if (schema.required && Array.isArray(schema.required)) {
      result.required = schema.required;
    }
    if (schema.additionalProperties !== undefined) {
      result.additionalProperties = schema.additionalProperties;
    }
    if (schema.items) {
      result.items = this.formatJsonSchema(schema.items);
    }
    if (schema.properties && typeof schema.properties === "object") {
      result.properties = Object.fromEntries(
        Object.entries(schema.properties).map(([k, v]) => [
          k,
          this.formatJsonSchema(v),
        ]),
      );
    }

    return result;
  }

  public getLlmToolDefinitions(): Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  }> {
    return this.getAllDefinitions().map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: this.formatJsonSchema(t.parameters),
      },
    }));
  }

  public async executeTool(
    name: string,
    args: any,
    context: CommandExecutionContext,
  ): Promise<any> {
    const entry = this.tools.get(name);
    if (!entry) {
      throw new Error(`Command tool "${name}" not found in registry.`);
    }
    return entry.tool.execute(args, context);
  }
}
