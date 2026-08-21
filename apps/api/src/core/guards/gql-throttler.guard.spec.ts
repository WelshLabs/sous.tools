import { GqlThrottlerGuard } from "./gql-throttler.guard";
import type { ExecutionContext } from "@nestjs/common";

describe("GqlThrottlerGuard", () => {
  let guard: GqlThrottlerGuard;

  beforeEach(() => {
    guard = new GqlThrottlerGuard(
      [{ name: "default", ttl: 60000, limit: 10 }] as any,
      {} as any,
      {} as any,
    );
  });

  it("extracts req and res from GraphQL context when type is graphql", () => {
    const mockReq = { headers: {} };
    const mockRes = { header: jest.fn() };

    const mockExecutionContext = {
      getType: () => "graphql",
      getArgs: () => [{}, {}, { req: mockReq, res: mockRes }, {}],
      getClass: () => ({}),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const result = guard.getRequestResponse(mockExecutionContext);
    expect(result).toEqual({ req: mockReq, res: mockRes });
  });

  it("delegates to super.getRequestResponse when context is http", () => {
    const mockReq = { headers: {} };
    const mockRes = { header: jest.fn() };

    const mockExecutionContext = {
      getType: () => "http",
      switchToHttp: () => ({
        getRequest: () => mockReq,
        getResponse: () => mockRes,
      }),
      getClass: () => ({}),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const result = guard.getRequestResponse(mockExecutionContext);
    expect(result).toEqual({ req: mockReq, res: mockRes });
  });
});
