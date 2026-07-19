#!/bin/bash
# Usage: bash .github/agents/run-agent.sh <label_type> <issue_number>

set -a
source /workspace/.env
set +a

export CI=true
export FORCE_COLOR=0

LABEL=$1
ISSUE=$2
FILE_NAME=${LABEL#*:}
PROMPT_FILE="/workspace/docs/agents/prompts/${FILE_NAME}.md"
LOG_FILE="/workspace/docs/agents/logs/agent-run-${ISSUE}.log"

# Global Git auth for native pushes
git config --global url."https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/".insteadOf "git@github.com:"
git config --global url."https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/".insteadOf "https://github.com/"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: Prompt file $PROMPT_FILE not found!" >> "$LOG_FILE"
  exit 1
fi

echo "Booting Agent for Issue $ISSUE with label $LABEL..." > "$LOG_FILE"

# Inject the dynamic issue number into the markdown prompt
PROMPT=$(sed "s/{ISSUE_NUMBER}/$ISSUE/g" "$PROMPT_FILE")

# Execute Claude, pipe output to log, and pass /dev/null to prevent interactive hanging
timeout 15m claude --dangerously-skip-permissions --model claude-3-5-sonnet-20241022 "$PROMPT" < /dev/null >> "$LOG_FILE" 2>&1