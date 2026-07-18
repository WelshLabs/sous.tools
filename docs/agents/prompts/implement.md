<!--
File: /workspace/docs/agents/prompts/implement.md
Usage: Triggered by n8n when the label "agent:implement" is applied to a GitHub Issue.
Purpose: Acts as the Senior Developer. Reads the approved plan on the issue, writes the code, runs typechecks/linting, and opens a PR.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: You MUST use your Github MCP Server tools to fetch the data for Issue #{ISSUE_NUMBER} and its comments from the remote "conarwelsh/sous.tools" GitHub repository. 

Create a new git branch named "feature/issue-{ISSUE_NUMBER}" and execute the code changes. You are running in a headless CI/CD container, so you MUST use the `-y` or `--yes` flags for all `npx` commands. 

Once complete, run "pnpm turbo lint" and "pnpm turbo typecheck". IF the linter or typechecker fails, you MUST attempt to read the errors, fix the code, and re-run the checks before proceeding. 

Commit changes and push the branch. Then, MUST use your Github MCP Server tools to open a Pull Request with the terminal output in the description. IF the PR is successfully opened, use the Github MCP Server to post a comment that it is resolved and close the issue. IF you cannot fix the lint/type errors or the push fails, DO NOT close the issue; instead, use the Github MCP Server to post a comment detailing the exact error. DO NOT use the bash tool to attempt to run or install the `gh` CLI. DO NOT output terminal text. DO NOT converse. Execute the tools and stop.