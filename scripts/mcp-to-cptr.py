#!/usr/bin/env python3
"""
scripts/mcp-to-cptr.py
Converts the repo-canonical mcp_config.json (standard Claude/AGY format)
into cptr's tool_servers JSON format and injects it into .cptr/config.toml.

Run at cptr container startup to ensure cptr always uses the repo-level MCP SSOT.
"""
import json
import re
import sys
import os

REPO_ROOT = os.environ.get("SOUS_TOOLS_ROOT", "/sous.tools")
MCP_CONFIG = os.path.join(REPO_ROOT, "mcp_config.json")
CPTR_CONFIG = os.path.join(os.path.expanduser("~"), ".cptr", "config.toml")


def convert_server(server_id: str, config: dict) -> dict:
    """Convert a standard MCP server entry to cptr's tool_servers format."""
    url = config.get("url", "")
    command = config.get("command", "")
    args = config.get("args", [])
    env = config.get("env", None)

    # Determine type: if url is set it's a remote MCP, otherwise stdio
    if url:
        server_type = "mcp"
    else:
        server_type = "mcp_stdio"

    return {
        "id": server_id,
        "type": server_type,
        "url": url,
        "path": "openapi.json",
        "auth_type": "bearer",
        "key": "",
        "name": server_id.replace("_", " ").replace("-", " ").title(),
        "description": "",
        "headers": None,
        "enabled": True,
        "command": command,
        "args": args,
        "env": env,
        "cwd": None,
    }


def main():
    if not os.path.exists(MCP_CONFIG):
        print(f"[mcp-to-cptr] mcp_config.json not found at {MCP_CONFIG}, skipping.")
        sys.exit(0)

    if not os.path.exists(CPTR_CONFIG):
        print(f"[mcp-to-cptr] cptr config.toml not found at {CPTR_CONFIG}, skipping.")
        sys.exit(0)

    with open(MCP_CONFIG) as f:
        mcp_data = json.load(f)

    servers = mcp_data.get("mcpServers", {})
    tool_servers = [convert_server(sid, scfg) for sid, scfg in servers.items()]
    tool_servers_json = json.dumps(tool_servers, separators=(",", ":"))

    with open(CPTR_CONFIG) as f:
        toml_content = f.read()

    # Replace the tool_servers line in config.toml
    new_line = f'tool_servers = "{tool_servers_json.replace(chr(34), chr(92) + chr(34))}"\n'
    if 'tool_servers = ' in toml_content:
        toml_content = re.sub(r'^tool_servers = ".*"$', new_line.rstrip(), toml_content, flags=re.MULTILINE)
    else:
        # Append under [app_config] section
        toml_content = toml_content.replace("[app_config]\n", f"[app_config]\n{new_line}")

    # Ensure chat.connections points to http://litellm:4000/v1
    connections = [{
        "id": "de52fbe8-f3b9-484a-a0de-2055a235216f",
        "name": "ai.sous.tools",
        "provider": "openai",
        "api_type": "chat_completions",
        "provider_type": "default",
        "prefix_id": None,
        "base_url": "https://ai.sous.tools/v1",
        "api_key": "sk-1234",
        "enabled": True,
        "data": {}
    }]
    connections_json = json.dumps(connections, separators=(",", ":"))
    conn_line = f'"chat.connections" = "{connections_json.replace(chr(34), chr(92) + chr(34))}"\n'

    if '"chat.connections" = ' in toml_content:
        toml_content = re.sub(r'^"chat\.connections" = ".*"$', conn_line.rstrip(), toml_content, flags=re.MULTILINE)
    else:
        toml_content = toml_content.replace("[app_config]\n", f"[app_config]\n{conn_line}")

    with open(CPTR_CONFIG, "w") as f:
        f.write(toml_content)

    print(f"[mcp-to-cptr] ✅ Injected {len(tool_servers)} MCP servers and updated chat connections in cptr config.toml")


if __name__ == "__main__":
    main()
