import { Test, type TestingModule } from "@nestjs/testing";
import { DevicesController } from "./devices.controller";
import { DevicesService } from "./devices.service";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("DevicesController", () => {
  let controller: DevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [DevicesService],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  it("should find a device successfully", async () => {
    const mockDbDevice = {
      id: "device-1",
      organization_id: "org-1",
      name: "Device 1",
      pairing_code: "XYZ1",
      is_paired: true,
      last_seen_at: null,
      timezone: "America/New_York",
      maintenance_window: { hour: 2, minute: 0, day_of_week: null },
      created_at: "2026-06-19T00:00:00Z",
    };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDbDevice, error: null }),
    });

    const response = await controller.findOne("device-1");
    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      id: "device-1",
      organizationId: "org-1",
      name: "Device 1",
      pairingCode: "XYZ1",
      isPaired: true,
      lastSeenAt: null,
      timezone: "America/New_York",
      maintenanceWindow: { hour: 2, minute: 0, dayOfWeek: null },
      createdAt: "2026-06-19T00:00:00Z",
    });
  });

  it("should update a device successfully", async () => {
    const mockDbDevice = {
      id: "device-1",
      organization_id: "org-1",
      name: "Updated Device",
      pairing_code: "XYZ1",
      is_paired: true,
      last_seen_at: null,
      timezone: "UTC",
      maintenance_window: { hour: 4, minute: 30, day_of_week: 2 },
      created_at: "2026-06-19T00:00:00Z",
    };
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDbDevice, error: null }),
    });

    const response = await controller.update(
      "device-1",
      "Updated Device",
      "UTC",
      { hour: 4, minute: 30, dayOfWeek: 2 }
    );
    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      id: "device-1",
      organizationId: "org-1",
      name: "Updated Device",
      pairingCode: "XYZ1",
      isPaired: true,
      lastSeenAt: null,
      timezone: "UTC",
      maintenanceWindow: { hour: 4, minute: 30, dayOfWeek: 2 },
      createdAt: "2026-06-19T00:00:00Z",
    });
  });
});
