import { SupabaseAuthGuard } from "./supabase-auth.guard";
import { UnauthorizedException } from "@nestjs/common";

describe("SupabaseAuthGuard", () => {
  let guard: SupabaseAuthGuard;
  let mockSupabaseService: any;
  let mockClsService: any;

  beforeEach(() => {
    mockSupabaseService = {
      client: {
        auth: {
          getUser: jest.fn(),
        },
      },
    };
    mockClsService = {
      set: jest.fn(),
      get: jest.fn(),
    };
    guard = new SupabaseAuthGuard(mockSupabaseService, mockClsService);
  });

  const createMockContext = (
    headers: any = {},
    cookies: any = {},
    query: any = {},
  ) => {
    const req = {
      headers,
      cookies,
      query,
      user: undefined,
    };
    return {
      getType: () => "http",
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getClass: () => ({}),
      getHandler: () => ({}),
      req,
    } as any;
  };

  const createMockGqlContext = (
    headers: any = {},
    cookies: any = {},
    query: any = {},
  ) => {
    const req = {
      headers,
      cookies,
      query,
      user: undefined,
    };
    return {
      getType: () => "graphql",
      getArgs: () => [{}, {}, { req }, {}],
      getClass: () => ({}),
      getHandler: () => ({}),
      req,
    } as any;
  };

  it("throws UnauthorizedException when no token is present", async () => {
    const ctx = createMockContext();
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it("authenticates valid Bearer token and sets user and CLS orgId / userId", async () => {
    const ctx = createMockContext({
      authorization: "Bearer valid-token",
    });

    const mockUser = {
      id: "user-123",
      user_metadata: {
        organization_id: "org-abc",
      },
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(ctx.req.user).toEqual(mockUser);
    expect(mockClsService.set).toHaveBeenCalledWith("orgId", "org-abc");
    expect(mockClsService.set).toHaveBeenCalledWith("userId", "user-123");
  });

  it("authenticates valid cookie token when auth header is missing", async () => {
    const ctx = createMockContext({}, { "sb-access-token": "cookie-token" });

    const mockUser = {
      id: "user-456",
      user_metadata: {},
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(ctx.req.user).toEqual(mockUser);
    expect(mockClsService.set).toHaveBeenCalledWith("userId", "user-456");
  });

  it("falls back to x-org-id header if organization_id is not in user metadata", async () => {
    const ctx = createMockContext({
      authorization: "Bearer valid-token",
      "x-org-id": "header-org-999",
    });

    const mockUser = {
      id: "user-789",
      user_metadata: {},
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockClsService.set).toHaveBeenCalledWith("orgId", "header-org-999");
  });

  it("authenticates GraphQL execution context properly", async () => {
    const ctx = createMockGqlContext({
      authorization: "Bearer gql-token",
    });

    const mockUser = {
      id: "gql-user",
      user_metadata: {
        organization_id: "gql-org",
      },
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(ctx.req.user).toEqual(mockUser);
    expect(mockClsService.set).toHaveBeenCalledWith("orgId", "gql-org");
    expect(mockClsService.set).toHaveBeenCalledWith("userId", "gql-user");
  });

  it("throws UnauthorizedException on invalid or expired token", async () => {
    const ctx = createMockContext({
      authorization: "Bearer invalid-token",
    });

    mockSupabaseService.client.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("JWT expired"),
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
