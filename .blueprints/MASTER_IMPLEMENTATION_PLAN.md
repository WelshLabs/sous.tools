# 🚀 EXECUTION ROADMAP

*Execute these phases strictly in order. Do not proceed until the current phase is fully built, tested, and committed.*

## PHASE 1: WORKSPACE RESTRUCTURE & POS DRIVER CORE
1. Monorepo Adjustments: Delete the orphaned tv-signage app. Ensure marketing is merged into apps/app. Scaffold apps/docs and apps/pos-simulator (disable deployment for simulator).
2. Driver Schema Refactoring: Drop square_id for pos_provider and external_id in the database and api-types. Create PosModifierGroup, PosModifierOption, and PosItemLocalOverlay. Apply RLS.
3. Sync Layer: Update Square OAuth routes to connect.squareup.com with &session=false. Implement 2-Way Shadow Sync (Webhooks + BullMQ cron).

## PHASE 2: SIGNAGE COMPONENT PRIMITIVES & SEEDING
1. Polymorphic UI Primitives: Build Server/Client components inside apps/signage for CategoryHeaderBlock, PosItemBlock, NestedItemBlock, ExplodedItemBlock, MediaCarouselBlock, and CalloutBlock.
2. UI Toggles & CSS Engine: Implement StyleConfig. Build the Monaco custom CSS editor and <style id="tenant-custom-css"> injector. Ensure components query resolveItemState to apply .pos-sold-out dynamically.
3. Database Seed: Execute the SQL migration script (SEED_DATA.sql) to inject the DTown Cafe Custom CSS and JSON Layouts.

## PHASE 3: RECIPE ENGINE FUNCTIONALITY
1. Math & Volume Engines: Implement Baker's Percentages scaling logic and density coefficient multipliers. Implement opt-in abv_percentage field.
2. Kitchen Interfaces: Map recipes to vessel volumes. Build the wake-locked active cooking UI with persistent floating async JavaScript timers.
3. Ingestion Upgrades: Build text parsers to import raw notes/Google Docs. Fix existing Google Drive API wrapper to securely fetch file contents without auth drops.

## PHASE 4: OMNI-CHANNEL INGESTION & PROCUREMENT
1. Ingestion Gateway: Deploy Redis/BullMQ worker in apps/api. Set up endpoints to catch Network Scanners, Emails, and Web Uploads, routing to local Tesseract.js.
2. Human-in-the-Loop Translator: Build a dual-pane UI mapping raw text to internal assets, logging to vendor_item_aliases.
3. Procurement & Reconciliation: Implement offline-capable "self-shop" checklist (IndexedDB) and multi-channel PO dispatch (Email/SMS/Voice). Build the 3-Way Reconciliation UI (PO vs. Invoice vs. Delivery scan) to catch margin creep.

## PHASE 5: EDGE HARDWARE ORCHESTRATION
1. Update sync-watchtower.js to query the API for tenant operating_hours.
2. Integrate mDNS network discovery to find local receipt printers.
3. Implement 24/7 BetterStack Heartbeat and Wayland HDMI sleep commands (wlr-randr) based on operating hours.

## PHASE 6: EXTENDED SYSTEM HORIZONS (Future Roadmap)
1. Internal POS Module: Touchscreen transaction interface.
2. Kitchen Display System (KDS): Real-time WebSocket order routing.
3. Hostess & Seating Management.
4. WearOS Companion App.
