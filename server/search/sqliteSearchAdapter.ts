import { getDatabase, runTransaction } from '../database/connection';
import { 
  ISearchAdapter, 
  SearchQuery, 
  SearchResult, 
  SearchSuggestion, 
  SearchProductDocument, 
  SearchFacets 
} from './types';
import { ArabicNormalizer } from './arabicNormalizer';
import { Product } from '../../src/types';
import { db } from '../db';

export class SqliteSearchAdapter implements ISearchAdapter {
  public readonly name = 'SQLite_FTS_MultiFactor_Adapter';

  /**
   * Primary Search Method with Multi-Faceted Filtering & Weighted Ranking
   */
  public async search(query: SearchQuery): Promise<SearchResult<Product>> {
    const startTime = Date.now();
    const database = getDatabase();

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 12));
    const offset = (page - 1) * limit;

    const rawQ = query.q?.trim() || '';
    const { correctedText, isCorrected } = ArabicNormalizer.findTypoCorrection(rawQ);
    const effectiveQuery = isCorrected ? correctedText : rawQ;
    const normalizedQ = ArabicNormalizer.normalize(effectiveQuery);
    const queryTokens = ArabicNormalizer.tokenize(effectiveQuery);

    // Build base WHERE filter conditions
    const whereClauses: string[] = ["status = 'active'"];
    const params: any[] = [];

    // 1. Text search ranking & filtering
    let relevanceExpression = '0';
    if (normalizedQ && queryTokens.length > 0) {
      const tokenConditions: string[] = [];
      const scoreParts: string[] = [];

      // Exact title match bonus
      scoreParts.push(`(CASE WHEN normalized_title = '${normalizedQ.replace(/'/g, "''")}' THEN 100 ELSE 0 END)`);
      scoreParts.push(`(CASE WHEN normalized_title LIKE '${normalizedQ.replace(/'/g, "''")}%' THEN 60 ELSE 0 END)`);

      for (const token of queryTokens) {
        const stems = ArabicNormalizer.getStemsAndVariants(token);
        const tokenLikeClauses: string[] = [];

        for (const stem of stems) {
          const escaped = stem.replace(/'/g, "''");
          tokenLikeClauses.push(`normalized_title LIKE '%${escaped}%'`);
          tokenLikeClauses.push(`normalized_description LIKE '%${escaped}%'`);
          tokenLikeClauses.push(`category_name_ar LIKE '%${escaped}%'`);
          tokenLikeClauses.push(`seller_name LIKE '%${escaped}%'`);
          tokenLikeClauses.push(`keywords_text LIKE '%${escaped}%'`);

          // Title stem match boost
          scoreParts.push(`(CASE WHEN normalized_title LIKE '%${escaped}%' THEN 40 ELSE 0 END)`);
          // Category stem match boost
          scoreParts.push(`(CASE WHEN category_name_ar LIKE '%${escaped}%' THEN 30 ELSE 0 END)`);
          // Keywords match boost
          scoreParts.push(`(CASE WHEN keywords_text LIKE '%${escaped}%' THEN 25 ELSE 0 END)`);
          // Seller name match boost
          scoreParts.push(`(CASE WHEN seller_name LIKE '%${escaped}%' THEN 20 ELSE 0 END)`);
          // Description stem match
          scoreParts.push(`(CASE WHEN normalized_description LIKE '%${escaped}%' THEN 10 ELSE 0 END)`);
        }

        tokenConditions.push(`(${tokenLikeClauses.join(' OR ')})`);
      }

      whereClauses.push(`(${tokenConditions.join(' OR ')})`);

      // Domain authority & locality boosts
      scoreParts.push(`(CASE WHEN is_desoq_local_made = 1 THEN 25 ELSE 0 END)`);
      scoreParts.push(`(CASE WHEN seller_is_verified = 1 THEN 15 ELSE 0 END)`);
      scoreParts.push(`(CASE WHEN is_in_stock = 1 THEN 10 ELSE -20 END)`);
      scoreParts.push(`(rating * 4)`);
      scoreParts.push(`(popularity_score * 0.5)`);

      relevanceExpression = scoreParts.join(' + ');
    } else {
      // Default score when no text query
      relevanceExpression = '(popularity_score + (rating * 5) + (CASE WHEN is_featured = 1 THEN 30 ELSE 0 END) + (CASE WHEN is_desoq_local_made = 1 THEN 15 ELSE 0 END))';
    }

    // 2. Category filter
    if (query.category && query.category !== 'all') {
      whereClauses.push('category = ?');
      params.push(query.category);
    }

    // 3. Brand filter
    if (query.brand) {
      if (Array.isArray(query.brand) && query.brand.length > 0) {
        const placeholders = query.brand.map(() => '?').join(',');
        whereClauses.push(`brand IN (${placeholders})`);
        params.push(...query.brand);
      } else if (typeof query.brand === 'string' && query.brand.trim()) {
        whereClauses.push('brand = ?');
        params.push(query.brand.trim());
      }
    }

    // 4. Price range
    if (typeof query.minPrice === 'number' && query.minPrice >= 0) {
      whereClauses.push('price_egp >= ?');
      params.push(query.minPrice);
    }
    if (typeof query.maxPrice === 'number' && query.maxPrice > 0) {
      whereClauses.push('price_egp <= ?');
      params.push(query.maxPrice);
    }

    // 5. In-stock only
    if (query.inStockOnly) {
      whereClauses.push('is_in_stock = 1');
    }

    // 6. Featured products only
    if (query.madeInDesoqOnly) {
      whereClauses.push('is_desoq_local_made = 1');
    }

    // 7. Fast local delivery
    if (query.isFastDeliveryOnly) {
      whereClauses.push('is_fast_desoq_delivery = 1');
    }

    // 8. Rating filter
    if (typeof query.minRating === 'number' && query.minRating > 0) {
      whereClauses.push('rating >= ?');
      params.push(query.minRating);
    }

    // 9. Seller filter
    if (query.sellerId) {
      whereClauses.push('seller_id = ?');
      params.push(query.sellerId);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Determine Sort Order
    let orderBySql = 'ORDER BY ';
    switch (query.sortBy) {
      case 'price_asc':
        orderBySql += 'price_egp ASC, score DESC';
        break;
      case 'price_desc':
        orderBySql += 'price_egp DESC, score DESC';
        break;
      case 'rating':
      case 'rating_desc':
        orderBySql += 'rating DESC, review_count DESC, score DESC';
        break;
      case 'newest':
        orderBySql += 'created_at DESC, score DESC';
        break;
      case 'popularity':
        orderBySql += 'popularity_score DESC, rating DESC';
        break;
      case 'relevance':
      default:
        orderBySql += 'score DESC, is_featured DESC, created_at DESC';
        break;
    }

    // Main Query
    const searchSql = `
      SELECT product_id as productId, (${relevanceExpression}) as score
      FROM search_product_documents
      ${whereSql}
      ${orderBySql}
      LIMIT ? OFFSET ?
    `;

    const searchParams = [...params, limit, offset];
    const searchRows = database.prepare(searchSql).all(...searchParams) as any[];

    // Count Total Matching Documents
    const countSql = `
      SELECT COUNT(*) as total
      FROM search_product_documents
      ${whereSql}
    `;
    const countRow = database.prepare(countSql).get(...params) as any;
    const total = countRow?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Hydrate Product entities from authoritative store
    const productIds = searchRows.map(r => r.productId);
    const items: Product[] = [];
    for (const pid of productIds) {
      const prod = db.getProductById(pid);
      if (prod) {
        items.push(prod);
      }
    }

    // Calculate Dynamic Search Facets
    const facets = await this.calculateFacets(whereClauses, params, query);

    const executionTimeMs = Date.now() - startTime;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      facets,
      didYouMean: isCorrected ? correctedText : undefined,
      query: rawQ,
      executionTimeMs,
      appliedFilters: {
        category: query.category,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        inStockOnly: query.inStockOnly,
        madeInDesoqOnly: query.madeInDesoqOnly,
        isFastDeliveryOnly: query.isFastDeliveryOnly,
        minRating: query.minRating,
        sellerId: query.sellerId,
        brand: query.brand,
        sortBy: query.sortBy,
      }
    };
  }

  /**
   * Fast Autocomplete & Instant Suggestions
   */
  public async suggest(term: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const raw = term?.trim() || '';
    if (!raw || raw.length < 1) return [];

    const norm = ArabicNormalizer.normalize(raw);
    const database = getDatabase();
    const suggestions: SearchSuggestion[] = [];
    const seenTexts = new Set<string>();

    // 1. Direct & Document Category Match Suggestions (High Priority)
    const catRows = database.prepare(`
      SELECT category, category_name_ar, COUNT(*) as count
      FROM search_product_documents
      WHERE normalized_title LIKE ? OR category_name_ar LIKE ? OR category LIKE ?
      GROUP BY category, category_name_ar
      ORDER BY count DESC
      LIMIT 4
    `).all(`%${norm}%`, `%${norm}%`, `%${norm}%`) as any[];

    for (const c of catRows) {
      if (!seenTexts.has(`cat_${c.category}`)) {
        seenTexts.add(`cat_${c.category}`);
        suggestions.push({
          id: c.category,
          text: c.category_name_ar,
          categoryAr: c.category_name_ar,
          type: 'category',
          count: c.count,
          badgeAr: `${c.count} منتج`,
        });
      }
    }

    // 2. Vocabulary / Local Specialty Suggestions
    const vocabSuggestions = ArabicNormalizer.getPrefixSuggestions(raw, 3);
    for (const v of vocabSuggestions) {
      if (!seenTexts.has(v.text)) {
        seenTexts.add(v.text);
        suggestions.push({
          text: v.text,
          type: v.type as any,
          badgeAr: v.type === 'local_specialty' ? 'تراث دسوقي' : undefined,
        });
      }
    }

    // 3. Popular & Matching Product Suggestions
    const prodRows = database.prepare(`
      SELECT product_id, title_ar, category, category_name_ar, price_egp, original_price_egp, 
             rating, review_count, is_featured, is_desoq_local_made, popularity_score
      FROM search_product_documents
      WHERE normalized_title LIKE ? OR normalized_title LIKE ? OR keywords_text LIKE ?
      ORDER BY popularity_score DESC, rating DESC, review_count DESC
      LIMIT ?
    `).all(`${norm}%`, `%${norm}%`, `%${norm}%`, limit) as any[];

    for (const p of prodRows) {
      if (!seenTexts.has(p.title_ar)) {
        seenTexts.add(p.title_ar);
        const fullProd = db.getProductById(p.product_id);
        suggestions.push({
          id: p.product_id,
          text: p.title_ar,
          type: 'product',
          category: p.category,
          categoryAr: p.category_name_ar,
          badgeAr: `${p.price_egp} ج.م`,
          price: p.price_egp,
          originalPrice: p.original_price_egp || fullProd?.originalPriceEGP,
          image: fullProd?.images?.[0],
          rating: p.rating || fullProd?.rating,
          reviewCount: p.review_count || fullProd?.reviewCount,
          isFeatured: Boolean(p.is_featured || fullProd?.isFeatured),
          isDesoqLocalMade: Boolean(p.is_desoq_local_made || fullProd?.isDesoqLocalMade),
        });
      }
    }

    // 4. Seller Match Suggestions
    const sellerRows = database.prepare(`
      SELECT seller_id, seller_name, seller_is_verified, COUNT(*) as count
      FROM search_product_documents
      WHERE seller_name LIKE ?
      GROUP BY seller_id, seller_name
      ORDER BY seller_is_verified DESC, count DESC
      LIMIT 2
    `).all(`%${raw}%`) as any[];

    for (const s of sellerRows) {
      if (!seenTexts.has(s.seller_name)) {
        seenTexts.add(s.seller_name);
        suggestions.push({
          id: s.seller_id,
          text: s.seller_name,
          type: 'seller',
          count: s.count,
          badgeAr: s.seller_is_verified ? 'تاجر موثق' : 'متجر',
        });
      }
    }

    return suggestions.slice(0, limit);
  }

  /**
   * Dynamic Facets Aggregation
   */
  private async calculateFacets(
    baseWhereClauses: string[], 
    baseParams: any[], 
    query: SearchQuery
  ): Promise<SearchFacets> {
    const database = getDatabase();

    // Category counts
    const catRows = database.prepare(`
      SELECT category as id, category_name_ar as nameAr, COUNT(*) as count
      FROM search_product_documents
      WHERE status = 'active'
      GROUP BY category, category_name_ar
      ORDER BY count DESC
    `).all() as any[];

    const categories = catRows.map(r => ({
      id: r.id,
      nameAr: r.nameAr || r.id,
      count: Number(r.count),
      selected: query.category === r.id,
    }));

    // Brand counts
    const brandRows = database.prepare(`
      SELECT brand as id, brand as nameAr, COUNT(*) as count
      FROM search_product_documents
      WHERE status = 'active' AND brand IS NOT NULL AND brand != ''
      GROUP BY brand
      ORDER BY count DESC
      LIMIT 10
    `).all() as any[];

    const brands = brandRows.map(r => ({
      id: r.id,
      nameAr: r.nameAr,
      count: Number(r.count),
    }));

    // Price Bounds
    const priceRow = database.prepare(`
      SELECT MIN(price_egp) as minPrice, MAX(price_egp) as maxPrice
      FROM search_product_documents
      WHERE status = 'active'
    `).get() as any;

    const minPrice = priceRow?.minPrice ? Math.floor(priceRow.minPrice) : 0;
    const maxPrice = priceRow?.maxPrice ? Math.ceil(priceRow.maxPrice) : 10000;

    // Rating Breakdown
    const ratingRows = database.prepare(`
      SELECT 
        SUM(CASE WHEN rating >= 4.0 THEN 1 ELSE 0 END) as r4,
        SUM(CASE WHEN rating >= 3.0 AND rating < 4.0 THEN 1 ELSE 0 END) as r3,
        SUM(CASE WHEN rating >= 2.0 AND rating < 3.0 THEN 1 ELSE 0 END) as r2,
        SUM(CASE WHEN rating < 2.0 THEN 1 ELSE 0 END) as r1,
        SUM(CASE WHEN is_desoq_local_made = 1 THEN 1 ELSE 0 END) as desoqCount,
        SUM(CASE WHEN is_fast_desoq_delivery = 1 THEN 1 ELSE 0 END) as fastCount,
        SUM(CASE WHEN is_in_stock = 1 THEN 1 ELSE 0 END) as inStockCount
      FROM search_product_documents
      WHERE status = 'active'
    `).get() as any;

    // Top Sellers
    const sellerRows = database.prepare(`
      SELECT seller_id as id, seller_name as nameAr, COUNT(*) as count
      FROM search_product_documents
      WHERE status = 'active'
      GROUP BY seller_id, seller_name
      ORDER BY count DESC
      LIMIT 8
    `).all() as any[];

    return {
      categories,
      brands,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        selectedMin: query.minPrice,
        selectedMax: query.maxPrice,
      },
      ratings: [
        { rating: 4, count: ratingRows?.r4 || 0 },
        { rating: 3, count: ratingRows?.r3 || 0 },
        { rating: 2, count: ratingRows?.r2 || 0 },
        { rating: 1, count: ratingRows?.r1 || 0 },
      ],
      sellers: sellerRows.map(r => ({
        id: r.id,
        nameAr: r.nameAr,
        count: Number(r.count),
      })),
      desoqLocalCount: ratingRows?.desoqCount || 0,
      fastDeliveryCount: ratingRows?.fastCount || 0,
      inStockCount: ratingRows?.inStockCount || 0,
    };
  }

  /**
   * Upsert a search document for a product
   */
  public async indexProduct(doc: SearchProductDocument): Promise<void> {
    const database = getDatabase();
    database.prepare(`
      INSERT OR REPLACE INTO search_product_documents (
        product_id, title_ar, normalized_title, title_en, description_ar,
        normalized_description, category, category_name_ar, seller_id, seller_name,
        seller_city, seller_is_verified, is_desoq_local_made, is_fast_desoq_delivery,
        brand, price_egp, original_price_egp, stock, is_in_stock, rating,
        review_count, is_featured, status, tags_json, attributes_json,
        keywords_text, popularity_score, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      doc.productId,
      doc.titleAr,
      doc.normalizedTitle,
      doc.titleEn,
      doc.descriptionAr,
      doc.normalizedDescription,
      doc.category,
      doc.categoryNameAr,
      doc.sellerId,
      doc.sellerName,
      doc.sellerCity,
      doc.sellerIsVerified ? 1 : 0,
      doc.isDesoqLocalMade ? 1 : 0,
      doc.isFastDesoqDelivery ? 1 : 0,
      doc.brand || null,
      doc.priceEGP,
      doc.originalPriceEGP || null,
      doc.stock,
      doc.isInStock ? 1 : 0,
      doc.rating,
      doc.reviewCount,
      doc.isFeatured ? 1 : 0,
      doc.status,
      JSON.stringify(doc.tags || []),
      JSON.stringify(doc.attributes || {}),
      doc.keywordsText,
      doc.popularityScore,
      doc.createdAt,
      doc.updatedAt
    );
  }

  /**
   * Remove a product from search index
   */
  public async removeProduct(productId: string): Promise<void> {
    const database = getDatabase();
    database.prepare('DELETE FROM search_product_documents WHERE product_id = ?').run(productId);
  }

  /**
   * Bulk Index documents inside an atomic SQLite transaction
   */
  public async bulkIndex(documents: SearchProductDocument[]): Promise<number> {
    return runTransaction(tx => {
      const stmt = tx.prepare(`
        INSERT OR REPLACE INTO search_product_documents (
          product_id, title_ar, normalized_title, title_en, description_ar,
          normalized_description, category, category_name_ar, seller_id, seller_name,
          seller_city, seller_is_verified, is_desoq_local_made, is_fast_desoq_delivery,
          brand, price_egp, original_price_egp, stock, is_in_stock, rating,
          review_count, is_featured, status, tags_json, attributes_json,
          keywords_text, popularity_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const doc of documents) {
        stmt.run(
          doc.productId,
          doc.titleAr,
          doc.normalizedTitle,
          doc.titleEn,
          doc.descriptionAr,
          doc.normalizedDescription,
          doc.category,
          doc.categoryNameAr,
          doc.sellerId,
          doc.sellerName,
          doc.sellerCity,
          doc.sellerIsVerified ? 1 : 0,
          doc.isDesoqLocalMade ? 1 : 0,
          doc.isFastDesoqDelivery ? 1 : 0,
          doc.brand || null,
          doc.priceEGP,
          doc.originalPriceEGP || null,
          doc.stock,
          doc.isInStock ? 1 : 0,
          doc.rating,
          doc.reviewCount,
          doc.isFeatured ? 1 : 0,
          doc.status,
          JSON.stringify(doc.tags || []),
          JSON.stringify(doc.attributes || {}),
          doc.keywordsText,
          doc.popularityScore,
          doc.createdAt,
          doc.updatedAt
        );
      }

      return documents.length;
    });
  }

  /**
   * Returns curated popular search queries for Desoq Fashion & Lifestyle Marketplace
   */
  public async getPopularSearches(): Promise<string[]> {
    return [
      'فستان سواريه تركي مطرز',
      'عطر مسك الختام والعود الملكي',
      'حقيبة يد جلد طبيعي هاندميد',
      'حذاء كلاسيك جلد إيطالي',
      'بدلة رجالي فورمال كاملة',
      'طقم فضة استرليني 925 تركي',
      'عباية استقبال خليجي فاخرة',
      'ساعة يد أوتوماتيك أصلية',
      'ملابس أطفال قطن مصري',
      'نظارة شمسية كلاسيك بولارايزد',
    ];
  }
}
