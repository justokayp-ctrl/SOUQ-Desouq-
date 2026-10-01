import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  X, 
  Sparkles, 
  Grid, 
  SlidersHorizontal, 
  Store, 
  MapPin, 
  CheckCircle2, 
  Tag, 
  ShoppingBag,
  Star,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Check,
  CalendarDays,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Crown,
  UserCheck,
  Flame,
  Watch,
  Layers,
  Smile,
  Award
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';
import { FocusTrap } from '../common/FocusTrap';
import { EXTENDED_CATEGORIES } from '../../data/categoriesData';
import { Product } from '../../types';

const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Crown':
      return <Crown className={className} />;
    case 'UserCheck':
      return <UserCheck className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Watch':
      return <Watch className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Award':
      return <Award className={className} />;
    default:
      return <Layers className={className} />;
  }
};

export const SearchResultsView: React.FC = () => {
  const {
    products,
    sellers,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    onlyDesoqLocal,
    setOnlyDesoqLocal,
    sortBy,
    setSortBy,
    setSelectedProduct,
    openSellerProfile,
    lang,
    t,
    recentSearches,
    addRecentSearch,
    setActiveView
  } = useMarketplace();

  // Local filter states
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState<boolean>(false);
  const [hasDiscountOnly, setHasDiscountOnly] = useState<boolean>(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'compact'>('grid');

  // Dynamically extract unique brands with product counts
  const availableBrands = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach(p => {
      const b = p.attributes?.brand;
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([brand, count]) => ({ brand, count }));
  }, [products]);

  // Dynamically extract material options with product counts
  const availableMaterials = useMemo(() => {
    const options = [
      'جلد طبيعي',
      'قطن مصري 100%',
      'صوف ميرينو',
      'صوف تركي',
      'حرير طبيعي',
      'كتان بارد',
      'تيتانيوم',
      'دهن عود معتق'
    ];
    const counts = new Map<string, number>();
    options.forEach(mat => {
      const count = products.filter(p => 
        p.attributes?.material?.includes(mat) || 
        p.titleAr.includes(mat) || 
        p.descriptionAr.includes(mat)
      ).length;
      if (count > 0) counts.set(mat, count);
    });
    return Array.from(counts.entries()).map(([material, count]) => ({ material, count }));
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev =>
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  // Multi-attribute options derived from fashion & perfume catalog
  const availableAttributes = [
    'قطن مصري 100%',
    'صوف ميرينو فاخر',
    'حرير طبيعي',
    'مسك وعنبر ملكي',
    'ثبات عالي 48 ساعة',
    'جلد طبيعي فاخر',
    'مقاوم للماء 50M',
    'تطريز يدوي دقيق',
    'ذهب عيار 18',
    'فضة إسترليني 925'
  ];

  // Sorting configurations (حسب السعر، التقييم، وتاريخ الإضافة)
  const sortOptions = [
    {
      id: 'featured' as const,
      labelAr: 'الأبرز والمميز',
      labelEn: 'Featured & Popular',
      descAr: 'المعروضات الأكثر شعبية وتفضيلاً في دسوق',
      badgeAr: 'الأكثر رواجاً',
      icon: Sparkles,
    },
    {
      id: 'price_asc' as const,
      labelAr: 'السعر: من الأقل للأعلى',
      labelEn: 'Price: Low to High',
      descAr: 'ترتيب تصاعدي يبدأ بالعروض الاقتصادية',
      badgeAr: 'الأوفر سعراً',
      icon: ArrowDownWideNarrow,
    },
    {
      id: 'price_desc' as const,
      labelAr: 'السعر: من الأعلى للأقل',
      labelEn: 'Price: High to Low',
      descAr: 'ترتيب تنازلي للقطع والمصوغات الفاخرة',
      badgeAr: 'القطع الفاخرة',
      icon: ArrowUpNarrowWide,
    },
    {
      id: 'rating' as const,
      labelAr: 'التقييم: الأعلى تقييماً',
      labelEn: 'Highest Rated',
      descAr: 'ترتيب يعتمد على أعلى تقييمات الزبائن (⭐ 4.5+)',
      badgeAr: 'أعلى تقييم',
      icon: Star,
    },
    {
      id: 'newest' as const,
      labelAr: 'تاريخ الإضافة: الأحدث وصولاً',
      labelEn: 'Date Added: Newest First',
      descAr: 'أحدث التشكيلات والموديلات المضافة مؤخراً بالكتالوج',
      badgeAr: 'وصل حديثاً',
      icon: CalendarDays,
    },
  ];

  // Search filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = 
          product.titleAr.toLowerCase().includes(q) || 
          product.titleEn.toLowerCase().includes(q);
        const matchDesc = 
          product.descriptionAr.toLowerCase().includes(q) ||
          (product.descriptionEn && product.descriptionEn.toLowerCase().includes(q));
        const seller = sellers.find(s => s.id === product.sellerId);
        const matchSeller = seller ? seller.name.toLowerCase().includes(q) : false;
        const matchCategory = product.category.toLowerCase().includes(q);
        const matchAttributes = product.attributes && Object.values(product.attributes).some(
          val => val?.toLowerCase().includes(q)
        );

        if (!matchTitle && !matchDesc && !matchSeller && !matchCategory && !matchAttributes) {
          return false;
        }
      }

      // 2. Category Match
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      // 3. Seller Filter
      if (selectedSellerId && product.sellerId !== selectedSellerId) {
        return false;
      }

      // 5. Fast Delivery (24 Hours in Desoq)
      if (fastDeliveryOnly && !product.isFastDesoqDelivery) {
        return false;
      }

      // 6. In Stock Only
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      // 7. Discounts Only
      if (hasDiscountOnly) {
        const isDiscounted = product.originalPriceEGP && product.originalPriceEGP > product.priceEGP;
        if (!isDiscounted) return false;
      }

      // 8. Price Range
      if (product.priceEGP < minPrice || product.priceEGP > maxPrice) {
        return false;
      }

      // 9. Minimum Rating
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }

      // 10. Selected Attributes Filter
      if (selectedAttributes.length > 0) {
        const matchesAll = selectedAttributes.every(attr => {
          const inTitle = product.titleAr.includes(attr);
          const inDesc = product.descriptionAr.includes(attr);
          const inAttrs = product.attributes && Object.values(product.attributes).some(v => v?.includes(attr));
          return inTitle || inDesc || inAttrs;
        });
        if (!matchesAll) return false;
      }

      // 11. Brands Filter
      if (selectedBrands.length > 0) {
        const pBrand = product.attributes?.brand;
        if (!pBrand || !selectedBrands.includes(pBrand)) {
          return false;
        }
      }

      // 12. Materials Filter
      if (selectedMaterials.length > 0) {
        const pMat = product.attributes?.material || '';
        const matchesMat = selectedMaterials.some(m => 
          pMat.includes(m) || product.titleAr.includes(m) || product.descriptionAr.includes(m)
        );
        if (!matchesMat) return false;
      }

      return true;
    });
  }, [
    products, 
    sellers, 
    searchQuery, 
    selectedCategory, 
    selectedSellerId, 
    onlyDesoqLocal, 
    fastDeliveryOnly, 
    inStockOnly, 
    hasDiscountOnly, 
    minPrice, 
    maxPrice, 
    minRating, 
    selectedAttributes,
    selectedBrands,
    selectedMaterials
  ]);

  // Sort logic (السعر، التقييم، وتاريخ الإضافة)
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceEGP - b.priceEGP;
      if (sortBy === 'price_desc') return b.priceEGP - a.priceEGP;
      if (sortBy === 'rating') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      // featured default
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [filteredProducts, sortBy]);

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return EXTENDED_CATEGORIES.find(c => c.id === selectedCategory || c.aliasIds?.includes(selectedCategory));
  }, [selectedCategory]);
  const activeSellerObj = sellers.find(s => s.id === selectedSellerId);

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSellerId(null);
    setOnlyDesoqLocal(false);
    setFastDeliveryOnly(false);
    setInStockOnly(false);
    setHasDiscountOnly(false);
    setMinPrice(0);
    setMaxPrice(5000);
    setMinRating(0);
    setSelectedAttributes([]);
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSortBy('featured');
  };

  const hasActiveFilters = Boolean(
    sortBy !== 'featured' ||
    selectedCategory ||
    selectedSellerId ||
    onlyDesoqLocal ||
    fastDeliveryOnly ||
    inStockOnly ||
    hasDiscountOnly ||
    minPrice > 0 ||
    maxPrice < 5000 ||
    minRating > 0 ||
    selectedAttributes.length > 0 ||
    selectedBrands.length > 0 ||
    selectedMaterials.length > 0
  );

  const toggleAttribute = (attr: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
    );
  };

  return (
    <div id="search-results-page" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Search Header & Query Summary */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-[#800020]/10 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              <button 
                onClick={() => { setActiveView('catalog'); }}
                className="hover:text-[#800020] dark:hover:text-[#D4AF37] font-medium transition-colors cursor-pointer"
              >
                {t('appName')}
              </button>
              <span>/</span>
              <span className="font-bold text-[#800020] dark:text-[#D4AF37]">
                {lang === 'en' ? 'Search & Filter Hub' : 'واجهة البحث والفرز المتقدم'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
              <Search className="w-6 h-6 text-[#800020] dark:text-[#D4AF37]" />
              {searchQuery.trim() ? (
                <span>
                  {lang === 'en' ? `Results for "${searchQuery}"` : `نتائج البحث عن «${searchQuery}»`}
                </span>
              ) : activeCategoryObj ? (
                <span>{lang === 'en' ? activeCategoryObj.nameEn : activeCategoryObj.nameAr}</span>
              ) : (
                <span>{lang === 'en' ? 'Explore SOUQ DESOQ Catalog' : 'استكشاف كتالوج سوق دسوق الشامل'}</span>
              )}
            </h1>
            
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {lang === 'en' 
                ? `Found ${sortedProducts.length} verified items matching your criteria` 
                : `تم العثور على ${sortedProducts.length} سلعة مطابقة من مصانع ومتاجر دسوق`
              }
            </p>
          </div>

          {/* Quick Search Bar inside Results View */}
          <div className="w-full md:w-auto md:min-w-[320px]">
            <div className="flex items-center bg-[#F5F2ED] dark:bg-zinc-800 rounded-full px-3 py-1.5 border border-[#800020]/15 dark:border-zinc-700">
              <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-transparent text-xs text-[#1A1A1A] dark:text-zinc-100 outline-none font-medium"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>الفلاتر النشطة:</span>
            </span>

            {sortBy !== 'featured' && (
              <span className="bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] border border-[#800020]/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ArrowUpDown className="w-3 h-3" />
                <span>
                  ترتيب:{' '}
                  {sortBy === 'price_asc'
                    ? 'السعر: من الأقل للأعلى'
                    : sortBy === 'price_desc'
                    ? 'السعر: من الأعلى للأقل'
                    : sortBy === 'rating'
                    ? 'الأعلى تقييماً'
                    : sortBy === 'newest'
                    ? 'تاريخ الإضافة (الأحدث)'
                    : ''}
                </span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => setSortBy('featured')} />
              </span>
            )}

            {selectedCategory && activeCategoryObj && (
              <span className="bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] border border-[#800020]/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>{activeCategoryObj.nameAr}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => setSelectedCategory(null)} />
              </span>
            )}

            {selectedSellerId && activeSellerObj && (
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Store className="w-3 h-3" />
                <span>متجر: {activeSellerObj.name}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => setSelectedSellerId(null)} />
              </span>
            )}

            {fastDeliveryOnly && (
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>⚡ تسليم 24 ساعة بدسوق</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => setFastDeliveryOnly(false)} />
              </span>
            )}

            {hasDiscountOnly && (
              <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>🏷️ عروض وخصومات</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => setHasDiscountOnly(false)} />
              </span>
            )}

            {(minPrice > 0 || maxPrice < 5000) && (
              <span className="bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] border border-[#800020]/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>السعر: {minPrice} - {maxPrice} ج.م</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => { setMinPrice(0); setMaxPrice(5000); }} />
              </span>
            )}

            {minRating > 0 && (
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>تقييم: {minRating}+ وأعلى</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => setMinRating(0)} />
              </span>
            )}

            {selectedBrands.map((b, idx) => (
              <span key={`b-${idx}`} className="bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-stone-300 dark:border-zinc-700">
                <span>ماركة: {b}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => toggleBrand(b)} />
              </span>
            ))}

            {selectedMaterials.map((m, idx) => (
              <span key={`m-${idx}`} className="bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-stone-300 dark:border-zinc-700">
                <span>خامة: {m}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => toggleMaterial(m)} />
              </span>
            ))}

            {selectedAttributes.map((attr, idx) => (
              <span key={idx} className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>{attr}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:scale-110" onClick={() => toggleAttribute(attr)} />
              </span>
            ))}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين الكل</span>
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Quick Category Icon Carousel (Pure Vector Lucide Icons, No Image Thumbnails) */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-[#800020]/10 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <h3 className="text-xs sm:text-sm font-black text-[#1A1A1A] dark:text-zinc-100">
              الأقسام والتصنيفات الشائعة
            </h3>
          </div>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] text-[#800020] dark:text-[#D4AF37] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إلغاء التحدد (عرض الكل)</span>
            </button>
          )}
        </div>

        {/* Scrollable Icon Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* All Categories Button */}
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
              selectedCategory === null
                ? 'bg-[#800020] text-white border-[#800020] shadow-sm shadow-[#800020]/30 ring-2 ring-[#D4AF37]/30'
                : 'bg-[#FAF6EE] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-[#D4AF37]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>كافة الأقسام</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              selectedCategory === null ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300'
            }`}>
              {products.length}
            </span>
          </button>

          {/* Extended Category Pills */}
          {EXTENDED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = products.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#800020] text-white border-[#800020] shadow-sm shadow-[#800020]/30 ring-2 ring-[#D4AF37]/30'
                    : 'bg-[#FAF6EE] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-[#D4AF37]'
                }`}
              >
                <CategoryIcon name={cat.iconName} className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-[#800020] dark:text-[#D4AF37]'}`} />
                <span>{lang === 'en' ? cat.nameEn : cat.nameAr}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white font-black' : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300'
                }`}>
                  {count}
                </span>
                {cat.badgeAr && !isSelected && (
                  <span className="hidden sm:inline-block text-[9px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-300/40">
                    {cat.badgeAr.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subcategories & Filters Strip for Active Category */}
        {activeCategoryObj && (
          <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 pl-1">
              تصنيفات {lang === 'en' ? activeCategoryObj.nameEn : activeCategoryObj.nameAr}:
            </span>
            {activeCategoryObj.subcategories.map((sub) => {
              const isFilterActive = selectedAttributes.includes(sub.nameAr);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleAttribute(sub.nameAr)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer border ${
                    isFilterActive
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-[#D4AF37]'
                  }`}
                >
                  {lang === 'en' ? sub.nameEn : sub.nameAr}
                </button>
              );
            })}
            {activeCategoryObj.popularFilters?.[0]?.options.map((opt, idx) => {
              const isFilterActive = selectedAttributes.includes(opt);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleAttribute(opt)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer border ${
                    isFilterActive
                      ? 'bg-[#D4AF37] text-[#141416] border-[#D4AF37] font-bold'
                      : 'bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-400 border-stone-200/60 dark:border-zinc-700 hover:border-[#D4AF37]'
                  }`}
                >
                  ✨ {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Filter & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Desktop Left Filter Sidebar (Span 3) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-[#800020]/10 dark:border-zinc-800 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                <span>{lang === 'en' ? 'Filter & Refine' : 'تصفية وتضييق البحث'}</span>
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>

            {/* 1. Sorting & Ordering Section (حسب السعر، التقييم، وتاريخ الإضافة) */}
            <div className="space-y-3 pb-5 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                  <span>ترتيب وتصنيف النتائج</span>
                </label>
                {sortBy !== 'featured' && (
                  <button
                    type="button"
                    onClick={() => setSortBy('featured')}
                    className="text-[10px] text-[#800020] dark:text-[#D4AF37] font-bold hover:underline cursor-pointer"
                  >
                    استعادة الافتراضي
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-right transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#800020] text-white border-[#800020] shadow-sm shadow-[#800020]/25 ring-2 ring-[#D4AF37]/30'
                          : 'bg-[#FAF6EE]/70 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 border-stone-200/80 dark:border-zinc-800 hover:border-[#D4AF37] hover:bg-[#FAF6EE] dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-white/20 text-[#D4AF37]'
                              : 'bg-white dark:bg-zinc-700 text-[#800020] dark:text-[#D4AF37] border border-stone-200/60 dark:border-zinc-700'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-snug truncate ${isSelected ? 'text-white' : 'text-stone-900 dark:text-zinc-100'}`}>
                            {lang === 'en' ? opt.labelEn : opt.labelAr}
                          </p>
                          <p className={`text-[10px] leading-tight truncate ${isSelected ? 'text-stone-200' : 'text-stone-400 dark:text-zinc-400'}`}>
                            {opt.descAr}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 mr-1.5">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#D4AF37] text-[#800020]'
                              : 'border-stone-300 dark:border-zinc-600 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Toggle Checkboxes */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">
                محددات خاصة بسوق دسوق
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer p-1.5 rounded-xl hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={fastDeliveryOnly}
                  onChange={(e) => setFastDeliveryOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#800020] rounded"
                />
                <span>⚡ تسليم خلال 24 ساعة (دسوق)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer p-1.5 rounded-xl hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={hasDiscountOnly}
                  onChange={(e) => setHasDiscountOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#800020] rounded"
                />
                <span>🏷️ المنتجات التي عليها خصم</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer p-1.5 rounded-xl hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#800020] rounded"
                />
                <span>📦 متوفر بالمخزون فقط</span>
              </label>
            </div>

            {/* Price Range & Quick Presets */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                  {t('filterPrice')} (ج.م)
                </label>
                {(minPrice > 0 || maxPrice < 5000) && (
                  <button
                    type="button"
                    onClick={() => { setMinPrice(0); setMaxPrice(5000); }}
                    className="text-[10px] text-[#800020] dark:text-[#D4AF37] font-bold hover:underline"
                  >
                    إعادة ضبط
                  </button>
                )}
              </div>

              {/* Slider Controls */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#800020] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                  <span>0 ج.م</span>
                  <span className="text-[#800020] dark:text-[#D4AF37]">{maxPrice} ج.م</span>
                  <span>5000 ج.م</span>
                </div>
              </div>

              {/* Min/Max Numeric Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  placeholder="من"
                  className="w-full bg-[#F5F2ED] dark:bg-zinc-800 p-2 rounded-xl text-xs font-bold text-center border border-[#800020]/10 dark:border-zinc-700 dark:text-zinc-100 outline-none"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  placeholder="إلى"
                  className="w-full bg-[#F5F2ED] dark:bg-zinc-800 p-2 rounded-xl text-xs font-bold text-center border border-[#800020]/10 dark:border-zinc-700 dark:text-zinc-100 outline-none"
                />
              </div>

              {/* Price Preset Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => { setMinPrice(0); setMaxPrice(500); }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold border cursor-pointer ${
                    minPrice === 0 && maxPrice === 500
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-transparent hover:border-[#D4AF37]'
                  }`}
                >
                  أقل من 500
                </button>
                <button
                  type="button"
                  onClick={() => { setMinPrice(500); setMaxPrice(1500); }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold border cursor-pointer ${
                    minPrice === 500 && maxPrice === 1500
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-transparent hover:border-[#D4AF37]'
                  }`}
                >
                  500 - 1500
                </button>
                <button
                  type="button"
                  onClick={() => { setMinPrice(1500); setMaxPrice(3500); }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold border cursor-pointer ${
                    minPrice === 1500 && maxPrice === 3500
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-transparent hover:border-[#D4AF37]'
                  }`}
                >
                  1500 - 3500
                </button>
                <button
                  type="button"
                  onClick={() => { setMinPrice(3500); setMaxPrice(5000); }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold border cursor-pointer ${
                    minPrice === 3500 && maxPrice === 5000
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-transparent hover:border-[#D4AF37]'
                  }`}
                >
                  3500+ ج.م
                </button>
              </div>
            </div>

            {/* Rating Filter Section */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                تصفية حسب التقييم
              </label>
              <div className="space-y-1">
                {[
                  { value: 0, label: 'كافة التقييمات' },
                  { value: 4.8, label: '⭐ 4.8 فأعلى (ممتاز جداً)' },
                  { value: 4.5, label: '⭐ 4.5 فأعلى (ممتاز)' },
                  { value: 4.0, label: '⭐ 4.0 فأعلى (جيد جداً)' },
                ].map((rateOpt) => {
                  const isSelected = minRating === rateOpt.value;
                  return (
                    <button
                      key={rateOpt.value}
                      type="button"
                      onClick={() => setMinRating(rateOpt.value)}
                      className={`w-full text-right text-xs py-1.5 px-3 rounded-xl transition-all font-bold flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-[#FAF6EE]/50 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 border-transparent hover:border-[#D4AF37]'
                      }`}
                    >
                      <span>{rateOpt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands Filter Section */}
            {availableBrands.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                    العلامات التجارية والماركات
                  </label>
                  {selectedBrands.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrands([])}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      مسح ({selectedBrands.length})
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {availableBrands.map(({ brand, count }) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`w-full text-right text-xs py-1.5 px-2.5 rounded-xl transition-colors font-medium flex items-center justify-between cursor-pointer border ${
                          isChecked
                            ? 'bg-[#800020] text-white font-bold border-[#800020]'
                            : 'hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-transparent'
                        }`}
                      >
                        <span className="truncate">{brand}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isChecked ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Materials Filter Section */}
            {availableMaterials.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                    المواد والخامات المستخدمة
                  </label>
                  {selectedMaterials.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMaterials([])}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      مسح ({selectedMaterials.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableMaterials.map(({ material, count }) => {
                    const isChecked = selectedMaterials.includes(material);
                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => toggleMaterial(material)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
                          isChecked
                            ? 'bg-[#800020] text-white border-[#800020]'
                            : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200/80 dark:border-zinc-700 hover:border-[#D4AF37]'
                        }`}
                      >
                        {material} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">
                {t('categories')}
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-right text-xs py-1.5 px-3 rounded-xl transition-colors font-medium flex items-center justify-between cursor-pointer ${
                    selectedCategory === null
                      ? 'bg-[#800020] text-white font-bold'
                      : 'hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  <span>كافة الأقسام</span>
                  <span className="text-[10px]">{products.length}</span>
                </button>
                {EXTENDED_CATEGORIES.map((cat) => {
                  const count = products.filter(p => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-right text-xs py-1.5 px-3 rounded-xl transition-colors font-medium flex items-center justify-between cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#800020] text-white font-bold'
                          : 'hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CategoryIcon name={cat.iconName} className={`w-4 h-4 ${selectedCategory === cat.id ? 'text-[#D4AF37]' : 'text-[#800020] dark:text-[#D4AF37]'}`} />
                        <span>{lang === 'en' ? cat.nameEn : cat.nameAr}</span>
                      </span>
                      <span className="text-[10px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sellers Filter */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">
                تجار ومصانع دسوق المعتمدة
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedSellerId(null)}
                  className={`w-full text-right text-xs py-1.5 px-3 rounded-xl transition-colors font-medium flex items-center justify-between cursor-pointer ${
                    selectedSellerId === null
                      ? 'bg-[#800020] text-white font-bold'
                      : 'hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  <span>كافة المتاجر</span>
                </button>
                {sellers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSellerId(s.id)}
                    className={`w-full text-right text-xs py-1.5 px-3 rounded-xl transition-colors font-medium flex items-center justify-between cursor-pointer truncate ${
                      selectedSellerId === s.id
                        ? 'bg-[#800020] text-white font-bold'
                        : 'hover:bg-[#F5F2ED] dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="text-[10px] text-[#D4AF37]">⭐ {s.rating}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Attributes & Tags */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">
                المواصفات والخصائص
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableAttributes.map((attr, idx) => {
                  const isChecked = selectedAttributes.includes(attr);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleAttribute(attr)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer border ${
                        isChecked
                          ? 'bg-[#800020] text-white border-[#800020]'
                          : 'bg-[#F5F2ED] dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-transparent hover:border-[#D4AF37]'
                      }`}
                    >
                      {attr}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        {/* Results Main Grid (Span 9) */}
        <main className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* Controls Bar (Sorting, Mobile Filter Trigger, Layout) */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-[#800020]/10 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterDrawerOpen(true)}
                className="lg:hidden min-h-[44px] px-4 py-2 flex items-center gap-2 bg-[#800020] hover:bg-[#66001A] text-white rounded-full text-xs font-black cursor-pointer shadow-sm transition-colors active:scale-95 border border-[#D4AF37]/30"
                aria-label="فتح فلاتر البحث"
              >
                <Filter className="w-4 h-4 text-[#D4AF37]" />
                <span>الفلاتر</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                )}
              </button>

              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                {sortedProducts.length} منتج متاح
              </span>
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#F5F2ED] dark:bg-zinc-800 text-[#1A1A1A] dark:text-zinc-100 text-xs font-bold px-3 py-2 rounded-full outline-none cursor-pointer border border-[#800020]/10 dark:border-zinc-700"
                >
                  <option value="featured">{t('sortFeatured')}</option>
                  <option value="price_asc">{t('sortPriceAsc')}</option>
                  <option value="price_desc">{t('sortPriceDesc')}</option>
                  <option value="rating">{t('sortRating')}</option>
                  <option value="newest">{t('sortNewest')}</option>
                </select>
              </div>
            </div>

          </div>

          {/* Product Items Display */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-[#800020]/10 dark:border-zinc-800 space-y-4">
              <div className="w-16 h-16 bg-[#F5F2ED] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] rounded-full flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-zinc-100">
                لم نتمكن من العثور على نتائج مطابقة لبحثك
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                جرب تخفيف شروط البحث، إزالة بعض الفلاتر، أو كتابة كلمات عامة مثل «أقمشة»، «حلويات»، أو «بن».
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="bg-[#800020] hover:bg-[#600018] text-white px-6 py-2.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
                >
                  إلغاء جميع الفلاتر
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="bg-[#F5F2ED] dark:bg-zinc-800 text-[#1A1A1A] dark:text-zinc-200 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#D4AF37] hover:text-[#800020] transition-colors cursor-pointer"
                >
                  مسح كلمة البحث
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {sortedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filters Drawer Modal with FocusTrap */}
      {isMobileFilterDrawerOpen && (
        <FocusTrap
          isActive={isMobileFilterDrawerOpen}
          onClose={() => setIsMobileFilterDrawerOpen(false)}
          aria-label="خيارات تصفية البحث"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>تصفية وفلاتر البحث</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterDrawerOpen(false)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-500 hover:text-black dark:hover:text-white"
                  aria-label="إغلاق قائمة الفلاتر"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Sorting Options (حسب السعر، التقييم، وتاريخ الإضافة) */}
              <div className="space-y-2.5 pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                    <span>ترتيب وتصنيف المنتجات</span>
                  </span>
                  {sortBy !== 'featured' && (
                    <button
                      type="button"
                      onClick={() => setSortBy('featured')}
                      className="text-[11px] text-[#800020] dark:text-[#D4AF37] font-bold underline cursor-pointer"
                    >
                      الافتراضي
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {sortOptions.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSortBy(opt.id)}
                        className={`w-full flex items-center justify-between p-2.5 min-h-[44px] rounded-xl text-right font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#800020] text-white border-[#800020]'
                            : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-[#800020] dark:text-[#D4AF37]'}`} />
                          <span className="text-xs">{lang === 'en' ? opt.labelEn : opt.labelAr}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#D4AF37] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-xs font-bold text-[#800020] dark:text-[#D4AF37] min-h-[44px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyDesoqLocal}
                    onChange={(e) => setOnlyDesoqLocal(e.target.checked)}
                    className="w-5 h-5 accent-[#800020] rounded"
                  />
                  <span>✨ منتجات مميزة وأصلية</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-zinc-300 min-h-[44px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fastDeliveryOnly}
                    onChange={(e) => setFastDeliveryOnly(e.target.checked)}
                    className="w-5 h-5 accent-[#800020] rounded"
                  />
                  <span>⚡ تسليم 24 ساعة بدسوق</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-zinc-300 min-h-[44px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiscountOnly}
                    onChange={(e) => setHasDiscountOnly(e.target.checked)}
                    className="w-5 h-5 accent-[#800020] rounded"
                  />
                  <span>🏷️ العروض والخصومات</span>
                </label>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">السعر (ج.م)</span>
                <div className="flex items-center gap-2">
                  <label htmlFor="search-mobile-min-price" className="sr-only">الحد الأدنى للسعر</label>
                  <input
                    id="search-mobile-min-price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 p-2.5 min-h-[44px] rounded-xl text-xs font-bold text-center dark:text-zinc-100"
                    placeholder="من"
                  />
                  <span>-</span>
                  <label htmlFor="search-mobile-max-price" className="sr-only">الحد الأقصى للسعر</label>
                  <input
                    id="search-mobile-max-price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-[#F5F2ED] dark:bg-zinc-800 p-2.5 min-h-[44px] rounded-xl text-xs font-bold text-center dark:text-zinc-100"
                    placeholder="إلى"
                  />
                </div>
              </div>

              {/* Brands Mobile Section */}
              {availableBrands.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">العلامات التجارية والماركات</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {availableBrands.map(({ brand, count }) => {
                      const isChecked = selectedBrands.includes(brand);
                      return (
                        <button
                          key={`m-brand-${brand}`}
                          type="button"
                          onClick={() => toggleBrand(brand)}
                          className={`w-full text-right text-xs py-2 px-3 min-h-[44px] rounded-xl font-bold flex items-center justify-between border ${
                            isChecked ? 'bg-[#800020] text-white border-[#800020]' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border-transparent'
                          }`}
                        >
                          <span>{brand}</span>
                          <span className="text-[10px] opacity-75">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Materials Mobile Section */}
              {availableMaterials.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">المواد والخامات</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableMaterials.map(({ material, count }) => {
                      const isChecked = selectedMaterials.includes(material);
                      return (
                        <button
                          key={`m-mat-${material}`}
                          type="button"
                          onClick={() => toggleMaterial(material)}
                          className={`text-xs px-3 py-1.5 min-h-[38px] rounded-xl font-bold transition-all border ${
                            isChecked ? 'bg-[#800020] text-white border-[#800020]' : 'bg-[#F5F2ED] dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border-transparent'
                          }`}
                        >
                          {material} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 block">الأقسام</span>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-right text-xs py-2.5 px-3 min-h-[44px] rounded-xl font-bold flex items-center justify-between ${
                      selectedCategory === null ? 'bg-[#800020] text-white' : 'bg-[#F5F2ED] dark:bg-zinc-800'
                    }`}
                  >
                    <span>كافة الأقسام</span>
                    <span className="text-[10px] opacity-80">{products.length}</span>
                  </button>
                  {EXTENDED_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-right text-xs py-2.5 px-3 min-h-[44px] rounded-xl font-bold flex items-center justify-between ${
                        selectedCategory === c.id ? 'bg-[#800020] text-white' : 'bg-[#F5F2ED] dark:bg-zinc-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CategoryIcon name={c.iconName} className={`w-4 h-4 ${selectedCategory === c.id ? 'text-[#D4AF37]' : 'text-[#800020] dark:text-[#D4AF37]'}`} />
                        <span>{lang === 'en' ? c.nameEn : c.nameAr}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-zinc-800 flex gap-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterDrawerOpen(false)}
                className="flex-1 bg-[#800020] text-white py-3.5 min-h-[48px] rounded-full text-xs font-bold shadow-md"
              >
                تطبيق الفلاتر ({sortedProducts.length})
              </button>
              <button
                type="button"
                onClick={resetAllFilters}
                className="bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-5 py-3.5 min-h-[48px] rounded-full text-xs font-bold"
              >
                مسح
              </button>
            </div>
          </div>
        </FocusTrap>
      )}

    </div>
  );
};
