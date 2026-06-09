# Master System Feature Specification

## Module 1: Digital Menu Signage System (Phase 1 Deliverable)

An independent dual-channel TV signage infrastructure driven by a centralized backend network and deployed locally on on-premise hardware nodes.

### A. Core Database Infrastructure

CREATE TABLE signage_layouts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
name TEXT NOT NULL,
type TEXT NOT NULL CHECK (type IN ('SPLIT_SCREEN', 'FULL_SCREEN_SLIDESHOW', 'GRID_MENU')),
config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Holds fonts, custom_css, section configurations
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE signage_displays (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
name TEXT NOT NULL,
layout_id UUID REFERENCES signage_layouts(id) ON DELETE SET NULL,
pairing_code TEXT UNIQUE,
is_paired BOOLEAN DEFAULT false NOT NULL,
last_seen_at TIMESTAMP WITH TIME ZONE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE square_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
square_id TEXT NOT NULL,
name TEXT NOT NULL,
description TEXT,
price NUMERIC(10,2) NOT NULL,
image_url TEXT,
is_sold_out BOOLEAN DEFAULT false NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
CONSTRAINT unique_org_square_item UNIQUE (organization_id, square_id)
);

### B. Hardware Window Routing & Wayland Constraints

- Multi-Browser Kiosk Architecture: The hardware client (Raspberry Pi 5 running Wayland) executes independent Chromium browser profiles targeting separate HDMI lines.
- Window Placement Rules: Because Wayland ignores explicit coordinate window position flags, window mapping must utilize custom window titles (SignageDisplay1 and SignageDisplay2) caught by the Labwc composition rules to lock windows onto distinct hardware outputs (HDMI-A-1 and HDMI-A-2).
- Kiosk Script Execution File (kiosk.sh):
  #!/bin/bash
  chromium-browser --title="SignageDisplay1" --url="http://localhost:3000/display/tv-one" &
  chromium-browser --title="SignageDisplay2" --url="http://localhost:3000/display/tv-two" &

### C. Real-Time WebSocket Synchronization Pipeline

- Instant Signage Swaps: NestJS API (apps/api) utilizes Socket.io gateways to track open TV browser display client sockets grouped inside rooms matching their display_id.
- State Change Invalidation: Any transaction mutating signage_layouts.config or updating the square_items.is_sold_out flag must immediately publish a layout_updated socket broadcast packet down to the targeted display room, forcing a zero-latency client DOM re-render.
- Asset Storage Sandbox: Static image or media slide components are written directly to the Supabase Storage infrastructure layer inside an isolated bucket configuration named signage-assets with public read access.

### D. Designer Core Configurations & Custom CSS Sidebar

- Google Fonts Selection Utility: The layout builder component must support fetching and picking from a wide, unrestricted range of Google Fonts. Selected fonts are dynamically injected as direct stylesheet links inside the player document head context at runtime.
- Live Injected CSS Custom Blocks: The signage engine must provide a secure text area input allowing designers to write raw custom styles saved inside signage_layouts.config.custom_css. The player client reads this string and injects it straight into an isolated <style id="signage-custom-css"> tag block.
- Sold-Out Layout Rendering Adjustments:
  - HIDE: Filter out the record entity from the display mapping collection completely.
  - LABEL: Append a high-contrast crimson "SOLD OUT" overlay badge matching the destructive oklch token.
  - STRIKE: Apply CSS line-through line decorations and drop overall opacity variables down to 40%.

---

## Module 2: Hybrid Recipe & Production Engine (Phase 2 Deliverable)

This module handles the creation, storage, scaling, and execution of multi-tenant commercial culinary and beverage formulas.

### A. Database Schema

CREATE TABLE recipes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
title TEXT NOT NULL,
yield_count NUMERIC NOT NULL,
yield_unit TEXT NOT NULL,
instructions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Numbered step strings + embedded native timers
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE recipe_ingredients (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
master_ingredient_id UUID REFERENCES master_ingredients(id),
calculation_type TEXT NOT NULL CHECK (calculation_type IN ('fixed_weight', 'bakers_percentage')),
base_calculation_group BOOLEAN DEFAULT false NOT NULL,
amount NUMERIC NOT NULL,
unit TEXT NOT NULL, -- mass, volume, count
prep_notes TEXT
);

### B. Core Mathematical Calculation Logic

- Dual-Mode Scale Computations:
  - For elements flagged with calculation_type = 'fixed_weight', scale mass or volume linearly using the absolute scale multiplier:
    Scale Multiplier = Target Yield / Base Yield
  - For elements flagged with calculation_type = 'bakers_percentage', calculate scale outputs relative to the aggregate mass of the designated base_calculation_group (100% baseline).
- The Generalized Base Multiplier Algorithm:
  1. Filter recipe ingredient lines for all assets marked with base_calculation_group = true.
  2. Aggregate their absolute masses to establish the core base mass sum divisor.
  3. Compute relative non-base items by dividing their stored base ratio directly against the target base mass requirement.

### C. Interface Features & Conversions

- Vessel-Aware Grid Matrix: Connects recipe formulas to multi-tenant equipment profiles (e.g., 13" Pullman Pan vs 9" Pullman Pan) through a target scaling payload contract, automating recipe mass shifts depending on the vessel volume configurations selected.
- Unit Conversion Engine: Real-time client-side fluid-to-weight conversions backed by liquid density coefficients stored inside the master ingredient metrics table.
- Active Kitchen Mode Interface: Full layout wrapper utilizing a native wake-lock script implementation. Tapping localized step durations instantiates floating, asynchronous timer elements that persist across tab views.
- Zero-Cost Compliance Ingestion: Local background extraction parsing nutritional macro profiles and allergen classifications using local database data downloads of USDA FoodData Central sets or the free Open Food Facts API.

