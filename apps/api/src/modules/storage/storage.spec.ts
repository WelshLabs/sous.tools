import { Test, TestingModule } from "@nestjs/testing";
import { StorageService } from "./storage.service";
import { StorageResolver } from "./storage.resolver";
import { SupabaseService } from "../../core/database/supabase";

describe("StorageModule", () => {
  let storageService: StorageService;
  let storageResolver: StorageResolver;
  let mockSupabaseService: any;

  beforeEach(async () => {
    mockSupabaseService = {
      userId: "user-test-123",
      getUserId: jest.fn().mockReturnValue("user-test-123"),
      client: {
        storage: {
          from: jest.fn().mockReturnValue({
            createSignedUploadUrl: jest.fn().mockResolvedValue({
              data: {
                signedUrl:
                  "https://mock.supabase.co/storage/v1/object/upload/sign/ingestion-sources/user-test-123/file.png?token=mock-token",
                token: "mock-token",
                path: "user-test-123/file.png",
              },
              error: null,
            }),
            getPublicUrl: jest.fn().mockReturnValue({
              data: {
                publicUrl:
                  "https://mock.supabase.co/storage/v1/object/public/ingestion-sources/user-test-123/file.png",
              },
            }),
          }),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        StorageResolver,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    storageService = module.get<StorageService>(StorageService);
    storageResolver = module.get<StorageResolver>(StorageResolver);
  });

  describe("StorageService", () => {
    it("generates a signed upload URL and public URL using Supabase storage API", async () => {
      const result = await storageService.generateUploadUrl(
        "invoice.pdf",
        "user-123",
      );

      expect(result).toBeDefined();
      expect(result.signedUrl).toContain("token=mock-token");
      expect(result.publicUrl).toContain("ingestion-sources");
      expect(result.filePath).toMatch(/^user-123\/[0-9a-f-]+\.pdf$/);
      expect(result.token).toBe("mock-token");
    });
  });

  describe("StorageResolver", () => {
    it("resolves generateUploadUrl mutation for authenticated user", async () => {
      const mockContext = {
        req: {
          user: { id: "user-gql-456" },
        },
      };

      const result = await storageResolver.generateUploadUrl(
        { fileName: "recipe.jpg" },
        mockContext,
      );
      expect(result).toBeDefined();
      expect(result.signedUrl).toBeDefined();
      expect(result.publicUrl).toBeDefined();
    });
  });
});
