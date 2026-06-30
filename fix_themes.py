import os
import re

replacements = [
    (r'(?<!dark:)\bbg-zinc-950\b(?!(\/| dark:))', r'bg-zinc-50 dark:bg-zinc-950'),
    (r'(?<!dark:)\bbg-zinc-900\b(?!(\/| dark:))', r'bg-zinc-100 dark:bg-zinc-900'),
    (r'(?<!dark:)\bbg-black\b(?!(\/| dark:))', r'bg-white dark:bg-black'),
    (r'(?<!dark:)\btext-slate-100\b(?!(\/| dark:))', r'text-zinc-900 dark:text-slate-100'),
    (r'(?<!dark:)\btext-zinc-100\b(?!(\/| dark:))', r'text-zinc-900 dark:text-zinc-100'),
    (r'(?<!dark:)\btext-zinc-200\b(?!(\/| dark:))', r'text-zinc-800 dark:text-zinc-200'),
    (r'(?<!dark:)\btext-zinc-300\b(?!(\/| dark:))', r'text-zinc-700 dark:text-zinc-300'),
    (r'(?<!dark:)\btext-zinc-400\b(?!(\/| dark:))', r'text-zinc-500 dark:text-zinc-400'),
    (r'(?<!dark:)\btext-zinc-500\b(?!(\/| dark:))', r'text-zinc-400 dark:text-zinc-500'),
    (r'(?<!dark:)\bborder-white/10\b', r'border-black/10 dark:border-white/10'),
    (r'(?<!dark:)\bborder-white/5\b', r'border-black/5 dark:border-white/5'),
    (r'(?<!dark:)\bbg-white/5\b', r'bg-black/5 dark:bg-white/5'),
    (r'(?<!dark:)\bbg-white/10\b', r'bg-black/10 dark:bg-white/10'),
    (r'(?<!dark:)\bbg-black/40\b', r'bg-black/5 dark:bg-black/40'),
    (r'(?<!dark:)\bbg-black/60\b', r'bg-white/50 dark:bg-black/60'),
    (r'(?<!dark:)\bbg-black/80\b', r'bg-white/80 dark:bg-black/80'),
    (r'(?<!dark:)\bbg-black/90\b', r'bg-white/90 dark:bg-black/90'),
]

for root, _, files in os.walk('apps/app/src'):
    for name in files:
        if name.endswith('.tsx') or name.endswith('.ts'):
            path = os.path.join(root, name)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            original = content
            for pat, repl in replacements:
                content = re.sub(pat, repl, content)
            
            # Fix duplicates
            content = content.replace('bg-zinc-50 dark:bg-zinc-50 dark:bg-zinc-950', 'bg-zinc-50 dark:bg-zinc-950')
            content = content.replace('bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900', 'bg-zinc-100 dark:bg-zinc-900')

            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
print('Sweep complete.')
