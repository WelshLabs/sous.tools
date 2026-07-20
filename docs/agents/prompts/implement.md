<!--
File: /workspace/docs/agents/prompts/implement.md
Usage: Triggered by n8n when the label "agent:implement" is applied to a GitHub Issue.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: Review your available MCP tools. You MUST use your custom MCP tools (they may be prefixed, e.g., `soustools_get_issue` and `soustools_read_local_context`) to:
1. Fetch the data for Issue #{ISSUE_NUMBER} from the "conarwelsh/sous.tools" repository to read the approved plan in the comments.
2. Read the local context to understand the codebase.

Create a new git branch named "feature/issue-{ISSUE_NUMBER}" and execute the code changes. You MUST use `-y` for all `npx` commands. 

Once complete, run "pnpm turbo lint" and "pnpm turbo typecheck". If they fail, fix the errors. Commit changes and push the branch. 

CRITICAL INSTRUCTION: Review your available MCP tools and use the correct tool to open a Pull Request for your branch. If the code completely fails and you cannot push, use the MCP tool to post a comment to detail the errors. Execute the tools and stop.