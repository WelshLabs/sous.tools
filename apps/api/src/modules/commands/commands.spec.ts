import { Test, TestingModule } from "@nestjs/testing";
import { ChatPersistenceService } from "./chat-persistence.service";
import { CommandsService } from "./commands.service";
import { ToolRegistryService } from "./tool-registry.service";
import { CommandsResolver } from "./commands.resolver";
import { AGENT_TRAJECTORY_TOPIC } from "./commands.types";
import { supabase } from "../../core/database/supabase";
import { PUB_SUB } from "../../core/graphql/pubsub";
import { PurchaseOrdersService } from "../items/purchase-orders.service";
import { VendorsService } from "../items/vendors.service";
import { WhiteboardService } from "../items/whiteboard.service";
import { RecipeCostService } from "../recipe/recipe-cost.service";
import { Neo4jService } from "../neo4j-sync/neo4j.service";
import { getQueueToken } from "@nestjs/bullmq";
import { OmniMessage } from "@soustools/api-types";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  },
}));

describe("ChatPersistenceService", () => {
  let service: ChatPersistenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatPersistenceService],
    }).compile();

    service = module.get<ChatPersistenceService>(ChatPersistenceService);
    jest.clearAllMocks();
  });

  it("should create new conversation if not exists and insert message", async () => {
    const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null });
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
      insert: mockInsert,
    });

    await service.appendMessage("conv-123", "org-456", "user-789", {
      id: "msg-1",
      role: "user",
      content: "Hello Sous Chef",
      timestamp: new Date(),
    });

    expect(supabase.from).toHaveBeenCalledWith("chat_conversations");
    expect(supabase.from).toHaveBeenCalledWith("chat_messages");
  });

  it("should update conversation timestamp if conversation already exists", async () => {
    const mockMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: { id: "conv-123" } });
    const mockUpdate = jest.fn().mockReturnThis();
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
      update: mockUpdate,
      insert: mockInsert,
    });

    await service.appendMessage("conv-123", "org-456", "user-789", {
      id: "msg-2",
      role: "model",
      content: "Heard, Chef.",
      timestamp: new Date(),
    });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should skip writing when conversationId or orgId is missing", async () => {
    await service.appendMessage("", "org-456", "user-789", {
      id: "msg-3",
      role: "user",
      content: "Test",
      timestamp: new Date(),
    });

    expect(supabase.from).not.toHaveBeenCalled();
  });
});

