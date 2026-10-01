import React, { useState, Suspense, lazy } from 'react';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Tag, 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  ExternalLink, 
  Store, 
  Sparkles, 
  Boxes, 
  Users, 
  BarChart3, 
  Wallet, 
  Settings, 
  Wrench, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Zap, 
  Printer,
  Megaphone,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, ProductCategory, OrderStatus } from '../../types';
import { SellerAirwayBillModal } from './SellerAirwayBillModal';

// Modular Sub-Views (Core active first, heavy secondary views lazy loaded)
import { SellerDashboardView } from './SellerDashboardView';
import { SellerProductsView } from './SellerProductsView';
import { SellerInventoryView } from './SellerInventoryView';
import { SellerOrdersView } from './SellerOrdersView';

const SellerCustomersView = lazy(() => import('./SellerCustomersView').then(m => ({ default: m.SellerCustomersView })));
const SellerPromotionsView = lazy(() => import('./SellerPromotionsView').then(m => ({ default: m.SellerPromotionsView })));
const SellerAnalyticsChart = lazy(() => import('./SellerAnalyticsChart').then(m => ({ default: m.SellerAnalyticsChart })));
const SellerFinanceView = lazy(() => import('./SellerFinanceView').then(m => ({ default: m.SellerFinanceView })));
const SellerStoreSettingsView = lazy(() => import('./SellerStoreSettingsView').then(m => ({ default: m.SellerStoreSettingsView })));
const SellerToolsView = lazy(() => import('./SellerToolsView').then(m => ({ default: m.SellerToolsView })));
const KycVaultManager = lazy(() => import('./KycVaultManager').then(m => ({ default: m.KycVaultManager })));
const ProductWizardModal = lazy(() => import('./ProductWizardModal').then(m => ({ default: m.ProductWizardModal })));

