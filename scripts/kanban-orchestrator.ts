/**
 * Kanban Orchestrator Script (Typescript)
 *
 * n8n Execute Command Node Configuration:
 * ----------------------------------------
 * docker exec -i -e GH_TOKEN="{{ $env.GITHUB_TOKEN }}" -u 1000 agent-runner tini -s -- bash -c 'cd /workspace && head -n 1 > /tmp/webhook.json && ./node_modules/.bin/tsx scripts/kanban-orchestrator.ts /tmp/webhook.json 2>&1 | tee -a /tmp/kanban-orchestrator.log' << 'EOF_WEBHOOK'
 * {{ JSON.stringify($json) }}
 * EOF_WEBHOOK
 * ----------------------------------------
 *
 * GitHub Labels Documentation:
 *
 * Standard Workflow Labels (Trigger the agent via Webhook):
 * - "Ready"       : Starts the agent loop on a new task. Generates the first commit.
 * - "Review"      : Set automatically by the agent when it finishes a task successfully.
 * - "Done"        : Merges the PR immediately.
 *
 * Internal/State Labels (Managed automatically by this script):
 * - "agent:in-progress" : Agent is currently working on the task.
 * - "agent:needs-input" : Agent is blocked and waiting for human response.
 *
 * Modifiers (To override default behavior):
 * - "agent:heavy"       : Forces the agent to use the 'heavy' LLM model instead of the 'light' model for the first pass.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface WebhookPayload {
  issueNumber: number;
  issueTitle: string;
  issueBody?: string;
  commentBody?: string;
  repo: string;
  event: "ready" | "resume" | "done" | string;
}

function runCommand(
  command: string,
  hideOutput: boolean = false,
): { stdout: string; stderr: string; exitCode: number } {
  try {
    if (!hideOutput) console.log(`\n[RUNNING] ${command}`);

    // Always use 'pipe' so we capture the output in memory
    const stdout = execSync(command, {
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "pipe"],
    });

    // Manually print to terminal if we aren't hiding output
    if (!hideOutput && stdout) console.log(stdout.trim());

    return { stdout: stdout || "", stderr: "", exitCode: 0 };
  } catch (error: any) {
    const stdout = error.stdout?.toString() || "";
    const stderr = error.stderr?.toString() || "";

    // Ensure we print the errors to terminal too
    if (!hideOutput) {
      if (stdout) console.log(stdout.trim());
      if (stderr) console.error(stderr.trim());
    }

    return { stdout, stderr, exitCode: error.status || 1 };
  }
}

// Function to natively fetch RAG context from Qdrant via LiteLLM embeddings
async function fetchQdrantContext(queryText: string): Promise<string> {
  try {
    const LITELLM_API_KEY = "sk-1234";
    const LITELLM_URL = "http://litellm:4000/v1/embeddings";
    const QDRANT_URL =
      "http://qdrant:6333/collections/sous_tools_memory/points/search";

    // 1. Get embedding for the issue title
    const embedRes = await fetch(LITELLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LITELLM_API_KEY}`,
      },
      body: JSON.stringify({ model: "nomic-embed-text", input: queryText }),
    });
    if (!embedRes.ok) throw new Error("LiteLLM Embedding failed");
    const embedData = await embedRes.json();
    const vector = embedData.data[0].embedding;

    // 2. Search Qdrant
    const searchRes = await fetch(QDRANT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vector, limit: 3, with_payload: true }),
    });
    if (!searchRes.ok) throw new Error("Qdrant search failed");
    const searchData = await searchRes.json();

    const results = searchData.result || [];
    const contextLines = results
      .map((r: any) => r.payload.content || r.payload.text)
      .filter(Boolean);

    return contextLines.length > 0
      ? contextLines.join("\n\n---\n\n")
      : "No relevant architectural rules found in Qdrant.";
  } catch (err: any) {
    console.error(`[QDRANT ERROR] Failed to fetch RAG context: ${err.message}`);
    return "Failed to connect to Qdrant.";
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Usage: npx tsx kanban-orchestrator.ts <path-to-webhook.json>",
    );
    process.exit(1);
  }

  const payloadPath = args[0];
  const payloadRaw = fs.readFileSync(path.resolve(payloadPath), "utf-8");
  const payload: any = JSON.parse(payloadRaw);

  // Extract fields handling both flattened structures or raw n8n GitHub Webhook JSON
  const ghPayload = payload.body || payload;
  const issueNumber = payload.issueNumber || ghPayload.issue?.number;
  const issueTitle = payload.issueTitle || ghPayload.issue?.title;
  const issueBody = payload.issueBody || ghPayload.issue?.body;
  const commentBody = payload.commentBody || ghPayload.comment?.body;
  const repo = payload.repo || ghPayload.repository?.full_name;
  const event = payload.event || ghPayload.action;
  // GitHub token check removed to rely on host machine git configs

  // 1. Configurable Parameters
  const COMMENT_FETCH_LIMIT = 5;
  const LITELLM_URL = "http://litellm:4000/v1";

  // 2. Tiered Model Routing Configuration
  // Note: We use the 'openai/' prefix here because Aider requires an OpenAI-compatible endpoint.
  // These map to 'light' and 'heavy' aliases configured in litellm_config.yaml.
  const MODELS = {
    fast: "openai/light",
    heavy: "openai/heavy",
  };

  console.log(
    `[ORCHESTRATOR] Processing event: ${event} for issue #${issueNumber}`,
  );

  // Handle human Slash Commands (e.g., /approve, /abandon, /read)
  if (commentBody) {
    if (commentBody.includes("/approve")) {
      console.log("[SLASH COMMAND] /approve detected. Auto-merging PR...");
      runCommand(
        `gh pr merge issue-${issueNumber} --squash --delete-branch --repo ${repo}`,
      );
      runCommand(
        `gh issue edit ${issueNumber} --repo ${repo} --add-label "Done"`,
      );
      return;
    }
    if (commentBody.includes("/abandon")) {
      console.log("[SLASH COMMAND] /abandon detected. Closing PR and issue...");
      runCommand(`gh pr close issue-${issueNumber} --repo ${repo}`);
      runCommand(`gh issue close ${issueNumber} --repo ${repo}`);
      return;
    }
  }

  if (event === "done" || event === "Done") {
    console.log("[ORCHESTRATOR] Auto-merge event detected. Merging PR...");
    runCommand(
      `gh pr merge issue-${issueNumber} --squash --delete-branch --repo ${repo}`,
    );
    return;
  }

  // Early Exit Check: Ensure the issue actually has a trigger label before spinning up the agent
  // Extract labels directly from the webhook payload to avoid slow network calls
  const payloadLabels: any[] = ghPayload.issue?.labels || [];
  const currentLabels = payloadLabels.map((l: any) =>
    typeof l === "string" ? l : l.name,
  );

  const isAlreadyRunning = currentLabels.includes("agent:in-progress");
  if (isAlreadyRunning && !commentBody) {
    console.log(
      "[ORCHESTRATOR] Agent is already running for this issue (agent:in-progress). Ignoring duplicate webhook.",
    );
    return;
  }

  const isReady =
    currentLabels.includes("Ready") || currentLabels.includes("agent:ready");
  if (!isReady && !commentBody) {
    console.log(
      "[ORCHESTRATOR] Issue does not have 'Ready' label and no comment was provided. Exiting cleanly.",
    );
    return;
  }

  // Update Labels (reacts to standard labels, sets internal agent labels)
  const labelsToRemove = ["Ready", "agent:ready", "agent:needs-input"].filter(
    (l) => currentLabels.includes(l),
  );

  if (labelsToRemove.length > 0) {
    runCommand(
      `gh issue edit ${issueNumber} --repo ${repo} --remove-label "${labelsToRemove.join(",")}" --add-label "In Progress,agent:in-progress" || true`,
    );
  } else {
    runCommand(
      `gh issue edit ${issueNumber} --repo ${repo} --add-label "In Progress,agent:in-progress" || true`,
    );
  }

  // Create isolated workspace to prevent the agent from breaking the production server
  const workspacePath = `/tmp/agent-workspace-${issueNumber}`;
  console.log(`[ORCHESTRATOR] Creating isolated workspace at ${workspacePath}`);
  runCommand(`rm -rf ${workspacePath} || true`);

  // Use HTTPS with GH_TOKEN to bypass all SSH permission issues securely
  const gitUrl = `https://${process.env.GH_TOKEN}@github.com/${repo}.git`;
  const cloneRes = runCommand(`git clone ${gitUrl} ${workspacePath}`);
  if (cloneRes.exitCode !== 0) {
    console.error(
      "[ORCHESTRATOR] Failed to clone repository into isolated workspace!",
    );
    process.exit(1);
  }

  process.chdir(workspacePath);

  console.log(
    "[ORCHESTRATOR] Installing dependencies in isolated workspace...",
  );
  runCommand(`pnpm install --frozen-lockfile`);

  // Checkout existing branch or create a new one
  runCommand(`git fetch origin issue-${issueNumber} || true`);
  runCommand(
    `git checkout issue-${issueNumber} || git checkout -b issue-${issueNumber}`,
  );

  console.log(
    `[ORCHESTRATOR] Fetching last ${COMMENT_FETCH_LIMIT} comments...`,
  );
  const commentsRes = runCommand(
    `gh issue view ${issueNumber} --repo ${repo} --comments ${COMMENT_FETCH_LIMIT} --json comments -q ".comments[].body"`,
    true,
  );
  const recentComments = commentsRes.stdout || "No recent comments.";

  // Slash Command: Extract explicit files requested to read
  const readMatches = commentBody?.match(/\/read\s+([^\s]+)/g) || [];
  const extraFilesToRead = readMatches.map((m) => m.split(" ")[1]).join(" ");

  console.log(
    `[ORCHESTRATOR] Querying Qdrant for context related to: ${issueTitle}`,
  );
  const qdrantContext = await fetchQdrantContext(issueTitle);

  let attempt = 0;
  const maxAttempts = 3;
  let testOutput = "";
  let success = false;

  // Decide initial model based on issue labels
  const labelsRes = runCommand(
    `gh issue view ${issueNumber} --repo ${repo} --json labels -q ".labels[].name"`,
    true,
  );
  let currentModel = labelsRes.stdout.includes("agent:heavy")
    ? MODELS.heavy
    : MODELS.fast;

  const promptFile = path.resolve(`${workspacePath}/.aider.prompt.txt`);

  while (attempt < maxAttempts) {
    attempt++;
    let promptContent = "";

    if (attempt === 1) {
      if (event === "ready" || event === "Ready") {
        promptContent = `[TASK]: ${issueTitle}\n[DETAILS]: ${issueBody || "None"}\n[RECENT CONVERSATION]: ${recentComments}\n[QDRANT MEMORY]:\n${qdrantContext}\n\nRules:\n1. Read AGENTS.md for architectural constraints.\n2. Keep changes minimal and focused.\n3. If blocked, output EXACTLY: NEEDS_INPUT: <question> and stop immediately.\n`;
      } else {
        promptContent = `[HUMAN FEEDBACK]: ${commentBody || "None"}\n[RECENT CONVERSATION]: ${recentComments}\n[QDRANT MEMORY]:\n${qdrantContext}\n\nComplete task: ${issueTitle}\n`;
      }
    } else {
      console.log(
        `\n[SELF-REPAIR] Attempt ${attempt}/${maxAttempts}. Swapping to Heavy model for reasoning...`,
      );
      currentModel = MODELS.heavy;
      promptContent = `The automated test suite failed with the following errors after your last edit. Please analyze and fix them:\n\n\`\`\`\n${testOutput.substring(0, 3000)}\n\`\`\`\n`;
    }

    fs.writeFileSync(promptFile, promptContent);
    const fileArg = extraFilesToRead ? `--file ${extraFilesToRead}` : "";

    // Run Aider
    const aiderCmd = `aider --model ${currentModel} --openai-api-base ${LITELLM_URL} --openai-api-key sk-1234 --edit-format diff-fenced --no-auto-commits --yes ${fileArg} --message-file ${promptFile}`;
    const aiderRes = runCommand(aiderCmd);

    if (aiderRes.stdout.includes("NEEDS_INPUT:")) {
      const match = aiderRes.stdout.match(/NEEDS_INPUT:\s*(.+)/);
      const question = match
        ? match[1].trim()
        : "Agent needs additional information.";
      console.log(`[ORCHESTRATOR] Agent is blocked: ${question}`);

      const finalLabelsToRemove = ["In Progress", "agent:in-progress"].filter(
        (l) => currentLabels.includes(l),
      );
      if (finalLabelsToRemove.length > 0) {
        runCommand(
          `gh issue edit ${issueNumber} --repo ${repo} --remove-label "${finalLabelsToRemove.join(",")}" --add-label "agent:needs-input" || true`,
        );
      } else {
        runCommand(
          `gh issue edit ${issueNumber} --repo ${repo} --add-label "agent:needs-input" || true`,
        );
      }

      runCommand(
        `gh issue comment ${issueNumber} --repo ${repo} --body "[NEEDS_INPUT] The autonomous agent requires additional information:\n\n> ${question}\n\nPlease reply to this comment to unblock the agent."`,
      );
      process.chdir("/");
      runCommand(`rm -rf ${workspacePath} || true`);
      return;
    }

    // Deterministic Auto-Fixes before tests
    console.log(
      "[ORCHESTRATOR] Running deterministic auto-fixes (eslint/prettier) on modified files...",
    );
    runCommand(
      `git diff --name-only | grep -E '\\.(ts|tsx|js|jsx)$' | xargs -r pnpm eslint --fix || true`,
      true,
    );
    runCommand(
      `git diff --name-only | grep -E '\\.(ts|tsx|js|jsx|json|md)$' | xargs -r pnpm prettier --write || true`,
      true,
    );

    // Run Tests securely
    console.log("[ORCHESTRATOR] Running test suite...");
    const testRes = runCommand(
      `pnpm turbo typecheck 2>&1 && pnpm turbo lint 2>&1 && INFISICAL_MOCK=true pnpm turbo test 2>&1`,
    );

    if (testRes.exitCode === 0) {
      testOutput = "Tests passed successfully.";
      success = true;
      break; // Tests pass, exit loop
    } else {
      testOutput = testRes.stdout;
      console.log(`[ORCHESTRATOR] Tests failed. Retrying...`);
    }
  }

  // Commit and PR
  console.log("[ORCHESTRATOR] Committing changes...");
  const commitMsg =
    event === "ready" || event === "Ready"
      ? `feat(issue-${issueNumber}): ${issueTitle}`
      : `fix(issue-${issueNumber}): self-repair or human feedback`;
  runCommand(`git add .`);
  runCommand(`git commit -m "${commitMsg}" --no-verify || true`);
  runCommand(`git push origin HEAD:issue-${issueNumber} || true`);

  console.log("[ORCHESTRATOR] Managing Pull Request...");
  const statusIcon = success ? "✅" : "⚠️";
  const prBody = `Resolves #${issueNumber}\n\n## Test Results ${statusIcon}\n\`\`\`\n${testOutput.substring(0, 2000)}\n\`\`\``;

  const prExists = runCommand(
    `gh pr view issue-${issueNumber} --repo ${repo}`,
    true,
  );
  if (prExists.exitCode !== 0) {
    runCommand(
      `gh pr create --repo ${repo} --base main --head issue-${issueNumber} --title "${commitMsg}" --body "${prBody}"`,
    );
  } else {
    runCommand(
      `gh pr comment issue-${issueNumber} --repo ${repo} --body "Branch updated.\n\n## Test Results ${statusIcon}\n\`\`\`\n${testOutput.substring(0, 2000)}\n\`\`\``,
    );
  }

  // Final label updates
  const endLabelsToRemove = ["In Progress", "agent:in-progress"].filter((l) =>
    currentLabels.includes(l),
  );
  if (endLabelsToRemove.length > 0) {
    runCommand(
      `gh issue edit ${issueNumber} --repo ${repo} --remove-label "${endLabelsToRemove.join(",")}" --add-label "Review" || true`,
    );
  } else {
    runCommand(
      `gh issue edit ${issueNumber} --repo ${repo} --add-label "Review" || true`,
    );
  }

  // Cleanup isolated workspace
  process.chdir("/");
  runCommand(`rm -rf ${workspacePath} || true`);
  console.log(
    `[ORCHESTRATOR] Cleaned up temporary workspace. Finished successfully!`,
  );

  // Sync Qdrant
  runCommand(`python3 /workspace/scripts/populate_qdrant.py || true`);
  console.log("[ORCHESTRATOR] Pipeline complete.");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
