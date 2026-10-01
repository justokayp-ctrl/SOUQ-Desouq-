import React, { useState, Suspense } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Role } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { CustomerHomeView } from './components/customer/CustomerHomeView';
import { SEOManager } from './components/common/SEOManager';
import { LiveActivityPulse } from './components/common/LiveActivityPulse';
import { CheckCircle2, Loader2 } from 'lucide-react';

// Lazy Loaded Customer Secondary Views & Modals (On-Demand Code Splitting)
const SearchResultsView = React.lazy(() => import('./components/customer/SearchResultsView').then(m => ({ default: m.SearchResultsView })));
const DepartmentHouseView = React.lazy(() => import('./components/departments/DepartmentHouseView').then(m => ({ default: m.DepartmentHouseView })));
const ProductDetailModal = React.lazy(() => import('./components/customer/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
const CartDrawer = React.lazy(() => import('./components/customer/CartDrawer').then(m => ({ default: m.CartDrawer })));
const CheckoutModal = React.lazy(() => import('./components/customer/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const OrderTrackingView = React.lazy(() => import('./components/customer/OrderTrackingView').then(m => ({ default: m.OrderTrackingView })));
const ProductCompareModal = React.lazy(() => import('./components/customer/ProductCompareModal').then(m => ({ default: m.ProductCompareModal })));
const WishlistView = React.lazy(() => import('./components/customer/WishlistView').then(m => ({ default: m.WishlistView })));
const SellerProfileView = React.lazy(() => import('./components/customer/SellerProfileView').then(m => ({ default: m.SellerProfileView })));
const CategoryExplorerView = React.lazy(() => import('./components/customer/CategoryExplorerView').then(m => ({ default: m.CategoryExplorerView })));
const SellersDirectoryView = React.lazy(() => import('./components/customer/SellersDirectoryView').then(m => ({ default: m.SellersDirectoryView })));
const FlashDealsView = React.lazy(() => import('./components/customer/FlashDealsView').then(m => ({ default: m.FlashDealsView })));
const CuratedCollectionsView = React.lazy(() => import('./components/customer/CuratedCollectionsView').then(m => ({ default: m.CuratedCollectionsView })));
const AuthModal = React.lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

// Performance Optimization: Lazy Load Heavy Non-Consumer Views
const SellerPortal = React.lazy(() => import('./components/seller/SellerPortal').then(m => ({ default: m.SellerPortal })));
const AdminOpsDeck = React.lazy(() => import('./components/admin/AdminOpsDeck').then(m => ({ default: m.AdminOpsDeck })));
const SupportDisputesView = React.lazy(() => import('./components/support/SupportDisputesView').then(m => ({ default: m.SupportDisputesView })));
const CourierDispatchView = React.lazy(() => import('./components/courier/CourierDispatchView').then(m => ({ default: m.CourierDispatchView })));

// High-Fidelity Skeleton Loader for Lazy-Loaded Components (Layout Shift & Jitter prevention)
const MainAppViewLoader: React.FC = () => (
  <div id="main-view-shimmer-loader" className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-pulse text-right" dir="rtl">
    <div className="bg-gradient-to-r from-stone-200 to-stone-100 dark:from-zinc-800 dark:to-zinc-900 h-44 sm:h-56 rounded-3xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#800020] dark:text-[#D4AF37] animate-spin opacity-40" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-100 dark:border-zinc-800 space-y-4">
          <div className="aspect-square bg-stone-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-4 w-3/4 bg-stone-100 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-1/2 bg-stone-100 dark:bg-zinc-800 rounded" />
          <div className="h-8 bg-stone-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

// High-Fidelity Unauthorized / Forbidden State Panel (Phase 8 Requirement & Session Security)
const AccessDeniedState: React.FC<{ 
  view: string; 
  role: string; 
  onReset: () => void;
  onOpenLogin: (requiredRole: Role) => void;
}> = ({ view, role, onReset, onOpenLogin }) => {
  const getTargetRole = (): Role => {
    if (view === 'admin_deck') return 'admin';
    if (view === 'seller_dashboard') return 'seller';
    if (view === 'courier_dispatch') return 'courier';
    if (view === 'support_disputes') return 'support';
    return 'customer';
  };

  const targetRole = getTargetRole();
  const roleNameMap: Record<Role, string> = {
    admin: 'مدير منصة سوق دسوق',
    seller: 'تاجر معتمد',
    courier: 'مندوب شحن وتوصيل',
    support: 'مستشار خدمة عملاء وتحكيم',
    customer: 'مشتري'
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6 text-right" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center mx-auto text-3xl border border-[#D4AF37]/30">
        🛡️
      </div>
      <div className="space-y-2">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
          منطقة محمية بصلاحيات خاصة
        </h3>
        <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
          أنت تحاول الوصول إلى {view === 'admin_deck' ? 'لوحة تحكم الإدارة المركزية' : view === 'seller_dashboard' ? 'بوابة التاجر وإدارة المتجر' : view === 'courier_dispatch' ? 'بوابة مناديب التوصيل' : 'بوابة التحكيم وفض النزاعات'} بصلاحية <strong>({role})</strong> الحالية. يتطلب هذا القسم حساباً بصلاحية <strong>{roleNameMap[targetRole]}</strong>.
        </p>
      </div>
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={() => onOpenLogin(targetRole)}
          className="w-full bg-[#800020] hover:bg-[#66001A] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          تسجيل الدخول كـ {roleNameMap[targetRole]}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          العودة للكتالوج الرئيسي
        </button>
      </div>
    </div>
  );
};

const MarketplaceApp: React.FC = () => {
  const { 
    activeView, 
    toastMessage, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    selectedProduct,
    selectedSellerProfileId,
    sellers,
    categories,
    selectedCategory,
    role,
    setRole,
    setActiveView,
    setPendingDestination,
    setAuthModalInitialTab
  } = useMarketplace();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Compute authorization status (Phase 8: Forbidden & Unauthorized checks)
  const isAuthorized = () => {
    if (activeView === 'admin_deck' && role !== 'admin') return false;
    if (activeView === 'seller_dashboard' && role !== 'seller') return false;
    if (activeView === 'support_disputes' && role !== 'support') return false;
    if (activeView === 'courier_dispatch' && role !== 'courier') return false;
    return true;
  };

  // Compute Active dynamic SEO parameters for Search Engines & Social Graphs
  const currentSeller = sellers.find(s => s.id === selectedSellerProfileId);
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const isPrivateView = activeView === 'admin_deck' || activeView === 'seller_dashboard' || activeView === 'support_disputes' || activeView === 'courier_dispatch';

  let seoTitle = 'Souq Desoq | سوق دسوق للأزياء والعطور والإكسسوارات';
  let seoDesc = 'سوق دسوق - المنصة الإلكترونية الرائدة للأزياء الراقية، العطور الشرقية والفرنسية، المجوهرات والإكسسوارات الفاخرة في مصر مع ضمان الجودة والشحن السريع.';
  let canonicalUrl = 'https://souqdesoq.com';
  let ogType: 'website' | 'product' | 'profile' = 'website';
  let ogImage = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600';
  let breadcrumbs: Array<{ name: string; url: string }> = [
    { name: 'الرئيسية', url: 'https://souqdesoq.com/' }
  ];

  if (selectedProduct) {
    seoTitle = `${selectedProduct.titleAr}`;
    seoDesc = selectedProduct.descriptionAr.slice(0, 150) + '...';
    canonicalUrl = `https://souqdesoq.com/products/${selectedProduct.id}`;
    ogType = 'product';
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      ogImage = selectedProduct.images[0];
    }
    breadcrumbs.push({ name: selectedProduct.category, url: `https://souqdesoq.com/?category=${encodeURIComponent(selectedProduct.category)}` });
    breadcrumbs.push({ name: selectedProduct.titleAr, url: canonicalUrl });
  } else if (activeView === 'seller_profile' && currentSeller) {
    seoTitle = `متجر ${currentSeller.name} | سوق دسوق المعتمد`;
    seoDesc = `تسوق أونلاين من متجر ${currentSeller.name} في دسوق. المالك: ${currentSeller.ownerName}. مبيعات مباشرة مع ضمان الجودة وسرعة التوصيل.`;
    canonicalUrl = `https://souqdesoq.com/sellers/${currentSeller.id}`;
    ogType = 'profile';
    if (currentSeller.logo || currentSeller.banner) {
      ogImage = currentSeller.logo || currentSeller.banner;
    }
    breadcrumbs.push({ name: 'المتاجر المعتمدة', url: 'https://souqdesoq.com/?view=sellers' });
    breadcrumbs.push({ name: currentSeller.name, url: canonicalUrl });
  } else if (activeView === 'search_results') {
    if (selectedCategory && currentCategory) {
      const catTitle = currentCategory.nameAr || currentCategory.titleAr || '';
      seoTitle = `${catTitle} | سوق دسوق`;
      seoDesc = currentCategory.description;
      canonicalUrl = `https://souqdesoq.com/?category=${currentCategory.id}`;
      breadcrumbs.push({ name: 'البحث والمنتجات', url: 'https://souqdesoq.com/?view=search' });
      breadcrumbs.push({ name: catTitle, url: canonicalUrl });
    } else {
      seoTitle = 'نتائج البحث في المنتجات | سوق دسوق';
      seoDesc = 'استعرض المنتجات والمصنوعات اليدوية المطابقة لبحثك في سوق دسوق.';
      canonicalUrl = 'https://souqdesoq.com/?view=search';
      breadcrumbs.push({ name: 'البحث', url: canonicalUrl });
    }
  } else if (activeView === 'orders') {
    seoTitle = 'تتبع الطلبات والشحنات | سوق دسوق';
    seoDesc = 'تابع حالة شحنتك ومشترياتك خطوة بخطوة من مستودعات تجار دسوق إلى باب منزلك.';
    canonicalUrl = 'https://souqdesoq.com/?view=orders';
    breadcrumbs.push({ name: 'تتبع الطلبات', url: canonicalUrl });
  } else if (activeView === 'wishlist') {
    seoTitle = 'قائمة المفضلة | سوق دسوق';
    seoDesc = 'السلع والمصنوعات اليدوية التي قمت بحفظها لشرائها لاحقاً من تجار سوق دسوق.';
    canonicalUrl = 'https://souqdesoq.com/?view=wishlist';
    breadcrumbs.push({ name: 'المفضلة', url: canonicalUrl });
  } else if (activeView === 'compare') {
    seoTitle = 'مقارنة المنتجات | سوق دسوق';
    seoDesc = 'مقارنة المواصفات والأسعار بين المنتجات المختارة.';
    canonicalUrl = 'https://souqdesoq.com/?view=compare';
    breadcrumbs.push({ name: 'المقارنة', url: canonicalUrl });
  } else if (activeView === 'category_hub' || activeView === 'categories') {
    seoTitle = 'دليل ومستكشف الأقسام الشامل | سوق دسوق';
    seoDesc = 'استكشف كافة الأروقة والتصنيفات الدقيقة للمنتجات والمصنوعات في دسوق.';
    canonicalUrl = 'https://souqdesoq.com/?view=category_hub';
    breadcrumbs.push({ name: 'دليل الأقسام', url: canonicalUrl });
  } else if (activeView === 'sellers_directory' || activeView === 'sellers') {
    seoTitle = 'دليل صُنّاع ومتاجر دسوق المعتمدين | سوق دسوق';
    seoDesc = 'تصفح قائمة المشاغل وورش وتجار دسوق الموثقين وتعرف على تقييماتهم ومعروضاتهم.';
    canonicalUrl = 'https://souqdesoq.com/?view=sellers_directory';
    breadcrumbs.push({ name: 'دليل المتاجر', url: canonicalUrl });
  } else if (activeView === 'flash_deals' || activeView === 'deals') {
    seoTitle = 'صفقات التوفير والعروض الخاطفة | سوق دسوق';
    seoDesc = 'عروض يومية وخصومات تصل إلى 50% من مصانع وتجار دسوق مع شحن سريع.';
    canonicalUrl = 'https://souqdesoq.com/?view=flash_deals';
    breadcrumbs.push({ name: 'العروض والصفقات', url: canonicalUrl });
  } else if (activeView === 'curated_collections' || activeView === 'collections') {
    seoTitle = 'المجموعات المختارة ودليل المناسبات | سوق دسوق';
    seoDesc = 'باقات وتنسيقات منتقاة لجهاز العروسة، الهدايا، والأناقة الملكية مع تخفيض باقات فوري.';
    canonicalUrl = 'https://souqdesoq.com/?view=curated_collections';
    breadcrumbs.push({ name: 'المجموعات المختارة', url: canonicalUrl });
  } else if (activeView === 'seller_dashboard' || activeView === 'seller_portal') {
    seoTitle = 'بوابة التجار وإدارة المبيعات | سوق دسوق';
    seoDesc = 'لوحة تحكم التاجر لإدارة المنتجات، الطلبات، الأرباح ووثائق KYC.';
    canonicalUrl = 'https://souqdesoq.com/?view=seller_dashboard';
    breadcrumbs.push({ name: 'بوابة التاجر', url: canonicalUrl });
  } else if (activeView === 'admin_deck') {
    seoTitle = 'لوحة الإدارة العليا والرقابة | سوق دسوق';
    seoDesc = 'الرقابة المركزية على العمليات، الأداء المالي، وقواطع الأمان.';
    canonicalUrl = 'https://souqdesoq.com/?view=admin_deck';
    breadcrumbs.push({ name: 'الإدارة العليا', url: canonicalUrl });
  } else if (activeView === 'support_disputes') {
    seoTitle = 'مركز الدعم والتحكيم وحماية المستهلك | سوق دسوق';
    seoDesc = 'إدارة شكاوى المشترين وفض النزاعات طبقاً لقانون حماية المستهلك رقم 181 لسنة 2018.';
    canonicalUrl = 'https://souqdesoq.com/?view=support_disputes';
    breadcrumbs.push({ name: 'الدعم والتحكيم', url: canonicalUrl });
  }

  // Enrich selectedProduct with its verified seller object for Rich Schema & OG meta
  const productWithSeller = selectedProduct ? {
    ...selectedProduct,
    seller: sellers.find(s => s.id === selectedProduct.sellerId) || currentSeller
  } : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-zinc-950 text-[#1A1A1A] dark:text-zinc-100 font-sans antialiased selection:bg-[#800020] selection:text-white transition-colors duration-200 overflow-x-hidden w-full">
      
      {/* 1. SEO Head Rewriter & Schema Injector */}
      <SEOManager
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={canonicalUrl}
        ogType={ogType}
        ogImage={ogImage}
        productData={productWithSeller}
        sellerData={currentSeller}
        breadcrumbs={breadcrumbs}
        noIndex={isPrivateView}
        syncBrowserUrl={true}
      />

      {/* Platform Header */}
      <Header />

      {/* Main View Router */}
      <main id="main-content" tabIndex={-1} className="flex-1 pb-24 md:pb-16 focus:outline-none w-full min-w-0">
        <React.Suspense fallback={<MainAppViewLoader />}>
          {!isAuthorized() ? (
            <AccessDeniedState 
              view={activeView} 
              role={role} 
              onReset={() => { setRole('customer'); setActiveView('catalog'); }} 
              onOpenLogin={(requiredRole) => {
                setPendingDestination(activeView);
                setAuthModalInitialTab('login');
                setIsAuthModalOpen(true);
              }}
            />
          ) : (
            <>
              {(activeView === 'catalog' || activeView === 'home') && <CustomerHomeView />}
              {activeView === 'department_realm' && <DepartmentHouseView />}
              {(activeView === 'category_hub' || activeView === 'categories') && <CategoryExplorerView />}
              {(activeView === 'sellers_directory' || activeView === 'sellers') && <SellersDirectoryView />}
              {(activeView === 'flash_deals' || activeView === 'deals') && <FlashDealsView />}
              {(activeView === 'curated_collections' || activeView === 'collections') && <CuratedCollectionsView />}
              {activeView === 'search_results' && <SearchResultsView />}
              {activeView === 'orders' && <OrderTrackingView />}
              {activeView === 'wishlist' && <WishlistView />}
              {activeView === 'compare' && <ProductCompareModal />}
              {activeView === 'seller_profile' && <SellerProfileView />}
              {activeView === 'seller_dashboard' && <SellerPortal />}
              {activeView === 'admin_deck' && <AdminOpsDeck />}
              {activeView === 'support_disputes' && <SupportDisputesView />}
              {activeView === 'courier_dispatch' && <CourierDispatchView />}
            </>
          )}
        </React.Suspense>
      </main>

      {/* Sticky Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer with Egyptian trust badges */}
      <Footer />

      {/* Global Modals & Drawers with Suspense */}
      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        )}

        <ProductDetailModal />
        
        <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
        
        {isCheckoutOpen && (
          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
          />
        )}
      </Suspense>

      {/* Live Activity & Customer Care Floating Pulse */}
      <LiveActivityPulse />

      {/* Clean Minimalist Toast Notification */}
      {toastMessage && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-2xl border border-[#D4AF37]/40 flex items-center gap-3 text-xs font-bold transition-all max-w-[90vw] text-center"
        >
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
