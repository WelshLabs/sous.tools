# TV Signage MVP Implementation Plan

Implement a fully functional, premium digital menu TV signage system for the **Sous Tools** platform, featuring dual-channel screen mapping on Raspberry Pi 5 under Wayland, real-time WebSocket sync, a drag-and-drop hybrid slide editor, and a built-in POS Simulator (Square/Toast).

## Goal Description

Deploy a dual-channel TV signage player that can run on a Raspberry Pi 5 or any smart TV/browser. Provide a premium admin visual editor where cafe owners can design mixed-media playlists (menus, videos, images, Google Slides/PPTX), load Google Fonts, and write custom CSS with a built-in interactive class selector. Sync menu items in real-time, handling sold-out item visibility (strike-through, graying out, or hiding) via a POS simulator.

---

## User Review Required

> [!IMPORTANT]
>
> - **Dual-TV Wayland Routing**: We solve Wayland's window placement limitations on Raspberry Pi 5 by launching Chromium windows with distinct titles (`SignageDisplay1`, `SignageDisplay2`) and applying Labwc `rc.xml` rules to map them onto specific HDMI outputs (`HDMI-A-1`, `HDMI-A-2`).
> - **Client Versatility**: The player application is a standard responsive web page at `/display/[id]`. If unpaired, it displays a 4-char pairing code. This allows it to work out-of-the-box on Chromecasts, Roku browsers, Smart TVs, and PCs, while supporting local Pi 5 mesh networks.
> - **POS Mock Simulator**: To test the two-way sync and sold-out states, we provide a dashboard tab to toggle "sold out" on menu items. This triggers simulated Square webhook events to NestJS, immediately broadcasting layout updates down to active TVs.

---

## Decisions Reached from Grill-Me Session

> [!TIP]
>
> - **Layout Editor Engine**: Structured pre-defined layout sections (like Split Screen or Grid) with drag-and-drop components, but allowing absolute positioning/popovers for floating overlays, badges, and banners.
> - **Raspberry Pi 5 Setup & Auto-Updates**: Delivered as both a unified one-line curl installation script and a pre-built OS image configured to automatically run that script on first boot.
> - **POS Webhook Integration**: A mock POS simulator inside the admin dashboard to trigger webhook events (e.g. toggling sold-out states) will be built first, followed by real Square/Toast API integrations.
> - **Custom CSS Editor**: A rich, autocompleting CSS code editor accompanied by an interactive CSS class selector dictionary sidebar and pre-built design recipes (e.g. Neon borders, chalkboard styles).
> - **Slides & PowerPoint**: Mixed slide component playlist supporting Menus, Images, Videos, and Google Slides published URLs (rendered inside iframes). Server-side PPTX file conversion to images is deferred.
> - **TV Pairing Lifecycle**: Displays generate a simple 4-character pairing code that remains active and valid persistently until paired or closed.
> - **Font Selection**: Curated dropdown list of highly readable signage-optimized design fonts (e.g. Outfit, Montserrat, Bebas Neue) along with a custom text field to load any arbitrary Google Font.
> - **Offline Resilience**: Basic offline caching of layout configuration and menu items using LocalStorage/IndexedDB to prevent blank screens during ambient network drops.
> - **Hamburger Animation**: Pure Tailwind CSS transitions on three line elements inside a button (handling rotation, translation, and opacity) to morph from three bars to an 'X' icon.
> - **Sidebar Navigation & Routes**: Pre-configure all 6 main dashboard routes. Build active views for Kitchen Dashboard, TV Signage layouts, paired devices, and the POS simulator. Settings/profile will contain mock panels.
> - **Dashboard Authentication**: Fully functional Supabase authentication protecting the dashboard path, seeded with organization "Dtown Cafe" and default administrator `conar@dtown.cafe` (`password`).
> - **Playlist Drag-and-Drop**: Use a robust external drag-and-drop library (e.g. @dnd-kit or @hello-pangea/dnd) for smooth reordering animations and transitions in the slide editor.

---

## Proposed Changes

### 1. Database Schema

Create the database tables and RLS policies for signage components.

#### [NEW] [packages/supabase/schema.sql](file:///home/conar/code/sous.tools/packages/supabase/schema.sql)

SQL script defining the signage tables:

- `signage_layouts`: holds layout config, CSS, fonts, and slides playlist.
- `signage_displays`: links physical screens to layouts, stores pairing codes, and tracking parameters.
- `square_items`: stores mock POS inventory items synced from the simulator.
- Enables RLS policies and seeds the Dtown Cafe organization and `conar@dtown.cafe` account.

---

### 2. Shared Types (`@soustools/api-types`)

Declare type-safe contracts for layouts, slides, custom options, and display pairings.

#### [MODIFY] [packages/api-types/src/index.ts](file:///home/conar/code/sous.tools/packages/api-types/src/index.ts)

Extend interfaces to support the playlist of mixed slide components:

- `SignageLayoutConfig`: supports googleFont, customCss, soldOutBehavior, and array of slides.
- `SignageSlide`: discriminated union of `MenuSlide`, `ImageSlide`, `VideoSlide`, `IframeSlide`, and `PowerpointSlide`.
- `SignageOverlay`: positions absolute badges/labels over the slides.

---

### 3. NestJS Backend API (`apps/api`)

Add backend endpoints, controller logic, and a Socket.io gateway for real-time invalidation.

#### [NEW] [apps/api/src/modules/signage/signage.gateway.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/signage/signage.gateway.ts)

Socket.io Gateway allowing TV displays to join room `display:[id]` and receive `layout_updated` notifications.

