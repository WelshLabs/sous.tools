import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Define the shape of our expected webhook payload
interface WebhookPayload {
  issueNumber: number;
  issueTitle: string;
  issueBody?: string;
  commentBody?: string;
  repo: string;
  event: "ready" | "resume" | "done";
  last2Comments?: string;
}

function runCommand(command: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    console.log(`\n[RUNNING] ${command}`);
    const stdout = execSync(command, { encoding: "utf-8", stdio: ["inherit", "pipe", "pipe"] });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || "",
      stderr: error.stderr?.toString() || "",
      exitCode: error.status || 1,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx kanban-orchestrator.ts <path-to-webhook.json>");
    process.exit(1);
  }

  const payloadPath = args[0];
  const payloadRaw = fs.readFileSync(path.resolve(payloadPath), "utf-8");
  const payload: WebhookPayload = JSON.parse(payloadRaw);

  const { issueNumber, issueTitle, issueBody, commentBody, repo, event } = payload;
  const githubToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error("Missing GH_TOKEN or GITHUB_TOKEN environment variable");
    process.exit(1);
  }

  // 1. Configurable parameters (True IaC)
  const COMMENT_FETCH_LIMIT = 5; // Easily change how many comments to fetch
  const AIDER_MODEL = "openai/coder";
  const LITELLM_URL = "http://litellm:4000/v1";

  console.log(`[ORCHESTRATOR] Processing event: ${event} for issue #${issueNumber}`);

  if (event === "done") {
    console.log("[ORCHESTRATOR] Auto-merge event detected. Merging PR...");
    runCommand(`gh pr merge issue-${issueNumber} --squash --delete-branch --repo ${repo}`);
    return;
  }

  // 2. Setup GitHub Labels & Git Branch
  const removeLabel = event === "ready" ? "agent:ready" : "agent:needs-input";
  runCommand(`gh issue edit ${issueNumber} --repo ${repo} --remove-label "${removeLabel}" --add-label "agent:in-progress"`);
  runCommand(`git fetch origin`);
  runCommand(`git checkout issue-${issueNumber} || git checkout -b issue-${issueNumber}`);

  // 3. Fetch Comments dynamically using gh CLI
  console.log(`[ORCHESTRATOR] Fetching last ${COMMENT_FETCH_LIMIT} comments...`);
  const commentsRes = runCommand(`gh issue view ${issueNumber} --repo ${repo} --comments ${COMMENT_FETCH_LIMIT} --json comments -q ".comments[].body"`);
  const recentComments = commentsRes.stdout || "No recent comments.";

  // 4. Construct Aider Prompt
  const promptFile = path.resolve("/workspace/.aider.prompt.txt");
  let promptContent = "";

  if (event === "ready") {
    promptContent = `[TASK]: ${issueTitle}\n[DETAILS]: ${issueBody || "None"}\n[RECENT CONVERSATION]: ${recentComments}\n\nRules:\n1. Read AGENTS.md for architectural constraints.\n2. Query Qdrant MCP FIRST.\n3. Keep changes minimal and focused.\n4. If blocked, output EXACTLY: NEEDS_INPUT: <question> and stop immediately.\n`;
  } else if (event === "resume") {
    promptContent = `[HUMAN FEEDBACK]: ${commentBody || "None"}\n[RECENT CONVERSATION]: ${recentComments}\n\nComplete task: ${issueTitle}\n`;
  }

  fs.writeFileSync(promptFile, promptContent);
  console.log(`[ORCHESTRATOR] Aider prompt written to ${promptFile}`);

  // 5. Run Aider
  const aiderCmd = `aider --model ${AIDER_MODEL} --openai-api-base ${LITELLM_URL} --openai-api-key sk-1234 --edit-format diff --no-auto-commits --yes --message-file ${promptFile}`;
  const aiderRes = runCommand(aiderCmd);

  // 6. Check for NEEDS_INPUT block
  if (aiderRes.stdout.includes("NEEDS_INPUT:")) {
    const match = aiderRes.stdout.match(/NEEDS_INPUT:\s*(.+)/);
    const question = match ? match[1].trim() : "Agent needs additional information.";
    
    console.log(`[ORCHESTRATOR] Agent is blocked: ${question}`);
    runCommand(`gh issue edit ${issueNumber} --repo ${repo} --remove-label "agent:in-progress" --add-label "agent:needs-input"`);
    runCommand(`gh issue comment ${issueNumber} --repo ${repo} --body "[NEEDS_INPUT] The autonomous agent requires additional information:\n\n> ${question}\n\nPlease reply to this comment to unblock the agent."`);
    return;
  }

  // 7. Run Tests and capture output securely
  console.log("[ORCHESTRATOR] Running tests...");
  const testRes = runCommand(`pnpm turbo typecheck 2>&1 && pnpm turbo lint 2>&1 && INFISICAL_MOCK=true pnpm turbo test 2>&1`);
  const testOutput = testRes.exitCode === 0 ? "Tests passed successfully." : testRes.stdout;

  // 8. Commit and PR
  console.log("[ORCHESTRATOR] Committing changes...");
  const commitMsg = event === "ready" ? `feat(issue-${issueNumber}): ${issueTitle}` : `fix(issue-${issueNumber}): apply human feedback`;
  runCommand(`git add .`);
  runCommand(`git commit -m "${commitMsg}" --no-verify`);
  runCommand(`git push origin HEAD:issue-${issueNumber}`);

  // Create or update PR
  console.log("[ORCHESTRATOR] Creating or updating Pull Request...");
  const prBody = `Resolves #${issueNumber}\n\n## Test Results\n\`\`\`\n${testOutput.substring(0, 2000)}\n\`\`\``;
  
  const prExists = runCommand(`gh pr view issue-${issueNumber} --repo ${repo}`);
  if (prExists.exitCode !== 0) {
    const prRes = runCommand(`gh pr create --repo ${repo} --base main --head issue-${issueNumber} --title "${commitMsg}" --body "${prBody}"`);
    console.log(`[ORCHESTRATOR] PR Created: ${prRes.stdout}`);
  } else {
    runCommand(`gh pr comment issue-${issueNumber} --repo ${repo} --body "Updated based on feedback.\n\n## Test Results\n\`\`\`\n${testOutput.substring(0, 2000)}\n\`\`\``);
    console.log(`[ORCHESTRATOR] PR Updated.`);
  }

  // 9. Sync Qdrant
  runCommand(`python3 scripts/populate_qdrant.py`);
  console.log("[ORCHESTRATOR] Pipeline complete.");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
