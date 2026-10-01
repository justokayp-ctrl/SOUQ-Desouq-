import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  FolderTree, 
  Image as ImageIcon, 
  GitBranch, 
  Coins, 
  Truck, 
  AlignLeft, 
  Globe, 
  Eye, 
  ClipboardCheck, 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Save, 
  Clock, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, ProductVariant, ProductListingStatus } from '../../types';
import { ListingFormData, ListingWizardStep } from './ProductListingWizard/types';
import { Step1BasicInfo } from './ProductListingWizard/Step1BasicInfo';
import { Step2Category } from './ProductListingWizard/Step2Category';
import { Step3Media } from './ProductListingWizard/Step3Media';
import { Step4Variants } from './ProductListingWizard/Step4Variants';
import { Step5PriceInventory } from './ProductListingWizard/Step5PriceInventory';
import { Step6Shipping } from './ProductListingWizard/Step6Shipping';
import { Step7Description } from './ProductListingWizard/Step7Description';
import { Step8Seo } from './ProductListingWizard/Step8Seo';
import { Step9Preview } from './ProductListingWizard/Step9Preview';
import { Step10Review } from './ProductListingWizard/Step10Review';
import { Step11Publish } from './ProductListingWizard/Step11Publish';
import { 
  saveDraftToStorage, 
  loadDraftFromStorage, 
  removeDraftFromStorage, 
  calculateListingCompletion 
} from './ProductListingWizard/draftManager';

interface ProductWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  productToEdit?: Product | null;
  onNavigateToTab?: (tab: string) => void;
  onOpenProductPage?: (product: Product) => void;
}

export const WIZARD_11_STEPS: { id: ListingWizardStep; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'basic_info', labelAr: '1. المعلومات الأساسية', icon: FileText },
  { id: 'category', labelAr: '2. التصنيف', icon: FolderTree },
  { id: 'media', labelAr: '3. الصور', icon: ImageIcon },
  { id: 'variants', labelAr: '4. المتغيرات', icon: GitBranch },
  { id: 'price_inventory', labelAr: '5. التسعير والمخزون', icon: Coins },
  { id: 'shipping', labelAr: '6. الشحن', icon: Truck },
  { id: 'description', labelAr: '7. الوصف والمواصفات', icon: AlignLeft },
  { id: 'seo', labelAr: '8. السيو', icon: Globe },
  { id: 'preview', labelAr: '9. المعاينة', icon: Eye },
  { id: 'review', labelAr: '10. المراجعة', icon: ClipboardCheck },
  { id: 'publish', labelAr: '11. النشر', icon: Rocket }
];

