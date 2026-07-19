import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Warning: GITHUB_PERSONAL_ACCESS_TOKEN is not set.");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const BOUNDARY_ELEMENTS = [
  { type: "app", pattern: ["apps/web/**", "apps/pos-simulator/**", "apps/setup-portal/**"] },
  { type: "backend", pattern: ["apps/api/**", "apps/cli/**"] },
  { type: "domain", pattern: ["packages/domain-*/**"] },
  { type: "ui", pattern: ["packages/design-system/**"] },
  { type: "infrastructure", pattern: ["packages/supabase/**"] },
  { type: "shared", pattern: ["packages/config/**", "packages/logger/**", "packages/api-types/**", "packages/tsconfig/**"] }
];

const BOUNDARY_RULES = [
  { from: "app", disallow: ["infrastructure"], message: "Next.js apps cannot import from @soustools/supabase directly. Use the NestJS API for data fetching." },
  { from: "domain", disallow: ["infrastructure", "backend"], message: "Domain packages cannot import from infrastructure or backend apps." },
  { from: "ui", disallow: ["infrastructure", "backend"], message: "Design system cannot import from infrastructure or backend apps." }
];

function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

function getBoundaryType(filePath: string): string | null {
  let normalized = filePath.replace(/\\/g, '/');
  if (normalized.startsWith('./')) normalized = normalized.slice(2);
  for (const element of BOUNDARY_ELEMENTS) {
    for (const pattern of element.pattern) {
      if (globToRegex(pattern).test(normalized)) return element.type;
    }
  }
  return null;
}

function resolveImportPath(currentFile: string, importSource: string): string | null {
  if (importSource.startsWith('.') || importSource.startsWith('..')) {
    return path.join(path.dirname(currentFile), importSource);
  }
  if (importSource.startsWith('@soustools/')) {
    return `packages/${importSource.substring('@soustools/'.length)}/src/index.ts`;
  }
  return null;
}

const server = new Server({ name: "soustools-mcp-server", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      { name: "get_issue", description: "Fetch GitHub issue and comments.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, issue_number: { type: "number" } }, required: ["owner", "repo", "issue_number"] } },
      { name: "post_comment", description: "Post comment to GitHub issue.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, issue_number: { type: "number" }, body: { type: "string" } }, required: ["owner", "repo", "issue_number", "body"] } },
      { name: "open_pull_request", description: "Open a Pull Request on GitHub.", inputSchema: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, title: { type: "string" }, head: { type: "string" }, base: { type: "string" }, body: { type: "string" } }, required: ["owner", "repo", "title", "head", "base"] } },
      { name: "read_local_context", description: "Read local workspace context files.", inputSchema: { type: "object", properties: {} } },
      { name: "read_design_tokens", description: "Fetch semantic CSS variables from packages/design-system/index.css.", inputSchema: { type: "object", properties: {} } },
      { name: "check_boundaries", description: "Verify DDD ESLint boundaries for a file path.", inputSchema: { type: "object", properties: { filePath: { type: "string" } }, required: ["filePath"] } }
    ]
  };
});

interface GetIssueArgs {
  owner: string;
  repo: string;
  issue_number: number;
}

interface PostCommentArgs {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}

interface OpenPullRequestArgs {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
}

