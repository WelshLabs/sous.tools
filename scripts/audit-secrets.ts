import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const IGNORED_PATHS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "packages/config", // Allowed to access process.env
  "scripts", // Auditor and scripts allowed
  ".blueprint",
  "blueprints",
  "task.md",
  "walkthrough.md",
  "implementation_plan.md",
  "GEMINI.md",
];

let hasViolations = false;

/**
 * Recursively scans files in the directory to find occurrences of process.env or Deno.env.
 *
 * @param {string} dir Current directory path
 */
function scanDirectory(dir: string): void {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(rootDir, fullPath);

    // Skip ignored paths (supporting direct prefix matches and nested segment checks)
    const isIgnored = IGNORED_PATHS.some((ignored) => {
      if (
        relativePath === ignored ||
        relativePath.startsWith(ignored + "/") ||
        relativePath.startsWith(ignored + "\\")
      ) {
        return true;
      }
      const pathSegments = relativePath.split(/[\\/]/);
      return pathSegments.includes(ignored);
    });
    if (isIgnored) {
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) {
      auditFile(fullPath, relativePath);
    }
  }
}

/**
 * Audits a single file for environment variable references.
 *
 * @param {string} filePath Absolute file path
 * @param {string} relativePath Relative file path for reporting
 */
function auditFile(filePath: string, relativePath: string): void {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  // Regex to check for process.env or Deno.env
  const envRegex = /\b(process\.env|Deno\.env)\b/;

  lines.forEach((line, index) => {
    if (envRegex.test(line)) {
      // Ignore comment lines (lines starting with // or * or /*)
      const cleanLine = line.trim();
      if (
        cleanLine.startsWith("//") ||
        cleanLine.startsWith("*") ||
        cleanLine.startsWith("/*")
      ) {
        return;
      }

      console.error(
        `\x1b[31m[AUDIT VIOLATION]\x1b[0m ${relativePath}:${index + 1} -> Native environment access found:`,
      );
      console.error(`  > ${cleanLine}`);
      hasViolations = true;
    }
  });
}

console.log("[@soustools/config] Starting secret isolation audit...");
try {
  scanDirectory(rootDir);

  if (hasViolations) {
    console.error(
      "\n\x1b[31m[@soustools/config] Audit FAILED. Direct process.env/Deno.env access is forbidden.\x1b[0m",
    );
    process.exit(1);
  } else {
    console.log(
      "\x1b[32m[@soustools/config] Audit PASSED. No direct environment variable access detected.\x1b[0m",
    );
    process.exit(0);
  }
} catch (error) {
  console.error("Audit script failed:", error);
  process.exit(1);
}
