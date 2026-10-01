import React from 'react';
import { 
  Award, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Wallet, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  Receipt
} from 'lucide-react';
import { MarketplaceOrder, CourierShiftSettlement } from '../../types';

interface CourierScorecardViewProps {
  orders: MarketplaceOrder[];
  settlements: CourierShiftSettlement[];
}

export const CourierScorecardView: React.FC<CourierScorecardViewProps> = ({ orders, settlements }) => {
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
  const deliveredCount = deliveredOrders.length;
  
  // Earnings calculations
  const commissionPerOrder = 30; // 30 EGP per order
  const baseEarnings = deliveredCount * commissionPerOrder;
  const bonusEarned = deliveredCount >= 8 ? 60 : 0; // 60 EGP bonus for 8+ orders
  const totalTodayEarnings = baseEarnings + bonusEarned;

  return (
    <div className="space-y-6 text-right">
      
      {/* 1. CAPTAIN BADGE HEADER */}
      <div className="bg-gradient-to-r from-[#800020] via-[#5C0017] to-[#36000D] p-6 sm:p-8 rounded-3xl text-white border border-[#D4AF37]/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-2xl font-black shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">كابتن محمود الدسوقي</h3>
                <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  كابتن ذهبي متميز ★
                </span>
              </div>
              <p className="text-xs text-amber-200 mt-1">
                سائق معتمد - شبكة التوزيع السريع بدسوق ومراكزها (Desoq Express)
              </p>
            </div>
          </div>

          {/* Today's Net Earnings Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 sm:min-w-56 text-center">
            <span className="text-xs text-amber-200 font-bold block mb-1">
              أرباح وعمولات الكابتن اليوم:
            </span>
            <div className="text-3xl font-black text-white font-mono flex items-center justify-center gap-1">
              <span>{totalTodayEarnings}</span>
              <span className="text-sm font-sans text-[#D4AF37]">ج.م</span>
            </div>
            <span className="text-[11px] text-emerald-300 block mt-1">
              ({deliveredCount} شحنة × 30 ج.م {bonusEarned > 0 ? '+ 60 ج.م بونص تميز' : ''})
            </span>
          </div>
        </div>
      </div>

      {/* 2. PERFORMANCE SCORECARD GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-zinc-300">تقييم العملاء</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white font-mono">
            4.9 <span className="text-xs font-sans text-stone-400">/ 5</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            بناءً على 142 تقييماً حقيقياً
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-zinc-300">الالتزام بموعد التسليم</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white font-mono">
            98.6%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            تسليم خلال 35 دقيقة من الاستلام
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-zinc-300">نسبة نجاح التوصيل</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white font-mono">
            97.2%
          </div>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 block mt-1">
            أدنى معدل رجوع في دسوق
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-zinc-300">إثبات الأمانة (OTP)</span>
            <ShieldCheck className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white font-mono">
            100%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            كافة الشحنات مؤكدة رقمياً
          </span>
        </div>

      </div>

      {/* 3. SETTLEMENTS & CASH REMITTANCE HISTORY */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>سجل إقفال الورديات والتسويات المالية المعتمدة</span>
          </h4>
          <span className="text-xs text-stone-400 font-mono">
            {settlements.length} تسوية مسجلة
          </span>
        </div>

        {settlements.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs border border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl">
            لا توجد تسويات مالية سابقة اليوم. يمكنك الضغط على "إقفال الوردية وتوريد العهدة" لإنشاء أول تسوية.
          </div>
        ) : (
          <>
            {/* Mobile / Tablet Cards (md:hidden) */}
            <div className="md:hidden space-y-3">
              {settlements.map((s) => (
                <div 
                  key={s.id}
                  className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#800020] dark:text-[#D4AF37]">
                      #{s.id}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>معتمدة</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>{s.date}</span>
                    <span>شحنات منجزة: {s.ordersDeliveredCount}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-stone-400 block">كاش COD</span>
                      <span className="font-mono font-bold text-xs">{s.totalCodCollectedEGP.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">عمولة الكابتن</span>
                      <span className="font-mono font-bold text-xs text-emerald-600">+{s.courierCommissionsEGP}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">صافي الخزينة</span>
                      <span className="font-mono font-black text-xs text-stone-900 dark:text-white">{s.netRemittanceDueEGP.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-zinc-800 text-stone-400 text-[11px]">
                    <th className="pb-3 font-bold">رقم التسوية</th>
                    <th className="pb-3 font-bold">التاريخ</th>
                    <th className="pb-3 font-bold">الشحنات</th>
                    <th className="pb-3 font-bold">كاش العهدة (COD)</th>
                    <th className="pb-3 font-bold">عمولة الكابتن</th>
                    <th className="pb-3 font-bold">صافي المورد للخزينة</th>
                    <th className="pb-3 font-bold">طريقة التوريد</th>
                    <th className="pb-3 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#800020] dark:text-[#D4AF37]">
                        #{s.id}
                      </td>
                      <td className="py-3 text-stone-600 dark:text-zinc-300 font-mono">{s.date}</td>
                      <td className="py-3 font-bold text-stone-900 dark:text-white">{s.ordersDeliveredCount}</td>
                      <td className="py-3 font-mono font-bold">{s.totalCodCollectedEGP.toLocaleString()} ج.م</td>
                      <td className="py-3 font-mono text-emerald-600 font-bold">+{s.courierCommissionsEGP} ج.م</td>
                      <td className="py-3 font-mono font-black text-stone-900 dark:text-white">
                        {s.netRemittanceDueEGP.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 text-stone-500">
                        {s.paymentMethod === 'instapay' ? 'إنستاباي' : s.paymentMethod === 'cash_safe' ? 'خزينة' : 'محفظة'}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>معتمدة</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