---

## Module 3: Universal Ingestion Pipeline & Learning Engine (Phase 3 Deliverable)

### A. Database Schema

CREATE TABLE vendor_item_aliases (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
raw_vendor_string TEXT NOT NULL,
internal_master_item_id UUID NOT NULL REFERENCES master_ingredients(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
CONSTRAINT unique_vendor_string_mapping UNIQUE (organization_id, vendor_id, raw_vendor_string)
);

### B. Polymorphic Processing Architecture

- Distributed BullMQ Flow: The client interface executes a camera capture or passes a shared cloud URL link (via the Web Share Target API or Google Picker API), streaming the document binary straight to the API layer. The backend intercepts the payload and passes the execution context task into a Redis-backed BullMQ job queue.
- Local Ingestion Parsing (Zero API Cost): Background worker nodes intercept the job and execute local optical character recognition via Tesseract.js to isolate raw text. The text is passed into an open-source parsing module running contextual prompts optimized by calling domain parameters (Recipes vs Invoices vs Prep Lists).
- Real-Time Pipeline Hydration: Once the background task finishes compiling the structured JSON structure, the worker pushes a WebSocket alert down to the PWA to instantly hydrate the Human-In-The-Loop Validation Screen.

### C. Human-In-The-Loop Mapping & Translation Machine

- Dual-Pane Interface Layout: Displays raw OCR text lines adjacent to editable form inputs generated by the parser context.
- Deterministic Learning Engine: When a user maps a messy invoice line item string to an internal master item asset, the translation event writes an entry into the vendor_item_aliases matrix. Future extraction engines cross-reference this registry first. If a match is found, the line item is auto-mapped with a clear manual override flag visible on the interface workspace.

---

## Module 4: Dynamic Procurement & Vendor Ordering Module (Phase 4 Deliverable)

### A. Database Schema

CREATE TABLE order_board_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
item_name TEXT NOT NULL,
quantity NUMERIC NOT NULL,
unit TEXT NOT NULL,
status TEXT NOT NULL CHECK (status IN ('OPEN', 'CARTERED', 'DISPATCHED')),
preferred_vendor_id UUID REFERENCES vendors(id),
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE purchase_orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
status TEXT NOT NULL CHECK (status IN ('PENDING_DELIVERY', 'RECONCILED')),
raw_po_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

### B. Procurement Matrix Workspaces & Multi-Channel Dispatch

- The Digital Whiteboard: High-visibility, rapid-entry data grid allowing immediate stock logging. Items are automatically sorted and divided into distinct supplier accounts using the historical mapping matrix.
- Multi-Channel Dispatch Routing: Executing a supplier cart locks the ledger items and triggers outbound transmissions matching the vendor's profile preferences:
  - EMAIL: Automatically compile a clear, structured HTML/Plain-text purchase order dispatched via the internal SMTP transactional layer.
  - SMS: Forward data payloads down to integration communication webhooks.
  - MANUAL: Format list records into large, high-contrast typography view cards optimized to be read aloud via phone call interfaces.
- Interactive Market Walk Mode: For providers flagged as "Self-Shop" (e.g., local produce markets), the PWA exposes an alternative mobile checklist mode. Tapping item targets applies a strike-through style layout shift, decreases opacity, and re-orders the element to the bottom of the stack. Active state parameters are strictly cached inside IndexedDB to guard against warehouse cell dropouts.

### C. Three-Way Invoice Reconciliation Loop

- Discrepancy Resolution Grid: When an invoice document is captured via the Module 3 ingestion engine, the BullMQ worker pulls the matching pending purchase order file record. The validation layout handles item cross-references across three data pillars: Original PO Quantities, Invoiced Line Quantities, and Actual Scanned Deliveries.
- Financial Data Cascade: Discrepancies like price creep or yield anomalies are highlighted in amber inside the verification screen. Committing the audited invoice closes out the whiteboard entry, logs the adjusted cost parameter down to the inventory ledger, and triggers recalculation macros across connected recipe costing boards.

---

## Module 5: Omni-Channel POS Synchronization Architecture & Core Integrations

### A. Bidirectional Synchronization Architecture

- The Intermediary Mapping Schema: Every catalog asset, category modification block, and pricing parameter maps across external vendor platforms using the polymorphic token connector:
  { internal_id, pos_provider: 'SQUARE' | 'TOAST', external_id, last_synced_at }
- Webhook Loop Attenuation Logic: Outbound sync requests carry unique tracking identifiers. When consuming incoming external POS webhooks, the sync interface parses the incoming event signature. If the transaction matches our local application's signature trace (actor_id context tracking), the webhook execution sequence drops immediately to terminate infinite synchronization cascades.
- Optimistic Mesh Write Queues: Price and item updates logged at the local mesh network node save to the local cache instantly and populate an outbound task queue. Once web communication lines verify, tasks dispatch sequentially with unique idempotency keys to enforce write safety boundaries.

---

## Module 6: Code Style & File Caps (Coding Guidelines Enforcement)

- Maximum Component Breadth Constraints: To enforce compliance with the strict 150-line file length mandate, complex features like the Layout Builder, the Three-Way Reconciliation Grid, and the Recipe Builder Matrix must split their presentation modules cleanly. State control hooks, sub-panels, and dialog cards must be abstracted out into focused sub-components.
- Strict Type Security Boundaries: The type interfaces for every JSON configuration payload (signage_layouts.config, purchase_orders.raw_po_payload) must be declared inside @soustools/api-types. No any variants are permitted.
