import React, { useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Tag, 
  Award, 
  HelpCircle,
  Hash,
  ShieldAlert
} from 'lucide-react';
import { ListingFormData, TitleQualityAnalysis } from './types';

interface Step1BasicInfoProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

const BANNED_TITLE_WORDS = [
  'أفضل', 'أرخص', 'الأول', 'تخفيض هائل', 'ببلاش', 'مجانا', '100% مضمون', 'رقم 1', 'مضمون'
];

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  setFormData
}) => {
  const [tagInput, setTagInput] = React.useState('');

  // Title Quality Analysis
  const titleAnalysis: TitleQualityAnalysis = useMemo(() => {
    const title = formData.titleAr || '';
    const charCount = title.trim().length;

    const hasBrand = !!formData.brand && title.toLowerCase().includes(formData.brand.toLowerCase());
    const hasCategory = title.toLowerCase().includes(formData.productType?.toLowerCase() || '') || title.toLowerCase().includes(formData.category.toLowerCase());
    const hasSpec = charCount > 25;

    const bannedFound = BANNED_TITLE_WORDS.filter((word) => title.includes(word));
    const hasBannedWords = bannedFound.length > 0;

    const suggestions: string[] = [];
    let score = 0;

    if (charCount >= 20 && charCount <= 120) {
      score += 40;
    } else if (charCount < 20) {
      suggestions.push('العنوان قصير جداً. ننصح بذكر الخامة أو الموديل لتحسين ظهورك في بحث سوق دسوق.');
      score += Math.min(20, charCount * 2);
    } else {
      suggestions.push('العنوان طويل جداً (أكثر من 120 حرفاً). اجعله مركزاً لتسهيل قراءته على الموبايل.');
      score += 25;
    }

    if (hasBrand) {
      score += 20;
    } else {
      suggestions.push(`أضف اسم علامتك التجارية "${formData.brand || 'الماركة'}" في بداية العنوان.`);
    }

    if (hasCategory || formData.productType) {
      score += 20;
    } else {
      suggestions.push('حدد نوع السلعة بوضوح داخل العنوان (مثل: قميص، فستان، عطر).');
    }

    if (hasSpec) {
      score += 20;
    }

    if (hasBannedWords) {
      score = Math.max(10, score - 30);
      suggestions.push(`تجنب الكلمات التسويقية العامة: (${bannedFound.join('، ')}) لتفادي رفض المنتج.`);
    }

    return {
      score: Math.min(100, score),
      charCount,
      hasBrand,
      hasCategory,
      hasSpec,
      hasBannedWords,
      bannedWordsFound: bannedFound,
      suggestionsAr: suggestions
    };
  }, [formData.titleAr, formData.brand, formData.productType, formData.category]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-basic-info-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-amber-50 via-amber-50/50 to-orange-50/40 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-amber-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                1. المعلومات الأساسية وهيكل المنتج (Basic Information)
              </h3>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                الخطوة 1 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              ابدأ بكتابة عنوان تسويقي دقيق، تحديد اسم العلامة التجارية أو اسم متجرك، وتوثيق شارة الصناعة والحرفية الدسوقية.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* Title AR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>عنوان المنتج بالعربية</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <span className={`text-xs font-semibold ${
              formData.titleAr.length < 15 ? 'text-amber-600' : formData.titleAr.length > 150 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {formData.titleAr.length} / 150 حرفاً
            </span>
          </div>
          <input
            id="product-title-ar-input"
            type="text"
            value={formData.titleAr}
            onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
            placeholder="مثال: قميص رجالي قطن مصري 100% طويل التيلة سليم فيت أبيض ناصع"
            className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
          />

          {/* Title Quality Meter */}
          <div className="bg-zinc-50 dark:bg-zinc-900/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#800020] dark:text-amber-400" />
                <span>مؤشر جودة العنوان التسويقي:</span>
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                titleAnalysis.score >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                titleAnalysis.score >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {titleAnalysis.score}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  titleAnalysis.score >= 80 ? 'bg-emerald-500' :
                  titleAnalysis.score >= 50 ? 'bg-amber-500' :
                  'bg-rose-500'
                }`}
                style={{ width: `${titleAnalysis.score}%` }}
              />
            </div>
            {titleAnalysis.suggestionsAr.length > 0 && (
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 mt-2">
                {titleAnalysis.suggestionsAr.map((sug, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Title EN (Optional) */}
        <div className="space-y-2">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>عنوان المنتج بالإنجليزية (اختياري)</span>
            <span className="text-xs text-zinc-500 font-normal">English Title</span>
          </label>
          <input
            id="product-title-en-input"
            type="text"
            dir="ltr"
            value={formData.titleEn}
            onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
            placeholder="e.g. Men's Egyptian Long-Staple Cotton Slim Fit Dress Shirt - Pure White"
            className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-sans"
          />
        </div>

        {/* Brand & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>العلامة التجارية / الماركة</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              id="product-brand-input"
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="مثال: منسوجات دسوق الفاخرة"
              className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>رقم الموديل / المرجع</span>
              <span className="text-xs text-zinc-500 font-normal">(Model / Reference No)</span>
            </label>
            <input
              id="product-model-input"
              type="text"
              value={formData.modelNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, modelNumber: e.target.value }))}
              placeholder="مثال: DSQ-2026-SH01"
              className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>
        </div>

        {/* Short Summary */}
        <div className="space-y-2">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>نبذة تسويقية سريعة (Short Summary)</span>
          </label>
          <input
            id="product-short-summary-input"
            type="text"
            value={formData.shortSummary}
            onChange={(e) => setFormData(prev => ({ ...prev, shortSummary: e.target.value }))}
            placeholder="مثال: قميص قطني فاخر مناسب للمناسبات الرسمية والعمل بضمان أصالة الخيوط"
            className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
          />
        </div>

        {/* Desoq Local Craft Toggle */}
        <div className="p-4 bg-amber-50/70 dark:bg-zinc-900/70 rounded-2xl border border-amber-200/80 dark:border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                منتج محلي / صناعة دسوقية وتراثية معتمدة 🌿
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 block">
                تمنح منتجك شارة "صنع في دسوق" المميزة مع أولوية الظهور في واجهة السوق
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="product-desoq-local-toggle"
              type="checkbox"
              checked={formData.isDesoqLocalMade}
              onChange={(e) => setFormData(prev => ({ ...prev, isDesoqLocalMade: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
          </label>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#800020] dark:text-amber-400" />
            <span>وسوم وتصنيفات فرعية سريعة (Tags)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="product-tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="اكتب وسماً ثم اضغط Enter (مثال: قطن مصري، صيف 2026)"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 text-white dark:bg-zinc-700 hover:bg-zinc-900 font-bold text-sm cursor-pointer"
            >
              إضافة
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold"
                >
                  <Hash className="w-3 h-3 text-zinc-500" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-zinc-400 hover:text-rose-600 ml-1 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
