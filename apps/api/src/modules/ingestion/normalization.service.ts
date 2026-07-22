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
   * Normalizes raw item names by querying vendor_item_aliases and pgvector,
   * falling back to Gemini Flash tie-breaker if pgvector results are ambiguous.
   */
  async normalizeInvoiceItems(
    organizationId: string,
    vendorName: string | null | undefined,
    items: Array<{ rawName?: string; suggestedInternalName?: string; category?: string; amount?: number; unit?: string; price?: number; [key: string]: any }>,
    isInvoice?: boolean
  ): Promise<any[]> {
    await this.ensureEmbeddings(organizationId);

    // 1. Resolve vendorId if vendor exists
    let vendorId: string | null = null;
    if (vendorName) {
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("organization_id", organizationId)
        .ilike("name", vendorName)
        .maybeSingle();
      if (vendor) {
        vendorId = vendor.id;
      }
    }

    // 2. Fetch existing aliases for exact string matching
    let aliases: any[] = [];
    if (vendorId) {
      const { data, error } = await supabase
        .from("vendor_item_aliases")
        .select("vendor_item_string, item_id")
        .eq("organization_id", organizationId)
        .eq("vendor_id", vendorId);
      if (!error && data) {
        aliases = data;
      }
    }

    const normalizedItems = [];

    for (const item of items) {
      const rawName = (item.rawName || item.baseIngredient || "").trim();
      const suggestedInternalName = (item.suggestedInternalName || "").trim();
      const category = (item.category || "INGREDIENT").toUpperCase();

      const searchName = suggestedInternalName || rawName;

      if (!rawName && !suggestedInternalName) {
        normalizedItems.push(item);
        continue;
      }

      try {
        const suggestions: Array<{ itemId: string; name: string; similarity: number; matchColor: "green" | "yellow" | "orange" }> = [];

        // Step A: Exact alias match check
        const aliasMatch = aliases.find(
          (a) => a.vendor_item_string.toLowerCase() === rawName.toLowerCase()
        );

        if (aliasMatch) {
          const { data: masterItem } = await supabase
            .from("items")
            .select("name")
            .eq("id", aliasMatch.item_id)
            .single();

          if (masterItem) {
            suggestions.push({
              itemId: aliasMatch.item_id,
              name: masterItem.name,
              similarity: 1.0,
              matchColor: "green"
            });
          }
        }

        // Generate embedding
        let queryEmbedding: number[] | null = null;
        if (suggestions.length === 0 || !isInvoice) {
          try {
            queryEmbedding = await this.getEmbedding(searchName);
          } catch (err) {
            this.logger.warn(`Failed to generate embedding for "${searchName}"`, err);
          }
        }

        // Step B: match_items (Tenant DB)
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
                matchColor: similarity > 0.95 ? "green" : similarity > 0.75 ? "yellow" : "orange"
              });
            }
          }
        }

        // Step C: If category is INGREDIENT and no high-confidence match in Tenant DB, call match_master_items
        const hasHighConfidenceTenant = suggestions.some(s => s.similarity >= 0.85);

        if (queryEmbedding && category === "INGREDIENT" && !hasHighConfidenceTenant) {
          const { data: globalMatches, error: globalErr } = await supabase.rpc("match_master_items", {
            query_embedding: `[${queryEmbedding.join(",")}]`,
            match_threshold: 0.5,
            match_count: 5,
          });

          if (!globalErr && globalMatches && globalMatches.length > 0) {
            const topGlobalMatch = globalMatches[0];
            const isHighConfidence = topGlobalMatch.similarity >= 0.85;

            if (isHighConfidence) {
              const { data: globalIng } = await supabase
                .from("master_items")
                .select("*")
                .eq("id", topGlobalMatch.id)
                .single();

              if (globalIng) {
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
                    fdc_id: globalIng.fdc_id,
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
                    matchColor: similarity > 0.95 ? "green" : similarity > 0.75 ? "yellow" : "orange"
                  });
                } else {
                  this.logger.error(`Failed to insert lazy-loaded item: ${insertErr?.message}`);
                }
              }
            } else {
              for (const match of globalMatches) {
                const similarity = Number(match.similarity);
                if (!suggestions.some(s => s.itemId === match.id)) {
                  suggestions.push({
                    itemId: match.id,
                    name: match.name,
                    similarity,
                    matchColor: similarity > 0.95 ? "green" : similarity > 0.75 ? "yellow" : "orange"
                  });
                }
              }
            }
          }
        }

        // Step D: Call UsdaResolverService if category is INGREDIENT and still no high confidence suggestions
        const hasHighConfidence = suggestions.some(s => s.similarity >= 0.85);

        if (category === "INGREDIENT" && !hasHighConfidence) {
          this.logger.log(`No high-confidence matches for "${searchName}". Querying USDA resolver fallback...`);
          const usdaMatch = await this.usdaResolver.resolveIngredient(searchName);
          if (usdaMatch) {
            this.logger.log(`Found USDA match: "${usdaMatch.fdc_food_name}" (FDC ID: ${usdaMatch.fdc_id}). Caching to master_items and lazy-loading to tenant...`);

            let usdaEmbedding: number[] | null = null;
            if (queryEmbedding) {
              usdaEmbedding = queryEmbedding;
            } else {
              try {
                usdaEmbedding = await this.getEmbedding(usdaMatch.fdc_food_name || searchName);
              } catch (embedErr) {
                this.logger.warn(`Failed to generate embedding for USDA item`, embedErr);
              }
            }

            const globalOrgId = "d0000000-0000-0000-0000-000000000000";
            const { data: newGlobalIng, error: globalErr } = await supabase
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

            if (!globalErr && newGlobalIng) {
              const { data: newItem, error: insertErr } = await supabase
                .from("items")
                .insert({
                  organization_id: organizationId,
                  name: newGlobalIng.name,
                  category: "INGREDIENT",
                  purchase_unit: "EACH",
                  units_per_case: 1,
                  each_weight_g: null,
                  density_g_ml: newGlobalIng.density_g_ml,
                  is_animal_product: newGlobalIng.is_animal_product,
                  is_meat: newGlobalIng.is_meat,
                  is_seafood: newGlobalIng.is_seafood,
                  is_dairy: newGlobalIng.is_dairy,
                  is_egg: newGlobalIng.is_egg,
                  is_gluten_source: newGlobalIng.is_gluten_source,
                  allergens: Array.isArray(newGlobalIng.allergens) ? newGlobalIng.allergens : [],
                  fdc_id: newGlobalIng.fdc_id,
                  nutrition_macros: newGlobalIng.nutrition_macros,
                  embedding: newGlobalIng.embedding,
                })
                .select()
                .single();

              if (!insertErr && newItem) {
                suggestions.unshift({
                  itemId: newItem.id,
                  name: newItem.name,
                  similarity: 0.85,
                  matchColor: "yellow"
                });
              }
            } else {
              this.logger.error(`Failed to cache USDA match: ${globalErr?.message}`);
            }
          }
        }

        // Sort suggestions descending by similarity
        suggestions.sort((a, b) => b.similarity - a.similarity);

        // Find top suggestion for backward compatibility
        const topSuggestion = suggestions[0];

        normalizedItems.push({
          ...item,
          itemId: topSuggestion ? topSuggestion.itemId : null,
          mappedName: topSuggestion ? topSuggestion.name : searchName,
          confidence: topSuggestion ? Number(topSuggestion.similarity.toFixed(2)) : 0.0,
          suggestions
        });

      } catch (err) {
        this.logger.error(`Matching failed for item "${searchName}"`, err);
        normalizedItems.push({
          ...item,
          itemId: null,
          confidence: 0.0,
          suggestions: []
        });
      }
    }

    return normalizedItems;
  }
}
