const fs = require('fs');
const path = require('path');
const srcDir = path.join('\\\\wsl$\\Ubuntu-22.04\\home\\conar\\code\\sous.tools\\packages\\domain-signage\\src');
const destDir = path.join('\\\\wsl$\\Ubuntu-22.04\\home\\conar\\code\\sous.tools\\apps\\app\\src\\components\\signage');

function createStubs(currentSrc, currentDest, relativePath = '') {
  const items = fs.readdirSync(currentSrc, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(currentSrc, item.name);
    const destPath = path.join(currentDest, item.name);
    const itemRelPath = path.join(relativePath, item.name);
    
    if (item.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
      createStubs(srcPath, destPath, itemRelPath);
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      const content = `/**
 * @deprecated This component has been moved to @soustools/domain-signage.
 * Please import from '@soustools/domain-signage' instead.
 */
export * from '@soustools/domain-signage';
`;
      fs.writeFileSync(destPath, content);
    }
  }
}

createStubs(srcDir, destDir);
