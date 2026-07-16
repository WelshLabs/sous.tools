const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  '.git',
  'api-client'
]);

const IGNORED_PATHS = new Set([
  'apps/api',
  'apps/cli'
]);

const VIOLATION_PATTERNS = [
  /\bfetch\s*\(/,
  /\baxios\b/
];

const results = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
    
    if (IGNORED_PATHS.has(relPath)) {
      continue;
    }

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.has(file)) {
        scanDir(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

function scanFile(filePath) {
  if (filePath.endsWith('.d.ts') || filePath.includes('schema.d.ts') || filePath.includes('schema.ts')) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    let isViolation = false;
    for (const pattern of VIOLATION_PATTERNS) {
      if (pattern.test(line)) {
        isViolation = true;
        break;
      }
    }
    
    if (isViolation) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        return;
      }
      
      if (
        trimmed.includes('api-client') || 
        trimmed.includes('@soustools/api-client') ||
        trimmed.includes('//') && trimmed.indexOf('//') < trimmed.search(VIOLATION_PATTERNS[0])
      ) {
        return;
      }
      
      results.push({
        file: path.relative(process.cwd(), filePath),
        line: index + 1,
        text: trimmed
      });
    }
  });
}

fs.mkdirSync('docs/audits', { recursive: true });

if (fs.existsSync('apps')) scanDir('apps');
if (fs.existsSync('packages')) scanDir('packages');

let md = `# Architectural Audit: Direct HTTP Fetch Violations\n\n`;
md += `**Date:** ${new Date().toLocaleDateString()}\n`;
md += `**Scope:** Frontend Apps and Domain Packages (excluding \\\`packages/api-client\\\`, \\\`apps/api\\\`, \\\`apps/cli\\\`)\n`;
md += `**Rule:** All frontend network requests must go through our unified \\\`packages/api-client\\\`. Native \\\`fetch()\\\` or \\\`axios\\\` is strictly prohibited.\n\n`;

if (results.length === 0) {
  md += `## 🎉 No Violations Found!\n\nAll frontend files comply with the unified API client architecture.\n`;
} else {
  md += `## Summary of Violations\n\n`;
  md += `Found **${results.length}** violation(s) across the frontend apps and domain packages.\n\n`;
  md += `| File Path | Line Number | Code Snippet |\n`;
  md += `| :--- | :--- | :--- |\n`;
  results.forEach(res => {
    const escapedText = res.text.replace(/\|/g, '\\|').replace(/`/g, '\\`');
    md += `| \\\`${res.file}\\\` | ${res.line} | \\\`${escapedText}\\\` |\n`;
  });
  md += `\n\n`;
  md += `## Detailed Violations Log\n\n`;
  results.forEach((res, i) => {
    md += `### ${i + 1}. \\\`${res.file}\\\` (Line ${res.line})\n`;
    md += `\`\`\`typescript\n${res.text}\n\`\`\`\n\n`;
  });
}

fs.writeFileSync('docs/audits/fetch_violations.md', md);
console.log('Audit completed successfully! Written to docs/audits/fetch_violations.md');