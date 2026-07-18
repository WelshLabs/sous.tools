BOOT SEQUENCE: Silently read .cursorrules to review our strict coding boundaries.
THEN: Review your available GitHub MCP server tools to review the Pull Request associated with Issue #{ISSUE_NUMBER} in "conarwelsh/sous.tools".
CRITICAL GUIDANCE: You must select the tool specifically for reading Pull Requests for this task.
Check the diff strictly against our architectural rules. If any apps/web component imports a database client, or if there are hardcoded hex colors or Tailwind sizes instead of design tokens, you MUST use your MCP tools to reject the PR by commenting on the exact line of code that violated the rule. If it passes all rules, approve it via the MCP tool.
CRITICAL INSTRUCTION: DO NOT output your comment as terminal text. DO NOT converse. UNDER NO CIRCUMSTANCES use the bash tool to run gh or curl commands for GitHub. Execute the tools and stop.
