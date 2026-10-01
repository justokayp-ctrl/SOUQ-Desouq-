import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Sparkles, 
  Layers, 
  Sliders, 
  RefreshCw,
  Coins,
  PackageCheck
} from 'lucide-react';
import { ListingFormData } from './types';
import { ProductVariant } from '../../../types';
import { getCategoryListingSchema } from './CategorySchemas';

interface Step4VariantsProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

const COMMON_SIZES = [
  'S (سمول)', 'M (ميديام)', 'L (لارج)', 'XL (إكس لارج)', '2XL', '3XL', '4XL',
  '48 (بدلة)', '50 (بدلة)', '52 (بدلة)', '54 (بدلة)', '56 (بدلة)', '58 (بدلة)',
  '38 (حذاء)', '39', '40', '41', '42', '43', '44', '45', '46'
];

const COMMON_COLORS = [
  { nameAr: 'أسود ملكي', hex: '#18181b' },
  { nameAr: 'أبيض ناصع', hex: '#ffffff' },
  { nameAr: 'كحلي ليلي', hex: '#1e3a8a' },
  { nameAr: 'رمادي فحمي', hex: '#4b5563' },
  { nameAr: 'نبيتي عنابي', hex: '#800020' },
  { nameAr: 'زيتي عسكري', hex: '#3f6212' },
  { nameAr: 'بيج رملي', hex: '#d4b996' },
  { nameAr: 'أزرق بترولي', hex: '#0e7490' },
  { nameAr: 'بني عسلي', hex: '#78350f' }
];

const COMMON_VOLUMES = [
  'ربع تولة (3 مل)',
  'نصف تولة (6 مل)',
  'تولة كاملة (12 مل)',
  'زجاجة 30 مل',
  'زجاجة 50 مل',
  'زجاجة 100 مل',
  'زجاجة 200 مل'
];

const COMMON_STYLES = [
  'قطعة فردية (Single)',
  'طقم قطعتين (2-Pack)',
  'طقم 3 قطع (3-Pack)',
  'صندوق هدايا فاخر (Gift Box)'
];

