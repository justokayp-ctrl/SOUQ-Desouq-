import React, { useState, useMemo } from 'react';
import { 
  Store, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Truck, 
  Search, 
  ExternalLink, 
  ChevronLeft, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  SlidersHorizontal,
  Package,
  Phone,
  ArrowLeft,
  Flame,
  BadgeCheck
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Seller } from '../../types';

export const SellersDirectoryView: React.FC = () => {
  const { 
    sellers, 
    products, 
    openSellerProfile, 
    setActiveView, 
    setSelectedProduct,
    showToast 
  } = useMarketplace();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Extract unique specialties from sellers or products
  const specialties = [
    { id: 'all', label: 'كافة تخصصات الملابس' },
    { id: 'fashion', label: 'بدل رجالية وأزياء رسمية' },
    { id: 'abayas', label: 'عبايات استقبال وسهرة نسائية' },
    { id: 'casual', label: 'كاجوال وهوديز وبناطيل' },
    { id: 'kids', label: 'أزياء أطفال ومواليد قطنية' },
    { id: 'bespoke', label: 'تفصيل وخياطة حسب المقاس' },
  ];

  const districts = [
    { id: 'all', label: 'كافة مناطق دسوق' },
    { id: 'شارع الجيش', label: 'شارع الجيش' },
    { id: 'الميدان الإبراهيمي', label: 'الميدان الإبراهيمي' },
    { id: 'دحروج', label: 'حي دحروج' },
    { id: 'الصفا', label: 'حي الصفا' },
    { id: 'الكورنيش', label: 'كورنيش النيل' },
    { id: 'سعد زغلول', label: 'شارع سعد زغلول (أروقة الملابس)' },
  ];

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || 
        seller.name.toLowerCase().includes(search) ||
        (seller.arabicName && seller.arabicName.toLowerCase().includes(search)) ||
        (seller.ownerName && seller.ownerName.toLowerCase().includes(search)) ||
        (seller.description && seller.description.toLowerCase().includes(search)) ||
        (seller.storyAr && seller.storyAr.toLowerCase().includes(search)) ||
        (seller.sloganAr && seller.sloganAr.toLowerCase().includes(search));

      // District
      const matchesDistrict = selectedDistrict === 'all' || 
        (seller.address && seller.address.includes(selectedDistrict)) ||
        (seller.desoqDistrict && seller.desoqDistrict.includes(selectedDistrict)) ||
        (seller.district && seller.district.includes(selectedDistrict));

      // Verified
      const matchesVerified = !onlyVerified || seller.isVerified || seller.verificationStatus === 'verified';

      return matchesSearch && matchesDistrict && matchesVerified;
    });
  }, [sellers, searchTerm, selectedSpecialty, selectedDistrict, onlyVerified]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative bg-gradient-to-br from-[#1C1613] via-[#2F1F17] to-[#120E0C] text-white py-10 sm:py-16 px-4 sm:px-8 border-b border-[#D4AF37]/30 select-none">
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
            <span className="text-[#D4AF37]">دليل صُنّاع ومتاجر دسوق المعتمدين</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-bold text-[#D4AF37] mb-3 backdrop-blur-xs">
                <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>دليل المشاغل والمتاجر الموثقة بالسجل التجاري بدسوق</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
                تسوق مباشرة من صُنّاع وتجار دسوق الأصليين
              </h1>
              <p className="text-sm sm:text-base text-[#FAF6EE]/90 font-medium leading-relaxed">
                اكتشف أشهر مشاغل الأزياء، ترزية البدل الإيطالية، مصممي العبايات وفساتين السهرة، ومصانع الأقطان الدسوقية مع ضمان المعاينة وقياس المقاس وسرعة التوصيل 24 ساعة.
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث باسم المتجر أو الصانع أو النشاط..."
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#1A1A1A] placeholder:text-white/60 focus:placeholder:text-stone-400 text-xs sm:text-sm px-4 py-3 pr-10 rounded-2xl border border-white/20 focus:border-[#D4AF37] outline-none shadow-lg backdrop-blur-md transition-all font-medium"
                />
                <Search className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">{sellers.length} متجر معتمد</span>
              <span className="text-[11px] text-[#FAF6EE]/80">فحص وثائق KYC كامل</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">4.8 / 5.0</span>
              <span className="text-[11px] text-[#FAF6EE]/80">متوسط تقييم المشترين</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">توصيل 24 ساعة</span>
              <span className="text-[11px] text-[#FAF6EE]/80">أسطول كباتن شحن دسوق</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="block text-lg sm:text-xl font-black text-[#D4AF37]">ضمان حماية المشتري</span>
              <span className="text-[11px] text-[#FAF6EE]/80">معاينة قبل استلام الطرد</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FILTER & SORT CONTROLS STRIP */}
      <div className="sticky top-[108px] sm:top-[128px] z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800 py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Districts and Verified Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 shrink-0">المنطقة:</span>
            {districts.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDistrict(d.id)}
                className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  selectedDistrict === d.id
                    ? 'bg-[#800020] text-white border-[#D4AF37]'
                    : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 border-stone-200 dark:border-zinc-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-zinc-300 cursor-pointer bg-stone-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#800020] rounded"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>المتاجر الموثقة بالختم الذهبي فقط</span>
            </label>
          </div>

        </div>
      </div>

      {/* 3. SELLERS DIRECTORY GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <span>قائمة المتاجر والمشاغل المعتمدة ({filteredSellers.length})</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
              انقر على أي متجر لزيارة صفحته الرسمية واستعراض كافة معروضاته بالأسعار الحقيقية
            </p>
          </div>
        </div>

        {filteredSellers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-8">
            <Store className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800 dark:text-zinc-200">لا توجد متاجر مطابقة لبحثك حالياً</h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">جرب تغيير كلمات البحث أو إزالة التصفية</p>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSelectedDistrict('all'); setOnlyVerified(false); }}
              className="mt-4 bg-[#800020] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              عرض كافة المتاجر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => {
              const sellerProducts = products.filter(p => p.sellerId === seller.id);

              return (
                <div 
                  key={seller.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Banner Image */}
                  <div className="relative h-32 bg-stone-800 overflow-hidden">
                    <img 
                      src={seller.banner || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'} 
                      alt={seller.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 border border-white/20">
                      <Truck className="w-3 h-3 text-[#D4AF37]" />
                      <span>توصيل فوري بدسوق</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="px-5 pt-0 pb-5 flex-1 flex flex-col justify-between -mt-10 relative z-10">
                    <div>
                      {/* Logo and Verification */}
                      <div className="flex items-end justify-between mb-3">
                        <div className="relative">
                          <img 
                            src={seller.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                            alt={seller.name}
                            className="w-16 h-16 rounded-2xl object-cover border-3 border-white dark:border-zinc-900 shadow-md bg-stone-100"
                            loading="lazy"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-[#800020] text-[#D4AF37] p-1 rounded-full shadow-xs border border-white dark:border-zinc-900">
                            <BadgeCheck className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-200 dark:border-amber-800/60">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{seller.rating ? seller.rating.toFixed(1) : '4.9'}</span>
                          <span className="text-[10px] font-medium text-stone-500">({seller.reviewCount || 48})</span>
                        </div>
                      </div>

                      {/* Store Info */}
                      <div>
                        <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                          <span>{seller.name}</span>
                          <span className="text-xs text-[#D4AF37]" title="متجر معتمد وموثق">✓</span>
                        </h3>
                        
                        {seller.ownerName && (
                          <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium mt-0.5">
                            المالك: {seller.ownerName}
                          </p>
                        )}

                        <div className="flex items-center gap-1 text-xs text-stone-600 dark:text-zinc-300 font-medium mt-2">
                          <MapPin className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37] shrink-0" />
                          <span className="truncate">{seller.address || 'دسوق، شارع الجيش'}</span>
                        </div>

                        {(seller.description || seller.storyAr || seller.sloganAr) && (
                          <p className="text-xs text-stone-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                            {seller.description || seller.storyAr || seller.sloganAr}
                          </p>
                        )}
                      </div>

                      {/* Mini Preview of Seller's Top Products */}
                      {sellerProducts.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
                          <span className="text-[11px] font-bold text-stone-400 dark:text-zinc-500 block mb-2">
                            أبرز معروضات المتجر ({sellerProducts.length} منتج):
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {sellerProducts.slice(0, 3).map((prod) => (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => setSelectedProduct(prod)}
                                className="group/item relative rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-right cursor-pointer"
                                title={prod.titleAr}
                              >
                                <img 
                                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80'} 
                                  alt={prod.titleAr}
                                  className="w-full h-16 object-cover group-hover/item:scale-105 transition-transform"
                                  loading="lazy"
                                />
                                <div className="p-1">
                                  <span className="block text-[10px] font-black text-[#800020] dark:text-[#D4AF37] truncate">
                                    {prod.priceEGP} ج.م
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openSellerProfile(seller.id)}
                        className="flex-1 bg-[#800020] hover:bg-[#600018] text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>زيارة متجر التاجر الرسمي</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
