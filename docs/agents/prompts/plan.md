<!--
File: /workspace/docs/agents/prompts/plan.md
Usage: Triggered by n8n when the label "agent:plan" is applied to a GitHub Issue.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: Review your available MCP tools. You MUST use your custom MCP tools (they may be prefixed, e.g., `soustools_get_issue` and `soustools_read_local_context`) to:
1. Fetch the data for Issue #{ISSUE_NUMBER} from the "conarwelsh/sous.tools" repository to get the issue details and all comment history.
2. Read the local context to understand the current file structure and dependency graph.

You MUST read the issue body and ALL comments in detail to understand the historical context, requirements, design decisions, and any approved plans. 

Write a step-by-step implementation plan compliant with our architecture. DO NOT write or modify any code. 

CRITICAL INSTRUCTION: Review your available MCP tools and use the correct tool (e.g., `soustools_post_comment`) to post your final plan directly to the issue. Execute the tools and stop.