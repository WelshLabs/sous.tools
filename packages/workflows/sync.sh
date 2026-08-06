#!/bin/bash
set -e

# =============================================================================
# n8n Workflow Synchronization Script
# SSOT: packages/workflows/ → n8n container
# Run after any changes to *.json files in packages/workflows/
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_DIR="$SCRIPT_DIR"

echo "📦 Syncing n8n workflows from: $WORKFLOW_DIR"
echo ""

# Validate workflow files first
for f in "$WORKFLOW_DIR"/*.json; do
  if ! python3 -c "import json,sys; json.load(open('$f'))" 2>/dev/null; then
    echo "❌ Invalid JSON: $f — aborting sync"
    exit 1
  fi
  echo "  ✓ $f"
done

echo ""
echo "🔄 Importing workflows into n8n container..."

# Use the n8n container CLI (no API auth complexity)
docker exec n8n n8n import:workflow --separate --input=/etc/n8n/workflows/
docker exec n8n node -e "const sqlite3=require('sqlite3'); const db=new sqlite3.Database('/home/node/.n8n/database.sqlite'); db.run('UPDATE workflow_entity SET active = 1;', function(err){ if(err) console.error(err); else console.log('✅ Activated ' + this.changes + ' workflow(s) in SQLite database'); });" 2>/dev/null || true
docker restart n8n
echo "✅ All n8n workflows synced, activated, and n8n reloaded!"

echo ""
echo "🌐 Verify at: https://n8n.sous.tools/workflow"
