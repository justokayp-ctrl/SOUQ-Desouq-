import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ChevronDown, Check, Send, Sparkles } from 'lucide-react';
import { MarketplaceOrder } from '../../types';

interface WhatsAppQuickButtonProps {
  order: MarketplaceOrder;
  variant?: 'compact' | 'pill' | 'field';
}

export const WhatsAppQuickButton: React.FC<WhatsAppQuickButtonProps> = ({ order, variant = 'compact' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Clean Egyptian phone number
  const getCleanPhone = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '20' + clean.slice(1);
    } else if (!clean.startsWith('20')) {
      clean = '20' + clean;
    }
    return clean;
  };

  const cleanPhone = getCleanPhone(order.customerPhone || '01000000000');

  const templates = [
    {
      id: 'on_the_way',
      title: 'في الطريق إليك الآن 🚀',
      subtitle: 'إشعار بالوصول خلال 15-30 دقيقة',
      text: `السلام عليكم يا فندم، أنا كابتن التوصيل من منصة "سوق دسوق" ومعي طلبكم رقم #${order.trackingCode}. أنا في الطريق إليكم الآن وخلال 20-30 دقيقة هكون متواجد أمام العقار إن شاء الله.`,
    },
    {
      id: 'arrived',
      title: 'أنا أمام العقار الآن 📍',
      subtitle: 'يرجى تجهيز المبلغ وكود OTP',
      text: `السلام عليكم أ/ ${order.customerName}، كابتن سوق دسوق متواجد أمام العقار المسجل الآن لتسليم شحنتكم #${order.trackingCode}. ${order.paymentMethod === 'cash_on_delivery' ? `المبلغ المطلوب: ${order.totalAmountEGP} ج.م.` : 'الطلب مدفوع مسبقاً.'} برجاء تجهيز كود التأكيد (OTP) المكون من 4 أرقام الموضح في رسائل حسابكم. شكراً لحسن تعاونكم.`,
    },
    {
      id: 'unreachable_reschedule',
      title: 'حاولت الاتصال بكم ⏳',
      subtitle: 'إعادة جدولة موعد التسليم',
      text: `مرحباً يا فندم، مندوب سوق دسوق حاول الاتصال بكم بخصوص شحنتكم رقم #${order.trackingCode} ولم نتمكن من الوصول إليكم. يرجى مراسلتنا هنا لتأكيد أنسب موعد للتسليم اليوم أو غداً. خالص التحية.`,
    },
  ];

  const handleSendTemplate = (text: string) => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  if (variant === 'field') {
    return (
      <div className="relative inline-block w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98 text-xs sm:text-sm"
        >
          <MessageSquare className="w-4 h-4 text-emerald-100" />
          <span>مراسلة واتساب سريعة</span>
          <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full mb-2 right-0 left-0 sm:left-auto sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-emerald-500/30 p-2 z-50 text-right animate-in fade-in duration-150">
            <div className="p-2 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>رسائل واتساب الميدانية السريعة</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">{order.customerPhone}</span>
            </div>

            <div className="space-y-1.5 mt-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSendTemplate(tpl.text)}
                  className="w-full text-right p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-zinc-200 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
                      {tpl.title}
                    </span>
                    <Send className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                    {tpl.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="مراسلة العميل على واتساب برسالة جاهزة"
        className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>واتساب</span>
        <ChevronDown className="w-3 h-3 text-emerald-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 sm:right-0 sm:left-auto w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-emerald-500/30 p-2 z-50 text-right animate-in fade-in duration-150">
          <div className="p-2 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>قوالب واتساب دسوق إكسبريس</span>
            </span>
          </div>

          <div className="space-y-1.5 mt-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSendTemplate(tpl.text)}
                className="w-full text-right p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-zinc-200 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {tpl.title}
                  </span>
                  <Send className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                  {tpl.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
