import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Share2, 
  Sparkles, 
  Tag, 
  ExternalLink, 
  CheckCircle2, 
  Eye,
  Hash,
  Copy
} from 'lucide-react';
import { ListingFormData } from './types';

interface Step8SeoProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

export const Step8Seo: React.FC<Step8SeoProps> = ({
  formData,
  setFormData
}) => {
  const [keywordInput, setKeywordInput] = useState('');

  // Auto-generate initial slug if empty
  useEffect(() => {
    if (!formData.slug && formData.titleAr) {
      const generatedSlug = formData.titleAr
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 70);
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug,
        metaTitle: prev.metaTitle || `${prev.titleAr} | سوق دسوق`,
        metaDescription: prev.metaDescription || (prev.shortSummary || prev.descriptionAr.slice(0, 150))
      }));
    }
  }, [formData.titleAr]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.searchTerms.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        searchTerms: [...prev.searchTerms, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (term: string) => {
    setFormData(prev => ({
      ...prev,
      searchTerms: prev.searchTerms.filter(t => t !== term)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-seo-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-orange-50 via-orange-50/40 to-amber-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-orange-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                8. تحسين محركات البحث والسوشيال ميديا (SEO & OpenGraph)
              </h3>
              <span className="text-[11px] font-bold bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 px-2.5 py-0.5 rounded-full">
                الخطوة 8 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              تخصيص رابط المنتج (URL Slug)، عنوان ووصف نتائج بحث Google، وصورة المعاينة عند مشاركة الرابط على واتساب وفيسبوك.
            </p>
          </div>
        </div>
      </div>

      {/* Main Box */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* URL Slug */}
        <div className="space-y-2">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>رابط صفحة المنتج المخصص (URL Slug)</span>
          </label>
          <div className="flex items-center rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden focus-within:ring-2 focus-within:ring-[#800020]">
            <span className="px-4 text-xs font-mono text-zinc-400 dark:text-zinc-500 select-none" dir="ltr">
              souqdesoq.com/p/
            </span>
            <input
              id="product-slug-input"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="men-cotton-shirt-white"
              className="flex-1 py-2.5 px-2 bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Meta Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>عنوان صفحة البحث (Meta Title)</span>
            </label>
            <span className={`text-xs font-semibold ${
              formData.metaTitle.length > 60 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {formData.metaTitle.length} / 60 حرفاً
            </span>
          </div>
          <input
            id="product-meta-title-input"
            type="text"
            value={formData.metaTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
            placeholder={`${formData.titleAr || 'اسم المنتج'} | سوق دسوق`}
            className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>وصف نتيجة البحث (Meta Description)</span>
            </label>
            <span className={`text-xs font-semibold ${
              formData.metaDescription.length > 160 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {formData.metaDescription.length} / 160 حرفاً
            </span>
          </div>
          <textarea
            id="product-meta-description-textarea"
            rows={2}
            value={formData.metaDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
            placeholder="اشتر الآن بأفضل سعر مع ضمان أصالة وجودة وتوصيل سريع لجميع المحافظات..."
            className="w-full p-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>

        {/* Search Terms */}
        <div className="space-y-2">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-orange-600" />
            <span>الكلمات المفتاحية والبحثية (Search Keywords)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="search-term-input"
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              placeholder="اكتب كلمة بحث (مثال: قطن مصري، بدلة رجالي، شحن مجاني)"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 text-white dark:bg-zinc-700 hover:bg-zinc-900 font-bold text-xs cursor-pointer"
            >
              إضافة
            </button>
          </div>
          {formData.searchTerms.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.searchTerms.map(term => (
                <span
                  key={term}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-zinc-700 text-orange-900 dark:text-orange-300 text-xs font-semibold border border-orange-200 dark:border-zinc-600"
                >
                  <Hash className="w-3 h-3 text-orange-500" />
                  <span>{term}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(term)}
                    className="text-orange-400 hover:text-rose-600 ml-1 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Live Google Search Preview */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>معاينة حية لنتيجة البحث على Google (SERP Preview):</span>
          </span>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="w-4 h-4 rounded-full bg-[#800020] text-white flex items-center justify-center text-[9px] font-bold">
                س
              </span>
              <span>سوق دسوق &gt; p &gt; {formData.slug || 'product-slug'}</span>
            </div>
            <h5 className="font-sans text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer">
              {formData.metaTitle || formData.titleAr || 'عنوان المنتج على سوق دسوق'}
            </h5>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-normal line-clamp-2">
              {formData.metaDescription || formData.shortSummary || formData.descriptionAr.slice(0, 150) || 'شراء اونلاين بأفضل الأسعار وضمان الجودة...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