export const Step4Variants: React.FC<Step4VariantsProps> = ({
  formData,
  setFormData
}) => {
  const schema = getCategoryListingSchema(formData.category);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#800020');
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');

  // Auto-generate variants from selected options
  const handleGenerateMatrix = () => {
    const baseSku = formData.sku || 'DSQ-' + Math.floor(1000 + Math.random() * 9000);
    const basePrice = Number(formData.priceEGP) || 299;
    const baseStock = formData.stock > 0 ? Math.floor(formData.stock / Math.max(1, (formData.selectedSizes.length || 1) * (formData.selectedColors.length || 1))) : 10;

    const newVariants: ProductVariant[] = [];

    if (formData.variationTheme === 'size' && formData.selectedSizes.length > 0) {
      formData.selectedSizes.forEach((sz, idx) => {
        const cleanSz = sz.split(' ')[0];
        newVariants.push({
          id: `var-${Date.now()}-${idx}`,
          title: `${formData.titleAr || 'المنتج'} - مقاس ${sz}`,
          sku: `${baseSku}-${cleanSz}`,
          priceEGP: basePrice,
          stock: baseStock,
          size: sz
        });
      });
    } else if (formData.variationTheme === 'color' && formData.selectedColors.length > 0) {
      formData.selectedColors.forEach((col, idx) => {
        newVariants.push({
          id: `var-${Date.now()}-${idx}`,
          title: `${formData.titleAr || 'المنتج'} - لون ${col.nameAr}`,
          sku: `${baseSku}-${idx + 1}`,
          priceEGP: basePrice,
          stock: baseStock,
          color: col.nameAr
        });
      });
    } else if (formData.variationTheme === 'size_color' && formData.selectedSizes.length > 0 && formData.selectedColors.length > 0) {
      let count = 0;
      formData.selectedSizes.forEach(sz => {
        const cleanSz = sz.split(' ')[0];
        formData.selectedColors.forEach(col => {
          count++;
          newVariants.push({
            id: `var-${Date.now()}-${count}`,
            title: `${formData.titleAr || 'المنتج'} - ${sz} / ${col.nameAr}`,
            sku: `${baseSku}-${cleanSz}-${count}`,
            priceEGP: basePrice,
            stock: baseStock,
            size: sz,
            color: col.nameAr
          });
        });
      });
    } else if (formData.variationTheme === 'volume' && formData.selectedVolumes.length > 0) {
      formData.selectedVolumes.forEach((vol, idx) => {
        newVariants.push({
          id: `var-${Date.now()}-${idx}`,
          title: `${formData.titleAr || 'المنتج'} - ${vol}`,
          sku: `${baseSku}-VOL${idx + 1}`,
          priceEGP: basePrice,
          stock: baseStock,
          size: vol
        });
      });
    } else if (formData.variationTheme === 'pack_size' && formData.selectedStyles.length > 0) {
      formData.selectedStyles.forEach((st, idx) => {
        newVariants.push({
          id: `var-${Date.now()}-${idx}`,
          title: `${formData.titleAr || 'المنتج'} - ${st}`,
          sku: `${baseSku}-PK${idx + 1}`,
          priceEGP: basePrice,
          stock: baseStock,
          size: st
        });
      });
    }

    if (newVariants.length > 0) {
      setFormData(prev => ({
        ...prev,
        variants: newVariants
      }));
    }
  };

  const handleToggleSize = (size: string) => {
    setFormData(prev => {
      const exists = prev.selectedSizes.includes(size);
      const nextSizes = exists ? prev.selectedSizes.filter(s => s !== size) : [...prev.selectedSizes, size];
      return { ...prev, selectedSizes: nextSizes };
    });
  };

  const handleToggleColor = (color: { nameAr: string; hex: string }) => {
    setFormData(prev => {
      const exists = prev.selectedColors.some(c => c.nameAr === color.nameAr);
      const nextColors = exists
        ? prev.selectedColors.filter(c => c.nameAr !== color.nameAr)
        : [...prev.selectedColors, color];
      return { ...prev, selectedColors: nextColors };
    });
  };

  const handleToggleVolume = (vol: string) => {
    setFormData(prev => {
      const exists = prev.selectedVolumes.includes(vol);
      const next = exists ? prev.selectedVolumes.filter(v => v !== vol) : [...prev.selectedVolumes, vol];
      return { ...prev, selectedVolumes: next };
    });
  };

  const handleToggleStyle = (st: string) => {
    setFormData(prev => {
      const exists = prev.selectedStyles.includes(st);
      const next = exists ? prev.selectedStyles.filter(s => s !== st) : [...prev.selectedStyles, st];
      return { ...prev, selectedStyles: next };
    });
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleApplyBulkPrice = () => {
    const val = Number(bulkPrice);
    if (!isNaN(val) && val > 0) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => ({ ...v, priceEGP: val }))
      }));
      setBulkPrice('');
    }
  };

  const handleApplyBulkStock = () => {
    const val = Number(bulkStock);
    if (!isNaN(val) && val >= 0) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => ({ ...v, stock: val }))
      }));
      setBulkStock('');
    }
  };

  // Check for duplicate SKUs
  const skuCounts = formData.variants.reduce((acc, v) => {
    acc[v.sku] = (acc[v.sku] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-variants-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-purple-50 via-purple-50/40 to-fuchsia-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-purple-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                4. المتغيرات والخيارات (Variants & Matrix)
              </h3>
              <span className="text-[11px] font-bold bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
                الخطوة 4 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              إنشاء مصفوفة الخيارات (المقاسات، الألوان، الأحجام، التغليف) مع تعيين SKU مستقل وسعر وكمية مخزون لكل متغير على حدة.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* Toggle Variations */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
              هل يحتوي هذا المنتج على مقاسات أو ألوان أو أحجام متعددة؟
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              تفعيل هذا الخيار ينشئ جدول متغيرات بمخزون وأسعار مخصصة
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="has-variations-toggle"
              type="checkbox"
              checked={formData.hasVariations}
              onChange={(e) => setFormData(prev => ({ ...prev, hasVariations: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
          </label>
        </div>

        {formData.hasVariations ? (
          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                نوع مصفوفة التفرع (Variation Theme)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'size_color', label: 'مقاس + لون (Size & Color)' },
                  { id: 'size', label: 'مقاس فقط (Size Only)' },
                  { id: 'color', label: 'لون فقط (Color Only)' },
                  { id: 'volume', label: 'حجم / سعة (Volume / Size)' },
                  { id: 'pack_size', label: 'حجم عبوة / نمط (Pack Size)' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, variationTheme: t.id as any }))}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      formData.variationTheme === t.id
                        ? 'border-[#800020] bg-rose-50/60 dark:bg-zinc-700 text-[#800020] dark:text-amber-300 ring-2 ring-[#800020]/20'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Picker (if size or size_color) */}
            {(formData.variationTheme === 'size' || formData.variationTheme === 'size_color') && (
              <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                  1. اختر المقاسات المتوفرة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SIZES.map(sz => {
                    const isSelected = formData.selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#800020] text-white border-[#800020]'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors Picker (if color or size_color) */}
            {(formData.variationTheme === 'color' || formData.variationTheme === 'size_color') && (
              <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                  2. اختر الألوان المتوفرة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_COLORS.map(col => {
                    const isSelected = formData.selectedColors.some(c => c.nameAr === col.nameAr);
                    return (
                      <button
                        key={col.nameAr}
                        type="button"
                        onClick={() => handleToggleColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#800020] text-white border-[#800020]'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.nameAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Volumes Picker (if volume) */}
            {formData.variationTheme === 'volume' && (
              <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                  اختر الأحجام أو السعات المتاحة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_VOLUMES.map(vol => {
                    const isSelected = formData.selectedVolumes.includes(vol);
                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => handleToggleVolume(vol)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#800020] text-white border-[#800020]'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {vol}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Styles Picker (if pack_size) */}
            {formData.variationTheme === 'pack_size' && (
              <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <label className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block">
                  اختر أحجام العبوات / الباقات:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_STYLES.map(st => {
                    const isSelected = formData.selectedStyles.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleToggleStyle(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#800020] text-white border-[#800020]'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matrix Generator Button */}
            <div className="flex items-center justify-between p-4 bg-purple-50/70 dark:bg-zinc-900/70 rounded-2xl border border-purple-200 dark:border-zinc-700">
              <div>
                <span className="font-bold text-xs text-purple-900 dark:text-purple-300 block">
                  توليد مصفوفة المتغيرات تلقائياً
                </span>
                <span className="text-[11px] text-zinc-500">
                  سيتم إنشاء توليفات SKU والأسعار والمخزون بناء على الخيارات المختارة أعلاه
                </span>
              </div>
              <button
                type="button"
                id="generate-variants-matrix-btn"
                onClick={handleGenerateMatrix}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>توليد المصفوفة</span>
              </button>
            </div>

            {/* Bulk Actions & Variant Table */}
            {formData.variants.length > 0 && (
              <div className="space-y-4 pt-2">
                {/* Bulk Apply Row */}
                <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    تطبيق جماعي (Bulk Edit):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="السعر (ج.م)"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                      className="w-24 px-2 py-1 bg-white dark:bg-zinc-800 border rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyBulkPrice}
                      className="px-2.5 py-1 bg-zinc-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      تطبيق السعر
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="المخزون"
                      value={bulkStock}
                      onChange={(e) => setBulkStock(e.target.value)}
                      className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyBulkStock}
                      className="px-2.5 py-1 bg-zinc-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      تطبيق المخزون
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-700">
                      <tr>
                        <th className="p-3">المتغير / التوليفة</th>
                        <th className="p-3">رمز SKU</th>
                        <th className="p-3">السعر (ج.م)</th>
                        <th className="p-3">المخزون</th>
                        <th className="p-3">الباركود</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                      {formData.variants.map((variant, idx) => {
                        const isDuplicateSku = skuCounts[variant.sku] > 1;
                        return (
                          <tr key={variant.id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                            <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                              {variant.title}
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                                className={`w-32 px-2 py-1 border rounded-lg font-mono text-xs ${
                                  isDuplicateSku ? 'border-rose-500 bg-rose-50 text-rose-900' : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900'
                                }`}
                              />
                              {isDuplicateSku && (
                                <span className="text-[10px] text-rose-600 block mt-0.5">SKU مكرر!</span>
                              )}
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={variant.priceEGP}
                                onChange={(e) => handleUpdateVariant(idx, 'priceEGP', Number(e.target.value))}
                                className="w-20 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 font-bold text-xs"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => handleUpdateVariant(idx, 'stock', Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-xs"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={variant.barcode || ''}
                                onChange={(e) => handleUpdateVariant(idx, 'barcode', e.target.value)}
                                placeholder="EAN-13"
                                className="w-28 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 font-mono text-[11px]"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs">
            المنتج قطعه واحدة بدون متغيرات. سيتم استخدام السعر والمخزون الأساسيين من الخطوة التالية مباشرة.
          </div>
        )}
      </div>
    </div>
  );
};
