sous.tools: The Glacier Philosophy North Star Vision

1. The Glacier Philosophy: 97% Engine, 3% Interface

The Glacier Mandate The sous.tools architecture is defined by a 97/3 ratio: 97% of the system is a hyper-complex, AI-driven backend (the "submerged" mass) designed to absorb the chaotic physics of culinary operations. The remaining 3% is the "tip"—an ultra-simple, "Zero-Ambiguity" interface. This philosophy acknowledges that software built for a "sanitized desk" fails in a "high-heat kitchen." We suffer the complexity in the engine so the tech-illiterate chef, dealing with "Dirty Hands" and a Saturday morning rush, never has to.

Engineering & Operational Laws

- Zero-Ambiguity Interface: In a high-heat service, interpretation is a liability. Information must be binary, high-contrast, and clear.
- Ground-Truth Data Integrity: Accuracy is mandatory from the FDA database down to the local wastage ledger, synchronized across all nodes.
- Unified Void-Filling: We do not replicate existing features for vanity; we bridge the specific gaps where legacy systems like Square or Toast fail to communicate.
- High-Pressure Resilience: Architecture is "Offline-First." If the internet fails during a rush, the kitchen mesh must keep tickets printing and data flowing.

2. The Omni-Bar: Contextual Navigation & UI Feedback

The Omni-bar is the system's central nervous system, providing flicker-free navigation and non-intrusive feedback in loud, stressful environments.

Technical Specifications

- Framer Motion: Powers the high-performance "Neon-Glass" UI transitions, ensuring visual fluidity that doesn't distract the eye during service.
- Next.js (ReAct Loops): Utilizes ReAct loops for efficient state management and context-aware routing to eliminate UI lag, a critical requirement for staff who only have seconds to interact with a screen.
- Web Audio API: Generates reactive visual borders and auditory cues. In a noisy kitchen, the Omni-bar provides a "visual shout" to alert staff to ticket changes or inventory alerts.

3. Multi-Flavor POS: Unified Commerce Flow

sous.tools utilizes Next.js intercepting routes to serve role-specific "flavors" of the interface while maintaining a single, unified backend state. This allows for specialized views (Host vs. Bar) without duplicating logic. Under the Shadow POS strategy, sous.tools replaces the Square KDS interface while retaining Square as the transactional and financial backend during the transition period.

Role Interface Flavor Core Objective
Host Reservation & Floor View Manage guest flow and table status via "Neon-Glass" floor maps.
Cashier High-Velocity Transactional Rapid order entry with minimal taps to survive the peak rush.
Bar Beverage & Tab Management High-contrast drink queue and state-aware open tab tracking.

4. WearOS & The "Dirty Hands" Protocol

Designed for environments where screens are inaccessible or hands are covered in flour, the WearOS integration enables "Invisible Ingestion" via voice.

Voice Wastage Workflow

1. Voice Input: Staff triggers a command via a custom complication (e.g., "Dropped two Pullman loaves").
2. NLP Processing: The system uses Natural Language Processing to identify the ingredient, quantity, and wastage reason.
3. Ledger Update: The data feeds the Predictive Inventory engine, instantly updating the wastage ledger and recalculating margins based on physical loss.

Real-Time Complications

- Live Sales: Glanceable metrics to track performance against daily targets.
- Ticket Times: Visual indicators of active prep times to monitor kitchen speed and bottlenecks.

5. Bento Box Recipe UI: Culinary Physics in Action

The Bento Box UI moves beyond static text, treating recipes as dynamic data. The engine has already ingested an 800-page culinary textbook via Ollama to provide a baseline of professional intelligence for every dish.

Culinary Physics

- Square POS Cross-Referencing: Live inventory checks against the Square backend to verify ingredient availability before a cook starts.
- Weight-Based Scaling: Specialized logic for Pullman loaves, calculating ratios by weight to ensure bread consistency regardless of batch size.
- Unit-Based Scaling: Discrete logic for items like burger buns and hot dog rolls where unit counts override volumetric data.
- Yeast Conversion Ratios: Intelligent math for substitution logic, specifically handling the complex conversion ratios between fresh yeast and instant yeast.
- Live Cook Mode: A full-screen interface featuring step-by-step walkthroughs and timers derived from the Ollama-ingested culinary dataset.

