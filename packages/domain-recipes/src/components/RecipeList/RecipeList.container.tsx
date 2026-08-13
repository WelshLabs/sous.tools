import {
  type Recipe,
  type RecipeCategory,
  type RecipeTag,
} from "@soustools/api-types";
import { RecipeListView } from "./RecipeList.view";

export interface RecipeListProps {
  recipes: Recipe[];
  loading?: boolean;
  onDelete: (id: string) => void;
  categories?: RecipeCategory[];
  tags?: RecipeTag[];
  selectedCategory?: string | null;
  onSelectCategory?: (id: string | null) => void;
  selectedTag?: string | null;
  onSelectTag?: (id: string | null) => void;
  selectedStatus?: string;
  onSelectStatus?: (
    status: "ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED",
  ) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  showFilter?: boolean;
}

/**
 * RecipeList Container
 */
export const RecipeList = (props: RecipeListProps) => {
  return <RecipeListView {...props} />;
};
