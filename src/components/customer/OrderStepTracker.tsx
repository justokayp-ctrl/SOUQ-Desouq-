import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  Package, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles,
  Info,
  PhoneCall,
  Check,
  AlertCircle
} from 'lucide-react';
import { OrderStatus, MarketplaceOrder } from '../../types';

interface OrderStepTrackerProps {
  order: MarketplaceOrder;
  className?: string;
  allowInteractiveSimulation?: boolean;
}

interface StepInfo {
  key: OrderStatus;
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  detailedDescAr: string;
  locationAr: string;
  timeEstimateAr: string;
  icon: React.ElementType;
  color: string;
}

export const OrderStepTracker: React.FC<OrderStepTrackerProps> = ({ 
  order, 
  className = '',
  allowInteractiveSimulation = false
}) => {
  const actualStatus = (order.orderStatus || order.status || 'seller_confirmed') as OrderStatus;
  const [simulatedStatus, setSimulatedStatus] = useState<OrderStatus | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  const activeStatus = simulatedStatus || actualStatus;

  const STEPS: StepInfo[] = [
    {
      key: 'seller_confirmed',
      stepNumber: 1,
      titleAr: 'تأكيد التاجر والتجهيز',
      titleEn: 'Merchant Confirmed',
      shortDescAr: 'تم فحص القطع وتغليفها في مشغل التاجر',
      detailedDescAr: 'قام التاجر المعتمد بمراجعة تفاصيل طلبك، واختبار جودة الخامات والتأكد من المقاسات المطلوبة، وتم تغليف الطرد بالباركود الرسمي المعتمد.',
      locationAr: 'مشغل التاجر، دسوق',
      timeEstimateAr: 'تم الإنجاز خلال 30 دقيقة',
      icon: Store,
      color: '#800020'
    },
    {
      key: 'shipped',
      stepNumber: 2,
      titleAr: 'الفرز والشحن اللوجستي',
      titleEn: 'Sorted & Shipped',
      shortDescAr: 'تم استلام الشحنة في مركز التجميع بدسوق',
      detailedDescAr: 'تم دمج شحنات التجار المشاركين في طرد موحد، وتسجيل بوليصة الشحن الرسمية وربطها بنظام التتبع المباشر لخدمة التوصيل السريع.',
      locationAr: 'مركز الفرز والتوزيع المركزي، شارع الجيش',
      timeEstimateAr: 'تم التجهيز للشحن الفوري',
      icon: Package,
      color: '#A81335'
    },
    {
      key: 'out_for_delivery',
      stepNumber: 3,
      titleAr: 'خرج للتوصيل مع المندوب',
      titleEn: 'Out for Delivery',
      shortDescAr: 'المندوب في طريقه لعنوانك مع إمكانية المعاينة',
      detailedDescAr: 'طردك الآن بصحبة مندوب سوق دسوق المعتمد في طريق التسليم إلى عنوانك، مع إتاحة حق المعاينة وقياس الملابس أو فحص المنتجات قبل السداد.',
      locationAr: `منطقة ${order.shippingAddress?.district || 'وسط دسوق'}، كفر الشيخ`,
      timeEstimateAr: 'التسليم متوقع خلال 2 - 4 ساعات',
      icon: Truck,
      color: '#D4AF37'
    },
    {
      key: 'delivered',
      stepNumber: 4,
      titleAr: 'تم التسليم والمعاينة',
      titleEn: 'Delivered & Verified',
      shortDescAr: 'تم تسليم الشحنة بنجاح واستيفاء الضمان',
      detailedDescAr: 'تم تسليم الطرد للعميل واستلام إيصال الدفع، مع تفعيل حق الاستبدال والاسترجاع القانوني لمدة 14 يوماً وفق معايير حماية المستهلك.',
      locationAr: 'عنوان العميل النهائي',
      timeEstimateAr: 'اكتملت عملية التسليم',
      icon: ShieldCheck,
      color: '#10B981'
    }
  ];

  const getStatusIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'seller_confirmed': return 0;
      case 'shipped': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getStatusIndex(activeStatus);
  const activeDetailStep = selectedStepIndex !== null ? STEPS[selectedStepIndex] : STEPS[currentStepIndex];

  // Percentage for the animated horizontal progress rail
  const progressPercent = (currentStepIndex / (STEPS.length - 1)) * 100;

  return (
    <div className={`bg-gradient-to-b from-white to-[#FAF6EE]/60 dark:from-zinc-900 dark:to-zinc-900/90 rounded-3xl p-5 sm:p-7 border border-[#800020]/15 dark:border-zinc-800 shadow-lg space-y-6 ${className}`}>
      
      {/* 1. Header Bar with Status Badge and Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#800020]/10 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#800020] dark:bg-[#800020]/90 text-[#FAF6EE] flex items-center justify-center shadow-md">
            <Truck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100">
                مسار الشحن والتوصيل المباشر
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 bg-[#800020]/10 dark:bg-[#D4AF37]/20 text-[#800020] dark:text-[#D4AF37] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#800020]/20 dark:border-[#D4AF37]/30">
                <Sparkles className="w-2.5 h-2.5" />
                <span>شحن محلي فائق السرعة</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
              تتبع حي لمراحل تجهيز وانتقال الطرد خطوة بخطوة مع إمكانية المعاينة عند الاستلام
            </p>
          </div>
        </div>

        {/* Live heartbeat pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>تحديث مباشر</span>
          </div>

          {/* Interactive Simulation Switcher Toggle (if enabled) */}
          {allowInteractiveSimulation && (
            <div className="hidden lg:flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-full border border-stone-200 dark:border-zinc-700 text-[10px] font-bold">
              <span className="px-2 text-stone-400">معاينة:</span>
              {STEPS.map((s, idx) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setSimulatedStatus(s.key);
                    setSelectedStepIndex(idx);
                  }}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    activeStatus === s.key 
                      ? 'bg-[#800020] text-white shadow-xs' 
                      : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
                  }`}
                >
                  مرحلة {idx + 1}
                </button>
              ))}
              {simulatedStatus && (
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedStatus(null);
                    setSelectedStepIndex(null);
                  }}
                  className="px-2 py-0.5 text-red-600 hover:underline cursor-pointer"
                  title="استعادة الحالة الأصلية"
                >
                  إلغاء
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Visual Step Tracker Animation Rail */}
      <div className="relative pt-6 pb-4 px-2 sm:px-6">
        
        {/* Background Rail */}
        <div className="absolute top-12 left-6 right-6 sm:left-12 sm:right-12 h-2 bg-stone-200 dark:bg-zinc-800 rounded-full -translate-y-1/2 z-0" />

        {/* Animated Progress Filled Rail */}
        <div className="absolute top-12 left-6 right-6 sm:left-12 sm:right-12 h-2 rounded-full -translate-y-1/2 z-0 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#800020] via-[#A81335] to-[#D4AF37] shadow-sm relative"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 18, duration: 0.8 }}
          >
            {/* Pulsing light beam traveling on progress bar */}
            <motion.div 
              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* The 4 Step Nodes */}
        <div className="relative z-10 grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;
            const isSelected = selectedStepIndex === idx;
            const StepIcon = step.icon;

            return (
              <div 
                key={step.key} 
                className="flex flex-col items-center text-center cursor-pointer group"
                onClick={() => setSelectedStepIndex(idx)}
              >
                {/* Step Circle Container */}
                <div className="relative mb-3 flex items-center justify-center">
                  
                  {/* Glowing radar rings for the current active step */}
                  {isCurrent && (
                    <>
                      <motion.span 
                        className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#800020]/20 dark:bg-[#D4AF37]/25"
                        animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0.2, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      />
                      <motion.span 
                        className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#D4AF37]/15 dark:bg-[#D4AF37]/10"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.4, ease: 'easeInOut' }}
                      />
                    </>
                  )}

                  {/* Main Node Circle */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                      isCompleted 
                        ? 'bg-[#800020] text-white ring-4 ring-[#800020]/20' 
                        : isCurrent 
                          ? 'bg-[#800020] text-white ring-4 ring-[#D4AF37] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-lg' 
                          : 'bg-white dark:bg-zinc-800 text-stone-400 dark:text-zinc-500 border-2 border-stone-300 dark:border-zinc-700'
                    } ${isSelected ? 'scale-110' : ''}`}
                    aria-label={`${step.titleAr} - ${isCompleted ? 'مكتمل' : isCurrent ? 'جاري الآن' : 'قيد الانتظار'}`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] stroke-[3]" />
                      </motion.div>
                    ) : (
                      <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent ? 'text-[#D4AF37]' : ''}`} />
                    )}

                    {/* Step Number Tag Pill */}
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center border ${
                      isCompleted || isCurrent 
                        ? 'bg-[#D4AF37] text-[#800020] border-white dark:border-zinc-900' 
                        : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300 border-white dark:border-zinc-900'
                    }`}>
                      {step.stepNumber}
                    </span>
                  </motion.button>
                </div>

                {/* Step Titles & Status Description */}
                <div className="space-y-1 w-full px-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-[11px] sm:text-xs font-black block leading-tight transition-colors ${
                      isCurrent 
                        ? 'text-[#800020] dark:text-[#E8B838] underline decoration-[#D4AF37] decoration-2' 
                        : isCompleted 
                          ? 'text-stone-900 dark:text-zinc-200' 
                          : 'text-stone-400 dark:text-zinc-500'
                    }`}>
                      {step.titleAr}
                    </span>
                  </div>

                  {/* Status Indicator Label */}
                  {isCurrent && (
                    <motion.span 
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block bg-[#800020] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs"
                    >
                      جاري التنفيذ ⚡
                    </motion.span>
                  )}
                  {isCompleted && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>مكتمل</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[9px] sm:text-[10px] font-medium text-stone-400 dark:text-zinc-500">
                      قيد الانتظار
                    </span>
                  )}

                  <p className="hidden md:block text-[10px] text-stone-500 dark:text-zinc-400 leading-snug truncate">
                    {step.shortDescAr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Milestone Card with Slide Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDetailStep.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-zinc-850 p-4 sm:p-5 rounded-2xl border-2 border-[#800020]/20 dark:border-zinc-700 shadow-md space-y-3 relative overflow-hidden"
        >
          {/* Top Decorative accent line */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#800020]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#800020]/20">
                <activeDetailStep.icon className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-zinc-100">
                    المرحلة {activeDetailStep.stepNumber}: {activeDetailStep.titleAr}
                  </span>
                  {activeDetailStep.stepNumber - 1 === currentStepIndex && (
                    <span className="bg-[#800020] text-[#FAF6EE] text-[9px] font-black px-2 py-0.2 rounded-full">
                      المرحلة الحالية
                    </span>
                  )}
                  {activeDetailStep.stepNumber - 1 < currentStepIndex && (
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.2 rounded-full">
                      تمت بنجاح
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  {activeDetailStep.detailedDescAr}
                </p>
              </div>
            </div>

            {/* Quick action button or badge */}
            <div className="shrink-0 text-left w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-zinc-800 flex sm:flex-col items-center sm:items-end justify-between gap-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-zinc-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                <span>{activeDetailStep.timeEstimateAr}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-zinc-400">
                <MapPin className="w-3 h-3 text-[#800020]" />
                <span className="truncate max-w-[200px]">{activeDetailStep.locationAr}</span>
              </div>
            </div>
          </div>

          {/* Courier & Customer OTP Box when Out for Delivery */}
          {(activeStatus === 'out_for_delivery' || order.deliveryOtp) && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                  <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>الكابتن المسند: <strong>{order.assignedCourierName || 'إبراهيم عاشور (مندوب دسوق Express)'}</strong></span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  سوف يطلب منك المندوب كود التأكيد الرقمي (OTP) عند استلامك للشحنة والمعاينة
                </p>
              </div>

              {order.deliveryOtp && (
                <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-amber-500 rounded-xl px-4 py-1.5 text-center shrink-0 shadow-xs">
                  <span className="text-[10px] text-stone-500 dark:text-zinc-400 block font-bold">كود الاستلام (OTP):</span>
                  <span className="text-base font-black font-mono tracking-widest text-[#800020] dark:text-amber-400">
                    {order.deliveryOtp}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Guarantee Pill inside Milestone */}
          <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400 gap-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold">حق المعاينة الكاملة والقياس قبل سداد قيمة الطلب للمندوب</span>
            </span>
            <span className="text-[#800020] dark:text-[#D4AF37] font-bold">
              خدمة عملاء دسوق: 19000
            </span>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
