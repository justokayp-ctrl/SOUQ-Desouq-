import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  User, 
  Store, 
  TrendingUp, 
  Wallet, 
  Settings, 
  ShieldCheck, 
  Ticket, 
  Users, 
  Scale, 
  FileText,
  Truck,
  Layers,
  Boxes,
  MoreHorizontal,
  AlertTriangle,
  Receipt,
  X,
  Compass,
  BarChart3,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { FocusTrap } from './FocusTrap';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    role, 
    setRole, 
    cartTotalCount, 
    setIsCartOpen, 
    setIsAuthModalOpen,
    user,
    t,
    orders,
    activeSeller,
    sellers,
    disputes,
    sellerActiveTab,
    setSellerActiveTab,
    adminActiveTab,
    setAdminActiveTab,
    supportActiveTab,
    setSupportActiveTab,
    courierActiveTab,
    setCourierActiveTab
  } = useMarketplace();

  // Mobile Seller More Sheet state
  const [isSellerMoreOpen, setIsSellerMoreOpen] = useState(false);

  // 1. SELLER MOBILE NAV (Overview -> Orders -> Products -> Inventory -> More)
  if (role === 'seller') {
    const pendingOrdersCount = orders.flatMap(o => o.subOrders || [])
      .filter(sub => sub.sellerId === (activeSeller?.id || 'seller-1') && 
        (sub.status === 'seller_confirmed' || sub.status === 'processing' || (sub.status as any) === 'pending')
      ).length;

    const isOverview = activeView === 'seller_dashboard' && (sellerActiveTab === 'dashboard' || sellerActiveTab === 'overview');
    const isOrders = activeView === 'seller_dashboard' && sellerActiveTab === 'orders';
    const isProducts = activeView === 'seller_dashboard' && sellerActiveTab === 'products';
    const isInventory = activeView === 'seller_dashboard' && sellerActiveTab === 'inventory';
    const isMoreActive = activeView === 'seller_dashboard' && ['finance', 'settings', 'kyc', 'analytics', 'promotions', 'tools'].includes(sellerActiveTab);

    return (
      <>
        {/* Seller "More" Bottom Sheet Drawer */}
        {isSellerMoreOpen && (
          <FocusTrap
            isActive={isSellerMoreOpen}
            onClose={() => setIsSellerMoreOpen(false)}
            aria-label="قائمة خدمات ومزيد أدوات التاجر"
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          >
            <div className="bg-[#1C1815] text-[#FAF6EE] rounded-t-3xl border-t border-[#D4AF37]/30 p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#800020] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{activeSeller?.name || 'متجر التاجر'}</h4>
                    <span className="text-[11px] text-[#D4AF37]">أدوات التاجر والإدارة المالية</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSellerMoreOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('seller_dashboard');
                    setSellerActiveTab('finance');
                    setIsSellerMoreOpen(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3 text-right transition-all cursor-pointer ${
                    sellerActiveTab === 'finance'
                      ? 'bg-[#800020]/40 border-[#D4AF37] text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <div className="text-xs font-bold">المالية والأرباح</div>
                    <div className="text-[10px] text-gray-400">سحب الرصيد والفواتير</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('seller_dashboard');
                    setSellerActiveTab('settings');
                    setIsSellerMoreOpen(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3 text-right transition-all cursor-pointer ${
                    sellerActiveTab === 'settings'
                      ? 'bg-[#800020]/40 border-[#D4AF37] text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Settings className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <div className="text-xs font-bold">إعدادات المتجر</div>
                    <div className="text-[10px] text-gray-400">الشعار والهوية</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('seller_dashboard');
                    setSellerActiveTab('kyc');
                    setIsSellerMoreOpen(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3 text-right transition-all cursor-pointer ${
                    sellerActiveTab === 'kyc'
                      ? 'bg-[#800020]/40 border-[#D4AF37] text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">توثيق KYC</div>
                    <div className="text-[10px] text-gray-400">السجل والبطاقة الضريبية</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveView('seller_dashboard');
                    setSellerActiveTab('analytics');
                    setIsSellerMoreOpen(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3 text-right transition-all cursor-pointer ${
                    sellerActiveTab === 'analytics'
                      ? 'bg-[#800020]/40 border-[#D4AF37] text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">التحليلات والزيارات</div>
                    <div className="text-[10px] text-gray-400">أداء المبيعات</div>
                  </div>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('customer');
                    setActiveView('catalog');
                    setIsSellerMoreOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-bold text-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
                    <span>تصفح سوق دسوق كمشتري</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </FocusTrap>
        )}

        <nav 
          aria-label="تنقل لوحة التاجر للهاتف"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161311]/95 backdrop-blur-md border-t border-[#D4AF37]/30 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-around text-[#FAF6EE]"
        >
          {/* 1. Overview */}
          <button
            type="button"
            onClick={() => { setActiveView('seller_dashboard'); setSellerActiveTab('overview'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
              isOverview ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">نظرة عامة</span>
          </button>

          {/* 2. Orders */}
          <button
            type="button"
            onClick={() => { setActiveView('seller_dashboard'); setSellerActiveTab('orders'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform relative ${
              isOrders ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#800020] text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-[#D4AF37]">
                  {pendingOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">الطلبات</span>
          </button>

          {/* 3. Products */}
          <button
            type="button"
            onClick={() => { setActiveView('seller_dashboard'); setSellerActiveTab('products'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
              isProducts ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">المنتجات</span>
          </button>

          {/* 4. Inventory */}
          <button
            type="button"
            onClick={() => { setActiveView('seller_dashboard'); setSellerActiveTab('inventory'); }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
              isInventory ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">المخزون</span>
          </button>

          {/* 5. More */}
          <button
            type="button"
            onClick={() => setIsSellerMoreOpen(true)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
              isMoreActive ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">المزيد</span>
          </button>
        </nav>
      </>
    );
  }

  // 2. COURIER MOBILE NAV (Today -> Deliveries -> Exceptions -> Profile)
  if (role === 'courier') {
    const isToday = activeView === 'courier_dispatch' && courierActiveTab === 'home';
    const isDeliveries = activeView === 'courier_dispatch' && courierActiveTab === 'deliveries';
    const isExceptions = activeView === 'courier_dispatch' && courierActiveTab === 'exceptions';
    const isProfile = activeView === 'courier_dispatch' && (courierActiveTab === 'settlement' || courierActiveTab === 'profile');

    const exceptionCount = orders.filter(o => 
      o.orderStatus === 'exception' || 
      (o as any).deliveryStage === 'failed' || 
      (o as any).deliveryExceptionReason
    ).length;

    return (
      <nav 
        aria-label="تنقل كابتن التوصيل للهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-amber-500/30 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-around text-slate-200"
      >
        {/* 1. Today */}
        <button
          type="button"
          onClick={() => { setActiveView('courier_dispatch'); setCourierActiveTab('home'); }}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            isToday ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">مهام اليوم</span>
        </button>

        {/* 2. Deliveries */}
        <button
          type="button"
          onClick={() => { setActiveView('courier_dispatch'); setCourierActiveTab('deliveries'); }}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            isDeliveries ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">التسليمات</span>
        </button>

        {/* 3. Exceptions */}
        <button
          type="button"
          onClick={() => { setActiveView('courier_dispatch'); setCourierActiveTab('exceptions'); }}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform relative ${
            isExceptions ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <AlertTriangle className="w-5 h-5" />
            {exceptionCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {exceptionCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">التعذر</span>
        </button>

        {/* 4. Profile / Settlement */}
        <button
          type="button"
          onClick={() => { setActiveView('courier_dispatch'); setCourierActiveTab('settlement'); }}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            isProfile ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">الوردية</span>
        </button>
      </nav>
    );
  }

  // 3. ADMIN MOBILE NAV
  if (role === 'admin') {
    const pendingKycCount = sellers.filter(s => s.status === 'under_review').length;

    return (
      <nav 
        aria-label="تنقل الإدارة العليا للهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121820]/95 backdrop-blur-md border-t border-[#D4AF37]/30 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-around text-[#FAF6EE]"
      >
        <button
          type="button"
          onClick={() => { setActiveView('admin_deck'); setAdminActiveTab('dashboard'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            adminActiveTab === 'dashboard' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">التحكم</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('admin_deck'); setAdminActiveTab('sellers'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform relative ${
            adminActiveTab === 'sellers' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5" />
            {pendingKycCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {pendingKycCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">التجار</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('admin_deck'); setAdminActiveTab('orders'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            adminActiveTab === 'orders' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">العمليات</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('admin_deck'); setAdminActiveTab('finance'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            adminActiveTab === 'finance' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">المالية</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('admin_deck'); setAdminActiveTab('telemetry'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            adminActiveTab === 'telemetry' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">الرقابة</span>
        </button>
      </nav>
    );
  }

  // 4. SUPPORT MOBILE NAV
  if (role === 'support') {
    const openDisputesCount = disputes.filter(d => d.status === 'open' || d.status === 'opened').length;

    return (
      <nav 
        aria-label="تنقل مكتب التحكيم للهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171A21]/95 backdrop-blur-md border-t border-[#D4AF37]/30 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-around text-[#FAF6EE]"
      >
        <button
          type="button"
          onClick={() => { setActiveView('support_disputes'); setSupportActiveTab('tickets'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform relative ${
            supportActiveTab === 'tickets' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {openDisputesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {openDisputesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">التذاكر</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('support_disputes'); setSupportActiveTab('customers'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            supportActiveTab === 'customers' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">العملاء</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('support_disputes'); setSupportActiveTab('orders'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            supportActiveTab === 'orders' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">النزاعات</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('support_disputes'); setSupportActiveTab('reports'); }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform ${
            supportActiveTab === 'reports' ? 'text-[#D4AF37] font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">التقارير</span>
        </button>

        <button
          type="button"
          onClick={() => { setRole('customer'); setActiveView('catalog'); }}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl cursor-pointer touch-manipulation select-none active:scale-95 transition-transform text-gray-400 hover:text-white"
        >
          <Store className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">المتجر</span>
        </button>
      </nav>
    );
  }

  // 5. CUSTOMER MOBILE NAV (Home -> Shop -> Orders -> Cart -> Account)
  return (
    <nav 
      aria-label="التنقل الرئيسي للهاتف"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-[#800020]/15 dark:border-zinc-800 px-2 py-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-around"
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => { setActiveView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
          activeView === 'catalog' || activeView === 'home'
            ? 'text-[#800020] dark:text-[#D4AF37] font-bold'
            : 'text-gray-500 dark:text-zinc-400 hover:text-[#800020]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold whitespace-nowrap">الرئيسية</span>
      </button>

      {/* 2. Shop */}
      <button
        type="button"
        onClick={() => { setActiveView('category_hub'); }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
          activeView === 'category_hub' || activeView === 'department_realm' || activeView === 'search_results'
            ? 'text-[#800020] dark:text-[#D4AF37] font-bold'
            : 'text-gray-500 dark:text-zinc-400 hover:text-[#800020]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-semibold whitespace-nowrap">المتجر</span>
      </button>

      {/* 3. Orders */}
      <button
        type="button"
        onClick={() => { setActiveView('orders'); }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all cursor-pointer touch-manipulation select-none active:scale-95 relative ${
          activeView === 'orders'
            ? 'text-[#800020] dark:text-[#D4AF37] font-bold'
            : 'text-gray-500 dark:text-zinc-400 hover:text-[#800020]'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] font-semibold whitespace-nowrap">طلباتي</span>
      </button>

      {/* 4. Cart */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all active:scale-95 cursor-pointer touch-manipulation select-none relative text-[#800020] dark:text-[#D4AF37]"
      >
        <div className="relative p-1 rounded-full bg-[#800020]/10 dark:bg-[#D4AF37]/15">
          <ShoppingBag className="w-5 h-5" />
          {cartTotalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#800020] dark:bg-[#D4AF37] text-white dark:text-[#800020] font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
              {cartTotalCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">السلة</span>
      </button>

      {/* 5. Account */}
      <button
        type="button"
        onClick={() => setIsAuthModalOpen(true)}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
          user ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-gray-500 dark:text-zinc-400 hover:text-[#800020]'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-semibold whitespace-nowrap">{user ? user.fullName.split(' ')[0] : 'حسابي'}</span>
      </button>
    </nav>
  );
};
