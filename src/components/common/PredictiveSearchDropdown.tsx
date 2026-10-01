import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  X, 
  ArrowLeft, 
  Tag, 
  Store, 
  Sparkles, 
  Zap, 
  Layers, 
  Cake, 
  Coffee, 
  Smartphone, 
  Home, 
  Flame,
  CheckCircle2,
  Package,
  Star,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { ProductCategory, Product } from '../../types';

export interface SuggestionItem {
  id?: string;
  text: string;
  type?: 'keyword' | 'product' | 'category' | 'seller' | 'local_specialty' | 'tag';
  category?: string;
  categoryAr?: string;
  badgeAr?: string;
  count?: number;
  price?: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  isDesoqLocalMade?: boolean;
  isFeatured?: boolean;
}

interface PredictiveSearchDropdownProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (term: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct?: (productId: string) => void;
  recentSearches: string[];
  onRemoveRecentSearch?: (term: string) => void;
  onClearRecentSearches?: () => void;
  popularSearches?: string[];
  categories: ProductCategory[];
  allProducts?: Product[];
  className?: string;
}

// Icon helper for categories
const getCategoryIcon = (iconName?: string) => {
  switch (iconName?.toLowerCase()) {
    case 'layers':
      return <Layers className="w-4 h-4" />;
    case 'cake':
      return <Cake className="w-4 h-4" />;
    case 'coffee':
      return <Coffee className="w-4 h-4" />;
    case 'smartphone':
      return <Smartphone className="w-4 h-4" />;
    case 'home':
      return <Home className="w-4 h-4" />;
    default:
      return <Tag className="w-4 h-4" />;
  }
};

