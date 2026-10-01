import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Truck, 
  Phone, 
  User, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Printer, 
  Package, 
  AlertCircle,
  Building,
  Store,
  DollarSign,
  Sparkles,
  Send,
  Copy
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, PaymentMethod, EgyptianAddress, MarketplaceOrder } from '../../types';

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItemEntry {
  productId: string;
  variantId?: string;
  quantity: number;
}

const DESOQ_DISTRICTS = [
  'الميدان الإبراهيمي',
  'شارع الجيش',
  'شارع الشركات',
  'الكورنيش',
  'طريق فوه',
  'المحطة وحي دحروج',
  'حي الصفا',
  'مساكن مكة',
  'شارع سعد زغلول',
  'حي الزهور',
  'منطقة المستشفى العام',
  'قرية كفر مجر',
  'قرية الشاملة',
  'قرية شباس الشهداء',
  'قرية محلة مالك'
];

const KAFR_EL_SHEIKH_CITIES = [
  'دسوق',
  'كفر الشيخ',
  'فوه',
  'مطوبس',
  'قلين',
  'الرياض',
  'سيدي سالم',
  'بيلا',
  'الحامول',
  'بلطيم'
];

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({ isOpen, onClose }) => {
  const { activeSeller, products, createDirectOrder, showToast } = useMarketplace();

  // Seller's products only
  const sellerProducts = useMemo(() => {
    if (!activeSeller) return products.filter(p => p.status === 'active');
    const filtered = products.filter(p => p.sellerId === activeSeller.id && p.status === 'active');
    return filtered.length > 0 ? filtered : products.filter(p => p.status === 'active');
  }, [products, activeSeller]);

  // Order items state
  const [items, setItems] = useState<OrderItemEntry[]>([
    {
      productId: sellerProducts[0]?.id || '',
      variantId: undefined,
      quantity: 1
    }
  ]);

  // Customer info state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Egyptian shipping address state
  const [city, setCity] = useState('دسوق');
  const [district, setDistrict] = useState('شارع الجيش');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping & Payment Options
  const [shippingProvider, setShippingProvider] = useState<'DesoqExpress' | 'Bosta' | 'StorePickup'>('DesoqExpress');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<MarketplaceOrder | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate pricing
  const subtotalEGP = items.reduce((sum, item) => {
    const prod = sellerProducts.find(p => p.id === item.productId);
    if (!prod) return sum;
    const variant = prod.variants?.find(v => v.id === item.variantId);
    const unitPrice = variant?.priceEGP ?? prod.priceEGP;
    return sum + (unitPrice * item.quantity);
  }, 0);

  const shippingFeeEGP = shippingProvider === 'StorePickup' 
    ? 0 
    : (shippingProvider === 'DesoqExpress' && city === 'دسوق' ? 20 : 35);

  const grandTotalEGP = subtotalEGP + shippingFeeEGP;
  const commissionRate = activeSeller?.commissionRate || 0.10;
  const estimatedCommissionEGP = Math.round(subtotalEGP * commissionRate);
  const sellerEstimatedNetProfitEGP = subtotalEGP - estimatedCommissionEGP;

  // Quick fill sample data
  const handleQuickFillSample = () => {
    setCustomerName('أحمد عبد الرحمن الدسوقي');
    setCustomerPhone('01098765432');
    setCity('دسوق');
    setDistrict('الميدان الإبراهيمي');
    setDetailedAddress('شارع سعد زغلول، بجوار بنك مصر، عمارة الأمل الدور الثالث');
    setNotes('التسليم في الفترة المسائية');
    setValidationError(null);
    showToast('تم تعبئة بيانات نموذجية لعميل دسوق');
  };

  // Handlers for item operations
  const handleAddItem = () => {
    const available = sellerProducts.find(p => !items.some(i => i.productId === p.id)) || sellerProducts[0];
    if (available) {
      setItems(prev => [...prev, { productId: available.id, variantId: undefined, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('يجب تضمين منتج واحد على الأقل في الطلب');
      return;
    }
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const product = sellerProducts.find(p => p.id === newProductId);
    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        productId: newProductId,
        variantId: product?.variants?.[0]?.id,
        quantity: 1
      };
      return copy;
    });
  };

  const handleQuantityChange = (index: number, delta: number) => {
    setItems(prev => {
      const copy = [...prev];
      const item = copy[index];
      const prod = sellerProducts.find(p => p.id === item.productId);
      const maxStock = prod ? prod.stock : 999;
      const nextQty = Math.max(1, Math.min(maxStock, item.quantity + delta));
      copy[index] = { ...item, quantity: nextQty };
      return copy;
    });
  };

  // Submission handler with robust normalization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Clean name
    const cleanName = customerName.trim();
    if (!cleanName || cleanName.length < 2) {
      setValidationError('يرجى إدخال اسم العميل بشكل صحيح (حرفين على الأقل)');
      return;
    }

    // Clean and normalize phone
    let cleanPhone = customerPhone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.startsWith('+20')) {
      cleanPhone = '0' + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('0020')) {
      cleanPhone = '0' + cleanPhone.slice(4);
    } else if (cleanPhone.startsWith('20') && cleanPhone.length === 12) {
      cleanPhone = '0' + cleanPhone.slice(2);
    }

    if (cleanPhone.length < 9) {
      setValidationError('يرجى إدخال رقم هاتف صحيح للتواصل (مثال: 01012345678)');
      return;
    }

    if (!detailedAddress.trim()) {
      setValidationError('يرجى كتابة العنوان التفصيلي لتسليم الطلب');
      return;
    }

    if (items.length === 0 || !items[0].productId) {
      setValidationError('يرجى تحديد المنتجات المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingAddress: EgyptianAddress = {
        id: `manual-addr-${Date.now()}`,
        fullName: cleanName,
        phone: cleanPhone,
        governorate: 'كفر الشيخ',
        city,
        district,
        streetDetails: detailedAddress.trim(),
        buildingNo: '1',
        nearestLandmark: notes.trim() || undefined,
        isDefault: true,
      };

      const result = await createDirectOrder({
        customerName: cleanName,
        customerPhone: cleanPhone,
        shippingAddress,
        paymentMethod,
        items: items.map(it => ({
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity
        }))
      });

      if (result) {
        setCreatedOrder(result);
        showToast('تم تسجيل الطلب وتأكيده بنجاح!');
      } else {
        setValidationError('تعذر إنشاء الطلب، يرجى مراجعة البيانات');
      }
    } catch (err: any) {
      setValidationError(err.message || 'حدث خطأ أثناء حفظ الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDetailedAddress('');
    setNotes('');
    setCreatedOrder(null);
    setValidationError(null);
    setItems([{
      productId: sellerProducts[0]?.id || '',
      variantId: undefined,
      quantity: 1
    }]);
  };

  const handleCopyWhatsAppText = () => {
    if (!createdOrder) return;
    const msg = `مرحباً ${createdOrder.customerName}، تم تأكيد طلبك بنجاح من متجر ${activeSeller?.name || 'سوق دسوق'}! 🎉\nرقم التتبع: ${createdOrder.trackingCode}\nإجمالي المبلغ: ${createdOrder.totalAmountEGP} ج.م\nالتوصيل إلى: ${createdOrder.shippingAddress.city}، ${createdOrder.shippingAddress.district}`;
    navigator.clipboard.writeText(msg);
    showToast('تم نسخ رسالة الواتساب للعميل بنجاح');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-[#800020]/20 dark:border-zinc-700 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="bg-[#800020] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#800020] flex items-center justify-center font-bold shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
                <span>تسجيل طلب بيع مباشر / هاتفي</span>
                <span className="text-[10px] bg-white/20 text-[#FAF6EE] font-sans px-2 py-0.5 rounded-full">
                  POS & Direct Orders
                </span>
              </h2>
              <p className="text-xs text-[#FAF6EE]/80">
                متجر: {activeSeller?.name} ({activeSeller?.city})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">

          {/* SUCCESS SCREEN IF ORDER CREATED */}
          {createdOrder ? (
            <div className="space-y-6 text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-zinc-100">
                  تم تسجيل وتأكيد الطلب بنجاح!
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400">
                  تم إدراج الطلب تلقائياً في السيرفر الحي وظهر في شحنات التاجر والعميل ومكتب العمليات المركزية.
                </p>
              </div>

              {/* Order Brief Summary Card */}
              <div className="bg-[#FAF6EE] dark:bg-zinc-800 p-5 rounded-2xl border border-[#D4AF37]/40 text-right space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200 dark:border-zinc-700">
                  <span className="text-gray-500">كود التتبع الموحد:</span>
                  <span className="font-mono font-bold text-[#800020] dark:text-[#D4AF37] text-sm">
                    {createdOrder.trackingCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200 dark:border-zinc-700">
                  <span className="text-gray-500">اسم العميل ورقم هاتفه:</span>
                  <span className="font-bold text-gray-800 dark:text-zinc-200">
                    {createdOrder.customerName} ({createdOrder.customerPhone})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200 dark:border-zinc-700">
                  <span className="text-gray-500">عنوان التوصيل:</span>
                  <span className="font-medium text-gray-700 dark:text-zinc-300">
                    {createdOrder.shippingAddress.city}، {createdOrder.shippingAddress.district}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-[#800020] dark:text-[#D4AF37]">المبلغ المطلوب تحصيله:</span>
                  <span className="font-bold text-lg text-[#800020] dark:text-[#D4AF37]">
                    {createdOrder.totalAmountEGP} ج.م
                  </span>
                </div>
              </div>

              {/* Success Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsAppText}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>نسخ رسالة تأكيد للواتساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#D4AF37] hover:bg-[#c49f2b] text-[#800020] font-black px-5 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بوليصة التوصيل</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-bold px-5 py-2.5 rounded-full text-xs transition-colors cursor-pointer"
                >
                  تسجيل طلب آخر
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#800020] hover:bg-[#600018] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-colors cursor-pointer"
                >
                  العودة لإدارة الطلبات
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* QUICK FILL DEMO BUTTON */}
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>لتسريع الاختبار وإدخال طلب فوري:</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillSample}
                  className="px-3 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 text-amber-900 dark:text-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ⚡ تعبئة بيانات نموذجية بدسوق
                </button>
              </div>

              {/* VALIDATION ALERT */}
              {validationError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. PRODUCT SELECTION SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>المنتجات المطلوبة من متجرك ({sellerProducts.length} منتج متاح)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#800020] dark:text-[#D4AF37] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة منتج آخر للطلب</span>
                  </button>
                </div>

                {items.map((item, index) => {
                  const currentProd = sellerProducts.find(p => p.id === item.productId);
                  const itemUnitPrice = currentProd?.priceEGP || 0;
                  const itemLineTotal = itemUnitPrice * item.quantity;

                  return (
                    <div 
                      key={index}
                      className="p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-800/80 border border-[#800020]/15 dark:border-zinc-700 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Product Selector */}
                        <div className="sm:col-span-7">
                          <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                            اختر المنتج:
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                          >
                            {sellerProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.titleAr} — {p.priceEGP} ج.م (المخزون: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Counter */}
                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                            الكمية (متاح: {currentProd?.stock ?? 0}):
                          </label>
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl p-1 justify-between">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, -1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-zinc-200 font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer text-sm"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs px-2">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(index, 1)}
                              disabled={Boolean(currentProd && item.quantity >= currentProd.stock)}
                              className="w-7 h-7 rounded-lg bg-[#800020] hover:bg-[#600018] text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Delete row button */}
                        <div className="sm:col-span-2 flex items-end justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-gray-400 block">الإجمالي:</span>
                            <span className="font-bold text-xs text-[#800020] dark:text-[#D4AF37]">
                              {itemLineTotal} ج.م
                            </span>
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف هذا المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. CUSTOMER DETAILS */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-zinc-700">
                <h3 className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span>بيانات العميل المستلم</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                      اسم العميل: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: يوسف محمود خليل"
                        required
                        className="w-full text-xs p-2.5 pr-8 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                      رقم هاتف العميل (واتساب / اتصال): <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="010XXXXXXXX أو 011/012/015"
                        required
                        className="w-full text-xs p-2.5 pr-8 font-mono rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                      />
                      <Phone className="w-4 h-4 text-gray-400 absolute right-2.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. SHIPPING & ADDRESS DETAILS */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-zinc-700">
                <h3 className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span>عنوان التوصيل (دسوق ومحافظة كفر الشيخ)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                      المدينة / المركز:
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                    >
                      {KAFR_EL_SHEIKH_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                      الحي / المنطقة:
                    </label>
                    {city === 'دسوق' ? (
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                      >
                        {DESOQ_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="المنطقة أو الحي"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                    العنوان التفصيلي وأقرب علامة مميزة: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العقار، الدور، بجوار صيدلية أو مسجد..."
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                    ملاحظات إضافية للمندوب (اختياري):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: الاتصال قبل الوصول بنصف ساعة، أو التسليم بالمساء"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* 4. PAYMENT & SHIPPING METHOD */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-zinc-700">
                <h3 className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span>طريقة الشحن والتحصيل</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Shipping Provider */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                      جهة التوصيل:
                    </label>
                    <div className="space-y-1.5">
                      <label className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        shippingProvider === 'DesoqExpress' 
                          ? 'border-[#800020] bg-[#800020]/5 text-[#800020] font-bold' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="shippingProvider" 
                            checked={shippingProvider === 'DesoqExpress'}
                            onChange={() => setShippingProvider('DesoqExpress')}
                          />
                          <span>مندوب دسوق إكسبريس السريع (24 ساعة)</span>
                        </div>
                        <span className="text-[11px] font-bold">{city === 'دسوق' ? '20 ج.م' : '35 ج.م'}</span>
                      </label>

                      <label className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        shippingProvider === 'StorePickup' 
                          ? 'border-[#800020] bg-[#800020]/5 text-[#800020] font-bold' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="shippingProvider" 
                            checked={shippingProvider === 'StorePickup'}
                            onChange={() => setShippingProvider('StorePickup')}
                          />
                          <span>استلام مباشر من مقر المتجر</span>
                        </div>
                        <span className="text-[11px] font-bold text-green-700">مجاناً (0 ج.م)</span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-zinc-300 block mb-1">
                      طريقة الدفع والتحصيل:
                    </label>
                    <div className="space-y-1.5">
                      <label className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery' 
                          ? 'border-[#800020] bg-[#800020]/5 text-[#800020] font-bold' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'cash_on_delivery'}
                            onChange={() => setPaymentMethod('cash_on_delivery')}
                          />
                          <span>الدفع عند الاستلام (COD)</span>
                        </div>
                      </label>

                      <label className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        paymentMethod === 'vodafone_cash' 
                          ? 'border-[#800020] bg-[#800020]/5 text-[#800020] font-bold' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'vodafone_cash'}
                            onChange={() => setPaymentMethod('vodafone_cash')}
                          />
                          <span>محفظة كاش (فودافون كاش)</span>
                        </div>
                      </label>

                      <label className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        paymentMethod === 'instapay' 
                          ? 'border-[#800020] bg-[#800020]/5 text-[#800020] font-bold' 
                          : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'instapay'}
                            onChange={() => setPaymentMethod('instapay')}
                          />
                          <span>تحويل بنكي لحظي (إنستاباي InstaPay)</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. FINANCIAL TOTALS SUMMARY BAR */}
              <div className="bg-[#FAF6EE] dark:bg-zinc-800 p-4 rounded-2xl border border-[#D4AF37]/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400">
                  <span>إجمالي سعر المنتجات:</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-100">{subtotalEGP} ج.م</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400">
                  <span>مصاريف الشحن:</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-100">
                    {shippingFeeEGP === 0 ? 'مجاناً' : `${shippingFeeEGP} ج.م`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-dashed border-stone-300 dark:border-zinc-700">
                  <span>صافي أرباح التاجر التقديري:</span>
                  <span className="font-bold text-green-700 dark:text-green-400">{sellerEstimatedNetProfitEGP} ج.م (بعد عمولة المنصة {(commissionRate*100).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-gray-200 dark:border-zinc-700 text-[#800020] dark:text-[#D4AF37]">
                  <span>الإجمالي المطلوب تحصيله من العميل:</span>
                  <span className="text-base font-serif font-black">{grandTotalEGP} ج.م</span>
                </div>
              </div>

              {/* MODAL FOOTER BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || sellerProducts.length === 0}
                  className="bg-[#800020] hover:bg-[#600018] text-white px-7 py-2.5 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>جاري حفظ وتأكيد الطلب...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>تأكيد وتسجيل الطلب في السيرفر</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
