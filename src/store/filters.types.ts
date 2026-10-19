export type SortOptions = "newest" | "relevance" | "price_asc" | "price_desc";

export interface Filters {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  suitableFor: string[];
  page: number;
  limit: number;
  sortBy: SortOptions;
}
