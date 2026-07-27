import sqlite3
import time
import os
import json
import requests
import re
import uuid

DB_PATH = '/app/backend/data/webui.db'
WORKSPACE_PATH = '/workspace'

print(f"Waiting for Open WebUI database at {DB_PATH}...")
for _ in range(60):
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.close()
            print("Database found and accessible.")
            break
        except Exception:
            pass
    time.sleep(2)
else:
    print("Database not found or not accessible. Exiting.")
    exit(1)

# Give Open WebUI a moment to initialize tables
time.sleep(3)

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    prompt_content = """Whenever a planning session results in a definitive architectural choice, technical tradeoff, or structural pattern change, automatically draft a concise ADR markdown file inside /docs/adrs/ before generating GitHub issues."""

    # 1. Service User Creation & User Settings Update
    print("Seeding Service User & Updating Global System Prompt Settings...")
    service_user_id = "service-account-id"
    service_email = "service@sous.tools"
    cursor.execute("""
        INSERT OR REPLACE INTO user (id, name, email, role, profile_image_url, created_at, updated_at, last_active_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (service_user_id, 'Service Account', service_email, 'admin', '/user.png', int(time.time()), int(time.time()), int(time.time())))

    # Update system_prompt inside user settings for all existing users
    cursor.execute("SELECT id, settings FROM user")
    users = cursor.fetchall()
    for user_id, user_settings_raw in users:
        try:
            user_settings = json.loads(user_settings_raw) if user_settings_raw else {}
        except Exception:
            user_settings = {}
        user_settings['system_prompt'] = prompt_content
        cursor.execute("UPDATE user SET settings = ? WHERE id = ?", (json.dumps(user_settings), user_id))

    # 2. System Planner Prompt
    print("Seeding System Planner Prompt...")
    cursor.execute("CREATE TABLE IF NOT EXISTS prompt (id TEXT PRIMARY KEY, command TEXT, user_id TEXT, name TEXT, content TEXT, created_at INTEGER, updated_at INTEGER)")
    cursor.execute("INSERT OR REPLACE INTO prompt (id, command, name, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        ('system-planner', 'system-planner', 'System Planner', prompt_content, service_user_id, int(time.time()), int(time.time())))

    # 3. Infrastructure Dashboards Tool
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
    cursor.execute("CREATE TABLE IF NOT EXISTS tool (id VARCHAR PRIMARY KEY, user_id VARCHAR, name TEXT, content TEXT, specs TEXT, meta TEXT, valves TEXT, updated_at BIGINT, created_at BIGINT)")
    cursor.execute("INSERT OR REPLACE INTO tool (id, user_id, name, content, specs, meta, valves, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ('infrastructure_dashboards', service_user_id, 'Infrastructure Dashboards', tool_content, '[]', meta_json, '{}', int(time.time()), int(time.time())))

    # 4. Knowledge Base & Document Population
    print("Seeding Knowledge Base & Ingesting Context Files...")
    kb_id = "sous-tools-context"
    cursor.execute("CREATE TABLE IF NOT EXISTS knowledge (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, description TEXT, meta TEXT, created_at BIGINT, updated_at BIGINT, data TEXT)")
    cursor.execute("INSERT OR REPLACE INTO knowledge (id, user_id, name, description, meta, created_at, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (kb_id, service_user_id, 'sous.tools Architecture Context', 'Unified System & Architecture Context for sous.tools monorepo', '{}', int(time.time()), int(time.time()), '{}'))

    cursor.execute("CREATE TABLE IF NOT EXISTS file (id TEXT PRIMARY KEY, user_id TEXT, filename TEXT, meta TEXT, created_at BIGINT, hash TEXT, data TEXT, updated_at BIGINT, path TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS knowledge_file (id TEXT PRIMARY KEY, user_id TEXT, knowledge_id TEXT, file_id TEXT, created_at BIGINT, updated_at BIGINT, directory_id TEXT)")

    docs_to_ingest = ['AGENTS.md', 'README.md', 'docs/context/cto_summary.md']
    for rel_path in docs_to_ingest:
        full_path = os.path.join(WORKSPACE_PATH, rel_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                file_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, rel_path))
                meta = json.dumps({"name": os.path.basename(rel_path), "content": content})
                cursor.execute("""
                    INSERT OR REPLACE INTO file (id, user_id, filename, meta, created_at, hash, data, updated_at, path)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (file_id, service_user_id, os.path.basename(rel_path), meta, int(time.time()), '', json.dumps({"content": content}), int(time.time()), full_path))

                kf_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"kf_{rel_path}"))
                cursor.execute("""
                    INSERT OR REPLACE INTO knowledge_file (id, user_id, knowledge_id, file_id, created_at, updated_at, directory_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (kf_id, service_user_id, kb_id, file_id, int(time.time()), int(time.time()), None))
                print(f"Ingested {rel_path} into Knowledge Base.")
            except Exception as err:
                print(f"Error ingesting {rel_path}: {err}")

    # 5. Tool Server Connections (MCPO) with Enable Flag
    print("Seeding MCPO Tool Server Connections (Enabled)...")
    connections = []
    try:
        r = requests.get('http://mcpo:8000/openapi.json', timeout=5)
        if r.status_code == 200:
            desc = r.json().get('info', {}).get('description', '')
            servers = re.findall(r'\[(.*?)\]\(/(.*?)/docs\)', desc)
            for name, path in servers:
                connections.append({
                    "url": "http://mcpo:8000",
                    "path": f"{path}/openapi.json",
                    "type": "openapi",
                    "auth_type": "none",
                    "key": None,
                    "config": {"enable": True},
                    "info": {
                        "id": f"mcpo_{path}",
                        "name": f"MCPO {name.title()}"
                    }
                })
    except Exception as err:
        print(f"Could not fetch dynamic MCPO servers: {err}")

    if not connections:
        default_paths = ['open-terminal', 'filesystem', 'memory', 'sequential-thinking', 'redis', 'neo4j', 'docker']
        for path in default_paths:
            connections.append({
                "url": "http://mcpo:8000",
                "path": f"{path}/openapi.json",
                "type": "openapi",
                "auth_type": "none",
                "key": None,
                "config": {"enable": True},
                "info": {
                    "id": f"mcpo_{path}",
                    "name": f"MCPO {path.title()}"
                }
            })

    cursor.execute("CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT, updated_at BIGINT)")
    cursor.execute("INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, ?)",
        ('tool_server.connections', json.dumps(connections), int(time.time())))

    conn.commit()
    conn.close()
    print("Open WebUI unified seeding completed successfully.")

except Exception as e:
    print(f"Error seeding Open WebUI: {e}")
