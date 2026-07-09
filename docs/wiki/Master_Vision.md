Master Vision & Architecture Blueprint: sous.tools

1. THE NORTH STAR: THE "GOOGLE" OF RESTAURANT OPERATING SYSTEMS

The mission of sous.tools is to replace the fragmented, archaic "franken-systems" of the hospitality industry with a single, omnipotent interface that masks enterprise complexity behind consumer-grade simplicity.

The Omni-bar Paradigm

The system shifts away from legacy B2B sidebars toward a centered, high-performance Omni-bar. This single text and voice input serves as the primary entry point for the entire operating system. Powered by Gemini 2.5 Pro ReAct (Reasoning and Acting) loops, the Omni-bar processes natural language commands and intelligently routes the user to the correct "flavor" or performs background actions without requiring manual navigation.

The Waffle Menu & App Switcher

To maintain a "dead-simple" interface, the system utilizes a Google-style 9-dot grid (Waffle Menu). This structure allows users to switch between specialized application "Flavors":

- POS (Point of Sale): High-speed viewport-locked transaction grid.
- KDS (Kitchen Display System): High-contrast, websocket-driven ticket management.
- Signage: Cursor-hidden, full-screen digital menu displays.
- Inventory: Dual-engine (Heuristic and Deterministic) stock management.
- Culinary Brain: The global knowledge base and per-tenant recipe engine.

The 'Hey Sous Chef' Agentic Loop

The AI is proactive, utilizing reasoning loops to verify environmental and inventory data before suggesting actions.

- Contextual Reasoning: Gemini handles the Reasoning/Tool Calling while the backend executes the Acting. If asked for a weekly special, the agent checks live inventory levels and vendor pricing before responding.
- Proactive Follow-ups: "You are out of raisins; do you have time to source them before running this special, or should we substitute with dried cranberries?"
- Line-Item Reconciliation: The agent automatically identifies that "BUTTER EURO 83%" on a Theodore L. Gross invoice is actually the tenant's "Unsalted Butter."

2. 'GLACIER' DESIGN PHILOSOPHY & VISUAL IDENTITY

The "Glacier" design system prioritizes zero-ambiguity readability for high-heat environments like Dtown Cafe, maintaining a premium "at-home" feel.

The Aesthetic Framework

Feature Dark Mode (Midnight Kitchen) Light Mode (At-Home Frosted)
Background Midnight Slate (Deep Navy/Slate) Off-White (Warm Flour/Apron)
Panel Style Translucent Dark (bg-black/40) Frosted Glass (bg-white/70)
Blur Effect Backdrop-blur-xl Backdrop-blur-2xl
Neon Accents Emissive Cyan Outer Glows Vibrant Color-Burn Drop Shadows
Borders 1px border-white/10 1px border-black/5

Structural Primitives

- Hyper-Rounded Corners: Application cards use rounded-3xl (24px) to eliminate the aggressive feel of legacy spreadsheets. Buttons utilize rounded-2xl (16px).
- Ambient Mesh Glare: Backgrounds utilize massive, soft radial gradients (800px wide) at 15% opacity in screen corners. These drift and pulse slowly to drive depth without UI noise.

Functional Micro-Interactions

- Tactile Tap: Buttons provide a 2% scale-down (active:scale-[0.98]) to mimic physical resistance.
- Ambient Breathing: Background gradients pulse over 15-second loops to keep the UI "alive."
- Zero-Ambiguity Feedback: Critical alerts utilize "Neon Pulses" (e.g., a border flashing red) rather than intrusive pop-ups that block the line cook's view.

3. 'HOLY GRAIL' INFRASTRUCTURE: ORACLE CLOUD & LOCAL AI

We are consolidating the "bees nest" of SaaS providers into a single, high-powered ARM64 environment to achieve 100% Local -> Cloud -> Edge parity.

Compute Specification

The production environment resides on an Oracle Always Free Ampere A1 Flex instance:

- Configuration: 4 OCPUs, 24GB RAM.
- OS: Ubuntu 24.04 ARM.
- Parity: Mandatory use of ARM64 Docker builds (via buildx) ensures identical execution across Developer WSL2, Oracle Cloud, and Raspberry Pi 5 nodes.

The Hybrid AI Split

- Local Ollama: Responsible for Vision OCR, generating pgvector embeddings for the Culinary Brain, and heavy offline tasks.
- Gemini 2.5 Pro: High-level reasoning, complex "Hey Sous Chef" queries, and tool-calling ReAct loops.

The Infrastructure Stack

- Traefik: Manages automated SSL and dynamic routing to containers.
- Redis (Append-only): Ensures BullMQ persistence for background ingestion jobs.
- Oracle Reaper-Beater: A cron job that triggers every 12 hours, prompting the local AI for a "random 500-word story" or a "math problem" to spike CPU usage above 10%, preventing Oracle from reclaiming the "Always Free" instance.

