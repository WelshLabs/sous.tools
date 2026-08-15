/**
 * Kanban Orchestrator Script (Typescript)
 *
 * Modified to exclusively use native Organization Projects V2 Webhooks (no labels).
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function runCommand(
  command: string,
  hideOutput: boolean = false,
): { stdout: string; stderr: string; exitCode: number } {
  try {
    if (!hideOutput) console.log(`\n[RUNNING] ${command}`);
    const stdout = execSync(command, {
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "pipe"],
    });
    if (!hideOutput && stdout) console.log(stdout.trim());
    return { stdout: stdout || "", stderr: "", exitCode: 0 };
  } catch (error: any) {
    const stdout = error.stdout?.toString() || "";
    const stderr = error.stderr?.toString() || "";
    if (!hideOutput) {
      if (stdout) console.log(stdout.trim());
      if (stderr) console.error(stderr.trim());
    }
    return { stdout, stderr, exitCode: error.status || 1 };
  }
}

async function fetchQdrantContext(queryText: string): Promise<string> {
  try {
    const LITELLM_API_KEY = "sk-1234";
    const LITELLM_URL = "http://litellm:4000/v1/embeddings";
    const QDRANT_URL =
      "http://qdrant:6333/collections/sous_tools_memory/points/search";

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
  const ghPayload = payload.body || payload;

  let issueNumber = ghPayload.issue?.number;
  let issueTitle = ghPayload.issue?.title;
  let issueBody = ghPayload.issue?.body;
  let issueUrl = ghPayload.issue?.html_url;
  let commentBody = ghPayload.comment?.body;
  let repo = ghPayload.repository?.full_name || "WelshLabs/sous.tools";
  let event = ghPayload.action;

  const PROJECT_NUMBER = 1;
  const PROJECT_OWNER = "WelshLabs";

  // Handle Organization Webhook for Kanban Board Dragging
  if (
    ghPayload.projects_v2_item &&
    ghPayload.projects_v2_item.content_type === "Issue"
  ) {
    const contentNodeId = ghPayload.projects_v2_item.content_node_id;
    const newStatus = ghPayload.changes?.field_value?.to?.name;

    console.log(
      `[ORCHESTRATOR] Kanban Card moved to: ${newStatus}. Fetching Issue details for node: ${contentNodeId}`,
    );

    // Fetch issue details using GraphQL
    const gqlCmd = `gh api graphql -F id="${contentNodeId}" -f query='query($id: ID!) { node(id: $id) { ... on Issue { number title body url repository { nameWithOwner } } } }'`;
    const gqlRes = runCommand(gqlCmd, true);

    if (gqlRes.exitCode === 0) {
      try {
        const gqlData = JSON.parse(gqlRes.stdout).data.node;
        issueNumber = gqlData.number;
        issueTitle = gqlData.title;
        issueBody = gqlData.body;
        issueUrl = gqlData.url;
        repo = gqlData.repository.nameWithOwner;

        if (newStatus === "Ready") {
          event = "ready";
        } else if (newStatus === "Done") {
          event = "done";
        } else {
          console.log(
            `[ORCHESTRATOR] Kanban card was dragged to ${newStatus}, ignoring.`,
          );
          return;
        }
      } catch (err) {
        console.error(
          "[ORCHESTRATOR] Failed to parse GraphQL response for project item.",
        );
        process.exit(1);
      }
    } else {
      console.error(
        "[ORCHESTRATOR] GraphQL query failed to fetch issue details.",
      );
      process.exit(1);
    }
  }

  // Early Exit Check
  const isReady = event === "ready" || event === "Ready";
  const isComment = !!commentBody;
  const isDone = event === "done" || event === "Done";

  if (!isReady && !isComment && !isDone) {
    console.log(
      "[ORCHESTRATOR] Webhook is not 'Ready', 'Done', or a comment. Exiting cleanly.",
    );
    return;
  }

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
      if (issueUrl)
        runCommand(
          `gh project item-edit ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url "${issueUrl}" --field "Status" --value "Done" || true`,
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

  if (isDone) {
    console.log("[ORCHESTRATOR] Auto-merge event detected. Merging PR...");
    runCommand(
      `gh pr merge issue-${issueNumber} --squash --delete-branch --repo ${repo}`,
    );
    return;
  }

  // Update Kanban Board Status
  if (issueUrl) {
    runCommand(
      `gh project item-edit ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url "${issueUrl}" --field "Status" --value "In Progress" || true`,
    );
  }

  const COMMENT_FETCH_LIMIT = 5;
  const LITELLM_URL = "http://litellm:4000/v1";
  const MODELS = { fast: "openai/coder", heavy: "openai/planner" };

  const workspacePath = `/tmp/agent-workspace-${issueNumber}`;
  console.log(`[ORCHESTRATOR] Creating isolated workspace at ${workspacePath}`);
  runCommand(`rm -rf ${workspacePath} || true`);

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

  const readMatches = commentBody?.match(/\/read\s+([^\s]+)/g) || [];
  const extraFilesToRead = readMatches.map((m) => m.split(" ")[1]).join(" ");

  let scopedFiles = "";
  let validationCommand =
    "pnpm turbo typecheck 2>&1 && pnpm turbo lint 2>&1 && INFISICAL_MOCK=true pnpm turbo test 2>&1"; // default

  if (issueBody) {
    const filesMatch = issueBody.match(
      /### Files in Scope\n([\s\S]*?)(?=\n###|$)/,
    );
    if (filesMatch) {
      const files = filesMatch[1]
        .split("\n")
        .map((line) => line.replace(/^- /, "").replace(/`/g, "").trim())
        .filter(Boolean);
      scopedFiles = files.join(" ");
    }
    const validationMatch = issueBody.match(
      /### Validation Command\n([\s\S]*?)(?=\n###|$)/,
    );
    if (validationMatch) {
      const rawCmd = validationMatch[1].trim().replace(/^`+|`+$/g, "");
      if (rawCmd) validationCommand = rawCmd;
    }
  }

  const allFiles = [extraFilesToRead, scopedFiles].filter(Boolean).join(" ");
  const fileArg = allFiles ? `${allFiles}` : "";

  console.log(
    `[ORCHESTRATOR] Querying Qdrant for context related to: ${issueTitle}`,
  );
  const qdrantContext = await fetchQdrantContext(issueTitle);

  let attempt = 0;
  const maxAttempts = 3;
  let testOutput = "";
  let success = false;
  let currentModel = MODELS.fast;

  const promptFile = path.resolve(`${workspacePath}/.aider.prompt.txt`);

  while (attempt < maxAttempts) {
    attempt++;
    let promptContent = "";

    if (attempt === 1) {
      if (isReady) {
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

    const aiderCmd = `aider --model ${currentModel} --openai-api-base ${LITELLM_URL} --openai-api-key sk-1234 --edit-format diff-fenced --no-auto-commits --yes --map-tokens 0 --message-file ${promptFile} ${fileArg}`;
    const aiderRes = runCommand(aiderCmd);

    if (aiderRes.stdout.includes("NEEDS_INPUT:")) {
      const match = aiderRes.stdout.match(/NEEDS_INPUT:\s*(.+)/);
      const question = match
        ? match[1].trim()
        : "Agent needs additional information.";
      console.log(`[ORCHESTRATOR] Agent is blocked: ${question}`);

      runCommand(
        `gh issue comment ${issueNumber} --repo ${repo} --body "[NEEDS_INPUT] The autonomous agent requires additional information:\n\n> ${question}\n\nPlease reply to this comment to unblock the agent."`,
      );

      // Move to Needs Input column to signify waiting
      if (issueUrl)
        runCommand(
          `gh project item-edit ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url "${issueUrl}" --field "Status" --value "Needs Input" || true`,
        );

      process.chdir("/");
      runCommand(`rm -rf ${workspacePath} || true`);
      return;
    }

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

    console.log(
      `[ORCHESTRATOR] Running validation command: ${validationCommand}`,
    );
    const testRes = runCommand(validationCommand);

    if (testRes.exitCode === 0) {
      testOutput = "Tests passed successfully.";
      success = true;
      break;
    } else {
      testOutput = testRes.stdout;
      console.log(`[ORCHESTRATOR] Tests failed. Retrying...`);
    }
  }

  console.log("[ORCHESTRATOR] Committing changes...");
  const commitMsg = isReady
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

  if (issueUrl)
    runCommand(
      `gh project item-edit ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url "${issueUrl}" --field "Status" --value "Review" || true`,
    );

  process.chdir("/");
  runCommand(`rm -rf ${workspacePath} || true`);
  console.log(
    `[ORCHESTRATOR] Cleaned up temporary workspace. Finished successfully!`,
  );

  runCommand(`python3 /workspace/scripts/populate_qdrant.py || true`);
  console.log("[ORCHESTRATOR] Pipeline complete.");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
