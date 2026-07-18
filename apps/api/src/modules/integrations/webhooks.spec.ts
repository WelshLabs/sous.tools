import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksController } from "./webhooks.controller";
import { Queue } from "bullmq";
import { getQueueToken } from "@nestjs/bullmq";
import { supabase } from "../../lib/supabase";
import { UnauthorizedException, NotFoundException } from "@nestjs/common";
import { Request } from "express";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe("WebhooksController", () => {
  let controller: WebhooksController;
  let queue: Queue;

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    mockQueue.add.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: getQueueToken("pos-sync"),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    queue = module.get<Queue>(getQueueToken("pos-sync"));
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should throw UnauthorizedException if event_id is missing", async () => {
    const mockReq = {
      rawBody: Buffer.from(JSON.stringify({ type: "catalog.version.updated" })),
    } as unknown as Request;

    await expect(
      controller.handleWebhook("square", "sig", "", mockReq)
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw NotFoundException if no integration matches the merchant_id", async () => {
    const mockReq = {
      rawBody: Buffer.from(
        JSON.stringify({
          event_id: "event-123",
          merchant_id: "merchant-123",
          type: "catalog.version.updated",
          data: { id: "event-1", object: {} },
        })
      ),
    } as unknown as Request;

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    await expect(
      controller.handleWebhook("square", "sig", "", mockReq)
    ).rejects.toThrow(NotFoundException);
  });

  it("should queue the sync job and return status queued when integration exists", async () => {
    const mockReq = {
      rawBody: Buffer.from(
        JSON.stringify({
          event_id: "event-123",
          merchant_id: "merchant-123",
          type: "catalog.version.updated",
          data: { id: "event-1", object: { key: "val" } },
        })
      ),
    } as unknown as Request;

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { organization_id: "org-uuid-123" },
        error: null,
      }),
    });

    const result = await controller.handleWebhook("square", "sig", "", mockReq);
    expect(result).toEqual({ status: "queued" });
    expect(queue.add).toHaveBeenCalledWith("pos-sync-job", {
      orgId: "org-uuid-123",
      type: "webhook-inventory",
      payload: { id: "event-1", object: { key: "val" } },
    });
  });
});
