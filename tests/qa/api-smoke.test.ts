import { TestRunner, TestHttpClient } from '../testFramework';
import { defaultQAConfig } from './qaConfig';

export async function runApiSmokeTests(runner: TestRunner): Promise<void> {
  const client = new TestHttpClient();

  runner.describe('QA Smoke Suite — Core API Health & Latency Validation', () => {

    runner.test('GET /api/health responds within SLA and returns healthy subsystems', async () => {
      const start = Date.now();
      const res = await client.request({
        method: 'GET',
        path: '/api/health',
      });
      const elapsed = Date.now() - start;

      runner.assertEquals(res.status, 200, 'Health endpoint must return HTTP 200');
      runner.assertEquals(res.body.status, 'healthy', 'Status must be healthy');
      runner.assert(!!res.body.services, 'Services health map must be present');
      runner.assertEquals(res.body.services.apiGateway, 'online', 'apiGateway must be online');
      runner.assertEquals(res.body.services.catalogService, 'online', 'catalogService must be online');
      runner.assertEquals(res.body.services.orderSplittingEngine, 'online', 'orderSplittingEngine must be online');
      runner.assertEquals(res.body.services.financialLedger, 'online', 'financialLedger must be online');
      runner.assert(elapsed <= defaultQAConfig.thresholds.maxResponseTimeMs, `Health response time (${elapsed}ms) must be within SLA (<${defaultQAConfig.thresholds.maxResponseTimeMs}ms)`);
    });

    runner.test('GET /api/catalog/products returns valid marketplace inventory', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/catalog/products',
      });

      runner.assertEquals(res.status, 200, 'Catalog products endpoint must return HTTP 200');
      runner.assert(Array.isArray(res.body), 'Body must be an array of products');
      runner.assertGte(res.body.length, 5, 'Catalog should contain at least 5 seed products');

      // Validate schema on first product
      const sample = res.body[0];
      runner.assert(typeof sample.id === 'string', 'Product id must be string');
      runner.assert(typeof sample.titleAr === 'string' && sample.titleAr.length > 0, 'titleAr must be non-empty string');
      runner.assert(typeof sample.priceEGP === 'number' && sample.priceEGP > 0, 'priceEGP must be positive number');
      runner.assert(typeof sample.stock === 'number' && sample.stock >= 0, 'stock must be non-negative number');
      runner.assert(typeof sample.sellerId === 'string', 'sellerId must be specified');
    });

    runner.test('GET /api/catalog/categories returns structured taxonomy tree', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/catalog/categories',
      });

      runner.assertEquals(res.status, 200, 'Categories endpoint must return HTTP 200');
      runner.assert(Array.isArray(res.body), 'Body must be an array of categories');
      runner.assertGte(res.body.length, 3, 'Marketplace must have at least 3 categories');

      for (const cat of res.body) {
        runner.assert(!!cat.id, 'Category must have an id');
        runner.assert(!!cat.nameAr, 'Category must have Arabic name');
      }
    });

    runner.test('GET /api/catalog/search returns matching normalized results', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/catalog/search?q=عطر',
      });

      runner.assertEquals(res.status, 200, 'Search query must return HTTP 200');
      runner.assert(Array.isArray(res.body.items || res.body), 'Search result must return array of matches');
    });

    runner.test('GET /api/catalog/search/popular returns trending search terms', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/catalog/search/popular',
      });

      runner.assertEquals(res.status, 200, 'Popular terms endpoint must return HTTP 200');
      runner.assert(Array.isArray(res.body), 'Popular terms should return an array');
      runner.assertGte(res.body.length, 1, 'At least 1 popular search term should be configured');
    });

    runner.test('GET /api/auth/demo-users provides verified testing personas', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/auth/demo-users',
      });

      runner.assertEquals(res.status, 200, 'Demo users endpoint must return HTTP 200');
      runner.assert(Array.isArray(res.body), 'Demo users must be an array');

      const roles = res.body.map((u: any) => u.role);
      runner.assert(roles.includes('customer'), 'Customer persona must be available');
      runner.assert(roles.includes('seller'), 'Seller persona must be available');
      runner.assert(roles.includes('support'), 'Support persona must be available');
      runner.assert(roles.includes('admin'), 'Admin persona must be available');
    });

    runner.test('GET /api/observability/metrics returns operational telemetry metrics', async () => {
      const res = await client.request({
        method: 'GET',
        path: '/api/observability/metrics',
      });

      runner.assertEquals(res.status, 200, 'Metrics endpoint must return HTTP 200');
      runner.assert(res.body.uptimeSeconds >= 0, 'Uptime must be non-negative');
      runner.assert(!!res.body.memory, 'Memory metrics must be present');
    });

  });
}