describe("CommandsService Real-Time Trajectory Emissions", () => {
  let commandsService: CommandsService;
  let mockPubSub: { publish: jest.Mock; asyncIterableIterator: jest.Mock };
  let mockPurchaseOrdersService: Partial<PurchaseOrdersService>;
  let mockVendorsService: Partial<VendorsService>;
  let mockWhiteboardService: Partial<WhiteboardService>;
  let mockRecipeCostService: Partial<RecipeCostService>;
  let mockNeo4jService: Partial<Neo4jService>;
  let mockQueue: { add: jest.Mock };
  let mockChatPersistence: Partial<ChatPersistenceService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPubSub = {
      publish: jest.fn().mockResolvedValue(undefined),
      asyncIterableIterator: jest.fn(),
    };

    mockPurchaseOrdersService = {
      addItemToDraft: jest.fn().mockResolvedValue({ id: "po-item-1" }),
    };

    mockVendorsService = {
      findAll: jest.fn().mockResolvedValue([{ id: "vendor-1", name: "Sysco" }]),
    };

    mockWhiteboardService = {
      create: jest.fn().mockResolvedValue({ id: "wb-1" }),
    };

    mockRecipeCostService = {
      getRecipeCost: jest.fn().mockResolvedValue(12.5),
    };

    mockNeo4jService = {
      runQuery: jest.fn().mockResolvedValue({ records: [] }),
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: "job-1" }),
    };

    mockChatPersistence = {
      appendMessage: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandsService,
        {
          provide: ToolRegistryService,
          useValue: {
            executeTool: jest.fn(),
            getLlmToolDefinitions: jest.fn(),
          },
        },
        {
          provide: PUB_SUB,
          useValue: { publish: jest.fn(), asyncIterableIterator: jest.fn() },
        },
        { provide: PurchaseOrdersService, useValue: mockPurchaseOrdersService },
        { provide: VendorsService, useValue: mockVendorsService },
        { provide: WhiteboardService, useValue: mockWhiteboardService },
        { provide: RecipeCostService, useValue: mockRecipeCostService },
        { provide: Neo4jService, useValue: mockNeo4jService },
        { provide: getQueueToken("ingestion"), useValue: mockQueue },
        { provide: ChatPersistenceService, useValue: mockChatPersistence },
        { provide: PUB_SUB, useValue: mockPubSub },
      ],
    }).compile();

    commandsService = module.get<CommandsService>(CommandsService);
  });

  it("should emit trajectory message to Redis PubSub and invoke callback", async () => {
    const emitCallback = jest.fn();
    const message: OmniMessage = {
      id: "msg-step-1",
      role: "agent_step",
      content: "Adding 10 lbs butter to Whiteboard...",
      timestamp: new Date("2026-08-21T00:00:00Z"),
    };

    await commandsService.emitTrajectoryMessage(
      "conv-100",
      "org-200",
      message,
      emitCallback,
    );

    expect(emitCallback).toHaveBeenCalledWith(message);
    expect(mockPubSub.publish).toHaveBeenCalledWith(
      AGENT_TRAJECTORY_TOPIC,
      expect.objectContaining({
        agentTrajectory: expect.objectContaining({
          id: "msg-step-1",
          conversationId: "conv-100",
          role: "agent_step",
          content: "Adding 10 lbs butter to Whiteboard...",
        }),
        conversationId: "conv-100",
        orgId: "org-200",
      }),
    );
  });

  it("should handle command execution and publish agent steps and final reply via PubSub", async () => {
    const originalFetch = global.fetch;
    const emitCallback = jest.fn();

    // Mock LLM call with a tool_call first, then a final model response
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: true,
          headers: new Headers(),
          json: async () => ({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: null,
                  tool_calls: [
                    {
                      id: "call-1",
                      type: "function",
                      function: {
                        name: "add_to_whiteboard",
                        arguments: JSON.stringify({
                          itemName: "Butter",
                          quantity: 5,
                          unit: "lbs",
                        }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
        };
      } else {
        return {
          ok: true,
          headers: new Headers(),
          json: async () => ({
            choices: [
              {
                message: {
                  role: "assistant",
                  content:
                    "Heard, Chef! 5 lbs of Butter has been added to the whiteboard.",
                },
              },
            ],
          }),
        };
      }
    });

    try {
      const result = await commandsService.handleCommand(
        {
          source: "omnibar",
          chatHistory: [
            {
              id: "user-msg-1",
              role: "user",
              content: "Add 5 lbs of butter to whiteboard",
              timestamp: new Date(),
            },
          ],
          context: {
            conversationId: "conv-trajectory-test",
            userId: "user-123",
          },
        },
        "org-test-1",
        emitCallback,
      );

      expect(result).toEqual({
        action: "SUCCESS",
        message:
          "Heard, Chef! 5 lbs of Butter has been added to the whiteboard.",
      });

      // WhiteboardService is no longer called directly; ToolRegistryService is used.

      // PubSub was published for agent_step and for model final result
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("should handle LLM error and publish fallback error message to PubSub", async () => {
    const originalFetch = global.fetch;
    const emitCallback = jest.fn();

    global.fetch = jest.fn().mockRejectedValue(new Error("LLM Gateway down"));

    try {
      const result = await commandsService.handleCommand(
        {
          source: "omnibar",
          chatHistory: [
            {
              id: "user-msg-err",
              role: "user",
              content: "Do something",
              timestamp: new Date(),
            },
          ],
          context: {
            conversationId: "conv-err-test",
          },
        },
        "org-err-1",
        emitCallback,
      );

      expect(result).toEqual({
        action: "ERROR",
        message: "I failed to understand that command, Chef.",
      });

      expect(mockPubSub.publish).toHaveBeenCalledWith(
        AGENT_TRAJECTORY_TOPIC,
        expect.objectContaining({
          agentTrajectory: expect.objectContaining({
            role: "model",
            content: "I failed to understand that command, Chef.",
            conversationId: "conv-err-test",
          }),
          conversationId: "conv-err-test",
          orgId: "org-err-1",
        }),
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("CommandsResolver", () => {
  let resolver: CommandsResolver;
  let mockCommandsService: Partial<CommandsService>;
  let mockPubSub: { publish: jest.Mock; asyncIterableIterator: jest.Mock };

  beforeEach(async () => {
    mockPubSub = {
      publish: jest.fn().mockResolvedValue(undefined),
      asyncIterableIterator: jest.fn().mockReturnValue("async-iterator"),
    };

    mockCommandsService = {
      getConversationMessages: jest.fn().mockResolvedValue([
        {
          id: "m-1",
          role: "agent_step",
          content: "Thinking...",
          timestamp: new Date("2026-08-21T00:00:00Z"),
        },
        {
          id: "m-2",
          role: "model",
          content: "Ready, Chef.",
          timestamp: new Date("2026-08-21T00:00:01Z"),
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandsResolver,
        { provide: CommandsService, useValue: mockCommandsService },
        { provide: PUB_SUB, useValue: mockPubSub },
      ],
    }).compile();

    resolver = module.get<CommandsResolver>(CommandsResolver);
  });

  it("should query conversation messages and map to GraphQL schema types", async () => {
    const res = await resolver.getConversationMessages("conv-123");
    expect(mockCommandsService.getConversationMessages).toHaveBeenCalledWith(
      "conv-123",
    );
    expect(res).toHaveLength(2);
    expect(res[0].id).toBe("m-1");
    expect(res[0].role).toBe("agent_step");
    expect(res[0].content).toBe("Thinking...");
    expect(res[0].conversationId).toBe("conv-123");
    expect(res[1].id).toBe("m-2");
    expect(res[1].role).toBe("model");
  });

  it("should return asyncIterableIterator for agentTrajectory subscription", () => {
    const iterator = resolver.agentTrajectory("conv-123", "org-456");
    expect(mockPubSub.asyncIterableIterator).toHaveBeenCalledWith(
      AGENT_TRAJECTORY_TOPIC,
    );
    expect(iterator).toBe("async-iterator");
  });
});
