import sqlite3
import time
import os

DB_PATH = '/app/backend/data/webui.db'

print(f"Waiting for Open WebUI database at {DB_PATH}...")
for _ in range(60):
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.close()
            print("Database found and accessible.")
            break
        except Exception as e:
            pass
    time.sleep(2)
else:
    print("Database not found or not accessible. Exiting.")
    exit(1)

# Give Open WebUI a moment to initialize tables
time.sleep(5)

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. System Planner Prompt
    print("Seeding System Planner Prompt...")
    prompt_content = """Whenever a planning session results in a definitive architectural choice, technical tradeoff, or structural pattern change, automatically draft a concise ADR markdown file inside /docs/adrs/ before generating GitHub issues."""
    
    # Check if table exists (Open WebUI might name it 'prompt')
    cursor.execute("CREATE TABLE IF NOT EXISTS prompt (command TEXT PRIMARY KEY, title TEXT, content TEXT, user_id TEXT, timestamp INTEGER)")
    cursor.execute("INSERT OR REPLACE INTO prompt (command, title, content, user_id, timestamp) VALUES (?, ?, ?, ?, ?)", 
        ('system-planner', 'System Planner', prompt_content, 'admin', int(time.time())))

    # 2. Infrastructure Dashboards Tool
    print("Seeding Infrastructure Dashboards Tool...")
    tool_content = """class Tools:
    def get_dashboards(self):
        \"\"\"Get the unified infrastructure dashboards links\"\"\"
        return \"\"\"<div style="display: flex; flex-wrap: wrap; gap: 10px; height: 800px; width: 100%;">
  <div style="flex: 1 1 45%; min-width: 300px;"><h3 style="margin-bottom: 5px;">n8n Workflows</h3><iframe src="http://n8n.localhost" width="100%" height="300" style="border: 1px solid #333; border-radius: 8px;"></iframe></div>
  <div style="flex: 1 1 45%; min-width: 300px;"><h3 style="margin-bottom: 5px;">LiteLLM AI Proxy</h3><iframe src="http://ai.localhost" width="100%" height="300" style="border: 1px solid #333; border-radius: 8px;"></iframe></div>
  <div style="flex: 1 1 45%; min-width: 300px;"><h3 style="margin-bottom: 5px;">Qdrant Memory</h3><iframe src="http://qdrant.localhost:6333/dashboard" width="100%" height="300" style="border: 1px solid #333; border-radius: 8px;"></iframe></div>
</div>\"\"\"
"""
    meta_json = '{"description": "Infrastructure Dashboards", "manifest": {"title": "Infrastructure Dashboards", "author": "System", "version": "1.0.0"}}'
    cursor.execute("CREATE TABLE IF NOT EXISTS tool (id TEXT PRIMARY KEY, name TEXT, content TEXT, meta TEXT, user_id TEXT, timestamp INTEGER)")
    cursor.execute("INSERT OR REPLACE INTO tool (id, name, content, meta, user_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        ('infrastructure_dashboards', 'Infrastructure Dashboards', tool_content, meta_json, 'admin', int(time.time())))

    conn.commit()
    conn.close()
    print("Open WebUI seeding completed successfully.")

except Exception as e:
    print(f"Error seeding Open WebUI: {e}")
