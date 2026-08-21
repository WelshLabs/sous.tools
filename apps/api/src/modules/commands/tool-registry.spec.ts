import { Test, TestingModule } from "@nestjs/testing";
import { DiscoveryModule } from "@nestjs/core";
import { ToolRegistryService } from "./tool-registry.service";
import { Command } from "./command.decorator";
import { CommandTool, CommandExecutionContext } from "./command.interface";

const sampleToolMeta = {
  name: "test_tool",
  description: "A test tool for unit testing",
  parameters: {
    type: "object",
    properties: {
      message: { type: "string", description: "A test message" },
    },
    required: ["message"],
  },
};

@Command(sampleToolMeta)
class TestTool implements CommandTool {
  async execute(args: any, context: CommandExecutionContext) {
    return {
      success: true,
      echo: args.message,
      orgId: context.orgId,
    };
  }
}

describe("ToolRegistryService", () => {
  let service: ToolRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [ToolRegistryService, TestTool],
    }).compile();

    service = module.get<ToolRegistryService>(ToolRegistryService);
    // Trigger onModuleInit to discover tools
    service.onModuleInit();
  });

  it("should discover decorated tools using DiscoveryService", () => {
    const tool = service.getTool("test_tool");
    expect(tool).toBeDefined();
    expect(tool).toBeInstanceOf(TestTool);

    const metadata = service.getToolMetadata("test_tool");
    expect(metadata).toEqual(sampleToolMeta);
  });

  it("should return all tool definitions and LLM-formatted tools", () => {
    const definitions = service.getAllDefinitions();
    expect(definitions).toContainEqual(sampleToolMeta);

    const llmTools = service.getLlmToolDefinitions();
    expect(llmTools.length).toBeGreaterThan(0);
    const testToolLlm = llmTools.find((t) => t.function.name === "test_tool");
    expect(testToolLlm).toBeDefined();
    expect(testToolLlm?.function.description).toBe(sampleToolMeta.description);
  });

  it("should execute registered tools correctly", async () => {
    const result = await service.executeTool(
      "test_tool",
      { message: "hello" },
      {
        orgId: "org-123",
        conversationId: "conv-456",
      },
    );

    expect(result).toEqual({
      success: true,
      echo: "hello",
      orgId: "org-123",
    });
  });

  it("should throw an error when executing an unregistered tool", async () => {
    await expect(
      service.executeTool(
        "non_existent_tool",
        {},
        { orgId: "org-123", conversationId: "conv-456" },
      ),
    ).rejects.toThrow(
      'Command tool "non_existent_tool" not found in registry.',
    );
  });

  it("should allow manual registration of tools", async () => {
    const manualToolMeta = {
      name: "manual_tool",
      description: "Manually registered",
      parameters: { type: "object", properties: {} },
    };
    const manualTool: CommandTool = {
      execute: async () => ({ manual: true }),
    };

    service.registerTool(manualTool, manualToolMeta);

    expect(service.getTool("manual_tool")).toBe(manualTool);
    const res = await service.executeTool(
      "manual_tool",
      {},
      { orgId: "org-123", conversationId: "conv-456" },
    );
    expect(res).toEqual({ manual: true });
  });
});
