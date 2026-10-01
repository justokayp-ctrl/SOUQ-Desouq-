import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Coins, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShieldCheck, 
  Barcode, 
  Info,
  Percent,
  Calculator
} from 'lucide-react';
import { ListingFormData } from './types';

interface Step5PriceInventoryProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
}

export const Step5PriceInventory: React.FC<Step5PriceInventoryProps> = ({
  formData,
  setFormData
}) => {
  const price = Number(formData.priceEGP) || 0;
  const originalPrice = Number(formData.originalPriceEGP) || 0;
  const costPrice = Number(formData.costPriceEGP) || 0;

  // Real-time financial calculations
  const feeCalculations = useMemo(() => {
    if (price <= 0) return { commission: 0, paymentFee: 0, netPayout: 0, profitMargin: 0, discountPercent: 0 };

    const commissionRate = 0.08; // 8% marketplace fee
    const paymentRate = 0.025; // 2.5% + 3 EGP
    const paymentFixed = 3;

    const commission = Math.round(price * commissionRate);
    const paymentFee = Math.round(price * paymentRate + paymentFixed);
    const netPayout = Math.max(0, price - commission - paymentFee);

    let profitMargin = 0;
    if (costPrice > 0) {
      profitMargin = Math.round(((netPayout - costPrice) / netPayout) * 100);
    }

    let discountPercent = 0;
    if (originalPrice > price) {
      discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    return {
      commission,
      paymentFee,
      netPayout,
      profitMargin,
      discountPercent
    };
  }, [price, originalPrice, costPrice]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-price-inventory-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-50 via-emerald-50/40 to-teal-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-emerald-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Coins className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                5. التسعير والمخزون (Price & Inventory)
              </h3>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                الخطوة 5 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              حدد سعر البيع النهائي للعميل بالجنيه المصري، تكلفة المنتج، وكميات المخزون المتاحة للبيع الفوري.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selling Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>سعر البيع النهائي للعميل</span>
                <span className="text-rose-600 font-bold">*</span>
              </label>
              <span className="text-xs text-emerald-600 font-bold">ج.م EGP</span>
            </div>
            <div className="relative">
              <input
                id="product-price-input"
                type="number"
                min="1"
                step="1"
                value={formData.priceEGP}
                onChange={(e) => setFormData(prev => ({ ...prev, priceEGP: e.target.value === '' ? '' : Number(e.target.value) }))}
                placeholder="299"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-base font-bold font-mono"
              />
            </div>
          </div>

          {/* Original Strikethrough Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>السعر الأصلي قبل الخصم</span>
                <span className="text-xs text-zinc-400">(اختياري)</span>
              </label>
              {feeCalculations.discountPercent > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                  خصم {feeCalculations.discountPercent}%
                </span>
              )}
            </div>
            <input
              id="product-orig-price-input"
              type="number"
              min="1"
              value={formData.originalPriceEGP}
              onChange={(e) => setFormData(prev => ({ ...prev, originalPriceEGP: e.target.value === '' ? '' : Number(e.target.value) }))}
              placeholder="399"
              className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>

          {/* Cost Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>سعر التكلفة عليك</span>
                <span className="text-xs text-zinc-400">(خاص بك)</span>
              </label>
              {feeCalculations.profitMargin !== 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  feeCalculations.profitMargin > 0 ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50' : 'text-rose-600 bg-rose-50'
                }`}>
                  هامش {feeCalculations.profitMargin}%
                </span>
              )}
            </div>
            <input
              id="product-cost-price-input"
              type="number"
              min="0"
              value={formData.costPriceEGP}
              onChange={(e) => setFormData(prev => ({ ...prev, costPriceEGP: e.target.value === '' ? '' : Number(e.target.value) }))}
              placeholder="180"
              className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>
        </div>

        {/* Payout Breakdown Card */}
        {price > 0 && (
          <div className="p-4 bg-emerald-50/70 dark:bg-zinc-900/70 rounded-2xl border border-emerald-200/80 dark:border-zinc-700 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>تفاصيل الحسبة المالية وصافي أرباحك لكل طلب:</span>
              </span>
              <span className="text-sm font-bold text-[#800020] dark:text-amber-400">
                صافي تحصيلك: {feeCalculations.netPayout} ج.م
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 block text-[11px]">عمولة المنصة (8%)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{feeCalculations.commission} ج.م</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 block text-[11px]">رسوم بوابة الدفع الإلكتروني</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{feeCalculations.paymentFee} ج.م</span>
              </div>
              <div className="p-2.5 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800">
                <span className="text-emerald-800 dark:text-emerald-300 block text-[11px] font-bold">الربح الصافي التقديري</span>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  {costPrice > 0 ? `${feeCalculations.netPayout - costPrice} ج.م` : `${feeCalculations.netPayout} ج.م`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/80">
          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>الكمية الإجمالية في المخزن</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              id="product-stock-input"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>تنبيه انخفاض المخزون</span>
            </label>
            <input
              id="product-low-stock-input"
              type="number"
              min="1"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>رمز التخزين التعريفي (SKU)</span>
              <span className="text-rose-600 font-bold">*</span>
            </label>
            <input
              id="product-sku-input"
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="DSQ-SHIRT-001"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>الباركود الدولي (EAN/GTIN)</span>
            </label>
            <input
              id="product-barcode-input"
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              placeholder="6221234567890"
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#800020] text-sm font-mono"
            />
          </div>
        </div>

        {/* VAT Toggle */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
              الأسعار شاملة ضريبة القيمة المضافة (14% VAT)
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              وفقاً لاشتراطات مصلحة الضرائب المصرية وقانون التجارة الإلكترونية
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="product-vat-toggle"
              type="checkbox"
              checked={formData.vatIncluded}
              onChange={(e) => setFormData(prev => ({ ...prev, vatIncluded: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
