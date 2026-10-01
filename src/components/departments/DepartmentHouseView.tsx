import React, { useState, useMemo } from 'react';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight, 
  SlidersHorizontal, 
  Truck, 
  Clock, 
  Check, 
  Tag, 
  Star, 
  Store, 
  Layers, 
  Eye, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Award
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DepartmentRealmId, OccasionType, Product } from '../../types';
import { DEPARTMENT_HOUSES_CONFIG, REALM_LOOKBOOKS } from '../../data/departmentHousesData';
import { ProductCard } from '../common/ProductCard';
import { BrandShield } from '../common/ui/BrandShield';
import { RealmIcon, OccasionIcon, SubWingIcon } from '../common/HouseIcon';

interface DepartmentHouseViewProps {
  realmId?: DepartmentRealmId;
}

export const DepartmentHouseView: React.FC<DepartmentHouseViewProps> = ({ realmId: propRealmId }) => {
  const { 
    activeRealm, 
    openDepartmentRealm, 
    setActiveView, 
    products, 
    sellers,
    addToCart,
    setSelectedProduct,
    openSellerProfile,
    showToast
  } = useMarketplace();

  // Active realm config
  const currentRealmId: DepartmentRealmId = propRealmId || activeRealm || 'gentleman';
  const config = DEPARTMENT_HOUSES_CONFIG[currentRealmId] || DEPARTMENT_HOUSES_CONFIG.gentleman;

  // Selected occasion filter
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType | 'all'>('all');
  const [selectedSubWing, setSelectedSubWing] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [searchFilter, setSearchFilter] = useState('');
  const [addingLookbookId, setAddingLookbookId] = useState<string | null>(null);

  // Filter Lookbooks for this Realm
  const realmLookbooks = useMemo(() => {
    const list = REALM_LOOKBOOKS.filter(l => l.realmId === currentRealmId);
    if (selectedOccasion === 'all') return list;
    return list.filter(l => l.occasion === selectedOccasion);
  }, [currentRealmId, selectedOccasion]);

  // Filter Products for this Realm
  const realmProducts = useMemo(() => {
    return products.filter(p => {
      // Realm category matching
      let belongsToRealm = false;
      if (currentRealmId === 'gentleman') {
        belongsToRealm = p.category === 'men_fashion' || 
          p.category === 'fabrics_textiles' || 
          p.category === 'watches_accessories' || 
          p.category === 'perfumes_fragrances' ||
          p.titleAr.includes('رجالي') ||
          p.titleAr.includes('بدلة') ||
          p.titleAr.includes('قميص') ||
          p.titleAr.includes('ساعة') ||
          p.titleAr.includes('عود');
      } else if (currentRealmId === 'sanctuary') {
        belongsToRealm = p.category === 'women_fashion' || 
          p.category === 'fabrics_textiles' || 
          p.category === 'perfumes_fragrances' ||
          p.titleAr.includes('عباية') ||
          p.titleAr.includes('فستان') ||
          p.titleAr.includes('طرحة') ||
          p.titleAr.includes('سواريه') ||
          p.titleAr.includes('نسائي');
      } else if (currentRealmId === 'vanguard') {
        belongsToRealm = p.category === 'men_fashion' ||
          p.category === 'watches_accessories' ||
          p.titleAr.includes('هودي') ||
          p.titleAr.includes('سنيكرز') ||
          p.titleAr.includes('كاب') ||
          p.titleAr.includes('كاجوال') ||
          p.titleAr.includes('شبابي');
      } else if (currentRealmId === 'little_royals') {
        belongsToRealm = p.category === 'kids_wear' || 
          p.titleAr.includes('أطفال') || 
          p.titleAr.includes('بيبي') || 
          p.titleAr.includes('بنات') || 
          p.titleAr.includes('أولاد') ||
          p.titleAr.includes('سبوع');
      }

      if (!belongsToRealm) return false;

      // Sub-wing filter
      if (selectedSubWing !== 'all') {
        const wing = config.subWings.find(w => w.id === selectedSubWing);
        if (wing && wing.categoryFilter) {
          if (p.category !== wing.categoryFilter && !p.titleAr.includes(wing.nameAr.split(' ')[0])) {
            return false;
          }
        }
      }

      // Keyword search
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const matchTitle = p.titleAr.toLowerCase().includes(q) || p.titleEn.toLowerCase().includes(q);
        const matchDesc = p.descriptionAr.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceEGP - b.priceEGP;
      if (sortBy === 'price_desc') return b.priceEGP - a.priceEGP;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, currentRealmId, selectedSubWing, searchFilter, sortBy, config.subWings]);

  // Verified Sellers matching this Realm
  const realmSellers = useMemo(() => {
    return sellers.filter(s => s.verificationStatus === 'verified').slice(0, 6);
  }, [sellers]);

  // Handle adding an entire lookbook ensemble to cart
  const handleAddLookbookToCart = async (lookbook: typeof REALM_LOOKBOOKS[0]) => {
    setAddingLookbookId(lookbook.id);
    const lookbookProducts = products.filter(p => lookbook.productIds.includes(p.id));
    
    for (const prod of lookbookProducts) {
      await addToCart(prod, undefined, 1);
    }

    if (lookbookProducts.length === 0) {
      // Fallback: add first available product from realm
      if (realmProducts.length > 0) {
        await addToCart(realmProducts[0], undefined, 1);
      }
    }

    showToast(`تمت إضافة إطلالة "${lookbook.titleAr}" كاملة للسلة مع الخصم المعتمد`);
    setAddingLookbookId(null);
  };

  return (
    <div id={`department-realm-${currentRealmId}`} className="space-y-8 animate-in fade-in duration-300 pb-16 bg-[#FAF6EE] dark:bg-[#0B0B0D] text-[#141416] dark:text-[#FAF6EE]">
      
      {/* =========================================================================
          1. NAVIGATION BREADCRUMB & REALM SELECTOR STRIP
         ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
            <button 
              type="button" 
              onClick={() => setActiveView('catalog')}
              className="hover:text-[#800020] dark:hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <ChevronLeft className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-[#800020] dark:text-[#D4AF37]">
              {config.titleAr}
            </span>
          </div>

          {/* Switch to Other Grand Houses */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-stone-400 dark:text-zinc-500 shrink-0 ml-1">
              الانتقال إلى دار أخرى:
            </span>
            {(['gentleman', 'sanctuary', 'vanguard', 'little_royals'] as DepartmentRealmId[]).map((rId) => {
              const rConf = DEPARTMENT_HOUSES_CONFIG[rId];
              const isCurrent = rId === currentRealmId;
              return (
                <button
                  key={rId}
                  type="button"
                  onClick={() => openDepartmentRealm(rId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#800020] text-white shadow-xs'
                      : 'bg-[#FAF6EE] dark:bg-zinc-800 hover:border-[#800020] border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300'
                  }`}
                >
                  <RealmIcon realmId={rId} className="w-3.5 h-3.5" />
                  <span>{rConf.titleAr}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">

        {/* =========================================================================
            2. GRAND EDITORIAL REALM HERO (الهيدر التحريري المهيب للدار)
           ========================================================================= */}
        <section className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r ${config.bgGradient} text-white border-2 border-[#D4AF37]/40 p-6 sm:p-10 md:p-12`}>
          {/* Subtle background image overlay */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url(${config.heroImage})` }}
          />

          <div className="relative z-10 max-w-3xl space-y-4">
            
            {/* Seal Badge */}
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[#D4AF37]">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>{config.sealBadgeAr}</span>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-[#D4AF37]/60 flex items-center justify-center text-[#D4AF37] shadow-inner">
                  <RealmIcon realmId={currentRealmId} className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4AF37]" />
                </div>
                <span>{config.titleAr}</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-medium text-[#FAF6EE]/90 leading-relaxed">
                {config.taglineAr}
              </p>
            </div>

            {/* Narrative Story */}
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {config.narrativeAr}
            </p>

            {/* Prestige Guarantees Bar */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-[#FAF6EE]/90">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>معاينة وفحص القماش قبل الاستلام</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#FAF6EE]/90">
                <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>شحن وتوصيل فوري خلال 24 ساعة</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#FAF6EE]/90">
                <Star className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>صناعة ومشاغل دسوق المعتمدة</span>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. OCCASION TAXONOMY SELECTOR (تحديد المناسبة المرجوة)
           ========================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 border-2 border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-[#141416] dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
                <span>تسوق بحسب المناسبة المرجوة</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                اختر نوع المناسبة لعرض أطقم وتنسيقات مصممة خصيصاً لها
              </p>
            </div>

            {selectedOccasion !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedOccasion('all')}
                className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] hover:underline cursor-pointer self-start sm:self-auto"
              >
                عرض كافة المناسبات
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {config.occasions.map((occ) => {
              const isSelected = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setSelectedOccasion(isSelected ? 'all' : occ.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-right transition-all cursor-pointer flex flex-col justify-between border-2 ${
                    isSelected
                      ? 'bg-[#800020] text-white border-[#D4AF37] shadow-md -translate-y-0.5'
                      : 'bg-[#FAF6EE] dark:bg-zinc-800/70 hover:border-[#800020] dark:hover:border-[#D4AF37] border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-[#D4AF37]' : 'bg-white dark:bg-zinc-700 text-[#800020] dark:text-[#D4AF37] border border-stone-200 dark:border-zinc-600'
                    }`}>
                      <OccasionIcon occasion={occ.id} className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#800020] flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-[#141416] dark:text-zinc-100'}`}>
                      {occ.nameAr}
                    </h3>
                    <p className={`text-[10px] sm:text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-stone-200' : 'text-stone-500 dark:text-zinc-400'}`}>
                      {occ.descriptionAr}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            4. CURATED LOOKBOOK & COMPLETE THE LOOK (منسق الإطلالات وتنسيق الأطقم)
           ========================================================================= */}
        {realmLookbooks.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 border-2 border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#800020] dark:text-[#D4AF37] bg-[#FAF6EE] dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 mb-1 inline-block">
                  تنسيقات الدار الحصرية
                </span>
                <h2 className="text-base sm:text-xl font-serif font-black text-[#141416] dark:text-zinc-100 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
                  <span>دليل الإطلالات المتكاملة (Complete Ensemble)</span>
                </h2>
              </div>
              <span className="text-xs text-stone-500 dark:text-zinc-400">
                {realmLookbooks.length} إطلالة منسقة
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {realmLookbooks.map((look) => (
                <div 
                  key={look.id}
                  className="bg-[#FAF6EE] dark:bg-zinc-800/80 rounded-3xl border border-stone-200 dark:border-zinc-700 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row"
                >
                  {/* Lookbook Hero Image */}
                  <div className="md:w-5/12 relative min-h-[220px] md:min-h-full">
                    <img 
                      src={look.image} 
                      alt={look.titleAr} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:hidden" />
                    <span className="absolute top-3 right-3 bg-[#800020] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md border border-[#D4AF37]/50">
                      {look.tagAr}
                    </span>
                  </div>

                  {/* Lookbook Information & Action */}
                  <div className="p-5 md:w-7/12 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#800020] dark:text-[#D4AF37]">
                          {look.occasionNameAr}
                        </span>
                      </div>
                      
                      <h3 className="font-serif font-black text-sm sm:text-base text-[#141416] dark:text-zinc-100">
                        {look.titleAr}
                      </h3>

                      <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                        {look.descriptionAr}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-[11px] text-stone-700 dark:text-zinc-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span><strong>نصيحة المنسق:</strong> {look.stylingTipsAr}</span>
                      </div>
                    </div>

                    {/* Price & Add Bundle Button */}
                    <div className="pt-2 border-t border-stone-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base sm:text-lg font-black text-[#800020] dark:text-[#D4AF37]">
                            {look.curatedPriceEGP} ج.م
                          </span>
                          <span className="text-xs line-through text-stone-400">
                            {look.originalBundlePriceEGP} ج.م
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          وفر {look.savingsPercentage}% عند شراء الطقم كاملاً
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddLookbookToCart(look)}
                        disabled={addingLookbookId === look.id}
                        className="bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                        <span>{addingLookbookId === look.id ? 'جاري الإضافة...' : 'شراء الإطلالة كاملة'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            5. SUB-WINGS DISCOVERY CARDS (أروقة وأقسام الدار المتخصصة)
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif font-black text-[#141416] dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
              <span>أروقة وأقسام {config.titleAr}</span>
            </h2>
            <span className="text-xs text-stone-500">
              {config.subWings.length} أروقة متخصصة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {config.subWings.map((wing) => {
              const isSelected = selectedSubWing === wing.id;
              return (
                <button
                  key={wing.id}
                  type="button"
                  onClick={() => setSelectedSubWing(isSelected ? 'all' : wing.id)}
                  className={`p-3.5 rounded-2xl text-right transition-all cursor-pointer flex flex-col justify-between border-2 group ${
                    isSelected
                      ? 'bg-[#800020] text-white border-[#D4AF37] shadow-md'
                      : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-[#800020] text-stone-800 dark:text-zinc-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isSelected 
                          ? 'bg-white/20 text-[#D4AF37]' 
                          : 'bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] border border-stone-200 dark:border-zinc-700'
                      }`}>
                        <SubWingIcon wingId={wing.id} className="w-5 h-5" />
                      </div>
                      {wing.badgeAr && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-[#D4AF37]' : 'bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] border border-[#D4AF37]/30'
                        }`}>
                          {wing.badgeAr}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-[#141416] dark:text-zinc-100'}`}>
                      {wing.nameAr}
                    </h3>
                  </div>
                  <p className={`text-[10px] mt-2 line-clamp-2 ${isSelected ? 'text-stone-200' : 'text-stone-500 dark:text-zinc-400'}`}>
                    {wing.descriptionAr}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            6. PRODUCT SHOWCASE & ADVANCED FILTER MATRIX (كتالوج أزياء الدار)
           ========================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 border-2 border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base sm:text-xl font-serif font-black text-[#141416] dark:text-zinc-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
                <span>كتالوج ومجموعات {config.titleAr}</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                يتم عرض {realmProducts.length} منتج معتمد وموثق
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Filter Input */}
              <input
                type="text"
                placeholder="بحث في هذا القسم..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-[#FAF6EE] dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 focus:outline-hidden focus:border-[#800020] text-[#141416] dark:text-zinc-100"
              />

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF6EE] dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[#141416] dark:text-zinc-100 font-bold focus:outline-hidden"
              >
                <option value="featured">المميز والأعلى تقييماً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأكثر مبيعاً وتقييماً</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {realmProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {realmProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF6EE] dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-[#800020] dark:text-[#D4AF37]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#141416] dark:text-zinc-200">
                لا توجد منتجات تطابق الفلاتر المحددة حالياً
              </h3>
              <p className="text-xs text-stone-500">
                جرّب إزالة بعض الفلاتر أو البحث بكلمات أخرى
              </p>
              <button
                type="button"
                onClick={() => { setSelectedOccasion('all'); setSelectedSubWing('all'); setSearchFilter(''); }}
                className="bg-[#800020] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          )}

        </section>

        {/* =========================================================================
            7. MASTER ARTISANS & VERIFIED MERCHANTS (صنّاع ومشاغل دسوق المعتمدة)
           ========================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 border-2 border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-serif font-black text-[#141416] dark:text-zinc-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                <span>أبرز مشاغل وتجار {config.titleAr} في دسوق</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                تجار موثقون بسجل تجاري وبطاقة ضريبية معتمدة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {realmSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => openSellerProfile(seller.id)}
                className="p-3.5 rounded-2xl bg-[#FAF6EE] dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 hover:border-[#800020] cursor-pointer transition-all flex items-center gap-3 group"
              >
                <img 
                  src={seller.logo} 
                  alt={seller.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-zinc-700 group-hover:scale-105 transition-transform shrink-0" 
                />
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="font-bold text-xs text-[#141416] dark:text-zinc-100 truncate group-hover:text-[#800020]">
                    {seller.name}
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-zinc-400 block truncate">
                    📍 {seller.address}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-bold">
                    <span>★ {seller.rating}</span>
                    <span className="text-stone-400">({seller.reviewCount} تقييم)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
