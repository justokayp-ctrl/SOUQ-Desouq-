import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  Store, 
  RotateCcw, 
  Printer,
  ChevronDown,
  X,
  ShieldAlert,
  ArrowRight,
  Search,
  Grid,
  Zap,
  Radio
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { MarketplaceOrder, SellerSubOrder, OrderStatus, Dispute } from '../../types';
import { OrderStepTracker } from './OrderStepTracker';

export const OrderTrackingView: React.FC = () => {
  const { 
    orders, 
    activeOrder, 
    setActiveOrder, 
    createDispute, 
    setActiveView, 
    setRole,
    lang,
    t,
    showToast,
    addToCart,
    products,
    realtimeConnected,
    lastRealtimeEvent
  } = useMarketplace();

  const [disputeSubOrder, setDisputeSubOrder] = useState<SellerSubOrder | null>(null);
  const [disputeReason, setDisputeReason] = useState<Dispute['reason']>('defective_product');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeResolution, setDisputeResolution] = useState<Dispute['requestedResolution']>('refund');
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');

  const currentOrder = activeOrder || orders[0];

  const filteredOrders = orders.filter(ord => {
    const status = ord.orderStatus || ord.status;
    if (statusFilter === 'active' && (status === 'delivered' || status === 'cancelled')) return false;
    if (statusFilter === 'delivered' && status !== 'delivered') return false;
    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase().trim();
      const matchId = ord.id.toLowerCase().includes(q);
      const matchCity = ord.shippingAddress?.city?.toLowerCase().includes(q) || false;
      const matchDistrict = ord.shippingAddress?.district?.toLowerCase().includes(q) || false;
      if (!matchId && !matchCity && !matchDistrict) return false;
    }
    return true;
  });

  const handleOpenDispute = (sub: SellerSubOrder) => {
    setDisputeSubOrder(sub);
    setDisputeSuccess(false);
    setDisputeDesc('');
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !disputeSubOrder || !disputeDesc.trim()) return;

    await createDispute(
      currentOrder.id,
      disputeSubOrder.id,
      disputeReason,
      disputeDesc,
      disputeResolution
    );

    setDisputeSuccess(true);
    setTimeout(() => {
      setDisputeSubOrder(null);
      setDisputeSuccess(false);
      setDisputeDesc('');
      showToast('تم تسجيل النزاع بنجاح ومشاركته مع التاجر ومستشار حماية المستهلك للمتابعة الرسمية');
    }, 2000);
  };

  const handleReorder = (subOrder: SellerSubOrder) => {
    subOrder.items.forEach(item => {
      addToCart(item.product, item.selectedVariant, item.quantity);
    });
    showToast('تمت إضافة منتجات الطلب لسلة المشتري بنجاح');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (!currentOrder || orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-[#800020]/10 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
            <button 
              type="button"
              onClick={() => setActiveView('catalog')}
              className="hover:text-[#800020] dark:hover:text-[#D4AF37] font-semibold transition-colors cursor-pointer"
            >
              {t('appName')}
            </button>
            <span>/</span>
            <span className="font-bold text-[#800020] dark:text-[#D4AF37]">{t('myOrders')}</span>
          </div>
        </div>

        {/* Hero Spotlight */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#800020]/20 min-h-[200px] flex flex-col justify-end p-6 sm:p-10 text-white bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80"
            alt="تتبع الشحنات"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-0.5 rounded-full shadow-md">
                تتبع الشحنات المباشر
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {t('myOrders')}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
              تتبع مسار شحناتك المباشرة وفواتير الضمان الرسمية خطوة بخطوة مع التجار المعتمدين.
            </p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-[#800020]/10 dark:border-zinc-800 space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center mx-auto border border-[#800020]/20">
            <Package className="w-8 h-8 text-[#800020] dark:text-[#D4AF37]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#800020] dark:text-[#FAF6EE]">{t('noOrders')}</h3>
          <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            تصفح سوق دسوق وأضف منتجاتك المفضلة وسجل طلبك الأول مع خيارات الدفع عند الاستلام والتوصيل السريع.
          </p>
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] px-8 py-3 rounded-full text-xs font-black transition-all cursor-pointer shadow-md border border-[#D4AF37]/50 inline-flex items-center gap-2"
          >
            <Grid className="w-4 h-4" />
            <span>{t('startShopping')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="order-tracking-view" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Context Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#800020]/10 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
          <button 
            type="button"
            onClick={() => setActiveView('catalog')}
            className="hover:text-[#800020] dark:hover:text-[#D4AF37] font-semibold transition-colors cursor-pointer"
          >
            {t('appName')}
          </button>
          <span>/</span>
          <span className="font-bold text-[#800020] dark:text-[#D4AF37]">
            {t('myOrders')}
          </span>
          <span>/</span>
          <span className="text-stone-700 dark:text-zinc-300 font-medium">
            (طلب #{currentOrder.id})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className="text-xs bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] dark:bg-zinc-800 px-4 py-2 rounded-full font-bold hover:bg-[#800020] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>تصفح الكتالوج</span>
        </button>
      </div>

      {/* 2. Unified Hero Spotlight Banner in Burgundy & Ivory */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#800020]/20 min-h-[220px] flex flex-col justify-end p-6 sm:p-10 text-white bg-zinc-900">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80"
          alt="تتبع الطلبات"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-0.5 rounded-full shadow-md">
              {orders.length} طلبات مسجلة
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {lang === 'en' ? 'Track My Orders & Shipments' : 'تتبع الشحنات والطلبات الجارية'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
            {lang === 'en'
              ? 'Real-time order fulfillment statuses, digital invoices, customer dispute support, and instant reordering.'
              : 'متابعة حية لمراحل الشحن والتوصيل مع فواتير الشراء الرقمية، وضمانات الاسترجاع، وإعادة الطلب بنقرة واحدة.'}
          </p>
        </div>
      </div>

      {/* 3. Search & Order Filters Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-[#800020]/10 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto md:min-w-[320px]">
          <div className="flex items-center bg-[#FAF6EE] dark:bg-zinc-800 rounded-full px-4 py-2 border border-[#800020]/15 dark:border-zinc-700">
            <Search className="w-4 h-4 text-stone-400 ml-2 shrink-0" />
            <input
              type="text"
              value={searchOrderQuery}
              onChange={(e) => setSearchOrderQuery(e.target.value)}
              placeholder="ابحث برقم الطلب أو اسم الحي والمدينة..."
              className="w-full bg-transparent text-xs text-[#1A1A1A] dark:text-zinc-100 outline-none font-medium"
            />
            {searchOrderQuery && (
              <button
                type="button"
                onClick={() => setSearchOrderQuery('')}
                className="text-stone-400 hover:text-stone-600 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 bg-[#FAF6EE] dark:bg-zinc-800 p-1 rounded-full border border-[#800020]/15 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#800020] text-[#FAF6EE] shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            كافة الطلبات ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#800020] text-[#FAF6EE] shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            جاري التوصيل 🚚
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'delivered'
                ? 'bg-[#800020] text-[#FAF6EE] shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            تم التسليم ✅
          </button>
        </div>
      </div>

      {/* 4. Orders Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredOrders.map((ord) => (
          <div
            key={ord.id}
            onClick={() => setActiveOrder(ord)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              currentOrder.id === ord.id
                ? 'bg-[#800020] text-white border-[#800020] shadow-md'
                : 'bg-white dark:bg-zinc-900 text-[#1A1A1A] dark:text-zinc-100 border-[#800020]/10 dark:border-zinc-800 hover:border-[#D4AF37]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-black ${currentOrder.id === ord.id ? 'text-[#D4AF37]' : 'text-[#800020] dark:text-[#D4AF37]'}`}>
                طلب #{ord.id}
              </span>
              <span className="text-[10px] font-bold opacity-80">
                {ord.createdAt?.split('T')[0] || ord.createdAt}
              </span>
            </div>
            <div className="text-xs font-bold flex items-center justify-between">
              <span>{((ord.totalAmountEGP || ord.totalPriceEGP) ?? 0).toLocaleString()} ج.م</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                currentOrder.id === ord.id ? 'bg-white/20' : 'bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37]'
              }`}>
                {(ord.orderStatus || ord.status) === 'delivered' ? 'تم التسليم' : 'قيد الشحن والتوصيل'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Active Order Detailed Tracking Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-[#800020]/10 dark:border-zinc-800 shadow-md space-y-6 print:shadow-none">
        
        {/* Order Header Meta */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-black text-[#800020] dark:text-[#D4AF37]">طلب رقم #{currentOrder.id}</span>
              <span className="bg-[#D4AF37]/20 text-[#800020] dark:text-[#D4AF37] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                {(currentOrder.paymentMethod === 'cash_on_delivery' || (currentOrder.paymentMethod as string) === 'cod') ? 'دفع عند الاستلام (COD)' : 'دفع إلكتروني محدد'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>تحديث لحظي نشط (Event Bus)</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
              تاريخ الطلب: {currentOrder.createdAt} — عنوان التسليم: {currentOrder.shippingAddress?.district}، {currentOrder.shippingAddress?.city}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 bg-[#FAF6EE] dark:bg-zinc-800 hover:bg-[#800020] hover:text-[#FAF6EE] text-[#800020] dark:text-[#D4AF37] px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer print:hidden border border-[#800020]/15"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الفاتورة والضمان</span>
          </button>
        </div>

        {/* Animated Visual Step-Tracker with Framer Motion */}
        <OrderStepTracker 
          order={currentOrder} 
          allowInteractiveSimulation={true} 
        />

        {/* Sub-Orders Breakdown per Merchant */}
        <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-zinc-100">
            تفاصيل المنتجات والتجار المشاركين:
          </h3>

          <div className="space-y-4">
            {(currentOrder.subOrders || currentOrder.sellerSubOrders || []).map((sub) => (
              <div
                key={sub.id}
                className="bg-[#FAF6EE]/40 dark:bg-zinc-800/60 p-5 rounded-2xl border border-[#800020]/10 dark:border-zinc-800 space-y-4"
              >
                {/* Sub-order Merchant Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#800020]/10 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span className="text-xs font-bold text-[#1A1A1A] dark:text-zinc-100">{sub.sellerName}</span>
                    <span className="text-[10px] text-stone-400">شحنة #{sub.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(sub)}
                      className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      إعادة الطلب
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDispute(sub)}
                      className="bg-white dark:bg-zinc-800 hover:bg-red-50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>طلب استرجاع</span>
                    </button>
                  </div>
                </div>

                {/* Sub-order Items List */}
                <div className="space-y-3">
                  {sub.items.map((item, idx) => {
                    const price = item.selectedVariant ? item.selectedVariant.priceEGP : item.product.priceEGP;
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          {item.product.images[0] && (
                            <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                          )}
                          <div>
                            <span className="block text-[#1A1A1A] dark:text-zinc-100">{item.product.titleAr}</span>
                            <span className="text-[10px] text-stone-400">الكمية: {item.quantity} × {price} ج.م</span>
                          </div>
                        </div>

                        <span className="font-black text-[#800020] dark:text-[#D4AF37]">
                          {((item.quantity || 1) * (price || 0)).toLocaleString()} ج.م
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-order total */}
                <div className="pt-2 text-left text-xs font-bold text-[#1A1A1A] dark:text-zinc-200">
                  إجمالي الشحنة: <span className="text-[#800020] dark:text-[#D4AF37]">{(sub.subtotalEGP ?? 0).toLocaleString()} ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dispute Modal */}
      {disputeSubOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#800020]/20 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>تقديم طلب نزاع واسترجاع رسمي</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setDisputeSubOrder(null)} 
                aria-label="إغلاق نافذة تقديم النزاع"
                className="p-1 text-stone-400 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {disputeSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">تم فتح الملف ومشاركته مع التاجر ولجنة فض المنازعات</h4>
                <p className="text-xs text-stone-500 dark:text-zinc-400">تم تسجيل طلبك برقم متابعة رسمي، وسيقوم فريق التحكيم بالتواصل معك وفق المهل القانونية المعتمدة.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDispute} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-zinc-300">سبب طلب الاسترجاع:</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value as any)}
                    className="w-full bg-[#FAF6EE] dark:bg-zinc-800 p-2.5 rounded-xl font-bold outline-none border border-[#800020]/15 dark:border-zinc-700 dark:text-zinc-100"
                  >
                    <option value="defective_product">منتج تالف أو به عيب تصنيع</option>
                    <option value="item_mismatch">المنتج مختلف عن الوصف المذكور</option>
                    <option value="wrong_size">الكمية أو المقاس غير مطبق</option>
                    <option value="missing_item">منتج مفقود من الشحنة</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-zinc-300">الطلب المفضل:</label>
                  <select
                    value={disputeResolution}
                    onChange={(e) => setDisputeResolution(e.target.value as any)}
                    className="w-full bg-[#FAF6EE] dark:bg-zinc-800 p-2.5 rounded-xl font-bold outline-none border border-[#800020]/15 dark:border-zinc-700 dark:text-zinc-100"
                  >
                    <option value="refund">رد كامل المبلغ لحساب المشتري</option>
                    <option value="replacement">استبدال شحنة جديدة خالية من العيوب</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-zinc-300">تفاصيل وتوضيح المشكلة:</label>
                  <textarea
                    rows={3}
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="يرجى كتابة الشكوى بالتفصيل لإرسالها للتاجر وإدارة السوق..."
                    className="w-full bg-[#FAF6EE] dark:bg-zinc-800 p-2.5 rounded-xl outline-none border border-[#800020]/15 dark:border-zinc-700 dark:text-zinc-100"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDisputeSubOrder(null)}
                    className="px-4 py-2 rounded-full font-bold text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full font-bold cursor-pointer transition-colors"
                  >
                    تأكيد إرسال النزاع
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

