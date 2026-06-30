const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      callback(p);
    }
  });
};

const replacements = [
  { regex: /(?<!dark:)\bbg-zinc-950\b(?!(\/| dark:))/g, replace: 'bg-zinc-50 dark:bg-zinc-950' },
  { regex: /(?<!dark:)\bbg-zinc-900\b(?!(\/| dark:))/g, replace: 'bg-zinc-100 dark:bg-zinc-900' },
  { regex: /(?<!dark:)\bbg-black\b(?!(\/| dark:))/g, replace: 'bg-white dark:bg-black' },
  { regex: /(?<!dark:)\btext-slate-100\b(?!(\/| dark:))/g, replace: 'text-zinc-900 dark:text-slate-100' },
  { regex: /(?<!dark:)\btext-zinc-100\b(?!(\/| dark:))/g, replace: 'text-zinc-900 dark:text-zinc-100' },
  { regex: /(?<!dark:)\btext-zinc-200\b(?!(\/| dark:))/g, replace: 'text-zinc-800 dark:text-zinc-200' },
  { regex: /(?<!dark:)\btext-zinc-300\b(?!(\/| dark:))/g, replace: 'text-zinc-700 dark:text-zinc-300' },
  { regex: /(?<!dark:)\btext-zinc-400\b(?!(\/| dark:))/g, replace: 'text-zinc-500 dark:text-zinc-400' },
  { regex: /(?<!dark:)\btext-zinc-500\b(?!(\/| dark:))/g, replace: 'text-zinc-400 dark:text-zinc-500' },
  { regex: /(?<!dark:)\bborder-white\/10\b/g, replace: 'border-black/10 dark:border-white/10' },
  { regex: /(?<!dark:)\bborder-white\/5\b/g, replace: 'border-black/5 dark:border-white/5' },
  { regex: /(?<!dark:)\bbg-white\/5\b/g, replace: 'bg-black/5 dark:bg-white/5' },
  { regex: /(?<!dark:)\bbg-white\/10\b/g, replace: 'bg-black/10 dark:bg-white/10' },
  { regex: /(?<!dark:)\bbg-black\/40\b/g, replace: 'bg-black/5 dark:bg-black/40' },
  { regex: /(?<!dark:)\bbg-black\/60\b/g, replace: 'bg-white/50 dark:bg-black/60' },
  { regex: /(?<!dark:)\bbg-black\/80\b/g, replace: 'bg-white/80 dark:bg-black/80' },
  { regex: /(?<!dark:)\bbg-black\/90\b/g, replace: 'bg-white/90 dark:bg-black/90' },
];

walk('apps/app/src', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const {regex, replace} of replacements) {
    content = content.replace(regex, replace);
  }

  // Double check we haven't created duplicated like dark:bg-zinc-50 dark:bg-zinc-950
  content = content.replace(/bg-zinc-50 dark:bg-zinc-50 dark:bg-zinc-950/g, 'bg-zinc-50 dark:bg-zinc-950');
  content = content.replace(/bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/g, 'bg-zinc-100 dark:bg-zinc-900');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});

console.log('Sweep completed.');
