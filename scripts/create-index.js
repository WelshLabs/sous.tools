const fs = require('fs');
const path = require('path');
const srcDir = path.join('\\\\wsl$\\Ubuntu-22.04\\home\\conar\\code\\sous.tools\\packages\\domain-signage\\src');

const files = fs.readdirSync(srcDir);
const exportsLines = [];
for (const file of files) {
  if (file === 'index.ts' || file === 'index.tsx') continue;
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const baseName = file.replace(/\.tsx?$/, '');
    exportsLines.push(`export * from './${baseName}';`);
  }
}
const content = exportsLines.join('\n') + '\n';
fs.writeFileSync(path.join(srcDir, 'index.ts'), content);
