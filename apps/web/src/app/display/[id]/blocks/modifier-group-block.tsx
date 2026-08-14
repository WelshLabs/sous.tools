"use client";

import React, { useEffect, useState } from "react";
import { api } from "@soustools/api-client";
import { type MenuItemStyles, type PosItem } from "@soustools/api-types";
import {
  resolveItemState,
  buildTitleStyle,
  buildPriceStyle,
} from "@/app/display/[id]/menu-item-style-utils";

interface ModifierOption {
  id: string;
  name: string;
  price: number;
  is_sold_out: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  min_selected_modifiers: number | null;
  max_selected_modifiers: number | null;
}

interface ModifierGroupBlockProps {
  modifierGroupId?: string;
  menuItemStyles: MenuItemStyles;
}

export function ModifierGroupBlock({
  modifierGroupId,
  menuItemStyles,
}: ModifierGroupBlockProps) {
  const [group, setGroup] = useState<ModifierGroup | null>(null);
  const [options, setOptions] = useState<ModifierOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!modifierGroupId) {
        setLoading(false);
        return;
      }

      try {
        // Resolve group
        const { data: grpData, error: grpError } = await (api.GET as any)(
          `/pos/modifier-groups/${modifierGroupId}`,
        );
        if (grpError) throw new Error();

        if (grpData) {
          setGroup((grpData as any).data || grpData);
        }

        // Fetch options linked to this group
        const { data: optsData, error: optsError } = await (api.GET as any)(
          `/pos/modifier-groups/${modifierGroupId}/options`,
        );
        const opts =
          !optsError && optsData ? (optsData as any).data || optsData : [];
        if (opts) {
          setOptions(opts as ModifierOption[]);
        }
      } catch (err) {
        console.error("Failed to load modifier group data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [modifierGroupId]);

  if (loading) {
    return (
      <div className="p-4 border border-zinc-800 rounded-xl animate-pulse bg-white/5 flex flex-col gap-2">
        <div className="h-4 bg-zinc-700 w-1/3 rounded" />
        <div className="h-3 bg-zinc-800 w-1/2 rounded" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 border border-dashed border-zinc-800 text-zinc-600 text-xs rounded-xl italic font-mono">
        Modifier Group not found ({modifierGroupId || "Unconfigured"})
      </div>
    );
  }

  return (
    <div className=" rounded-2xl p-5 flex flex-col gap-3 my-3">
      <div>
        <h4 className="text-lg font-bold uppercase tracking-tight text-white font-brand">
          {group.name}
        </h4>
        {(group.min_selected_modifiers !== null ||
          group.max_selected_modifiers !== null) && (
          <p className="text-xs text-zinc-500 font-sans italic mt-0.5">
            {group.min_selected_modifiers !== null &&
              `Min: ${group.min_selected_modifiers}`}
            {group.min_selected_modifiers !== null &&
              group.max_selected_modifiers !== null &&
              " | "}
            {group.max_selected_modifiers !== null &&
              `Max: ${group.max_selected_modifiers}`}
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2 pt-2 border-t border-white/5">
        {options.map((opt) => {
          // Resolve state styling choice for modifier option
          // (mimicking PosItem for state selection properties)
          const dummyItem: PosItem = {
            id: opt.id,
            organizationId: "",
            posProvider: "MANUAL",
            externalId: null,
            name: opt.name,
            description: null,
            price: opt.price,
            imageUrl: null,
            isSoldOut: opt.is_sold_out,
            createdAt: "",
            updatedAt: "",
          };
          const optStyle = resolveItemState(dummyItem, false, menuItemStyles);

          if (optStyle.hidden && opt.is_sold_out) return null;

          const textStyle = buildTitleStyle(optStyle);
          const priceStyle = buildPriceStyle(optStyle);

          return (
            <li
              key={opt.id}
              className="flex justify-between items-center text-sm text-zinc-300 transition-opacity duration-300"
              style={{
                opacity:
                  optStyle.dimOpacity !== undefined
                    ? optStyle.dimOpacity
                    : opt.is_sold_out
                      ? 0.5
                      : 1,
                filter: optStyle.grayscale ? "grayscale(1)" : undefined,
              }}
            >
              <span className="font-semibold" style={textStyle}>
                + {opt.name}
                {opt.is_sold_out && menuItemStyles.soldOut.badge && (
                  <span className="ml-2 text-[8px] px-1 bg-red-500 text-white rounded font-bold uppercase">
                    {menuItemStyles.soldOut.badge.text}
                  </span>
                )}
              </span>
              {Number(opt.price) > 0 && (
                <span
                  className="font-extrabold text-muted-foreground"
                  style={priceStyle}
                >
                  +${Number(opt.price).toFixed(2)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
