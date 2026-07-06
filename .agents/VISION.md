# Vision: The Glacier Architecture

The system is built around the "Glacier" philosophy: a vast, deeply layered backend engine that absorbs the chaotic physics of real kitchen operations while presenting a zero-ambiguity user experience.

## Core Principles

- The visible application surface is intentionally simple and explicit.
- The engine beneath it is highly modular, resilient, and capable of handling OCR ingestion, predictive inventory, recipe scaling, invoice mapping, and device automation.
- The experience should feel calm, trustworthy, and operationally precise even under pressure.

## Neon-Glass UI

The user experience follows a Neon-Glass design language:

- High-contrast dark surfaces with cyan accents.
- Strong visual hierarchy for fast operational decisions.
- Progressive disclosure using motion and layered interfaces.
- Designed for high-heat, high-light kitchen environments.

## Mechanical Detail Preservation

This repository is expected to support the following capabilities:

- A CLI ingestion tool that uses Playwright headless scraping to navigate Google Books and other supported sources.
- OCR extraction through a throttled Gemini-based pipeline, intentionally paced at 5-10 screenshots per minute to avoid quota exhaustion.
- Fault-tolerant ingestion using a `processed.json` ledger.
- Local Ollama-based embedding generation with `pgvector` and structured JSON export into a 3-tier "Rosetta Stone" Supabase FDA global database.
- WearOS voice triggers and complications.
- Framer Motion Omni-bar ReAct loops.
- Baker's math scaling and heuristic inventory synchronization with weather and event data.

## Execution Model

The architecture is intended to be resilient to partial failures and environmental variance:

- The ingestion pipeline should be idempotent.
- The storage layer should preserve structured metadata and provenance.
- The production stack should support autonomous fallback while maintaining auditability.
