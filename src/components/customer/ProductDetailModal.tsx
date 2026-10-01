import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { 
  X, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  Heart, 
  Scale, 
  Check, 
  Store, 
  HelpCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Award,
  ChevronDown,
  Ruler,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Move,
  Smartphone,
  Lock,
  Timer,
  AlertCircle
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { FocusTrap } from '../common/FocusTrap';
import { ProductVariant, EgyptianGovernorate } from '../../types';
import { EGYPTIAN_GOVERNORATES } from '../../data/mockData';
import { Express1ClickCheckoutModal, getGovernorateShippingRate } from './Express1ClickCheckoutModal';
import { SizeGuideModal } from '../common/SizeGuideModal';
import { api } from '../../services/api';
import { sanitizeUserInput, sanitizeHtml } from '../../services/security';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    sellers, 
    products,
    addToCart, 
    wishlist, 
    toggleWishlist,
    compareList,
    addToCompare,
    setIsCartOpen,
    openSellerProfile,
    lang,
    t,
    showToast,
    rateProduct,
    userRatings
  } = useMarketplace();

  // All React Hooks must be declared unconditionally at the top of the component
  const [modalHoverRating, setModalHoverRating] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    selectedProduct?.variants?.[0]
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews' | 'qa'>('details');
  const [isExpressOpen, setIsExpressOpen] = useState<boolean>(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<EgyptianGovernorate>('كفر الشيخ');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isFullZoomOpen, setIsFullZoomOpen] = useState<boolean>(false);
  const [lightboxScale, setLightboxScale] = useState<number>(1);
  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleOpenLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxScale(1);
    setIsFullZoomOpen(true);
  };

  // Reset variant, quantity and gallery when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedVariant(selectedProduct.variants?.[0]);
      setQuantity(1);
      setActiveImageIndex(0);
      setActiveTab('details');
      setIsExpressOpen(false);
    }
  }, [selectedProduct?.id]);

  // Real-time flash-sale inventory reservation & stock check
  const [inventoryStatus, setInventoryStatus] = useState<{
    totalStock: number;
    availableNow: number;
    reservedByOthers: number;
    hasCompetitorHold: boolean;
    isScarce: boolean;
    callerRemainingSeconds?: number;
  } | null>(null);

  useEffect(() => {
    if (!selectedProduct?.id) return;
    let isMounted = true;
    api.getInventoryStatus(selectedProduct.id, selectedVariant?.id)
      .then((status) => {
        if (isMounted) setInventoryStatus(status);
      })
      .catch(() => {});

    // Poll every 15s to keep competitor holds and flash-sale stock accurate
    const timer = setInterval(() => {
      api.getInventoryStatus(selectedProduct.id, selectedVariant?.id)
        .then((status) => {
          if (isMounted) setInventoryStatus(status);
        })
        .catch(() => {});
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedProduct?.id, selectedVariant?.id]);

  // Review submission state
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<Array<{ name: string; rating: number; comment: string; date: string }>>([
    { name: 'محمد عبد الفتاح', rating: 5, comment: 'منتج ممتاز ومطابق للوصف تماماً. تم التسليم خلال 24 ساعة في دسوق.', date: '2026-09-01' },
    { name: 'السيد الجمال', rating: 5, comment: 'جودة الجودة العالية من قلب مصانع دسوق. أنصح بالتعامل مع هذا التاجر.', date: '2026-08-28' },
  ]);

  // Q&A list state
  const [qaList, setQaList] = useState<Array<{ q: string; a: string }>>([
    { q: 'هل المنتج أصلي وعالي الجودة؟', a: 'نعم، هذا المنتج أصلي وموثق من التجار والمصانع المعتمدة في سوق دسوق.' },
    { q: 'ما هي مدة التوصيل لباقي المحافظات؟', a: 'داخل دسوق خلال 24 ساعة، ولباقي المحافظات من 2 إلى 3 أيام عمل عبر شركات الشحن المعتمدة.' },
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  // Early return only after all hooks have been declared
  if (!selectedProduct) return null;

  const seller = sellers.find(s => s.id === selectedProduct.sellerId);
  const inWishlist = wishlist.includes(selectedProduct.id);
  const inCompare = compareList.some(p => p.id === selectedProduct.id);
  const currentPrice = selectedVariant ? selectedVariant.priceEGP : selectedProduct.priceEGP;

  const handleAddToCart = async () => {
    await addToCart(selectedProduct, selectedVariant, quantity);
    setIsCartOpen(true);
    showToast(`تمت إضافة الكمية (${quantity}) للسلة`);
  };

  const handleBuyNow = async () => {
    await addToCart(selectedProduct, selectedVariant, quantity);
    setIsCartOpen(true);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComment = sanitizeUserInput(newReviewComment);
    if (!cleanComment) {
      showToast('يرجى كتابة تقييم صالح خالي من الأكواد والرموز المشبوهة');
      return;
    }
    await rateProduct(selectedProduct.id, newReviewRating);
    setReviewsList([
      { name: 'زائر موثق', rating: newReviewRating, comment: cleanComment, date: new Date().toISOString().split('T')[0] },
      ...reviewsList
    ]);
    setNewReviewComment('');
    showToast('تمت إضافة تقييمك بنجاح');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuestion = sanitizeUserInput(newQuestion);
    if (!cleanQuestion) {
      showToast('يرجى كتابة سؤال واضح');
      return;
    }
    setQaList([
      { q: cleanQuestion, a: 'سيقوم التاجر أو فريق دعم سوق دسوق بالرد على استفسارك خلال ساعات.' },
      ...qaList
    ]);
    setNewQuestion('');
    showToast('تم إرسال سؤالك للتاجر بنجاح');
  };

  // Frequently bought together item
  const frequentlyBought = products.find(p => p.id !== selectedProduct.id && p.category === selectedProduct.category) || products[1];

  return (
    <FocusTrap
      isActive={Boolean(selectedProduct)}
      onClose={() => setSelectedProduct(null)}
      aria-label="تفاصيل المنتج"
      id="product-detail-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-[#800020]/20 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#800020]/10 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#800020] text-white px-3 py-1 rounded-full font-bold shadow-xs">
              {t('appName')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedProduct(null)}
            className="p-2 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:text-[#800020] dark:hover:text-white transition-colors cursor-pointer"
            aria-label="إغلاق تفاصيل المنتج"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Gallery Left */}
            <div className="space-y-3">
              <div 
                className="aspect-square w-full rounded-2xl overflow-hidden isolate select-none border border-[#800020]/20 dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800 relative shadow-md group/zoom cursor-zoom-in touch-none"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleImageMouseMove}
                onClick={handleOpenLightbox}
              >
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.titleAr}
                  draggable={false}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                  }}
                  className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-150 ease-out will-change-transform ${
                    isZoomed ? 'scale-220' : 'scale-100'
                  }`}
                />

                {/* Floating Zoom Action Button */}
                <button
                  type="button"
                  onClick={handleOpenLightbox}
                  className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-800/95 text-stone-800 dark:text-zinc-100 hover:bg-[#800020] hover:text-white p-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs font-bold border border-stone-200 dark:border-zinc-700 backdrop-blur-xs cursor-pointer z-10"
                  aria-label="تكبير كامل وفحص الخامات"
                >
                  <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden sm:inline">فحص الخامات 🔍</span>
                </button>

                {/* Hover Zoom Hint */}
                <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs pointer-events-none opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-center gap-1 z-10">
                  <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>حرّك الماوس للتكبير الموضعي أو انقر للفحص المكبر</span>
                </div>

                {selectedProduct.isFastDesoqDelivery && (
                  <span className="absolute bottom-3 right-3 bg-[#800020] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 pointer-events-none z-10">
                    <Truck className="w-3 h-3 text-[#D4AF37]" />
                    توصيل خلال 24 ساعة بدسوق
                  </span>
                )}
              </div>

              {/* Thumbnails Row */}
              {selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#800020] scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Actions Right */}
            <div className="space-y-5">
              
              {/* Seller Link & Title */}
              <div>
                {seller && (
                  <button
                    type="button"
                    onClick={() => { setSelectedProduct(null); openSellerProfile(seller.id); }}
                    className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{seller.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                )}

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-zinc-100 leading-snug">
                  {lang === 'en' ? selectedProduct.titleEn : selectedProduct.titleAr}
                </h1>

                {/* Interactive Star Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="flex items-center gap-1 cursor-pointer"
                    onMouseLeave={() => setModalHoverRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const userR = userRatings[selectedProduct.id];
                      const isFilled = modalHoverRating !== null
                        ? starVal <= modalHoverRating
                        : userR
                          ? starVal <= userR
                          : starVal <= Math.round(selectedProduct.rating);

                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => rateProduct(selectedProduct.id, starVal)}
                          onMouseEnter={() => setModalHoverRating(starVal)}
                          className="p-0.5 hover:scale-125 transition-transform duration-150 cursor-pointer"
                          aria-label={`تقييم المنتج بـ ${starVal} نجوم`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFilled
                                ? modalHoverRating !== null
                                  ? 'fill-amber-400 text-amber-500'
                                  : userR
                                    ? 'fill-[#800020] text-[#800020] dark:fill-[#D4AF37] dark:text-[#D4AF37]'
                                    : 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-gray-300 dark:text-zinc-600 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    {(selectedProduct.rating || 5.0).toFixed(1)} ({selectedProduct.reviewCount || 0} تقييم)
                  </span>
                  {userRatings[selectedProduct.id] && (
                    <span className="text-[10px] font-bold text-[#800020] dark:text-[#D4AF37] bg-[#FAF6EE] dark:bg-zinc-700/60 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                      تقييمك: {userRatings[selectedProduct.id]}★
                    </span>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-[#FAF7F2] dark:bg-zinc-800 rounded-2xl border border-[#800020]/10 dark:border-zinc-700 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#800020] dark:text-[#D4AF37]">
                      {(currentPrice ?? 0).toLocaleString()} {t('priceEGP')}
                    </span>
                    {selectedProduct.originalPriceEGP && selectedProduct.originalPriceEGP > (currentPrice ?? 0) && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          {(selectedProduct.originalPriceEGP ?? 0).toLocaleString()} ج.م
                        </span>
                        <span className="bg-[#800020] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                          وفرت {selectedProduct.originalPriceEGP - (currentPrice ?? 0)} ج.م ({Math.round(((selectedProduct.originalPriceEGP - (currentPrice ?? 0)) / selectedProduct.originalPriceEGP) * 100)}%)
                        </span>
                      </>
                    )}
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedProduct.stock > 0 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.stock > 0 ? t('inStock') : t('outOfStock')}
                  </span>
                </div>

                {/* Scarcity / Express Dispatch Notice */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  {selectedProduct.stock <= 5 && selectedProduct.stock > 0 && (
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-300/40">
                      <span>🔥</span>
                      <span>سارع بالطلب! متبقي {selectedProduct.stock} قطع فقط في مخزن التاجر</span>
                    </span>
                  )}
                  {selectedProduct.isFastDesoqDelivery && (
                    <span className="bg-[#800020]/10 dark:bg-zinc-700 text-[#800020] dark:text-[#D4AF37] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>شحن إكسبريس: توصيل خلال 24 ساعة بدسوق وكفر الشيخ</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Variants Selector & Size Guide Link */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? 'اختر الخيار/المقاس المفضل:' : 'المقاسات والأبعاد:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] font-bold text-xs border border-[#D4AF37]/40 hover:bg-[#800020] hover:text-white dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>دليل المقاسات التفاعلي 📏</span>
                  </button>
                </div>

                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#800020] text-white border-[#800020] shadow-sm ring-2 ring-[#D4AF37]/40 scale-102'
                            : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-[#800020]'
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className="opacity-80 font-mono text-[11px]">- {v.priceEGP} ج.م</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Real-time Inventory & Flash-Sale Reservation Lock Banner */}
                {inventoryStatus && (
                  <div className="mt-2">
                    {inventoryStatus.hasCompetitorHold ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs">
                        <Timer className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                        <div>
                          <span className="font-bold">تنبيه حجز نشط:</span> هذا المقاس محجوز مؤقتاً في سلة عميل آخر (ينتهي الحجز خلال دقائق إذا لم يُتم الدفع).
                        </div>
                      </div>
                    ) : inventoryStatus.availableNow === 0 ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-bold">نفد هذا المقاس مؤقتاً من المخازن.</span>
                      </div>
                    ) : inventoryStatus.isScarce ? (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-zinc-800 border border-[#D4AF37]/50 text-[#800020] dark:text-[#D4AF37] text-xs">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>
                            <strong className="font-bold">متبقي {inventoryStatus.availableNow} قطع فقط:</strong> حجز المقاس تلقائي ومضمون لمدة 10 دقائق عند الدفع.
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#800020] text-white text-[10px] font-bold shrink-0">
                          حماية سريعة ⚡
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">الكمية:</label>
                  <div className="flex items-center bg-[#F5F2ED] dark:bg-zinc-800 rounded-full border border-[#800020]/20 dark:border-zinc-700 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-[#800020] dark:text-zinc-100 font-bold flex items-center justify-center cursor-pointer hover:bg-[#800020] hover:text-white transition-colors active:scale-90"
                      aria-label="إنقاص الكمية"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-[#1A1A1A] dark:text-zinc-100">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-[#800020] dark:text-zinc-100 font-bold flex items-center justify-center cursor-pointer hover:bg-[#800020] hover:text-white transition-colors active:scale-90"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Instant Governorate Shipping Estimator */}
                {(() => {
                  const shippingInfo = getGovernorateShippingRate(selectedGovernorate);
                  const isFree = (currentPrice * quantity) >= 1000;
                  return (
                    <div className="p-3.5 bg-[#FAF6EE] dark:bg-zinc-800/90 rounded-2xl border border-[#D4AF37]/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          <span>حاسبة الشحن الفوري بحسب المحافظة:</span>
                        </span>
                        <select
                          value={selectedGovernorate}
                          onChange={(e) => setSelectedGovernorate(e.target.value as EgyptianGovernorate)}
                          className="bg-white dark:bg-zinc-700 text-stone-800 dark:text-zinc-100 px-2.5 py-1 rounded-lg text-xs font-bold border border-stone-300 dark:border-zinc-600 outline-none cursor-pointer"
                        >
                          {EGYPTIAN_GOVERNORATES.map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-200 dark:border-zinc-700">
                        <span className="text-stone-600 dark:text-zinc-300">
                          {shippingInfo.deliveryTimeAr}
                        </span>
                        <span className="font-black text-[#800020] dark:text-[#FAF6EE] bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-[#D4AF37]/40">
                          {isFree ? '🎉 شحن مجاني (أكثر من 1000 ج.م)' : `${shippingInfo.rate} ج.م`}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Primary CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-[#D4AF37]/40"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('addToCart')} (فتح السلة)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExpressOpen(true)}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#C59F2E] hover:to-[#A38320] text-[#141416] py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>شراء سريع فوري (1-Click)</span>
                  </button>
                </div>
              </div>

              {/* Guarantees List */}
              <div className="p-3.5 bg-[#FAF7F2] dark:bg-zinc-800/80 rounded-2xl space-y-2 border border-[#800020]/10 dark:border-zinc-700 text-xs text-gray-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0" />
                  <span>حق الإرجاع والاستبدال خلال 14 يوماً وفق قانون حماية المستهلك المصري رقم 181 لسنة 2018.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0" />
                  <span>معاينة وفحص الشحنة قبل الاستلام والدفع كاش أو عبر إنستاباي.</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Tabs Section */}
          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                }`}
              >
                {t('description')}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                }`}
              >
                {t('specifications')}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                }`}
              >
                {t('customerReviews')} ({reviewsList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qa')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'qa'
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'
                }`}
              >
                الأسئلة والأجوبة ({qaList.length})
              </button>
            </div>

            {/* Tab Panel Content */}
            <div className="pt-4 text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
              
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <p className="text-sm">{selectedProduct.descriptionAr}</p>
                  <p className="text-xs text-gray-500">{selectedProduct.titleEn} - High quality product directly guaranteed by our seller marketplace.</p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF7F2] dark:bg-zinc-800 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700">
                  <div className="flex justify-between border-b pb-1 dark:border-zinc-700">
                    <span className="font-bold text-gray-500">العلامة / الماركة:</span>
                    <span className="font-bold text-[#800020] dark:text-[#D4AF37]">{selectedProduct.attributes.brand || 'ماركة أصلية معتمدة'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 dark:border-zinc-700">
                    <span className="font-bold text-gray-500">بلد المنشأ:</span>
                    <span className="font-bold">{selectedProduct.attributes.origin || 'جمهورية مصر العربية'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 dark:border-zinc-700">
                    <span className="font-bold text-gray-500">الضمان:</span>
                    <span className="font-bold">{selectedProduct.attributes.warranty || 'ضمان 14 يوماً قانون 181'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 dark:border-zinc-700">
                    <span className="font-bold text-gray-500">حالة الشحن:</span>
                    <span className="font-bold">تغليف آمن ومحكم</span>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews list */}
                  <div className="space-y-3">
                    {reviewsList.map((rev, i) => (
                      <div key={i} className="p-3 bg-[#FAF7F2] dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1A1A1A] dark:text-zinc-100">{rev.name}</span>
                          <span className="text-[10px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, st) => (
                            <Star key={st} className={`w-3 h-3 ${st < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-zinc-300">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add review form */}
                  <form onSubmit={handleAddReview} className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-[#800020]/20 space-y-3">
                    <h4 className="font-bold text-xs text-[#800020] dark:text-[#D4AF37]">{t('writeReview')}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{t('ratingLabel')}:</span>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="bg-[#F5F2ED] dark:bg-zinc-700 p-1 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder={t('commentPlaceholder')}
                      className="w-full bg-[#F5F2ED] dark:bg-zinc-700 p-2.5 rounded-xl text-xs outline-none border border-gray-200 dark:border-zinc-600 dark:text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="bg-[#800020] text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-[#600018] cursor-pointer"
                    >
                      {t('submitReview')}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {qaList.map((qa, idx) => (
                      <div key={idx} className="p-3 bg-[#FAF7F2] dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 space-y-1">
                        <span className="font-bold text-[#800020] dark:text-[#D4AF37] block">س: {qa.q}</span>
                        <p className="text-xs text-gray-700 dark:text-zinc-300 pr-3 border-r-2 border-[#D4AF37]">ج: {qa.a}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddQuestion} className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="اطرح سؤالاً عن هذا المنتج على التاجر..."
                      className="flex-1 bg-[#F5F2ED] dark:bg-zinc-700 p-2.5 rounded-xl text-xs outline-none border border-gray-200 dark:border-zinc-600 dark:text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="bg-[#800020] text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#600018] cursor-pointer shrink-0"
                    >
                      إرسال السؤال
                    </button>
                  </form>
                </div>
              )}

            </div>

          </div>

          {/* Frequently Bought Together Recommendation Bundle */}
          {frequentlyBought && (() => {
            const currentItemPrice = currentPrice || 0;
            const companionPrice = frequentlyBought.priceEGP || 0;
            const rawBundleTotal = currentItemPrice + companionPrice;
            const bundleDiscount = Math.round(rawBundleTotal * 0.10);
            const bundleFinalPrice = rawBundleTotal - bundleDiscount;

            const handleAddBundleToCart = async () => {
              await addToCart(selectedProduct, selectedVariant, 1);
              await addToCart(frequentlyBought, undefined, 1);
              setIsCartOpen(true);
              showToast(`🎉 تم إضافة الطقم كاملاً للسلة بخصم ${bundleDiscount} ج.م`);
            };

            return (
              <div className="p-4 bg-gradient-to-br from-[#FAF6EE] to-[#F5EFE1] dark:from-zinc-800/90 dark:to-zinc-900 rounded-3xl border border-[#D4AF37]/50 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#800020] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>تجميعة المظهر الكامل (اشترِ معاً ووفر 10%)</span>
                  </h4>
                  <span className="bg-[#800020] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                    وفّر {bundleDiscount} ج.م
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Items Preview */}
                  <div className="md:col-span-7 flex items-center gap-2">
                    {/* Item 1 */}
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 rounded-2xl border border-stone-200 dark:border-zinc-700 flex-1 min-w-0 shadow-2xs">
                      <img 
                        src={selectedProduct.images[0]} 
                        alt="" 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100 dark:border-zinc-700" 
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-500 block font-bold">المنتج الحالي</span>
                        <h6 className="text-[11px] font-bold text-stone-800 dark:text-zinc-100 truncate">{selectedProduct.titleAr}</h6>
                        <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37]">{currentItemPrice} ج.م</span>
                      </div>
                    </div>

                    <span className="text-stone-400 dark:text-zinc-500 font-black text-sm shrink-0">+</span>

                    {/* Item 2 */}
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 rounded-2xl border border-stone-200 dark:border-zinc-700 flex-1 min-w-0 shadow-2xs">
                      <img 
                        src={frequentlyBought.images[0]} 
                        alt="" 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100 dark:border-zinc-700" 
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-stone-500 block font-bold">مُكمل الطقم</span>
                        <h6 className="text-[11px] font-bold text-stone-800 dark:text-zinc-100 truncate">{frequentlyBought.titleAr}</h6>
                        <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37]">{companionPrice} ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* Bundle Action */}
                  <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col items-center justify-between gap-2 bg-white/70 dark:bg-zinc-800/60 p-3 rounded-2xl border border-[#D4AF37]/30">
                    <div className="text-center sm:text-right md:text-center w-full">
                      <div className="flex items-baseline justify-center sm:justify-start md:justify-center gap-2">
                        <span className="text-sm font-black text-[#800020] dark:text-[#D4AF37]">
                          {bundleFinalPrice.toLocaleString()} ج.م
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          {rawBundleTotal.toLocaleString()} ج.م
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                        توفير فوري 10% عند إضافة المنتجين
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBundleToCart}
                      className="w-full bg-[#800020] hover:bg-[#600018] text-white text-xs font-black py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-[#D4AF37]/40"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>إضافة الطقم كاملاً للسلة</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Sticky Mobile Add-to-Cart / Fast Checkout Bar (sm:hidden) */}
        <div className="sm:hidden border-t border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 px-4 flex items-center justify-between gap-3 shrink-0 shadow-lg z-10">
          <div>
            <span className="text-[10px] text-stone-500 dark:text-zinc-400 block font-medium">
              الإجمالي ({quantity} قطع):
            </span>
            <span className="text-sm font-black text-[#800020] dark:text-[#D4AF37]">
              {((currentPrice ?? 0) * quantity).toLocaleString()} ج.م
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs font-bold border border-stone-300 dark:border-zinc-700 flex items-center gap-1 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#800020]" />
              <span>السلة</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpressOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#141416] text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>شراء فوري</span>
            </button>
          </div>
        </div>

      </div>

      {/* Express 1-Click Fast Checkout Modal */}
      <Express1ClickCheckoutModal
        isOpen={isExpressOpen}
        onClose={() => setIsExpressOpen(false)}
        product={selectedProduct}
        variant={selectedVariant}
        initialQuantity={quantity}
      />

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productTitle={selectedProduct.titleAr}
        category={selectedProduct.category}
      />

      {/* Fullscreen Fabric Texture Lightbox Modal with Pinch-to-zoom and Touch Gestures */}
      {isFullZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 select-none touch-none animate-in fade-in duration-200"
          onClick={() => setIsFullZoomOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full h-[92vh] bg-zinc-950 rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl flex flex-col justify-between p-3 sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={1}
              maxScale={6}
              centerOnInit={true}
              limitToBounds={true}
              panning={{ velocityDisabled: false }}
              pinch={{ step: 5 }}
              wheel={{ step: 0.2 }}
              doubleClick={{ mode: 'toggle', step: 2 }}
              onTransform={(_, state) => {
                setLightboxScale(Number(state.scale.toFixed(2)));
              }}
            >
              {({ zoomIn, zoomOut, resetTransform, setTransform }) => (
                <div className="flex flex-col h-full justify-between gap-2">
                  {/* Header Controls */}
                  <div className="flex items-center justify-between text-white border-b border-zinc-800/80 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-bold shadow-sm">
                        🔍
                      </div>
                      <div>
                        <h4 className="font-serif font-black text-sm text-[#FAF6EE] flex items-center gap-2">
                          <span>معاينة فحص الأقمشة والتطريز</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#800020]/60 text-[#D4AF37] border border-[#D4AF37]/30">
                            {Math.round(lightboxScale * 100)}%
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-400">
                          {selectedProduct.titleAr}
                        </p>
                      </div>
                    </div>

                    {/* Central Zoom Tool Buttons */}
                    <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => zoomOut(0.4)}
                        disabled={lightboxScale <= 1}
                        className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="تصغير"
                        aria-label="تصغير"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1 px-1">
                        {[1, 2, 3.5].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setTransform(0, 0, preset);
                            }}
                            className={`text-[11px] px-2 py-0.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                              Math.abs(lightboxScale - preset) < 0.2
                                ? 'bg-[#800020] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-zinc-800'
                            }`}
                          >
                            {preset}x
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => zoomIn(0.4)}
                        disabled={lightboxScale >= 6}
                        className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="تكبير"
                        aria-label="تكبير"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <div className="w-px h-4 bg-zinc-800 mx-0.5" />

                      <button
                        type="button"
                        onClick={() => resetTransform()}
                        className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="إعادة ضبط الموضع والحجم"
                        aria-label="إعادة ضبط"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsFullZoomOpen(false)}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="إغلاق معاينة الزوم"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* High-Res Image Isolated Stage with Native Touch Pinch-to-Zoom */}
                  <div className="flex-1 w-full overflow-hidden relative flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-zinc-800/80 my-2 touch-none">
                    <TransformComponent
                      wrapperClass="!w-full !h-full !flex !items-center !justify-center"
                      contentClass="!w-full !h-full !flex !items-center !justify-center"
                    >
                      <img
                        src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                        alt={selectedProduct.titleAr}
                        draggable={false}
                        className="max-w-[85vw] max-h-[60vh] object-contain select-none pointer-events-none drop-shadow-2xl will-change-transform"
                      />
                    </TransformComponent>

                    {/* Image Navigation Arrows */}
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedProduct.images.length - 1));
                            resetTransform();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#800020] text-white flex items-center justify-center border border-white/10 backdrop-blur-xs transition-colors cursor-pointer z-10"
                          aria-label="الصورة السابقة"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev < selectedProduct.images.length - 1 ? prev + 1 : 0));
                            resetTransform();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#800020] text-white flex items-center justify-center border border-white/10 backdrop-blur-xs transition-colors cursor-pointer z-10"
                          aria-label="الصورة التالية"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Footer Guidance & Thumbnails Strip */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-300 bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-800 shrink-0">
                    {/* Thumbnails Row */}
                    {selectedProduct.images.length > 1 ? (
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs">
                        {selectedProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setActiveImageIndex(idx);
                              resetTransform();
                            }}
                            className={`w-10 h-10 rounded-lg border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${
                              activeImageIndex === idx 
                                ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' 
                                : 'border-zinc-700 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover pointer-events-none" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>إيماءة ضم وقرص الإصبعين (Pinch-to-zoom) للتكبير باللمس | السحب للتنقل</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFullZoomOpen(false)}
                      className="px-4 py-1.5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      إغلاق الفحص
                    </button>
                  </div>
                </div>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </FocusTrap>
  );
};
