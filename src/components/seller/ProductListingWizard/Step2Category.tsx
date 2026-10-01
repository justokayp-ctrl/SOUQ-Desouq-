import React from 'react';
import { 
  FolderTree, 
  Sparkles, 
  Check, 
  Shirt, 
  Heart, 
  ShoppingBag, 
  Watch, 
  Layers, 
  Utensils, 
  Tv, 
  Crown, 
  Tag, 
  Info,
  Package
} from 'lucide-react';
import { ListingFormData } from './types';
import { CATEGORY_SCHEMAS, getCategoryListingSchema } from './CategorySchemas';
import { ProductCategory } from '../../../types';

interface Step2CategoryProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  categories: ProductCategory[];
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'men_fashion': Shirt,
  'women_fashion': Heart,
  'perfumes_fragrances': Sparkles,
  'shoes_bags': ShoppingBag,
  'watches_accessories': Watch,
  'fabrics_textiles': Layers,
  'desoq_delicacies': Utensils,
  'heritage_crafts': Crown,
  'electronics_appliances': Tv,
  'kids_wear': Shirt,
  'complete_looks': Crown,
  'home_decor': Layers,
  'default': Package
};

export const Step2Category: React.FC<Step2CategoryProps> = ({
  formData,
  setFormData,
  categories
}) => {
  const currentSchema = getCategoryListingSchema(formData.category);

  const handleSelectCategory = (catId: string) => {
    const schema = getCategoryListingSchema(catId);
    setFormData(prev => ({
      ...prev,
      category: catId,
      productType: schema.suggestedProductTypes[0] || 'منتج أصلي جديد',
      // Reset incompatible dynamic attributes when switching categories
      dynamicAttributes: {}
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-category-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-indigo-50 via-indigo-50/40 to-blue-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-indigo-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FolderTree className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                2. التصنيف والفئة (Category & Hierarchy)
              </h3>
              <span className="text-[11px] font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                الخطوة 2 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              اختر تصنيف السلعة المناسب لفتح الحقول الديناميكية الخاصة بكل قطاع (المقاسات والخامات للأزياء، الحجم والتركيز للعطور، الأوزان للفسيخ والحلويات).
            </p>
          </div>
        </div>
      </div>

      {/* Category Grid Selection */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        <div>
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-3">
            <span>اختر قسم المنتجات الأساسي</span>
            <span className="text-rose-600 font-bold">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isSelected = formData.category === cat.id;
              const IconComp = CATEGORY_ICONS[cat.id] || CATEGORY_ICONS['default'];
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`category-btn-${cat.id}`}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-[#800020] bg-rose-50/50 dark:bg-zinc-700/80 shadow-xs ring-2 ring-[#800020]/20'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50/60 dark:bg-zinc-800/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#800020] text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {cat.nameAr}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#800020] dark:text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                      {cat.description || cat.nameEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggested Product Types */}
        {currentSchema.suggestedProductTypes.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>نوع السلعة المحدد (Product Type)</span>
              <span className="text-xs text-zinc-500 font-normal">اختر من النماذج المقترحة أو اكتب بنفسك</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {currentSchema.suggestedProductTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, productType: type }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    formData.productType === type
                      ? 'bg-[#800020] text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <input
              id="custom-product-type-input"
              type="text"
              value={formData.productType}
              onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
              placeholder="اكتب نوع المنتج بالتفصيل (مثال: قميص أكسفورد كلاسيك)"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
            />
          </div>
        )}

        {/* Category Guidelines Box */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/70 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>إرشادات الإدراج لتصنيف ({currentSchema.categoryNameAr}):</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {currentSchema.titleGuidelinesAr}
          </p>
          {currentSchema.complianceWarningAr && (
            <div className="p-2.5 bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-medium mt-2">
              ⚠️ {currentSchema.complianceWarningAr}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
