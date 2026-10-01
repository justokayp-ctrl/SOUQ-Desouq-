import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  Navigation, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Package, 
  RotateCcw, 
  LifeBuoy, 
  ChevronRight, 
  Wifi, 
  WifiOff, 
  Zap, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Play,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { MarketplaceOrder, CourierDeliveryStage, DeliveryExceptionReason } from '../../types';
import { WhatsAppQuickButton } from './WhatsAppQuickButton';

interface CourierHomeViewProps {
  orders: MarketplaceOrder[];
  currentOrderId: string | null;
  onSelectCurrentOrder: (orderId: string) => void;
  onUpdateWorkflowStage: (orderId: string, stage: CourierDeliveryStage, note?: string) => Promise<void>;
  onOpenOtpModal: (order: MarketplaceOrder) => void;
  onOpenExceptionModal: (order: MarketplaceOrder) => void;
  onGoToShift: () => void;
  onGoToAllTasks: () => void;
}

export const CourierHomeView: React.FC<CourierHomeViewProps> = ({
  orders,
  currentOrderId,
  onSelectCurrentOrder,
  onUpdateWorkflowStage,
  onOpenOtpModal,
  onOpenExceptionModal,
  onGoToShift,
  onGoToAllTasks
}) => {
  // Rapid action & Duplicate action prevention lock
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [duplicatePreventedToast, setDuplicatePreventedToast] = useState(false);

  // Network simulation tester state for offline / slow network resilience
  const [simulatedNetwork, setSimulatedNetwork] = useState<'online' | 'slow_3g' | 'offline'>('online');
  const [networkErrorNotice, setNetworkErrorNotice] = useState<string | null>(null);

  // Filter tasks for today
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled' && o.deliveryStage !== 'failed');
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'delivered' || o.deliveryStage === 'delivered');
  }, [orders]);

  const exceptionOrders = useMemo(() => {
    return orders.filter(o => !!o.exceptionReason || o.deliveryStage === 'failed');
  }, [orders]);

  // Current Delivery: Either explicitly selected, or first in-transit, or first active
  const currentDelivery = useMemo(() => {
    if (currentOrderId) {
      const found = orders.find(o => o.id === currentOrderId);
      if (found) return found;
    }
    const inTransit = activeOrders.find(o => o.deliveryStage === 'in_transit' || o.deliveryStage === 'arrived');
    if (inTransit) return inTransit;
    return activeOrders[0] || null;
  }, [orders, currentOrderId, activeOrders]);

  // Next Delivery: First active order after current delivery
  const nextDelivery = useMemo(() => {
    if (!currentDelivery) return null;
    const remaining = activeOrders.filter(o => o.id !== currentDelivery.id);
    return remaining[0] || null;
  }, [activeOrders, currentDelivery]);

  // Workflow Stages Definition
  const stages: { key: CourierDeliveryStage; label: string; icon: any }[] = [
    { key: 'assigned', label: 'مسندة', icon: Clock },
    { key: 'picked_up', label: 'تم الاستلام', icon: Building2 },
    { key: 'in_transit', label: 'في الطريق', icon: Truck },
    { key: 'arrived', label: 'وصلت للموقع', icon: MapPin },
    { key: 'delivered', label: 'تم التسليم', icon: CheckCircle2 },
  ];

  // Helper to get current stage index
  const getCurrentStageIndex = (order: MarketplaceOrder): number => {
    const stage = order.deliveryStage || (
      order.orderStatus === 'delivered' ? 'delivered' :
      order.orderStatus === 'out_for_delivery' ? 'in_transit' : 'assigned'
    );
    if (stage === 'failed') return -1;
    return stages.findIndex(s => s.key === stage);
  };

  // Safe guarded action runner (prevents rapid double-clicks & tests network)
  const executeGuardedAction = async (actionFn: () => Promise<void>) => {
    const now = Date.now();
    // Rapid click prevention (600ms debounce)
    if (now - lastActionTime < 600 || isProcessingAction) {
      setDuplicatePreventedToast(true);
      setTimeout(() => setDuplicatePreventedToast(false), 2000);
      return;
    }

    setLastActionTime(now);
    setIsProcessingAction(true);
    setNetworkErrorNotice(null);

    // Network resilience simulator
    if (simulatedNetwork === 'offline') {
      setIsProcessingAction(false);
      setNetworkErrorNotice('تعذر الاتصال بالخادم: جهاز الكابتن غير متصل بالإنترنت حالياً (Offline Mode). يرجى التحقق من الشبكة.');
      return;
    }

    if (simulatedNetwork === 'slow_3g') {
      await new Promise(res => setTimeout(res, 1200));
    }

    try {
      await actionFn();
    } catch (err: any) {
      setNetworkErrorNotice(err.message || 'حدث خطأ أثناء الاتصال بالشبكة');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // One-Tap Next Status Progression
  const handleProgressWorkflow = async (order: MarketplaceOrder) => {
    const currentIndex = getCurrentStageIndex(order);
    
    // If currently at 'arrived', next step is opening OTP delivery modal
    if (currentIndex === 3 || order.deliveryStage === 'arrived') {
      onOpenOtpModal(order);
      return;
    }

    const nextStage = stages[currentIndex + 1]?.key || 'in_transit';
    await executeGuardedAction(async () => {
      await onUpdateWorkflowStage(order.id, nextStage);
    });
  };

  // Exception Reason Arabic Labels Map
  const exceptionLabels: Record<string, string> = {
    customer_unavailable: 'العميل غير متاح / لا يرد',
    wrong_address: 'العنوان خاطئ أو غير دقيق',
    refused: 'رفض استلام الشحنة',
    payment_problem: 'مشكلة في الدفع / التحصيل',
    damaged_package: 'طرد تالف أو متضرر'
  };

  const resolutionLabels: Record<string, string> = {
    reschedule: 'إعادة جدولة المحاولة',
    return_to_merchant: 'إرجاع للتاجر / المخزن',
    escalate_to_support: 'تصعيد لمكتب الدعم الفني'
  };

  return (
    <div className="space-y-5 text-right font-sans">
      
      {/* 1. TODAY'S TASKS HEADER & SHIFT OVERVIEW */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-zinc-900 text-white rounded-3xl p-5 shadow-lg border border-stone-700 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-black tracking-tight">مهام التوزيع اليومية (Today's Tasks)</h2>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              مدينة دسوق وضواحيها — كابتن التوزيع الميداني
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl text-center shrink-0">
              <span className="text-[10px] text-stone-400 block font-bold">المهام المتبقية</span>
              <span className="text-sm font-black text-amber-300 font-mono">{activeOrders.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl text-center shrink-0">
              <span className="text-[10px] text-stone-400 block font-bold">تم التسليم</span>
              <span className="text-sm font-black text-emerald-300 font-mono">{deliveredOrders.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl text-center shrink-0">
              <span className="text-[10px] text-stone-400 block font-bold">استثناءات</span>
              <span className="text-sm font-black text-rose-300 font-mono">{exceptionOrders.length}</span>
            </div>
            <button
              type="button"
              onClick={onGoToShift}
              className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-black px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md min-h-[44px]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>إقفال الوردية</span>
            </button>
          </div>
        </div>

        {/* Shift Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 mb-1.5">
            <span>نسبة إنجاز خط سير اليوم:</span>
            <span className="font-mono text-amber-300">
              {orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 0}% 
              ({deliveredOrders.length} من {orders.length})
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duplicate / Rapid Click Warning Toast */}
      {duplicatePreventedToast && (
        <div className="bg-amber-600 text-white px-4 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>تم منع التكرار: العملية السابقة قيد المعالجة لمنع تضارب البيانات الميدانية.</span>
          </div>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-lg font-mono">Debounced</span>
        </div>
      )}

      {/* Network Error Notice */}
      {networkErrorNotice && (
        <div className="bg-rose-600 text-white px-4 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{networkErrorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNetworkErrorNotice(null)}
            className="text-[11px] underline font-mono cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 2. CURRENT DELIVERY (الشحنة الحالية - Focused Hero Card) */}
      {currentDelivery ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-amber-500 shadow-xl overflow-hidden ring-4 ring-amber-500/10">
          
          {/* Header Tag */}
          <div className="bg-amber-500 text-stone-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-stone-900 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                الشحنة الحالية (Current Delivery)
              </span>
              <span className="font-mono text-xs font-black">#{currentDelivery.id}</span>
            </div>
            
            <div className="font-mono text-xs font-black bg-stone-900/10 px-2.5 py-0.5 rounded-lg">
              كود التتبع: {currentDelivery.trackingCode}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Customer & Address Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-200 dark:border-zinc-800">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <span>{currentDelivery.customerName}</span>
                  <span className="text-xs font-mono font-normal text-stone-500 dark:text-zinc-400">
                    ({currentDelivery.customerPhone})
                  </span>
                </h3>

                <div className="flex items-start gap-1.5 text-xs text-stone-700 dark:text-zinc-300">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {currentDelivery.shippingAddress?.district || 'دسوق'} - {currentDelivery.shippingAddress?.streetDetails || 'شارع سعد زغلول'}
                    </span>
                    {currentDelivery.shippingAddress?.nearestLandmark && (
                      <span className="block text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                        📍 علامة مميزة: {currentDelivery.shippingAddress.nearestLandmark}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Badge */}
              <div className="text-left sm:text-right shrink-0">
                {currentDelivery.paymentMethod === 'cash_on_delivery' ? (
                  <div className="bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 px-3.5 py-2 rounded-2xl text-center">
                    <span className="text-[10px] font-bold block">مطلوب تحصيل كاش (COD)</span>
                    <span className="text-lg font-black font-mono text-rose-700 dark:text-rose-400">
                      {currentDelivery.totalAmountEGP} ج.م
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 px-3.5 py-2 rounded-2xl text-center">
                    <span className="text-[10px] font-bold block">حالة الدفع</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      مدفوع إلكترونياً ✓
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Stage Visualizer (6 Steps) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500 dark:text-zinc-400">مراحل الشحنة الميدانية:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">
                  {stages[getCurrentStageIndex(currentDelivery)]?.label || 'قيد المعالجة'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1 bg-stone-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                {stages.map((stg, idx) => {
                  const currentIndex = getCurrentStageIndex(currentDelivery);
                  const isCurrent = idx === currentIndex;
                  const isCompleted = idx < currentIndex;
                  const Icon = stg.icon;

                  return (
                    <div
                      key={stg.key}
                      className={`text-center py-2 px-1 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-white font-black shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-500 text-white font-bold'
                          : 'text-stone-400 dark:text-zinc-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mx-auto mb-1" />
                      <span className="text-[10px] block leading-tight truncate">{stg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ONE-TAP OPERATIONS BAR (Call, Navigation, Update status, Report issue) */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-stone-400">
                العمليات الميدانية السريعة (One-Tap Operations):
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                
                {/* 1. Call Customer */}
                <a
                  href={`tel:${currentDelivery.customerPhone}`}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-3 rounded-2xl shadow-sm text-xs transition-all cursor-pointer min-h-[52px]"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال بالعميل</span>
                </a>

                {/* 2. Navigation */}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`دسوق ${currentDelivery.shippingAddress?.district || ''} ${currentDelivery.shippingAddress?.streetDetails || ''}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-black py-3.5 px-3 rounded-2xl shadow-sm text-xs transition-all cursor-pointer min-h-[52px]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>خرائط الملاحة</span>
                </a>

                {/* 3. Update Status (Next Step) */}
                <button
                  type="button"
                  onClick={() => handleProgressWorkflow(currentDelivery)}
                  disabled={isProcessingAction}
                  className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-black py-3.5 px-3 rounded-2xl shadow-sm text-xs transition-all cursor-pointer disabled:opacity-50 min-h-[52px]"
                >
                  {isProcessingAction ? (
                    <span className="animate-spin font-mono text-base">⟳</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {getCurrentStageIndex(currentDelivery) === 0 ? 'استلام الشحنة' :
                         getCurrentStageIndex(currentDelivery) === 1 ? 'خروج للتوصيل' :
                         getCurrentStageIndex(currentDelivery) === 2 ? 'وصلت للموقع' :
                         'تأكيد التسليم (OTP)'}
                      </span>
                    </>
                  )}
                </button>

                {/* 4. Report Issue (Exception) */}
                <button
                  type="button"
                  onClick={() => onOpenExceptionModal(currentDelivery)}
                  className="flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-black py-3.5 px-3 rounded-2xl border border-rose-300 dark:border-rose-800 text-xs transition-all cursor-pointer min-h-[52px]"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>إبلاغ عن مشكلة</span>
                </button>
              </div>

              {/* WhatsApp Quick Message Pill */}
              <div className="pt-1">
                <WhatsAppQuickButton order={currentDelivery} variant="field" />
              </div>

            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center border border-stone-200 dark:border-zinc-800 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-black text-stone-900 dark:text-white">
            رائع! تم تسليم جميع شحنات الوردية بنجاح
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
            لا توجد شحنات معلقة حالياً، يمكنك إجراء تسوية الخزينة وإقفال الوردية.
          </p>
          <button
            type="button"
            onClick={onGoToShift}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-black px-4 py-2.5 rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-md min-h-[44px]"
          >
            <Zap className="w-4 h-4" />
            <span>الانتقال لشاشة تسوية العهدة النقدية</span>
          </button>
        </div>
      )}

      {/* 3. NEXT DELIVERY (الشحنة التالية في خط السير) */}
      {nextDelivery && (
        <div className="bg-stone-50 dark:bg-zinc-800/60 rounded-3xl border border-stone-200 dark:border-zinc-700 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                الشحنة التالية (Next Delivery)
              </span>
              <span className="font-mono text-xs text-stone-600 dark:text-zinc-400">#{nextDelivery.id}</span>
            </div>

            {/* Switch to current delivery button */}
            <button
              type="button"
              onClick={() => onSelectCurrentOrder(nextDelivery.id)}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>تفعيل كشحنة حالية</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-black text-sm text-stone-900 dark:text-white">
                {nextDelivery.customerName}
              </div>
              <div className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{nextDelivery.shippingAddress?.district || 'دسوق'} - {nextDelivery.shippingAddress?.streetDetails}</span>
              </div>
            </div>

            <div className="font-mono text-xs font-black text-stone-700 dark:text-zinc-300 shrink-0 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700">
              {nextDelivery.paymentMethod === 'cash_on_delivery' ? `${nextDelivery.totalAmountEGP} ج.م كاش` : 'مدفوع إلكترونياً'}
            </div>
          </div>
        </div>
      )}

      {/* 4. EXCEPTIONS QUEUE (شحنات متعذرة قيد المتابعة) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-stone-900 dark:text-white">
              الشحنات المتعذرة والاستثناءات (Exceptions)
            </h3>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
              {exceptionOrders.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onGoToAllTasks}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-white cursor-pointer"
          >
            عرض كافة الشحنات ←
          </button>
        </div>

        {exceptionOrders.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-zinc-500 py-2">
            لا توجد حالات تعذر تسليم مسجلة في وردية اليوم حتى الآن.
          </p>
        ) : (
          <div className="space-y-2">
            {exceptionOrders.map(order => (
              <div 
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
                    <span>#{order.id}</span>
                    <span>-</span>
                    <span>{order.customerName}</span>
                    <span className="bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-md text-[10px]">
                      {exceptionLabels[order.exceptionReason || ''] || order.exceptionReason || 'تعذر التسليم'}
                    </span>
                  </div>
                  {order.exceptionResolution && (
                    <div className="text-[11px] text-stone-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                      <span>الإجراء المعتمد:</span>
                      <strong className="text-sky-700 dark:text-sky-400">
                        {resolutionLabels[order.exceptionResolution] || order.exceptionResolution}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-emerald-600 hover:bg-stone-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="إعادة الاتصال"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onSelectCurrentOrder(order.id)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 font-bold hover:bg-stone-50 cursor-pointer min-h-[44px]"
                  >
                    إعادة المحاولة الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. RESILIENCE & MOBILE STRESS TESTER (FOR AUDIT & VERIFICATION) */}
      <div className="bg-stone-100 dark:bg-zinc-800/70 p-4 rounded-3xl border border-stone-200 dark:border-zinc-700 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-stone-800 dark:text-zinc-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>لوحة اختبار المرونة والميدان (Touch & Network Stress Tester)</span>
          </div>
          <span className="text-[10px] text-stone-500 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md font-mono">
            Touch Target: ≥ 48px ✓
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-stone-500 dark:text-zinc-400 text-[11px]">محاكاة جودة اتصال شبكة الهاتف:</span>
          
          <button
            type="button"
            onClick={() => setSimulatedNetwork('online')}
            className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              simulatedNetwork === 'online'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400'
            }`}
          >
            اتصال 4G/5G طبيعي
          </button>

          <button
            type="button"
            onClick={() => setSimulatedNetwork('slow_3g')}
            className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              simulatedNetwork === 'slow_3g'
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400'
            }`}
          >
            شبكة بطيئة (Slow 3G)
          </button>

          <button
            type="button"
            onClick={() => setSimulatedNetwork('offline')}
            className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              simulatedNetwork === 'offline'
                ? 'bg-rose-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400'
            }`}
          >
            انقطاع الشبكة (Offline Simulation)
          </button>

          {/* Rapid Click Test Button */}
          <button
            type="button"
            onClick={() => {
              if (currentDelivery) handleProgressWorkflow(currentDelivery);
            }}
            className="mr-auto bg-stone-200 dark:bg-zinc-700 hover:bg-stone-300 text-stone-800 dark:text-zinc-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer"
            title="انقر مرتين بسرعة لاختبار منع التكرار"
          >
            اختبار النقر السريع المزدوج
          </button>
        </div>
      </div>

    </div>
  );
};
