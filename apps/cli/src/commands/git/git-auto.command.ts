import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";
import { EnvironmentService } from "../../environment/environment.service";

interface GitAutoOptions {
  branch?: string;
  dryRun?: boolean;
}

interface ChatCompletionChoice {
  message?: {
    content?: string;
  };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
}

@Command({
  name: "git:auto",
  aliases: ["gauto", "git-auto"],
  description: "Generate AI conventional commit message using LiteLLM/Gemini and push",
})
export class GitAutoCommand extends CommandRunner {
  private readonly logger = new Logger(GitAutoCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(_params: string[], options?: GitAutoOptions): Promise<void> {
    const branch = options?.branch || "main";
    const isDryRun = options?.dryRun ?? false;

    this.envService.execSync("git add .");

    const stagedDiff = this.envService.execSync("git diff --staged");
    if (!stagedDiff || stagedDiff.trim().length === 0) {
      this.logger.log("No staged changes to commit.");
      return;
    }

    this.logger.log("Generating AI Conventional Commit Message...");
    const diffSample = stagedDiff.slice(0, 4000);

    let commitMessage = "chore(auto): auto-sync workspace update";
    const apiBase = "https://ai.sous.tools/v1";
    const apiKey = config.OPENAI_API_KEY || "sk-1234";

    try {
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a git commit assistant. Return ONLY a single line conventional commit message (e.g. feat(scope): description or fix(scope): description) for the provided git diff. Do NOT include markdown code blocks, quotes, or explanations.",
            },
            { role: "user", content: diffSample },
          ],
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as ChatCompletionResponse;
        const generated = data?.choices?.[0]?.message?.content
          ?.trim()
          ?.replace(/["`\n]/g, "");
        if (generated) {
          commitMessage = generated;
        }
      }
    } catch (err) {
      this.logger.warn(
        `LiteLLM commit generation failed (${(err as Error).message}), using fallback message.`,
      );
    }

    this.logger.log(`AI Commit Message: ${commitMessage}`);

    if (isDryRun) {
      this.logger.log("Dry run complete. No commit created.");
      return;
    }

    await this.envService.spawnInteractive("git", ["commit", "-m", commitMessage]);
    await this.envService.spawnInteractive("git", [
      "pull",
      "origin",
      branch,
      "--rebase",
    ]);
    await this.envService.spawnInteractive("git", ["push", "origin", branch]);
    this.logger.log("✅ AI commit and push complete.");
  }

  @Option({
    flags: "-b, --branch <branch>",
    description: "Target branch name (default: main)",
  })
  parseBranch(val: string): string {
    return val;
  }

  @Option({
    flags: "-d, --dry-run",
    description: "Preview the generated commit message without committing",
  })
  parseDryRun(): boolean {
    return true;
  }
}
