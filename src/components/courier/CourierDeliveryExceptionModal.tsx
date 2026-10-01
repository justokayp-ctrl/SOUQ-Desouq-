import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Calendar, 
  PhoneOff, 
  MapPinOff, 
  UserX, 
  CreditCard, 
  PackageX, 
  CheckCircle2, 
  RotateCcw, 
  LifeBuoy, 
  Clock 
} from 'lucide-react';
import { MarketplaceOrder, DeliveryExceptionReason, DeliveryExceptionResolution } from '../../types';

interface CourierDeliveryExceptionModalProps {
  order: MarketplaceOrder | null;
  onClose: () => void;
  onSubmitException: (
    order: MarketplaceOrder, 
    reason: DeliveryExceptionReason, 
    note: string, 
    rescheduleDate: string,
    resolution: DeliveryExceptionResolution
  ) => Promise<void>;
}

export const CourierDeliveryExceptionModal: React.FC<CourierDeliveryExceptionModalProps> = ({
  order,
  onClose,
  onSubmitException,
}) => {
  const [selectedReason, setSelectedReason] = useState<DeliveryExceptionReason>('customer_unavailable');
  const [selectedResolution, setSelectedResolution] = useState<DeliveryExceptionResolution>('reschedule');
  const [courierNote, setCourierNote] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendWhatsAppAlert, setSendWhatsAppAlert] = useState(true);

  if (!order) return null;

  // The 5 Core Exceptions as requested
  const reasons: { id: DeliveryExceptionReason; title: string; desc: string; icon: any }[] = [
    {
      id: 'customer_unavailable',
      title: 'العميل غير متاح (Customer Unavailable)',
      desc: 'تم الاتصال أكثر من مرة دون رد أو الهاتف مغلق تماماً',
      icon: PhoneOff,
    },
    {
      id: 'wrong_address',
      title: 'عنوان خاطئ / غير دقيق (Wrong Address)',
      desc: 'العنوان ناقص أو المعلم غير معروف أو خارج نطاق خط السير',
      icon: MapPinOff,
    },
    {
      id: 'refused',
      title: 'رفض الاستلام (Refused)',
      desc: 'العميل رفض استلام الشحنة أو تراجع عن الطلب عند الوصول',
      icon: UserX,
    },
    {
      id: 'payment_problem',
      title: 'مشكلة في الدفع / التحصيل (Payment Problem)',
      desc: 'عدم توفر المبلغ نقداً أو تعذر إتمام التحويل أو نقص الفكة',
      icon: CreditCard,
    },
    {
      id: 'damaged_package',
      title: 'طرد تالف / متضرر (Damaged Package)',
      desc: 'تلف في الغلاف الخارجي أو تسرب محتويات أثناء الشحن',
      icon: PackageX,
    },
  ];

  // Resolution workflow options
  const resolutions: { id: DeliveryExceptionResolution; title: string; desc: string; icon: any }[] = [
    {
      id: 'reschedule',
      title: 'إعادة الجدولة (Re-attempt)',
      desc: 'تحديد موعد جديد غداً أو في يوم يختاره العميل',
      icon: Clock,
    },
    {
      id: 'return_to_merchant',
      title: 'إرجاع للتاجر / المخزن (Return to Merchant)',
      desc: 'إعادة الشحنة لنقطة التجمع أو مخزن التاجر في دسوق',
      icon: RotateCcw,
    },
    {
      id: 'escalate_to_support',
      title: 'تصعيد للدعم الفني (Escalate to Support)',
      desc: 'إحالة المشكلة فورياً لمكتب خدمة العملاء والتحكيم للتدخل',
      icon: LifeBuoy,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmitException(order, selectedReason, courierNote, rescheduleDate, selectedResolution);

      if (sendWhatsAppAlert && order.customerPhone) {
        let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '20' + cleanPhone.slice(1);
        else if (!cleanPhone.startsWith('20')) cleanPhone = '20' + cleanPhone;

        const reasonLabel = reasons.find(r => r.id === selectedReason)?.title || 'تعذر التسليم';
        const msg = `مرحباً يا فندم أ/ ${order.customerName}، حاول كابتن سوق دسوق Express تسليم شحنتكم #${order.id} ولكن (${reasonLabel}). تم تسجيل الإجراء: (${resolutions.find(r => r.id === selectedResolution)?.title}). للتنسيق يرجى الرد على هذه الرسالة.`;
        
        try {
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        } catch {}
      }

      onClose();
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-500/30 overflow-hidden text-right max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-rose-600 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-100" />
            <div>
              <h3 className="text-base font-black">تسجيل تعذر التسليم (Exceptions)</h3>
              <p className="text-xs text-rose-100 font-mono mt-0.5">
                شحنة #{order.id} - العميل: {order.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/20 text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* 1. Reason Selection */}
          <div>
            <label className="block text-xs font-black text-stone-800 dark:text-zinc-200 mb-2">
              سبب تعذر التسليم الميداني:
            </label>
            <div className="space-y-2">
              {reasons.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-right transition-all cursor-pointer min-h-[52px] ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-xs ring-1 ring-rose-500'
                        : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-700 dark:text-zinc-300 bg-stone-50/50 dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isSelected ? 'bg-rose-500 text-white' : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-xs sm:text-sm">
                        {r.title}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Resolution Workflow Selection */}
          <div className="pt-2 border-t border-stone-200 dark:border-zinc-800">
            <label className="block text-xs font-black text-stone-800 dark:text-zinc-200 mb-2">
              مسار الحل المعتمد (Resolution Workflow):
            </label>
            <div className="grid grid-cols-1 gap-2">
              {resolutions.map((res) => {
                const Icon = res.icon;
                const isSelected = selectedResolution === res.id;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setSelectedResolution(res.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-right transition-all cursor-pointer min-h-[48px] ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500'
                        : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-sky-500 text-white' : 'bg-stone-200 dark:bg-zinc-700 text-stone-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-xs">
                        {res.title}
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-zinc-400 mt-0.5">
                        {res.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Reschedule Date if resolution is reschedule */}
          {selectedResolution === 'reschedule' && (
            <div className="bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-stone-200 dark:border-zinc-800">
              <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>تاريخ المحاولة القادمة:</span>
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
              />
            </div>
          )}

          {/* Courier Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-1.5">
              ملاحظات المندوب الميدانية (اختياري):
            </label>
            <textarea
              value={courierNote}
              onChange={(e) => setCourierNote(e.target.value)}
              rows={2}
              placeholder="مثال: تم الاتصال 3 مرات ولا رد، تم التحدث مع الجيران، تم توثيق رقم العقار..."
              className="w-full p-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* WhatsApp Alert Option */}
          <label className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 cursor-pointer min-h-[48px]">
            <input
              type="checkbox"
              checked={sendWhatsAppAlert}
              onChange={(e) => setSendWhatsAppAlert(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5 cursor-pointer"
            />
            <div className="flex-1 text-xs">
              <span className="font-black text-emerald-900 dark:text-emerald-300 block">
                إرسال إشعار واتساب تلقائي للعميل
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                إعلام المشتري بسبب التعذر والموعد أو المسار المحدد
              </span>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-sm min-h-[48px]"
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد تسجيل حالة التعذر</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3.5 rounded-2xl border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer min-h-[48px]"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

