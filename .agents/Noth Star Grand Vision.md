sous.tools: The North Star Grand Vision

1. The Executive Mandate: Collapsing the Franken-stack

The modern hospitality landscape is paralyzed by a "Franken-stack"—a fragmented, disconnected web of Point of Sale (POS), inventory management, and procurement tools that do not speak the same language. This technical debt creates critical visibility gaps, leading to operational friction and unmonitored margin erosion.

The sous.tools platform is engineered as a unified Restaurant Operating System (OS). It is not a passive reporting tool; it is a high-performance proactive intelligence layer designed to prevent damage before it occurs. By merging disparate functions into a single ecosystem, we eliminate the latency between data and action.

MISSION STATEMENT "Collapsing the hospitality Franken-stack into a single, proactive intelligence layer to ensure real-time profitability and operational resilience."

2. The Three Pillars of Invisible Utility

Our architecture is built upon three foundational pillars designed to ensure the platform feels like a utility: invisible yet bulletproof.

- Pillar 1: Real-time Profitability We are moving from retroactive reporting to proactive orchestration. The engine identifies labor-to-sales drift and vendor price creep in real-time. Instead of reviewing a P&L weeks after a loss, the OS flags margin damage as it happens, allowing for immediate corrective measures.
- Pillar 2: Operational Resilience In the high-intensity, high-glare environment of a commercial kitchen, software must be "Invisible yet Bulletproof." We prioritize high-contrast legibility and offline-first engineering to ensure that service never stops, even when the external internet does.
- Pillar 3: Local-Mesh Reliability Commercial kitchens are notorious RF-heavy environments and Wi-Fi dead zones. To maintain functional parity during connectivity drops, the architecture mandates a local-mesh ecosystem powered by Raspberry Pi 5 nodes. Synchronization is handled via Delta-Action Logs and Conflict-free Replicated Data Types (CRDTs) to resolve state chronologically upon reconnection.

3. Design Identity: The Intersection of Syntax and Heat

The visual language of sous.tools is "Syntax and Heat"—a developer-centric aesthetic of precision. We explicitly forbid legacy culinary tropes (no rustic textures, no whisks, no knives). The aesthetic is technical, clean, and high-vibrancy.

Color Space (OKLCH Tokens)

We use luminance-locked OKLCH tokens to ensure consistent vibrancy across varied display hardware.

Token OKLCH Value Strategic Justification
Vibrant Blue oklch(0.60 0.25 250) Primary Action / High Visibility
Light Background oklch(0.98 0.005 240) High-contrast for standard prep
Dark Background oklch(0.12 0.02 240) Reduced glare for night/low-light service

Visual Specifications

- Ambient Radiance: Every layout hosts dual-node background radiance for refraction depth.
  - Top-Left Node: blue-500/10
  - Bottom-Right Node: cyan-500/5
  - Blur: Fixed at 120px.
- Glassmorphism: Components utilize .glass-panel utilities (bg-zinc-950/40, backdrop-blur-2xl, border-white/5).
- Typography Hierarchy:
  - Inter (Sans): Utility body text for maximum scannability.
  - Outfit (Brand): High-impact display.
  - Geist Mono (Technical): Precision data for weights, costs, and terminal logic.

Symbol Metaphors & Logo

The identity is defined by the Cloud and Chef Hat logo.

- Terminal Prompt (\_): Command and Logic (Core OS).
- Cloche: Service and Presentation (Digital Signage).
- Document Icon: Schema and Knowledge Documentation.
- Link/Chain: Interconnectivity and POS Integrations.

4. Hardware & Local Orchestration: The Raspberry Pi 5 Mesh

Local infrastructure is standardized on Raspberry Pi 5 mesh nodes. These nodes run Docker with Watchtower for autonomous, zero-intervention updates, ensuring the local stack is always current and "bulletproof."

Signage Deployment & Window Management

Signage utilizes the Wayland/Labwc compositor. Since Wayland lacks coordinate-based positioning, we employ title-based mapping via rc.xml rules:

- HDMI-A-1: Browser windows with the title SignageDisplay1.
- HDMI-A-2: Browser windows with the title SignageDisplay2. This ensures pixel-perfect placement across dual-TV kiosks without manual alignment.

Sync Logic

State integrity is maintained via a Delta-Action Log that captures individual mutations. Upon reconnection, Deterministic Vector Timestamps allow CRDTs to merge state with 100% accuracy, resolving conflicts without user input.

5. The Recipe Engine: Culinary Mathematical Precision

The recipe engine is the training foundation of the kitchen, grounding technical math in real-world deliverables like the 10.00 Egg & Cheese Sandwich** and **16/dz Scratch Pierogi.

