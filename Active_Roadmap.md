# Active Roadmap

## Deployment
- **Deployment Target**: Oracle Cloud (ARM64) is our sole production deployment target, entirely replacing Render.com and Vercel.

## Design System Rules
- **FORBIDDEN:** Hardcoding Tailwind colors (`slate-*`) or absolute z-indexes. You MUST use semantic CSS variables and "Midnight Slate" (`zinc-*`) classes defined in the design system.
