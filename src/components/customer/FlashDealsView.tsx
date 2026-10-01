import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  Tag, 
  Sparkles, 
  ShoppingBag, 
  ArrowLeft, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  Percent, 
  Zap,
  TrendingDown,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product } from '../../types';

export const FlashDealsView: React.FC = () => {
  const { 
    products, 
    sellers, 
    addToCart, 
    setSelectedProduct, 
    setActiveView, 
    showToast 
  } = useMarketplace();

  const [dealFilter, setDealFilter] = useState<'all' | 'mega' | 'under250' | 'free_shipping'>('all');
  
  // Real-time Countdown Timer (counts down to midnight tonight)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 8,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = Math.max(0, midnight.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter products that have discounts or create dynamic deals
  const dealProducts = useMemo(() => {
    return products.map((product, idx) => {
      // If product doesn't have explicit originalPrice, calculate an artificial discount based on product ID
      const hasRealDiscount = product.originalPriceEGP && product.originalPriceEGP > product.priceEGP;
      const originalPrice = hasRealDiscount 
        ? product.originalPriceEGP! 
        : Math.round(product.priceEGP * 1.35);
      
      const discountPercentage = Math.round(((originalPrice - product.priceEGP) / originalPrice) * 100);
      const savingsEGP = originalPrice - product.priceEGP;
      const remainingStock = ((idx * 3 + 2) % 7) + 2; // Simulated scarcity 2-8 units

      return {
        ...product,
        calculatedOriginalPrice: originalPrice,
        discountPercentage,
        savingsEGP,
        remainingStock
      };
    }).filter((item) => {
      if (dealFilter === 'mega') return item.discountPercentage >= 30;
      if (dealFilter === 'under250') return item.priceEGP <= 250;
      if (dealFilter === 'free_shipping') return item.priceEGP >= 300;
      return true;
    });
  }, [products, dealFilter]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, undefined, 1);
    showToast(`تمت إضافة "${product.titleAr}" إلى سلة التسوق بسعر العرض!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-20">
      
      {/* 1. HERO FLASH DEALS BANNER */}
      <section className="relative bg-gradient-to-br from-[#5A0016] via-[#800020] to-[#240008] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-[#D4AF37]/40 overflow-hidden select-none">
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
            <span className="text-[#D4AF37]">صفقات التوفير اليومية والعروض الخاطفة</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#800020] px-3.5 py-1 rounded-full text-xs font-black mb-3 shadow-md">
                <Flame className="w-4 h-4 fill-current animate-pulse" />
                <span>عروض حصرية لفترة محدودة • تنتهي منتصف الليل</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
                وفر حتى 50% مباشرة من صانع وتجار دسوق
              </h1>
              <p className="text-sm sm:text-base text-[#FAF6EE]/90 font-medium leading-relaxed">
                اقتنص أفضل الصفقات على الأزياء الملكية، العبايات، العطور المعتقة، والأحذية الجلدية بأسعار الجملة المباشرة مع إمكانية المعاينة قبل الدفع.
              </p>
            </div>

            {/* LIVE COUNTDOWN TIMER CAPSULE */}
            <div className="bg-black/50 backdrop-blur-md rounded-3xl p-5 border border-[#D4AF37]/40 shadow-2xl shrink-0 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#D4AF37] mb-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>ينتهي العرض اليومي بعد:</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white">
                <div className="bg-white/10 rounded-2xl px-3.5 py-2 border border-white/15">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-[#D4AF37]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#FAF6EE]/70 font-bold">ساعة</span>
                </div>
                <span className="text-2xl font-black text-[#D4AF37]">:</span>
                <div className="bg-white/10 rounded-2xl px-3.5 py-2 border border-white/15">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-[#D4AF37]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#FAF6EE]/70 font-bold">دقيقة</span>
                </div>
                <span className="text-2xl font-black text-[#D4AF37]">:</span>
                <div className="bg-white/10 rounded-2xl px-3.5 py-2 border border-white/15">
                  <span className="block text-2xl sm:text-3xl font-black font-mono text-[#D4AF37]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#FAF6EE]/70 font-bold">ثانية</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FILTER TABS */}
      <div className="sticky top-[108px] sm:top-[128px] z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'كافة صفقات اليوم', icon: Sparkles },
            { id: 'mega', label: 'خصم 30% فأكثر 🔥', icon: Flame },
            { id: 'under250', label: 'صفقات أقل من 250 ج.م 💰', icon: Tag },
            { id: 'free_shipping', label: 'مؤهلة للشحن المجاني 🚚', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = dealFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDealFilter(tab.id as any)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-xs ring-1 ring-[#D4AF37]/40'
                    : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 border-stone-200 dark:border-zinc-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DEALS PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-current" />
              <span>العروض المتاحة الآن ({dealProducts.length} صفقة)</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
              الأسعار المخفضة سارية حتى نفاد الكميات المحددة لكل صانع
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dealProducts.map((item) => {
            const seller = sellers.find(s => s.id === item.sellerId);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-stone-200/80 dark:border-zinc-800 hover:border-[#800020] dark:hover:border-[#D4AF37] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer relative"
              >
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 z-10 bg-[#800020] text-[#FAF6EE] font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-[#D4AF37]/50 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#D4AF37] fill-current" />
                  <span>خصم {item.discountPercentage}%</span>
                </div>

                {/* Savings Pill */}
                <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-lg shadow-sm">
                  وفر {item.savingsEGP} ج.م
                </div>

                {/* Product Image */}
                <div className="relative h-56 bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
                    alt={item.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {seller && (
                      <span className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 block mb-1 truncate">
                        متجر {seller.name}
                      </span>
                    )}

                    <h3 className="text-sm font-black text-stone-900 dark:text-white line-clamp-2 leading-snug">
                      {item.titleAr}
                    </h3>

                    {/* Price Calculation */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-black text-[#800020] dark:text-[#D4AF37]">
                        {item.priceEGP} ج.م
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        {item.calculatedOriginalPrice} ج.م
                      </span>
                    </div>

                    {/* Simulated Scarcity Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-amber-700 dark:text-amber-400">متبقي {item.remainingStock} قطع فقط!</span>
                        <span className="text-stone-400">طلب سريع</span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-[#800020] h-full rounded-full"
                          style={{ width: `${Math.max(20, 100 - item.remainingStock * 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="w-full bg-[#800020] hover:bg-[#600018] text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                      <span>اقتنص العرض وأضف للسلة</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
