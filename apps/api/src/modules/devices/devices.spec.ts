import { Test, TestingModule } from "@nestjs/testing";
import { DevicesResolver } from "./devices.resolver";
import { DevicesService } from "./devices.service";
import { supabase } from "../../core/database/supabase";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("DevicesResolver", () => {
  let resolver: DevicesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesResolver, DevicesService],
    }).compile();

    resolver = module.get<DevicesResolver>(DevicesResolver);
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

    const response = await resolver.getDevice("device-1");
    expect(response).toEqual({
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
});