6. BYOD Team App & FOH Digital Sommelier

The Bring Your Own Device (BYOD) app empowers staff while maintaining strict security via geofencing and state machines.

- Timeclock vs. Geofence: Staff can only clock in or out when their device is within the verified physical bounds of the restaurant.
- Shift Swap vs. State Machine: Governance of the swap flow ensures that a trade isn't finalized until both parties and management satisfy the state requirements.
- Digital Sommelier vs. Encyclopedia API: Provides FOH staff with instant access to tasting notes and allergens, pulling from the "Bread Encyclopedia" and culinary textbook data.

7. GM Command Center: Heuristic Management

The GM Command Center focuses on "Heuristic Scheduling" and deep cost-analytics to protect restaurant margins.

Business Intelligence Objectives

- Vendor Wars: Real-time price comparison between multiple vendors and the FDA database to identify cost-saving opportunities and nutritional transparency.
- Price Volatility Alerts: Automatic notifications when an ingredient price spikes, prompting the chef to adjust the menu or switch vendors.
- Dynamic Margin Tracking: Accounting for "hidden" costs, such as specific "To-Go" packaging, which the system triggers based on the order's transaction context.

8. The 3-Tier 'Rosetta Stone' DB: AI Invoice Ingestion

The ingestion pipeline uses AI/OCR logic to map chaotic vendor data into a standardized format, reducing manual entry for busy chefs.

- 3-Tier Data Governance
  - Global/FDA: Master dataset for nutritional and standardized ingredient info.
  - Organization: Tenant-wide standards for Dtown Cafe (e.g., preferred brands).
  - Local: Site-specific inventory counts and wastage.
- The OCR Learning Loop
  - Ingestion: High-accuracy scanning of messy physical or digital invoices.
  - Standardization: The "Rosetta Stone" mapping logic learns vendor-specific naming over time.
    - Example: Mapping "XL Grade A Egg" from Vendor A and "Egg, Large" from Vendor B to a single internal ingredient ID.

9. Engineering Standards & "Antigravity 2.0"

To maintain the "Glacier" vision, we enforce strict constraints to prevent technical debt and security leaks.

Developer's Guardrails

Hard Prohibitions

- [ ] No Client-Side Supabase Calls: All fetching must occur via Server Components or the NestJS API.
- [ ] No GEMINI.md or Management Mode: Absolute prohibition of meta-cognitive agent loops.
- [ ] No Local UI Hacks: All components must reside in @soustools/ui.

Mandated Patterns

- [ ] Skeleton App Pattern: Next.js functions strictly as a routing and data orchestration layer.
- [ ] Triple-Environment Truncation: All migrations must be verified across local, staging, and prod to resolve "works in dev, fails in prod" discrepancies.
- [ ] Parallel Rule: For every feature, Tenant Docs, Dev Docs, and Internal Docs must be updated simultaneously.
- [ ] Halt-on-Error: Immediate cessation of operations upon any TypeScript, Migration, or E2E failure.

10. The Roadmap: From Dtown Cafe to Industry Standard

Every feature must survive the "Saturday morning rush" at Dtown Cafe before wider release.

1. Phase 1: Signage & Infrastructure: Deploy Raspberry Pi 5 hardware with Wayland/LabWC for dual-head 1080p output at Dtown Cafe.
2. Phase 2: Recipe Ingestion: Digitizing the "Bread Encyclopedia" and textbook data with OCR-assisted entry.
3. Phase 3: Metrics & Vendor Wars: Implementing AI-driven invoice reconciliation against the FDA database.
4. Phase 4: KDS Transition: Replacing the Square KDS interface with the sous.tools "Neon-Glass" UI while maintaining the Square backend.
5. Phase 5: Full POS & BYOP: Final transition to independent payment processing and the "Bring-Your-Own-Processor" model.
