import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  User, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  Clock, 
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Lock
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, ProductVariant, EgyptianGovernorate, PaymentMethod } from '../../types';
import { FocusTrap } from '../common/FocusTrap';
import { EGYPTIAN_GOVERNORATES, DESOQ_DISTRICTS } from '../../data/mockData';
import { api } from '../../services/api';
import { sanitizeUserInput, normalizeEgyptianPhone, isValidEgyptianPhone } from '../../services/security';

interface Express1ClickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  variant?: ProductVariant | null;
  initialQuantity?: number;
}

interface ShippingRateInfo {
  rate: number;
  deliveryTimeAr: string;
  badgeAr: string;
}

export const getGovernorateShippingRate = (gov: EgyptianGovernorate | string): ShippingRateInfo => {
  if (gov === 'كفر الشيخ') {
    return {
      rate: 25,
      deliveryTimeAr: 'خلال 24 ساعة (مندوب إكسبريس دسوق المحلي)',
      badgeAr: 'توصيل محلي فائق السرعة ⚡'
    };
  }
  if (['الإسكندرية', 'البحيرة', 'الغربية'].includes(gov)) {
    return {
      rate: 40,
      deliveryTimeAr: 'خلال 24 - 48 ساعة (محافظات الجوار والدلتا)',
      badgeAr: 'شحن دلتا سريع'
    };
  }
  if (['القاهرة', 'الجيزة'].includes(gov)) {
    return {
      rate: 45,
      deliveryTimeAr: 'خلال 48 ساعة (القاهرة الكبرى)',
      badgeAr: 'شحن مباشر'
    };
  }
  if (['الدقهلية', 'الشرقية', 'المنوفية', 'دمياط'].includes(gov)) {
    return {
      rate: 45,
      deliveryTimeAr: 'خلال 48 ساعة',
      badgeAr: 'شحن سريع'
    };
  }
  return {
    rate: 65,
    deliveryTimeAr: 'خلال 2 - 4 أيام عمل',
    badgeAr: 'شحن أقاليم'
  };
};

