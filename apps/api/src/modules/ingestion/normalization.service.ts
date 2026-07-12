import { Injectable, Logger } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { config } from "@soustools/config";
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class NormalizationService {
  private readonly logger = new Logger(NormalizationService.name);
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

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
   * Automatically populates any missing embeddings for the global master_ingredients table.
   * This is a self-healing process to keep pgvector indices up-to-date.
   */
  async ensureMasterEmbeddings(): Promise<void> {
    try {
      const { data: list, error } = await supabase
        .from("master_ingredients")
        .select("id, name, embedding");

      if (error) {
        this.logger.error("Failed to fetch master ingredients for embedding check", error);
        return;
      }
      if (!list) return;

      for (const item of list) {
        if (!item.embedding) {
          try {
            this.logger.log(`Generating embedding for master ingredient "${item.name}"`);
            const embedding = await this.getEmbedding(item.name);
            const { error: updateErr } = await supabase
              .from("master_ingredients")
              .update({ embedding: embedding as any })
              .eq("id", item.id);

            if (updateErr) {
              this.logger.error(`Failed to save embedding for master ingredient "${item.name}"`, updateErr);
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
    items: Array<{ rawName?: string; baseIngredient?: string; [key: string]: any }>
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
        .select("vendor_item_string, master_ingredient_id")
        .eq("organization_id", organizationId)
        .eq("vendor_id", vendorId);
      if (!error && data) {
        aliases = data;
      }
    }

    const normalizedItems = [];

    for (const item of items) {
      const rawName = (item.rawName || item.baseIngredient || "").trim();
      if (!rawName) {
        normalizedItems.push(item);
        continue;
      }

      // Step A: Exact alias match check
      const aliasMatch = aliases.find(
        (a) => a.vendor_item_string.toLowerCase() === rawName.toLowerCase()
      );

      if (aliasMatch) {
        // Fetch internal mapped name
        const { data: masterItem } = await supabase
          .from("items")
          .select("name")
          .eq("id", aliasMatch.master_ingredient_id)
          .single();

        normalizedItems.push({
          ...item,
          itemId: aliasMatch.master_ingredient_id,
          mappedName: masterItem?.name || rawName,
          confidence: 1.0,
        });
        continue;
      }

      // Step B: Fuzzy / pgvector semantic match search
      try {
        const queryEmbedding = await this.getEmbedding(rawName);
        
        // Invoke pgvector similarity RPC
        const { data: matches, error: matchesErr } = await supabase.rpc("match_items", {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: 0.3,
          match_count: 3,
          org_id: organizationId,
        });

        let matched = false;

        if (!matchesErr && matches && matches.length > 0) {
          const topMatch = matches[0];
          const secondMatch = matches[1];

          // Criteria for strong clear match:
          // Top similarity is high (>= 0.85) AND either there is no second match or the gap is significant (>= 0.15)
          const isClearMatch =
            topMatch.similarity >= 0.85 &&
            (!secondMatch || (topMatch.similarity - secondMatch.similarity) >= 0.15);

          if (isClearMatch) {
            normalizedItems.push({
              ...item,
              itemId: topMatch.id,
              mappedName: topMatch.name,
              confidence: Number(topMatch.similarity.toFixed(2)),
            });
            matched = true;
          } else {
            // If highly ambiguous, use Gemini Flash to tie-break among the candidates
            this.logger.log(`Ambiguous matches for "${rawName}". Invoking Gemini Flash tie-breaker.`);
            const geminiMatch = await this.tieBreakWithGemini(rawName, matches);

            if (geminiMatch && geminiMatch.itemId) {
              const matchedCandidate = matches.find((m: any) => m.id === geminiMatch.itemId);
              normalizedItems.push({
                ...item,
                itemId: geminiMatch.itemId,
                mappedName: matchedCandidate ? matchedCandidate.name : rawName,
                confidence: geminiMatch.confidence,
              });
              matched = true;
            }
          }
        }

        if (matched) {
          continue;
        }

        // Tier 3: If no matches in tenant items, fallback to global master_ingredients table via match_master_ingredients
        this.logger.log(`No matches for "${rawName}" in tenant items. Falling back to global USDA/Escoffier tier...`);
        const { data: globalMatches, error: globalMatchesErr } = await supabase.rpc("match_master_ingredients", {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_threshold: 0.3,
          match_count: 3,
        });

        if (!globalMatchesErr && globalMatches && globalMatches.length > 0) {
          const topGlobalMatch = globalMatches[0];
          // Since it matched the global tier, let's copy/lazy-load this item into the tenant's items table.
          const { data: globalIng } = await supabase
            .from("master_ingredients")
            .select("*")
            .eq("id", topGlobalMatch.id)
            .single();

          if (globalIng) {
            this.logger.log(`Lazy-loading global master ingredient "${globalIng.name}" into tenant items for organization "${organizationId}"`);
            const { data: newItem, error: insertErr } = await supabase
              .from("items")
              .insert({
                organization_id: organizationId,
                name: globalIng.name,
                category: "ingredient",
                purchase_unit: "UNIT",
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
              normalizedItems.push({
                ...item,
                itemId: newItem.id,
                mappedName: newItem.name,
                confidence: Number(topGlobalMatch.similarity.toFixed(2)),
              });
              continue;
            } else {
              this.logger.error(`Failed to insert lazy-loaded item: ${insertErr?.message}`);
            }
          }
        }

        // If completely unmatched, return null/0.0 confidence
        normalizedItems.push({
          ...item,
          itemId: null,
          confidence: 0.0,
        });

      } catch (err) {
        this.logger.error(`Fuzzy match failed for item "${rawName}"`, err);
        normalizedItems.push({
          ...item,
          itemId: null,
          confidence: 0.0,
        });
      }
    }

    return normalizedItems;
  }

  /**
   * Uses Gemini Flash to tie-break ambiguous vector search matches.
   */
  private async tieBreakWithGemini(
    rawName: string,
    candidates: Array<{ id: string; name: string; similarity: number }>
  ): Promise<{ itemId: string | null; confidence: number } | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are a back-office culinary matching assistant. 
We have a raw vendor item string: "${rawName}".
We found some possible candidates in our master ingredient catalog, but the match is ambiguous.
Please match the raw item string to the best candidate.

Candidates:
${JSON.stringify(candidates.map((c) => ({ id: c.id, name: c.name })))}

If one of the candidates is a logical match, return its ID and a confidence score between 0.6 and 0.84.
If none of them is a logical or correct match, return null.

Return your response strictly in the following JSON format:
{
  "itemId": "selected-candidate-id-or-null",
  "confidence": 0.75
}
`,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      return {
        itemId: result.itemId || null,
        confidence: typeof result.confidence === "number" ? result.confidence : 0.0,
      };
    } catch (err) {
      this.logger.error("Gemini tie-breaker failed", err);
      return null;
    }
  }
}
