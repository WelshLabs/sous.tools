import { Test, TestingModule } from "@nestjs/testing";
import { ChatPersistenceService } from "./chat-persistence.service";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
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
    const mockMaybeSingle = jest.fn().mockResolvedValue({ data: { id: "conv-123" } });
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
