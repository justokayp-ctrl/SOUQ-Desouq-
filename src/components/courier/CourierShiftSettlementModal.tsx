import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  DollarSign, 
  Receipt, 
  ArrowRightLeft, 
  Printer, 
  Copy, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { MarketplaceOrder, CourierShiftSettlement } from '../../types';

interface CourierShiftSettlementModalProps {
  orders: MarketplaceOrder[];
  courierName?: string;
  onClose: () => void;
  onSaveSettlement: (settlement: CourierShiftSettlement) => void;
}

export const CourierShiftSettlementModal: React.FC<CourierShiftSettlementModalProps> = ({
  orders,
  courierName = 'كابتن محمود الدسوقي',
  onClose,
  onSaveSettlement,
}) => {
  // Delivered orders calculation
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
  const totalDeliveredCount = deliveredOrders.length;
  
  // Total COD collected
  const totalCodCollected = deliveredOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery')
    .reduce((sum, o) => sum + (o.totalAmountEGP || 0), 0);

  // Online / Pre-paid orders count
  const prePaidCount = deliveredOrders.filter(o => o.paymentMethod !== 'cash_on_delivery').length;

  // Courier Commission: 30 EGP per successfully delivered parcel
  const commissionPerOrder = 30;
  const totalCommissionEarned = totalDeliveredCount * commissionPerOrder;

  // Net Remittance Due to Treasury (Total COD Collected - Courier Commission)
  const netRemittanceDue = Math.max(0, totalCodCollected - totalCommissionEarned);

  // Form State
  const [paymentMethod, setPaymentMethod] = useState<'cash_safe' | 'instapay' | 'vodafone_cash'>('instapay');
  const [transactionRef, setTransactionRef] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedSettlement, setCompletedSettlement] = useState<CourierShiftSettlement | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmitSettlement = (e: React.FormEvent) => {
    e.preventDefault();

    const newSettlement: CourierShiftSettlement = {
      id: `SETTLE-${Date.now().toString().slice(-6)}`,
      courierId: 'courier_desoq_101',
      courierName,
      date: new Date().toISOString().slice(0, 10),
      ordersDeliveredCount: totalDeliveredCount,
      totalCodCollectedEGP: totalCodCollected,
      courierCommissionsEGP: totalCommissionEarned,
      netRemittanceDueEGP: netRemittanceDue,
      paymentMethod,
      transactionRef: transactionRef.trim() || `CASH-${Date.now().toString().slice(-4)}`,
      notes: settlementNotes,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    onSaveSettlement(newSettlement);
    setCompletedSettlement(newSettlement);
    setIsCompleted(true);
  };

  const handleCopyReceipt = () => {
    if (!completedSettlement) return;
    const text = `
=== إيصال تسوية وردية مندوب - سوق دسوق ===
رقم التسوية: #${completedSettlement.id}
الكابتن: ${completedSettlement.courierName}
التاريخ: ${completedSettlement.date}
عدد الشحنات المنجزة: ${completedSettlement.ordersDeliveredCount}
إجمالي النقدية المحصلة (COD): ${completedSettlement.totalCodCollectedEGP} ج.م
عمولة الكابتن المستحقة: ${completedSettlement.courierCommissionsEGP} ج.م
صافي المبلغ المورد للخزينة: ${completedSettlement.netRemittanceDueEGP} ج.م
طريقة التوريد: ${completedSettlement.paymentMethod}
رقم المرجع/التحويل: ${completedSettlement.transactionRef}
حالة التسوية: معتمدة ومسجلة رسمياً
========================================
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] via-[#5C0017] to-[#36000D] px-6 py-4 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/30">
              <Wallet className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base font-black">إقفال الوردية وتصفية العهدة النقدية</h3>
              <p className="text-xs text-amber-200 font-mono mt-0.5">
                سوق دسوق Express - تسوية يومية مع الخزينة المركزية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCompleted ? (
          /* FORM VIEW */
          <form onSubmit={handleSubmitSettlement} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-3 bg-[#FDFBF7] dark:bg-zinc-800/60 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800">
              <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 block mb-1">
                  الشحنات المنجزة
                </span>
                <span className="text-xl font-black text-stone-900 dark:text-white font-mono">
                  {totalDeliveredCount}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  ({prePaidCount} مدفوع أونلاين)
                </span>
              </div>

              <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 block mb-1">
                  إجمالي كاش العهدة (COD)
                </span>
                <span className="text-xl font-black text-[#800020] dark:text-amber-400 font-mono">
                  {totalCodCollected.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">جنيه مصري</span>
              </div>

              <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  عمولة الكابتن المستحقة
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  +{totalCommissionEarned}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">30 ج.م/شحنة</span>
              </div>
            </div>

            {/* Net Remittance Due Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                  صافي المبلغ الواجب توريده للخزينة الآن:
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  (كاش العهدة المحصلة مخصوماً منه عمولة التوصيل المباشرة)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-[#800020] dark:text-amber-400">
                  {netRemittanceDue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 mr-1">ج.م</span>
              </div>
            </div>

            {/* Payment Remittance Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300">
                طريقة توريد صافي النقدية لإدارة المنصة:
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'instapay'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#800020]/5 text-[#800020] dark:text-[#D4AF37] font-black shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xs block">إنستاباي فوري</span>
                  <span className="text-[10px] text-stone-400">InstaPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('vodafone_cash')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#800020]/5 text-[#800020] dark:text-[#D4AF37] font-black shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xs block">محفظة كاش</span>
                  <span className="text-[10px] text-stone-400">Vodafone / We</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_safe')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cash_safe'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#800020]/5 text-[#800020] dark:text-[#D4AF37] font-black shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xs block">خزينة المقر</span>
                  <span className="text-[10px] text-stone-400">كاش باليد</span>
                </button>
              </div>
            </div>

            {/* Transaction Ref */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1">
                رقم المعاملة / مرجع التحويل البنكي أو إيصال الخزينة:
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="مثال: IPN-20260312-8849 أو رقم إيصال الاستلام"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1">
                ملاحظات التسوية والوردية:
              </label>
              <textarea
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                rows={2}
                placeholder="أي ملاحظات خاصة بطلبات مؤجلة أو فروق نقدية..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-[#800020] hover:bg-[#990026] text-white font-black py-3 px-4 rounded-xl shadow-xs transition-all cursor-pointer text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>اعتماد التسوية وإقفال الوردية رسمياً</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>

          </form>
        ) : (
          /* SUCCESS / RECEIPT VIEW */
          completedSettlement && (
            <div className="p-6 space-y-5 animate-in zoom-in-95 duration-200">
              
              <div className="p-6 bg-[#FDFBF7] dark:bg-zinc-800/80 rounded-3xl border-2 border-[#D4AF37]/50 shadow-inner text-right relative overflow-hidden">
                <div className="absolute top-3 left-3 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-28 h-28 text-[#800020] dark:text-[#D4AF37]" />
                </div>

                <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-700 pb-3 mb-4">
                  <div>
                    <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37] block">
                      منصة سوق دسوق الرقمية
                    </span>
                    <h4 className="text-sm font-black text-stone-900 dark:text-white">
                      إشعار تصفية وإخلاء طرف عهدة كابتن
                    </h4>
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                    تم التوريد والإغلاق ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">رقم التسوية:</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-white">
                      #{completedSettlement.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">الكابتن المستلم:</span>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {completedSettlement.courierName}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">الشحنات المنجزة:</span>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {completedSettlement.ordersDeliveredCount} شحنة
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">طريقة التوريد:</span>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {completedSettlement.paymentMethod === 'instapay' ? 'إنستاباي InstaPay' : completedSettlement.paymentMethod === 'cash_safe' ? 'خزينة الفرع كاش' : 'محفظة إلكترونية'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">إجمالي كاش COD:</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-white">
                      {completedSettlement.totalCodCollectedEGP.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">عمولة الكابتن:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      +{completedSettlement.courierCommissionsEGP.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="col-span-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-stone-200 dark:border-zinc-700 flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-800 dark:text-zinc-200">
                      صافي المبلغ المسلم للخزينة:
                    </span>
                    <span className="font-mono font-black text-base text-[#800020] dark:text-[#D4AF37]">
                      {completedSettlement.netRemittanceDueEGP.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400 block text-[11px]">مرجع التحويل / الإيصال:</span>
                    <span className="font-mono text-xs text-stone-600 dark:text-zinc-300">
                      {completedSettlement.transactionRef}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-700 flex items-center justify-between text-[11px] text-stone-400">
                  <span>ختم إلكتروني معتمد - دسوق إكسبريس</span>
                  <span className="font-mono">{new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#800020] hover:bg-[#990026] text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs"
                >
                  <Copy className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isCopied ? 'تم نسخ بيانات الإيصال!' : 'نسخ نص الإيصال للمشاركة'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};
