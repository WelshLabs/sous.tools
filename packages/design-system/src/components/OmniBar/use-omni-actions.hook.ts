"use client";

import { useOmnibarContext } from "./OmniBarContext";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import { type RecipeExtractionDTO } from "@soustools/api-types";

export function useOmniActions() {
  const { chatHistory, setChatHistory, contextPayload } = useOmnibarContext();
  const organizationId =
    (contextPayload?.organizationId as string) ||
    "d0000000-0000-0000-0000-000000000000";

  const handleConfirmAlias = async (rawName: string, itemId: string) => {
    try {
      const { error } = await (api.POST as any)("/ingestion/alias", {
        body: {
          organizationId,
          vendorName: "Internal Ingredients",
          vendorItemString: rawName,
          masterIngredientId: itemId,
        },
      });
      if (error) throw new Error("Failed to save alias mapping");
      toast.success(`Saved alias mapping for "${rawName}"`);
    } catch (err) {
      toast.error("Failed to save alias mapping");
      console.error(err);
    }
  };

  const handleUpdateIngredient = (
    msgIndex: number,
    ingIndex: number,
    updates: Record<string, unknown>,
  ) => {
    const updatedHistory = [...chatHistory];
    const msg = { ...updatedHistory[msgIndex] };
    if (msg.recipeData) {
      const recipe = { ...msg.recipeData };
      const ingredients = [...(recipe.ingredients || [])];
      ingredients[ingIndex] = { ...ingredients[ingIndex], ...updates };
      recipe.ingredients = ingredients;
      msg.recipeData = recipe;
      updatedHistory[msgIndex] = msg;
      setChatHistory(updatedHistory);
    }
  };

  const handleUpdateInvoiceItem = (
    msgIndex: number,
    itemIndex: number,
    updates: Record<string, unknown>,
  ) => {
    const updatedHistory = [...chatHistory];
    const msg = { ...updatedHistory[msgIndex] };
    if (msg.invoiceData) {
      const invoice = { ...msg.invoiceData };
      const items = [...(invoice.items || [])];
      items[itemIndex] = { ...items[itemIndex], ...updates };
      invoice.items = items;
      msg.invoiceData = invoice;
      updatedHistory[msgIndex] = msg;
      setChatHistory(updatedHistory);
    }
  };

  const handleSaveInvoice = async (invoice: {
    vendorName: string;
    invoiceNumber?: string;
    items: Array<{
      rawName: string;
      itemId?: string | null;
      quantity?: number;
      pricePerUnit?: number;
      each_weight_g?: number | null;
    }>;
  }) => {
    try {
      const { error } = await (api.POST as any)("/ingestion/invoice/commit", {
        body: {
          organizationId,
          invoice: {
            vendorName: invoice.vendorName || "Unknown Vendor",
            invoiceNumber: invoice.invoiceNumber || "",
            items: invoice.items.map((item) => ({
              rawName: item.rawName,
              itemId: item.itemId,
              quantity: item.quantity || 1,
              pricePerUnit: item.pricePerUnit || 0,
              each_weight_g: item.each_weight_g || null,
            })),
          },
        },
      });

      if (error) {
        throw new Error(String(error));
      }

      toast.success("Invoice confirmed and committed successfully!");
      const updatedHistory = chatHistory.filter(
        (m) => m.invoiceData !== invoice,
      );

      updatedHistory.push({
        id: crypto.randomUUID(),
        role: "model",
        content: `Invoice successfully processed and stock received!`,
        timestamp: new Date(),
      });

      setChatHistory(updatedHistory);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to commit invoice: ${msg}`);
      console.error(err);
    }
  };

  const handleSaveRecipe = async (recipe: RecipeExtractionDTO) => {
    try {
      const { data, error } = await api.POST("/recipes", {
        body: {
          recipe: {
            title: recipe.recipeName || "Untitled Recipe",
            yieldCount: recipe.yieldAmount || 1,
            yieldUnit: recipe.yieldUnit || "pieces",
            instructions: recipe.instructions.map((text, idx) => ({
              text,
              stepNumber: idx + 1,
              timerDurationSeconds: null,
            })),
            status: "APPROVED",
          },
          recipeIngredients: recipe.ingredients.map((ing) => ({
            masterIngredientId: ing.itemId as string,
            calculationType: "fixed_weight",
            baseCalculationGroup: false,
            amount: ing.quantity || 1,
            unit: ing.unit || "EACH",
            rawName: ing.rawString,
            prepNotes: ing.preparationNote || null,
          })),
        },
      });

      if (error) {
        throw new Error(String(error));
      }

      toast.success("Recipe confirmed and saved successfully!");
      const updatedHistory = chatHistory.filter((m) => m.recipeData !== recipe);

      const recipeId = (data?.data as { id?: string })?.id;
      if (recipeId) {
        updatedHistory.push({
          id: crypto.randomUUID(),
          role: "model",
          content: `Recipe successfully saved! [View Recipe](/recipes/${recipeId})`,
          timestamp: new Date(),
        });
      }

      setChatHistory(updatedHistory);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save recipe: ${msg}`);
      console.error(err);
    }
  };

  return {
    organizationId,
    handleConfirmAlias,
    handleUpdateIngredient,
    handleUpdateInvoiceItem,
    handleSaveInvoice,
    handleSaveRecipe,
  };
}