4. UNIFIED NEXT.JS 16 'FLAVORS' ARCHITECTURE

The frontend is reorganized into specialized route groups to isolate logic and styles, strictly utilizing instrumentation.ts and instrumentation-client.tsx for monitoring.

Route Group Reorganization

We are deleting the existing (dashboard) catch-all to prevent "split-brain" routing. Logic is now split into:

- (google-home): The root Omni-bar search page.
- (pos): Viewport-locked transaction grid.
- (kds): High-contrast ticket management with "Offline Mode" flash.
- (signage): Full-screen display renderer.

Scoped Layouts & Reliability

- loading.tsx: Flavor-specific skeletal cards (e.g., recipe skeletons for the Chef flavor).
- error.tsx: Recovery protocols like the KDS "Flashing Offline Mode" if the API connection drops.
- Mesh-Node Integration: Standalone signage is folded into apps/app, ensuring Raspberry Pi 5 nodes possess the full bundle for offline-first resilience.

5. THE 'ROSETTA STONE' DATABASE & CULINARY BRAIN

The database acts as a translation layer between chaotic vendor data and scientific culinary standards using Postgres Recursive CTEs for traversing substitution trees.

3-Tier Mapping Model

1. Global Ingredients (USDA/Escoffier): Canonical data (e.g., USDA ID: 01145).
2. Tenant Ingredients (Chef shorthand): The internal name (e.g., "Unsalted Butter").
3. Vendor Strings (Invoice chaos): Vague text (e.g., "BUTTER EURO 83% UNSALTED") mapped to Tenant Ingredients.

Culinary Physics & Beverage Matrix

- Baker's Math: Automated volumetric scaling treating flour as 100%. The system handles leavening conversion ratios (Fresh vs. Instant yeast) and injects "Hydrate yeast" steps as needed.
- Alcohol & Beverage Volumetric Matrix: Manages liquid volume, yield, and excise tax decoupling for liquor ledgers.
- Escoffier Integration: Ingestion of Le Guide Culinaire into a global schema with RLS disabled, empowering the AI's "Master Baker" persona.

6. HEURISTIC INVENTORY & PREDICTIVE PROFIT ENGINE

- WeatherSyncService: Integrates OpenWeatherMap to predict volatility (e.g., "Rain detected: Reduce pastry prep by 20%").
- Event Intelligence: Cross-references local Doylestown events to adjust sales projections.
- Menu Engineering Quadrants: Automated classification of items into Stars, Plowhorses, Puzzles, and Dogs, calculating margins including "hidden" costs like to-go packaging and Lexans of prep items.

7. WEAROS BYOD ECOSYSTEM & KITCHEN MESH

The "Dirty Hands" Interface

Built with Jetpack Compose for WearOS and Horologist, the app enables voice-activated wastage logging. We bypass "Always Listening" restrictions via hardware button mapping or watch-face complications to trigger speech recognition instantly.

Raspberry Pi 5 Mesh

RPi 5 nodes run a labwc (Wayland) kiosk setup. The signage-sync.service enables local-first display and printing, ensuring the kitchen remains operational during cloud outages.

8. INGESTION PIPELINE: VISION LLM REVOLUTION

We are officially deprecating Tesseract.js.

- Multimodal OCR: Vision LLMs (Gemini/Ollama) perform simultaneous OCR and data structuring from smudged thermal receipts.
- Fault-Tolerant Scraper: A Playwright-based "Auto-Flipper" for non-downloadable Google Books. It utilizes a processed.json ledger to ensure the ingestion loop resumes correctly after a quota hit or system restart.

9. DEVOPS, CI/CD & SECURITY GOVERNANCE

- GHCR Migration: All artifacts (API, RPi Mesh, WearOS) are migrated from Docker Hub to GitHub Container Registry.
- Secrets: Infisical manages secret rotation and consolidation.
- Scoped Visibility: The npm run context suite provides the AI with perfect monorepo visibility via:
  - context:root, context:api, context:app, context:ui, context:db, context:agents.

10. EXECUTION ROADMAP & HARD PIVOTS

The Weekend "War Room" Milestones

1. Split-Brain Eradication: Merge all architectural mandates into .agents/AGENTS.md and delete .context/AI_Execution_Rules.md.
2. Oracle Deployment: Provision the ARM64 A1 Flex shape and configure ORACLE_SSH_KEY and GHCR_PAT secrets.
3. Next.js Restructuring: Execute the deletion of the (dashboard) catch-all and move to specialized route groups.
4. Culinary Ingestion: Launch the Playwright scraper to build the Global Encyclopedia.

The Square "Shadow POS" Strategy

The system operates as an Intelligent Shadow on top of Square's revenue handling. We innovate on data and AI-driven insights—such as line-item reconciliation and predictive wastage—before the final hardware cutover to native "Bring-Your-Own-Processor" (BYOP) devices.