- Generalized Base-Ingredient Logic: Utilizing the base_calculation_group flag, the engine sums "base" ingredients (e.g., total flour in dough) to establish the 100% divisor.
- Dual-Mode Scaling: Supports both "Fixed Weight" (static) and "Baker’s Percentage" (dynamic) scaling.
- Vessel Awareness: The engine scales recipes based on many-to-many equipment relationships, such as 12-quart Cambros or specific Pullman Pan volumes.
- Substitution Intelligence: Real-time ratio adjustments (e.g., fresh vs. instant yeast) and a built-in Encyclopedia of Bread Shapes for on-the-line training.

6. Universal Ingestion Pipeline & Learning Engine

The platform automates the digitization of vendor data to shield margins from "stealth" price increases.

- OCR Pipeline: Tesseract.js (Local) -> BullMQ (Queue) -> LLM Parser.
- Deterministic Translation Matrix: Cryptic vendor strings (e.g., "CHIK BRST 5#") are mapped to internal IDs via vendor_item_aliases.
- The Learning Loop: The system learns over time to "guess the answer," reducing the manual reconciliation workload for the chef.
- Three-Way Reconciliation: A continuous loop comparing Purchase Orders vs. Invoices vs. Scanned Deliveries. Price creep or quantity discrepancies are flagged in the UI with amber highlighting.

7. Shadow POS/KDS & Bidirectional Integration

We employ an "On Top" Strategy to build tenant trust. sous.tools operates parallel to Square/Toast, ensuring financial safety while building a superior intelligence layer.

- Bidirectional Sync with Actor Loop Attenuation: Every outgoing sync carries a unique actor signature. Incoming webhooks matching the internal actor_id are dropped immediately to prevent infinite loops.
- KDS Matrix: Features station routing, ticket aging, and Wear OS haptic integrations for silent kitchen notifications and haptic timers.

8. Financial Intelligence & Menu Engineering

The OS bridges the kitchen whiteboard to the financial ledger, including complex beverage logistics.

Menu Engineering Quadrants

Menu items are categorized based on real-time COGS and POS performance:

Category Performance Strategic Action Dtown Example
Stars High Profit / High Popularity Maintain quality; protect consistency. Scratch Pierogi
Plowhorses Low Profit / High Popularity Target for portion or price adjustment. Brioche Buns
Puzzles High Profit / Low Popularity Target for marketing and promotion. Chili
Dogs Low Profit / Low Popularity Target for removal from the menu. -

Alcohol Volumetric Matrix

- Weight Translation: Converting fluid ml/oz to weight for rapid bottle counting.
- Shared-Base Mapping: Drawdown mapping for master SKUs (e.g., mapping a Negroni and Boulevardier to the same gin/vermouth base).
- Tax Integrity: Decouples state excise taxes from base costs for accurate financial reporting.

9. Engineering Architectural Mandates

These standards are non-negotiable and enforced at the repository level.

- The Technical Stack: Next.js 16 (Vercel), NestJS (Render), Supabase (PostgreSQL/RLS), and Infisical (Secrets).
- The Purge Protocol: The apps/ directory is reserved exclusively for routing and data-fetching skeletons. All UI components must be centralized in @soustools/ui, which is a zero-bundler Tailwind v4 implementation.
- Data Fetching: Direct Supabase calls from the client are forbidden. All data fetching must occur in Next.js 16 Server Components.
- Atomic File Rule: No TS/TSX file may exceed 150 lines. This maintains modularity and ensures files remain within LLM context windows, preventing "lazy coding."
- 3-Tier AI Orchestration:
  1. NotebookLM (Static Anchor): Generates the Context Brief.
  2. Gemini (Feature Lab): The strategic planning partner.
  3. Antigravity 2.0 (Executor): Autonomous coder with zero-prompt execution.
- Standardized Singletons: Use only @soustools/utils versions: SingletonLock, SingletonSocket, and SingletonCookie.

10. The Roadmap: Dtown Cafe and Beyond

Phase 1 follows the "Eat Your Own Dog Food" mandate with Conar Welsh at Dtown Cafe.

- Signage Parity: Reaching visual parity with the "Breakfast Masterpieces" HTML/CSS designs in a visual drag-and-drop editor.
- The Canvas Editor: Evolution of the signage tool into a generalized "Canvas" engine for websites, bespoke receipts, cooking labels, and A4 marketing prints.
- Market Walk Mode: A mobile-optimized checklist featuring "Vendor Wars" price comparison, strike-through logic, and offline caching for procurement.
- Ecosystem Expansion: Full bidirectional integration with QuickBooks, Uber Eats, and DoorDash.
