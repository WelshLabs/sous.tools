"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function formatInlineText(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md border border-cyan-500/20 bg-cyan-950/30 px-1.5 py-0.5 font-mono text-[12px] font-medium text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function TextSection({ rawText }: { rawText: string }) {
  const lines = rawText.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${i}`} className="mt-3 mb-1 text-sm font-bold tracking-tight text-foreground">
          {formatInlineText(trimmed.slice(4))}
        </h3>,
      );
    } else if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${i}`} className="mt-4 mb-1 text-base font-bold tracking-tight text-foreground">
          {formatInlineText(trimmed.slice(3))}
        </h2>,
      );
    } else if (trimmed.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${i}`} className="mt-4 mb-2 text-lg font-extrabold tracking-tight text-foreground">
          {formatInlineText(trimmed.slice(2))}
        </h1>,
      );
    } else if (trimmed.startsWith("> ")) {
      nodes.push(
        <blockquote key={`quote-${i}`} className="my-2 border-l-2 border-primary/50 pl-3 italic text-muted-foreground">
          {formatInlineText(trimmed.slice(2))}
        </blockquote>,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      nodes.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-foreground/90 pl-1 my-0.5">
          {formatInlineText(trimmed.slice(2))}
        </li>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      nodes.push(
        <li key={`oli-${i}`} className="ml-4 list-decimal text-foreground/90 pl-1 my-0.5">
          {formatInlineText(trimmed.replace(/^\d+\.\s/, ""))}
        </li>,
      );
    } else {
      nodes.push(
        <p key={`p-${i}`} className="my-1 text-foreground/90">
          {formatInlineText(trimmed)}
        </p>,
      );
    }
  }

  return <>{nodes}</>;
}

export function MarkdownMessageContent({ content }: { content: string }) {
  const cleaned = content.replace(/^\[\d+ attachments?\]\s*/, "");
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <TextSection key={`text-${lastIndex}`} rawText={cleaned.slice(lastIndex, match.index)} />,
      );
    }
    elements.push(
      <CodeBlock
        key={`code-${match.index}`}
        language={match[1]}
        code={match[2].trimEnd()}
      />,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleaned.length) {
    elements.push(
      <TextSection key={`text-${lastIndex}`} rawText={cleaned.slice(lastIndex)} />,
    );
  }

  return <div className="space-y-2.5 text-sm leading-relaxed">{elements}</div>;
}
