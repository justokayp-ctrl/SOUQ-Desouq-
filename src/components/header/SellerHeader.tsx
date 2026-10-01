import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Star, 
  Tag, 
  BarChart3, 
  Wallet, 
  ShieldCheck, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ArrowLeft,
  ExternalLink,
  Sun,
  Moon,
  Globe,
  Bell,
  Truck
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BrandShield } from '../common/ui';

export const SellerHeader: React.FC = () => {
  const { 
    activeSeller, 
    sellers, 
    setActiveSellerId, 
    orders, 
    products, 
    setRole, 
    setActiveView, 
    sellerActiveTab, 
    setSellerActiveTab,
    theme,
    setTheme,
    lang,
    setLang,
    showToast,
    openSellerProfile
  } = useMarketplace();

  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState<'open' | 'vacation'>('open');

  // Compute pending fulfillment orders for this seller
  const pendingOrdersCount = orders.flatMap(o => o.subOrders || [])
    .filter(sub => sub.sellerId === (activeSeller?.id || 'seller-1') && 
      (sub.status === 'seller_confirmed' || sub.status === 'processing' || (sub.status as any) === 'pending')
    ).length;

  const lowStockCount = products
    .filter(p => p.sellerId === (activeSeller?.id || 'seller-1') && p.stock <= 3)
    .length;

  const sellerNavTabs = [
    { id: 'dashboard', label: 'الرئيسية والتشغيل', icon: Store },
    { id: 'products', label: 'المنتجات والكتالوج', icon: Package },
    { id: 'orders', label: 'الطلبات والشحنات', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'messages', label: 'استفسارات المشترين', icon: MessageSquare },
    { id: 'reviews', label: 'تقييمات المتجر', icon: Star },
    { id: 'promotions', label: 'العروض والكوبونات', icon: Tag },
    { id: 'analytics', label: 'تحليلات المبيعات', icon: BarChart3 },
    { id: 'finance', label: 'المستحقات وسحب الأرباح', icon: Wallet },
    { id: 'kyc', label: 'التوثيق القانوني KYC', icon: ShieldCheck },
    { id: 'settings', label: 'إعدادات المتجر', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveView('seller_dashboard');
    setSellerActiveTab(tabId);
  };

  const toggleStoreStatus = () => {
    const nextStatus = storeStatus === 'open' ? 'vacation' : 'open';
    setStoreStatus(nextStatus);
    showToast(nextStatus === 'open' ? 'تم فتح المتجر لاستقبال طلبات أهالي دسوق' : 'تم تفعيل وضع الإجازة المؤقتة للمتجر');
  };

  return (
    <header id="seller-portal-header" className="sticky top-0 z-40 bg-[#161311] text-[#FAF6EE] border-b border-[#D4AF37]/30 shadow-lg w-full overflow-hidden">
      
      {/* 1. SELLER TOP OPERATIONAL BAR */}
      <div className="bg-[#0D0B0A] border-b border-white/10 px-2 sm:px-6 py-2 text-xs w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 w-full min-w-0">
          
          {/* Brand Identity & Partner Status */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            <div 
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group shrink-0"
            >
              <BrandShield size="sm" variant="gold" animate />
              <div className="flex flex-col">
                <span className="font-serif font-black text-xs sm:text-sm text-[#D4AF37] tracking-tight group-hover:text-amber-300 transition-colors whitespace-nowrap">
                  سوق دسوق
                </span>
                <span className="hidden sm:inline text-[9px] text-[#FAF6EE]/70 font-bold uppercase tracking-wider whitespace-nowrap">
                  بوابة التجار
                </span>
              </div>
            </div>

            {/* Store Switcher Capsule */}
            <div className="relative min-w-0 max-w-[120px] sm:max-w-[200px]">
              <button
                type="button"
                onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 bg-white/10 hover:bg-white/15 px-1.5 sm:px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 transition-colors cursor-pointer text-xs w-full min-w-0"
                title="تبديل المتجر"
              >
                <Store className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="font-bold text-white truncate text-[11px] sm:text-xs">
                  {activeSeller?.name || 'متجر التاجر'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#D4AF37] shrink-0" />
              </button>

              {isStoreDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 w-60 sm:w-64 bg-[#1E1B18] border border-[#D4AF37]/30 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-2 py-1 text-[10px] text-gray-400 font-bold border-b border-white/10">
                    تبديل المتجر النشط
                  </div>
                  {sellers.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSellerId(s.id);
                        setIsStoreDropdownOpen(false);
                        showToast(`تم التبديل إلى متجر ${s.name}`);
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeSeller?.id === s.id ? 'bg-[#800020] text-white' : 'hover:bg-white/10 text-gray-200'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="text-[10px] opacity-70 shrink-0 mr-2">{s.city || 'دسوق'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Store Open / Vacation Status Pill (hidden on small screens) */}
            <button
              type="button"
              onClick={toggleStoreStatus}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                storeStatus === 'open'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
              }`}
              title="تغيير حالة استقبال الطلبات للمتجر"
            >
              <span className={`w-2 h-2 rounded-full ${storeStatus === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{storeStatus === 'open' ? 'المتجر متاح' : 'إجازة مؤقتة'}</span>
            </button>
          </div>

          {/* Right Action Hub: KPIs & Navigation Shortcuts */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Balance Shortcut (visible on md+) */}
            <button
              type="button"
              onClick={() => handleTabClick('finance')}
              className="hidden md:flex items-center gap-1.5 bg-[#FAF6EE]/5 hover:bg-[#FAF6EE]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 transition-colors cursor-pointer text-xs"
              title="عرض المستحقات وسحب الأرباح"
            >
              <Wallet className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-gray-400 text-[10px]">الرصيد:</span>
              <span className="font-bold text-emerald-400">
                {(activeSeller?.availableBalanceEGP || 12450).toLocaleString()} ج.م
              </span>
            </button>

            {/* Pending Shipments Alert */}
            {pendingOrdersCount > 0 && (
              <button
                type="button"
                onClick={() => handleTabClick('orders')}
                className="flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 px-2 sm:px-2.5 py-1 rounded-lg border border-blue-500/40 transition-colors cursor-pointer text-xs font-bold animate-pulse shrink-0"
                title="شحنات تحتاج تجهيز وتسليم لمندوب الشحن"
              >
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{pendingOrdersCount} شحنات</span>
                <span className="sm:hidden text-[11px]">{pendingOrdersCount}</span>
              </button>
            )}

            {/* Add Product Shortcut */}
            <button
              type="button"
              onClick={() => handleTabClick('products')}
              className="flex items-center gap-1 bg-[#800020] hover:bg-[#600018] text-white font-bold px-2 sm:px-3 py-1 rounded-lg border border-[#D4AF37]/50 shadow-xs transition-colors cursor-pointer text-xs shrink-0"
              title="إضافة منتج جديد"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="hidden sm:inline">إضافة منتج</span>
            </button>

            {/* View Official Public Store Page Button (hidden on mobile to prevent overflow; available in tabs strip & portal body) */}
            <button
              type="button"
              onClick={() => {
                if (activeSeller) {
                  openSellerProfile(activeSeller.id);
                }
              }}
              className="hidden sm:flex items-center gap-1 bg-[#D4AF37] hover:bg-[#bfa035] text-[#800020] font-black px-2 sm:px-3 py-1 rounded-lg shadow-xs transition-colors cursor-pointer text-xs shrink-0"
              title="معاينة صفحة المتجر الرسمية كزائر"
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">صفحة المتجر</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </button>

            {/* Role Switcher Capsule */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg border border-white/15 text-[10px] shrink-0">
              <button
                type="button"
                onClick={() => { setRole('customer'); setActiveView('catalog'); }}
                className="px-1.5 sm:px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold flex items-center gap-1"
                title="العودة لمتجر المشترين"
              >
                <ArrowLeft className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span className="hidden sm:inline">المتجر</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('courier'); setActiveView('courier_dispatch'); }}
                className="px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold hidden lg:inline"
                title="بوابة المندوب والتوصيل"
              >
                المندوب
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setActiveView('admin_deck'); }}
                className="px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold hidden lg:inline"
                title="لوحة الإدارة"
              >
                الإدارة
              </button>
              <button
                type="button"
                onClick={() => { setRole('support'); setActiveView('support_disputes'); }}
                className="px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold hidden lg:inline"
                title="مكتب التحكيم"
              >
                التحكيم
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. DEDICATED MERCHANT NAVIGATION TABS STRIP */}
      <div className="bg-[#1E1B18] px-2 sm:px-6 py-1.5 border-t border-white/5 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 w-full min-w-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full min-w-0 py-0.5">
            {sellerNavTabs.map((tab) => {
              const isActive = (sellerActiveTab || 'dashboard') === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#800020] text-white border border-[#D4AF37]/60 shadow-xs'
                      : 'text-[#FAF6EE]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="bg-[#D4AF37] text-[#800020] font-black text-[10px] px-1.5 py-0.2 rounded-full ml-0.5 shrink-0">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Public Store Preview Link */}
            <button
              type="button"
              onClick={() => {
                if (activeSeller) {
                  openSellerProfile(activeSeller.id);
                }
              }}
              className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white/5 hover:bg-[#D4AF37] hover:text-[#800020] text-[#D4AF37] border border-[#D4AF37]/30 mr-1 sm:mr-2 whitespace-nowrap"
              title="زيارة صفحة المتجر الرسمية كما يراها زوار سوق دسوق"
            >
              <Store className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>معاينة المتجر للجمهور</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 shrink-0 pl-2 border-r border-white/10 text-[10px] text-gray-400 whitespace-nowrap">
            <span>دعم التجار: <strong>19000</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">تسوية يومية</span>
          </div>
        </div>
      </div>

    </header>
  );
};
