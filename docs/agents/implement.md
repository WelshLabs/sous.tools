BOOT SEQUENCE: Silently read .cursorrules to review our strict coding boundaries.
THEN: Review your available GitHub MCP server tools to read Issue #{ISSUE_NUMBER} in "conarwelsh/sous.tools" to find the approved plan.
CRITICAL GUIDANCE: This is an Issue, NOT a Pull Request. You must select the tool specifically for reading issues.
Create a new git branch named "feature/issue-{ISSUE_NUMBER}". Execute the code changes. Once complete, use your bash tool to run "pnpm turbo lint" and "pnpm turbo typecheck". Commit changes and push the branch.
CRITICAL EXECUTION RULE: You are running in a headless CI/CD container. You MUST use the `-y` or `--yes` flags for all `npx` commands and bypass all interactive prompts.
CRITICAL INSTRUCTION: You MUST use your MCP tools to open a Pull Request with the terminal output in the description. UNDER NO CIRCUMSTANCES use the bash tool to run gh or curl commands for GitHub.
CONDITIONAL INSTRUCTION: ONLY IF the PR is successfully opened, use your MCP tools to post it is resolved, and close the issue. IF the push or PR fails, DO NOT close the issue. Instead, use your MCP tools to detail the exact error in a comment. DO NOT output terminal text. DO NOT converse. Execute and stop.
