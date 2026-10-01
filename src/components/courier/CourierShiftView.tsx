import React, { useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Receipt, 
  DollarSign, 
  ArrowUpRight, 
  Building2, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { MarketplaceOrder, CourierShiftSettlement } from '../../types';
import { api } from '../../services/api';

interface CourierShiftViewProps {
  orders: MarketplaceOrder[];
  settlements: CourierShiftSettlement[];
  onSaveSettlement: (settlement: CourierShiftSettlement) => void;
  onOpenSettlementModal: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CourierShiftView: React.FC<CourierShiftViewProps> = ({
  orders,
  settlements,
  onSaveSettlement,
  onOpenSettlementModal,
  showToast
}) => {
  // 1. Delivered orders & metrics
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered' || o.deliveryStage === 'delivered');
  const totalDeliveredCount = deliveredOrders.length;
  const totalCodCollected = deliveredOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery')
    .reduce((sum, o) => sum + (o.totalAmountEGP || 0), 0);
  const prepaidDeliveredCount = deliveredOrders.filter(o => o.paymentMethod !== 'cash_on_delivery').length;

  // Courier Commission: 30 EGP per parcel
  const commissionPerParcel = 30;
  const totalCommissionsEarned = totalDeliveredCount * commissionPerParcel;

  // 2. Failed / Exception orders & metrics
  const failedOrders = orders.filter(o => o.orderStatus === 'cancelled' || o.deliveryStage === 'failed' || !!o.exceptionReason);
  const totalFailedCount = failedOrders.length;

  // 3. Pending orders & metrics
  const pendingOrders = orders.filter(o => 
    o.orderStatus !== 'delivered' && 
    o.orderStatus !== 'cancelled' && 
    o.deliveryStage !== 'failed' && 
    !o.exceptionReason
  );
  const totalPendingCount = pendingOrders.length;
  const totalCodPending = pendingOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery')
    .reduce((sum, o) => sum + (o.totalAmountEGP || 0), 0);

  // 4. Settlement Calculation: Net remittance due to treasury
  const netRemittanceDue = Math.max(0, totalCodCollected - totalCommissionsEarned);

  // Quick Inline Settlement Form
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone_cash' | 'cash_safe'>('instapay');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newSettlement: Partial<CourierShiftSettlement> = {
        courierId: 'courier_desoq_101',
        courierName: 'كابتن محمود الدسوقي',
        date: new Date().toISOString().slice(0, 10),
        ordersDeliveredCount: totalDeliveredCount,
        totalCodCollectedEGP: totalCodCollected,
        courierCommissionsEGP: totalCommissionsEarned,
        netRemittanceDueEGP: netRemittanceDue,
        paymentMethod,
        transactionRef: transactionRef.trim() || `TXN-${Date.now().toString().slice(-6)}`,
        notes: notes.trim() || 'تسوية وردية ميدانية معتمدة',
        status: 'confirmed'
      };

      const res = await api.submitCourierShiftSettlement(newSettlement);
      onSaveSettlement(res.settlement);
      showToast('تمت تسوية وتوريد عهدة الوردية بنجاح إلى الخزينة المركزية', 'success');
      setTransactionRef('');
      setNotes('');
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل تسوية الوردية', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* SHIFT TITLE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <span>تقرير الوردية وحساب العهدة (Shift & Settlement)</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            متابعة دقيقة للشحنات المسلمة والمتعذرة والمتبقية وتصفية المبالغ المحصلة مع خزينة دسوق
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSettlementModal}
          className="bg-[#800020] hover:bg-[#990026] text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
        >
          <Wallet className="w-4 h-4 text-amber-300" />
          <span>فتح نافذة التسوية المطبوعة</span>
        </button>
      </div>

      {/* THE 4 REQUIRED CARDS: Delivered, Failed, Pending, Settlement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. DELIVERED */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>المنجزة (Delivered)</span>
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              ناجحة ✓
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-emerald-600">
              {totalDeliveredCount}
            </div>
            <div className="text-xs text-stone-500 dark:text-zinc-400 mt-1 flex items-center justify-between">
              <span>كاش محصل (COD):</span>
              <strong className="font-mono text-stone-800 dark:text-zinc-200">{totalCodCollected} ج.م</strong>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between">
              <span>أونلاين:</span>
              <span className="font-mono">{prepaidDeliveredCount} شحنات</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            عمولة الكابتن: +{totalCommissionsEarned} ج.م
          </div>
        </div>

        {/* 2. FAILED */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-300 dark:border-rose-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>المتعذرة (Failed)</span>
            </span>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
              استثناءات
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-rose-600">
              {totalFailedCount}
            </div>
            <div className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
              {totalFailedCount === 0 ? 'لا توجد شحنات ملغاة أو متعذرة' : `${totalFailedCount} شحنات بحاجة لمتابعة`}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-rose-700 dark:text-rose-400 font-bold">
            تم توثيق الأسباب والحلول المعتمدة
          </div>
        </div>

        {/* 3. PENDING */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>المتبقية (Pending)</span>
            </span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
              في خط السير
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-amber-600">
              {totalPendingCount}
            </div>
            <div className="text-xs text-stone-500 dark:text-zinc-400 mt-1 flex items-center justify-between">
              <span>كاش متبقي للتحصيل:</span>
              <strong className="font-mono text-stone-800 dark:text-zinc-200">{totalCodPending} ج.م</strong>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-amber-700 dark:text-amber-400 font-bold">
            {totalPendingCount === 0 ? 'اكتملت جميع المهام الميدانية ✓' : 'جاهزة للتسليم للعملاء'}
          </div>
        </div>

        {/* 4. SETTLEMENT */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border-2 border-stone-900 dark:border-amber-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-900 dark:text-amber-300 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>التسوية (Settlement)</span>
            </span>
            <span className="text-[10px] bg-amber-500 text-stone-900 px-2 py-0.5 rounded-full font-black">
              صافي العهدة
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-stone-900 dark:text-white">
              {netRemittanceDue} <span className="text-xs font-normal">ج.م</span>
            </div>
            <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1">
              (الكاش المحصل - عمولة الكابتن)
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-stone-700 dark:text-zinc-300 font-bold">
            واجب التوريد لخزينة سوق دسوق
          </div>
        </div>

      </div>

      {/* QUICK SETTLEMENT FORM */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 shadow-sm">
        <h3 className="text-base font-black text-stone-900 dark:text-white mb-1">
          تسوية العهدة النقدية الفورية للوردية
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-4">
          قم بتوريد المبلغ الصافي ({netRemittanceDue} ج.م) للخزينة عبر إنستاباي أو المحفظة الإلكترونية أو الخزينة النقدية بمقر دسوق
        </p>

        <form onSubmit={handleInlineSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1.5">
                طريقة توريد العهدة:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-bold"
              >
                <option value="instapay">تحويل إنستاباي (InstaPay IPN)</option>
                <option value="vodafone_cash">محفظة إلكترونية (فودافون كاش)</option>
                <option value="cash_safe">توريد نقدي لخزينة المقر بدسوق</option>
              </select>
            </div>

            {/* Transaction Ref */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1.5">
                رقم الحوالة / المرجع المالي:
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="مثال: IPN-98421 أو إيصال 104"
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1.5">
                ملاحظات التسوية:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="وردية مسائية / تسوية منتظمة"
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting || totalDeliveredCount === 0}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-h-[48px]"
          >
            {isSubmitting ? (
              <span>جاري تسجيل التسوية...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>اعتماد التسوية وتوريد {netRemittanceDue} ج.م للخزينة</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* RECENT SETTLEMENTS LOG */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-stone-900 dark:text-white">
          سجل التسويات المعتمدة السابقة
        </h3>

        {settlements.length === 0 ? (
          <p className="text-xs text-stone-400 py-3">لا توجد تسويات سابقة مسجلة.</p>
        ) : (
          <div className="space-y-2">
            {settlements.map((s) => (
              <div 
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-black text-stone-900 dark:text-white">
                    <span className="font-mono">#{s.id}</span>
                    <span>-</span>
                    <span>{s.date}</span>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-md">
                      {s.status === 'confirmed' ? 'معتمدة ومطابقة' : 'قيد التدقيق'}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>عدد الشحنات: <strong>{s.ordersDeliveredCount}</strong></span>
                    <span>كاش العهدة: <strong>{s.totalCodCollectedEGP} ج.م</strong></span>
                    <span>عمولة الكابتن: <strong>+{s.courierCommissionsEGP} ج.م</strong></span>
                    <span>المرجع: <strong className="font-mono">{s.transactionRef}</strong></span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-bold text-stone-500 block">المبلغ المورد:</span>
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {s.netRemittanceDueEGP} ج.م
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
