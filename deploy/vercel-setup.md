# Vercel Project Setup — Runbook

Vercel deployments are handled via **native GitHub integration** — no tokens or credentials are stored in this repository. Every push to `main` or `staging` triggers automatic Vercel deployments.

## Project Configuration

| Vercel Project | Root Directory | Branch → Environment |
|---|---|---|
| `sous-tools-app` | `apps/app` | `main` → Production, `staging` → Preview |
| `sous-tools-docs` | `apps/docs` | `main` → Production, `staging` → Preview |
| `sous-tools-customer-site` | `apps/customer-site` | `main` → Production, `staging` → Preview |
| `sous-tools-signage` | `apps/signage` | `main` → Production, `staging` → Preview |

## One-Time Setup (per project)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → select team **sous-tools**
2. Open the project → **Settings → Git**
3. Confirm the GitHub repository `conarwelsh/sous.tools` is connected
4. Set **Root Directory** to the value in the table above
5. Enable **"Include source files outside of the Root Directory in the Build Step"**

## Environment Variables

All secrets are managed in **Infisical** — not the Vercel dashboard. Each project needs only the four Infisical bootstrap variables:

| Variable | Description |
|---|---|
| `INFISICAL_CLIENT_ID` | Infisical machine identity client ID |
| `INFISICAL_CLIENT_SECRET` | Infisical machine identity client secret |
| `INFISICAL_PROJECT_ID` | Infisical project ID (`4e40fdc4-358b-4216-b7c4-30e5506f9277`) |
| `INFISICAL_ENV` | `prod` for Production, `staging` for Preview/Staging |

> **Where to find these values**: Log into [app.infisical.com](https://app.infisical.com) → Project → Machine Identities.  
> **Never** paste these into this repository or any file tracked by Git.

## Framework Settings

All projects use the **Next.js** framework preset. No custom build commands needed — Vercel auto-detects Next.js via `next.config.*` in the root directory.

## Deployment Triggers

- `main` branch push → Production deployment (automatic)
- `staging` branch push → Preview deployment (automatic)
- Pull requests → Preview deployment per-PR (automatic)

No manual CLI deploys or webhook triggers are needed.
