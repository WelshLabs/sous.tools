import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import { EnvironmentService } from "../../environment/environment.service";

interface GitPushOptions {
  branch?: string;
}

@Command({
  name: "git:push",
  aliases: ["gpush", "git-push"],
  arguments: "<message...>",
  description: "Stage all changes, commit with message, rebase pull, and push",
})
export class GitPushCommand extends CommandRunner {
  private readonly logger = new Logger(GitPushCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: GitPushOptions,
  ): Promise<void> {
    const message = passedParams.join(" ").trim();
    if (!message) {
      this.logger.error("You must provide a commit message.");
      this.logger.log("Usage: sous git:push \"feat(core): your message\"");
      return;
    }

    const branch = options?.branch || "main";
    this.logger.log(`Committing and pushing to origin/${branch}...`);

    await this.envService.spawnInteractive("git", ["add", "."]);
    await this.envService.spawnInteractive("git", ["commit", "-m", message]);
    await this.envService.spawnInteractive("git", [
      "pull",
      "origin",
      branch,
      "--rebase",
    ]);
    await this.envService.spawnInteractive("git", ["push", "origin", branch]);
    this.logger.log("✅ Changes committed and pushed successfully.");
  }

  @Option({
    flags: "-b, --branch <branch>",
    description: "Target branch name (default: main)",
  })
  parseBranch(val: string): string {
    return val;
  }
}
