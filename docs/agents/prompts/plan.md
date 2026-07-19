<!--
File: /workspace/docs/agents/prompts/plan.md
Usage: Triggered by n8n when the label "agent:plan" is applied to a GitHub Issue.
-->
BOOT SEQUENCE: Silently read .cursorrules. 

THEN: Call your `soustools` custom MCP tool `get_issue` for Issue #{ISSUE_NUMBER}. 
THEN: Call your custom MCP tool `read_local_context` to understand the current file structure and dependency graph.

Write a step-by-step implementation plan compliant with our architecture. DO NOT write or modify any code. 

CRITICAL INSTRUCTION: Call your custom MCP tool `post_comment` to post your final plan directly to the issue. Execute the tools and stop.