export const SellerPortal: React.FC = () => {
  const {
    activeSeller,
    activeSellerId,
    setActiveSellerId,
    sellers,
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    setProductStatus,
    updateSeller,
    requestSellerPayout,
    updateSubOrderStatus,
    showToast,
    sellerActiveTab,
    setSellerActiveTab,
    openSellerProfile
  } = useMarketplace();

  // Normalize Active Tab State across the 10 requested tabs:
  // Overview, Products, Inventory, Orders, Customers, Marketing, Finance, Analytics, Store, Settings
  type TabKey = 
    | 'overview'
    | 'products'
    | 'inventory'
    | 'orders'
    | 'customers'
    | 'marketing'
    | 'finance'
    | 'analytics'
    | 'store'
    | 'settings'
    | 'tools'
    | 'kyc';

  let currentTab: TabKey = 'overview';
  if (sellerActiveTab === 'products') currentTab = 'products';
  else if (sellerActiveTab === 'inventory') currentTab = 'inventory';
  else if (sellerActiveTab === 'orders') currentTab = 'orders';
  else if (sellerActiveTab === 'customers') currentTab = 'customers';
  else if (sellerActiveTab === 'marketing' || sellerActiveTab === 'promotions') currentTab = 'marketing';
  else if (sellerActiveTab === 'finance') currentTab = 'finance';
  else if (sellerActiveTab === 'analytics') currentTab = 'analytics';
  else if (sellerActiveTab === 'store') currentTab = 'store';
  else if (sellerActiveTab === 'settings') currentTab = 'settings';
  else if (sellerActiveTab === 'tools') currentTab = 'tools';
  else if (sellerActiveTab === 'kyc') currentTab = 'kyc';
  else currentTab = 'overview';

  const handleNavigateTab = (tab: TabKey | string) => {
    setSellerActiveTab(tab as any);
  };

  // Product Creation & Editing Wizard Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Quick Stock Adjustment Modal State
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(10);

  // Selected Order for Airway Bill Modal
  const [shippingSlipSubOrder, setShippingSlipSubOrder] = useState<any | null>(null);

  if (!activeSeller) {
    return (
      <div id="seller-portal-empty" className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400 dark:text-zinc-500 border border-stone-200 dark:border-zinc-700">
          <Store className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-zinc-100 font-serif">
            لا يوجد متجر مسجل حالياً
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-md mx-auto">
            تم تفريغ كافة المتاجر التجريبية. يمكنك تسجيل متجرك الحقيقي والبدء في إضافة منتجاتك وبدء البيع فوراً.
          </p>
        </div>
      </div>
    );
  }

  // Filter products belonging to active seller
  const sellerProducts = products.filter(p => p.sellerId === activeSeller.id);

  // Filter sub-orders routed to this seller from all customer checkouts
  const sellerSubOrders = orders.flatMap(order => 
    order.subOrders
      .filter(sub => sub.sellerId === activeSeller.id)
      .map(sub => ({
        ...sub,
        parentOrderId: order.id,
        parentTrackingCode: order.trackingCode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      }))
  );

  const handleOpenWizard = (prod?: Product | null) => {
    setProductToEdit(prod || null);
    setIsWizardOpen(true);
  };

  const handleOpenStockModal = (prod: Product) => {
    setEditingStockProduct(prod);
    setNewStockVal(prod.stock);
  };

  const handleQuickStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStockProduct) {
      updateProduct(editingStockProduct.id, { stock: Number(newStockVal) });
      showToast(`تم تحديث مخزون "${editingStockProduct.titleAr}" إلى ${newStockVal} قطعة`);
      setEditingStockProduct(null);
    }
  };

  return (
    <div id="seller-portal" className="max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 w-full min-w-0 overflow-x-hidden">
      
      {/* 1. SELLER PORTAL TOP HEADER & MERCHANT SWITCHER */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl sm:rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-4 sm:p-6 lg:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 w-full min-w-0">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0">
          <div className="relative shrink-0">
            {activeSeller.logo ? (
              <img
                src={activeSeller.logo}
                alt={activeSeller.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-sm bg-white"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#800020] text-[#D4AF37] font-serif font-bold text-xl sm:text-2xl flex items-center justify-center shadow-xs">
                {activeSeller.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#800020] p-0.5 sm:p-1 rounded-full shadow-xs">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-zinc-100 truncate">{activeSeller.name}</h1>
              <span className="text-[10px] sm:text-[11px] bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 px-2 sm:px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-700" />
                متجر معتمد بدسوق
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1 truncate max-w-full">
                <MapPin className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37] shrink-0" />
                <span className="truncate">{activeSeller.city} — {activeSeller.address}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="shrink-0">عمولة المنصة: {(activeSeller.commissionRate * 100).toFixed(0)}%</span>
            </p>
          </div>
        </div>

        {/* Actions Hub: Switch merchant, Preview Store or add product */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-zinc-700 w-full md:w-auto">
          <div className="flex-1 sm:flex-none text-right min-w-[120px]">
            <span className="text-[10px] text-gray-400 block mb-0.5">تبديل المتجر:</span>
            <select
              id="active-seller-select"
              value={activeSellerId}
              onChange={(e) => setActiveSellerId(e.target.value)}
              className="w-full sm:w-auto text-xs font-bold bg-[#F5F2ED] dark:bg-zinc-700 dark:text-zinc-100 border-none rounded-xl sm:rounded-full px-3 py-1.5 sm:py-2 outline-none cursor-pointer focus:ring-1 focus:ring-[#D4AF37]"
            >
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Official Storefront Preview Button */}
            <button
              type="button"
              onClick={() => openSellerProfile(activeSeller.id)}
              className="bg-[#D4AF37] hover:bg-[#bfa035] text-[#800020] px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-black shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="معاينة صفحة المتجر الرسمية كزائر"
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">عرض المتجر</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            <button
              id="seller-add-product-btn"
              onClick={() => handleOpenWizard(null)}
              className="bg-[#800020] hover:bg-[#600018] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-bold shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
              <span>إضافة منتج</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE 10 OFFICIAL SELLER NAVIGATION TABS */}
      <div className="w-full min-w-0 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold whitespace-nowrap min-w-max py-0.5">
          
          {/* 1. Overview */}
          <button
            onClick={() => handleNavigateTab('overview')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'overview' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>الرئيسية</span>
          </button>

          {/* 2. Products */}
          <button
            onClick={() => handleNavigateTab('products')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'products' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>المنتجات</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold shrink-0">
              {sellerProducts.length}
            </span>
          </button>

          {/* 3. Inventory */}
          <button
            onClick={() => handleNavigateTab('inventory')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'inventory' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Boxes className="w-4 h-4 shrink-0" />
            <span>المخزون</span>
          </button>

          {/* 4. Orders */}
          <button
            onClick={() => handleNavigateTab('orders')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'orders' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>الطلبات</span>
            {sellerSubOrders.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold shrink-0">
                {sellerSubOrders.length}
              </span>
            )}
          </button>

          {/* 5. Customers */}
          <button
            onClick={() => handleNavigateTab('customers')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'customers' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>العملاء</span>
          </button>

          {/* 6. Marketing */}
          <button
            onClick={() => handleNavigateTab('marketing')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'marketing' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>العروض والخصومات</span>
          </button>

          {/* 7. Finance */}
          <button
            onClick={() => handleNavigateTab('finance')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'finance' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>الرصيد والأرباح</span>
          </button>

          {/* 8. Analytics */}
          <button
            onClick={() => handleNavigateTab('analytics')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'analytics' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>تقارير المبيعات</span>
          </button>

          {/* 9. Store */}
          <button
            onClick={() => handleNavigateTab('store')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'store' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>واجهة المتجر</span>
          </button>

          {/* 10. Settings */}
          <button
            onClick={() => handleNavigateTab('settings')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              currentTab === 'settings' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>إعدادات المتجر</span>
          </button>

        </div>
      </div>

      {/* 3. ACTIVE TAB VIEW DISPATCH */}
      
      {/* Tab 1: Overview */}
      {currentTab === 'overview' && (
        <SellerDashboardView
          seller={activeSeller}
          products={sellerProducts}
          subOrders={sellerSubOrders}
          lowStockProducts={sellerProducts.filter((p) => p.stock < 10)}
          unansweredMessagesCount={0}
          onNavigateTab={handleNavigateTab}
          onOpenProductWizard={handleOpenWizard}
          onOpenStockModal={handleOpenStockModal}
          onOpenPromoModal={() => handleNavigateTab('marketing')}
          onOpenShippingSlip={(order) => setShippingSlipSubOrder(order)}
          onQuickUpdateStatus={(parentOrderId, subOrderId, status) =>
            updateSubOrderStatus(parentOrderId, subOrderId, status, 'تحديث سريع من لوحة التشغيل')
          }
        />
      )}

      {/* Tab 2: Products */}
      {currentTab === 'products' && (
        <SellerProductsView
          products={sellerProducts}
          categories={categories}
          seller={activeSeller}
          onOpenWizard={handleOpenWizard}
          onOpenStockModal={handleOpenStockModal}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
          onDuplicateProduct={duplicateProduct}
          onSetProductStatus={setProductStatus}
          onShowToast={showToast}
        />
      )}

      {/* Tab 3: Inventory */}
      {currentTab === 'inventory' && (
        <SellerInventoryView
          products={sellerProducts}
          seller={activeSeller}
          subOrders={sellerSubOrders}
          onUpdateProduct={updateProduct}
          onShowToast={showToast}
        />
      )}

      {/* Tab 4: Orders */}
      {currentTab === 'orders' && (
        <SellerOrdersView
          seller={activeSeller}
          subOrders={sellerSubOrders}
          onUpdateSubOrderStatus={updateSubOrderStatus}
          onOpenShippingSlip={(order) => setShippingSlipSubOrder(order)}
          onShowToast={showToast}
        />
      )}

      {/* Tab 5: Customers */}
      <Suspense fallback={
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#800020] animate-spin" />
        </div>
      }>
        {currentTab === 'customers' && (
          <SellerCustomersView
            seller={activeSeller}
            onShowToast={showToast}
          />
        )}

        {/* Tab 6: Marketing */}
        {currentTab === 'marketing' && (
          <SellerPromotionsView
            seller={activeSeller}
            onShowToast={showToast}
          />
        )}

        {/* Tab 7: Finance */}
        {currentTab === 'finance' && (
          <SellerFinanceView
            seller={activeSeller}
            onRequestPayout={requestSellerPayout}
            onShowToast={showToast}
          />
        )}

        {/* Tab 8: Analytics */}
        {currentTab === 'analytics' && (
          <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs">
            <SellerAnalyticsChart
              seller={activeSeller}
              products={sellerProducts}
            />
          </div>
        )}

        {/* Tab 9: Store */}
        {currentTab === 'store' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent p-5 rounded-3xl border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#800020] dark:text-[#D4AF37] flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  <span>معاينة صفحة المتجر العامة في سوق دسوق</span>
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1">
                  يمكنك معاينة صفحة متجرك كما يشاهدها المشترون تماماً بالتقييمات والمنتجات والعنوان بدسوق.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSellerProfile(activeSeller.id)}
                className="bg-[#800020] hover:bg-[#600018] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>فتح المتجر كزائر</span>
                <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>

            <SellerStoreSettingsView
              seller={activeSeller}
              onUpdateSeller={(updates) => updateSeller(activeSeller.id, updates)}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* Tab 10: Settings */}
        {currentTab === 'settings' && (
          <div className="space-y-6">
            <SellerStoreSettingsView
              seller={activeSeller}
              onUpdateSeller={(updates) => updateSeller(activeSeller.id, updates)}
              onShowToast={showToast}
            />

            <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs">
              <KycVaultManager seller={activeSeller} />
            </div>
          </div>
        )}
      </Suspense>

      {/* 4. PRODUCT CREATION / EDITING WIZARD MODAL */}
      <Suspense fallback={null}>
        {isWizardOpen && (
          <ProductWizardModal
            isOpen={isWizardOpen}
            onClose={() => {
              setIsWizardOpen(false);
              setProductToEdit(null);
            }}
            sellerId={activeSeller.id}
            sellerName={activeSeller.name}
            productToEdit={productToEdit}
          />
        )}
      </Suspense>

      {/* 5. QUICK STOCK REFILL MODAL */}
      {editingStockProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-700">
              <h3 className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                <span>تعديل سريع للمخزون بالمستودع</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingStockProduct(null)}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-zinc-300">
              المنتج: <strong className="text-[#1A1A1A] dark:text-zinc-100">{editingStockProduct.titleAr}</strong>
            </div>

            <form onSubmit={handleQuickStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  الكمية الجديدة المتوفرة في المخزن
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={newStockVal}
                    onChange={(e) => setNewStockVal(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-sm font-bold text-[#1A1A1A] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020]"
                    required
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setNewStockVal((v) => Math.max(0, v + 10))}
                      className="px-2.5 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStockVal((v) => Math.max(0, v + 50))}
                      className="px-2.5 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      +50
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStockProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ وتحديث المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SHIPPING AIRWAY BILL MODAL */}
      <SellerAirwayBillModal
        isOpen={Boolean(shippingSlipSubOrder)}
        onClose={() => setShippingSlipSubOrder(null)}
        seller={activeSeller}
        subOrder={shippingSlipSubOrder}
      />

    </div>
  );
};
