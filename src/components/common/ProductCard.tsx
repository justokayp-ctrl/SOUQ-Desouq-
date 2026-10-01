import React, { useState } from 'react';
import { Heart, Scale, Eye, ShoppingBag, Star, CheckCircle2, Truck, ShieldAlert, Check, Sparkles, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Product } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { getProductGrandHouse } from '../../data/departmentHousesData';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    compareList, 
    addToCompare, 
    removeFromCompare, 
    sellers, 
    openSellerProfile,
    openDepartmentRealm,
    lang,
    t,
    showToast,
    addRecentlyViewed,
    rateProduct,
    userRatings
  } = useMarketplace();

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const seller = sellers.find(s => s.id === product.sellerId);
  const isWishlisted = wishlist.includes(product.id);
  const isCompared = compareList.some(p => p.id === product.id);
  const houseConfig = getProductGrandHouse(product);
  const userRating = userRatings[product.id];

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomOrigin({ x, y });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleRateProduct = async (e: React.MouseEvent, ratingVal: number) => {
    e.stopPropagation();
    await rateProduct(product.id, ratingVal);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding) return;
    try {
      setIsAdding(true);
      await addToCart(product, undefined, 1);
      setJustAdded(true);
      showToast(`تمت إضافة "${lang === 'en' ? product.titleEn : product.titleAr}" إلى السلة`);
      setTimeout(() => setJustAdded(false), 1600);
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة المنتج');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    addRecentlyViewed(product);
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const hasDiscount = product.originalPriceEGP && product.originalPriceEGP > product.priceEGP;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPriceEGP! - product.priceEGP) / product.originalPriceEGP!) * 100) 
    : 0;

  return (
    <article 
      role="button"
      tabIndex={0}
      aria-label={`${lang === 'en' ? product.titleEn : product.titleAr} - ${product.priceEGP} ج.م`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group bg-white dark:bg-zinc-800/90 rounded-xl sm:rounded-2xl border border-stone-200/80 dark:border-zinc-700/80 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer transform hover:-translate-y-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#800020] h-full"
    >
      {/* Top Image Container with Multi-Image Carousel & Interactive Zoom-on-Hover */}
      <div 
        className="relative aspect-[4/5] sm:aspect-square w-full bg-[#FAF6EE]/60 dark:bg-zinc-900/80 overflow-hidden isolate select-none touch-none flex items-center justify-center p-2 sm:p-3 group/img"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[currentImgIndex] || images[0]}
          alt={lang === 'en' ? product.titleEn : product.titleAr}
          draggable={false}
          style={{
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`
          }}
          className={`w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal pointer-events-none select-none transition-transform duration-200 ease-out ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Zoom Hint Indicator */}
        <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none bg-black/60 text-white p-1 rounded-full text-[10px] flex items-center gap-1 px-2 backdrop-blur-xs">
          <ZoomIn className="w-3 h-3 text-[#D4AF37]" />
          <span className="hidden sm:inline text-[9px]">تكبير للتفاصيل</span>
        </div>

        {/* Carousel Prev/Next Controls inside Card */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="الصورة السابقة"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 dark:bg-zinc-800/90 text-stone-800 dark:text-zinc-100 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-md hover:bg-[#800020] hover:text-white cursor-pointer border border-stone-200"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              aria-label="الصورة التالية"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 dark:bg-zinc-800/90 text-stone-800 dark:text-zinc-100 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-md hover:bg-[#800020] hover:text-white cursor-pointer border border-stone-200"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Carousel Pagination Bullets */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentImgIndex ? 'w-3 bg-[#D4AF37]' : 'bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`صورة ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Overlay Badges (Burgundy Discount & Low Stock) */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex flex-col gap-1 sm:gap-1.5 z-10 items-end pointer-events-none">
          {hasDiscount && (
            <span className="bg-[#800020] text-[#FAF6EE] font-black text-[9px] sm:text-[10px] md:text-[11px] px-1.5 sm:px-2 py-0.5 rounded sm:rounded-md shadow-xs border border-[#D4AF37]/50 tracking-tight">
              خصم {discountPercent}%
            </span>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-600 text-white font-bold text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded sm:rounded-md shadow-xs flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>متبقي {product.stock}</span>
            </span>
          )}
        </div>

        {/* Top Left Floating Actions (Wishlist & Quick View) with Safe Touch Targets */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1.5 z-10 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {/* Wishlist Button - min 36px on mobile, 40px on sm with 44px touch area */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
            className={`w-9 h-9 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer border ${
              isWishlisted
                ? 'bg-[#800020] text-white border-[#800020]'
                : 'bg-white/95 dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 hover:bg-[#800020] hover:text-white border-stone-200 dark:border-zinc-700'
            }`}
            aria-label={isWishlisted ? `إزالة ${product.titleAr} من المفضلة` : `إضافة ${product.titleAr} للمفضلة`}
          >
            <Heart className={`w-4 h-4 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current text-[#FAF6EE]' : ''}`} />
          </button>

          {/* Quick View Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onQuickView) onQuickView(product); }}
            className="w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 hover:bg-[#800020] hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer border border-stone-200 dark:border-zinc-700"
            aria-label={`معاينة سريعة: ${product.titleAr}`}
          >
            <Eye className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Amazon/Noon Express Dispatch Strip */}
        {product.isFastDesoqDelivery && (
          <div className="absolute bottom-0 inset-x-0 bg-[#800020]/90 text-[#FAF6EE] px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold flex items-center justify-between backdrop-blur-xs border-t border-[#D4AF37]/40">
            <div className="flex items-center gap-1 truncate">
              <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D4AF37] shrink-0" />
              <span className="truncate">إكسبريس دسوق ⚡</span>
            </div>
            <span className="hidden sm:inline text-[8px] sm:text-[9px] text-[#FAF6EE]/90 shrink-0">توصيل غداً</span>
          </div>
        )}
      </div>

      {/* Card Body (Amazon / Noon Information Architecture) */}
      <div className="p-2 sm:p-3 md:p-3.5 flex-1 flex flex-col justify-between bg-white dark:bg-zinc-800/90 space-y-1.5 sm:space-y-2">
        
        <div className="space-y-1">
          {/* House Realm Badge + Merchant Row */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDepartmentRealm(houseConfig.id);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] hover:bg-[#800020] hover:text-white dark:hover:text-white border border-[#D4AF37]/30 text-[9px] sm:text-[10px] font-black transition-all cursor-pointer truncate max-w-[100px] sm:max-w-[130px] group/hb"
              title={`الانتقال إلى ${houseConfig.titleAr}`}
            >
              <span className="text-xs shrink-0">{houseConfig.icon}</span>
              <span className="truncate">{houseConfig.titleAr}</span>
            </button>

            {product.attributes.brand && (
              <span className="bg-stone-100 dark:bg-zinc-700/60 px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold text-stone-600 dark:text-zinc-300 shrink-0 truncate max-w-[70px] sm:max-w-[90px]">
                {product.attributes.brand}
              </span>
            )}
          </div>

          {/* Product Title (2-Line Clamp with responsive fluid typography) */}
          <h3 className="text-[12px] sm:text-[13px] md:text-sm font-bold text-[#141416] dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-[#800020] dark:group-hover:text-[#D4AF37] transition-colors min-h-[2.2rem] sm:min-h-[2.5rem]">
            {lang === 'en' ? product.titleEn : product.titleAr}
          </h3>

          {/* Product Rating Display & Verified Customer Review Count */}
          <div 
            className="flex items-center justify-between text-[11px] gap-1 py-0.5"
            onClick={(e) => {
              // On desktop allow direct rating, but prevent accidental card navigation
              if (window.innerWidth >= 640) {
                e.stopPropagation();
              }
            }}
          >
            <div className="flex items-center gap-1">
              {/* 5 Stars - Visual only on mobile to prevent tap-hijacking; interactive on sm+ */}
              <div 
                className="flex items-center gap-0.5 sm:cursor-pointer"
                onMouseLeave={() => setHoverRating(null)}
                title={userRating ? `تقييمك: ${userRating} نجوم` : 'تقييم المنتج'}
              >
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = hoverRating !== null
                    ? starVal <= hoverRating
                    : userRating 
                      ? starVal <= userRating
                      : starVal <= Math.round(product.rating);

                  const isUserStar = Boolean(userRating && starVal <= userRating);

                  return (
                    <button
                      key={starVal}
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRateProduct(e, starVal);
                      }}
                      onMouseEnter={() => setHoverRating(starVal)}
                      className="p-0.5 sm:hover:scale-125 transition-transform duration-150 focus:outline-hidden cursor-pointer pointer-events-none sm:pointer-events-auto"
                      aria-label={`تقييم ${starVal} من 5 نجوم`}
                    >
                      <Star
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                          isFilled
                            ? hoverRating !== null
                              ? 'fill-amber-400 text-amber-500'
                              : isUserStar
                                ? 'fill-[#800020] text-[#800020] dark:fill-[#D4AF37] dark:text-[#D4AF37]'
                                : 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-stone-300 dark:text-zinc-600 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Average Score */}
              <span className="text-[10px] sm:text-[11px] font-black text-stone-800 dark:text-zinc-200">
                {(product.rating || 5.0).toFixed(1)}
              </span>

              {/* Review Count */}
              <span className="text-[9px] sm:text-[10px] text-stone-400 dark:text-zinc-400 font-bold">
                ({product.reviewCount || 0})
              </span>
            </div>

            {/* User Rating Indicator Badge if rated */}
            {userRating && (
              <span className="text-[8px] sm:text-[9px] font-bold text-[#800020] dark:text-[#D4AF37] bg-[#FAF6EE] dark:bg-zinc-700/60 px-1.5 py-0.5 rounded-full border border-[#D4AF37]/30 shrink-0">
                تقييمك: {userRating}★
              </span>
            )}
          </div>

          {/* Scarcity Principle Progress Bar (< 5 items) */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="pt-1 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>متبقي {product.stock} قطع فقط في المخزن!</span>
                </span>
                <span className="text-[8px] sm:text-[9px] text-rose-600 dark:text-rose-400 font-bold">طلب مرتفع 🔥</span>
              </div>
              <div className="w-full h-1.5 bg-amber-100 dark:bg-amber-950/60 rounded-full overflow-hidden border border-amber-300/40">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(15, (product.stock / 5) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing & High-Conversion Action Button (Amazon / Noon Style) */}
        <div className="pt-1.5 sm:pt-2 border-t border-stone-100 dark:border-zinc-700/60 flex items-center justify-between gap-1 sm:gap-2">
          
          {/* Price Container */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-xs sm:text-sm md:text-base font-black text-[#800020] dark:text-[#FAF6EE] truncate">
                {(product.priceEGP ?? 0).toLocaleString()}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-[#800020]/80 dark:text-[#D4AF37] shrink-0">
                ج.م
              </span>
            </div>

            {hasDiscount && (
              <div className="flex items-center gap-1 truncate">
                <span className="text-[9px] sm:text-[10px] text-stone-400 line-through truncate">
                  {(product.originalPriceEGP ?? 0).toLocaleString()}
                </span>
                <span className="text-[8px] sm:text-[9px] text-[#800020] dark:text-[#D4AF37] font-bold shrink-0">
                  وفر {discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Fast Add to Cart Action */}
          <button
            type="button"
            disabled={product.stock <= 0 || isAdding}
            onClick={handleAddToCart}
            aria-label={`أضف ${product.titleAr} للسلة`}
            className={`vw-card-button min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] rounded-lg sm:rounded-xl font-black text-[0.75rem] sm:text-[0.8rem] flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-xs border shrink-0 ${
              product.stock <= 0
                ? 'bg-stone-200 dark:bg-zinc-700 text-stone-400 border-transparent cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-700 text-white border-emerald-600 scale-102 ring-2 ring-emerald-400/40'
                : 'bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] border-[#D4AF37]/40 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] animate-in zoom-in-50 duration-150 shrink-0" />
                <span className="hidden xl:inline">أُضيف</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] shrink-0" />
                <span className="hidden xl:inline">
                  {isAdding ? '...' : (product.stock > 0 ? 'أضف' : 'نفد')}
                </span>
              </>
            )}
          </button>

        </div>

      </div>
    </article>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
