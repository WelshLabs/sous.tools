const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Compound expressions (dark mode variants)
  { regex: /bg-zinc-50 dark:bg-zinc-950/g, replacement: 'bg-background' },
  { regex: /bg-zinc-100 dark:bg-card/g, replacement: 'bg-card' },
  { regex: /bg-zinc-100 dark:bg-zinc-900/g, replacement: 'bg-card' },
  
  { regex: /border-black\/5 dark:border-white\/5/g, replacement: 'border-border' },
  { regex: /border-black\/10 dark:border-white\/10/g, replacement: 'border-border' },
  
  { regex: /text-zinc-900 dark:text-zinc-100/g, replacement: 'text-foreground' },
  { regex: /text-zinc-800 dark:text-zinc-200/g, replacement: 'text-foreground' },
  { regex: /text-zinc-700 dark:text-zinc-300/g, replacement: 'text-muted-foreground' },
  { regex: /text-zinc-500 dark:text-zinc-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-zinc-400 dark:text-zinc-500/g, replacement: 'text-muted-foreground' },
  
  { regex: /hover:text-zinc-800 dark:text-zinc-200/g, replacement: 'hover:text-foreground' },
  { regex: /hover:bg-black\/5 dark:bg-white\/5/g, replacement: 'hover:bg-muted/50' },
  { regex: /bg-black\/5 dark:bg-white\/5/g, replacement: 'bg-muted/50' },
  
  { regex: /bg-white\/80 dark:bg-black\/80/g, replacement: 'bg-background/80' },

  // Single utility classes
  { regex: /\bbg-zinc-950\b/g, replacement: 'bg-background' },
  { regex: /\bbg-zinc-900\b/g, replacement: 'bg-card' },
  { regex: /\bbg-zinc-800\b/g, replacement: 'bg-secondary' },
  { regex: /\bbg-zinc-100\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-zinc-50\b/g, replacement: 'bg-background' },
  
  { regex: /\bborder-zinc-800\b/g, replacement: 'border-border' },
  { regex: /\bborder-zinc-700\b/g, replacement: 'border-border' },
  
  { regex: /\btext-zinc-100\b/g, replacement: 'text-foreground' },
  { regex: /\btext-zinc-200\b/g, replacement: 'text-foreground' },
  { regex: /\btext-zinc-300\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-400\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-500\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-700\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-800\b/g, replacement: 'text-foreground' },
  { regex: /\btext-zinc-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-zinc-950\b/g, replacement: 'text-foreground' },
  
  // A few more specific ones
  { regex: /\bbg-black\b/g, replacement: 'bg-background' },
  { regex: /\bbg-white\b/g, replacement: 'bg-background' },
  { regex: /\btext-white\b/g, replacement: 'text-foreground' },
  { regex: /\btext-black\b/g, replacement: 'text-foreground' },
];

walkDir('/sous.tools/packages/domain-signage/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (let rule of replacements) {
      content = content.replace(rule.regex, rule.replacement);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
