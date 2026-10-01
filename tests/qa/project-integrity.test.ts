import fs from 'fs';
import path from 'path';
import { TestRunner } from '../testFramework';
import { db } from '../../server/db';
import { INITIAL_PRODUCTS, INITIAL_SELLERS } from '../../src/data/mockData';
import { translations } from '../../src/i18n/translations';

export async function runProjectIntegrityTests(runner: TestRunner): Promise<void> {
  runner.describe('QA Integrity Suite — Project Structure, Data & Standards', () => {

    runner.test('Core platform configuration files exist', () => {
      const requiredFiles = [
        'package.json',
        'metadata.json',
        'index.html',
        'server.ts',
        'src/App.tsx',
        'src/types.ts',
        'src/index.css',
      ];

      for (const relPath of requiredFiles) {
        const fullPath = path.join(process.cwd(), relPath);
        runner.assert(fs.existsSync(fullPath), `Required project file missing: ${relPath}`);
      }
    });

    runner.test('Metadata.json schema contains required title and capabilities', () => {
      const metaPath = path.join(process.cwd(), 'metadata.json');
      const content = fs.readFileSync(metaPath, 'utf-8');
      const meta = JSON.parse(content);

      runner.assert(typeof meta.name === 'string' && meta.name.length > 0, 'metadata.json must have a valid name');
      runner.assert(typeof meta.description === 'string' && meta.description.length > 0, 'metadata.json must have a valid description');
      runner.assert(Array.isArray(meta.majorCapabilities), 'majorCapabilities must be an array');
      runner.assert(meta.majorCapabilities.includes('MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API'), 'Must declare server-side Gemini capability');
    });

    runner.test('HTML title and meta match application branding', () => {
      const htmlPath = path.join(process.cwd(), 'index.html');
      const content = fs.readFileSync(htmlPath, 'utf-8');

      runner.assert(content.includes('سوق دسوق') && content.includes('<title>'), 'HTML title must reflect Souq Desoq branding');
      runner.assert(content.includes('dir="rtl"'), 'HTML root must specify RTL direction for Arabic primary audience');
    });

    runner.test('Catalog seed data referential integrity: Every product references an existing seller', () => {
      const sellerIds = new Set(INITIAL_SELLERS.map(s => s.id));
      for (const prod of INITIAL_PRODUCTS) {
        runner.assert(sellerIds.has(prod.sellerId), `Product ${prod.id} references non-existent sellerId ${prod.sellerId}`);
        runner.assert(prod.priceEGP > 0, `Product ${prod.id} price must be > 0`);
        runner.assert(prod.stock >= 0, `Product ${prod.id} stock must be >= 0`);
      }
    });

    runner.test('Database products table is seeded and accessible', () => {
      const dbProducts = db.getProducts();
      runner.assertGte(dbProducts.length, 5, 'Database must have at least 5 products seeded');
      const sellers = db.getSellers();
      runner.assertGte(sellers.length, 2, 'Database must have at least 2 active verified sellers');
    });

    runner.test('Localization dictionaries are complete for key UI strings', () => {
      const arKeys = Object.keys(translations.ar);
      const enKeys = Object.keys(translations.en);

      runner.assertGte(arKeys.length, 20, 'Arabic dictionary must have at least 20 entries');
      runner.assertEquals(arKeys.length, enKeys.length, 'Arabic and English translation keys must have parity');

      for (const key of arKeys) {
        runner.assert(!!(translations.ar as any)[key], `Arabic translation missing for key: ${key}`);
        runner.assert(!!(translations.en as any)[key], `English translation missing for key: ${key}`);
      }
    });

    runner.test('Repository safety: No sensitive production private keys committed in source files', () => {
      const checkFiles = [
        'package.json',
        'server.ts',
        'src/types.ts',
      ];

      const forbiddenSubstrings = [
        'BEGIN RSA PRIVATE KEY',
        'BEGIN OPENSSH PRIVATE KEY',
        'AIzaSyB_FAKE_PROD_SECRET',
      ];

      for (const f of checkFiles) {
        const fullPath = path.join(process.cwd(), f);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const sub of forbiddenSubstrings) {
            runner.assert(!content.includes(sub), `File ${f} contains forbidden secret token: ${sub}`);
          }
        }
      }
    });

  });
}
