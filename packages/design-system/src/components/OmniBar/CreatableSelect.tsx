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
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const showCreateOption =
    search.trim() !== "" &&
    !options.some((o) => o.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white/60 dark:bg-black/40 border rounded px-2.5 py-1.5 text-sm outline-none transition-all flex items-center justify-between cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          !value
            ? "border-red-500/70 text-red-600 dark:text-red-300 focus-within:border-red-400"
            : "border-black/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400 focus-within:border-sky-500"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={16} className="text-zinc-500 dark:text-zinc-400 ml-2 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-60">
          <div className="p-1.5 border-b border-slate-100 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-900/50">
            <input
              type="text"
              placeholder="Search or type to create..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-sky-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 transition-colors flex items-center justify-between ${
                    opt.id === value
                      ? "bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-800 dark:text-zinc-300"
                  }`}
                >
                  <span>{opt.name}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
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
                className="px-3 py-2 text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 font-semibold cursor-pointer border-t border-slate-100 dark:border-zinc-900 transition-colors"
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
