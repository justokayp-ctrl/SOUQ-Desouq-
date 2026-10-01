import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Clock, 
  ShoppingBag,
  Award,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  ArrowRight,
  Grid,
  Zap,
  Tag,
  Star,
  Layers,
  Search,
  CheckCircle2,
  Heart,
  Flame,
  BadgePercent,
  Timer,
  ChevronDown,
  MessageCircle,
  Copy,
  Crown,
  Check,
  Percent,
  SlidersHorizontal,
  ThumbsUp
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../common/ProductCard';
import { BrandShield } from '../common/ui/BrandShield';
import { Product } from '../../types';

export const CustomerHomeView: React.FC = () => {
  const {
    products,
    sellers,
    setSelectedCategory,
    setOnlyDesoqLocal,
    setSelectedProduct,
    openSellerProfile,
    openDepartmentRealm,
    recentlyViewed,
    lang,
    t,
    setActiveView,
    setSearchQuery,
    heroSlides: dynamicHeroSlides,
    announcements,
  } = useMarketplace();

  // The 4 Grand Houses Royal Hero Slides
  const DEFAULT_HERO_SLIDES = [
    {
      id: 1,
      realmId: 'gentleman',
      tag: '«قسم ملابس وأزياء الرجال»',
      title: 'أرقى البدل الرسمية، القمصان القطنية والعطور الفاخرة',
      desc: 'تشكيلة واسعة من الملابس الرجالية الأنيقة والبدل والقمصان مع توصيل سريع حتى باب بيتك.',
      ctaText: 'تسوق ملابس الرجال',
      category: 'men_fashion',
      badge: 'جودة مضمونة',
      bgGradient: 'from-[#2B000B] via-[#4A0014] to-[#800020]',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 2,
      realmId: 'sanctuary',
      tag: '«قسم ملابس وأزياء النساء»',
      title: 'فساتين السهرة، العبايات الأنيقة والملايات والمفروشات',
      desc: 'أحدث موديلات الفساتين والعبايات وتجهيزات العروسة بأجود خامات الأقمشة مع ضمان الاسترجاع.',
      ctaText: 'تسوق ملابس النساء',
      category: 'women_fashion',
      badge: 'خامات ممتازة',
      bgGradient: 'from-[#380210] via-[#5C0A26] to-[#800020]',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 3,
      realmId: 'vanguard',
      tag: '«قسم الشباب والرياضة»',
      title: 'هوديز وملابس شبابية، سنيكرز وساعات وإكسسوارات',
      desc: 'ملابس كاجوال قطنية عصرية تناسب كل الأوقات مع أحذية رياضية مريحة وإكسسوارات متنوعة.',
      ctaText: 'تسوق ملابس الشباب',
      category: 'watches_accessories',
      badge: 'أحدث الموديلات',
      bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 4,
      realmId: 'little_royals',
      tag: '«قسم الأطفال والمواليد»',
      title: 'ملابس أطفال قطنية، أطقم المواليد ومستلزمات الصغار',
      desc: 'خامات قطنية ناعمة 100% مناسبة لبشرة الأطفال، تشمل أطقم حديثي الولادة والأولاد والبنات.',
      ctaText: 'تسوق ملابس الأطفال',
      category: 'kids_wear',
      badge: 'قطن 100%',
      bgGradient: 'from-[#0C2431] via-[#0F394C] to-[#164E63]',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  const heroSlides = (dynamicHeroSlides && dynamicHeroSlides.length > 0) ? dynamicHeroSlides : DEFAULT_HERO_SLIDES;

  // States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [couponCopied, setCouponCopied] = useState(false);
  const [dealTimeLeft, setDealTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 35 });
  const [activeRecommendationTab, setActiveRecommendationTab] = useState<'top_rated' | 'local_desoq' | 'fast_delivery' | 'best_sellers'>('top_rated');

  // Horizontal scroll refs
  const sellersScrollRef = useRef<HTMLDivElement>(null);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const dealsScrollRef = useRef<HTMLDivElement>(null);

  // Auto-play hero slider
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  // Flash Deals Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDealTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollSellers = (direction: 'left' | 'right') => {
    if (sellersScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      sellersScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollDeals = (direction: 'left' | 'right') => {
    if (dealsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      dealsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollFeatures = (direction: 'left' | 'right') => {
    if (featuresScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      featuresScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const copyCouponCode = () => {
    navigator.clipboard.writeText('DESOQ10');
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  const handleNavigateCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'men_fashion') {
      openDepartmentRealm('gentleman');
    } else if (catId === 'women_fashion') {
      openDepartmentRealm('sanctuary');
    } else if (catId === 'watches_accessories' || catId === 'shoes_bags') {
      openDepartmentRealm('vanguard');
    } else if (catId === 'kids_wear') {
      openDepartmentRealm('little_royals');
    } else {
      setActiveView('search_results');
    }
  };

  const executeSearch = (keyword: string) => {
    if (!keyword.trim()) return;
    setSearchQuery(keyword.trim());
    setActiveView('search_results');
  };

  // Products derivation
  const dealsProducts = products.filter(p => 
    (p.originalPriceEGP && p.originalPriceEGP > p.priceEGP)
  ).slice(0, 8);

  const personalizedPicks = products.filter(p => p.rating >= 4.7 || p.isFeatured).slice(0, 6);

  const topRatedProducts = products.filter(p => p.rating >= 4.8).slice(0, 8);
  const localDesoqProducts = products.filter(p => p.isDesoqLocalMade || p.bulletPoints?.some(b => b.includes('دسوق'))).slice(0, 8);
  const fastDeliveryProducts = products.filter(p => p.stock > 0 && (p.isFastDesoqDelivery || p.fulfillmentMethod === 'FBD')).slice(0, 8);
  const bestSellers = products.filter(p => p.reviewCount >= 15 || p.isFeatured).slice(0, 8);

  const activeRecommendationList = 
    activeRecommendationTab === 'top_rated' ? topRatedProducts :
    activeRecommendationTab === 'local_desoq' ? (localDesoqProducts.length > 0 ? localDesoqProducts : topRatedProducts) :
    activeRecommendationTab === 'fast_delivery' ? fastDeliveryProducts :
    bestSellers;

  return (
    <div id="customer-home-view" role="region" aria-label="محرك استكشاف سوق دسوق" className="space-y-8 animate-in fade-in duration-200 bg-[#FAF6EE] dark:bg-[#0B0B0D] pb-16">
      
      {/* Main Discovery Engine Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 space-y-6 sm:space-y-10 pt-4 sm:pt-6">

        {/* Dynamic Admin Announcements Ribbon */}
        {announcements && announcements.filter(a => a.isActive).length > 0 && (
          <div className="space-y-2">
            {announcements.filter(a => a.isActive).map(annc => (
              <div 
                key={annc.id}
                className="bg-gradient-to-r from-[#800020] via-[#5C0017] to-[#800020] text-white p-3 sm:p-4 rounded-2xl shadow-md border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-white/10 rounded-xl text-lg">📢</span>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-amber-200">{annc.titleAr}</h2>
                    <p className="text-xs sm:text-sm text-stone-200 leading-snug">{annc.messageAr || annc.contentAr}</p>
                  </div>
                </div>
                {annc.actionLink && (
                  <button
                    type="button"
                    onClick={() => {
                      if (annc.actionLink?.startsWith('category:')) {
                        handleNavigateCategory(annc.actionLink.replace('category:', ''));
                      } else {
                        setActiveView('search_results');
                      }
                    }}
                    className="self-start sm:self-auto shrink-0 bg-[#D4AF37] hover:bg-[#b89628] text-[#800020] font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    عرض التفاصيل
                  </button>
                )}
              </div>
            ))}
          </div>
        )}



        {/* Hero Interactive Spotlight Banner */}
        <section className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-[#800020]/20 min-h-[280px] sm:min-h-[380px] md:min-h-[400px] flex flex-col justify-between">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-r ${slide.bgGradient} flex flex-col justify-between p-5 sm:p-8 md:p-10 text-white ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div 
                className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#800020] font-black text-xs px-3 py-1 rounded-full shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.tag}</span>
                </span>
                <span className="bg-white/20 backdrop-blur-xs text-[#FAF6EE] text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                  {slide.badge}
                </span>
              </div>

              <div className="relative z-10 max-w-xl space-y-3 my-auto py-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-white leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {slide.desc}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleNavigateCategory(slide.category)}
                    className="bg-[#D4AF37] hover:bg-[#b89628] text-[#800020] font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{slide.ctaText}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory(null); setActiveView('search_results'); }}
                    className="bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-white/30 transition-colors cursor-pointer"
                  >
                    تصفح الكتالوج بالكامل
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                {heroSlides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlide(dotIdx)}
                    aria-label={`الشريحة ${dotIdx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      dotIdx === currentSlide ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-colors"
            aria-label="الشريحة السابقة"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-colors"
            aria-label="الشريحة التالية"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </section>

        {/* =========================================================================
            STAGE 2: PERSONALIZED DISCOVERY (PERSONALIZED FOR YOU IN DESOQ)
           ========================================================================= */}
        <section id="discovery-personalized-stage" className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-stone-200 dark:border-zinc-800 shadow-md space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] dark:text-[#D4AF37] mb-0.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>مُختارات مصممة لأجلك</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-[#141416] dark:text-zinc-100">
                لك خصيصاً في دسوق — بناءً على تصفحك وتفضيلاتك
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
              توصيات ذكية متجددة باستمرار
            </span>
          </div>

          {/* If Recently Viewed Exists, show top shelf */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#800020] dark:text-[#D4AF37]">
                <Clock className="w-4 h-4" />
                <span>المنتجات التي تفقدتها مؤخراً:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                {recentlyViewed.slice(0, 6).map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-[#FAF6EE] dark:bg-zinc-800/90 p-2.5 rounded-2xl border border-stone-200 dark:border-zinc-700 hover:border-[#800020] transition-all text-right space-y-2 cursor-pointer group flex flex-col justify-between"
                  >
                    <img 
                      src={prod.images[0]} 
                      alt={prod.titleAr} 
                      className="w-full h-24 object-contain rounded-xl group-hover:scale-105 transition-transform mix-blend-multiply dark:mix-blend-normal" 
                    />
                    <div>
                      <h4 className="text-[11px] font-bold text-[#141416] dark:text-zinc-200 line-clamp-1 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        {prod.titleAr}
                      </h4>
                      <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37] block mt-0.5">
                        {prod.priceEGP.toLocaleString()} ج.م
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curated Personalized Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-zinc-300">
              <span>منتجات مقترحة تلائم اهتماماتك:</span>
              <button
                type="button"
                onClick={() => { setSelectedCategory(null); setActiveView('search_results'); }}
                className="text-[#800020] dark:text-[#D4AF37] hover:underline"
              >
                تصفح المزيد
              </button>
            </div>
            {personalizedPicks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                {personalizedPicks.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-2xl p-6 text-center border border-dashed border-stone-200 dark:border-zinc-700">
                <p className="text-xs text-stone-500 dark:text-zinc-400 font-bold">
                  لا توجد منتجات مسجلة في المتجر حالياً. الكتالوج جاهز لاستقبال المنتجات الجديدة.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            STAGE 4: DEALS (FLASH DEALS & DISCOUNTS WITH REALTIME TIMER)
           ========================================================================= */}
        {dealsProducts.length > 0 && (
        <section id="discovery-deals-stage" className="bg-gradient-to-br from-[#800020] via-[#5C0017] to-[#36000E] rounded-3xl p-5 sm:p-7 md:p-8 text-white border-2 border-[#D4AF37]/40 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-0.5 rounded-full shadow-md">
                <Flame className="w-4 h-4 fill-current" />
                <span>عروض وتخفيضات اليوم</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
                تخفيضات مميزة وأسعار خاصة
              </h2>
              <p className="text-xs text-stone-200">
                خصومات تصل إلى 40% لفترة محدودة وحتى نفاد الكميات المتاحة
              </p>
            </div>

            {/* Live Countdown Timer */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#D4AF37]/50 self-start md:self-auto">
              <Timer className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-stone-300 block">ينتهي العرض بعد:</span>
                <div className="font-mono font-black text-sm sm:text-base text-[#D4AF37] tracking-wider dir-ltr flex items-center gap-1">
                  <span>{String(dealTimeLeft.hours).padStart(2, '0')}</span>:
                  <span>{String(dealTimeLeft.minutes).padStart(2, '0')}</span>:
                  <span>{String(dealTimeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deals Horizontal Carousel */}
          <div className="relative">
            <div
              ref={dealsScrollRef}
              className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 snap-x scroll-smooth"
            >
              {dealsProducts.map((prod) => {
                const discount = prod.originalPriceEGP ? Math.round(((prod.originalPriceEGP - prod.priceEGP) / prod.originalPriceEGP) * 100) : 20;
                const savings = prod.originalPriceEGP ? prod.originalPriceEGP - prod.priceEGP : Math.round(prod.priceEGP * 0.2);
                const sellerObj = sellers.find(s => s.id === prod.sellerId);
                const sellerDisplayName = sellerObj?.arabicName || sellerObj?.name || 'متجر سوق دسوق';
                return (
                  <div
                    key={prod.id}
                    className="shrink-0 snap-start bg-white dark:bg-zinc-900 text-[#141416] dark:text-zinc-100 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-zinc-700 hover:border-[#D4AF37] transition-all flex flex-col justify-between w-[200px] sm:w-[230px] shadow-lg group"
                  >
                    <div className="relative">
                      <div className="absolute top-1.5 right-1.5 z-10 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                        خصم {discount}%
                      </div>
                      <img
                        src={prod.images[0]}
                        alt={prod.titleAr}
                        className="w-full h-32 sm:h-36 object-contain rounded-xl group-hover:scale-105 transition-transform mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>

                    <div className="space-y-1.5 pt-2 text-right">
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 block truncate">
                        {sellerDisplayName}
                      </span>
                      <h4 className="text-xs font-bold line-clamp-1 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        {prod.titleAr}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-[#800020] dark:text-[#D4AF37]">
                          {prod.priceEGP.toLocaleString()} ج.م
                        </span>
                        {prod.originalPriceEGP && (
                          <span className="text-[10px] line-through text-stone-400 font-mono">
                            {prod.originalPriceEGP.toLocaleString()} ج.م
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        وفرت: {savings.toLocaleString()} ج.م
                      </div>

                      {/* Scarcity Progress Bar */}
                      <div className="space-y-0.5 pt-1">
                        <div className="flex justify-between text-[9px] text-stone-500 font-medium">
                          <span>متبقي في العرض:</span>
                          <span className="font-bold text-red-600">{prod.stock || 4} قطع</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 rounded-full w-[70%]" />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProduct(prod)}
                        className="w-full mt-2 bg-[#800020] hover:bg-[#66001A] text-white py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
                      >
                        عرض المنتج والشراء
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll buttons */}
            <button
              type="button"
              onClick={() => scrollDeals('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#800020] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
              aria-label="عروض تالية"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollDeals('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#800020] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
              aria-label="عروض سابقة"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Coupon Code Strip */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BadgePercent className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-right">
                <span className="text-xs font-bold text-amber-200">كوبون خصم إضافي: </span>
                <span className="text-xs text-stone-200">استخدم الكود <strong>DESOQ10</strong> للحصول على خصم 10% عند إتمام الشراء</span>
              </div>
            </div>
            <button
              type="button"
              onClick={copyCouponCode}
              className="bg-[#D4AF37] hover:bg-[#b89628] text-[#800020] font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {couponCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ بنجاح</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود: DESOQ10</span>
                </>
              )}
            </button>
          </div>
        </section>
        )}

        {/* =========================================================================
            STAGE 5: STORES (VERIFIED DESOQ ARTISANS & LOCAL MERCHANTS)
           ========================================================================= */}
        {sellers.length > 0 && (
        <section id="discovery-stores-stage" className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-stone-200 dark:border-zinc-800 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] dark:text-[#D4AF37] mb-1">
                <Store className="w-4 h-4 text-[#D4AF37]" />
                <span>دليل المتاجر والتجار المعتمدين</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-black text-[#141416] dark:text-zinc-100">
                متاجر وتجار دسوق المعتمدين
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                متاجر موثقة ومعتمدة لضمان جودة المنتجات وحق الاسترجاع
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollSellers('right')}
                className="w-8 h-8 rounded-full bg-[#FAF6EE] dark:bg-zinc-800 hover:bg-[#800020] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#800020] text-stone-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-stone-200 dark:border-zinc-700"
                aria-label="التالي"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollSellers('left')}
                className="w-8 h-8 rounded-full bg-[#FAF6EE] dark:bg-zinc-800 hover:bg-[#800020] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#800020] text-stone-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-stone-200 dark:border-zinc-700"
                aria-label="السابق"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={sellersScrollRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 snap-x scroll-smooth"
          >
            {sellers.map((seller) => (
              <div
                key={seller.id}
                className="shrink-0 snap-start bg-[#FAF6EE] dark:bg-zinc-800/90 rounded-2xl p-4 border border-stone-200 dark:border-zinc-700 hover:border-[#800020] dark:hover:border-[#D4AF37] transition-all flex flex-col justify-between w-[220px] sm:w-[250px] shadow-sm hover:shadow-md text-right space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={seller.logo}
                      alt={seller.name}
                      className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 p-1 group-hover:scale-105 transition-transform"
                    />
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 bg-white dark:bg-zinc-900 rounded-full absolute -bottom-1 -right-1" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-bold text-xs sm:text-sm text-[#141416] dark:text-zinc-100 truncate group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                      {seller.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-zinc-400">
                      <MapPin className="w-3 h-3 text-[#800020] shrink-0" />
                      <span className="truncate">{seller.governorate || 'دسوق، كفر الشيخ'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 dark:border-zinc-700">
                  <span className="font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>{seller.rating}</span>
                    <span className="text-[10px] text-stone-400">({seller.reviewCount})</span>
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {seller.totalSalesEGP ? `${(seller.totalSalesEGP / 1000).toFixed(0)}k+ ج.م مبيعات` : 'متجر نشط'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openSellerProfile(seller.id)}
                  className="w-full bg-white dark:bg-zinc-900 hover:bg-[#800020] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#800020] text-[#800020] dark:text-[#D4AF37] border border-[#800020]/20 dark:border-[#D4AF37]/30 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>زيارة المتجر</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* =========================================================================
            STAGE 6: RECOMMENDATIONS (SMART LOCAL RECOMMENDATIONS ENGINE)
           ========================================================================= */}
        <section id="discovery-recommendations-stage" className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-stone-200 dark:border-zinc-800 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800020] dark:text-[#D4AF37] mb-1">
                <ThumbsUp className="w-4 h-4 text-[#D4AF37]" />
                <span>توصيات الشراء الذكية</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-black text-[#141416] dark:text-zinc-100">
                الأكثر رواجاً وإقبالاً في سوق دسوق
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                منتجات خضعت لأعلى تقييمات وفحص الجودة من أهالي دسوق
              </p>
            </div>

            {/* Recommendation Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-[#FAF6EE] dark:bg-zinc-800 p-1.5 rounded-2xl border border-stone-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setActiveRecommendationTab('top_rated')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeRecommendationTab === 'top_rated'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>الأعلى تقييماً (4.8+)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRecommendationTab('local_desoq')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeRecommendationTab === 'local_desoq'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>صُنعت في دسوق</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRecommendationTab('fast_delivery')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeRecommendationTab === 'fast_delivery'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>توصيل خلال 24 ساعة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRecommendationTab('best_sellers')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeRecommendationTab === 'best_sellers'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>الأكثر مبيعاً</span>
              </button>
            </div>
          </div>

          {/* Recommendations Products Grid */}
          {activeRecommendationList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
              {activeRecommendationList.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-2xl p-8 text-center border border-dashed border-stone-200 dark:border-zinc-700">
              <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-600 dark:text-zinc-300">
                لا توجد منتجات مسجلة في هذا القسم حالياً
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                سيتم إدراج المنتجات هنا فور إضافتها من قبل التجار
              </p>
            </div>
          )}

          {/* Explore full catalog CTA footer */}
          <div className="pt-4 text-center border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => { setSelectedCategory(null); setActiveView('search_results'); }}
              className="inline-flex items-center gap-2 bg-[#800020] hover:bg-[#66001A] text-white px-8 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95 cursor-pointer border border-[#D4AF37]/30"
            >
              <span>تصفح كامل الكتالوج في سوق دسوق ({products.length} منتج)</span>
              <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </section>

        {/* Platform Guarantees & Trust Features Strip */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border-2 border-stone-200 dark:border-zinc-800 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 border border-[#D4AF37]/50 shadow-xs">
                <Truck className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-xs text-[#141416] dark:text-zinc-100">توصيل إكسبريس 24 ساعة</h4>
                <p className="text-[10px] text-stone-500 dark:text-zinc-400">تغطية لكافة أحياء وقرى دسوق</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 border border-[#D4AF37]/50 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-xs text-[#141416] dark:text-zinc-100">استرجاع 14 يوماً مجاناً</h4>
                <p className="text-[10px] text-stone-500 dark:text-zinc-400">حسب قانون حماية المستهلك 181</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 border border-[#D4AF37]/50 shadow-xs">
                <Award className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-xs text-[#141416] dark:text-zinc-100">صناع ومشاغل موثقة</h4>
                <p className="text-[10px] text-stone-500 dark:text-zinc-400">سجلات تجارية وبطاقات ضريبية</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 border border-[#D4AF37]/50 shadow-xs">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-black text-xs text-[#141416] dark:text-zinc-100">دفع عند الاستلام (COD)</h4>
                <p className="text-[10px] text-stone-500 dark:text-zinc-400">معاينة واختبار المنتج قبل الدفع</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Floating WhatsApp Direct Order Button */}
      <a
        href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%B3%D9%88%D9%82%20%D8%AF%D8%B3%D9%88%D9%82"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل واتساب مباشر"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border-2 border-white cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden sm:inline text-xs font-black">
          طلب مباشر عبر واتساب
        </span>
      </a>
    </div>
  );
};
