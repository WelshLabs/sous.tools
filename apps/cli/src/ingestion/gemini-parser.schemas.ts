import { z } from 'zod';

export const baseContentBlock = z.object({
      illustrationIntent: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : 'NONE', z.enum(['GENERATE_FOOD', 'EXTRACT_ORIGINAL_PHOTO', 'NONE'])).catch('NONE')
        .describe("Use GENERATE_FOOD for finished baked goods/dishes. Use EXTRACT_ORIGINAL_PHOTO for physical equipment, reference charts, or hand techniques. Use NONE for pure text or math.")
    });

export const ingredientSchema = z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      bakerPercentage: z.number().optional(),
    });

export const preprocessArray = <T extends z.ZodTypeAny>(schema: T) =>
      z.preprocess((val) => {
        if (val == null) return undefined;

        const arr = Array.isArray(val) ? val : [val];
        const filtered = arr.filter(v => v != null);

        return filtered.length > 0 ? filtered : undefined;        
      }, z.array(schema).optional()).optional();

export const preprocessStringArray = () =>
      z.preprocess((val) => {
        if (val == null) return undefined;
        
        const arr = Array.isArray(val) ? val : [val];
        const filtered = arr.filter(v => v != null && typeof v === 'string' && v.toLowerCase() !== 'none');
        
        return filtered.length > 0 ? filtered : undefined;
      }, z.array(z.string()).optional());

export const contentBlockSchema = z.discriminatedUnion('classification', [
      baseContentBlock.extend({
        classification: z.literal('RECIPE'),
        parentRecipeReference: z.string().optional().describe("If this recipe is a variation of another base recipe on this spread, output the exact recipeName of the base recipe here."),
        recipeName: z.string().optional(),
        recipeContext: z.string().describe("A brief, summarized gist of the author's storytelling or notes regarding this specific dish. Rewrite it entirely in your own words. Do NOT copy verbatim.").optional(),
        ingredients: preprocessArray(ingredientSchema).describe("CRITICAL: You MUST output an array of detailed objects. NEVER output raw strings for ingredients. You must use your spatial reasoning to separate the raw text into distinct name, quantity, and unit fields."),
        objectiveSteps: preprocessArray(z.string()),
        variations: preprocessArray(
          z.object({
            name: z.string(),
            substitution: z.string(),
            ingredients: preprocessArray(ingredientSchema).describe("CRITICAL: You MUST output an array of detailed objects. NEVER output raw strings for ingredients. You must use your spatial reasoning to separate the raw text into distinct name, quantity, and unit fields."),
          })
        ),
        subRecipes: preprocessArray(z.string()),
        instructionalDescriptions: preprocessStringArray(),
      }),
      baseContentBlock.extend({
        classification: z.literal('TECHNIQUE_OR_METHOD'),
        techniqueName: z.string().optional(),
        objectiveSteps: preprocessArray(z.string()),
        instructionalDescriptions: preprocessStringArray(),
      }),
      baseContentBlock.extend({
        classification: z.literal('ENCYCLOPEDIA'),
        encyclopediaSummary: z.string().describe("CRITICAL: If you classify a block as ENCYCLOPEDIA, you MUST provide this summary. Do not leave it blank. A paraphrased, objective gist of the educational text or rules (e.g., food safety protocols). Extract the core culinary facts, but strictly rewrite them in your own words. Do NOT copy the author's original prose verbatim to avoid copyright.").optional(),
        instructionalDescriptions: preprocessStringArray(),
      }),
      baseContentBlock.extend({
        classification: z.literal('MATH_FORMULA'),
        formulaName: z.string().optional(),
        formulaDetails: z.string().describe("CRITICAL: If you classify a block as MATH_FORMULA, you MUST extract the actual math logic into this field. Do not leave it blank. ").optional(),
        instructionalDescriptions: preprocessStringArray(),
      }),
      baseContentBlock.extend({
        classification: z.literal('INGREDIENT_CONVERSION'),
        conversionDetails: z.string().optional(),
        sourceIngredient: z.string().optional(),
        targetIngredient: z.string().optional(),
        conversionMultiplier: z.number().optional(),
        instructionalDescriptions: preprocessStringArray(),
      }),
      baseContentBlock.extend({
        classification: z.literal('REFERENCE_TABLE'),
        tableName: z.string().optional(),
        tableData: z.any().optional(),
        instructionalDescriptions: preprocessStringArray(),
      }),
      baseContentBlock.extend({
        classification: z.literal('FLAVOR_PAIRING'),
        baseIngredient: z.string(),
        pairings: z.array(z.string()),
        affinities: z.array(z.string()).optional(),
        season: z.string().optional(),
        weight: z.string().optional(),
        volume: z.string().optional(),
      }),
    ]);

export const geminiParserSchema = z.object({
      bookTitle: z.string().describe("The title of the book, extracted from the page headers.").optional(),
      pageNumbers: z.string().describe("The page numbers visible on the spread (e.g., '22-23').").optional(),
      contentBlocks: z.array(contentBlockSchema),
    });

