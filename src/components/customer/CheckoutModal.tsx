import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Store, 
  Check, 
  Smartphone, 
  Building2, 
  Wallet, 
  Receipt,
  AlertCircle,
  Tag,
  Loader2,
  Lock,
  Timer
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { EgyptianAddress, PaymentMethod, EgyptianGovernorate } from '../../types';
import { EGYPTIAN_GOVERNORATES, DESOQ_DISTRICTS } from '../../data/mockData';
import { api } from '../../services/api';
import { FocusTrap } from '../common/FocusTrap';
import { sanitizeUserInput, normalizeEgyptianPhone, isValidEgyptianPhone } from '../../services/security';

export const CheckoutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    cartGroupedBySeller, 
    cartSubtotalEGP, 
    cartTotalShippingEGP, 
    cartGrandTotalEGP, 
    placeOrder,
    setActiveView,
    user
  } = useMarketplace();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address state initialized from logged-in user or clean empty state
  const [address, setAddress] = useState<EgyptianAddress>(() => ({
    id: `addr-${Date.now()}`,
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    governorate: 'كفر الشيخ',
    city: 'دسوق',
    district: 'شارع الجيش',
    streetDetails: '',
    buildingNo: '',
    floorNo: '',
    apartmentNo: '',
    isDefault: true,
  }));

  // Sync user info if available and form is empty
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Payment & Idempotency state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState('');
  
  // Stable idempotency key generated uniquely for this checkout attempt
  const [idempotencyKey] = useState<string>(() => 
    `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  // Authoritative server quote
  const [serverQuote, setServerQuote] = useState<{
    totalSubtotalEGP: number;
    totalShippingEGP: number;
    discountEGP: number;
    totalAmountEGP: number;
    vendorQuotes: Array<{
      sellerId: string;
      sellerName: string;
      subtotalEGP: number;
      shippingFeeEGP: number;
      commissionEGP: number;
      sellerNetEGP: number;
      items: any[];
    }>;
  } | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Fetch server authoritative quote
  const fetchQuote = async (codeToUse?: string) => {
    if (!isOpen || cart.length === 0) return;
    setIsQuoteLoading(true);
    setQuoteError(null);
    try {
      const quote = await api.calculateQuote({
        cart,
        destinationCity: address.city,
        discountCode: codeToUse !== undefined ? codeToUse : appliedDiscount,
      });
      setServerQuote(quote);
    } catch (err: any) {
      console.warn('Quote fetch error:', err);
      setQuoteError(err.message || 'فشل حساب التسعيرة من الخادم');
    } finally {
      setIsQuoteLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (step === 2 || step === 3)) {
      fetchQuote();
    }
  }, [isOpen, step, address.city, appliedDiscount]);

  // Flash-sale inventory reservation TTL state (10 minutes)
  const [reservationRemainingSeconds, setReservationRemainingSeconds] = useState<number>(600);
  const [isReservationActive, setIsReservationActive] = useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState<boolean>(false);

  const reserveCartItems = async () => {
    if (cart.length === 0) return;
    setIsReserving(true);
    setReservationError(null);
    let errorMsg: string | null = null;

    for (const item of cart) {
      try {
        const res = await api.reserveItem({
          productId: item.product.id,
          variantId: item.selectedVariant?.id,
          size: item.selectedVariant?.name,
          quantity: item.quantity,
          durationMinutes: 10
        });
        if (!res.success) {
          errorMsg = res.error || `نفد مخزون ${item.product.titleAr}`;
          break;
        }
      } catch (e: any) {
        console.warn('Reservation warning:', e);
      }
    }

    setIsReserving(false);
    if (errorMsg) {
      setReservationError(errorMsg);
      setIsReservationActive(false);
    } else {
      setIsReservationActive(true);
      setReservationRemainingSeconds(600);
    }
  };

  useEffect(() => {
    if (isOpen && cart.length > 0) {
      reserveCartItems();
    } else if (!isOpen) {
      setIsReservationActive(false);
      api.releaseReservation().catch(() => {});
    }
  }, [isOpen]);

  // Ticking countdown timer
  useEffect(() => {
    if (!isOpen || !isReservationActive) return;
    const interval = setInterval(() => {
      setReservationRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsReservationActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isReservationActive]);

  const formatRemainingTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const validatePhone = (num: string) => {
    const regex = /^(010|011|012|015)[0-9]{8}$/;
    return regex.test(num.trim());
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!address.fullName.trim() || !address.streetDetails.trim()) {
        setFormError('يرجى استكمال الاسم بالكامل وتفاصيل الشارع ورقم العقار لمتابعة التوصيل');
        return;
      }
      if (!validatePhone(address.phone)) {
        setPhoneError('يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 من 11 رقماً');
        return;
      }
      setPhoneError('');
      setFormError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleApplyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    setAppliedDiscount(code);
    fetchQuote(code);
  };

  const handleCompleteOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError('');
    try {
      const sanitizedAddress: EgyptianAddress = {
        ...address,
        fullName: sanitizeUserInput(address.fullName),
        phone: normalizeEgyptianPhone(address.phone),
        streetDetails: sanitizeUserInput(address.streetDetails),
        buildingNo: sanitizeUserInput(address.buildingNo || ''),
        floorNo: sanitizeUserInput(address.floorNo || ''),
        apartmentNo: sanitizeUserInput(address.apartmentNo || ''),
        nearestLandmark: address.nearestLandmark ? sanitizeUserInput(address.nearestLandmark) : undefined,
      };

      const createdOrder = await placeOrder(sanitizedAddress, paymentMethod, {
        idempotencyKey,
        discountCode: appliedDiscount ? sanitizeUserInput(appliedDiscount) : undefined,
      });
      if (createdOrder) {
        onClose();
        setActiveView('orders');
      } else {
        setSubmissionError('تعذر إنشاء الطلب في الوقت الحالي. يرجى مراجعة بيانات السلة والمحاولة مجدداً.');
      }
    } catch (err: any) {
      setSubmissionError(err?.message || 'حدث خطأ أثناء الاتصال بالخادم وتأكيد الطلب. برجاء المحاولة مجدداً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Values from authoritative server quote if available, fallback to client estimates
  const displaySubtotal = serverQuote ? serverQuote.totalSubtotalEGP : cartSubtotalEGP;
  const displayShipping = serverQuote ? serverQuote.totalShippingEGP : cartTotalShippingEGP;
  const displayDiscount = serverQuote ? serverQuote.discountEGP : (appliedDiscount ? 50 : 0);
  const displayGrandTotal = serverQuote ? serverQuote.totalAmountEGP : Math.max(0, cartGrandTotalEGP - displayDiscount);

  return (
    <FocusTrap
      isActive={isOpen}
      onClose={onClose}
      aria-label="إتمام الشراء — سوق دسوق الموحد"
      id="checkout-modal-overlay" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-[#800020]/10 dark:border-zinc-800 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-b border-[#800020]/10 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#800020] dark:text-[#D4AF37]">إتمام الشراء — سوق دسوق الموحد</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                تسجيل الطلب وتوزيعه آلياً على التجار المستقلين
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] rounded-full border border-[#800020]/10 dark:border-zinc-700 flex items-center justify-center text-gray-500 hover:text-[#800020] dark:hover:text-[#D4AF37] transition-colors"
            aria-label="إغلاق نافذة إتمام الشراء"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#F5F2ED] dark:bg-zinc-800/90 p-3 border-b border-[#800020]/10 dark:border-zinc-700 flex items-center justify-around text-xs font-bold">
          <button 
            onClick={() => setStep(1)} 
            className={`flex items-center gap-1.5 transition-colors ${step === 1 ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-gray-400 dark:text-zinc-500'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step >= 1 ? 'bg-[#800020] text-white' : 'bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300'
            }`}>١</span>
            <span>عنوان التوصيل</span>
          </button>

          <span className="text-gray-300 dark:text-zinc-600">←</span>

          <button 
            onClick={() => step > 1 && setStep(2)} 
            className={`flex items-center gap-1.5 transition-colors ${step === 2 ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-gray-400 dark:text-zinc-500'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step >= 2 ? 'bg-[#800020] text-white' : 'bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300'
            }`}>٢</span>
            <span>توزيع طرود التجار</span>
          </button>

          <span className="text-gray-300 dark:text-zinc-600">←</span>

          <button 
            onClick={() => step > 2 && setStep(3)} 
            className={`flex items-center gap-1.5 transition-colors ${step === 3 ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-gray-400 dark:text-zinc-500'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 3 ? 'bg-[#800020] text-white' : 'bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300'
            }`}>٣</span>
            <span>طريقة الدفع والتأكيد</span>
          </button>
        </div>

        {/* Flash-Sale Live Size Reservation Status Banner */}
        <div className="px-4 py-2 bg-[#FAF6EE] dark:bg-zinc-800/95 border-b border-[#D4AF37]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#800020] dark:text-[#D4AF37]">
            <Lock className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>
              {isReservationActive ? (
                <>
                  <strong className="font-bold">حجز المقاسات مؤمّن ومقفل:</strong> محجوزة حصرياً لك لمدة{' '}
                  <span className="font-mono font-bold text-[#800020] dark:text-[#D4AF37] bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-md border border-[#D4AF37]/40">
                    {formatRemainingTime(reservationRemainingSeconds)}
                  </span>
                  {' '}لمنع بيعها لمتسوق آخر أثناء الشراء.
                </>
              ) : reservationError ? (
                <span className="text-red-600 dark:text-red-400 font-medium">{reservationError}</span>
              ) : isReserving ? (
                <span>جارٍ تأمين وحجز المقاسات في المخزن...</span>
              ) : (
                <span>انتهت مهلة الحجز المبدئي (10 دقائق).</span>
              )}
            </span>
          </div>
          {!isReservationActive && !isReserving && (
            <button
              type="button"
              onClick={reserveCartItems}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#800020] text-white hover:bg-[#600018] transition-colors shrink-0"
            >
              تجديد الحجز 🔄
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Address Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                بيانات مستلم الشحنة والعنوان المصري
              </h4>

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                    الاسم بالكامل (ثلاثي) <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => {
                      setAddress({ ...address, fullName: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm"
                    placeholder="أدخل الاسم الثلاثي لمستلم الطلب"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                    رقم الهاتف المصري <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => {
                      setAddress({ ...address, phone: e.target.value });
                      setPhoneError('');
                      if (formError) setFormError('');
                    }}
                    className={`w-full rounded-xl p-3 outline-none text-sm ${
                      phoneError 
                        ? 'bg-red-50 dark:bg-red-950/30 ring-1 ring-red-500 text-red-900 dark:text-red-200' 
                        : 'bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 focus:ring-1 focus:ring-[#D4AF37]'
                    }`}
                    placeholder="010XXXXXXXX"
                  />
                  {phoneError ? (
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-semibold">{phoneError}</p>
                  ) : (
                    <p className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">يُستخدم للتنسيق مع مندوب الشحن بدسوق</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">المحافظة:</label>
                  <select
                    value={address.governorate}
                    onChange={(e) => setAddress({ ...address, governorate: e.target.value as EgyptianGovernorate })}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none text-sm focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">المدينة / المركز:</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none text-sm focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="دسوق"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                    الحي / الشارع الرئيسي بدسوق أو المركز:
                  </label>
                  <select
                    value={address.district}
                    onChange={(e) => setAddress({ ...address, district: e.target.value })}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none text-sm focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    {DESOQ_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                    تفاصيل الشارع وأقرب علامة مميزة <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={address.streetDetails}
                    onChange={(e) => {
                      setAddress({ ...address, streetDetails: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none text-sm focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="مثال: شارع المحطة، عمارة الأطباء، بجوار مسجد سيدي إبراهيم الدسوقي"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">رقم العقار / العمارة (اختياري):</label>
                  <input
                    type="text"
                    value={address.buildingNo}
                    onChange={(e) => setAddress({ ...address, buildingNo: e.target.value })}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none text-sm focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="14"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">الدور والشقة (اختياري):</label>
                  <input
                    type="text"
                    value={address.apartmentNo}
                    onChange={(e) => setAddress({ ...address, apartmentNo: e.target.value })}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 dark:text-zinc-100 border-none dark:border dark:border-zinc-700 rounded-xl p-3 outline-none text-sm focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="الدور 3 - شقة 6"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Multi-Vendor Decomposition Overview */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F5F2ED] dark:bg-zinc-800/80 rounded-2xl border border-[#800020]/10 dark:border-zinc-700 space-y-1.5">
                <h4 className="font-serif font-bold text-sm text-[#800020] dark:text-[#D4AF37] flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  تقسيم وتجزئة شحنات التجار (Order Split)
                </h4>
                <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                  بموجب معمارية سوق دسوق، سيتم تقسيم مشترياتك إلى {cartGroupedBySeller.length} طرود مستقلة. يقوم كل بائع بتغليف وتسليم طرده لمندوب الشحن بشكل منفصل لضمان أقصى سرعة وجودة.
                </p>
              </div>

              <div className="space-y-3">
                {cartGroupedBySeller.map((group, idx) => (
                  <div key={group.seller.id} className="p-4 rounded-2xl border border-[#800020]/10 dark:border-zinc-700 bg-white dark:bg-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#800020] text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#1A1A1A] dark:text-zinc-100">{group.seller.name}</span>
                      </div>
                      <span className="text-[10px] bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full font-semibold">
                        {group.seller.city === 'دسوق' ? 'تسليم سريع داخل دسوق خلال 24 ساعة' : 'شحن المحافظات خلال 2-3 أيام'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-zinc-300 space-y-1">
                      {group.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <span>• {item.product.titleAr} ({item.quantity}×)</span>
                          <span className="font-bold text-[#1A1A1A] dark:text-zinc-100">
                            {(item.selectedVariant ? item.selectedVariant.priceEGP : item.product.priceEGP) * item.quantity} ج.م
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-700 text-[11px] text-gray-500 dark:text-zinc-400">
                      <span>مصاريف الشحن لمتجر {group.seller.city}:</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-zinc-200">{group.shippingFeeEGP} ج.م</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method & Final Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                اختر طريقة الدفع المناسبة لك في مصر:
              </h4>

              <div className="space-y-2.5">
                
                {/* Cash on Delivery */}
                <label 
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#F5F2ED] dark:bg-zinc-800 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="mt-1 text-[#800020] accent-[#800020]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">الدفع نقداً عند الاستلام (COD)</span>
                      <span className="bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full">الأكثر شيوعاً</span>
                    </div>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      ادفع نقداً لمندوب سوق دسوق عند وصول الطرد إلى باب منزلك بعد معاينة الشحنة.
                    </p>
                  </div>
                </label>

                {/* Fawry */}
                <label 
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'fawry'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#F5F2ED] dark:bg-zinc-800 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'fawry'}
                    onChange={() => setPaymentMethod('fawry')}
                    className="mt-1 text-[#800020] accent-[#800020]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">فوري (Fawry Pay)</span>
                      <span className="bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full">كود سداد فوري</span>
                    </div>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      يتم توليد كود سداد صالح لمدة 48 ساعة للدفع في أي ماكينة فوري بكافة أنحاء مصر.
                    </p>
                  </div>
                </label>

                {/* Vodafone Cash */}
                <label 
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#F5F2ED] dark:bg-zinc-800 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'vodafone_cash'}
                    onChange={() => setPaymentMethod('vodafone_cash')}
                    className="mt-1 text-[#800020] accent-[#800020]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">محافظ الهواتف الذكية (فودافون كاش / أورنج / وي)</span>
                      <span className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">محفظة إلكترونية</span>
                    </div>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      تحويل فوري لمحفظة سوق دسوق المعتمدة مع إرسال رسالة تأكيد فورية.
                    </p>
                  </div>
                </label>

                {/* InstaPay */}
                <label 
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === 'instapay'
                      ? 'border-[#800020] dark:border-[#D4AF37] bg-[#F5F2ED] dark:bg-zinc-800 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'instapay'}
                    onChange={() => setPaymentMethod('instapay')}
                    className="mt-1 text-[#800020] accent-[#800020]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">إنستاباي (InstaPay IPN)</span>
                      <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">تحويل بنكي لحظي</span>
                    </div>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      تحويل مصرفي لحظي عبر البنك المركزي المصري ومعرف IPA للمنصة.
                    </p>
                  </div>
                </label>
              </div>

              {/* Discount Code Input */}
              <div className="p-3 bg-[#F5F2ED] dark:bg-zinc-800 rounded-2xl border border-[#800020]/10 dark:border-zinc-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0" />
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="كود الخصم (مثال: DESOQ10)"
                  className="bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl text-xs flex-1 outline-none border border-gray-200 dark:border-zinc-700 uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="bg-[#800020] text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#600018] transition-colors"
                >
                  تطبيق
                </button>
              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-2xl bg-[#F5F2ED] dark:bg-zinc-800/90 border border-[#800020]/10 dark:border-zinc-700 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-zinc-700">
                  <span className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    تسعيرة معتمدة من خادم سوق دسوق
                  </span>
                  {isQuoteLoading ? (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> جاري التحديث...
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                      مفتاح فريد: {idempotencyKey.slice(0, 16)}...
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>إجمالي سعر المنتجات:</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-zinc-100">{displaySubtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>إجمالي الشحن ({cartGroupedBySeller.length} متاجر):</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-zinc-100">{displayShipping} ج.م</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between text-green-700 dark:text-green-400 font-medium">
                    <span>الخصم المطبق ({appliedDiscount}):</span>
                    <span>-{displayDiscount} ج.م</span>
                  </div>
                )}
                {quoteError && (
                  <div className="text-red-600 dark:text-red-400 text-[11px]">
                    {quoteError}
                  </div>
                )}
                {submissionError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{submissionError}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-serif font-bold text-[#800020] dark:text-[#D4AF37] pt-2 border-t border-gray-200 dark:border-zinc-700">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="text-lg">{displayGrandTotal} ج.م</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-[#800020]/10 dark:border-zinc-800 flex items-center justify-between pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-5 py-2.5 min-h-[44px] rounded-full border border-gray-300 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              ← رجوع
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 min-h-[44px] rounded-full border border-gray-300 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              إلغاء
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-[#800020] hover:bg-[#600018] text-white px-7 py-2.5 min-h-[44px] rounded-full text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              المتابعة للخطوة التالية ←
            </button>
          ) : (
            <button
              id="confirm-place-order-btn"
              type="button"
              onClick={handleCompleteOrder}
              disabled={isSubmitting || isQuoteLoading}
              className={`bg-[#800020] hover:bg-[#600018] text-white px-8 py-3 min-h-[48px] rounded-full text-xs font-bold shadow-lg transition-colors flex items-center gap-2 cursor-pointer ${
                isSubmitting || isQuoteLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {isSubmitting 
                  ? 'جاري إرسال الطلب وحجز المخزون بالخادم...' 
                  : `تأكيد الطلب وتوليد كود التتبع (${displayGrandTotal} ج.م)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </FocusTrap>
  );
};
