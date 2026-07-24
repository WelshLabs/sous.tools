import { Test, TestingModule } from "@nestjs/testing";
import { KnowledgeIngestionProcessor } from "./knowledge-ingestion.processor";
import { chunkText } from "./knowledge-chunker.util";

describe("KnowledgeIngestionProcessor", () => {
  let processor: KnowledgeIngestionProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeIngestionProcessor],
    }).compile();

    processor = module.get<KnowledgeIngestionProcessor>(
      KnowledgeIngestionProcessor,
    );
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });

  it("should split long text into paragraph-aware chunks", () => {
    const sampleText = Array(30)
      .fill(
        "This is a paragraph of text meant to simulate extracted knowledge document content.",
      )
      .join("\n\n");

    const chunks = chunkText(sampleText, 500, 50);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeGreaterThan(0);
    }
  });
});
