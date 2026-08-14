"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export interface CreatableSelectOption {
  id: string;
  name: string;
}

export interface CreatableSelectProps {
  disabled?: boolean;
  value: string;
  options: CreatableSelectOption[];
  onChange: (value: string | null) => void;
  onCreate: (name: string) => void;
  placeholder: string;
}

export function CreatableSelect({
  disabled,
  value,
  options,
  onChange,
  onCreate,
  placeholder,
}: CreatableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  const showCreateOption =
    search.trim() !== "" &&
    !options.some((o) => o.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded border bg-white/60 px-2.5 py-1.5 text-sm transition-all outline-none dark:bg-black/40 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${
          !value
            ? "border-red-500/70 text-red-600 focus-within:border-red-400 dark:text-red-300"
            : "border-black/10 text-emerald-600 focus-within:border-sky-500 dark:border-white/10 dark:text-emerald-400"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          size={16}
          className="ml-2 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
        />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 flex max-h-60 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-slate-100 bg-slate-50 p-1.5 dark:border-zinc-900 dark:bg-zinc-900/50">
            <input
              type="text"
              placeholder="Search or type to create..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 ${
                    opt.id === value
                      ? "bg-slate-100 font-semibold text-emerald-600 dark:bg-zinc-800 dark:text-emerald-400"
                      : "text-slate-800 dark:text-zinc-300"
                  }`}
                >
                  <span>{opt.name}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-zinc-500 italic dark:text-zinc-400">
                No items match search
              </div>
            )}

            {showCreateOption && (
              <div
                onClick={() => {
                  onCreate(search.trim());
                  setIsOpen(false);
                  setSearch("");
                }}
                className="cursor-pointer border-t border-slate-100 px-3 py-2 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500 hover:text-white dark:border-zinc-900 dark:text-sky-400 dark:hover:bg-sky-600"
              >
                Create "{search.trim()}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
