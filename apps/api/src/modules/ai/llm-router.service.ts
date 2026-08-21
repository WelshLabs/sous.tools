import { Injectable } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";

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
