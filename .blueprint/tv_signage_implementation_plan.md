# TV Signage MVP Implementation Plan

Implement a bare-minimum, fully functioning TV Signage system for the **Sous Tools** platform, deployed to a Web Admin for management and running on a dual-TV Raspberry Pi 5 setup. This plan bypasses full multi-tenancy implementation by hardcoding the default tenant ("Dtown Cafe") and seeds a default administrator.

## Core Decisions Decided:

- **Dual-TV Setup**: Each TV runs its own browser instance showing a different configured screen (Independent Channels).
- **Window Management on Wayland**: Windows map to HDMI outputs by setting custom titles (e.g., `SignageDisplay1` and `SignageDisplay2`) and utilizing Labwc's `rc.xml` window rules on the Raspberry Pi 5.
- **Real-Time Sync**: NestJS WebSockets (`apps/api`) manage instant screen updates when layouts change.
- **Asset Uploads**: Directly uploaded to Supabase Storage under a new `signage-assets` bucket with public read access.
- **Default Tenant**: "Dtown Cafe" with a seeded organization ID. Default admin user is `conar@dtown.cafe` with password `password`.

---

## Engineering Chunks

### Chunk 1: Database Schema & Supabase Configuration

- Execute SQL scripts defined in master_feature_blueprint.md Module 1 to create `signage_layouts`, `signage_displays`, and `square_items` tables.
- Enable RLS policies for all tables.
- Seed "Dtown Cafe" organization and default admin user `conar@dtown.cafe` via Supabase Auth.
- Configure a `signage-assets` bucket in Supabase Storage with public read access.

### Chunk 2: Shared UI Kit Expansion (`packages/ui`)

- Create Premium, modular components built strictly under the 150-line limit: Card.tsx, Dialog.tsx, Input.tsx wrappers using Tailwind CSS v4 variables.
- Ensure deep JSDocs and `@tenant-docs-export` tags are attached.

### Chunk 3: NestJS Backend API Implementation (`apps/api`)

- Build SignageModule, SignageController, SignageService for layouts/displays CRUD.
- Implement pairing controller endpoints: `POST /signage/pair/register` and `POST /signage/pair/confirm`.
- Add Supabase Auth JWT verification guard tracking tokens.

### Chunk 4: NestJS WebSockets Gateway (`apps/api`)

- Build signage.gateway.ts using Socket.io. Displays join rooms matching their display_id.
- Broadcast trigger: Emits `layout_updated` when a display layout mapping changes.

### Chunk 5: Admin Dashboard UI (`apps/app`)

- Lock dashboard behind Supabase Login form for `conar@dtown.cafe`.
- Render Layout List, Display List, and active "Pair TV" modal.
- Build section-based Layout Builder with tabs for Custom CSS textareas, font loaders, and links to synced `square_items`.

### Chunk 6: TV Signage Player Application (`apps/signage`)

- Main player page running at `/display/[id]`. Generates 4-char pairing code if unpaired.
- Extends dynamic renderers (`SPLIT_SCREEN`, `FULL_SCREEN_SLIDESHOW`, `GRID_MENU`) and handles sold-out rendering visibility logic.

### Chunk 7: Raspberry Pi 5 Deployment Config

- Implement kiosk.sh script allocating window targets.
- Implement labwc-rc.xml window definition rules matching chromium-browser window handles.
