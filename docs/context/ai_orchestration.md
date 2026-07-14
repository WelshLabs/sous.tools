# Autonomous AI Orchestration & n8n Workflows

This document outlines the active n8n webhooks and AI agents running on the Oracle Cloud VPS.

## 1. The CTO Summary (Triggered by CI/CD)

- **Trigger:** Webhook fired upon completion of GitHub Action #4 (Reporting & Docs).
- **Agent:** Gemini 3.1 Pro.
- **Function:** Ingests the `project-manifest.json`, `directory-tree.txt`, open GitHub issues, and code quality test artifacts to generate a high-level CTO summary of the latest build.

## 2. GitHub Issue Triage

- **Trigger:** GitHub Webhook (New Issue Created).
- **Agent:** Gemini 3.5 Flash / 2.5 Flash.
- **Function:** Acts as a PM. Analyzes incoming tickets, assigns appropriate labels, and generates a technical spec based on `.cursorrules` before the issue is worked on.

## 3. The "Junior Dev" Tracker

- **Trigger:** Follows the Triage workflow.
- **Agent:** Qwen2.5-Coder (Local) or Gemini Flash.
- **Function:** Scans the codebase to identify exactly which files and `packages/` will need to be touched to satisfy the triaged ticket, doing the legwork so the Senior Coding Agents have immediate context.

## 4. Mobile Brainstorming (Obsidian -> GitHub)

- **Trigger:** Obsidian (Android) note synced via Remotely Save hitting an n8n webhook.
- **Agent:** Gemini 1.5/2.5 Flash.
- **Function:** Converts raw, unstructured brain dumps (written on mobile) into formatted, actionable GitHub Issues and assigns them to the Kanban board.

## 5. Observability (New Relic Bug Creation)

- **Trigger:** New Relic APM/Hardware Alert Webhook.
- **Agent:** Gemini 2.5 Flash.
- **Function:** Listens for server spikes or application crashes, parses the error logs, and automatically opens a high-priority bug ticket in GitHub with the stack trace attached.
