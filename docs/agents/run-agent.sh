#!/bin/bash
# Usage: bash docs/agents/run-agent.sh <label_type> <issue_number>
# Example: bash docs/agents/run-agent.sh agent:plan 88

# 1. Source the environment to get the GitHub PAT
set -a
source /workspace/.env
set +a

LABEL=$1
ISSUE=$2
LOG_FILE="/workspace/docs/agents/logs/agent-run-${ISSUE}.log"

# 2. Strip the 'agent:' prefix from the label to get the exact filename
# (e.g., "agent:plan" becomes "plan", "agent:ui" becomes "ui")
FILE_NAME=${LABEL#*:}
PROMPT_FILE="/workspace/docs/agents/prompts/${FILE_NAME}.md"

echo "Booting Agent for Issue $ISSUE with label $LABEL..." > "$LOG_FILE"

# 3. Force headless environment to prevent zombie terminal prompts
export CI=true
export FORCE_COLOR=0

# 4. Inject global Git authentication so agents can push branches
git config --global url."https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/".insteadOf "git@github.com:"
git config --global url."https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/".insteadOf "https://github.com/"

# 5. Verify the prompt file exists before running
if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: Prompt file $PROMPT_FILE not found!" >> "$LOG_FILE"
  exit 1
fi

# 6. Inject the dynamic issue number into the markdown prompt
PROMPT=$(sed "s/{ISSUE_NUMBER}/$ISSUE/g" "$PROMPT_FILE")

# 7. Execute Claude with the safety wrapper, piping all output to the log
timeout 20m claude --dangerously-skip-permissions --model claude-3-5-sonnet-20241022 "$PROMPT" < /dev/null >> "$LOG_FILE" 2>&1

# 8. Check exit status and execute the curl fail-safe
if [ $? -ne 0 ]; then
  echo "AGENT FAILED OR TIMED OUT." >> "$LOG_FILE"
  
  # The cURL command to post the failure to the GitHub Issue
  curl -s -X POST -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/conarwelsh/sous.tools/issues/${ISSUE}/comments" \
    -d '{
      "body": "⚠️ **Agent Execution Failed or Timed Out.**\n\nTask: `'"$LABEL"'`\n\nI encountered a critical error or hit my 15-minute execution limit. Please check the logs on the Oracle Server at `'"$LOG_FILE"'` to see what went wrong."
    }'
fi