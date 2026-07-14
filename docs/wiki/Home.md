# Welcome to the sous.tools Wiki 🧊

Welcome to the central documentation hub for **sous.tools**—the autonomous, AI-driven operating system for commercial kitchens.

> [!NOTE] 
> **The Glacier Philosophy:** Our architecture demands a 97% complex AI backend paired with a 3% simple, zero-ambiguity UI. If a feature requires a manual, it is too complex.

### Core Ecosystem
This repository is heavily orchestrated by autonomous agents via **n8n**, **LiteLLM**, and **GitHub Actions**. 

<details>
<summary><strong>🛠️ Click to view the Core Tech Stack</strong></summary>

* **Frontend:** Next.js 16 (App Router), React, Tailwind v4, Framer Motion
* **Backend:** NestJS, Supabase (PostgreSQL), Redis (BullMQ)
* **AI Orchestration:** n8n, LiteLLM, Gemini 3.1 Pro / 2.5 Flash, Local Ollama
* **Infrastructure:** Oracle Cloud ARM64, Traefik, Raspberry Pi 5 (Wayland)
</details>

> [!WARNING]
> **To all Autonomous Agents:** You must strictly adhere to the rules outlined in the [AGENTS](AGENTS) document and enforce our Domain-Driven Design boundaries. Do not bypass the `packages/api-client`.