#### [NEW] [apps/api/src/modules/signage/signage.controller.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/signage/signage.controller.ts)

CRUD endpoints for layouts, displays, and client pairing:

- `/signage/layouts`: CRUD operations.
- `/signage/displays/pair/register`: Client requests a 4-char code.
- `/signage/displays/pair/confirm`: Admin submits 4-char code to link a display to their organization.

#### [NEW] [apps/api/src/modules/pos-simulator/pos-simulator.controller.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/pos-simulator/pos-simulator.controller.ts)

Mock endpoints to seed/toggle Square catalog items and dispatch webhook event simulations.

#### [MODIFY] [apps/api/src/app.module.ts](file:///home/conar/code/sous.tools/apps/api/src/app.module.ts)

Register the new modules in the root application context.

---

### 4. Admin Dashboard (`apps/app`)

Build a beautiful, interactive layout editor, display manager, and POS simulator tab wrapped in a premium responsive dashboard layout.

#### [NEW] [apps/app/src/components/layout/sidebar.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/layout/sidebar.tsx)

Responsive, minimalistic sidebar navigation:

- **Phone**: Hidden by default, slides in from left on drawer toggle, morphs hamburger icon to 'X'.
- **Tablet**: Permanent icons-only view.
- **Desktop**: Expanded sidebar (icons + labels) by default, toggleable to collapse/expand.

#### [NEW] [apps/app/src/components/layout/app-bar.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/layout/app-bar.tsx)

Sticky header displaying the current section title, hamburger toggles, and user profile button with dropdown (links to Logout, Profile Settings).

#### [NEW] [apps/app/src/app/dashboard/layout.tsx](file:///home/conar/code/sous.tools/apps/app/src/app/dashboard/layout.tsx)

Next.js sub-layout integrating the Sidebar and AppBar, managing sidebar open/close state, and wrapping children dashboard pages.

#### [NEW] [apps/app/src/components/signage/layout-builder.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/signage/layout-builder.tsx)

Tabbed visual layout builder (file length kept under 150 lines by abstracting sub-panels):

- **Playlist Tab**: Drag-and-drop slide manager (Menu, Image, Video, Web URL).
- **Design Tab**: Configures column layout, selects highlight items, and sets sold-out options.
- **Styling Tab**: Custom CSS editor (using a lightweight Monaco-like code block) and Google Fonts dropdown.
- **Overlays Tab**: Add absolutely-positioned badges/notices.

#### [NEW] [apps/app/src/components/signage/css-helper.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/signage/css-helper.tsx)

Interactive CSS class reference panel. Shows class dictionary, click-to-copy, and click-to-insert preset templates (e.g. Neon Borders, Chalkboard Type, Pulsing Animations).

#### [NEW] [apps/app/src/components/signage/display-manager.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/signage/display-manager.tsx)

Manages active TV devices, lists online status, and features a "Pair Screen" dialog.

#### [NEW] [apps/app/src/components/signage/pos-simulator.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/signage/pos-simulator.tsx)

A simple grid of synced mock menu items with checkboxes to toggle `is_sold_out` state, triggering webhook broadcasts.

---

### 5. TV Signage Player Client (`apps/tv-signage`)

Implement the actual display player that receives commands and renders the slides.

#### [MODIFY] [apps/tv-signage/src/app/display/[id]/page.tsx](file:///home/conar/code/sous.tools/apps/tv-signage/src/app/display/[id]/page.tsx)

The player logic:

- If display is unpaired, shows pairing code screen.
- If paired, loads Socket.io and listens for `layout_updated` events.
- Cycles through configured slides with CSS transitions.
- Loads Google Fonts and injects custom CSS inside an isolated `<style>` block.
- Applies chosen sold-out styling overrides (hidden, struck-through, or colored badges) dynamically.

---

### 6. Raspberry Pi Kiosk Setup & Deploy

Add target positioning scripts for Wayland Labwc window mapping.

#### [NEW] [deploy/pi/kiosk.sh](file:///home/conar/code/sous.tools/deploy/pi/kiosk.sh)

Script that starts two Chromium windows with customized titles:

- Title `SignageDisplay1` opens `http://localhost:3000/display/[id-1]`
- Title `SignageDisplay2` opens `http://localhost:3000/display/[id-2]`

#### [NEW] [deploy/pi/labwc-rc.xml](file:///home/conar/code/sous.tools/deploy/pi/labwc-rc.xml)

Labwc mapping configuration that locks `SignageDisplay1` onto `HDMI-A-1` and `SignageDisplay2` onto `HDMI-A-2` with no decoration and full scale.

#### [NEW] [deploy/pi/setup.sh](file:///home/conar/code/sous.tools/deploy/pi/setup.sh)

One-line curl installer script that automates Raspberry Pi initialization:

- Installs Labwc, Docker, Chromium-browser, and Watchtower.
- Sets up systemd service to run `kiosk.sh` on boot.
- Installs Watchtower cron for automatic updates.

---

## Verification Plan

### Automated Tests

1. **Vitest Unit Tests**: Implement unit tests for the layout config parser and slide transition scheduler in `apps/tv-signage`.
2. **NestJS Gateway Tests**: Test Socket.io event broadcasting and pairing registration flows.

### Manual Verification

1. Open the Admin App dashboard and pair two TV displays.
2. Toggle an item's sold-out state in the POS Simulator tab and verify the TV displays update instantly.
3. Inject custom CSS (e.g. `.menu-item { color: orange; font-weight: bold; }`) and verify it renders instantly on the TV screen.
4. Verify slide transitions work correctly when playlists combine Menus, Images, and custom Web Pages.
