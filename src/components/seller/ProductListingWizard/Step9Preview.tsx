import React, { useState } from 'react';
import { 
  Eye, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Award, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ListingFormData } from './types';
import { getCategoryListingSchema } from './CategorySchemas';

interface Step9PreviewProps {
  formData: ListingFormData;
}

export const Step9Preview: React.FC<Step9PreviewProps> = ({
  formData
}) => {
  const schema = getCategoryListingSchema(formData.category);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    formData.variants.length > 0 ? formData.variants[0].id : null
  );

  const activeImage = formData.images[selectedImageIndex] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  const price = Number(formData.priceEGP) || 0;
  const origPrice = Number(formData.originalPriceEGP) || 0;
  const discountPercent = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-preview-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-violet-50 via-violet-50/40 to-purple-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-violet-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Eye className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                9. معاينة المنتج الحية للعميل (Storefront PDP Preview)
              </h3>
              <span className="text-[11px] font-bold bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-300 px-2.5 py-0.5 rounded-full">
                الخطوة 9 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              هكذا ستظهر صفحة منتجك تماماً للمشترين على متجر سوق دسوق عبر الموبايل والكمبيوتر.
            </p>
          </div>
        </div>
      </div>

      {/* Product Details Simulation */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-8">
        {/* Top Breadcrumb */}
        <div className="text-xs text-zinc-500 flex items-center gap-2">
          <span>الرئيسية</span>
          <span>/</span>
          <span>{schema.categoryNameAr}</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-xs">
            {formData.titleAr || 'عنوان المنتج'}
          </span>
        </div>

        {/* PDP Layout: Image Gallery + Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Gallery Col (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-inner">
              <img
                src={activeImage}
                alt={formData.titleAr}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 right-4 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                  وفر {discountPercent}%
                </span>
              )}
              {formData.isDesoqLocalMade && (
                <span className="absolute top-4 left-4 bg-amber-500 text-zinc-900 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>صنع في دسوق 🌿</span>
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {formData.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {formData.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      selectedImageIndex === idx ? 'border-[#800020] ring-2 ring-[#800020]/20' : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Col (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            {/* Brand & Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#800020] dark:text-amber-400 bg-rose-50 dark:bg-zinc-700 px-3 py-1 rounded-full">
                {formData.brand || 'سوق دسوق الرسمي'}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.9 (منتج جديد وموثق)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 leading-snug">
              {formData.titleAr || 'اسم وعنوان المنتج التجريبي'}
            </h1>

            {/* Price Box */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#800020] dark:text-amber-400">
                {price > 0 ? `${price.toLocaleString()} ج.م` : 'السعر يحدد لاحقاً'}
              </span>
              {origPrice > price && (
                <span className="text-sm font-mono text-zinc-400 line-through">
                  {origPrice.toLocaleString()} ج.م
                </span>
              )}
              {formData.vatIncluded && (
                <span className="text-[11px] text-zinc-500 font-medium">
                  (شامل ضريبة القيمة المضافة)
                </span>
              )}
            </div>

            {/* Variant Selector (if has variations) */}
            {formData.hasVariations && formData.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                  الخيارات والمقاسات المتوفرة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {v.title.replace(formData.titleAr || '', '').replace(' - ', '') || v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Highlights */}
            {formData.bulletPoints.length > 0 && (
              <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                {formData.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-700/80 text-center text-[11px]">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                  {formData.fulfillmentMethod === 'FBD' ? 'شحن إكسبريس' : 'شحن سريع'}
                </span>
                <span className="text-zinc-500 text-[10px]">خلال 24-48 ساعة</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                <RotateCcw className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                  استرجاع {formData.returnPolicyDays} يوماً
                </span>
                <span className="text-zinc-500 text-[10px]">وفق القانون 181/2018</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                  ضمان أصالة
                </span>
                <span className="text-zinc-500 text-[10px]">فحص ومطابقة 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Specifications Table */}
        {Object.keys(formData.dynamicAttributes).length > 0 && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-700/80 space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              المواصفات الفنية والتفاصيل (Specifications)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(formData.dynamicAttributes).map(([key, val]) => {
                const field = schema.specificAttributes.find(f => f.id === key);
                if (!field || !val) return null;
                let displayVal = val;
                if (field.options) {
                  const opt = field.options.find(o => o.value === val);
                  if (opt) displayVal = opt.labelAr;
                }
                return (
                  <div key={key} className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex justify-between">
                    <span className="font-semibold text-zinc-500">{field.labelAr}:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{displayVal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Description Section */}
        {formData.descriptionAr && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-700/80 space-y-2">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              الوصف الكامل للمنتج
            </h4>
            <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              {formData.descriptionAr}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
