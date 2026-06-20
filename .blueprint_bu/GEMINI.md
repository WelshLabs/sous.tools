# Local Workspace Rules & Architectural Constraints

## 1. Automated Git Branching & Version Control

- Every new feature, module chunk, or technical implementation task must be executed inside an isolated Git feature branch branched cleanly off the 'main' branch.
- Agents must autonomously verify or create branches using the following prefix conventions:
  - Module 1 (Signage System): feature/signage-
  - Module 2 (Recipe Engine): feature/recipe-
  - Module 3 (Ingestion Engine): feature/ingestion-
  - Module 4 (Procurement Module): feature/procurement-

## 2. Critical Context Integration Links

Before executing any file modifications, code generation loops, or database schema creations, the agent must read the deep technical specifications located in your local blueprint directory:

- Core System Stack: Read .blueprint/project_blueprint.md
- UI Package & Colors: Read .blueprint/ui_ux_blueprint.md
- Feature Specs & SQL: Read .blueprint/master_feature_blueprint.md
- Secret Restrictions: Read .blueprint/config_package_blueprint.md

## 3. Absolute Code Guardrails (Coding Guidelines Enforcement)

- No Monolithic Files: Maximum file length for any TypeScript or TSX file is 150 lines. If logic or markup exceeds this, abstract it into small atomic elements immediately.
- Strict Type Security: No 'any' variants are permitted. All payload tracking configurations must use explicitly typed and shared interfaces inside @soustools/api-types.
- Environment Isolation Rule: Direct access to process.env, Deno.env, or runtime variables is strictly forbidden across the entire workspace outside of the @soustools/config workspace package located at packages/config/.

## 4. Environment & WSL2 Configuration

- WSL2 Environment: This is a WSL2 project. Do not attempt to execute commands using PowerShell or native Windows shells. Always proxy commands through `wsl.exe` or execute inside the WSL environment.
- Path Resolution Warning: Non-login execution streams in WSL2 do not load `.zshrc`/`.bashrc`, meaning version managers (like NVM) and package managers (like PNPM) are missing from the path, often causing Windows executables to run and fail with permission errors.
- Recommended Execution Methods:
  1. Env-Override Method (Fastest, avoids profile noise):
     Prepend the correct Linux NVM and PNPM bin directories to the PATH:
     - PNPM / Node: `wsl env 'PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/home/conar/.local/share/pnpm:$PATH' pnpm <args>`
     - Node: `wsl env 'PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:$PATH' node <args>`
     - Turbo (Local Repo): `wsl env 'PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/home/conar/.local/share/pnpm:$PATH' pnpm turbo <args>`
  2. Interactive Shell Method (Required for NVM version commands):
     Run inside an interactive zsh login session so profile configurations are loaded:
     - Usage: `wsl zsh -ic "<command>"`
     - Example: `wsl zsh -ic "nvm use"` or `wsl zsh -ic "pnpm install"`
