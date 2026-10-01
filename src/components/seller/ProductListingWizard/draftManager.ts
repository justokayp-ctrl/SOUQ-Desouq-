import { ListingFormData } from './types';
import { getCategoryListingSchema } from './CategorySchemas';

const DRAFT_PREFIX = 'souq_desoq_product_draft_v2_';

export function getDraftStorageKey(sellerId: string, productId?: string): string {
  return `${DRAFT_PREFIX}${sellerId}_${productId || 'new'}`;
}

export function saveDraftToStorage(sellerId: string, data: ListingFormData): boolean {
  try {
    const key = getDraftStorageKey(sellerId, data.id);
    const payload = {
      ...data,
      lastAutosavedAt: new Date().toISOString(),
      draftVersion: (data.draftVersion || 0) + 1
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save draft to localStorage:', err);
    return false;
  }
}

export function loadDraftFromStorage(sellerId: string, productId?: string): ListingFormData | null {
  try {
    const key = getDraftStorageKey(sellerId, productId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as ListingFormData;
  } catch (err) {
    console.error('Failed to load draft from localStorage:', err);
    return null;
  }
}

export function removeDraftFromStorage(sellerId: string, productId?: string): void {
  try {
    const key = getDraftStorageKey(sellerId, productId);
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to remove draft from localStorage:', err);
  }
}

export interface StepValidationStatus {
  stepIndex: number;
  stepId: string;
  labelAr: string;
  isComplete: boolean;
  scoreWeight: number;
  earnedScore: number;
  errors: string[];
  warnings: string[];
}

export function calculateListingCompletion(formData: ListingFormData): {
  overallPercentage: number;
  stepsStatus: StepValidationStatus[];
  criticalErrors: string[];
  warnings: string[];
} {
  const steps: StepValidationStatus[] = [];
  const criticalErrors: string[] = [];
  const allWarnings: string[] = [];

  // Step 1: Basic Information (Weight: 15)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (!formData.titleAr || formData.titleAr.trim().length === 0) {
      errors.push('عنوان المنتج بالعربية مطلوب');
    } else if (formData.titleAr.trim().length < 5) {
      errors.push('العنوان العربي قصير جداً (أقل من 5 أحرف)');
    } else if (formData.titleAr.trim().length > 200) {
      errors.push('العنوان العربي طويل جداً (تجاوز 200 حرف)');
    } else {
      score += 8;
      if (formData.titleAr.trim().length >= 20) score += 2;
    }

    if (!formData.brand || formData.brand.trim().length === 0) {
      warnings.push('اسم الماركة أو المتجر فارغ');
    } else {
      score += 3;
    }

    if (formData.titleEn && formData.titleEn.trim().length > 0) {
      score += 2;
    }

    steps.push({
      stepIndex: 1,
      stepId: 'basic_info',
      labelAr: 'المعلومات الأساسية',
      isComplete: errors.length === 0 && score >= 10,
      scoreWeight: 15,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 2: Category (Weight: 10)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (!formData.category) {
      errors.push('يجب اختيار تصنيف المنتج');
    } else {
      score += 7;
    }

    if (formData.productType) {
      score += 3;
    } else {
      warnings.push('حدد نوع السلعة بدقة');
    }

    steps.push({
      stepIndex: 2,
      stepId: 'category',
      labelAr: 'التصنيف والفئة',
      isComplete: errors.length === 0,
      scoreWeight: 10,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 3: Media (Weight: 15)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (!formData.images || formData.images.length === 0) {
      errors.push('يجب إضافة صورة واحدة على الأقل للمنتج');
    } else {
      score += 8;
      if (formData.images.length >= 3) {
        score += 5;
      } else {
        warnings.push('يفضل إضافة 3 صور أو أكثر لزيادة نسبة المبيعات');
      }
      if (formData.videoUrl) {
        score += 2;
      }
    }

    steps.push({
      stepIndex: 3,
      stepId: 'media',
      labelAr: 'الصور والوسائط',
      isComplete: errors.length === 0,
      scoreWeight: 15,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 4: Variants (Weight: 10)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 10;

    if (formData.hasVariations) {
      if (!formData.variants || formData.variants.length === 0) {
        errors.push('تم تفعيل المتغيرات ولكن لم يتم إضافة أي خيار أو مقاس/لون');
        score = 2;
      } else {
        const skuSet = new Set<string>();
        for (const v of formData.variants) {
          if (!v.sku) {
            errors.push(`المتغير "${v.title}" يفتقر إلى رمز SKU`);
          } else if (skuSet.has(v.sku)) {
            errors.push(`رمز SKU مكرر: ${v.sku}`);
          } else {
            skuSet.add(v.sku);
          }
          if (v.priceEGP <= 0) {
            errors.push(`سعر المتغير "${v.title}" غير صالح`);
          }
          if (v.stock < 0) {
            errors.push(`مخزون المتغير "${v.title}" لا يمكن أن يكون سالباً`);
          }
        }
      }
    }

    steps.push({
      stepIndex: 4,
      stepId: 'variants',
      labelAr: 'المتغيرات والخيارات',
      isComplete: errors.length === 0,
      scoreWeight: 10,
      earnedScore: errors.length === 0 ? score : 3,
      errors,
      warnings
    });
  }

  // Step 5: Price & Inventory (Weight: 15)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const price = Number(formData.priceEGP);
    if (!formData.priceEGP || isNaN(price) || price <= 0) {
      errors.push('سعر البيع بالجنيه المصري مطلوب ويجب أن يكون أكبر من صفر');
    } else {
      score += 7;
      if (formData.originalPriceEGP) {
        const origPrice = Number(formData.originalPriceEGP);
        if (origPrice < price) {
          warnings.push('السعر الأصلي قبل الخصم أقل من سعر البيع الحالي');
        } else {
          score += 2;
        }
      }
    }

    if (typeof formData.stock !== 'number' || formData.stock < 0) {
      errors.push('كمية المخزون غير صالحة');
    } else {
      score += 4;
    }

    if (!formData.sku || formData.sku.trim().length === 0) {
      warnings.push('رمز SKU الرئيسي للمنتج فارغ');
    } else {
      score += 2;
    }

    steps.push({
      stepIndex: 5,
      stepId: 'price_inventory',
      labelAr: 'التسعير والمخزون',
      isComplete: errors.length === 0,
      scoreWeight: 15,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 6: Shipping (Weight: 10)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 5;

    if (formData.weightKg && Number(formData.weightKg) > 0) {
      score += 3;
    } else {
      warnings.push('إدخال وزن المنتج بالكيلوجرام يحسن دقة حساب تكلفة الشحن');
    }

    if (formData.warranty) {
      score += 2;
    }

    steps.push({
      stepIndex: 6,
      stepId: 'shipping',
      labelAr: 'الشحن والتوصيل',
      isComplete: errors.length === 0,
      scoreWeight: 10,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 7: Description & Dynamic Attributes (Weight: 10)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (!formData.descriptionAr || formData.descriptionAr.trim().length === 0) {
      errors.push('وصف المنتج بالعربية مطلوب');
    } else if (formData.descriptionAr.trim().length < 15) {
      warnings.push('وصف المنتج قصير، أضف تفاصيل أكثر لتشجيع المشترين');
      score += 3;
    } else {
      score += 5;
    }

    if (formData.bulletPoints && formData.bulletPoints.length >= 2) {
      score += 3;
    }

    const schema = getCategoryListingSchema(formData.category);
    const requiredAttrs = schema.specificAttributes.filter(a => a.required);
    for (const reqAttr of requiredAttrs) {
      if (!formData.dynamicAttributes[reqAttr.id]) {
        warnings.push(`الخاصية "${reqAttr.labelAr}" مطلوبة للتصنيف الحالي`);
      }
    }
    if (Object.keys(formData.dynamicAttributes).length >= requiredAttrs.length) {
      score += 2;
    }

    steps.push({
      stepIndex: 7,
      stepId: 'description',
      labelAr: 'الوصف والمواصفات',
      isComplete: errors.length === 0,
      scoreWeight: 10,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 8: SEO (Weight: 5)
  {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (formData.slug && formData.slug.trim().length > 0) score += 2;
    if (formData.metaDescription && formData.metaDescription.trim().length > 0) score += 2;
    if (formData.searchTerms && formData.searchTerms.length > 0) score += 1;

    steps.push({
      stepIndex: 8,
      stepId: 'seo',
      labelAr: 'السيو ومحركات البحث',
      isComplete: true,
      scoreWeight: 5,
      earnedScore: score,
      errors,
      warnings
    });
  }

  // Step 9: Preview (Weight: 5)
  {
    steps.push({
      stepIndex: 9,
      stepId: 'preview',
      labelAr: 'معاينة المنتج',
      isComplete: true,
      scoreWeight: 5,
      earnedScore: 5,
      errors: [],
      warnings: []
    });
  }

  // Step 10: Review (Weight: 5)
  {
    steps.push({
      stepIndex: 10,
      stepId: 'review',
      labelAr: 'المراجعة والامتثال',
      isComplete: true,
      scoreWeight: 5,
      earnedScore: 5,
      errors: [],
      warnings: []
    });
  }

  // Step 11: Publish (Weight: 0 - Action step)
  {
    steps.push({
      stepIndex: 11,
      stepId: 'publish',
      labelAr: 'النشر وحالة المنتج',
      isComplete: true,
      scoreWeight: 0,
      earnedScore: 0,
      errors: [],
      warnings: []
    });
  }

  const totalEarned = steps.reduce((sum, s) => sum + s.earnedScore, 0);
  const totalWeight = steps.reduce((sum, s) => sum + s.scoreWeight, 0);
  const percentage = Math.min(100, Math.round((totalEarned / totalWeight) * 100));

  steps.forEach(s => {
    criticalErrors.push(...s.errors);
    allWarnings.push(...s.warnings);
  });

  return {
    overallPercentage: percentage,
    stepsStatus: steps,
    criticalErrors,
    warnings: allWarnings
  };
}
