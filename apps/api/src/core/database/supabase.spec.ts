import { SupabaseService, supabase } from "./supabase";
import { ClsService } from "nestjs-cls";

describe("SupabaseService", () => {
  let clsService: jest.Mocked<ClsService>;
  let supabaseService: SupabaseService;

  beforeEach(() => {
    clsService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;
    supabaseService = new SupabaseService(clsService);
  });

  it("provides the singleton client instance", () => {
    expect(supabaseService.client).toBe(supabase);
  });

  it("reads orgId from CLS context", () => {
    (clsService.get as jest.Mock).mockReturnValue("org-123");
    expect(supabaseService.orgId).toBe("org-123");
    expect(supabaseService.getOrgId()).toBe("org-123");
    expect(clsService.get).toHaveBeenCalledWith("orgId");
  });

  it("reads userId from CLS context", () => {
    (clsService.get as jest.Mock).mockReturnValue("user-456");
    expect(supabaseService.userId).toBe("user-456");
    expect(supabaseService.getUserId()).toBe("user-456");
    expect(clsService.get).toHaveBeenCalledWith("userId");
  });

  it("returns undefined when CLS service is not provided or key is absent", () => {
    const standaloneService = new SupabaseService();
    expect(standaloneService.orgId).toBeUndefined();
    expect(standaloneService.userId).toBeUndefined();
  });

  it("delegates from() to underlying client", () => {
    const mockFrom = jest.spyOn(supabase, "from").mockReturnValue({} as any);
    supabaseService.from("test_table");
    expect(mockFrom).toHaveBeenCalledWith("test_table");
    mockFrom.mockRestore();
  });
});
