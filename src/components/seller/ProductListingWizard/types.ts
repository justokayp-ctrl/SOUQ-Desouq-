import { Product, ProductVariant, ListingComplianceIssue, ProductListingStatus } from '../../../types';

export type ListingWizardStep = 
  | 'basic_info'        // 1. Basic Information (المعلومات الأساسية)
  | 'category'          // 2. Category (التصنيف والفئة)
  | 'media'             // 3. Media (الصور والوسائط)
  | 'variants'          // 4. Variants (المتغيرات والخيارات)
  | 'price_inventory'   // 5. Price & Inventory (التسعير والمخزون)
  | 'shipping'          // 6. Shipping (الشحن والتوصيل)
  | 'description'       // 7. Description (الوصف والمواصفات الديناميكية)
  | 'seo'               // 8. SEO (سيو والكلمات المفتاحية)
  | 'preview'           // 9. Preview (معاينة المنتج للعميل)
  | 'review'            // 10. Review (المراجعة والامتثال)
  | 'publish';          // 11. Publish (النشر ودورة الحياة)

export interface ImageValidationResult {
  url: string;
  isValid: boolean;
  format?: string;
  sizeMB?: number;
  width?: number;
  height?: number;
  errors: string[];
  warnings: string[];
}

export interface ListingFormData {
  id?: string;
  sellerId: string;

  // 1. Basic Information
  titleAr: string;
  titleEn: string;
  brand: string;
  modelNumber: string;
  isDesoqLocalMade: boolean;
  shortSummary: string;
  tags: string[];

  // 2. Category
  category: string;
  subcategory: string;
  productType: string;

  // 3. Media
  images: string[];
  videoUrl: string;
  primaryImageIndex: number;

  // 4. Variants
  hasVariations: boolean;
  variationTheme: 'none' | 'size' | 'color' | 'size_color' | 'volume' | 'pack_size' | 'style' | 'custom';
  selectedSizes: string[];
  selectedColors: { nameAr: string; hex: string }[];
  selectedVolumes: string[];
  selectedStyles: string[];
  variants: ProductVariant[];

  // 5. Price & Inventory
  priceEGP: number | '';
  originalPriceEGP: number | '';
  costPriceEGP: number | '';
  stock: number;
  lowStockThreshold: number;
  sku: string;
  barcode: string;
  vatIncluded: boolean;

  // 6. Shipping & Packaging
  weightKg: number | '';
  lengthCm: number | '';
  widthCm: number | '';
  heightCm: number | '';
  fulfillmentMethod: 'FBM' | 'FBD'; // FBM = Merchant, FBD = Desoq Express
  handlingTimeDays: number;
  isFragile: boolean;
  warranty: string;
  returnPolicyDays: number; // 14 or 30 (Egyptian Consumer Law 181/2018)

  // 7. Description & Specifications
  descriptionAr: string;
  descriptionEn: string;
  bulletPoints: string[];
  dynamicAttributes: Record<string, string>;
  careInstructions: string;

  // 8. SEO & Social Meta
  slug: string;
  metaTitle: string;
  metaDescription: string;
  searchTerms: string[];

  // 9. Status, Health & Quality
  status: ProductListingStatus;
  listingHealthScore: number;
  completionPercentage: number;
  complianceIssues: ListingComplianceIssue[];

  // Draft metadata
  lastAutosavedAt?: string | null;
  draftVersion?: number;
}

export interface TitleQualityAnalysis {
  score: number; // 0 to 100
  charCount: number;
  hasBrand: boolean;
  hasCategory: boolean;
  hasSpec: boolean;
  hasBannedWords: boolean;
  bannedWordsFound: string[];
  suggestionsAr: string[];
}
