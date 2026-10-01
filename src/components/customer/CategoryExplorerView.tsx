import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  SlidersHorizontal, 
  Store, 
  Check, 
  Tag, 
  Flame, 
  ChevronLeft, 
  Shirt, 
  Crown, 
  Eye, 
  ShoppingBag, 
  Heart,
  Grid,
  Filter,
  CheckCircle2,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { EXTENDED_CATEGORIES, ExtendedCategory, SubCategory } from '../../data/categoriesData';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';

export const CategoryExplorerView: React.FC = () => {
  const { 
    products, 
    sellers, 
    setSelectedCategory, 
    setActiveView, 
    setSelectedProduct,
    addToCart,
    showToast,
    searchQuery,
    setSearchQuery
  } = useMarketplace();

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [selectedSubCatId, setSelectedSubCatId] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');

  // Filter categories by local search
  const filteredCategories = useMemo(() => {
    if (!localSearch.trim()) return EXTENDED_CATEGORIES;
    const query = localSearch.toLowerCase().trim();
    return EXTENDED_CATEGORIES.filter(cat => 
      cat.nameAr.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.subcategories.some(sub => 
        sub.nameAr.toLowerCase().includes(query) ||
        sub.descriptionAr.toLowerCase().includes(query) ||
        sub.popularSearchTerms.some(term => term.toLowerCase().includes(query))
      )
    );
  }, [localSearch]);

  // Selected Category
  const currentCategory = useMemo(() => {
    if (activeCategoryId === 'all') return null;
    return EXTENDED_CATEGORIES.find(c => c.id === activeCategoryId) || null;
  }, [activeCategoryId]);

  // Products belonging to the selected category or subcategory
  const categoryProducts = useMemo(() => {
    let prods = products;

    if (activeCategoryId !== 'all' && currentCategory) {
      const aliasSet = new Set([currentCategory.id, ...(currentCategory.aliasIds || [])]);
      prods = prods.filter(p => {
        const catLower = (p.category || '').toLowerCase();
        return aliasSet.has(catLower) || 
          aliasSet.has(p.category) ||
          currentCategory.subcategories.some(sub => sub.nameAr === p.category || sub.id === (p as any).subCategoryId);
      });
    }

    if (selectedSubCatId && currentCategory) {
      const sub = currentCategory.subcategories.find(s => s.id === selectedSubCatId);
      if (sub) {
        prods = prods.filter(p => 
          p.category.includes(sub.nameAr) || 
          p.titleAr.includes(sub.nameAr) ||
          sub.popularSearchTerms.some(t => p.titleAr.includes(t) || p.descriptionAr.includes(t))
        );
      }
    }

    if (selectedPriceRange === 'under200') {
      prods = prods.filter(p => p.priceEGP < 200);
    } else if (selectedPriceRange === '200to500') {
      prods = prods.filter(p => p.priceEGP >= 200 && p.priceEGP <= 500);
    } else if (selectedPriceRange === '500to1000') {
      prods = prods.filter(p => p.priceEGP > 500 && p.priceEGP <= 1000);
    } else if (selectedPriceRange === 'above1000') {
      prods = prods.filter(p => p.priceEGP > 1000);
    }

    return prods;
  }, [products, activeCategoryId, currentCategory, selectedSubCatId, selectedPriceRange]);

  const handleNavigateToSearch = (catId: string, searchKeyword?: string) => {
    setSelectedCategory(catId);
    if (searchKeyword) {
      setSearchQuery(searchKeyword);
    }
    setActiveView('search_results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-20">
      
      {/* 1. OPEN FULL-BLEED HERO CANVAS */}
      <section className="relative bg-gradient-to-br from-[#800020] via-[#560015] to-[#2B000B] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-[#D4AF37]/30 overflow-hidden select-none">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[#FAF6EE]/80 mb-4 font-semibold">
            <button 
              type="button" 
              onClick={() => setActiveView('catalog')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-[#D4AF37]">أقسام المتجر</span>
            {currentCategory && (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-white font-bold">{currentCategory.nameAr}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-bold text-[#FAF6EE] mb-3 backdrop-blur-xs">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>جميع الأقسام والمنتجات المتوفرة</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
                اختر القسم المناسب وتسوّق بسهولة
              </h1>
              <p className="text-sm sm:text-base text-[#FAF6EE]/90 font-medium leading-relaxed">
                تصفح المنتجات حسب القسم الذي تريده: ملابس رجالي، ملابس حريمي ومحجبات، ملابس أطفال، أحذية وحقائب، عطور وبخور، ومستلزمات منزلية.
              </p>
            </div>

            {/* Quick In-Category Search Bar */}
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="ابحث في الأقسام..."
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#1A1A1A] placeholder:text-white/60 focus:placeholder:text-stone-400 text-xs sm:text-sm px-4 py-3 pr-10 rounded-2xl border border-white/20 focus:border-[#D4AF37] outline-none shadow-lg backdrop-blur-md transition-all font-medium"
                />
                <Search className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">8 أقسام رئيسية</span>
              <span className="text-[11px] text-[#FAF6EE]/80">تغطي كافة الاحتياجات</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">36 تصنيف فرعي</span>
              <span className="text-[11px] text-[#FAF6EE]/80">وصول سريع لما تبحث عنه</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">تجار موثقون</span>
              <span className="text-[11px] text-[#FAF6EE]/80">محلات ومتاجر معروفة</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">معاينة قبل الدفع</span>
              <span className="text-[11px] text-[#FAF6EE]/80">توصيل سريع ودفع عند الاستلام</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STICKY QUICK CATEGORY PILLS STRIP */}
      <div className="sticky top-[108px] sm:top-[128px] z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 py-2.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveCategoryId('all'); setSelectedSubCatId(null); }}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeCategoryId === 'all'
                ? 'bg-[#800020] text-white border-[#D4AF37] shadow-xs ring-1 ring-[#D4AF37]/40'
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 border-stone-200 dark:border-zinc-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>كافة الأقسام ({EXTENDED_CATEGORIES.length})</span>
          </button>

          {EXTENDED_CATEGORIES.map((cat) => {
            const isSelected = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { 
                  setActiveCategoryId(cat.id); 
                  setSelectedSubCatId(null);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-xs ring-1 ring-[#D4AF37]/40'
                    : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 border-stone-200 dark:border-zinc-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.nameAr}</span>
                {cat.badgeAr && (
                  <span className="text-[9px] bg-[#D4AF37] text-[#800020] px-1.5 py-0.5 rounded-md font-extrabold hidden md:inline">
                    {cat.badgeAr}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STRUCTURED CONTAINED CONTENT MATRIX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* If "ALL" Categories is selected -> Display Bento Category Matrix */}
        {activeCategoryId === 'all' ? (
          <div className="space-y-12">
            
            {/* Bento Grid of All Extended Categories */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <span>الأقسام والتصنيفات الرئيسية</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
                    اختر قسماً لعرض التصنيفات الفرعية والمنتجات المتاحة
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => (
                  <div 
                    key={cat.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Category Banner Image with Gradient Overlay */}
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={cat.heroImage} 
                        alt={cat.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="text-xl bg-white/90 dark:bg-zinc-900/90 p-1.5 rounded-xl shadow-xs">
                          {cat.icon}
                        </span>
                        {cat.badgeAr && (
                          <span className="text-[10px] bg-[#D4AF37] text-[#800020] font-black px-2 py-0.5 rounded-md shadow-xs">
                            {cat.badgeAr}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <h3 className="text-lg font-black">{cat.nameAr}</h3>
                        <p className="text-[11px] text-white/80 line-clamp-1">{cat.description}</p>
                      </div>
                    </div>

                    {/* Subcategories Chips */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2 mb-4">
                        <span className="text-[11px] font-bold text-stone-400 dark:text-zinc-500 block">
                          التصنيفات الفرعية المتاحة:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                setActiveCategoryId(cat.id);
                                setSelectedSubCatId(sub.id);
                              }}
                              className="text-[11px] bg-stone-50 dark:bg-zinc-800 hover:bg-[#800020] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#800020] text-stone-700 dark:text-zinc-300 font-bold px-2 py-1 rounded-lg border border-stone-200/60 dark:border-zinc-700 transition-all cursor-pointer"
                            >
                              {sub.nameAr} ({sub.itemCount})
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategoryId(cat.id);
                            setSelectedSubCatId(null);
                          }}
                          className="text-xs font-black text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>استعراض القسم</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigateToSearch(cat.id)}
                          className="text-xs bg-[#800020] text-white hover:bg-[#600018] px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          تسوق المنتجات
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Curated Spotlight */}
            <div className="bg-gradient-to-r from-[#FAF6EE] to-stone-100 dark:from-zinc-900 dark:to-zinc-800/60 rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37] uppercase tracking-wider block mb-1">
                    🌟 تشكيلات موصى بها اليوم بدسوق
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                    أفضل المبيعات والأكثر طلباً هذا الأسبوع
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateToSearch('')}
                  className="inline-flex items-center gap-1.5 bg-[#800020] hover:bg-[#600018] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer w-fit"
                >
                  <span>عرض جميع منتجات السوق ({products.length})</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.slice(0, 4).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Specific Category Focused View */
          currentCategory && (
            <div className="space-y-8">
              
              {/* Category Focus Header Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#800020] to-[#400010] text-white p-6 sm:p-10 shadow-lg border border-[#D4AF37]/40">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl p-2 bg-white/10 rounded-2xl border border-white/20">
                        {currentCategory.icon}
                      </span>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white">{currentCategory.nameAr}</h2>
                        <span className="text-xs text-[#D4AF37] font-bold">{currentCategory.nameEn}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#FAF6EE]/90 leading-relaxed pt-2">
                      {currentCategory.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleNavigateToSearch(currentCategory.id)}
                      className="bg-[#D4AF37] hover:bg-[#c49f2f] text-[#800020] font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>تسوق كل منتجات هذا القسم</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setActiveCategoryId('all')}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>العودة لجميع الأقسام</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Subcategories Horizontal Interactive Scroller */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>التصنيفات الفرعية</span>
                  </h3>
                  {selectedSubCatId && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubCatId(null)}
                      className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      إلغاء التصفية الفرعية
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentCategory.subcategories.map((sub) => {
                    const isSubSelected = selectedSubCatId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubCatId(isSubSelected ? null : sub.id)}
                        className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-4 ${
                          isSubSelected
                            ? 'bg-[#800020] text-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/50'
                            : 'bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800/80 border-stone-200/80 dark:border-zinc-800'
                        }`}
                      >
                        <img 
                          src={sub.bannerImage} 
                          alt={sub.nameAr}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/20"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-sm font-black truncate ${isSubSelected ? 'text-white' : 'text-stone-900 dark:text-white'}`}>
                              {sub.nameAr}
                            </h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isSubSelected ? 'bg-[#D4AF37] text-[#800020]' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                            }`}>
                              {sub.itemCount} قطعة
                            </span>
                          </div>
                          <p className={`text-[11px] mt-1 line-clamp-2 ${isSubSelected ? 'text-white/80' : 'text-stone-500 dark:text-zinc-400'}`}>
                            {sub.descriptionAr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter Chips & Product Grid */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 dark:text-zinc-400">تصفية السعر:</span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {[
                        { id: 'all', label: 'الكل' },
                        { id: 'under200', label: 'أقل من 200 ج.م' },
                        { id: '200to500', label: '200 - 500 ج.م' },
                        { id: '500to1000', label: '500 - 1000 ج.م' },
                        { id: 'above1000', label: 'أكثر من 1000 ج.م' },
                      ].map((priceOpt) => (
                        <button
                          key={priceOpt.id}
                          type="button"
                          onClick={() => setSelectedPriceRange(priceOpt.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            selectedPriceRange === priceOpt.id
                              ? 'bg-[#800020] text-white'
                              : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
                          }`}
                        >
                          {priceOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-stone-500 dark:text-zinc-400">
                    تم العثور على <strong className="text-[#800020] dark:text-[#D4AF37]">{categoryProducts.length}</strong> منتج
                  </span>
                </div>

                {categoryProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-8">
                    <Layers className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-stone-800 dark:text-zinc-200">لا توجد منتجات مطابقة لهذا الفلتر حالياً</h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">جرب إزالة فلتر السعر أو تصفح كل منتجات القسم</p>
                    <button
                      type="button"
                      onClick={() => { setSelectedPriceRange('all'); setSelectedSubCatId(null); }}
                      className="mt-4 bg-[#800020] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
};
