sous.tools: The Definitive North Star Vision

1. Mission Statement & Foundational Philosophy

sous.tools is a multi-tenant SaaS Restaurant Operating System architected to fill the critical operational voids that fragmented, industry-standard legacy systems ignore. We are building a single, unified environment that consolidates the scattered tools currently plaguing the industry into a coherent, high-performance engine.

The "Dogfooding" Mandate

The system is being battle-tested in a live, high-pressure environment. Conar Welsh (conar@dtown.cafe) serves as the primary superadmin and the first active tenant at Dtown Cafe. The mandate is clear: get the core modules running live at the cafe ASAP. We do not build in a vacuum; every feature must survive the Saturday morning rush before it is deemed stable.

Engineering & Operational Laws

- Zero-Ambiguity Interface: In a high-heat kitchen, there is no time for interpretation. Information must be binary and clear.
- Ground-Truth Data Integrity: From the FDA database to the local wastage ledger, data must be accurate and synchronized across all nodes.
- Unified Void-Filling: We do not replicate existing features for the sake of it; we solve the specific gaps where other systems fail to communicate.
- High-Pressure Resilience: The system is built for the "Dirty Hands" reality of a chef, not the sanitized desk of a software engineer.

2. The Neon-Glass Design System & Visual Identity

The platform utilizes the "Neon-Glass" design system—a high-contrast Dark UI with Cyan accents designed for visibility in harsh kitchen lighting.

Legacy Feature Extraction

Our visual editor is being built through "Legacy Feature Extraction." This involves reverse-engineering our existing standalone SPA codebases to achieve pixel-perfect parity with [SOURCE_IMAGE_1] and [SOURCE_IMAGE_2]. These screenshots represent the benchmark for our signage output; the editor must be powerful enough to recreate these exact layouts visually without manual code intervention.

Brand Identity

The logo—a synthesis of a cloud (SaaS architecture) and a chef’s hat (culinary craft)—is already realized and integrated within the @soustools/ui package. This represents the current implementation state, moving the brand from concept to an active architectural component.

3. Pillar 1: Culinary Physics & Intelligent Recipe Engine

We are digitizing the culinary dataset to move away from physical paper sheets. This engine treats cooking as "Culinary Physics" rather than just text.

- Knowledge Ingestion: The engine has ingested an 800-page culinary textbook via Ollama, providing a baseline for professional preparation techniques.
- 3-Tier Governance: Data is enforced through a strict hierarchy: Global/FDA (standardized data), Organization (tenant-wide standards), and Local (site-specific adjustments).
- Live Cook Mode: A full-screen, hands-free interface featuring integrated timers and step-by-step walkthroughs.
- The Bread Encyclopedia: A specialized module for bread production, including shaping and proofing logic for burger buns, pullman loaves, and hot dog rolls.
- Intelligent Substitutions: The logic engine handles complex culinary math, such as recalculating ratios and preparation steps when substituting fresh yeast for instant yeast.

4. Pillar 2: The Omni-Editor (Signage to Web)

The Omni-Editor is a universal drag-and-drop builder with resize handles that mimics the power of industry-leading website builders. It is a single tool for all visual outputs.

- Universal Design: Capable of generating digital signage, A4 marketing materials, and custom receipt labels (e.g., "Expires-At" stickers or takeout box cooking instructions).
- Hardware Breadth: Seamlessly pairs with Raspberry Pi 5, Smart TVs, and low-cost entry points like Chromecast, Roku, and Firesticks.
- Instant Parity: Powered by webhooks, the editor ensures immediate updates. If an item is marked "Sold Out" on the POS, the signage must reflect that status instantly without a page refresh, ensuring customers never order unavailable stock.

5. Pillar 3: Shadow POS & KDS Bridge

The "Shadow POS" is our "Live Development" strategy. Industry POS systems often suck because they are built by "tech nerds" who have never worked a line. Our strategy allows us to innovate while keeping the tenant's money safe.

- Migration in Confidence: The system runs on top of Square initially. A cafe can use the sous.tools KDS (Kitchen Display System) to replace the Square KDS while Square continues to handle the financial backend.
- BYOP Transition: Once the interface is proven, the tenant can switch to our "Bring-Your-Own-Processor" (BYOP) model and terminate their legacy provider.
- Integration Hooks: Includes full hooks for 3rd-party delivery (UberEats, DoorDash) and financial synchronization with QuickBooks.

6. Pillar 4: Predictive Inventory & Margin Analytics

We utilize a "Dual-Engine" inventory system: Deterministic (real-time counts) and Heuristic (usage modeling).

- Dynamic Margin Adjustment: The system tracks costs based on transaction context. A "To-Go" order automatically triggers a margin adjustment to account for the cost of the specific container, a metric overlooked by most systems.
- Vendor Wars: By comparing ingredient costs against multiple vendors and the FDA database, the system provides real-time notifications. If a vendor price spikes, the system intelligently notifies the chef to switch to a more cost-effective purchasing path.

7. Pillar 5: The Kitchen Mesh (Hardware & Infrastructure)

Professional kitchens require "Offline-First" resilience. If the internet fails, the tickets must still print.

- RPi 5 Local Nodes: Raspberry Pi 5 units serve as the local backbone for the Kitchen Mesh.
- Auto-Discovery: The system automatically discovers receipt and kitchen printers on the local network.
- Automated Deployment: Utilizing GitHub workflows (deploy-signage-os.yml), we maintain an automated pipeline for RPi OS updates, ensuring hardware fleet stability.

8. Pillar 6: WearOS Smartwatch Integration (Voice Wastage)

To solve the "Dirty Hands" problem, staff utilize WearOS integration for hands-free operations.

- NLP Voice Commands: Staff record wastage (e.g., "I dropped a dozen eggs") via voice.
- Real-Time Ledger: This data feeds directly into the Predictive Inventory engine, allowing the system to recalculate margins in real-time based on actual physical loss, not just theoretical usage.

9. Architecture & Engineering Standards

Our engineering standards are designed to eliminate technical debt and ensure multi-tenant security.

- Server-First Rendering: We are migrating away from client-side fetching. All Next.js apps must function as routing and data-fetching skeletons, with all UI components centralized in the @soustools/ui package.
- Strict Code-Splitting: Mandatory Next.js code-splitting for Admin and Superadmin routes to optimize performance and security.
- Strict RLS Enforcement: Row Level Security (RLS) is non-negotiable at the schema level. We must prevent production migration failures by ensuring all tables have properly scoped permissions for organization members.
- Migration Flattening: All database migrations are to be flattened into a single, properly ordered file to ensure a clean state for real data ingestion.

10. Development Roadmap & Implementation Phases

1. Phase 1 (Priority 1): Signage & RPi 5 Deployment. Achieving pixel-perfect HTML parity with legacy designs and securing the automated hardware update pipeline.
1. Phase 2: Recipe Management & Live Cook Mode. Digitizing the culinary dataset and moving the kitchen from paper to digital logic.
1. Phase 3: Ingestion & Metrics. Implementing AI-driven OCR for invoices and real-time margin alerts.
1. Phase 4: KDS Transition. Replacing the Square KDS interface while maintaining the Square POS backend.
1. Phase 5: Full POS & Financial Integration. Full payment processing, BYOP, and total financial synchronization.
