# 🧠 sous.tools AI Nervous System (n8n + GitHub Issues)

This repository uses GitHub Issues as the central nervous system for autonomous AI agents. By applying specific labels to an issue, webhooks trigger n8n workflows that wake up local AI agents on the Oracle Cloud server to execute tasks via the Model Context Protocol (MCP).

## 🏷️ The Label Lifecycle

1. **`agent:spec`** - _The Translator._ Converts raw mobile brain-dumps into structured Technical Specs.
2. **`agent:research`** - _The Explorer._ Safely reads the codebase to map out required file changes without modifying anything.
3. **`agent:plan`** - _The Architect._ Writes the step-by-step implementation plan and pauses for Human-in-the-Loop approval.
4. **`agent:ui`** - _The Designer._ Creates isolated, headless Tailwind/Framer components in the design system.
5. **`approval:go`** - _The Worker._ Branches the code, implements the feature, runs linters, and opens a Pull Request.
6. **`agent:test`** - _The QA._ Mocks data and writes Playwright/Jest tests to achieve 100% coverage.
7. **`agent:review`** - _The Gatekeeper._ Reviews PRs specifically looking for architectural boundary or Tailwind token violations.
8. **`agent:audit`** - _The Janitor._ A cron-friendly agent that fixes exactly one tech-debt item (dead code/lint error) and opens a PR.

&nbsp;
