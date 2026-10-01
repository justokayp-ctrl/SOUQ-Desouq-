import { 
  ISearchAdapter, 
  SearchQuery, 
  SearchResult, 
  SearchSuggestion, 
  SearchProductDocument 
} from './types';
import { SqliteSearchAdapter } from './sqliteSearchAdapter';
import { ArabicNormalizer } from './arabicNormalizer';
import { Product, Seller } from '../../src/types';
import { db } from '../db';
import { CATEGORIES } from '../../src/data/mockData';

export class SearchService {
  private adapter: ISearchAdapter;
  private queryCache: Map<string, { result: SearchResult<Product>; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 15000; // 15s caching for high-speed repeated queries

  constructor(adapter?: ISearchAdapter) {
    this.adapter = adapter || new SqliteSearchAdapter();
  }

  /**
   * Set or swap search adapter at runtime (e.g. Elasticsearch, Meilisearch, Algolia)
   */
  public setAdapter(adapter: ISearchAdapter): void {
    this.adapter = adapter;
    this.clearCache();
  }

  public getAdapterName(): string {
    return this.adapter.name;
  }

  /**
   * Main Search Endpoint logic with caching
   */
  public async search(query: SearchQuery): Promise<SearchResult<Product>> {
    const cacheKey = JSON.stringify(query);
    const cached = this.queryCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL_MS) {
      return {
        ...cached.result,
        executionTimeMs: 1, // cache hit
      };
    }

    const result = await this.adapter.search(query);
    this.queryCache.set(cacheKey, { result, timestamp: Date.now() });

    // Limit cache size to prevent memory bloat
    if (this.queryCache.size > 200) {
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) this.queryCache.delete(oldestKey);
    }

    return result;
  }

  /**
   * Autocomplete Suggestions
   */
  public async suggest(term: string, limit: number = 8): Promise<SearchSuggestion[]> {
    return this.adapter.suggest(term, limit);
  }

  /**
   * Popular Search Queries
   */
  public async getPopularSearches(): Promise<string[]> {
    return this.adapter.getPopularSearches();
  }

  /**
   * Sync a product to the search index
   */
  public async indexProduct(product: Product, seller?: Seller): Promise<void> {
    const targetSeller = seller || db.getSellerById(product.sellerId);
    const categoryObj = CATEGORIES.find(c => c.id === product.category);
    const categoryNameAr = categoryObj ? categoryObj.nameAr : product.category;

    const doc = this.buildSearchDocument(product, targetSeller, categoryNameAr);
    await this.adapter.indexProduct(doc);
    this.clearCache();
  }

  /**
   * Remove a product from search index
   */
  public async removeProduct(productId: string): Promise<void> {
    await this.adapter.removeProduct(productId);
    this.clearCache();
  }

  /**
   * Bulk re-index the entire product catalog from the database
   */
  public async reindexAll(): Promise<{ indexedCount: number; durationMs: number }> {
    const start = Date.now();
    const products = db.getProducts();
    const sellers = db.getSellers();
    const sellerMap = new Map(sellers.map(s => [s.id, s]));

    const documents: SearchProductDocument[] = products.map(p => {
      const seller = sellerMap.get(p.sellerId);
      const categoryObj = CATEGORIES.find(c => c.id === p.category);
      const categoryNameAr = categoryObj ? categoryObj.nameAr : p.category;
      return this.buildSearchDocument(p, seller, categoryNameAr);
    });

    const indexedCount = await this.adapter.bulkIndex(documents);
    this.clearCache();

    return {
      indexedCount,
      durationMs: Date.now() - start
    };
  }

  /**
   * Transform domain Product into normalized SearchProductDocument
   */
  private buildSearchDocument(product: Product, seller?: Seller, categoryNameAr?: string): SearchProductDocument {
    const normTitle = ArabicNormalizer.normalize(product.titleAr);
    const normDesc = ArabicNormalizer.normalize(product.descriptionAr);
    const sellerName = seller?.name || 'تاجر دسوق';
    const sellerCity = seller?.city || 'دسوق';
    const sellerIsVerified = seller ? seller.verificationStatus === 'verified' : false;

    // Collect tags from attributes
    const tags: string[] = [];
    if (product.isDesoqLocalMade) tags.push('منتج مميز', 'جودة عالية', 'أصلي');
    if (product.isFastDesoqDelivery) tags.push('توصيل سريع', '24 ساعة');
    if (product.attributes) {
      for (const val of Object.values(product.attributes)) {
        if (typeof val === 'string') tags.push(val);
      }
    }

    // Normalized searchable text blob
    const keywordsParts = [
      normTitle,
      product.titleEn || '',
      normDesc,
      categoryNameAr || '',
      sellerName,
      sellerCity,
      ...tags
    ];
    const keywordsText = ArabicNormalizer.normalize(keywordsParts.join(' '));

    // Popularity score calculation
    let popularity = (product.rating * 10) + (product.reviewCount * 2);
    if (product.isFeatured) popularity += 25;
    if (product.isDesoqLocalMade) popularity += 20;
    if (product.stock > 0) popularity += 10;

    return {
      productId: product.id,
      titleAr: product.titleAr,
      normalizedTitle: normTitle,
      titleEn: product.titleEn || product.titleAr,
      descriptionAr: product.descriptionAr,
      normalizedDescription: normDesc,
      category: product.category,
      categoryNameAr: categoryNameAr || product.category,
      sellerId: product.sellerId,
      sellerName,
      sellerCity,
      sellerIsVerified,
      isDesoqLocalMade: Boolean(product.isDesoqLocalMade),
      isFastDesoqDelivery: Boolean(product.isFastDesoqDelivery),
      brand: (product.attributes as any)?.brand || (product.attributes as any)?.الماركة || sellerName,
      priceEGP: product.priceEGP,
      originalPriceEGP: product.originalPriceEGP,
      stock: product.stock,
      isInStock: product.stock > 0,
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      isFeatured: Boolean(product.isFeatured),
      status: product.status || 'active',
      tags,
      attributes: product.attributes || {},
      keywordsText,
      popularityScore: popularity,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public clearCache(): void {
    this.queryCache.clear();
  }
}

export const searchService = new SearchService();
