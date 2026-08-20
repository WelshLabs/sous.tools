import { Command, CommandRunner } from "nest-commander";
import { Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import { EnvironmentService } from "../../environment/environment.service";

@Command({
  name: "ctx",
  aliases: ["context:summary", "context-summary"],
  description: "Display the CTO executive summary and codebase audit status",
})
export class ContextSummaryCommand extends CommandRunner {
  private readonly logger = new Logger(ContextSummaryCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    const root = this.envService.getSousRoot();
    const summaryPath = path.join(root, "docs/context/cto_summary.md");

    if (fs.existsSync(summaryPath)) {
      const content = fs.readFileSync(summaryPath, "utf8");
      console.log(content);
    } else {
      this.logger.warn(
        "No generated cto_summary.md found. Run \"pnpm run report:all\" or trigger reporting workflow.",
      );
    }
  }
}
