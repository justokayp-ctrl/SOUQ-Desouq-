import { TestRunner } from '../testFramework';
import { getCategoryListingSchema } from '../../src/components/seller/ProductListingWizard/CategorySchemas';
import { calculateListingCompletion } from '../../src/components/seller/ProductListingWizard/draftManager';
import { ListingFormData } from '../../src/components/seller/ProductListingWizard/types';
import { db } from '../../server/db';

export async function runProductCreationWizardTests(runner: TestRunner): Promise<void> {
  runner.describe('SOUQ DESOQ — 11-Step Product Creation Wizard & Dynamic Fields Engine', () => {

    // Test 1: Category Schemas & Dynamic Fields
    runner.test('Category dynamic fields contain domain-specific attributes for Clothing, Perfumes, and Desoq Delicacies', () => {
      // Clothing / Men Fashion
      const clothingSchema = getCategoryListingSchema('men_fashion');
      runner.assert(!!clothingSchema, 'Clothing schema should exist');
      runner.assert(clothingSchema.categoryNameAr.includes('أزياء'), 'Clothing schema title check');
      const fabricField = clothingSchema.specificAttributes.find(a => a.id === 'fabric');
      const fitField = clothingSchema.specificAttributes.find(a => a.id === 'fitType');
      runner.assert(!!fabricField, 'Fabric field should exist in Clothing');
      runner.assert(!!fitField, 'Fit field should exist in Clothing');

      // Perfume / Fragrances
      const perfumeSchema = getCategoryListingSchema('perfumes_fragrances');
      runner.assert(!!perfumeSchema, 'Perfume schema should exist');
      const concField = perfumeSchema.specificAttributes.find(a => a.id === 'perfumeConcentration');
      const volField = perfumeSchema.specificAttributes.find(a => a.id === 'bottleVolume');
      const familyField = perfumeSchema.specificAttributes.find(a => a.id === 'scentFamily');
      runner.assert(!!concField, 'Concentration field should exist in Perfume');
      runner.assert(!!volField, 'Volume field should exist in Perfume');
      runner.assert(!!familyField, 'Scent family should exist in Perfume');

      // Desoq Delicacies / Fesikh
      const fesikhSchema = getCategoryListingSchema('desoq_delicacies');
      runner.assert(!!fesikhSchema, 'Desoq delicacies schema should exist');
      const saltField = fesikhSchema.specificAttributes.find(a => a.id === 'saltLevel');
      const shelfLife = fesikhSchema.specificAttributes.find(a => a.id === 'shelfLifeDays');
      runner.assert(!!saltField, 'Salt level field should exist in Delicacies');
      runner.assert(!!shelfLife, 'Shelf life field should exist in Delicacies');
    });

    // Test 2: Validation - Empty / Invalid data
    runner.test('Validation Engine catches empty titles, invalid prices, and missing categories', () => {
      const emptyForm: ListingFormData = {
        sellerId: 'seller-1',
        titleAr: '',
        titleEn: '',
        brand: '',
        modelNumber: '',
        isDesoqLocalMade: true,
        shortSummary: '',
        tags: [],
        category: '',
        subcategory: '',
        productType: '',
        images: [],
        videoUrl: '',
        primaryImageIndex: 0,
        hasVariations: false,
        variationTheme: 'none',
        selectedSizes: [],
        selectedColors: [],
        selectedVolumes: [],
        selectedStyles: [],
        variants: [],
        priceEGP: '',
        originalPriceEGP: '',
        costPriceEGP: '',
        stock: 0,
        lowStockThreshold: 3,
        sku: '',
        barcode: '',
        vatIncluded: true,
        weightKg: '',
        lengthCm: '',
        widthCm: '',
        heightCm: '',
        fulfillmentMethod: 'FBD',
        handlingTimeDays: 1,
        isFragile: false,
        warranty: '',
        returnPolicyDays: 14,
        descriptionAr: '',
        descriptionEn: '',
        bulletPoints: [],
        dynamicAttributes: {},
        careInstructions: '',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        searchTerms: [],
        status: 'draft',
        listingHealthScore: 0,
        completionPercentage: 0,
        complianceIssues: []
      };

      const result = calculateListingCompletion(emptyForm);
      runner.assert(result.criticalErrors.length >= 3, 'Critical errors must be flagged for empty form');
      runner.assert(result.criticalErrors.some(e => e.includes('عنوان المنتج بالعربية مطلوب')), 'Missing title error');
      runner.assert(result.criticalErrors.some(e => e.includes('سعر البيع')), 'Missing price error');
      runner.assert(result.criticalErrors.some(e => e.includes('صورة واحدة على الأقل')), 'Missing image error');
    });

    // Test 3: Variant Matrix & Duplicate SKU validation
    runner.test('Variant validation catches duplicate SKUs and negative stock', () => {
      const validForm: ListingFormData = {
        sellerId: 'seller-1',
        titleAr: 'قميص قطن مصري فاخر للمناسبات والأفراح',
        titleEn: 'Men Cotton Shirt',
        brand: 'منسوجات دسوق',
        modelNumber: 'DSQ-101',
        isDesoqLocalMade: true,
        shortSummary: 'قميص رائع عالي الجودة',
        tags: ['قميص', 'قطن مصري'],
        category: 'men_fashion',
        subcategory: 'قمصان',
        productType: 'قمصان قطن مصري',
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf'],
        videoUrl: '',
        primaryImageIndex: 0,
        hasVariations: true,
        variationTheme: 'size',
        selectedSizes: ['M', 'L'],
        selectedColors: [],
        selectedVolumes: [],
        selectedStyles: [],
        variants: [
          { id: 'v1', title: 'M', sku: 'DSQ-SHIRT-M', priceEGP: 350, stock: 10, size: 'M' },
          { id: 'v2', title: 'L', sku: 'DSQ-SHIRT-M', priceEGP: 350, stock: -5, size: 'L' } // Duplicate SKU + negative stock!
        ],
        priceEGP: 350,
        originalPriceEGP: 450,
        costPriceEGP: 200,
        stock: 20,
        lowStockThreshold: 3,
        sku: 'DSQ-SHIRT-MAIN',
        barcode: '6221234567890',
        vatIncluded: true,
        weightKg: 0.4,
        lengthCm: 30,
        widthCm: 25,
        heightCm: 4,
        fulfillmentMethod: 'FBD',
        handlingTimeDays: 1,
        isFragile: false,
        warranty: '14 يوماً استبدال واسترجاع',
        returnPolicyDays: 14,
        descriptionAr: 'قميص قطن مصري طويل التيلة ناعم الملمس متين النسيج',
        descriptionEn: 'Egyptian Cotton Shirt',
        bulletPoints: ['قطن 100% طبيعي', 'خياطة مزدوجة متينة'],
        dynamicAttributes: { fabric: 'egyptian_cotton_100', fitType: 'slim_fit' },
        careInstructions: 'غسيل بارد',
        slug: 'men-cotton-shirt-dsq',
        metaTitle: 'قميص قطن مصري | سوق دسوق',
        metaDescription: 'اشتر الآن أفضل قميص قطن مصري بأفضل سعر',
        searchTerms: ['قميص', 'قطن'],
        status: 'active',
        listingHealthScore: 90,
        completionPercentage: 90,
        complianceIssues: []
      };

      const result = calculateListingCompletion(validForm);
      runner.assert(result.criticalErrors.some(e => e.includes('مكرر')), 'Duplicate SKU must be flagged');
      runner.assert(result.criticalErrors.some(e => e.includes('سالباً')), 'Negative stock must be flagged');
    });

    // Test 4: Database Product Creation with Normalized Status
    runner.test('Backend accepts and persists product with 11-step attributes and all statuses', async () => {
      const sellers = db.getSellers();
      runner.assert(sellers.length > 0, 'Sellers should exist');
      const seller = sellers[0];

      const createdProduct = await db.createProduct({
        sellerId: seller.id,
        titleAr: 'عطر مسك الختام والعود الدسوقي الملكي',
        titleEn: 'Royal Musk & Oud Perfume',
        category: 'perfumes_fragrances',
        productType: 'عطور نيش شرقية',
        priceEGP: 550,
        originalPriceEGP: 750,
        stock: 35,
        images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f'],
        descriptionAr: 'عطر نيش فاخر بتركيز اكستري دي بارفان وثبات يدوم لأكثر من 24 ساعة',
        status: 'pending_moderation',
        isDesoqLocalMade: true,
        fulfillmentMethod: 'FBD',
        handlingTimeDays: 1,
        attributes: {
          perfumeConcentration: 'extrait_de_parfum',
          bottleVolume: 'bottle_50ml',
          scentFamily: 'oriental_oud',
          brand: 'دار عطور دسوق الفاخرة'
        }
      });

      runner.assert(!!createdProduct, 'Product must be created');
      runner.assert(!!createdProduct.id, 'Product id must exist');
      runner.assertEquals(createdProduct.status, 'pending_moderation', 'Status should match');
      runner.assertEquals(createdProduct.attributes?.perfumeConcentration, 'extrait_de_parfum', 'Attribute match');

      // Update to active
      const updated = await db.updateProduct(createdProduct.id, {
        status: 'active'
      });
      runner.assert(!!updated, 'Product should update');
      runner.assertEquals(updated?.status, 'active', 'Status updated to active');
    });

  });
}
