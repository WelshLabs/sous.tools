import { Test, TestingModule } from "@nestjs/testing";
import { PosWebhookController } from "./pos-webhook.controller";
import { Queue } from "bullmq";
import { getQueueToken } from "@nestjs/bullmq";
import { supabase } from "../../lib/supabase";
import { UnauthorizedException, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { SquareDriver } from "./drivers/square/square.driver";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("PosWebhookController", () => {
  let controller: PosWebhookController;
  let queue: Queue;

  const mockQueue = {
    add: jest.fn(),
  };

  const mockSquareDriver = {
    verifyWebhookSignature: jest.fn().mockReturnValue(true),
    normalizeWebhookEvent: jest.fn((payload) => ({
      eventId: payload.event_id || "",
      merchantId: payload.merchant_id,
      eventType: "catalog.updated",
      data: payload.data || {},
    })),
  };

  beforeEach(async () => {
    mockQueue.add.mockReset();
    jest.clearAllMocks();
    mockSquareDriver.verifyWebhookSignature.mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosWebhookController],
      providers: [
        {
          provide: getQueueToken("pos-sync"),
          useValue: mockQueue,
        },
        {
          provide: SquareDriver,
          useValue: mockSquareDriver,
        },
      ],
    }).compile();

    controller = module.get<PosWebhookController>(PosWebhookController);
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
      controller.handleWebhook("square", "sig", "", mockReq),
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
        }),
      ),
    } as unknown as Request;

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "processed_webhook_events") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    await expect(
      controller.handleWebhook("square", "sig", "", mockReq),
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
        }),
      ),
    } as unknown as Request;

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "processed_webhook_events") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          insert: jest.fn().mockResolvedValue({ error: null }),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === "integrations") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { organization_id: "org-uuid-123", settings: {} },
            error: null,
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const result = await controller.handleWebhook("square", "sig", "", mockReq);
    expect(result).toEqual({ status: "queued" });
    expect(queue.add).toHaveBeenCalledWith("pos-sync-job", {
      orgId: "org-uuid-123",
      type: "webhook-inventory",
      eventType: "catalog.updated",
      payload: { id: "event-1", object: { key: "val" } },
    });
  });
});
