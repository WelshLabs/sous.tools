name: Agent Task
about: Template for autonomous AI agent execution
title: 'Task: '
labels: 'backlog'
assignees: ''
---

## Objective

[Brainstormed idea from mobile webhook goes here]

## Agent Definition of Done (DoD)

Before opening a Pull Request, the executing agent MUST complete the following:

- [ ] Create a new feature branch (`feature/issue-[id]`).
- [ ] Write the code conforming to `.cursorrules` and `docs/AGENTS.md`.
- [ ] Run `pnpm turbo lint` and ensure 0 errors.
- [ ] Run `pnpm turbo typecheck` and ensure perfect compilation.
- [ ] Push the branch and open a PR.
- [ ] The PR body MUST include the raw output of the lint and typecheck commands to prove verification.
- [ ] Post a comment on this issue linking to the PR.