export const PredictiveSearchDropdown: React.FC<PredictiveSearchDropdownProps> = ({
  searchQuery,
  isOpen,
  onClose,
  onSelectQuery,
  onSelectCategory,
  onSelectProduct,
  recentSearches = [],
  onRemoveRecentSearch,
  onClearRecentSearches,
  popularSearches = [],
  categories = [],
  allProducts = [],
  className = '',
}) => {
  const [liveSuggestions, setLiveSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default curated popular searches for Desoq Fashion & Lifestyle
  const fallbackPopularSearches = useMemo(() => [
    'فستان سواريه مطرز أنيق',
    'عطر مسك الختام والعود الملكي',
    'حقيبة يد جلد طبيعي هاندميد',
    'حذاء كلاسيك جلد إيطالي',
    'بدلة رجالي فورمال كاملة',
    'طقم فضة عيار 925 استرليني',
    'عباية استقبال خليجي فاخرة',
    'ساعة يد أوتوماتيك كلاسيك'
  ], []);

  const activePopularSearches = popularSearches.length > 0 ? popularSearches : fallbackPopularSearches;

  // Curated top popular products for quick discovery
  const popularPicks = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => ((b.rating || 0) * 10 + (b.reviewCount || 0)) - ((a.rating || 0) * 10 + (a.reviewCount || 0)))
      .slice(0, 3);
  }, [allProducts]);

  // Client-side instant suggestion generator
  const generateClientFallbackSuggestions = useCallback((
    query: string, 
    cats: ProductCategory[], 
    prods: Product[]
  ): SuggestionItem[] => {
    const qNorm = query.toLowerCase().trim();
    const results: SuggestionItem[] = [];
    const seen = new Set<string>();

    // 1. Direct Category matches
    cats.forEach(c => {
      const matchAr = c.nameAr.toLowerCase().includes(qNorm);
      const matchEn = c.nameEn ? c.nameEn.toLowerCase().includes(qNorm) : false;
      if (matchAr || matchEn) {
        seen.add(`cat_${c.id}`);
        results.push({
          id: c.id,
          text: c.nameAr,
          categoryAr: c.nameAr,
          type: 'category',
          count: c.productCount || 10,
          badgeAr: `${c.productCount || 10} منتج`
        });
      }
    });

    // 2. Product matches (Sorted by rating & popularity)
    const sortedProds = [...prods].sort((a, b) => {
      const scoreA = (a.rating * 10) + (a.isFeatured ? 20 : 0) + (a.isDesoqLocalMade ? 15 : 0);
      const scoreB = (b.rating * 10) + (b.isFeatured ? 20 : 0) + (b.isDesoqLocalMade ? 15 : 0);
      return scoreB - scoreA;
    });

    sortedProds.forEach(p => {
      const titleMatch = p.titleAr.toLowerCase().includes(qNorm) || (p.titleEn && p.titleEn.toLowerCase().includes(qNorm));
      const descMatch = p.descriptionAr && p.descriptionAr.toLowerCase().includes(qNorm);
      const catMatch = p.category && p.category.toLowerCase().includes(qNorm);

      if (titleMatch || descMatch || catMatch) {
        if (!seen.has(`prod_${p.id}`) && results.filter(r => r.type === 'product').length < 6) {
          seen.add(`prod_${p.id}`);
          const catObj = cats.find(c => c.id === p.category);
          results.push({
            id: p.id,
            text: p.titleAr,
            type: 'product',
            category: p.category,
            categoryAr: catObj?.nameAr || p.category,
            badgeAr: `${p.priceEGP} ج.م`,
            price: p.priceEGP,
            originalPrice: p.originalPriceEGP,
            image: p.images?.[0],
            rating: p.rating,
            reviewCount: p.reviewCount,
            isDesoqLocalMade: p.isDesoqLocalMade,
            isFeatured: p.isFeatured
          });
        }
      }
    });

    // 3. Keyword query match if no direct matches
    if (results.length === 0) {
      results.push({
        text: query,
        type: 'keyword',
        badgeAr: 'بحث عام'
      });
    }

    return results;
  }, []);

  // Real-time server-side and client-fallback search suggestions
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setLiveSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Immediately compute client-side fallback suggestions for instant 0ms latency display
    const instantLocal = generateClientFallbackSuggestions(trimmed, categories, allProducts);
    setLiveSuggestions(instantLocal);

    setIsLoading(true);
    let isCurrent = true;

    // Fetch rich server-side suggestions
    const fetchController = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/catalog/search/suggest?q=${encodeURIComponent(trimmed)}&limit=12`, {
        signal: fetchController.signal
      })
        .then(res => res.ok ? res.json() : [])
        .then((serverData: SuggestionItem[]) => {
          if (!isCurrent) return;
          if (Array.isArray(serverData) && serverData.length > 0) {
            setLiveSuggestions(serverData);
          }
          setIsLoading(false);
        })
        .catch(() => {
          if (!isCurrent) return;
          setIsLoading(false);
        });
    }, 120);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
      fetchController.abort();
    };
  }, [searchQuery, categories, allProducts, generateClientFallbackSuggestions]);

  // Reset selected keyboard index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Split live suggestions into categorized buckets
  const { suggestedCategories, suggestedProducts, suggestedKeywords } = useMemo(() => {
    const catList: SuggestionItem[] = [];
    const prodList: SuggestionItem[] = [];
    const kwList: SuggestionItem[] = [];

    liveSuggestions.forEach(item => {
      if (item.type === 'category') {
        catList.push(item);
      } else if (item.type === 'product') {
        prodList.push(item);
      } else {
        kwList.push(item);
      }
    });

    return {
      suggestedCategories: catList,
      suggestedProducts: prodList,
      suggestedKeywords: kwList
    };
  }, [liveSuggestions]);

  // Flatten active interactive items list for keyboard traversal
  const interactiveItems = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return [...suggestedCategories, ...suggestedProducts, ...suggestedKeywords];
    }
    return [];
  }, [searchQuery, suggestedCategories, suggestedProducts, suggestedKeywords]);

  // Keyboard navigation handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!interactiveItems.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < interactiveItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : interactiveItems.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < interactiveItems.length) {
        e.preventDefault();
        const selected = interactiveItems[selectedIndex];
        if (selected.type === 'category' && selected.id) {
          onSelectCategory(selected.id);
        } else if (selected.type === 'product' && selected.id && onSelectProduct) {
          onSelectProduct(selected.id);
        } else {
          onSelectQuery(selected.text);
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, interactiveItems, selectedIndex, onSelectCategory, onSelectProduct, onSelectQuery, onClose]);

  // Helper to highlight matching text in query results
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    try {
      const escapedHighlight = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, 'gi');
      const parts = text.split(regex);
      return (
        <span>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <span key={i} className="text-[#800020] dark:text-[#E8B838] font-black underline decoration-[#D4AF37]/60">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </span>
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  if (!isOpen) return null;

  const isTyping = searchQuery.trim().length > 0;

  return (
    <div 
      ref={containerRef}
      className={`absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-[#800020]/25 dark:border-[#D4AF37]/30 z-50 overflow-hidden text-right select-none animate-in fade-in-50 zoom-in-95 duration-150 max-h-[75vh] sm:max-h-[80vh] flex flex-col ${className}`}
      role="listbox"
      id="predictive-search-popover"
    >
      {/* =========================================================================
          STATE A: USER IS ACTIVELY TYPING (Categories & Popular Products Suggestions)
         ========================================================================= */}
      {isTyping ? (
        <div className="divide-y divide-stone-100 dark:divide-zinc-800 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* Header Bar */}
          <div className="bg-[#FAF6EE] dark:bg-zinc-800/90 px-3.5 sm:px-4 py-2 flex items-center justify-between border-b border-[#D4AF37]/20 sticky top-0 z-10 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black text-[#800020] dark:text-[#FAF6EE]">
                اقتراحات الأقسام والمنتجات لـ &quot;{searchQuery}&quot;
              </span>
            </div>
            {isLoading && (
              <span className="text-[10px] text-stone-400 dark:text-zinc-400 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#800020] dark:bg-[#D4AF37] animate-ping" />
                <span>تحديث فوري...</span>
              </span>
            )}
          </div>

          <div className="p-2 sm:p-3 space-y-3">
            
            {/* 1. MATCHING CATEGORIES SECTION (الأقسام المقترحة) */}
            {suggestedCategories.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 uppercase tracking-wider px-1">
                  <Tag className="w-3 h-3 text-[#800020] dark:text-[#D4AF37]" />
                  <span>الأقسام المقترحة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {suggestedCategories.map((cat, catIdx) => {
                    const isItemActive = selectedIndex === catIdx;
                    return (
                      <button
                        key={cat.id || catIdx}
                        type="button"
                        onClick={() => {
                          if (cat.id) onSelectCategory(cat.id);
                          else onSelectQuery(cat.text);
                          onClose();
                        }}
                        className={`w-full text-right p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                          isItemActive 
                            ? 'bg-[#800020] text-white border-[#800020] shadow-sm' 
                            : 'bg-[#FAF6EE]/70 dark:bg-zinc-800/80 border-stone-200/80 dark:border-zinc-700 hover:border-[#800020] dark:hover:border-[#D4AF37] hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-stone-800 dark:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isItemActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-white dark:bg-zinc-700 text-[#800020] dark:text-[#D4AF37] group-hover:bg-[#800020] group-hover:text-white'
                          }`}>
                            {getCategoryIcon(cat.id)}
                          </div>
                          <div className="min-w-0 truncate">
                            <span className="text-xs font-black block truncate">
                              تصفح قسم: {renderHighlightedText(cat.text, searchQuery)}
                            </span>
                            <span className={`text-[9px] block ${isItemActive ? 'text-white/80' : 'text-stone-400 dark:text-zinc-400'}`}>
                              {cat.badgeAr || 'عرض المنتجات في القسم'}
                            </span>
                          </div>
                        </div>
                        <ArrowLeft className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:-translate-x-1 ${
                          isItemActive ? 'text-white' : 'text-[#800020] dark:text-[#D4AF37]'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. MATCHING POPULAR PRODUCTS SECTION (المنتجات الأكثر طلباً) */}
            {suggestedProducts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-[#800020] dark:text-[#D4AF37]" />
                    <span>المنتجات الأكثر طلباً ومطابقة</span>
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 dark:text-zinc-500">
                    {suggestedProducts.length} منتجات
                  </span>
                </div>

                <div className="space-y-1.5">
                  {suggestedProducts.map((prod, pIdx) => {
                    const globalIdx = suggestedCategories.length + pIdx;
                    const isItemActive = selectedIndex === globalIdx;
                    return (
                      <button
                        key={prod.id || pIdx}
                        type="button"
                        onClick={() => {
                          if (prod.id && onSelectProduct) {
                            onSelectProduct(prod.id);
                          } else {
                            onSelectQuery(prod.text);
                          }
                          onClose();
                        }}
                        className={`w-full text-right p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                          isItemActive
                            ? 'bg-[#800020] text-white border-[#800020] shadow-md'
                            : 'bg-white dark:bg-zinc-850 hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 border-stone-200/70 dark:border-zinc-750 hover:border-[#D4AF37]/50 text-stone-900 dark:text-zinc-100 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Product Thumbnail */}
                          <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-stone-50 dark:bg-zinc-800 p-0.5 border border-[#D4AF37]/30 overflow-hidden flex items-center justify-center relative">
                            {prod.image ? (
                              <img 
                                src={prod.image} 
                                alt={prod.text} 
                                className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-stone-400" />
                            )}
                            {prod.isDesoqLocalMade && (
                              <span className="absolute bottom-0 right-0 left-0 bg-[#800020]/90 text-white text-[7px] font-black text-center py-0.2">
                                دسوق
                              </span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="truncate min-w-0 space-y-0.5">
                            <div className="text-xs sm:text-[13px] font-bold leading-tight truncate">
                              {renderHighlightedText(prod.text, searchQuery)}
                            </div>
                            
                            <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-zinc-400">
                              {prod.categoryAr && (
                                <span className={`truncate ${isItemActive ? 'text-white/80' : 'text-stone-500 dark:text-zinc-400'}`}>
                                  {prod.categoryAr}
                                </span>
                              )}
                              {typeof prod.rating === 'number' && prod.rating > 0 && (
                                <span className={`flex items-center gap-0.5 font-bold ${isItemActive ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'}`}>
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>{prod.rating.toFixed(1)}</span>
                                  {prod.reviewCount ? (
                                    <span className={`text-[8px] ${isItemActive ? 'text-white/70' : 'text-stone-400'}`}>
                                      ({prod.reviewCount})
                                    </span>
                                  ) : null}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Badge */}
                        <div className="flex flex-col items-end shrink-0 pl-1">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xs sm:text-sm font-black font-mono ${
                              isItemActive ? 'text-amber-200' : 'text-[#800020] dark:text-[#E8B838]'
                            }`}>
                              {prod.price?.toLocaleString()} ج.م
                            </span>
                          </div>
                          {prod.originalPrice && prod.price && prod.originalPrice > prod.price && (
                            <span className={`text-[9px] line-through font-mono ${
                              isItemActive ? 'text-white/60' : 'text-stone-400 dark:text-zinc-500'
                            }`}>
                              {prod.originalPrice.toLocaleString()} ج.م
                            </span>
                          )}
                          <span className={`text-[9px] font-bold mt-0.5 flex items-center gap-0.5 ${
                            isItemActive ? 'text-white' : 'text-stone-400 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]'
                          }`}>
                            <span>معاينة</span>
                            <ArrowLeft className="w-2.5 h-2.5 transition-transform group-hover:-translate-x-0.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. MATCHING KEYWORDS / TERMS (عبارات مقترحة) */}
            {suggestedKeywords.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-[#800020] dark:text-[#D4AF37]" />
                  <span>عبارات بحث مقترحة</span>
                </div>
                <div className="space-y-0.5">
                  {suggestedKeywords.map((kw, kwIdx) => {
                    const globalIdx = suggestedCategories.length + suggestedProducts.length + kwIdx;
                    const isItemActive = selectedIndex === globalIdx;
                    return (
                      <button
                        key={kwIdx}
                        type="button"
                        onClick={() => {
                          onSelectQuery(kw.text);
                          onClose();
                        }}
                        className={`w-full text-right px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold transition-colors cursor-pointer group ${
                          isItemActive
                            ? 'bg-[#800020] text-white'
                            : 'hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Search className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-white' : 'text-stone-400 group-hover:text-[#800020]'}`} />
                          <span className="truncate">{renderHighlightedText(kw.text, searchQuery)}</span>
                        </div>
                        {kw.badgeAr && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isItemActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-stone-100 dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37]'
                          }`}>
                            {kw.badgeAr}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State when no direct matches */}
            {suggestedCategories.length === 0 && suggestedProducts.length === 0 && suggestedKeywords.length === 0 && !isLoading && (
              <div className="py-6 text-center text-stone-400 dark:text-zinc-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#800020]" />
                <p className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                  لا توجد اقتراحات مباشرة مطابقة لـ &quot;{searchQuery}&quot;
                </p>
                <p className="text-[11px] mt-1 text-stone-400">
                  اضغط على زر البحث أدناه أو مفتاح Enter للاستكشاف في كامل كتالوج سوق دسوق
                </p>
              </div>
            )}

          </div>

          {/* Quick Action Footer */}
          <div className="p-2.5 sm:p-3 bg-[#FAF6EE]/90 dark:bg-zinc-800/90 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs text-stone-600 dark:text-zinc-300 sticky bottom-0 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                onSelectQuery(searchQuery);
                onClose();
              }}
              className="text-[#800020] dark:text-[#E8B838] font-black hover:underline flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>عرض جميع النتائج المطابقة لـ &quot;{searchQuery}&quot;</span>
            </button>
            <span className="hidden sm:inline text-[10px] text-stone-400 dark:text-zinc-500">
              اضغط <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 rounded text-[9px] font-mono shadow-2xs">Enter ↵</kbd> للبحث
            </span>
          </div>

        </div>
      ) : (
        /* =========================================================================
            STATE B: INPUT IS EMPTY / FOCUSED (Recent Searches + Categories + Popular)
           ========================================================================= */
        <div className="divide-y divide-stone-100 dark:divide-zinc-800 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* 1. RECENT SEARCHES (سجل البحث الأخير) */}
          {recentSearches.length > 0 && (
            <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                  <span>عمليات البحث الأخيرة</span>
                </span>
                {onClearRecentSearches && (
                  <button
                    type="button"
                    onClick={onClearRecentSearches}
                    className="text-[9px] sm:text-[10px] font-bold text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    مسح السجل
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectQuery(term);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 dark:text-zinc-500 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]" />
                      <span className="text-[11px] sm:text-xs font-bold text-stone-700 dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#FAF6EE]">
                        {term}
                      </span>
                    </div>
                    {onRemoveRecentSearch && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveRecentSearch(term);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                        title="حذف من السجل"
                        aria-label="حذف من السجل"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. POPULAR PRODUCT CATEGORIES (الأقسام الأكثر طلباً في سوق دسوق) */}
          <div className="p-2.5 sm:p-3 bg-[#FAF6EE]/50 dark:bg-zinc-900/60">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
              <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#800020] dark:text-[#D4AF37]" />
              <span>الأقسام الأكثر طلباً وتصفحاً</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 hover:border-[#800020] dark:hover:border-[#D4AF37] hover:shadow-xs transition-all text-right cursor-pointer group"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FAF6EE] dark:bg-zinc-700 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] sm:text-[11px] font-bold text-stone-800 dark:text-zinc-200 block truncate group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                      {cat.nameAr}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-stone-400 dark:text-zinc-400 block">
                      {cat.productCount || 10}+ منتج
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. TRENDING TERMS IN DESOQ (الأكثر بحثاً في دسوق اليوم) */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1.5 sm:mb-2 uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#800020] dark:text-[#D4AF37]" />
              <span>الأكثر رواجاً في دسوق اليوم 🔥</span>
            </span>

            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {activePopularSearches.map((term, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectQuery(term);
                    onClose();
                  }}
                  className="bg-[#FAF6EE] dark:bg-zinc-800 border border-[#D4AF37]/30 hover:border-[#800020] hover:bg-[#800020] hover:text-[#FAF6EE] dark:hover:bg-[#800020] dark:hover:text-[#FAF6EE] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold text-stone-700 dark:text-zinc-200 transition-all cursor-pointer flex items-center gap-1 group"
                >
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#800020] dark:text-[#D4AF37] group-hover:text-[#FAF6EE] shrink-0" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. POPULAR PRODUCT PICKS DISCOVERY (منتجات مميزة مقترحة) */}
          {popularPicks.length > 0 && (
            <div className="p-2.5 sm:p-3 bg-[#FAF6EE]/30 dark:bg-zinc-900/50">
              <span className="text-[10px] sm:text-[11px] font-black text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#800020] dark:text-[#D4AF37]" />
                <span>منتجات مميزة مقترحة لك</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {popularPicks.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(p.id);
                      else onSelectQuery(p.titleAr);
                      onClose();
                    }}
                    className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 hover:border-[#800020] dark:hover:border-[#D4AF37] flex items-center gap-2 text-right transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <Package className="w-4 h-4 m-auto text-stone-400" />
                      )}
                    </div>
                    <div className="min-w-0 truncate flex-1">
                      <span className="text-[11px] font-bold text-stone-800 dark:text-zinc-200 block truncate group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        {p.titleAr}
                      </span>
                      <span className="text-[10px] font-black text-[#800020] dark:text-[#E8B838] font-mono block">
                        {p.priceEGP} ج.م
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. FOOTER DESOQ QUALITY BADGE */}
          <div className="p-2 sm:p-2.5 bg-gradient-to-r from-[#800020]/10 via-[#FAF6EE] to-[#800020]/10 dark:from-zinc-800 dark:to-zinc-800 flex items-center justify-between text-[9px] sm:text-[10px] text-stone-500 dark:text-zinc-400">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#800020] dark:text-[#D4AF37]" />
              <span className="font-bold">ضمان أصالة وجودة واسترجاع 14 يوم</span>
            </div>
            <span className="text-[#800020] dark:text-[#D4AF37] font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>شحن 24 ساعة بدسوق</span>
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
