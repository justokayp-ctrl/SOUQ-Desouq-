import { Product } from '../../src/types';

export interface SearchQuery {
  q?: string;
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sellerId?: string;
  madeInDesoqOnly?: boolean;
  isFastDeliveryOnly?: boolean;
  minRating?: number;
  attributes?: Record<string, string | string[]>;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'rating_desc' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
}

export interface FacetCount {
  id: string;
  nameAr: string;
  count: number;
  selected?: boolean;
}

export interface SearchFacets {
  categories: FacetCount[];
  brands: FacetCount[];
  priceRange: {
    min: number;
    max: number;
    selectedMin?: number;
    selectedMax?: number;
  };
  ratings: {
    rating: number; // 4, 3, 2, 1
    count: number;
  }[];
  sellers: FacetCount[];
  desoqLocalCount: number;
  fastDeliveryCount: number;
  inStockCount: number;
}

export interface SearchResult<T = Product> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacets;
  didYouMean?: string;
  query: string;
  executionTimeMs: number;
  appliedFilters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    madeInDesoqOnly?: boolean;
    isFastDeliveryOnly?: boolean;
    minRating?: number;
    sellerId?: string;
    brand?: string | string[];
    sortBy?: string;
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'seller' | 'tag' | 'local_specialty' | 'keyword';
  category?: string;
  categoryAr?: string;
  count?: number;
  badgeAr?: string;
  id?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  isDesoqLocalMade?: boolean;
  isFeatured?: boolean;
}

export interface SearchProductDocument {
  productId: string;
  titleAr: string;
  normalizedTitle: string;
  titleEn: string;
  descriptionAr: string;
  normalizedDescription: string;
  category: string;
  categoryNameAr: string;
  sellerId: string;
  sellerName: string;
  sellerCity: string;
  sellerIsVerified: boolean;
  isDesoqLocalMade: boolean;
  isFastDesoqDelivery: boolean;
  brand?: string;
  priceEGP: number;
  originalPriceEGP?: number;
  stock: number;
  isInStock: boolean;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  status: string;
  tags: string[];
  attributes: Record<string, any>;
  keywordsText: string;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISearchAdapter {
  name: string;
  search(query: SearchQuery): Promise<SearchResult<Product>>;
  suggest(term: string, limit?: number): Promise<SearchSuggestion[]>;
  indexProduct(document: SearchProductDocument): Promise<void>;
  removeProduct(productId: string): Promise<void>;
  bulkIndex(documents: SearchProductDocument[]): Promise<number>;
  getPopularSearches(): Promise<string[]>;
}
