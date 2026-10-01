import React, { useState } from 'react';
import { 
  Wrench, 
  Calculator, 
  QrCode, 
  Printer, 
  Download, 
  DollarSign, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Share2,
  Tag
} from 'lucide-react';
import { Seller } from '../../types';

interface SellerToolsViewProps {
  seller: Seller;
  onShowToast: (msg: string) => void;
}

export const SellerToolsView: React.FC<SellerToolsViewProps> = ({
  seller,
  onShowToast,
}) => {
  // Calculator state
  const [costPriceEGP, setCostPriceEGP] = useState<number>(180);
  const [packagingCostEGP, setPackagingCostEGP] = useState<number>(20);
  const [targetSellingPriceEGP, setTargetSellingPriceEGP] = useState<number>(350);

  // Calculations
  const commissionRate = seller.commissionRate || 0.08;
  const platformCommissionEGP = Math.round(targetSellingPriceEGP * commissionRate);
  const totalCostEGP = costPriceEGP + packagingCostEGP;
  const netRevenueEGP = targetSellingPriceEGP - platformCommissionEGP;
  const netProfitEGP = netRevenueEGP - totalCostEGP;
  const profitMarginPercent = targetSellingPriceEGP > 0 ? ((netProfitEGP / targetSellingPriceEGP) * 100).toFixed(1) : '0';

  const handleCopyStoreLink = () => {
    const url = `${window.location.origin}/store/${seller.id}`;
    navigator.clipboard?.writeText(url);
    onShowToast(`تم نسخ رابط المتجر: ${url}`);
  };

  const handlePrintStoreFlyer = () => {
    onShowToast('جاري تحضير ملصق QR لورشة دسوق للطباعة...');
    window.print();
  };

  return (
    <div id="seller-tools-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>أدوات تاجر سوق دسوق المتقدمة</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            حاسبة هوامش الربح والتسعير، مولد الباركود وQR لورشة المتجر، وأدوات التسويق المحلي
          </p>
        </div>
      </div>

      {/* 2. TWO MAIN SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tool 1: Profit Margin & Pricing Calculator */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2 border-b pb-3">
            <Calculator className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>حاسبة التسعير وصافي الربح بعد العمولة</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                تكلفة التصنيع / الشراء للمنتج (ج.م):
              </label>
              <input
                type="number"
                value={costPriceEGP}
                onChange={(e) => setCostPriceEGP(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                تكلفة التغليف والتجهيز (ج.م):
              </label>
              <input
                type="number"
                value={packagingCostEGP}
                onChange={(e) => setPackagingCostEGP(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                سعر البيع المقترح للمشتري (ج.م):
              </label>
              <input
                type="number"
                value={targetSellingPriceEGP}
                onChange={(e) => setTargetSellingPriceEGP(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-[#800020]/30 rounded-2xl p-3 font-serif font-black text-base text-[#800020] dark:text-[#D4AF37] outline-none"
              />
            </div>
          </div>

          {/* Results Card */}
          <div className="p-5 bg-gradient-to-br from-[#800020] to-[#500010] text-white rounded-3xl space-y-3 shadow-md">
            <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
              <span className="text-white/80">عمولة المنصة ({(commissionRate * 100)}%):</span>
              <span className="font-bold">-{platformCommissionEGP} ج.م</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
              <span className="text-white/80">صافي المحصل لحسابك:</span>
              <span className="font-bold">{netRevenueEGP} ج.م</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="text-white/80 text-[11px] block">صافي ربحك الصافي:</span>
                <span className="font-serif font-black text-2xl text-[#D4AF37]">
                  {netProfitEGP} ج.م
                </span>
              </div>

              <div className="text-left bg-white/10 px-3 py-1.5 rounded-2xl">
                <span className="text-[10px] text-white/70 block">هامش الربح:</span>
                <span className="font-black text-sm text-[#D4AF37]">{profitMarginPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tool 2: Storefront QR Code & Workshop Flyer */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs space-y-5 text-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2 border-b pb-3">
              <QrCode className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
              <span>رمز QR وبطاقة المتجر الذكية للورشة</span>
            </h3>

            <p className="text-gray-500 text-[11px] leading-relaxed">
              اطبع هذا الباركود وعلقه في ورشتك أو محلك بدسوق لتمكين الزبائن من مسح الكود والشراء مباشرة عبر سوق دسوق مع التوصيل لأي مكان.
            </p>

            <div className="p-6 bg-[#FAF7F2] dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-700 text-center space-y-3 max-w-[260px] mx-auto">
              <div className="w-36 h-36 bg-white dark:bg-zinc-800 p-2 rounded-2xl mx-auto border border-gray-200 dark:border-zinc-700 flex items-center justify-center shadow-inner">
                {/* Simulated High-Res QR SVG */}
                <div className="w-full h-full border-4 border-dashed border-[#800020] rounded-xl flex flex-col items-center justify-center p-2 text-center">
                  <QrCode className="w-16 h-16 text-[#800020] dark:text-[#D4AF37]" />
                  <span className="text-[9px] font-bold text-[#800020] dark:text-[#D4AF37] mt-1 font-mono">
                    SOUQ-DESOQ/{seller.id}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="font-bold text-xs text-[#1A1A1A] dark:text-zinc-100">{seller.name}</p>
                <p className="text-[10px] text-gray-400">دسوق - {seller.district || 'كفر الشيخ'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopyStoreLink}
              className="flex-1 bg-[#FAF7F2] dark:bg-zinc-700 hover:bg-gray-200 text-gray-800 dark:text-zinc-200 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ الرابط</span>
            </button>

            <button
              type="button"
              onClick={handlePrintStoreFlyer}
              className="flex-1 bg-[#800020] hover:bg-[#600018] text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>طباعة ملصق الورشة</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
