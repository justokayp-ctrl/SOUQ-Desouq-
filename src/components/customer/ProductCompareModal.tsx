import React, { useState } from 'react';
import { X, Scale, ShoppingBag, Trash2, Check, Star, MapPin, Store, Search, Grid, Plus } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const ProductCompareModal: React.FC = () => {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    addToCart, 
    sellers,
    products,
    setActiveView,
    openSellerProfile,
    addToCompare,
    lang,
    t
  } = useMarketplace();

  const [searchCatalogQuery, setSearchCatalogQuery] = useState('');

  const matchingCatalogProducts = products.filter(p => {
    if (!searchCatalogQuery.trim()) return false;
    const q = searchCatalogQuery.toLowerCase().trim();
    return (
      (p.titleAr.toLowerCase().includes(q) || p.titleEn.toLowerCase().includes(q)) &&
      !compareList.some(c => c.id === p.id)
    );
  }).slice(0, 4);

  if (compareList.length === 0) {
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
            <span className="font-bold text-[#800020] dark:text-[#D4AF37]">مقارنة المنتجات والمواصفات</span>
          </div>
        </div>

        {/* Hero Spotlight */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#800020]/20 min-h-[200px] flex flex-col justify-end p-6 sm:p-10 text-white bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80"
            alt="مقارنة المنتجات"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-0.5 rounded-full shadow-md">
                مقارنة دقيقة
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              مقارنة المنتجات والمواصفات
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
              قارن بين أسعار السلع، التقييمات، ومواصفات الخامات المعروضة جنباً إلى جنب لاختيار الأنسب لك بكل ثقة.
            </p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-[#800020]/10 dark:border-zinc-800 space-y-4 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center mx-auto border border-[#800020]/20">
            <Scale className="w-8 h-8 text-[#800020] dark:text-[#D4AF37]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#800020] dark:text-[#FAF6EE]">جدول المقارنة فارغ حالياً</h3>
          <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            اضغط على أيقونة الميزان ⚖️ عند تصفح المنتجات لمقارنتها هنا واختيار الأنسب لك بكل وضوح.
          </p>
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] px-8 py-3 rounded-full text-xs font-black transition-all cursor-pointer shadow-md border border-[#D4AF37]/50 inline-flex items-center gap-2"
          >
            <Grid className="w-4 h-4" />
            <span>تصفح الكتالوج والمنتجات</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="product-compare-view" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      
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
            {lang === 'en' ? 'Product Comparison Matrix' : 'مقارنة المنتجات والمواصفات'}
          </span>
          <span>/</span>
          <span className="text-stone-700 dark:text-zinc-300 font-medium">
            ({compareList.length} من 4 سلع)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>إفراغ المقارنة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="text-xs bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] dark:bg-zinc-800 px-4 py-1.5 rounded-full font-bold hover:bg-[#800020] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>الكتالوج</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Hero Spotlight Banner in Burgundy & Ivory */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#800020]/20 min-h-[220px] flex flex-col justify-end p-6 sm:p-10 text-white bg-zinc-900">
        <img
          src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80"
          alt="مقارنة المنتجات"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-0.5 rounded-full shadow-md">
              {compareList.length} منتجات في الجدول
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {lang === 'en' ? 'Product Comparison & Attributes' : 'مقارنة المنتجات والمواصفات'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
            {lang === 'en'
              ? 'Compare prices, customer reviews, Desoq local manufacturing origin, and specifications side-by-side.'
              : 'قارن بين أسعار السلع، التقييمات، مدن المنشأ في دسوق، والخامات المعروضة جنباً إلى جنب لتحديد خيارك الأمثل.'}
          </p>
        </div>
      </div>

      {/* 3. Search & Add Product to Compare */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-[#800020]/10 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto sm:min-w-[340px]">
            <div className="flex items-center bg-[#FAF6EE] dark:bg-zinc-800 rounded-full px-4 py-2 border border-[#800020]/15 dark:border-zinc-700">
              <Search className="w-4 h-4 text-stone-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchCatalogQuery}
                onChange={(e) => setSearchCatalogQuery(e.target.value)}
                placeholder="ابحث عن منتج آخر لإضافته لجدول المقارنة..."
                className="w-full bg-transparent text-xs text-[#1A1A1A] dark:text-zinc-100 outline-none font-medium"
              />
              {searchCatalogQuery && (
                <button
                  type="button"
                  onClick={() => setSearchCatalogQuery('')}
                  className="text-stone-400 hover:text-stone-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <span className="text-xs text-stone-500 dark:text-zinc-400">
            يمكنك مقارنة حتى 4 منتجات في وقت واحد
          </span>
        </div>

        {matchingCatalogProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
            {matchingCatalogProducts.map((p) => (
              <div 
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6EE] dark:bg-zinc-800 border border-[#800020]/10"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={p.images[0]} alt={p.titleAr} className="w-9 h-9 object-cover rounded-lg shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-bold text-[#1A1A1A] dark:text-zinc-100 truncate block">{p.titleAr}</span>
                    <span className="text-[10px] text-[#800020] dark:text-[#D4AF37] font-serif font-bold">{p.priceEGP} ج.م</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addToCompare(p);
                    setSearchCatalogQuery('');
                  }}
                  className="p-1.5 rounded-full bg-[#800020] text-white hover:bg-[#66001A] shrink-0 cursor-pointer"
                  title="إضافة للمقارنة"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Comparison Table */}
      <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-3xl border border-[#800020]/10 dark:border-zinc-800 shadow-sm">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#800020]/10 dark:border-zinc-700 bg-[#FAF6EE] dark:bg-zinc-800">
              <th scope="col" className="p-4 sm:p-5 font-bold text-stone-700 dark:text-zinc-200 w-44 sticky right-0 bg-[#FAF6EE] dark:bg-zinc-800 z-20 shadow-xs">
                وجه المقارنة
              </th>
              {compareList.map((prod) => (
                <th key={prod.id} scope="col" className="p-4 sm:p-5 min-w-[220px] align-top">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-[#800020] text-[#FAF6EE] px-2.5 py-0.5 rounded-full font-bold">
                      منتج أصلي معتمد
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCompare(prod.id)}
                      className="min-w-[32px] min-h-[32px] rounded-full border border-stone-200 dark:border-zinc-700 flex items-center justify-center text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label={`إزالة ${prod.titleAr} من المقارنة`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <img
                    src={prod.images[0]}
                    alt={prod.titleAr}
                    className="w-full h-32 object-contain bg-[#FAF6EE]/50 dark:bg-zinc-900 rounded-xl mb-2.5 border border-stone-100 dark:border-zinc-700"
                  />
                  <h4 className="font-bold text-xs text-[#1A1A1A] dark:text-zinc-100 line-clamp-2 leading-snug">{prod.titleAr}</h4>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
            {/* Price */}
            <tr>
              <th scope="row" className="p-4 sm:p-5 font-bold text-stone-700 dark:text-zinc-300 bg-[#FAF6EE]/50 dark:bg-zinc-850 sticky right-0 z-10 text-right">
                السعر الحالي
              </th>
              {compareList.map((prod) => (
                <td key={prod.id} className="p-4 sm:p-5 font-serif font-bold text-base text-[#800020] dark:text-[#D4AF37]">
                  {prod.priceEGP} ج.م
                  {prod.originalPriceEGP && prod.originalPriceEGP > prod.priceEGP && (
                    <span className="block text-xs text-stone-400 line-through font-normal">
                      {prod.originalPriceEGP} ج.م
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Seller */}
            <tr>
              <th scope="row" className="p-4 sm:p-5 font-bold text-stone-700 dark:text-zinc-300 bg-[#FAF6EE]/50 dark:bg-zinc-850 sticky right-0 z-10 text-right">
                التاجر المعتمد
              </th>
              {compareList.map((prod) => {
                const seller = sellers.find(s => s.id === prod.sellerId);
                return (
                  <td key={prod.id} className="p-4 sm:p-5">
                    {seller ? (
                      <button
                        type="button"
                        onClick={() => openSellerProfile(seller.id)}
                        className="text-xs text-[#800020] dark:text-[#D4AF37] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>{seller.name}</span>
                      </button>
                    ) : (
                      'تاجر معتمد'
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Rating */}
            <tr>
              <th scope="row" className="p-4 sm:p-5 font-bold text-stone-700 dark:text-zinc-300 bg-[#FAF6EE]/50 dark:bg-zinc-850 sticky right-0 z-10 text-right">
                التقييم
              </th>
              {compareList.map((prod) => (
                <td key={prod.id} className="p-4 sm:p-5">
                  <div className="flex items-center gap-1 text-[#D4AF37] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{prod.rating}</span>
                    <span className="text-stone-400 font-normal">({prod.reviewCount} تقييم)</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Origin & Production */}
            <tr>
              <th scope="row" className="p-4 sm:p-5 font-bold text-stone-700 dark:text-zinc-300 bg-[#FAF6EE]/50 dark:bg-zinc-850 sticky right-0 z-10 text-right">
                بلد المنشأ
              </th>
              {compareList.map((prod) => (
                <td key={prod.id} className="p-4 sm:p-5">
                  <span className="inline-flex items-center gap-1 text-stone-700 dark:text-zinc-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                    {prod.attributes.origin || 'جودة ممتازة معتمدة'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Quick Action */}
            <tr>
              <th scope="row" className="p-4 sm:p-5 font-bold text-stone-700 dark:text-zinc-300 bg-[#FAF6EE]/50 dark:bg-zinc-850 sticky right-0 z-10 text-right">
                إجراء الشراء
              </th>
              {compareList.map((prod) => (
                <td key={prod.id} className="p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => addToCart(prod, prod.variants?.[0], 1)}
                    className="w-full bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>إضافة للسلة</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
