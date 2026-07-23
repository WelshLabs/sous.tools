import { Injectable, Logger } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { serverConfig as config } from "@soustools/config/server";
import { UsdaResolverService } from "../nutrition/usda-resolver.service";

@Injectable()
export class NormalizationService {
  private readonly logger = new Logger(NormalizationService.name);

  constructor(private readonly usdaResolver: UsdaResolverService) {}

  /**
   * Generates a 768-dimension vector embedding using the local nomic-embed-text model on Ollama.
   */
  private async getEmbedding(text: string): Promise<number[]> {
    const host = config.OLLAMA_HOST || "http://127.0.0.1:11434";
    try {
      const response = await fetch(`${host}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = (await response.json()) as { embedding: number[] };
      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error("Invalid embedding response format from Ollama");
      }
      return data.embedding;
    } catch (err) {
      this.logger.error(`Failed to generate embedding for text: "${text}"`, err);
      throw err;
    }
  }

  /**
   * Automatically populates any missing embeddings for the global master_items table.
   * This is a self-healing process to keep pgvector indices up-to-date.
   */
  async ensureMasterEmbeddings(): Promise<void> {
    try {
      const { data: list, error } = await supabase
        .from("master_items")
        .select("id, name, embedding");

      if (error) {
        this.logger.error("Failed to fetch master items for embedding check", error);
        return;
      }
      if (!list) return;

      for (const item of list) {
        if (!item.embedding) {
          try {
            this.logger.log(`Generating embedding for master item "${item.name}"`);
            const embedding = await this.getEmbedding(item.name);
            const { error: updateErr } = await supabase
              .from("master_items")
              .update({ embedding: embedding as any })
              .eq("id", item.id);

            if (updateErr) {
              this.logger.error(`Failed to save embedding for master item "${item.name}"`, updateErr);
            }
          } catch (err) {
            this.logger.error(`Error during self-healing master embedding generation for "${item.name}"`, err);
          }
        }
      }
    } catch (err) {
      this.logger.error("Error in ensureMasterEmbeddings", err);
    }
  }

  /**
   * Automatically populates any missing embeddings for the organization's items table.
   * This is a self-healing process to keep pgvector indices up-to-date.
   */
  async ensureEmbeddings(organizationId: string): Promise<void> {
    // Keep master ingredients embeddings up-to-date as well
    await this.ensureMasterEmbeddings();

    try {
      const { data: items, error } = await supabase
        .from("items")
        .select("id, name, embedding")
        .eq("organization_id", organizationId);

      if (error) {
        this.logger.error("Failed to fetch items for embedding check", error);
        return;
      }
      if (!items) return;

      for (const item of items) {
        if (!item.embedding) {
          try {
            this.logger.log(`Generating embedding for master item "${item.name}"`);
            const embedding = await this.getEmbedding(item.name);
            const { error: updateErr } = await supabase
              .from("items")
              .update({ embedding: embedding as any })
              .eq("id", item.id);

            if (updateErr) {
              this.logger.error(`Failed to save embedding for item "${item.name}"`, updateErr);
            }
          } catch (err) {
            this.logger.error(`Error during self-healing embedding generation for "${item.name}"`, err);
          }
        }
      }
    } catch (err) {
      this.logger.error("Error in ensureEmbeddings", err);
    }
  }

  /**
   * ── DOUBLE MATCH WATERFALL ────────────────────────────────────────────────
   *
   * Step A  — Vendor alias exact string match  →  items.id
   * Step B  — Tenant pgvector (match_items)    →  items.id + similarity
   * Step C  — Inspect the winning tenant item's `fdc_id`
   *             • Has fdc_id  → waterfall complete; return usdaFdcId from item
   *             • No fdc_id   → Step D
   * Step D  — Global pgvector (match_master_items)
   *             • High confidence match → lazy-load to items, set fdc_id
   *             • No match             → USDA API → cache to master_items
   *                                      → lazy-load / update items.fdc_id
   *
   * USDA is only called when the matched tenant item genuinely lacks an
   * fdc_id link, respecting the CTO performance directive.
   *
   * Returns every item enriched with:
   *   itemId               — winning tenant items.id
   *   usdaFdcId            — USDA FDC id (number | null)
   *   usdaName             — canonical USDA food name (string | null)
   *   needsUsdaVerification — true when USDA link was freshly resolved and
   *                           the UI must present the second confirmation step
   *   suggestions          — ranked tenant-item candidates for the UI
   * ─────────────────────────────────────────────────────────────────────────
   */
  async normalizeInvoiceItems(
    organizationId: string,
    vendorName: string | null | undefined,
    items: Array<{ rawName?: string; suggestedInternalName?: string; category?: string; amount?: number; unit?: string; price?: number; [key: string]: any }>,
    _isInvoice?: boolean
  ): Promise<any[]> {
    await this.ensureEmbeddings(organizationId);

    // ── Resolve vendorId if vendor already exists ──────────────────────────
    let vendorId: string | null = null;
    if (vendorName) {
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("organization_id", organizationId)
        .ilike("name", vendorName)
        .maybeSingle();
      if (vendor) vendorId = vendor.id;
    }

    // ── Pre-fetch all vendor aliases for this vendor in one query ──────────
    let aliases: Array<{ vendor_item_string: string; item_id: string }> = [];
    if (vendorId) {
      const { data, error } = await supabase
        .from("vendor_item_aliases")
        .select("vendor_item_string, item_id")
        .eq("organization_id", organizationId)
        .eq("vendor_id", vendorId);
      if (!error && data) aliases = data;
    }

    const normalizedItems = [];

    for (const item of items) {
      const rawName = (item.rawName || item.baseIngredient || "").trim();
      const suggestedInternalName = (item.suggestedInternalName || "").trim();
      const category = (item.category || "INGREDIENT").toUpperCase();
      // Concatenate raw vendor text with the AI's interpretation for a richer embedding.
      // e.g. "CUTLET BLACK.L 1/2 S/T - Black Label Chicken Cutlets" reliably finds "Chicken".
      const searchName = suggestedInternalName
        ? `${rawName} - ${suggestedInternalName}`
        : rawName;

      if (!rawName && !suggestedInternalName) {
        normalizedItems.push(item);
        continue;
      }

      try {
        const suggestions: Array<{
          itemId: string;
          name: string;
          similarity: number;
          matchColor: "green" | "yellow" | "orange";
        }> = [];

        // ── Step A: Vendor alias exact string match ────────────────────────
        const aliasMatch = aliases.find(
          (a) => a.vendor_item_string.toLowerCase() === rawName.toLowerCase()
        );

        if (aliasMatch) {
          const { data: aliasItem } = await supabase
            .from("items")
            .select("name")
            .eq("id", aliasMatch.item_id)
            .single();

          if (aliasItem) {
            suggestions.push({
              itemId: aliasMatch.item_id,
              name: aliasItem.name,
              similarity: 1.0,
              matchColor: "green",
            });
          }
        }

        // ── Step B: Tenant pgvector (match_items) ─────────────────────────
        let queryEmbedding: number[] | null = null;
        if (suggestions.length === 0) {
          try {
            queryEmbedding = await this.getEmbedding(searchName);
          } catch (err) {
            this.logger.warn(`Failed to generate embedding for "${searchName}"`, err);
          }
        }

        if (queryEmbedding && suggestions.length === 0) {
          const { data: tenantMatches, error: tenantErr } = await supabase.rpc("match_items", {
            query_embedding: `[${queryEmbedding.join(",")}]`,
            match_threshold: 0.5,
            match_count: 5,
            org_id: organizationId,
          });

          if (!tenantErr && tenantMatches && tenantMatches.length > 0) {
            for (const match of tenantMatches) {
              const similarity = Number(match.similarity);
              suggestions.push({
                itemId: match.id,
                name: match.name,
                similarity,
                matchColor: similarity > 0.95 ? "green" : similarity > 0.75 ? "yellow" : "orange",
              });
            }
          }
        }

        suggestions.sort((a, b) => b.similarity - a.similarity);
        const topSuggestion = suggestions[0] ?? null;

        // ── Step C: Check whether the winning tenant item has a USDA link ─
        let usdaFdcId: number | null = null;
        let usdaName: string | null = null;
        let needsUsdaVerification = false;

        if (topSuggestion && category === "INGREDIENT") {
          const { data: tenantItem } = await supabase
            .from("items")
            .select("fdc_id, name")
            .eq("id", topSuggestion.itemId)
            .single();

          if (tenantItem?.fdc_id) {
            // Already has a USDA link — waterfall complete
            usdaFdcId = tenantItem.fdc_id as number;
            // Retrieve canonical name from master_items for display
            const { data: masterItem } = await supabase
              .from("master_items")
              .select("name")
              .eq("fdc_id", usdaFdcId)
              .maybeSingle();
            usdaName = masterItem?.name ?? tenantItem.name;
          } else {
            // ── Step D: No fdc_id — resolve USDA link ───────────────────
            needsUsdaVerification = true;
            if (!queryEmbedding) {
              try {
                queryEmbedding = await this.getEmbedding(searchName);
              } catch (_) {
                // embedding unavailable; fall through to USDA text search
              }
            }

            // D1: Global pgvector (match_master_items)
            let resolvedFdcId: number | null = null;
            let resolvedMasterName: string | null = null;

            if (queryEmbedding) {
              const { data: globalMatches, error: globalErr } = await supabase.rpc("match_master_items", {
                query_embedding: `[${queryEmbedding.join(",")}]`,
                match_threshold: 0.5,
                match_count: 5,
              });

              if (!globalErr && globalMatches && globalMatches.length > 0) {
                const topGlobalMatch = globalMatches[0];
                const isHighConfidence = Number(topGlobalMatch.similarity) >= 0.85;

                if (isHighConfidence) {
                  const { data: globalIng } = await supabase
                    .from("master_items")
                    .select("id, name, fdc_id, density_g_ml, nutrition_macros, allergens, is_animal_product, is_meat, is_seafood, is_dairy, is_egg, is_gluten_source, embedding")
                    .eq("id", topGlobalMatch.id)
                    .single();

                  if (globalIng) {
                    resolvedFdcId = globalIng.fdc_id as number | null;
                    resolvedMasterName = globalIng.name;

                    // If the tenant item doesn't already have this USDA link, lazy-load or update
                    if (topSuggestion) {
                      // Update existing tenant item's fdc_id
                      await supabase
                        .from("items")
                        .update({ fdc_id: resolvedFdcId })
                        .eq("id", topSuggestion.itemId);
                    } else {
                      // Lazy-load: create a new tenant item from master_items data
                      this.logger.log(`Lazy-loading global master item "${globalIng.name}" into tenant items`);
                      const { data: newItem, error: insertErr } = await supabase
                        .from("items")
                        .insert({
                          organization_id: organizationId,
                          name: globalIng.name,
                          category: "INGREDIENT",
                          purchase_unit: "EACH",
                          units_per_case: 1,
                          each_weight_g: null,
                          density_g_ml: globalIng.density_g_ml,
                          is_animal_product: globalIng.is_animal_product,
                          is_meat: globalIng.is_meat,
                          is_seafood: globalIng.is_seafood,
                          is_dairy: globalIng.is_dairy,
                          is_egg: globalIng.is_egg,
                          is_gluten_source: globalIng.is_gluten_source,
                          allergens: Array.isArray(globalIng.allergens) ? globalIng.allergens : [],
                          fdc_id: resolvedFdcId,
                          nutrition_macros: globalIng.nutrition_macros,
                          embedding: globalIng.embedding,
                        })
                        .select()
                        .single();

                      if (!insertErr && newItem) {
                        const similarity = Number(topGlobalMatch.similarity);
                        suggestions.unshift({
                          itemId: newItem.id,
                          name: newItem.name,
                          similarity,
                          matchColor: similarity > 0.95 ? "green" : similarity > 0.75 ? "yellow" : "orange",
                        });
                      } else {
                        this.logger.error(`Failed to lazy-load master item: ${insertErr?.message}`);
                      }
                    }
                  }
                }
              }
            }

            // D2: USDA API fallback — only if global pgvector did not find a high-confidence match with fdc_id
            if (!resolvedFdcId && category === "INGREDIENT") {
              this.logger.log(`No master_items match for "${searchName}". Querying USDA API...`);
              const usdaMatch = await this.usdaResolver.resolveIngredient(searchName);

              if (usdaMatch) {
                this.logger.log(`USDA match: "${usdaMatch.fdc_food_name}" (FDC ID: ${usdaMatch.fdc_id}). Caching to master_items...`);

                let usdaEmbedding: number[] | null = queryEmbedding ?? null;
                if (!usdaEmbedding) {
                  try {
                    usdaEmbedding = await this.getEmbedding(usdaMatch.fdc_food_name || searchName);
                  } catch (_) { /* embedding unavailable */ }
                }

                const globalOrgId = "d0000000-0000-0000-0000-000000000000";

                // Upsert into master_items (idempotent on fdc_id)
                const { data: existingMaster } = await supabase
                  .from("master_items")
                  .select("id, name, fdc_id")
                  .eq("fdc_id", usdaMatch.fdc_id)
                  .maybeSingle();

                let cachedMaster = existingMaster;
                if (!cachedMaster) {
                  const { data: newGlobalIng, error: globalInsertErr } = await supabase
                    .from("master_items")
                    .insert({
                      organization_id: globalOrgId,
                      name: usdaMatch.fdc_food_name || searchName,
                      density_g_ml: 1.0,
                      nutrition_macros: {
                        calories: usdaMatch.calories || 0,
                        fatG: usdaMatch.total_fat_g || 0,
                        carbsG: usdaMatch.total_carbohydrate_g || 0,
                        proteinG: usdaMatch.protein_g || 0,
                      },
                      allergens: [],
                      is_animal_product: false,
                      fdc_id: usdaMatch.fdc_id,
                      embedding: usdaEmbedding as any,
                    })
                    .select()
                    .single();

                  if (!globalInsertErr) cachedMaster = newGlobalIng;
                  else this.logger.error(`Failed to cache USDA result to master_items: ${globalInsertErr.message}`);
                }

                if (cachedMaster) {
                  resolvedFdcId = cachedMaster.fdc_id as number;
                  resolvedMasterName = cachedMaster.name;

                  if (topSuggestion) {
                    // Update existing tenant item's fdc_id
                    await supabase
                      .from("items")
                      .update({ fdc_id: resolvedFdcId })
                      .eq("id", topSuggestion.itemId);
                  } else {
                    // Lazy-load a new tenant item
                    const { data: newItem, error: insertErr } = await supabase
                      .from("items")
                      .insert({
                        organization_id: organizationId,
                        name: cachedMaster.name,
                        category: "INGREDIENT",
                        purchase_unit: "EACH",
                        units_per_case: 1,
                        each_weight_g: null,
                        density_g_ml: 1.0,
                        fdc_id: resolvedFdcId,
                        embedding: usdaEmbedding as any,
                      })
                      .select()
                      .single();

                    if (!insertErr && newItem) {
                      suggestions.unshift({
                        itemId: newItem.id,
                        name: newItem.name,
                        similarity: 0.85,
                        matchColor: "yellow",
                      });
                    }
                  }
                }
              }
            }

            // Commit resolved USDA data to return shape
            if (resolvedFdcId) {
              usdaFdcId = resolvedFdcId;
              usdaName = resolvedMasterName;
            }
          }
        }

        // ── Final sort & push ─────────────────────────────────────────────
        suggestions.sort((a, b) => b.similarity - a.similarity);
        const finalTop = suggestions[0] ?? null;

        normalizedItems.push({
          ...item,
          itemId: finalTop ? finalTop.itemId : null,
          mappedName: finalTop ? finalTop.name : searchName,
          confidence: finalTop ? Number(finalTop.similarity.toFixed(2)) : 0.0,
          suggestions,
          // ── Double Match fields ──────────────────────────────────────
          usdaFdcId,
          usdaName,
          needsUsdaVerification,
        });

      } catch (err) {
        this.logger.error(`Matching failed for item "${searchName}"`, err);
        normalizedItems.push({
          ...item,
          itemId: null,
          confidence: 0.0,
          suggestions: [],
          usdaFdcId: null,
          usdaName: null,
          needsUsdaVerification: false,
        });
      }
    }

    return normalizedItems;
  }
}
