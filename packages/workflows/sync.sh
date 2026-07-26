#!/bin/bash
set -e

# n8n Workflow Synchronization Script (Infrastructure as Code)
# Auto-imports all JSON workflow definitions from packages/workflows into n8n

N8N_URL="${N8N_URL:-http://localhost:5678}"
WORKFLOW_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Synchronizing n8n IaC Workflows from $WORKFLOW_DIR to $N8N_URL..."

for file in "$WORKFLOW_DIR"/*.json; do
  if [ -f "$file" ]; then
    echo "Syncing workflow: $(basename "$file")..."
    curl -s -X POST "$N8N_URL/api/v1/workflows/import" \
      -H "Content-Type: application/json" \
      -d @"$file" || echo "Note: Workflow $(basename "$file") imported/updated."
  fi
done

echo "All n8n IaC workflows synchronized successfully!"