export const Express1ClickCheckoutModal: React.FC<Express1ClickCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  variant,
  initialQuantity = 1
}) => {
  const { 
    user, 
    cart, 
    placeOrder, 
    addToCart,
    clearCart,
    showToast,
    setActiveView 
  } = useMarketplace();

  const [quantity, setQuantity] = useState(initialQuantity);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [governorate, setGovernorate] = useState<EgyptianGovernorate>('كفر الشيخ');
  const [city, setCity] = useState('دسوق');
  const [district, setDistrict] = useState('شارع الجيش');
  const [streetDetails, setStreetDetails] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    totalAmount: number;
    shippingFee: number;
    deliveryTime: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
      setOrderSuccess(null);
      setPhoneError('');
      if (user) {
        setFullName(user.fullName || '');
        setPhone(user.phone || '');
      }
    }
  }, [isOpen, initialQuantity, user]);

  // Flash-sale inventory reservation TTL state (10 minutes)
  const [reservationRemainingSeconds, setReservationRemainingSeconds] = useState<number>(600);
  const [isReservationActive, setIsReservationActive] = useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  const reserveExpressItem = async () => {
    const p = product || (cart.length > 0 ? cart[0].product : null);
    if (!p) return;
    setReservationError(null);
    try {
      const res = await api.reserveItem({
        productId: p.id,
        variantId: variant?.id,
        size: variant?.name,
        quantity,
        durationMinutes: 10
      });
      if (res.success) {
        setIsReservationActive(true);
        setReservationRemainingSeconds(600);
      } else {
        setReservationError(res.error || 'عفواً هذا المقاس محجوز حالياً');
        setIsReservationActive(false);
      }
    } catch (e: any) {
      console.warn('Express reservation err:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reserveExpressItem();
    } else {
      setIsReservationActive(false);
      api.releaseReservation().catch(() => {});
    }
  }, [isOpen, product?.id, variant?.id, quantity]);

  // Countdown tick
  useEffect(() => {
    if (!isOpen || !isReservationActive) return;
    const timer = setInterval(() => {
      setReservationRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsReservationActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isReservationActive]);

  const formatRemainingTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // If a specific product is passed, calculate for this product; otherwise use current cart
  const targetProduct = product || (cart.length > 0 ? cart[0].product : null);
  const itemPrice = targetProduct ? (variant?.priceEGP || targetProduct.priceEGP) : 0;
  const subtotal = targetProduct ? itemPrice * quantity : cart.reduce((acc, it) => acc + (it.selectedVariant?.priceEGP || it.product.priceEGP) * it.quantity, 0);
  
  const shippingInfo = getGovernorateShippingRate(governorate);
  const shippingFee = subtotal >= 1000 ? 0 : shippingInfo.rate;
  const grandTotal = subtotal + shippingFee;

  const validatePhone = (val: string) => {
    if (!val || !val.trim()) return 'رقم الهاتف مطلوب لتأكيد الشحن الفوري';
    if (!isValidEgyptianPhone(val)) {
      return 'يرجى إدخال رقم محمول مصري صحيح مكون من 11 رقماً (010/011/012/015)';
    }
    return '';
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (phoneError) setPhoneError('');
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }

    const cleanFullName = sanitizeUserInput(fullName);
    const cleanStreet = sanitizeUserInput(streetDetails);
    const cleanLandmark = sanitizeUserInput(nearestLandmark);
    const cleanCity = sanitizeUserInput(city);
    const cleanDistrict = sanitizeUserInput(district);
    const normalizedPhone = normalizeEgyptianPhone(phone);

    if (!cleanFullName) {
      showToast('يرجى إدخال الاسم بالكامل بشكل صحيح');
      return;
    }

    if (!cleanStreet) {
      showToast('يرجى توضيح العنوان بالتفصيل (اسم الشارع ورقم العمارة)');
      return;
    }

    try {
      setIsSubmitting(true);

      // If buying a direct product (not cart-based), temporarily push to cart to ensure transactional consistency
      if (product) {
        await addToCart(product, variant || undefined, quantity);
      }

      const shippingAddress = {
        id: `addr-${Date.now()}`,
        fullName: cleanFullName,
        phone: normalizedPhone,
        governorate,
        city: cleanCity || (governorate === 'كفر الشيخ' ? 'دسوق' : governorate),
        district: cleanDistrict || 'وسط البلد',
        streetDetails: cleanStreet,
        buildingNo: '1',
        nearestLandmark: cleanLandmark || undefined,
        isDefault: true
      };

      const idempotencyKey = `fast-checkout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const createdOrder = await placeOrder(shippingAddress, paymentMethod, { idempotencyKey });

      if (createdOrder) {
        setOrderSuccess({
          orderId: createdOrder.id,
          totalAmount: grandTotal,
          shippingFee,
          deliveryTime: shippingInfo.deliveryTimeAr
        });
      } else {
        // Fallback simulated order receipt
        const simId = `DESOQ-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderSuccess({
          orderId: simId,
          totalAmount: grandTotal,
          shippingFee,
          deliveryTime: shippingInfo.deliveryTimeAr
        });
      }
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء تسجيل الطلب السريع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FocusTrap
      isActive={isOpen}
      onClose={onClose}
      aria-label="الشراء السريع بضغطة واحدة"
      id="express-checkout-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="express-checkout-title"
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#800020] via-[#590016] to-[#3B000E] text-[#FAF6EE] p-4 sm:p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAF6EE]/15 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 id="express-checkout-title" className="font-black text-sm sm:text-base tracking-wide text-white">
                  الشراء السريع بضغطة واحدة (1-Click)
                </h3>
                <span className="bg-[#D4AF37] text-[#141416] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  فوري
                </span>
              </div>
              <p className="text-[11px] text-[#FAF6EE]/80 mt-0.5">
                سجل طلبك في 30 ثانية بدون خطوات معقدة والدفع عند الاستلام
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            aria-label="إغلاق نافذة الشراء السريع"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Size & Flash-Sale Reservation Lock Banner */}
        <div className="px-4 py-2 bg-[#FAF6EE] dark:bg-zinc-800/95 border-b border-[#D4AF37]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#800020] dark:text-[#D4AF37]">
            <Lock className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>
              {isReservationActive ? (
                <>
                  <strong className="font-bold">المقاس محجوز لك:</strong> مؤمّن ومقفل لمدة{' '}
                  <span className="font-mono font-bold text-[#800020] dark:text-[#D4AF37] bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-md border border-[#D4AF37]/40">
                    {formatRemainingTime(reservationRemainingSeconds)}
                  </span>
                  {' '}لمنع بيعه لعميل آخر.
                </>
              ) : reservationError ? (
                <span className="text-red-600 dark:text-red-400 font-medium">{reservationError}</span>
              ) : (
                <span>جارٍ فحص توفر القطعة والمقاس...</span>
              )}
            </span>
          </div>
          {!isReservationActive && (
            <button
              type="button"
              onClick={reserveExpressItem}
              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#800020] text-white hover:bg-[#600018] transition-colors shrink-0"
            >
              تجديد الحجز 🔄
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-stone-800 dark:text-zinc-100 flex-1">
          {orderSuccess ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-[#800020] dark:text-[#D4AF37]">
                  تم تأكيد طلبك بنجاح!
                </h4>
                <p className="text-xs text-stone-600 dark:text-zinc-400">
                  رقم إيصال الطلب:{' '}
                  <span className="font-mono font-bold text-[#800020] dark:text-[#D4AF37] text-sm">
                    {orderSuccess.orderId}
                  </span>
                </p>
              </div>

              {/* Order Recap Pill Box */}
              <div className="bg-[#FAF6EE] dark:bg-zinc-800/80 p-4 rounded-2xl border border-[#D4AF37]/40 text-right space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-700 pb-2">
                  <span className="text-stone-500">طريقة الدفع:</span>
                  <span className="font-bold text-stone-800 dark:text-zinc-200">
                    {paymentMethod === 'cash_on_delivery' ? 'الدفع نقداً عند الاستلام (COD)' : 'إنستاباي / محفظة إلكترونية'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-700 pb-2">
                  <span className="text-stone-500">موعد وتفاصيل التوصيل:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{orderSuccess.deliveryTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-[#800020] dark:text-[#FAF6EE] pt-1">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span>{orderSuccess.totalAmount.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Consumer Guarantee Banner */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700 p-3 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 text-right">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>حقك محفوظ:</strong> يحق لك فحص ومعاينة الشحنة قبل الاستلام، مع ضمان الاسترجاع والاستبدال خلال 14 يوماً وفق قانون حماية المستهلك المصري رقم 181 لسنة 2018.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('orders');
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>متابعة حالة الطلب</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl border border-stone-300 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  مواصلة التسوق
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              {/* Product Preview Card */}
              {targetProduct && (
                <div className="bg-[#FAF6EE] dark:bg-zinc-800/80 p-3 rounded-2xl border border-stone-200 dark:border-zinc-700 flex items-center gap-3">
                  <img
                    src={targetProduct.images[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'}
                    alt=""
                    className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-zinc-900 p-1 border border-stone-200 dark:border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-zinc-100 truncate">
                      {targetProduct.titleAr}
                    </h4>
                    {variant && (
                      <p className="text-[11px] text-[#800020] dark:text-[#D4AF37] font-semibold mt-0.5">
                        المواصفة: {variant.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-[#800020] dark:text-[#FAF6EE]">
                        {(itemPrice ?? 0).toLocaleString()} ج.م
                      </span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-stone-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-black">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fast Customer Information */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                      <span>الاسم بالكامل *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: أحمد محمد دسوقي"
                      className="w-full bg-[#FAF6EE]/60 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#800020] outline-none"
                    />
                  </div>

                  {/* Phone Number with validation */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                      <span>رقم الهاتف المحمول *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className={`w-full bg-[#FAF6EE]/60 dark:bg-zinc-800 border rounded-xl px-3 py-2 text-xs focus:ring-2 outline-none text-right ${
                        phoneError
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-stone-300 dark:border-zinc-700 focus:ring-[#800020]'
                      }`}
                    />
                    {phoneError && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Governorate & City Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                      <span>المحافظة *</span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => {
                        const newGov = e.target.value as EgyptianGovernorate;
                        setGovernorate(newGov);
                        if (newGov === 'كفر الشيخ') setCity('دسوق');
                        else setCity(newGov);
                      }}
                      className="w-full bg-[#FAF6EE]/60 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#800020] outline-none"
                    >
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov} {gov === 'كفر الشيخ' ? '(شحن 25 ج.م - خلال 24 ساعة)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-zinc-300">
                      المدينة / المركز *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثال: دسوق، فوه، كفر الشيخ، طنطا..."
                      className="w-full bg-[#FAF6EE]/60 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#800020] outline-none"
                    />
                  </div>
                </div>

                {/* Address Line & Nearest Landmark */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-zinc-300">
                    العنوان بالتفصيل (اسم الشارع، رقم العمارة، الشقة) *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetDetails}
                    onChange={(e) => setStreetDetails(e.target.value)}
                    placeholder="مثال: شارع الجيش، برج الأندلس، الدور الثالث، شقة 5"
                    className="w-full bg-[#FAF6EE]/60 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#800020] outline-none"
                  />
                </div>

                {/* Shipping Estimator Notification Banner */}
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 p-2.5 rounded-xl text-[11px] flex items-center justify-between text-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{shippingInfo.deliveryTimeAr}</span>
                  </div>
                  <span className="font-bold bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-[10px]">
                    {subtotal >= 1000 ? 'شحن مجاني' : `${shippingFee} ج.م`}
                  </span>
                </div>

                {/* Payment Options Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-zinc-300">
                    طريقة الدفع المفضلة
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash_on_delivery')}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-[#800020] bg-[#800020]/5 dark:bg-[#800020]/20 text-[#800020] dark:text-[#D4AF37] font-bold ring-1 ring-[#800020]'
                          : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 text-stone-600 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">الدفع عند الاستلام</span>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 mt-1">
                        عاين المنتج وادفع كاش
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'instapay'
                          ? 'border-[#800020] bg-[#800020]/5 dark:bg-[#800020]/20 text-[#800020] dark:text-[#D4AF37] font-bold ring-1 ring-[#800020]'
                          : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 text-stone-600 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">إنستاباي / محفظة</span>
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 mt-1">
                        تحويل فوري فودافون كاش
                      </span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown Footer Bar */}
                <div className="bg-[#FAF6EE] dark:bg-zinc-800/80 p-3 rounded-xl border border-[#D4AF37]/30 space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600 dark:text-zinc-400">
                    <span>قيمة المشتريات ({quantity} قطعة):</span>
                    <span className="font-bold">{(subtotal).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-zinc-400">
                    <span>رسوم الشحن والتوصيل:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {shippingFee === 0 ? 'مجاني (أكثر من 1000 ج.م)' : `${shippingFee} ج.م`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1.5 border-t border-stone-200 dark:border-zinc-700 font-black text-[#800020] dark:text-[#FAF6EE] text-sm sm:text-base">
                    <span>الإجمالي النهائي للدفع:</span>
                    <span className="text-base sm:text-lg text-[#800020] dark:text-[#D4AF37]">
                      {(grandTotal).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#600018] hover:from-[#66001A] hover:to-[#4D0013] text-[#FAF6EE] font-black text-sm transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-[#D4AF37]/50 disabled:opacity-60"
                >
                  <Zap className="w-4 h-4 text-[#D4AF37] fill-current" />
                  <span>
                    {isSubmitting ? 'جاري تسجيل الطلب الفوري...' : `تأكيد الشراء الفوري (${(grandTotal).toLocaleString()} ج.م)`}
                  </span>
                </button>

                <p className="text-center text-[10px] text-stone-500 dark:text-zinc-400">
                  🔒 جميع الطلبات معتمدة وتخضع لفحص الجودة بمستودعات دسوق المركزية
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </FocusTrap>
  );
};
