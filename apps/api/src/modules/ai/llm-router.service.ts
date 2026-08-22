import { Injectable } from "@nestjs/common";

export enum LlmTier {
  OLLAMA = "ollama",
  FLASH = "flash",
  PRO = "pro",
}

@Injectable()
export class LlmRouterService {
  route(taskComplexity: "low" | "medium" | "high"): LlmTier {
    if (taskComplexity === "low") {
      return LlmTier.OLLAMA;
    }
    if (taskComplexity === "medium") {
      return LlmTier.FLASH;
    }
    return LlmTier.PRO;
  }
}
