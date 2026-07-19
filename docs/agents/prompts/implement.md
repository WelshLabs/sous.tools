<!--
File: /workspace/docs/agents/prompts/implement.md
Usage: Triggered by n8n when the label "agent:implement" is applied to a GitHub Issue.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: Call your `soustools` custom MCP tool `get_issue` for Issue #{ISSUE_NUMBER} to read the approved plan in the comments.
THEN: Call your custom MCP tool `read_local_context` to understand the codebase.

Create a new git branch named "feature/issue-{ISSUE_NUMBER}" and execute the code changes. You MUST use `-y` for all `npx` commands. 

Once complete, run "pnpm turbo lint" and "pnpm turbo typecheck". If they fail, fix the errors. Commit changes and push the branch. 

CRITICAL INSTRUCTION: Call your custom MCP tool `open_pull_request` to open a PR for your branch. If the code completely fails and you cannot push, call `post_comment` to detail the errors. Execute the tools and stop.