export const ProductWizardModal: React.FC<ProductWizardModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  productToEdit,
  onNavigateToTab,
  onOpenProductPage
}) => {
  const { products, categories, addProduct, updateProduct, showToast } = useMarketplace();

  // Wizard Step State (1 of 11)
  const [currentStep, setCurrentStep] = useState<ListingWizardStep>('basic_info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState<string | null>(null);
  const [hasDraftToResume, setHasDraftToResume] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);

  // Initial Form Data State
  const [formData, setFormData] = useState<ListingFormData>({
    id: productToEdit?.id,
    sellerId: sellerId || 'seller-current',

    // 1. Basic Info
    titleAr: productToEdit?.titleAr || '',
    titleEn: productToEdit?.titleEn || '',
    brand: productToEdit?.brand || productToEdit?.attributes?.brand || sellerName,
    modelNumber: productToEdit?.modelNumber || '',
    isDesoqLocalMade: productToEdit?.isDesoqLocalMade ?? true,
    shortSummary: '',
    tags: ['سوق دسوق', 'منتج أصلي'],

    // 2. Category
    category: productToEdit?.category || categories[0]?.id || 'men_fashion',
    subcategory: productToEdit?.subcategory || '',
    productType: productToEdit?.productType || 'منتج أصلي جديد',

    // 3. Media
    images: productToEdit?.images || [],
    videoUrl: productToEdit?.videoUrl || '',
    primaryImageIndex: 0,

    // 4. Variants
    hasVariations: productToEdit?.hasVariations || (productToEdit?.variants && productToEdit.variants.length > 0) || false,
    variationTheme: (productToEdit?.variationTheme as any) || 'size_color',
    selectedSizes: productToEdit?.variants?.filter(v => v.size).map(v => v.size!) || [],
    selectedColors: [],
    selectedVolumes: [],
    selectedStyles: [],
    variants: productToEdit?.variants || [],

    // 5. Price & Inventory
    priceEGP: productToEdit?.priceEGP ?? '',
    originalPriceEGP: productToEdit?.originalPriceEGP ?? '',
    costPriceEGP: '',
    stock: productToEdit?.stock ?? 20,
    lowStockThreshold: 3,
    sku: productToEdit?.attributes?.sku || `DSQ-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: productToEdit?.gtin || '',
    vatIncluded: true,

    // 6. Shipping
    weightKg: 0.5,
    lengthCm: 25,
    widthCm: 20,
    heightCm: 5,
    fulfillmentMethod: (productToEdit?.fulfillmentMethod as any) || 'FBD',
    handlingTimeDays: productToEdit?.handlingTimeDays ?? 1,
    isFragile: false,
    warranty: productToEdit?.attributes?.warranty || '14 يوماً استبدال واسترجاع وفق قانون حماية المستهلك',
    returnPolicyDays: 14,

    // 7. Description & Specifications
    descriptionAr: productToEdit?.descriptionAr || '',
    descriptionEn: productToEdit?.descriptionEn || '',
    bulletPoints: productToEdit?.bulletPoints?.length 
      ? productToEdit.bulletPoints 
      : ['خامات ممتازة عالية الجودة مع عناية بالتفاصيل', 'تصميم أنيق يلائم الاستخدام اليومي والمناسبات'],
    dynamicAttributes: (productToEdit?.attributes as Record<string, string>) || {},
    careInstructions: '',

    // 8. SEO
    slug: '',
    metaTitle: '',
    metaDescription: '',
    searchTerms: productToEdit?.searchTerms || [],

    // Status & Quality
    status: (productToEdit?.status as ProductListingStatus) || 'active',
    listingHealthScore: 90,
    completionPercentage: 20,
    complianceIssues: []
  });

  // Check for saved local draft on open
  useEffect(() => {
    if (isOpen && !productToEdit) {
      const savedDraft = loadDraftFromStorage(sellerId);
      if (savedDraft && savedDraft.titleAr) {
        setHasDraftToResume(true);
      }
    }
  }, [isOpen, sellerId, productToEdit]);

  // Sync state if editing existing product
  useEffect(() => {
    if (productToEdit) {
      setFormData(prev => ({
        ...prev,
        id: productToEdit.id,
        titleAr: productToEdit.titleAr || '',
        titleEn: productToEdit.titleEn || '',
        brand: productToEdit.brand || productToEdit.attributes?.brand || sellerName,
        category: productToEdit.category || prev.category,
        productType: productToEdit.productType || prev.productType,
        images: productToEdit.images || [],
        priceEGP: productToEdit.priceEGP,
        originalPriceEGP: productToEdit.originalPriceEGP,
        stock: productToEdit.stock,
        status: (productToEdit.status as ProductListingStatus) || 'active',
        hasVariations: productToEdit.hasVariations || (productToEdit.variants && productToEdit.variants.length > 0) || false,
        variants: productToEdit.variants || [],
        descriptionAr: productToEdit.descriptionAr || ''
      }));
    }
  }, [productToEdit, sellerName]);

  // Debounced Autosave Hook (saves every 1.5s after changes)
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isOpen || productToEdit) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      if (formData.titleAr || formData.priceEGP) {
        setIsAutosaving(true);
        saveDraftToStorage(sellerId, formData);
        setTimeout(() => setIsAutosaving(false), 600);
      }
    }, 1500);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [formData, isOpen, sellerId, productToEdit]);

  if (!isOpen) return null;

  const currentStepIndex = WIZARD_11_STEPS.findIndex(s => s.id === currentStep);
  const completion = calculateListingCompletion(formData);

  const handleNext = () => {
    if (currentStepIndex < WIZARD_11_STEPS.length - 1) {
      setCurrentStep(WIZARD_11_STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(WIZARD_11_STEPS[currentStepIndex - 1].id);
    }
  };

  const handleResumeDraft = () => {
    const savedDraft = loadDraftFromStorage(sellerId);
    if (savedDraft) {
      setFormData(savedDraft);
      setHasDraftToResume(false);
      showToast('تم استرجاع بيانات المسودة المحفوظة بنجاح!');
    }
  };

  const handleDiscardDraft = () => {
    removeDraftFromStorage(sellerId);
    setHasDraftToResume(false);
  };

  // Final Publish Handler
  const handleFinalSubmit = async (targetStatus: ProductListingStatus) => {
    if (!formData.titleAr.trim()) {
      showToast('يرجى إدخال عنوان المنتج بالعربية أولاً');
      setCurrentStep('basic_info');
      return;
    }

    if (!formData.priceEGP || Number(formData.priceEGP) <= 0) {
      showToast('يرجى إدخال سعر بيع صحيح للمنتج');
      setCurrentStep('price_inventory');
      return;
    }

    setIsSubmitting(true);

    const finalProductData: Partial<Product> = {
      titleAr: formData.titleAr.trim(),
      titleEn: formData.titleEn.trim() || formData.titleAr.trim(),
      category: formData.category,
      subcategory: formData.subcategory || formData.productType,
      productType: formData.productType,
      priceEGP: Number(formData.priceEGP),
      originalPriceEGP: formData.originalPriceEGP ? Number(formData.originalPriceEGP) : undefined,
      descriptionAr: formData.descriptionAr.trim() || formData.titleAr.trim(),
      descriptionEn: formData.descriptionEn.trim(),
      images: formData.images.length > 0 ? formData.images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      stock: Number(formData.stock),
      gtin: formData.barcode || undefined,
      brand: formData.brand.trim() || sellerName,
      modelNumber: formData.modelNumber.trim(),
      bulletPoints: formData.bulletPoints.filter(b => b.trim().length > 0),
      searchTerms: formData.searchTerms,
      videoUrl: formData.videoUrl.trim() || undefined,
      fulfillmentMethod: formData.fulfillmentMethod,
      handlingTimeDays: formData.handlingTimeDays,
      isDesoqLocalMade: formData.isDesoqLocalMade,
      isFastDesoqDelivery: formData.fulfillmentMethod === 'FBD',
      hasVariations: formData.hasVariations,
      variationTheme: formData.variationTheme,
      variants: formData.hasVariations ? formData.variants : undefined,
      status: targetStatus,
      attributes: {
        ...formData.dynamicAttributes,
        brand: formData.brand.trim() || sellerName,
        origin: formData.isDesoqLocalMade ? 'دسوق، كفر الشيخ، مصر' : 'مصر',
        warranty: formData.warranty || '14 يوماً استبدال واسترجاع وفق قانون حماية المستهلك',
        sku: formData.sku
      }
    };

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, finalProductData);
        showToast('تم تحديث بيانات المنتج بنجاح في الكتالوج');
        removeDraftFromStorage(sellerId, productToEdit.id);
        onClose();
      } else {
        const createdId = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newProduct: Product = {
          ...finalProductData,
          id: createdId,
          sellerId,
          rating: 5.0,
          reviewCount: 0,
          createdAt: new Date().toISOString()
        } as Product;

        await addProduct(finalProductData as any);
        showToast('تم حفظ المنتج بنجاح في متجر سوق دسوق!');
        removeDraftFromStorage(sellerId);
        setPublishedProductId(createdId);
      }
    } catch (err) {
      console.error('Failed to save listing:', err);
      showToast('حدث خطأ أثناء حفظ المنتج، يرجى المحاولة ثانية');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden text-right">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  {productToEdit ? 'تعديل بيانات بطاقة المنتج' : 'معالج إضافة ونشر المنتج الجديد (Product Wizard)'}
                </h2>
                {isAutosaving && (
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    <Save className="w-3 h-3 animate-pulse" />
                    <span>حفظ تلقائي...</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                سوق دسوق للتجارة الإلكترونية • لوحة البائع: {sellerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Completion Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold">
              <span className="text-zinc-500">نسبة الاكتمال:</span>
              <span className={
                completion.overallPercentage >= 80 ? 'text-emerald-600' :
                completion.overallPercentage >= 50 ? 'text-amber-600' :
                'text-rose-600'
              }>
                {completion.overallPercentage}%
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Draft Notification Banner */}
        {hasDraftToResume && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>تم العثور على مسودة سابقة غير مكتملة لهذا المنتج. هل ترغب في استكمالها؟</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResumeDraft}
                className="px-3 py-1 bg-[#800020] text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-[#600018]"
              >
                استرجاع المسودة
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-2 py-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs cursor-pointer"
              >
                تجاهل
              </button>
            </div>
          </div>
        )}

        {/* 11 Steps Horizontal Scroll Bar */}
        <div className="px-6 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[950px] gap-1.5">
            {WIZARD_11_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = step.id === currentStep;
              const isPassed = idx < currentStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  id={`wizard-step-btn-${step.id}`}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#800020] text-white font-bold shadow-xs'
                      : isPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{step.labelAr}</span>
                  {isPassed && <Check className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Dynamic Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {currentStep === 'basic_info' && (
            <Step1BasicInfo formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'category' && (
            <Step2Category formData={formData} setFormData={setFormData} categories={categories} />
          )}

          {currentStep === 'media' && (
            <Step3Media formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'variants' && (
            <Step4Variants formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'price_inventory' && (
            <Step5PriceInventory formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'shipping' && (
            <Step6Shipping formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'description' && (
            <Step7Description formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'seo' && (
            <Step8Seo formData={formData} setFormData={setFormData} />
          )}

          {currentStep === 'preview' && (
            <Step9Preview formData={formData} />
          )}

          {currentStep === 'review' && (
            <Step10Review
              formData={formData}
              onJumpToStep={(step) => setCurrentStep(step)}
            />
          )}

          {currentStep === 'publish' && (
            <Step11Publish
              formData={formData}
              setFormData={setFormData}
              onFinalSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
              publishedProductId={publishedProductId}
              onViewProductPdp={(prodId) => {
                const p = products.find(prod => prod.id === prodId) || productToEdit;
                if (p && onOpenProductPage) {
                  onOpenProductPage(p);
                }
                onClose();
              }}
              onCloseWizard={onClose}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="wizard-prev-btn"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 font-bold flex items-center gap-1.5 text-xs hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            {currentStepIndex < WIZARD_11_STEPS.length - 1 ? (
              <button
                type="button"
                id="wizard-next-btn"
                onClick={handleNext}
                className="bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs text-xs transition-all cursor-pointer"
              >
                <span>التالي: {WIZARD_11_STEPS[currentStepIndex + 1]?.labelAr.split('. ')[1]}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFinalSubmit('draft')}
              disabled={isSubmitting}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ كمسودة</span>
            </button>

            <button
              type="button"
              id="wizard-quick-publish-btn"
              onClick={() => handleFinalSubmit('active')}
              disabled={isSubmitting || completion.criticalErrors.length > 0}
              className="px-6 py-2.5 bg-[#800020] hover:bg-[#660018] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>{productToEdit ? 'حفظ وتحديث المنتج' : 'نشر المنتج الآن 🚀'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
