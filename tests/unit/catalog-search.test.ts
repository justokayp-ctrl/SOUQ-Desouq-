import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { searchService } from '../../server/search';
import { CATEGORIES } from '../../src/data/mockData';

export async function runCatalogSearchTests(runner: TestRunner): Promise<void> {
  runner.describe('Catalog & Multi-Factor Search Engine', () => {

    runner.test('Database catalog loads initial seed products', () => {
      const products = db.getProducts();
      runner.assertGte(products.length, 6, 'Seed products should be available');
    });

    runner.test('Category taxonomy metadata lists marketplace categories', () => {
      runner.assertGte(CATEGORIES.length, 3, 'Categories should exist in mockData');
      const fashionCat = CATEGORIES.find(c => c.id === 'men_fashion');
      runner.assert(!!fashionCat, 'Men fashion category should exist');
    });

    runner.test('Category filter isolates products by taxonomy', () => {
      const fashionCatProducts = db.getProducts({ category: 'men_fashion' });
      runner.assertGte(fashionCatProducts.length, 1, 'Men fashion category products should exist');
      for (const p of fashionCatProducts) {
        runner.assertEquals(p.category, 'men_fashion', 'Filtered product category must be men_fashion');
      }
    });

    runner.test('Local Desoq specialty products flag filter', () => {
      const localProds = db.getProducts({ isDesoqLocal: true });
      runner.assertGte(localProds.length, 1, 'Local specialty products should exist');
      for (const p of localProds) {
        runner.assertEquals(p.isDesoqLocalMade, true, 'Product must be flagged as local Desoq made');
      }
    });

    runner.test('Search service indexes catalog products and executes search queries', async () => {
      // Execute full reindex to ensure search index is fresh
      const reindexRes = await searchService.reindexAll();
      runner.assertGte(reindexRes.indexedCount, 6, 'All products should be indexed');

      const searchRes = await searchService.search({ q: 'قطن' });
      runner.assertGte(searchRes.items.length, 1, 'Search query for قطن should return results');
      runner.assertEquals(searchRes.page, 1, 'Search result page should be 1');
      runner.assert(Array.isArray(searchRes.facets.categories), 'Search facets should contain category buckets');
    });

    runner.test('Search engine Arabic normalization handles alef/ta-marbuta variations', async () => {
      const res1 = await searchService.search({ q: 'اقمشة' });
      const res2 = await searchService.search({ q: 'أقمشة' });
      runner.assertEquals(res1.items.length, res2.items.length, 'Normalized Arabic search should return identical result counts regardless of hamza/diacritics');
    });

    runner.test('Search autocomplete suggestions route returns relevant prefix matches', async () => {
      const suggestions = await searchService.suggest('أقمشة', 5);
      runner.assertGte(suggestions.length, 1, 'Autocomplete should return suggestions for أقمشة');
      runner.assert(suggestions.some(s => s.text.length > 0), 'Suggestions should contain non-empty text');
    });

    runner.test('Popular search terms endpoint returns curated local keywords', async () => {
      const popular = await searchService.getPopularSearches();
      runner.assertGte(popular.length, 3, 'Popular searches list should contain terms');
      runner.assert(popular.some(p => typeof p === 'string' && p.length > 0), 'Popular keywords should contain non-empty search terms');
    });

    runner.test('Search service sorts products by price ascending (من الأقل للأعلى)', async () => {
      const res = await searchService.search({ sortBy: 'price_asc', limit: 20 });
      runner.assertGte(res.items.length, 2, 'Should return at least 2 items for price asc sort');
      for (let i = 0; i < res.items.length - 1; i++) {
        runner.assert(
          res.items[i].priceEGP <= res.items[i + 1].priceEGP,
          `Item at ${i} (${res.items[i].priceEGP}) should be <= item at ${i + 1} (${res.items[i + 1].priceEGP})`
        );
      }
    });

    runner.test('Search service sorts products by price descending (من الأعلى للأقل)', async () => {
      const res = await searchService.search({ sortBy: 'price_desc', limit: 20 });
      runner.assertGte(res.items.length, 2, 'Should return at least 2 items for price desc sort');
      for (let i = 0; i < res.items.length - 1; i++) {
        runner.assert(
          res.items[i].priceEGP >= res.items[i + 1].priceEGP,
          `Item at ${i} (${res.items[i].priceEGP}) should be >= item at ${i + 1} (${res.items[i + 1].priceEGP})`
        );
      }
    });

    runner.test('Search service sorts products by rating (الأعلى تقييماً)', async () => {
      const res = await searchService.search({ sortBy: 'rating' as any, limit: 20 });
      runner.assertGte(res.items.length, 2, 'Should return at least 2 items for rating sort');
      for (let i = 0; i < res.items.length - 1; i++) {
        runner.assert(
          res.items[i].rating >= res.items[i + 1].rating,
          `Item at ${i} rating (${res.items[i].rating}) should be >= item at ${i + 1} rating (${res.items[i + 1].rating})`
        );
      }
    });

    runner.test('Search service sorts products by date added (الأحدث وصولاً)', async () => {
      const res = await searchService.search({ sortBy: 'newest', limit: 20 });
      runner.assertGte(res.items.length, 2, 'Should return at least 2 items for newest sort');
      for (let i = 0; i < res.items.length - 1; i++) {
        const t1 = res.items[i].createdAt ? new Date(res.items[i].createdAt!).getTime() : 0;
        const t2 = res.items[i + 1].createdAt ? new Date(res.items[i + 1].createdAt!).getTime() : 0;
        runner.assert(
          t1 >= t2,
          `Item at ${i} timestamp (${t1}) should be >= item at ${i + 1} timestamp (${t2})`
        );
      }
    });

  });
}
