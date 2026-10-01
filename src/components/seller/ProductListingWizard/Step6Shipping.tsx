import React from 'react';
import { 
  Truck, 
  Package, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Maximize2, 
  Clock, 
  CheckCircle2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ListingFormData } from './types';
import { getCategoryListingSchema } from './CategorySchemas';

interface Step6ShippingProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

export const Step6Shipping: React.FC<Step6ShippingProps> = ({
  formData,
  setFormData
}) => {
  const schema = getCategoryListingSchema(formData.category);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-shipping-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-blue-50 via-blue-50/40 to-cyan-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-blue-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                6. الشحن والتوصيل والسياسات (Shipping & Fulfillment)
              </h3>
              <span className="text-[11px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                الخطوة 6 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              تحديد أوزان وأبعاد الشحنة لحساب تكاليف الشحن بدقة لجميع محافظات مصر، واختيار نموذج الشحن (إكسبريس أو تاجر).
            </p>
          </div>
        </div>
      </div>

      {/* Main Box */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* Fulfillment Method */}
        <div className="space-y-3">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
            طريقة التجهيز والشحن (Fulfillment Method)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              id="fulfillment-fbd-btn"
              onClick={() => setFormData(prev => ({ ...prev, fulfillmentMethod: 'FBD' }))}
              className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                formData.fulfillmentMethod === 'FBD'
                  ? 'border-[#800020] bg-rose-50/50 dark:bg-zinc-700/70 shadow-xs ring-2 ring-[#800020]/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                formData.fulfillmentMethod === 'FBD' ? 'bg-[#800020] text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600'
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    شحن إكسبريس سوق دسوق (FBD)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    الأكثر طلباً
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  تخزين وتغليف وشحن سريع عبر مستودعات سوق دسوق المركزية مع استلام فوري من باب المتجر.
                </p>
              </div>
            </button>

            <button
              type="button"
              id="fulfillment-fbm-btn"
              onClick={() => setFormData(prev => ({ ...prev, fulfillmentMethod: 'FBM' }))}
              className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                formData.fulfillmentMethod === 'FBM'
                  ? 'border-[#800020] bg-rose-50/50 dark:bg-zinc-700/70 shadow-xs ring-2 ring-[#800020]/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                formData.fulfillmentMethod === 'FBM' ? 'bg-[#800020] text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600'
              }`}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  شحن بمعرفة التاجر (FBM)
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  يقوم البائع بتغليف وتسليم الطرد لمندوب شركة الشحن خلال مدة التجهيز المحددة.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Dimensions & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-zinc-500" />
              <span>الوزن المقدر (كجم)</span>
            </label>
            <input
              id="product-weight-input"
              type="number"
              step="0.05"
              min="0.01"
              value={formData.weightKg}
              onChange={(e) => setFormData(prev => ({ ...prev, weightKg: e.target.value === '' ? '' : Number(e.target.value) }))}
              placeholder="0.45"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-zinc-500" />
              <span>الطول (سم)</span>
            </label>
            <input
              id="product-length-input"
              type="number"
              min="1"
              value={formData.lengthCm}
              onChange={(e) => setFormData(prev => ({ ...prev, lengthCm: e.target.value === '' ? '' : Number(e.target.value) }))}
              placeholder="30"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-zinc-500" />
              <span>العرض (سم)</span>
            </label>
            <input
              id="product-width-input"
              type="number"
              min="1"
              value={formData.widthCm}
              onChange={(e) => setFormData(prev => ({ ...prev, widthCm: e.target.value === '' ? '' : Number(e.target.value) }))}
              placeholder="20"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-zinc-500" />
              <span>الارتفاع (سم)</span>
            </label>
            <input
              id="product-height-input"
              type="number"
              min="1"
              value={formData.heightCm}
              onChange={(e) => setFormData(prev => ({ ...prev, heightCm: e.target.value === '' ? '' : Number(e.target.value) }))}
              placeholder="5"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>
        </div>

        {/* Handling Days & Fragile Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>مدة تجهيز الطلب قبل التسليم للشحن (أيام عمل)</span>
            </label>
            <select
              id="product-handling-time-select"
              value={formData.handlingTimeDays}
              onChange={(e) => setFormData(prev => ({ ...prev, handlingTimeDays: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-sm"
            >
              <option value="1">خلال 24 ساعة (شحن سريع في نفس اليوم أو اليوم التالي)</option>
              <option value="2">خلال يومين عمل (المعتاد)</option>
              <option value="3">خلال 3 أيام عمل</option>
              <option value="5">خلال 5 أيام عمل (للمنتجات الحرفية المصنوعة يدوياً حسب الطلب)</option>
            </select>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                سلعة حساسة / قابلة للكسر أو التلف ⚠️
              </span>
              <span className="text-xs text-zinc-500">
                يطبق عليها لصق تحذير وتغليف هوائي مضاعف
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="product-fragile-toggle"
                type="checkbox"
                checked={formData.isFragile}
                onChange={(e) => setFormData(prev => ({ ...prev, isFragile: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
            </label>
          </div>
        </div>

        {/* Warranty & Return Policy (Egyptian Law 181/2018) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>تفاصيل الضمان وخدمة ما بعد البيع</span>
            </label>
            <input
              id="product-warranty-input"
              type="text"
              value={formData.warranty}
              onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
              placeholder={schema.defaultWarrantyAr || 'ضمان استبدال واسترجاع 14 يوماً'}
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-indigo-600" />
              <span>سياسة الاسترجاع (قانون حماية المستهلك المصري)</span>
            </label>
            <select
              id="product-return-policy-select"
              value={formData.returnPolicyDays}
              onChange={(e) => setFormData(prev => ({ ...prev, returnPolicyDays: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-sm"
            >
              <option value="14">14 يوماً استرجاع واستبدال (الحد القانوني القياسي لجميع السلع السليمة)</option>
              <option value="30">30 يوماً استرجاع واستبدال في حالة وجود أي عيب صناعة أو عدم مطابقة</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
