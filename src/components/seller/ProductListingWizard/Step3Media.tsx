import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  Video, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ListingFormData, ImageValidationResult } from './types';
import { getCategoryListingSchema } from './CategorySchemas';

interface Step3MediaProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

const CATEGORY_IMAGE_PRESETS: Record<string, { label: string; url: string }[]> = {
  'men_fashion': [
    { label: 'بدلة كلاسيك إيطالي فاخرة', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80' },
    { label: 'قميص قطن مصري ناصع', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80' },
    { label: 'بليزر كاجوال عصري', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80' }
  ],
  'women_fashion': [
    { label: 'عباية كريب سعودي ملكي', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80' },
    { label: 'فستان سواريه سهرة محتشم', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80' },
    { label: 'دريس كاجوال أنيق للمحجبات', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80' }
  ],
  'perfumes_fragrances': [
    { label: 'عطر شرقي نيش زجاجة فاخرة', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900&auto=format&fit=crop&q=80' },
    { label: 'تولة دهن عود ومسك أصلي', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&auto=format&fit=crop&q=80' }
  ],
  'shoes_bags': [
    { label: 'حذاء كلاسيك جلد طبيعي', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&auto=format&fit=crop&q=80' },
    { label: 'سنيكرز عصري كاجوال', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&auto=format&fit=crop&q=80' }
  ],
  'desoq_delicacies': [
    { label: 'فسيخ دسوقي سمن بلدي فاكيوم', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=900&auto=format&fit=crop&q=80' },
    { label: 'حلويات وبسبوسة دسوقية طازجة', url: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=900&auto=format&fit=crop&q=80' }
  ],
  'heritage_crafts': [
    { label: 'كليم يدوي صوف طبيعي أصيل', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=900&auto=format&fit=crop&q=80' }
  ],
  'default': [
    { label: 'صورة عرض عالية الدقة', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80' },
    { label: 'صورة تفاصيل وخامات', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80' }
  ]
};

export const Step3Media: React.FC<Step3MediaProps> = ({
  formData,
  setFormData
}) => {
  const schema = getCategoryListingSchema(formData.category);
  const presets = CATEGORY_IMAGE_PRESETS[formData.category] || CATEGORY_IMAGE_PRESETS['default'];

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate format and add URL
  const handleAddImageUrl = () => {
    setValidationError(null);
    const url = imageUrlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) {
      setValidationError('يرجى إدخال رابط صورة صحيح يبدأ بـ https://');
      return;
    }

    if (formData.images.includes(url)) {
      setValidationError('هذه الصورة مضافة بالفعل في المعرض');
      return;
    }

    if (formData.images.length >= 8) {
      setValidationError('الحد الأقصى لعدد الصور هو 8 صور');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
    setImageUrlInput('');
  };

  // Set Primary Image
  const handleSetPrimary = (index: number) => {
    setFormData(prev => {
      const selected = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: [selected, ...rest],
        primaryImageIndex: 0
      };
    });
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Add Preset Image
  const handleAddPreset = (url: string) => {
    if (!formData.images.includes(url) && formData.images.length < 8) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  // Local File Upload Simulation with Format & Size checks
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach((file) => {
      if (!allowedFormats.includes(file.type)) {
        setValidationError(`الصيغة ${file.type} غير مدعومة. الصيغ المسموحة: JPEG, PNG, WEBP, AVIF`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setValidationError(`حجم الصورة ${file.name} يتجاوز 10 ميجابايت.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && !formData.images.includes(result) && formData.images.length < 8) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-media-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-rose-50 via-rose-50/40 to-pink-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-rose-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                3. الصور والوسائط (Media & Imagery)
              </h3>
              <span className="text-[11px] font-bold bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                الخطوة 3 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              أضف صوراً احترافية عالية الدقة (صورة الغلاف الأولى، صور الزوايا والتفاصيل، وصورة جدول المقاسات).
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload / Drop */}
          <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#800020] hover:bg-rose-50/20 dark:hover:bg-zinc-800 transition-all group">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileUpload}
              className="sr-only"
            />
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center group-hover:bg-[#800020] group-hover:text-white transition-all mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              اسحب الصور هنا أو اضغط للاختيار من جهازك
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              صيغ مدعومة: JPG, PNG, WEBP, AVIF (بحد أقصى 10 ميجابايت للصورة)
            </span>
          </label>

          {/* URL Input */}
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block mb-1">
                إضافة صورة عبر رابط ويب مباشر (URL)
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                ألصق رابط صورة CDN أو صورة استضافة سحابية خارجية
              </p>
              <input
                id="media-url-input"
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-xs font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="mt-3 w-full py-2.5 rounded-2xl bg-[#800020] text-white font-bold text-xs hover:bg-[#600018] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج رابط الصورة</span>
            </button>
          </div>
        </div>

        {/* Current Gallery */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>معرض صور المنتج الحالي</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {formData.images.length} / 8 صور
              </span>
            </label>
            {formData.images.length === 0 && (
              <span className="text-xs text-rose-600 font-bold">مطلوب صورة واحدة على الأقل</span>
            )}
          </div>

          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images.map((img, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-2xl overflow-hidden border-2 group bg-zinc-100 dark:bg-zinc-900 aspect-square ${
                      isPrimary ? 'border-[#800020] shadow-md ring-2 ring-[#800020]/20' : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <div className="absolute top-2 right-2 bg-[#800020] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        <span>الصورة الرئيسية (Cover)</span>
                      </div>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          title="تعيين كصورة رئيسية"
                          className="p-2 rounded-xl bg-white text-zinc-900 hover:bg-amber-100 hover:text-amber-800 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="حذف الصورة"
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs">
              لم يتم إضافة صور حتى الآن. اختر من النماذج المقترحة بالأسفل أو ارفع صورك الخاصة.
            </div>
          )}
        </div>

        {/* Category Image Presets */}
        {presets.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
            <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#800020] dark:text-amber-400" />
              <span>نماذج صور سريعة عالية الدقة لتصنيف ({schema.categoryNameAr}):</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset.url)}
                  disabled={formData.images.includes(preset.url)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    formData.images.includes(preset.url)
                      ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 border-zinc-200 dark:border-zinc-600 cursor-not-allowed'
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-[#800020]'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Video URL */}
        <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            <span>رابط فيديو للمنتج (YouTube / Vimeo / Cloud) - اختياري</span>
          </label>
          <input
            id="product-video-url-input"
            type="url"
            value={formData.videoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
};
