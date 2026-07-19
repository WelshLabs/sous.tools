<!--
File: /workspace/docs/agents/prompts/audit.md
Usage: Triggered by n8n when the label "agent:audit" is applied, or run on a daily schedule.
Purpose: Acts as the Janitor/Refactoring Agent. Runs codebase analysis tools (Knip, ESLint), picks one specific violation to fix, and opens a PR.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: Run "pnpm knip" to find dead code and unused exports, and "pnpm turbo lint" to find boundary violations. 

Choose exactly ONE file with an error and refactor it into compliance. Commit the fix to a new branch named "audit/fix-{ISSUE_NUMBER}" and push the branch. Then open a Pull Request in the "conarwelsh/sous.tools" repository using your `soustools` custom MCP tool `open_pull_request` (with owner: "conarwelsh", repo: "sous.tools", base: "main", head: "audit/fix-{ISSUE_NUMBER}"). DO NOT output conversational text in the terminal. DO NOT converse. Execute the tools and stop.