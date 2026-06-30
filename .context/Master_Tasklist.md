Master Tasklist: sous.tools Development Roadmap

Phase 0: Core Foundation & Infrastructure

- [x] Next.js / NestJS / Supabase Turborepo foundational setup: Establish the monorepo structure with apps for API and frontend, and shared packages for configuration and types.
- [x] Playwright E2E testing framework scaffolded: Initial end-to-end testing environment configured within the apps/app directory.
- [x] Square Integration: Core driver implementation: Development of the base integration driver for Square POS synchronization.
- [ ] Database Infrastructure Flattening: Consolidate existing migrations into a single, ordered schema to resolve existing migration failures; implement standard Row-Level Security (RLS) and grant permissions across all tables.
- [ ] Agent Skill Optimization: Update the database migration agent prompt to enforce mandatory RLS policy generation and permission granting, resolving the "dev-works, prod-fails" loop identified in the legacy logs.
- [ ] Critical Bug Resolution: Clear the current TypeScript errors and migration blocks preventing the production environment push.
- [ ] Design System Migration: Decouple and move all app-level UI components to the @soustools/ui shared package to ensure a single source of truth for the design system.
- [ ] Legacy SPA Ingestion: Extract and ingest the existing HTML/CSS assets from the previous standalone signage SPA into the new visual editor’s template library.

Phase 1: Digital Signage System

- [ ] Visual Editor Implementation: Build a drag-and-drop interface with resize handles and layout controls. The editor must be capable of producing pixel-perfect layouts matching [SOURCE_IMAGE_1] and [SOURCE_IMAGE_2].
- [ ] Signage Component Library: Create pixel-perfect CSS/HTML templates including category headers, "Heat & Serve" badges, pricing tiers for volume-based items (e.g., Soup 8oz vs. 12oz), and dynamic "Sold Out" overlays.
- [ ] Editor Abstraction: Decouple core editor logic into a shared package to support future deployments for tenant marketing websites, custom receipts, and thermal labels (made-on/expires-at stickers).
- [ ] Device Management & Pairing: Implement secure device pairing workflows for Raspberry Pis, Smart TVs, and Firesticks, allowing for granular slide deck assignments.
- [ ] Real-time Synchronization: Configure Square POS webhooks and WebSocket gateways to trigger immediate signage updates, specifically for "Sold Out" inventory status and deck assignment changes.
- [ ] Hardware Deployment Strategy: Finalize Raspberry Pi 5 configuration for stable dual 1080p output; configure LabWC (or similar window manager) for dedicated dual-head kiosk mode.
- [ ] Networking & Resilience: Develop an offline mesh capability for RPi hardware to ensure signage continuity during local internet outages.

Phase 2: Ingestion & Recipe Management

- [ ] Automated OCR Pipeline: Deploy an AI-powered OCR system for high-accuracy ingestion of vendor invoices and order documents.
- [ ] Chef-Centric Reconciliation Engine: Build a learning system to map vendor naming conventions to internal ingredients and FDA data; ensure the system "remembers" mappings to automate future scans.
- [ ] FDA Database Integration: Automate ingredient data retrieval from the FDA database during the reconciliation workflow for nutritional transparency.
- [ ] Live Cook Mode UI: Design a full-screen, high-contrast interface featuring active timers, step-by-step walkthroughs, and high-resolution prep imagery.
- [ ] Recipe Intelligence & Scaling: Implement volumetric and unit-based scaling logic for container sizes and specific bread shapes (e.g., burger buns, pullman loaves, hot dog rolls).
- [ ] Substitution Logic: Implement prep-adjustment logic for ingredient substitutions (e.g., conversion ratios for fresh yeast vs. instant yeast).
- [ ] "Vendor Wars" Metrics Dashboard: Build a real-time cost analysis engine to compare price points between multiple vendors and track ingredient price volatility and recipe margins.

Phase 3: KDS & POS Integration

- [ ] Kitchen Display System (KDS): Develop a high-performance KDS to replace Square KDS, utilizing the existing Square POS as the transactional source of truth.
- [ ] Parallel Run Strategy: Implement architectural hooks to allow sous.tools POS/KDS to run concurrently with existing systems (Square), mitigating financial risk during the transition period.
- [ ] Operational POS Interface: Design a streamlined, low-latency POS UI optimized for high-volume service environments.
- [ ] Delivery & Financial Connectors: Build API connectors for third-party delivery services (Uber Eats, DoorDash) and financial exports for QuickBooks.

Phase 4: Technical Debt, Refactor & QA

- [ ] Architectural Data Fetching: Refactor all client-side Supabase calls to Next.js Server Components and centralized API routes to enforce security boundaries.
- [ ] Domain Logic Decoupling: Relocate business and domain logic from individual applications into shared @soustools/logic or @soustools/core packages.
- [ ] Engineering Standards Enforcement: Enforce NestJS dependency injection patterns and Next.js Server Component data-fetching boundaries across the monorepo.
- [ ] Brand Asset Integration: Replace all placeholder imagery with the official "Chef Hat + Cloud" logo assets found in packages/ui/src/components/logos.
- [ ] QA & Performance: Conduct a comprehensive audit of current "hacky" logic identified in the codebase snapshot to ensure production-grade stability and readability.

Future Vision Roadmap

- [ ] WearOS Voice Integration: Develop an NLP-powered hands-free application for voice-activated kitchen commands and timers.
- [ ] Tenanted Website Builder: Extend the signage editor abstraction to allow tenants to generate customer-facing marketing and ordering sites.
- [ ] Bread Encyclopedia: Integrate specialized culinary textbook data regarding shaping techniques, proofing times, and baking science.
