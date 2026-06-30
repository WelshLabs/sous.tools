const fs = require('fs');
const file = 'apps/app/src/app/(dashboard)/kds/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: 'bg-zinc-950', replace: 'bg-zinc-50 dark:bg-zinc-950' },
  { search: 'text-slate-100', replace: 'text-zinc-900 dark:text-slate-100' },
  { search: 'text-white', replace: 'text-zinc-900 dark:text-white' },
  { search: 'bg-white/5', replace: 'bg-black/5 dark:bg-white/5' },
  { search: 'bg-white/10', replace: 'bg-black/10 dark:bg-white/10' },
  { search: 'border-white/10', replace: 'border-black/10 dark:border-white/10' },
  { search: 'border-white/5', replace: 'border-black/5 dark:border-white/5' },
  { search: 'border-white/20', replace: 'border-black/20 dark:border-white/20' },
  { search: 'bg-black/40', replace: 'bg-black/5 dark:bg-black/40' },
  { search: 'text-zinc-300', replace: 'text-zinc-700 dark:text-zinc-300' },
  { search: 'text-zinc-400', replace: 'text-zinc-600 dark:text-zinc-400' },
  { search: 'text-slate-400', replace: 'text-zinc-600 dark:text-slate-400' },
  { search: 'text-zinc-100', replace: 'text-zinc-900 dark:text-zinc-100' },
  { search: 'text-zinc-200', replace: 'text-zinc-800 dark:text-zinc-200' },
  { search: 'hover:text-white', replace: 'hover:text-zinc-900 dark:hover:text-white' },
  { search: 'hover:bg-white/10', replace: 'hover:bg-black/10 dark:hover:bg-white/10' },
  { search: 'hover:border-white/20', replace: 'hover:border-black/20 dark:hover:border-white/20' },
  { search: 'bg-black/20', replace: 'bg-black/5 dark:bg-black/20' },
  { search: 'bg-black/60', replace: 'bg-white/50 dark:bg-black/60' },
  { search: 'text-slate-100', replace: 'text-zinc-900 dark:text-slate-100' },
  { search: 'bg-black/85', replace: 'bg-black/40 dark:bg-black/85' },
  { search: 'text-zinc-900 dark:text-white', replace: 'text-white' } // revert text-white for buttons or specific places if needed, actually I shouldn't globally replace text-white everywhere unless I check.
];

// Let's refine text-white replacement to avoid messing up specific things
replacements.pop();

for (const {search, replace} of replacements) {
  content = content.split(search).join(replace);
}

// Revert button text-white
content = content.replace(/text-zinc-900 dark:text-white text-black hover:bg-zinc-200/g, 'text-black hover:bg-zinc-200');

fs.writeFileSync(file, content);
console.log('Fixed');