interface CheckBoundariesArgs {
  filePath: string;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "get_issue": {
        const { owner, repo, issue_number } = (args ?? {}) as unknown as GetIssueArgs;
        if (!GITHUB_TOKEN) throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN is missing.");
        const { data: issue } = await octokit.issues.get({ owner, repo, issue_number });
        const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number });
        return { content: [{ type: "text", text: JSON.stringify({ title: issue.title, state: issue.state, body: issue.body, comments: comments.map(c => ({ author: c.user?.login, body: c.body })) }, null, 2) }] };
      }
      case "post_comment": {
        const { owner, repo, issue_number, body } = (args ?? {}) as unknown as PostCommentArgs;
        if (!GITHUB_TOKEN) throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN is missing.");
        const { data: comment } = await octokit.issues.createComment({ owner, repo, issue_number, body });
        return { content: [{ type: "text", text: `Comment posted: ${comment.html_url}` }] };
      }
      case "open_pull_request": {
        const { owner, repo, title, head, base, body } = (args ?? {}) as unknown as OpenPullRequestArgs;
        if (!GITHUB_TOKEN) throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN is missing.");
        const { data: pr } = await octokit.pulls.create({ owner, repo, title, head, base, body });
        return { content: [{ type: "text", text: `PR opened: ${pr.html_url}` }] };
      }
      case "read_local_context": {
        const root = process.cwd();
        const treePaths = [path.join(root, ".context", "directory-tree.txt"), path.join(root, "docs", "context", "directory-tree.txt")];
        const graphPaths = [path.join(root, ".context", "turbo-graph.txt"), path.join(root, "docs", "context", "turbo-graph.txt")];
        let tree = "Not found", graph = "Not found";
        for (const p of treePaths) { if (fs.existsSync(p)) { tree = fs.readFileSync(p, "utf-8"); break; } }
        for (const p of graphPaths) { if (fs.existsSync(p)) { graph = fs.readFileSync(p, "utf-8"); break; } }
        return { content: [{ type: "text", text: `=== directory-tree.txt ===\n${tree}\n\n=== turbo-graph.txt ===\n${graph}` }] };
      }
      case "read_design_tokens": {
        const cssPath = path.join(process.cwd(), "packages/design-system/index.css");
        if (!fs.existsSync(cssPath)) throw new Error("CSS file not found.");
        const css = fs.readFileSync(cssPath, "utf-8");
        const parseBlock = (regex: RegExp) => {
          const m = css.match(regex);
          if (!m || !m[1]) return {};
          const res: Record<string, string> = {};
          m[1].split("\n").forEach(line => {
            const t = line.trim();
            if (t.startsWith("--")) {
              const p = t.split(":");
              if (p.length >= 2) res[p[0].trim()] = p.slice(1).join(":").replace(/;$/, "").trim();
            }
          });
          return res;
        };
        const rootVars = parseBlock(/:root\s*\{([^}]*)\}/);
        const darkVars = parseBlock(/\.dark\s*\{([^}]*)\}/);
        const themeMatch = css.match(/@theme\s+inline\s*\{([^}]*)\}/);
        const report = { file: "packages/design-system/index.css", light: rootVars, dark: darkVars, theme: themeMatch?.[1]?.trim()?.split("\n")?.map(l => l.trim())?.filter(Boolean) || [] };
        return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
      }
      case "check_boundaries": {
        const { filePath } = (args ?? {}) as unknown as CheckBoundariesArgs;
        const root = process.cwd();
        const full = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
        const rel = path.isAbsolute(filePath) ? path.relative(root, filePath) : filePath;
        if (!fs.existsSync(full)) throw new Error(`File not found: ${rel}`);
        const content = fs.readFileSync(full, "utf-8");
        const imports: string[] = [];
        
        const parsedImports = [...content.matchAll(/import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
        const parsedSideEffects = [...content.matchAll(/import\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
        const parsedExports = [...content.matchAll(/export\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
        const parsedDynamics = [...content.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]);
        const parsedRequires = [...content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]);
        
        imports.push(...parsedImports, ...parsedSideEffects, ...parsedExports, ...parsedDynamics, ...parsedRequires);
        
        const currentType = getBoundaryType(rel);
        const violations: { source: string; resolved: string; fromType: string; toType: string; message: string }[] = [];
        const checkedImports: { source: string; resolved: string; type: string }[] = [];

        for (const imp of imports) {
          const resolved = resolveImportPath(rel, imp);
          if (!resolved) continue;
          const impType = getBoundaryType(resolved);
          if (!impType) continue;
          
          checkedImports.push({ source: imp, resolved, type: impType });
          
          if (currentType) {
            const rule = BOUNDARY_RULES.find(r => r.from === currentType);
            if (rule && rule.disallow.includes(impType)) {
              violations.push({ source: imp, resolved, fromType: currentType, toType: impType, message: rule.message });
            }
          }
        }

        const report = { file: rel, type: currentType || "unknown", totalImportsFound: imports.length, internalImportsChecked: checkedImports, violations, success: violations.length === 0 };
        return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Soustools MCP Server running on stdio");
}

run().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Fatal:", message);
  process.exit(1);
});
