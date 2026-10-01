import React, { useState } from 'react';
import { 
  AlignLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle2, 
  HelpCircle, 
  Info,
  Layers,
  Wand2
} from 'lucide-react';
import { ListingFormData } from './types';
import { getCategoryListingSchema } from './CategorySchemas';

interface Step7DescriptionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

export const Step7Description: React.FC<Step7DescriptionProps> = ({
  formData,
  setFormData
}) => {
  const schema = getCategoryListingSchema(formData.category);
  const [bulletInput, setBulletInput] = useState('');

  const handleDynamicAttrChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicAttributes: {
        ...prev.dynamicAttributes,
        [fieldId]: value
      }
    }));
  };

  const handleAddBulletPoint = () => {
    if (bulletInput.trim() && formData.bulletPoints.length < 6) {
      setFormData(prev => ({
        ...prev,
        bulletPoints: [...prev.bulletPoints, bulletInput.trim()]
      }));
      setBulletInput('');
    }
  };

  const handleRemoveBulletPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
    }));
  };

  // Helper AI Template generator based on selected category & attributes
  const handleGenerateTemplateDescription = () => {
    let desc = `${formData.titleAr || 'المنتج'}\n\n`;
    desc += `المواصفات والمميزات الرئيسية:\n`;
    if (formData.brand) desc += `• العلامة التجارية: ${formData.brand}\n`;
    if (formData.isDesoqLocalMade) desc += `• صناعة يدوية وتراثية معتمدة من مدينة دسوق بمحافظة كفر الشيخ 🌿\n`;

    Object.entries(formData.dynamicAttributes).forEach(([key, val]) => {
      const field = schema.specificAttributes.find(f => f.id === key);
      if (field && val) {
        let displayVal = val;
        if (field.options) {
          const opt = field.options.find(o => o.value === val);
          if (opt) displayVal = opt.labelAr;
        }
        desc += `• ${field.labelAr}: ${displayVal}\n`;
      }
    });

    if (formData.warranty) desc += `• الضمان: ${formData.warranty}\n`;
    desc += `\nتعليمات الاستخدام والحفظ:\nيرجى اتباع إرشادات العناية المرفقة مع المنتج للحفاظ على جودته ورونقه لأطول فترة ممكنة.`;

    setFormData(prev => ({
      ...prev,
      descriptionAr: desc
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-description-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-teal-50 via-teal-50/40 to-emerald-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-teal-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlignLeft className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                7. الوصف والمواصفات الديناميكية (Description & Dynamic Fields)
              </h3>
              <span className="text-[11px] font-bold bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300 px-2.5 py-0.5 rounded-full">
                الخطوة 7 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              تعتمد الحقول أدناه تلقائياً على تصنيف <strong>"{schema.categoryNameAr}"</strong> لجمع أدق المواصفات التقنية وتسهيل عثور المشترين عليها.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Category Specific Attributes */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-700/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#800020] dark:text-amber-400" />
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              المواصفات الفنية الخاصة بتصنيف ({schema.categoryNameAr})
            </h4>
          </div>
          <span className="text-xs text-zinc-500">
            {schema.specificAttributes.length} حقول مواصفات ذكية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schema.specificAttributes.map((attr) => {
            const val = formData.dynamicAttributes[attr.id] || '';

            if (attr.type === 'select') {
              return (
                <div key={attr.id} className="space-y-1.5">
                  <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>{attr.labelAr}</span>
                    {attr.required && <span className="text-rose-600 font-bold">*</span>}
                  </label>
                  <select
                    id={`attr-${attr.id}`}
                    value={val}
                    onChange={(e) => handleDynamicAttrChange(attr.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs"
                  >
                    <option value="">-- اختر {attr.labelAr} --</option>
                    {attr.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.labelAr}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (attr.type === 'number') {
              return (
                <div key={attr.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span>{attr.labelAr}</span>
                      {attr.required && <span className="text-rose-600 font-bold">*</span>}
                    </label>
                    {attr.unitAr && (
                      <span className="text-[11px] text-zinc-500">{attr.unitAr}</span>
                    )}
                  </div>
                  <input
                    id={`attr-${attr.id}`}
                    type="number"
                    value={val}
                    onChange={(e) => handleDynamicAttrChange(attr.id, e.target.value)}
                    placeholder={attr.placeholderAr || ''}
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                  />
                </div>
              );
            }

            return (
              <div key={attr.id} className="space-y-1.5">
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <span>{attr.labelAr}</span>
                  {attr.required && <span className="text-rose-600 font-bold">*</span>}
                </label>
                <input
                  id={`attr-${attr.id}`}
                  type="text"
                  value={val}
                  onChange={(e) => handleDynamicAttrChange(attr.id, e.target.value)}
                  placeholder={attr.placeholderAr || ''}
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs"
                />
              </div>
            );
          })}
        </div>

        {/* Bullet Points */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#800020] dark:text-amber-400" />
            <span>أهم مميزات ونقاط البيع البارزة (Bullet Points)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="bullet-point-input"
              type="text"
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBulletPoint();
                }
              }}
              placeholder="مثال: نسيج ناعم مسامي مريح للاستخدام اليومي"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs"
            />
            <button
              type="button"
              onClick={handleAddBulletPoint}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 text-white dark:bg-zinc-700 hover:bg-zinc-900 font-bold text-xs cursor-pointer"
            >
              إضافة نقطة
            </button>
          </div>

          {formData.bulletPoints.length > 0 && (
            <ul className="space-y-2 pt-2">
              {formData.bulletPoints.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{bullet}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBulletPoint(idx)}
                    className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Arabic Long Description */}
        <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <div className="flex items-center justify-between">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>الوصف التفصيلي للمنتج بالعربية</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerateTemplateDescription}
              className="text-xs font-bold text-[#800020] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>توليد وصف تلقائي بناءً على المواصفات</span>
            </button>
          </div>
          <textarea
            id="product-description-ar-textarea"
            rows={6}
            value={formData.descriptionAr}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
            placeholder="اكتب وصفاً شاملاً يوضح تفاصيل المنتج، كيفية الاستخدام، والمميزات التنافسية..."
            className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#800020]"
          />
        </div>
      </div>
    </div>
  );
};
