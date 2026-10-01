import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  Store, 
  ShieldCheck, 
  Globe, 
  Sun, 
  Moon, 
  Monitor, 
  ChevronDown, 
  Menu, 
  Flame, 
  Sparkles, 
  X, 
  Zap, 
  Phone, 
  Clock, 
  MapPin, 
  Truck,
  Crown,
  Layers
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Role, DepartmentRealmId } from '../../types';
import { DEPARTMENT_HOUSES_CONFIG } from '../../data/departmentHousesData';
import { BrandShield } from '../common/ui';
import { SidebarDrawer } from '../common/SidebarDrawer';
import { PredictiveSearchDropdown } from '../common/PredictiveSearchDropdown';
import { RealmIcon } from '../common/HouseIcon';

export const CustomerHeader: React.FC = () => {
  const { 
    user,
    setIsAuthModalOpen,
    role, 
    setRole, 
    activeView, 
    setActiveView, 
    activeRealm,
    openDepartmentRealm,
    cartTotalCount, 
    cartGrandTotalEGP,
    setIsCartOpen,
    wishlist,
    orders,
    products,
    setSelectedProduct,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    setOnlyDesoqLocal,
    lang,
    setLang,
    theme,
    setTheme,
    t,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
  } = useMarketplace();

  const [suggestions, setSuggestions] = useState<Array<{ text: string; categoryAr?: string; priceEGP?: number; type?: string; productId?: string }>>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    'فستان سواريه مطرز', 
    'عطر مسك الختام والعود', 
    'حقيبة يد جلد طبيعي', 
    'حذاء كلاسيك إيطالي',
    'بدلة رجالي فورمال كاملة',
    'طقم فضة عيار 925 استرليني',
    'عباية خليجي استقبال فاخرة',
    'ملابس أطفال قطن مصري'
  ]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('حي وسط، شارع الجيش');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const desoqNeighborhoods = [
    'حي وسط، شارع الجيش وميدان العارف بالله',
    'حي دحروج وشارع الجمهورية',
    'حي الكشلة ومنطقة المحطة',
    'حي الصفا وشارع الشركات',
    'حي مكة ومنطقة الاستاد',
    'قرى ومركز دسوق (شحن 24 ساعة)'
  ];

  // Fetch search suggestions from backend
  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length >= 1) {
      fetch(`/api/catalog/search/suggest?q=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (active && Array.isArray(data)) setSuggestions(data);
        })
        .catch(() => {});
    } else {
      setSuggestions([]);
    }
    return () => { active = false; };
  }, [searchQuery]);

  useEffect(() => {
    fetch('/api/catalog/search/popular')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setPopularSearches(data);
      })
      .catch(() => {});
  }, []);

  // Close search popover on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(target)) {
        setIsMobileSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      setIsSearchFocused(false);
      setIsMobileSearchFocused(false);
      setActiveView('search_results');
    }
  };

  const executeSearchTerm = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setActiveView('search_results');
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setActiveView('search_results');
  };

  const handleSelectProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
      setIsSearchFocused(false);
      setIsMobileSearchFocused(false);
    } else {
      executeSearchTerm(productId);
    }
  };

  return (
    <>
      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <header id="customer-header" className="sticky top-0 z-40 shadow-md transition-colors duration-200">
        
        {/* 1. TOP LIVE FLASH NEWS / DEALS RIBBON */}
        <div className="bg-gradient-to-r from-[#800020] via-[#5A0016] to-[#800020] text-[#FAF6EE] text-[10px] sm:text-[11px] py-0.5 sm:py-1 px-2.5 sm:px-4 border-b border-[#D4AF37]/40 overflow-hidden select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            
            <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-[10px] sm:text-xs truncate">
              <span className="bg-[#D4AF37] text-[#800020] px-1.5 py-0.2 rounded font-black text-[9px] sm:text-[10px] flex items-center gap-0.5 sm:gap-1 shadow-xs shrink-0">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                <span>عاجل</span>
              </span>
              <span className="truncate">
                🎉 خصم 10% إضافي إنستاباي وفودافون كاش • 🚚 توصيل مجاني فوق 300 ج.م بدسوق
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-[#FAF6EE]/90 shrink-0">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                <span>شحن 24 ساعة بدسوق</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D4AF37]" />
                <span>الخط الساخن: 19000</span>
              </span>
            </div>

          </div>
        </div>

        {/* 2. TOP UTILITY BAR */}
        <div className="hidden md:block bg-[#141416] text-[#FAF6EE] text-[11px] py-1.5 px-4 font-medium border-b border-[#D4AF37]/20">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                className="flex items-center gap-1.5 bg-[#FAF6EE]/10 hover:bg-[#FAF6EE]/20 text-[#FAF6EE] px-2.5 py-0.5 rounded-md border border-[#D4AF37]/30 transition-colors cursor-pointer text-[10px] font-bold"
                title="تحديد موقع التوصيل بدسوق"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="text-[#FAF6EE]/70">التوصيل إلى:</span>
                <span className="text-white font-bold max-w-[140px] truncate">{selectedNeighborhood}</span>
                <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
              </button>

              <span className="text-[#FAF6EE]/80 hidden md:inline">
                منصة التسوق الرسمية لأهالي دسوق وكفر الشيخ 🇪🇬
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#FAF6EE]/90">
              <span className="hidden lg:flex items-center gap-1.5 text-xs text-[#FAF6EE]">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>توصيل 24 ساعة لباب بيتك</span>
              </span>
              <span className="hidden lg:inline text-white/20">|</span>
              <span className="hidden xl:flex items-center gap-1.5 text-xs text-[#FAF6EE]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>ضمان استرجاع 14 يوم (قانون 181)</span>
              </span>

              {/* Language & Theme Switcher */}
              <div className="flex items-center gap-1.5 pl-2 border-r border-white/20">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-[#800020] text-white text-[10px] font-bold transition-colors cursor-pointer border border-white/10"
                >
                  <Globe className="w-3 h-3 text-[#D4AF37]" />
                  <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                    setTheme(nextTheme);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-[#800020] text-white text-[10px] font-bold transition-colors cursor-pointer border border-white/10"
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-3 h-3 text-amber-300" />
                      <span className="hidden sm:inline">فاتح</span>
                    </>
                  ) : theme === 'dark' ? (
                    <>
                      <Moon className="w-3 h-3 text-[#D4AF37]" />
                      <span className="hidden sm:inline">داكن</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3 h-3 text-sky-300" />
                      <span className="hidden sm:inline">تلقائي</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 3. MAIN RETAIL SEARCH BAR */}
        <div className="bg-[#FAF6EE] dark:bg-zinc-900 border-b border-[#D4AF37]/25 text-[#141416] dark:text-[#FAF6EE] py-1.5 px-3 sm:py-2.5 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 md:gap-5">
            
            {/* Logo */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 hover:border-[#800020] text-[#800020] dark:text-[#D4AF37] cursor-pointer shadow-xs transition-all"
                aria-label="فتح القائمة الجانبية الشاملة"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div 
                id="brand-logo-btn"
                onClick={() => { setActiveView('catalog'); }}
                className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group select-none shrink-0"
                role="button"
                tabIndex={0}
                aria-label="سوق دسوق - الصفحة الرئيسية"
              >
                <BrandShield size="responsive" variant="burgundy" animate />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-base sm:text-2xl font-serif font-black text-[#800020] dark:text-zinc-100 tracking-tight leading-none group-hover:text-[#66001A] dark:group-hover:text-[#D4AF37] transition-colors">
                      سوق دسوق
                    </span>
                    <span className="bg-[#800020] text-[#FAF6EE] text-[8px] sm:text-[9px] font-black px-1 py-0 sm:px-1.5 sm:py-0.2 rounded border border-[#D4AF37]/40 shadow-xs">
                      الأصلي
                    </span>
                  </div>
                  <span className="hidden sm:flex text-[10px] font-bold uppercase tracking-widest text-[#800020]/80 dark:text-[#D4AF37] mt-0.5 items-center gap-1">
                    <span>SOUQ DESOQ</span>
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                    <span className="text-[9px] text-stone-500 dark:text-stone-400">التجارة المحلية</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Search Engine */}
            <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl items-center relative">
              <form 
                onSubmit={handleSearchSubmit} 
                className="w-full flex items-center bg-white dark:bg-zinc-800 rounded-xl shadow-inner border-2 border-[#800020]/30 focus-within:border-[#800020] focus-within:ring-2 focus-within:ring-[#D4AF37]/40 transition-all overflow-hidden" 
                role="search"
              >
                <div className="relative shrink-0 pr-3 pl-2.5 border-l border-gray-200 dark:border-zinc-700 bg-[#F5F2ED] dark:bg-zinc-800/90 py-2">
                  <label htmlFor="header-category-select" className="sr-only">
                    {t('categories')}
                  </label>
                  <select
                    id="header-category-select"
                    value={selectedCategory || ''}
                    onChange={(e) => {
                      const catVal = e.target.value || null;
                      setSelectedCategory(catVal);
                      if (catVal) {
                        setActiveView('search_results');
                      }
                    }}
                    className="bg-transparent text-xs font-bold text-[#800020] dark:text-zinc-200 outline-none cursor-pointer pr-1"
                    aria-label={t('categories')}
                  >
                    <option value="" className="dark:bg-zinc-800">جميع الأقسام</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="dark:bg-zinc-800">
                        {lang === 'en' ? cat.nameEn : cat.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <label htmlFor="desktop-search-input" className="sr-only">
                  {t('searchPlaceholder')}
                </label>
                <input
                  id="desktop-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن فساتين سواريه، عطور ومسك، مجوهرات وفضة، عبايات، أحذية..."
                  className="w-full bg-transparent px-3.5 py-2 text-xs text-[#141416] dark:text-zinc-100 placeholder:text-stone-400 outline-none font-medium"
                />

                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    className="p-1.5 text-stone-400 hover:text-[#800020] dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] px-5 py-2.5 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border-r border-[#D4AF37]/50"
                  aria-label="بحث في المتجر"
                >
                  <Search className="w-4 h-4 text-[#D4AF37]" />
                  <span>بحث</span>
                </button>
              </form>

              <PredictiveSearchDropdown
                searchQuery={searchQuery}
                isOpen={isSearchFocused}
                onClose={() => setIsSearchFocused(false)}
                onSelectQuery={executeSearchTerm}
                onSelectCategory={handleSelectCategory}
                onSelectProduct={handleSelectProduct}
                recentSearches={recentSearches}
                onRemoveRecentSearch={removeRecentSearch}
                onClearRecentSearches={clearRecentSearches}
                popularSearches={popularSearches}
                categories={categories}
                allProducts={products}
              />
            </div>

            {/* Right Consumer Action Deck */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              
              {/* Account Dropdown */}
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden lg:flex flex-col text-right px-2.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-[#D4AF37]/30 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-stone-500 dark:text-zinc-400 leading-none">
                  {user ? `مرحباً، ${user.fullName.split(' ')[0]}` : 'مرحباً، تسجيل الدخول'}
                </span>
                <span className="font-black text-xs text-[#800020] dark:text-[#FAF6EE] flex items-center gap-0.5 leading-tight">
                  <span>الحساب والقوائم</span>
                  <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
                </span>
              </button>

              {/* Orders Button */}
              <button
                type="button"
                onClick={() => { setActiveView('orders'); }}
                className="hidden sm:flex flex-col text-right px-2.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-[#D4AF37]/30 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-stone-500 dark:text-zinc-400 leading-none">تتبع</span>
                <span className="font-black text-xs text-[#800020] dark:text-[#FAF6EE] leading-tight">
                  الطلبات ({orders.length})
                </span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => { setActiveView('wishlist'); }}
                className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-[#800020] transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                aria-label="المفضلة"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#800020] text-white text-[9px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] p-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl border border-[#D4AF37]/50 shadow-md transition-transform hover:scale-102 active:scale-98 cursor-pointer"
                aria-label="سلة المشتريات"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FAF6EE] text-[#800020] font-black text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-[#800020]">
                    {cartTotalCount}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col text-right leading-none">
                  <span className="text-[9px] text-[#FAF6EE]/80">العربة</span>
                  <span className="font-black text-xs text-[#FAF6EE]">
                    {(cartGrandTotalEGP ?? 0).toLocaleString()} ج.م
                  </span>
                </div>
              </button>

            </div>
          </div>

          {/* Mobile Search Input */}
          <div ref={mobileSearchContainerRef} className="md:hidden mt-1.5 relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white dark:bg-zinc-800 rounded-lg px-2.5 py-1 border border-[#800020]/30 shadow-xs focus-within:border-[#800020]" role="search">
              <Search className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1.5" />
              <input
                id="mobile-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsMobileSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أزياء، عطور، مجوهرات، أحذية..."
                className="w-full bg-transparent text-xs text-[#141416] dark:text-zinc-100 placeholder:text-stone-400 outline-none font-medium py-0.5"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')} 
                  className="p-1 text-stone-400 hover:text-[#800020]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#800020] text-white p-1.5 rounded-md mr-1 flex items-center justify-center cursor-pointer"
                aria-label="بحث"
              >
                <Search className="w-3 h-3 text-[#D4AF37]" />
              </button>
            </form>

            <PredictiveSearchDropdown
              searchQuery={searchQuery}
              isOpen={isMobileSearchFocused}
              onClose={() => setIsMobileSearchFocused(false)}
              onSelectQuery={executeSearchTerm}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
              recentSearches={recentSearches}
              onRemoveRecentSearch={removeRecentSearch}
              onClearRecentSearches={clearRecentSearches}
              popularSearches={popularSearches}
              categories={categories}
              allProducts={products}
            />
          </div>
        </div>

        {/* 4. THE FOUR GRAND HOUSES ROYAL NAVIGATION RIBBON (أروقة الدور الأربع الكبرى) */}
        <div className="bg-[#FFFFFF] dark:bg-zinc-950 border-b border-stone-200 dark:border-zinc-800 py-1 sm:py-1.5 px-2.5 sm:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto">
            
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-0.5 md:pb-0 scrollbar-none text-[11px] sm:text-xs">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="shrink-0 flex items-center gap-1 sm:gap-1.5 font-bold px-2.5 py-1.5 rounded-xl bg-[#FAF6EE] dark:bg-zinc-900 hover:bg-[#800020] text-[#800020] dark:text-[#D4AF37] hover:text-white border border-[#D4AF37]/40 transition-all cursor-pointer shadow-xs"
                title="فتح القائمة وجميع الأقسام"
              >
                <Menu className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-black">كل الأقسام</span>
              </button>

              {/* The 4 Grand Houses Tabs */}
              {(['gentleman', 'sanctuary', 'vanguard', 'little_royals'] as DepartmentRealmId[]).map((rId) => {
                const rConf = DEPARTMENT_HOUSES_CONFIG[rId];
                const isSelected = activeView === 'department_realm' && activeRealm === rId;

                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => openDepartmentRealm(rId)}
                    className={`shrink-0 font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#800020] text-white border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]/50'
                        : 'bg-white dark:bg-zinc-900 text-[#141416] dark:text-zinc-200 hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 hover:text-[#800020] dark:hover:text-[#D4AF37] border-stone-200 dark:border-zinc-800 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <RealmIcon realmId={rId} className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D4AF37]' : 'text-[#800020] dark:text-[#D4AF37]'}`} />
                    <span className="font-extrabold tracking-tight">{rConf.titleAr}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setActiveView('category_hub')}
                className={`shrink-0 flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  activeView === 'category_hub'
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-200 hover:bg-[#FAF6EE] border-stone-200 dark:border-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>أقسام المتجر</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('sellers_directory')}
                className={`shrink-0 flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  activeView === 'sellers_directory'
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-200 hover:bg-[#FAF6EE] border-stone-200 dark:border-zinc-800'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>دليل المتاجر</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('curated_collections')}
                className={`shrink-0 flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  activeView === 'curated_collections'
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-200 hover:bg-[#FAF6EE] border-stone-200 dark:border-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>تنسيقات مميزة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('flash_deals')}
                className={`shrink-0 flex items-center gap-1 font-black px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  activeView === 'flash_deals'
                    ? 'bg-[#800020] text-white border-[#D4AF37] ring-1 ring-[#D4AF37]'
                    : 'bg-[#800020] text-[#FAF6EE] hover:bg-[#66001A] border border-[#D4AF37]/50 shadow-xs'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                <span>عروض وتخفيضات</span>
              </button>
            </div>

            {/* Quick Switch to Merchant / Admin / Support */}
            <div className="hidden md:flex items-center gap-1 bg-[#FAF6EE] dark:bg-zinc-900 p-1 rounded-xl border border-[#D4AF37]/30 shrink-0 text-xs">
              <span className="text-[10px] text-stone-500 font-bold px-1.5">التبديل:</span>
              <button
                type="button"
                onClick={() => handleRoleChange('seller')}
                className="px-2.5 py-1 rounded-lg font-bold text-stone-700 dark:text-zinc-300 hover:bg-[#800020] hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="الانتقال إلى بوابة التاجر"
              >
                <Store className="w-3 h-3 text-[#D4AF37]" />
                <span>التاجر</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('courier')}
                className="px-2.5 py-1 rounded-lg font-bold text-stone-700 dark:text-zinc-300 hover:bg-[#800020] hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="الانتقال إلى بوابة المندوب"
              >
                <Truck className="w-3 h-3 text-[#D4AF37]" />
                <span>المندوب</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className="px-2 py-1 rounded-lg font-bold text-stone-700 dark:text-zinc-300 hover:bg-[#800020] hover:text-white transition-all cursor-pointer"
                title="الانتقال إلى لوحة الإدارة"
              >
                الإدارة
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('support')}
                className="px-2 py-1 rounded-lg font-bold text-stone-700 dark:text-zinc-300 hover:bg-[#800020] hover:text-white transition-all cursor-pointer"
                title="الانتقال إلى مكتب التحكيم"
              >
                التحكيم
              </button>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};
