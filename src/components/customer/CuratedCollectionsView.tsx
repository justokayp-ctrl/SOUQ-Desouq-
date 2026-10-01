import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Heart, 
  ShoppingBag, 
  ArrowLeft, 
  ChevronLeft, 
  Check, 
  Gift, 
  Flame, 
  Layers, 
  Store,
  Tag
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product } from '../../types';

interface CuratedBundle {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  descriptionAr: string;
  badgeAr: string;
  heroImage: string;
  categoryTag: string;
  itemIds: string[]; // matching product IDs from mockData or fallback
  bundleDiscountPercent: number;
}

export const CuratedCollectionsView: React.FC = () => {
  const { 
    products, 
    sellers, 
    addToCart, 
    setSelectedProduct, 
    setActiveView, 
    showToast 
  } = useMarketplace();

  const [activeBundleId, setActiveBundleId] = useState<string>('bride-bundle');

  const bundles: CuratedBundle[] = [
    {
      id: 'bride-bundle',
      titleAr: 'تشكيلة جهاز العروسة الدسوقية الفاخرة',
      titleEn: 'The Desoq Bride Fashion Collection',
      subtitleAr: 'فساتين سهرة، عبايات استقبال مطرزة، وشالات حرير مجهزة لأفراح الدلتا',
      descriptionAr: 'باقة منتقاة بعناية تضم فستان سهرة سواريه راقي، عباية استقبال سعودي مطرزة بالخرز اليدوي، شال حرير بيور، وطقم بيجامات واستقبال راقي لتجهيز إطلالات العروسة بأعلى جودة.',
      badgeAr: 'وفر 20% عند طلب الباقة كاملة',
      heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80',
      categoryTag: 'تجهيز العرائس',
      itemIds: [],
      bundleDiscountPercent: 20
    },
    {
      id: 'gentleman-prestige',
      titleAr: 'إطلالة الوجاهة والأناقة الرسمية للرجل',
      titleEn: 'Gentleman Formal Prestige Suite',
      subtitleAr: 'بدلة إيطالية، قميص قطن مصري 100%، حذاء جلد طبيعي، وعطر سلطان الدلتا',
      descriptionAr: 'تنسيق متكامل مصمم خصيصاً للمؤتمرات والأفراح ومناسبات العمل الرفيعة بلمسة كلاسيكية إيطالية وحياكة مصرية فاخرة.',
      badgeAr: 'خصم الباقة المتناسقة 15%',
      heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
      categoryTag: 'أناقة الرجال',
      itemIds: [],
      bundleDiscountPercent: 15
    },
    {
      id: 'youth-streetwear-look',
      titleAr: 'طقم الشباب العصري والأوفرسايز الكاجوال',
      titleEn: 'Urban Youth Oversized Streetwear Set',
      subtitleAr: 'هودي قطن مصري أوفرسايز، بنطلون كارجو متين، وسنيكرز جلدي مريح',
      descriptionAr: 'مجموعة الشباب الأكثر طلباً: خامات قطنية مصرية 100% ثقيلة، قصات مريحة تدوم مع الغسيل المتكرر، وتنسيق ألوان كاجوال عصري للجامعة والخروجات.',
      badgeAr: 'ترند الموسم خصم 18%',
      heroImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80',
      categoryTag: 'أزياء شبابية',
      itemIds: [],
      bundleDiscountPercent: 18
    },
    {
      id: 'heritage-tailoring',
      titleAr: 'كنوز الجلابيب والتفصيل الدسوقي التراثي',
      titleEn: 'Desoq Heritage Galabeyas & Bespoke Tailoring',
      subtitleAr: 'قطن مصري 100% صيفي وشتوي وجلاليب مطرزة يدوياً من أعرق خياطي الدلتا',
      descriptionAr: 'أزياء رجالية مصرية أصيلة مصنوعة بأجود خيوط غزل المحلة ودسوق، مطرزة يدوياً على الصدر والأكمام مع شال كشميري فاخر للمناسبات.',
      badgeAr: 'قطن مصري أصيل 100%',
      heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
      categoryTag: 'أزياء تراثية',
      itemIds: [],
      bundleDiscountPercent: 15
    }
  ];

  const currentBundle = bundles.find(b => b.id === activeBundleId) || bundles[0];

  // Resolve products in the bundle or select sample products
  const bundleProducts = products.filter(p => 
    currentBundle.itemIds.includes(p.id) || 
    p.category.includes(currentBundle.categoryTag)
  ).slice(0, 4);

  const fallbackProducts = bundleProducts.length > 0 ? bundleProducts : products.slice(0, 4);

  const totalBundleOriginalPrice = fallbackProducts.reduce((sum, p) => sum + p.priceEGP, 0);
  const bundleDiscountAmount = Math.round((totalBundleOriginalPrice * currentBundle.bundleDiscountPercent) / 100);
  const totalBundleDiscountedPrice = totalBundleOriginalPrice - bundleDiscountAmount;

  const handleAddFullBundle = () => {
    fallbackProducts.forEach(prod => {
      addToCart(prod, undefined, 1);
    });
    showToast(`تمت إضافة كامل باقة "${currentBundle.titleAr}" إلى سلتك بخصم ${currentBundle.bundleDiscountPercent}%!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-20">
      
      {/* 1. HERO HEADER */}
      <section className="relative bg-gradient-to-br from-[#2D0F19] via-[#4A1625] to-[#1F0710] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-[#D4AF37]/30 select-none">
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
            <span className="text-[#D4AF37]">المجموعات المختارة ودليل المناسبات</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#800020] px-3.5 py-1 rounded-full text-xs font-black mb-3 shadow-md">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>مجموعات منسقة بعناية وخصومات حزم متكاملة</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
              تشكيلات الهدايا والمناسبات لجهاز العروس والوجاهة
            </h1>
            <p className="text-sm sm:text-base text-[#FAF6EE]/90 font-medium leading-relaxed">
              وفر وقت البحث والتنسيق مع مجموعات متكاملة أعدها خبراء الأناقة والتراث في دسوق، مع خصم خاص على كامل الباقة والتوصيل الآمن لباب بيتك.
            </p>
          </div>

        </div>
      </section>

      {/* 2. BUNDLE SWITCHER TABS */}
      <div className="sticky top-[108px] sm:top-[128px] z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {bundles.map((bundle) => {
            const isSelected = activeBundleId === bundle.id;
            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => setActiveBundleId(bundle.id)}
                className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/40'
                    : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 border-stone-200 dark:border-zinc-700'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                <span>{bundle.titleAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE BUNDLE SHOWCASE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Bundle Hero Overview Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-[#D4AF37]/40 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Hero Image */}
          <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[300px]">
            <img 
              src={currentBundle.heroImage} 
              alt={currentBundle.titleAr}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
            <div className="absolute top-4 right-4 bg-[#800020] text-[#D4AF37] font-black text-xs px-3 py-1.5 rounded-xl shadow-md border border-[#D4AF37]/50">
              {currentBundle.badgeAr}
            </div>
          </div>

          {/* Details & Pricing */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37] uppercase tracking-wider block mb-1">
                {currentBundle.categoryTag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white leading-tight">
                {currentBundle.titleAr}
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400 font-semibold mt-1">
                {currentBundle.subtitleAr}
              </p>
              
              <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed mt-4">
                {currentBundle.descriptionAr}
              </p>

              {/* Price Calculation */}
              <div className="mt-6 bg-[#FAF6EE] dark:bg-zinc-800/80 rounded-2xl p-4 border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 dark:text-zinc-400 font-bold block">
                    إجمالي سعر قطع الباقة منفردة:
                  </span>
                  <span className="text-sm text-stone-400 line-through">
                    {totalBundleOriginalPrice.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black block">
                    سعر الباقة المجمعة (وفر {bundleDiscountAmount} ج.م):
                  </span>
                  <span className="text-2xl font-black text-[#800020] dark:text-[#D4AF37]">
                    {totalBundleDiscountedPrice.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {fallbackProducts.length > 0 ? (
                <button
                  type="button"
                  onClick={handleAddFullBundle}
                  className="flex-1 bg-[#800020] hover:bg-[#600018] text-white font-black py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                  <span>شراء الباقة كاملة بخصم {currentBundle.bundleDiscountPercent}%</span>
                </button>
              ) : (
                <div className="flex-1 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 py-3 px-4 rounded-xl text-xs font-bold text-center border border-stone-200 dark:border-zinc-700">
                  بانتظار إضافة التجار لمنتجات متوافقة مع هذه الباقة
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Bundle Items Breakdown */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>مكونات هذه التشكيلة ({fallbackProducts.length} قطع مختارة):</span>
          </h3>

          {fallbackProducts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-700 p-8 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-sm font-bold text-stone-700 dark:text-zinc-300">
                لا توجد منتجات مسجلة في هذه الباقة حالياً
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                عند قيام التجار بإضافة منتجات جديدة، ستظهر تلقائياً ضمن هذه التشكيلة
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fallbackProducts.map((item, idx) => {
              const seller = sellers.find(s => s.id === item.sellerId);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 rounded-xl overflow-hidden mb-3">
                      <img 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80'} 
                        alt={item.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        قطعة #{idx + 1}
                      </span>
                    </div>

                    {seller && (
                      <span className="text-[10px] font-bold text-stone-400 block mb-1">
                        صنع بواسطة: {seller.name}
                      </span>
                    )}

                    <h4 className="text-xs font-black text-stone-900 dark:text-white line-clamp-2">
                      {item.titleAr}
                    </h4>

                    <span className="text-sm font-black text-[#800020] dark:text-[#D4AF37] block mt-2">
                      {item.priceEGP} ج.م
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item, undefined, 1);
                      showToast(`تمت إضافة "${item.titleAr}" للسلة!`, 'success');
                    }}
                    className="mt-3 w-full bg-stone-100 hover:bg-[#800020] text-stone-800 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-[#D4AF37] dark:hover:text-[#800020] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    شراء هذه القطعة منفردة
                  </button>
                </div>
              );
            })}
          </div>
          )}
        </div>

      </div>

    </div>
  );
};
