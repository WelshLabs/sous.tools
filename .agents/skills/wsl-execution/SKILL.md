---
name: wsl-execution
description: Commands and paths to execute builds, migrations, and package scripts within the WSL Ubuntu container from a Windows host.
---

# WSL Execution Reference

To run commands inside the WSL environment successfully on this host, follow these patterns.

## Path Environment

Always set the Node v22 path explicitly when running commands inside WSL to prevent permission or command-not-found issues:
`PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`

## Commands

### Project Build

To run builds inside WSL:

```bash
wsl bash -c "cd /home/conar/code/sous.tools && env PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin pnpm build"
```

### Git Status / Diff

For git status or diff within the WSL mount:

```bash
wsl git diff
```

### Running migrations / seeds

To run migrations or check status using Supabase CLI:

```bash
wsl bash -c "cd /home/conar/code/sous.tools && env PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin npx supabase status"
```
