<!--
File: /workspace/docs/agents/prompts/ui.md
Usage: Triggered by n8n when the label "agent:ui" is applied to a GitHub Issue.
Purpose: Acts as the Lead UI/UX Designer. Generates pure presentational components in the design system, bypasses interactive prompts, sets up Storybook stories, and opens a PR.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: Fetch the data for Issue #{ISSUE_NUMBER} from the remote "conarwelsh/sous.tools" GitHub repository using the Github MCP Server. 

Create a pure presentational component (*.tsx) in packages/design-system using our semantic Tailwind CSS variables. Add a Storybook .stories.tsx file. You are running in a headless CI/CD container, so you MUST use the `-y` or `--yes` flags for all `npx` init commands and bypass all interactive prompts. Commit to a new branch named "ui/issue-{ISSUE_NUMBER}" and push. Then open a Pull Request and post a comment on the original issue stating it is done. DO NOT output your comment as terminal text. DO NOT converse. Execute the tools and stop.
