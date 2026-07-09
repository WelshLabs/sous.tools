import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { type RecipeCategory, type RecipeTag } from "@soustools/api-types";

/**
 * RecipeMetaService manages recipe categories and tags metadata.
 * @tenant-docs-export
 */
@Injectable()
export class RecipeMetaService {
  async findAllCategories(orgId: string): Promise<RecipeCategory[]> {
    const { data, error } = await supabase
      .from("recipe_categories")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => ({
      id: String(row.id),
      organizationId: String(row.organization_id),
      name: String(row.name),
      parentId: row.parent_id ? String(row.parent_id) : null,
      createdAt: String(row.created_at),
    }));
  }

  async findAllTags(orgId: string): Promise<RecipeTag[]> {
    const { data, error } = await supabase
      .from("recipe_tags")
      .select("*")
      .eq("organization_id", orgId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => ({
      id: String(row.id),
      organizationId: String(row.organization_id),
      name: String(row.name),
      createdAt: String(row.created_at),
    }));
  }
}
