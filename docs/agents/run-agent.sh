#!/bin/bash
# Usage: bash docs/agents/run-agent.sh <label_type> <issue_number>

set -a
# Try to load env from /workspace/.env if it exists
if [ -f /workspace/.env ]; then
  source /workspace/.env
fi
set +a

export CI=true
export FORCE_COLOR=0

LABEL=$1
ISSUE=$2
FILE_NAME=${LABEL#*:}
PROMPT_FILE="/workspace/docs/agents/prompts/${FILE_NAME}.md"
LOG_FILE="/workspace/docs/agents/logs/agent-run-${ISSUE}.log"

# Verify log directory exists
mkdir -p /workspace/docs/agents/logs

if [ -z "$LABEL" ] || [ -z "$ISSUE" ]; then
  echo "Error: Usage: bash docs/agents/run-agent.sh <label_type> <issue_number>" >> "$LOG_FILE"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: Prompt file $PROMPT_FILE not found!" >> "$LOG_FILE"
  exit 1
fi

echo "Booting Agent for Issue $ISSUE with label $LABEL..." > "$LOG_FILE"

# Check GITHUB_PERSONAL_ACCESS_TOKEN
if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN is not set." >> "$LOG_FILE"
  exit 1
fi

# Global Git auth for native pushes using token
# git config --global url."https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/".insteadOf "git@github.com:"
# git config --global url."https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/".insteadOf "https://github.com/"

# Configure git credentials if not set
git config --global user.name "Soustools Agent"
git config --global user.email "agent@sous.tools"

# Generate Claude Code global MCP configuration
mkdir -p ~/.config
cat <<EOF > ~/.claude.json
{
  "mcpServers": {
    "soustools": {
      "command": "pnpm",
      "args": ["--filter", "./packages/mcp-server", "exec", "tsx", "index.ts"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
EOF

# Inject the dynamic issue number into the markdown prompt
PROMPT=$(sed "s/{ISSUE_NUMBER}/$ISSUE/g" "$PROMPT_FILE")

# Execute Claude, pipe output to log, and pass /dev/null to prevent interactive hanging
timeout 15m claude --dangerously-skip-permissions --model claude-3-5-sonnet-20241022 "$PROMPT" < /dev/null >> "$LOG_FILE" 2>&1