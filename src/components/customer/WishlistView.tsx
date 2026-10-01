import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, MapPin, Star, Store, Search, Sparkles, Grid, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';

export const WishlistView: React.FC = () => {
  const { 
    wishlist, 
    toggleWishlist, 
    products, 
    sellers, 
    setSelectedProduct, 
    setActiveView,
    setSearchQuery,
    setSelectedCategory,
    lang,
    t
  } = useMarketplace();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const rawWishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Filtered Wishlist Products
  const wishlistProducts = rawWishlistProducts.filter(p => {
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      const matchTitle = p.titleAr.toLowerCase().includes(q) || p.titleEn.toLowerCase().includes(q);
      const matchDesc = p.descriptionAr.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedTag) {
      if (selectedTag === 'local' && !p.isDesoqLocalMade) return false;
      if (selectedTag === 'discount' && (!p.originalPriceEGP || p.originalPriceEGP <= p.priceEGP)) return false;
      if (selectedTag === 'express' && !p.isFastDesoqDelivery) return false;
    }
    return true;
  });

  if (rawWishlistProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center mx-auto border border-[#800020]/20">
          <Heart className="w-8 h-8 text-[#800020] dark:text-[#D4AF37]" />
        </div>
        <h3 className="font-serif font-bold text-2xl text-[#800020] dark:text-[#FAF6EE]">قائمة المفضلة والرغبات فارغة</h3>
        <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          يمكنك حفظ أرقى قطع الأزياء، العطور الفاخرة، والإكسسوارات المميزة في سوق دسوق للرجوع إليها وشرائها لاحقاً.
        </p>
        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className="bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] px-8 py-3 rounded-full text-xs font-black transition-all cursor-pointer shadow-md border border-[#D4AF37]/50"
        >
          تصفح الكتالوج الآن
        </button>
      </div>
    );
  }

  return (
    <div id="wishlist-view" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      
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
            {lang === 'en' ? 'My Saved Wishlist' : 'قائمة المفضلة والرغبات'}
          </span>
          <span>/</span>
          <span className="text-stone-700 dark:text-zinc-300 font-medium">
            ({rawWishlistProducts.length} {lang === 'en' ? 'items' : 'سلع محفوظة'})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className="text-xs bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] dark:bg-zinc-800 px-4 py-2 rounded-full font-bold hover:bg-[#800020] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Back to Full Catalog' : 'العودة للكتالوج الشامل'}</span>
        </button>
      </div>

      {/* 2. Unified Hero Spotlight Banner in Burgundy & Ivory */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#800020]/20 min-h-[220px] flex flex-col justify-end p-6 sm:p-10 text-white bg-zinc-900">
        <img
          src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1200&auto=format&fit=crop&q=80"
          alt="المفضلة في سوق دسوق"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-0.5 rounded-full shadow-md">
              {rawWishlistProducts.length} سلع مختارة
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {lang === 'en' ? 'My Saved Wishlist & Favorites' : 'المفضلة وقائمة الرغبات الخاصة بك'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
            {lang === 'en' 
              ? 'Keep track of items you love with live stock availability, seller contacts, and instant purchase options.'
              : 'تابع السلع التي قمت بحفظها مع مراقبة الأسعار وتوفر المخزون المباشر من المتاجر المعتمدة.'}
          </p>

          {/* Quick Filter Attributes */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-[#D4AF37] font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>تصفية سريعة:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(selectedTag === 'local' ? null : 'local')}
              className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                selectedTag === 'local'
                  ? 'bg-[#D4AF37] text-[#800020] shadow-md'
                  : 'bg-white/15 hover:bg-white/30 text-white border border-white/20'
              }`}
            >
              تشكيلات حصرية ✨
            </button>
            <button
              type="button"
              onClick={() => setSelectedTag(selectedTag === 'discount' ? null : 'discount')}
              className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                selectedTag === 'discount'
                  ? 'bg-[#D4AF37] text-[#800020] shadow-md'
                  : 'bg-white/15 hover:bg-white/30 text-white border border-white/20'
              }`}
            >
              العروض والخصومات 🔥
            </button>
            <button
              type="button"
              onClick={() => setSelectedTag(selectedTag === 'express' ? null : 'express')}
              className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                selectedTag === 'express'
                  ? 'bg-[#D4AF37] text-[#800020] shadow-md'
                  : 'bg-white/15 hover:bg-white/30 text-white border border-white/20'
              }`}
            >
              شحن سريع ⚡
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Summary Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-[#800020]/10 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto sm:min-w-[320px] relative">
          <div className="flex items-center bg-[#FAF6EE] dark:bg-zinc-800 rounded-full px-4 py-2 border border-[#800020]/15 dark:border-zinc-700">
            <Search className="w-4 h-4 text-stone-400 ml-2 shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="ابحث داخل قائمة مفضلتك..."
              className="w-full bg-transparent text-xs text-[#1A1A1A] dark:text-zinc-100 outline-none font-medium"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="text-stone-400 hover:text-stone-600 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-zinc-400">
          <span>عرض <strong>{wishlistProducts.length}</strong> من أصل <strong>{rawWishlistProducts.length}</strong> منتج</span>
        </div>
      </div>

      {/* 4. Products Grid */}
      <section className="space-y-4">
        {wishlistProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-10 text-center border border-[#800020]/10 dark:border-zinc-700 space-y-3">
            <span className="text-3xl">🔍</span>
            <h3 className="text-base font-bold text-[#1A1A1A] dark:text-zinc-100">
              لا توجد منتجات مطابقة في المفضلة
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              جرب تغيير كلمة البحث أو إزالة الفلاتر السريعة.
            </p>
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                setSelectedTag(null);
              }}
              className="bg-[#800020] text-[#FAF6EE] px-5 py-2 rounded-full text-xs font-bold hover:bg-[#66001A] cursor-pointer"
            >
              عرض كافة المنتجات المحفوظة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {wishlistProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

