import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Truck, 
  Phone, 
  ShoppingBag, 
  Heart, 
  Scale, 
  Search, 
  CheckCircle2, 
  Clock, 
  Share2, 
  MessageSquare, 
  Building2, 
  FileText, 
  Check, 
  Filter, 
  ArrowUpDown,
  Store,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product } from '../../types';

export const SellerProfileView: React.FC = () => {
  const {
    selectedSellerProfileId,
    sellers,
    products,
    categories,
    addToCart,
    wishlist,
    toggleWishlist,
    compareList,
    addToCompare,
    setSelectedProduct,
    setActiveView,
    showToast,
    activeSeller,
    setSellerActiveTab
  } = useMarketplace();

  // Find seller: fallback to activeSeller if profile ID matches or is empty
  const seller = (selectedSellerProfileId ? sellers.find(s => s.id === selectedSellerProfileId) : activeSeller) || activeSeller || sellers[0];

  const isOwner = Boolean(activeSeller && activeSeller.id === seller.id);
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Local state for searching & filtering inside this seller's profile
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<string | null>(null);
  const [onlyDesoqLocal, setOnlyDesoqLocal] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price_asc' | 'price_desc'>('featured');
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');

  // Review submission state for this seller
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('دسوق');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [customReviews, setCustomReviews] = useState<Array<{
    id: string;
    author: string;
    city: string;
    rating: number;
    date: string;
    comment: string;
  }>>([
    {
      id: 'rev-1',
      author: 'محمود عبد السلام',
      city: 'دسوق (شارع الجيش)',
      rating: 5,
      date: 'منذ يومين',
      comment: 'تاجر محترم جداً، الأقمشة وصلت بجودة ممتازة ومطابقة للمواصفات المعروضة. التوصيل كان في نفس اليوم داخل دسوق.'
    },
    {
      id: 'rev-2',
      author: 'أميرة الشناوي',
      city: 'كفر الشيخ',
      rating: 5,
      date: 'منذ 5 أيام',
      comment: 'التعامل راقي جداً والتغليف متقن ومحكم. سعدت جداً بوجود فاتورة رسمية وضمان استرجاع.'
    },
    {
      id: 'rev-3',
      author: 'إبراهيم غازي',
      city: 'فوه',
      rating: 4.8,
      date: 'منذ أسبوع',
      comment: 'سعر منافس وأرخص من المحلات الخارجية، مندوب التوصيل كان متعاون ومحترم.'
    }
  ]);

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-16 h-16 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-[#1A1A1A]">لم يتم العثور على المتجر المطلوب</h2>
        <p className="text-xs text-gray-500">قد يكون الرابط غير صحيح أو تم تعديل بيانات البائع.</p>
        <button
          onClick={() => setActiveView('catalog')}
          className="bg-[#800020] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#600018] transition-colors"
        >
          العودة للكتالوج
        </button>
      </div>
    );
  }

  // All products belonging to this seller
  const sellerProducts = products.filter(p => p.sellerId === seller.id);

  // Filtered products by search & category
  const filteredProducts = sellerProducts.filter(product => {
    if (storeSearchQuery.trim()) {
      const q = storeSearchQuery.toLowerCase().trim();
      const matchTitle = product.titleAr.toLowerCase().includes(q) || product.titleEn.toLowerCase().includes(q);
      const matchDesc = product.descriptionAr.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (selectedStoreCategory && product.category !== selectedStoreCategory) {
      return false;
    }

    if (onlyDesoqLocal && !product.isDesoqLocalMade) {
      return false;
    }

    return true;
  });

  // Sorted products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.priceEGP - b.priceEGP;
    if (sortBy === 'price_desc') return b.priceEGP - a.priceEGP;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // Get distinct categories in this seller's products
  const sellerCategoryIds = Array.from(new Set(sellerProducts.map(p => p.category)));
  const sellerCategories = categories.filter(c => sellerCategoryIds.includes(c.id));

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`تم نسخ رابط متجر ${seller.name} بنجاح!`);
    } else {
      showToast(`متجر ${seller.name} في سوق دسوق`);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      city: newReviewCity.trim() || 'دسوق',
      rating: newReviewRating,
      date: 'الآن',
      comment: newReviewComment.trim()
    };

    setCustomReviews([newRev, ...customReviews]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    showToast('شكراً لمشاركتك! تم إضافة تقييمك لمتجر التاجر بنجاح.');
  };

  return (
    <div id="seller-profile-view" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fadeIn">
      
      {/* OWNER CONTROL BANNER */}
      {isOwner && (
        <div className="bg-gradient-to-r from-[#800020] via-[#5c0017] to-[#800020] text-white p-4 sm:p-5 rounded-3xl shadow-lg border-2 border-[#D4AF37]/60 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#800020] flex items-center justify-center font-bold shadow-md shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#FAF6EE]">
                  الواجهة الرسمية المعتمدة لمتجرك على سوق دسوق
                </h2>
                <span className="bg-[#D4AF37] text-[#800020] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  أنت المالك
                </span>
              </div>
              <p className="text-xs text-[#FAF6EE]/80 mt-0.5">
                هذه هي صفحة متجرك الرسمية بصورك ومنتجاتك وأسعارك كما تظهر لجميع زوار وعملاء دسوق ومحافظة كفر الشيخ.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setSellerActiveTab?.('settings');
                setActiveView('seller_dashboard');
              }}
              className="bg-white/10 hover:bg-white/20 text-[#FAF6EE] text-xs font-bold px-4 py-2 rounded-xl border border-white/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>تعديل بيانات وصور المتجر</span>
            </button>
            <button
              onClick={() => {
                setSellerActiveTab?.('products');
                setActiveView('seller_dashboard');
              }}
              className="bg-[#D4AF37] hover:bg-[#bfa035] text-[#800020] text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>العودة للوحة تحكم التاجر</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumbs & Back Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#800020]/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button 
            onClick={() => setActiveView('catalog')}
            className="hover:text-[#800020] font-semibold transition-colors"
          >
            الرئيسية
          </button>
          <span>/</span>
          <span className="text-gray-400">متاجر دسوق المعتمدة</span>
          <span>/</span>
          <span className="font-bold text-[#800020]">{seller.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              onClick={() => setActiveView('seller_dashboard')}
              className="flex items-center gap-1.5 text-xs text-[#800020] bg-[#D4AF37] hover:bg-[#bfa035] px-3.5 py-1.5 rounded-full font-black transition-colors shadow-xs cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>لوحة التاجر</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#800020] bg-white border border-[#800020]/10 px-3.5 py-1.5 rounded-full font-medium transition-colors shadow-xs cursor-pointer"
            title="مشاركة رابط المتجر"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة المتجر</span>
          </button>

          <button
            onClick={() => setActiveView('catalog')}
            className="flex items-center gap-1.5 text-xs text-white bg-[#800020] hover:bg-[#600018] px-4 py-1.5 rounded-full font-bold transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة للكتالوج</span>
          </button>
        </div>
      </div>

      {/* Vendor Hero & Store Header Card */}
      <div className="bg-white rounded-3xl border border-[#800020]/10 overflow-hidden shadow-md">
        
        {/* Banner Cover with subtle overlay */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-[#800020]">
          {seller.banner && !bannerError ? (
            <img
              src={seller.banner}
              alt={seller.name}
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#800020] via-[#5c0017] to-[#800020] flex items-center justify-center">
              <span className="text-white/20 font-serif font-bold text-5xl sm:text-6xl select-none">{seller.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Top badges inside banner */}
          <div className="absolute top-4 right-4 flex flex-wrap gap-2">
            <span className="bg-[#800020]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/20">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{seller.city}، {seller.governorate}</span>
            </span>
            <span className="bg-[#D4AF37] text-[#800020] text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تاجر معتمد وموثق 🇪🇬</span>
            </span>
          </div>

          {/* Quick Contact Badge in Banner */}
          <div className="absolute top-4 left-4 hidden sm:flex items-center gap-2">
            <a
              href={`https://wa.me/20${seller.phone.substring(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 hover:bg-white text-[#1A1A1A] text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-green-600" />
              <span>تواصل واتساب: {seller.phone}</span>
            </a>
          </div>
        </div>

        {/* Store Profile Info & Metrics Bar */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          
          {/* Main Info Row with Avatar Floating */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar / Logo with robust fallback */}
              <div className="relative">
                {seller.logo && !logoError ? (
                  <img
                    src={seller.logo}
                    alt={seller.name}
                    onError={() => setLogoError(true)}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#800020] text-[#D4AF37] border-4 border-white shadow-xl flex items-center justify-center font-serif font-bold text-4xl">
                    {seller.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-[#800020] p-1.5 rounded-full shadow-md">
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Title & Owner */}
              <div className="space-y-1 text-right">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A]">
                    {seller.name}
                  </h1>
                </div>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#800020]" />
                  <span>بإشراف التاجر: <strong>{seller.ownerName}</strong></span>
                  <span className="text-gray-300">•</span>
                  <span>عضو منذ {seller.joinedDate}</span>
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#800020] shrink-0" />
                  <span>{seller.address}</span>
                </p>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex flex-wrap items-center gap-3 bg-[#F5F2ED] p-3 rounded-2xl border border-[#800020]/10 shrink-0">
              <div className="text-center px-3 border-l border-gray-200">
                <div className="flex items-center justify-center gap-1 text-[#D4AF37] font-bold text-base">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{seller.rating}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">({seller.reviewCount} تقييم مشترٍ)</span>
              </div>
              <div className="text-center px-3 border-l border-gray-200">
                <span className="text-base font-serif font-bold text-[#800020]">{sellerProducts.length}</span>
                <span className="text-[10px] text-gray-500 block font-medium">منتج معروض</span>
              </div>
              <div className="text-center px-3">
                <span className="text-base font-serif font-bold text-green-700">100%</span>
                <span className="text-[10px] text-gray-500 block font-medium">تسليم مضمون</span>
              </div>
            </div>

          </div>

          {/* Egyptian Commercial & Legal Compliance Strip (Law 181/2018) */}
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#800020]/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#800020]" />
                <span>السجل التجاري: <strong>{seller.commercialRecordNumber}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#800020]" />
                <span>البطاقة الضريبية: <strong>{seller.taxRegistrationNumber}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-700" />
                <span>شحن محلي دسوق: <strong>20 ج.م فقط (24 ساعة)</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#800020] font-bold bg-[#800020]/10 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#800020]" />
              <span>خاضع لقانون حماية المستهلك المصري (181/2018)</span>
            </div>
          </div>

          {/* Navigation Tabs (Products / Reviews / About) */}
          <div className="flex items-center gap-2 pt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'products'
                  ? 'border-[#800020] text-[#800020]'
                  : 'border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>كتالوج المنتجات المعروضة ({sellerProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'reviews'
                  ? 'border-[#800020] text-[#800020]'
                  : 'border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>تقييمات وآراء العملاء ({customReviews.length + seller.reviewCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'about'
                  ? 'border-[#800020] text-[#800020]'
                  : 'border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>عن المتجر وسياسات الضمان</span>
            </button>
          </div>

        </div>
      </div>

      {/* TAB 1: Current Product Listings */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          
          {/* Controls Bar: In-Store Search, Category Pills, Sorting */}
          <div className="bg-white p-5 rounded-2xl border border-[#800020]/10 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* In-store Search */}
              <div className="w-full md:w-80 relative">
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  placeholder={`ابحث داخل متجر ${seller.name}...`}
                  className="w-full text-xs bg-[#F5F2ED] border border-transparent rounded-full pr-9 pl-4 py-2.5 outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-[#1A1A1A]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Local filter and sorting */}
              <div className="w-full md:w-auto flex flex-wrap items-center justify-between md:justify-end gap-3">
                <button
                  onClick={() => setOnlyDesoqLocal(!onlyDesoqLocal)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 border ${
                    onlyDesoqLocal
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#800020]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>عروض حصرية</span>
                </button>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs bg-[#F5F2ED] font-bold text-[#1A1A1A] rounded-full px-3 py-1.5 border-none outline-none cursor-pointer focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="featured">المميز والأكثر طلباً</option>
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="price_asc">السعر: من الأقل للأعلى</option>
                    <option value="price_desc">السعر: من الأعلى للأقل</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Category Sub-Filters */}
            {sellerCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 ml-1">الأقسام:</span>
                <button
                  onClick={() => setSelectedStoreCategory(null)}
                  className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                    selectedStoreCategory === null
                      ? 'bg-[#800020] text-white shadow-xs'
                      : 'bg-[#F5F2ED] text-gray-600 hover:text-black'
                  }`}
                >
                  جميع المعروضات ({sellerProducts.length})
                </button>

                {sellerCategories.map((cat) => {
                  const count = sellerProducts.filter(p => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedStoreCategory(cat.id)}
                      className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                        selectedStoreCategory === cat.id
                          ? 'bg-[#800020] text-white shadow-xs'
                          : 'bg-[#F5F2ED] text-gray-600 hover:text-black'
                      }`}
                    >
                      {cat.nameAr} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#800020]/10 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F5F2ED] text-[#800020] flex items-center justify-center mx-auto text-xl font-bold">
                🔍
              </div>
              <h3 className="font-bold text-base text-[#1A1A1A]">لا توجد منتجات مطابقة للبحث في هذا المتجر</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                جرب تغيير كلمات البحث أو إلغاء فلاتر الأقسام لعرض كافة بضائع التاجر.
              </p>
              <button
                onClick={() => {
                  setStoreSearchQuery('');
                  setSelectedStoreCategory(null);
                  setOnlyDesoqLocal(false);
                }}
                className="bg-[#800020] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-[#600018] transition-colors"
              >
                إعادة ضبط البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {sortedProducts.map((product) => {
                const inWishlist = wishlist.includes(product.id);
                const inCompare = compareList.some(p => p.id === product.id);

                return (
                  <div
                    key={product.id}
                    id={`seller-product-card-${product.id}`}
                    className="group bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl border border-[#800020]/10 dark:border-zinc-700 hover:border-[#D4AF37] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Image Section */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#F5F2ED] dark:bg-zinc-900">
                      <img
                        src={product.images[0]}
                        alt={product.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {product.originalPriceEGP && product.originalPriceEGP > product.priceEGP && (
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#D4AF37] text-[#800020] text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                          خصم {Math.round(((product.originalPriceEGP - product.priceEGP) / product.originalPriceEGP) * 100)}%
                        </span>
                      )}

                      {/* Wishlist & Compare Floating Buttons */}
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md shadow-xs flex items-center justify-center transition-colors ${
                            inWishlist ? 'bg-[#800020] text-white' : 'bg-white/95 text-gray-700 hover:text-[#800020]'
                          }`}
                          title="حفظ بالمفضلة"
                        >
                          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md shadow-xs flex items-center justify-center transition-colors ${
                            inCompare ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'bg-white/95 text-gray-700 hover:text-[#1A1A1A]'
                          }`}
                          title="مقارنة المنتج"
                        >
                          <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        
                        {/* Title */}
                        <h3 
                          onClick={() => setSelectedProduct(product)}
                          className="font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-zinc-100 hover:text-[#800020] cursor-pointer line-clamp-2 leading-tight"
                        >
                          {product.titleAr}
                        </h3>

                        {/* Rating & Stock */}
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs pt-0.5">
                          <div className="flex items-center gap-1 text-[#D4AF37] font-bold">
                            <Star className="w-3 h-3 fill-[#D4AF37]" />
                            <span>{product.rating}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                          
                          <span className="text-[9px] sm:text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-semibold mr-auto">
                            متوفر ({product.stock})
                          </span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-2 border-t border-[#F5F2ED] dark:border-zinc-700 flex items-center justify-between gap-1">
                        <div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xs sm:text-base font-serif font-bold text-[#800020] dark:text-[#D4AF37]">{product.priceEGP}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">ج.م</span>
                          </div>
                          {product.originalPriceEGP && (
                            <div className="text-[9px] sm:text-[10px] text-gray-400 line-through -mt-0.5">
                              {product.originalPriceEGP} ج.م
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              addToCart(product, product.variants?.[0], 1);
                              showToast(`تمت إضافة "${product.titleAr}" إلى سلة التسوق`);
                            }}
                            className="bg-[#800020] hover:bg-[#600018] text-white px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-bold"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />
                            <span>شراء</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: Customer Reviews & Ratings */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          
          {/* Summary Ratings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Overall Score */}
            <div className="bg-white p-6 rounded-3xl border border-[#800020]/10 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-5xl font-serif font-black text-[#800020]">{seller.rating}</span>
              <div className="flex items-center gap-1 text-[#D4AF37] text-lg">
                ★★★★★
              </div>
              <p className="text-xs text-gray-500 font-medium">
                بناءً على {seller.reviewCount + customReviews.length} تقييم مشترٍ موثق
              </p>
              <span className="text-[11px] bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold">
                99.1% تجارب شراء إيجابية
              </span>
            </div>

            {/* Performance Indicators */}
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-[#800020]/10 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                مؤشرات الأداء التجاري للتاجر في سوق دسوق
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F5F2ED] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-700">سرعة تجهيز وتسليم الطرود:</span>
                    <span className="text-[#800020]">أقل من 24 ساعة</span>
                  </div>
                  <p className="text-[11px] text-gray-500">تسليم فوري لسيارات دسوق إكسبريس</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F2ED] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-700">دقة مطابقة المنتجات للصور:</span>
                    <span className="text-green-700">99.4%</span>
                  </div>
                  <p className="text-[11px] text-gray-500">مواصفات وخامات قطنية وغذائية أصلية</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F2ED] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-700">الاستجابة لشكاوى واستفسارات العملاء:</span>
                    <span className="text-[#800020]">فورية (خلال ساعتين)</span>
                  </div>
                  <p className="text-[11px] text-gray-500">متابعة مستمرة مع فريق حماية المستهلك</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F2ED] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-700">التوافق مع القانون 181/2018:</span>
                    <span className="text-green-700">امتثال كامل 100%</span>
                  </div>
                  <p className="text-[11px] text-gray-500">استرجاع واستبدال مجاني للمنتجات المعيبة</p>
                </div>
              </div>
            </div>

          </div>

          {/* Add Review Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#800020]/10 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#800020]" />
              أضف تقييمك وتجربتك مع {seller.name}
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم المشتري:</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="مثال: أحمد الدسوقي"
                    className="w-full text-xs bg-[#F5F2ED] border border-transparent rounded-full px-4 py-2.5 outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المدينة / الحي:</label>
                  <input
                    type="text"
                    value={newReviewCity}
                    onChange={(e) => setNewReviewCity(e.target.value)}
                    placeholder="مثال: دسوق (الميدان الإبراهيمي)"
                    className="w-full text-xs bg-[#F5F2ED] border border-transparent rounded-full px-4 py-2.5 outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التقييم:</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className={`text-xl ${star <= newReviewRating ? 'text-[#D4AF37]' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-600 mr-2">{newReviewRating} من 5</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رأيك بالتفصيل:</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="اكتب ملاحظاتك عن جودة السلع وسرعة تسليم الشحنة والتغليف..."
                  className="w-full text-xs bg-[#F5F2ED] border border-transparent rounded-2xl p-4 outline-none focus:border-[#D4AF37] focus:bg-white leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold px-7 py-2.5 rounded-full transition-colors shadow-xs"
              >
                نشر التقييم في صفحة التاجر
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
              آخر آراء المشترين الموثقة في سوق دسوق
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customReviews.map((rev) => (
                <div 
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white border border-[#800020]/10 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#1A1A1A]">{rev.author}</span>
                      <span className="text-[11px] text-gray-400 mr-2">• {rev.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold">
                      {'★'.repeat(Math.round(rev.rating))}
                      <span className="text-gray-400 text-[10px] mr-1">{rev.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <span className="text-green-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      عملية شراء مؤكدة وموثقة
                    </span>
                    <span className="text-gray-400">سوق دسوق 🇪🇬</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: About Store & Compliance */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#800020]/10 shadow-xs space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#800020] flex items-center gap-2">
                <Store className="w-5 h-5" />
                نبذة عن متجر {seller.name}
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                يعد متجر <strong>{seller.name}</strong> من المتاجر المحلية المعتمدة في مركز دسوق ومحافظة كفر الشيخ، المتخصص في تقديم أفضل المنتجات والبضائع التراثية والحديثة ذات الجودة العالية، مع الالتزام التام بالمعايير القياسية المصرية والشفافية التامة في تسعير المنتجات.
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                تخضع كافة معروضات المتجر للمراجعة والرقابة من إدارة سوق دسوق، وتستفيد من خدمات الشحن المحلي الموحد والتسليم السريع للطرود حتى باب المنزل في مختلف مراكز كفر الشيخ ومحافظات الدلتا والقاهرة والإسكندرية.
              </p>
            </div>

            {/* Consumer Protection Law Policies */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#800020]/10 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-700" />
                سياسات الاستبدال والاسترجاع (قانون حماية المستهلك 181/2018)
              </h3>
              
              <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                  <span><strong>حق الاسترجاع خلال 14 يوماً:</strong> يحق للمشتري استرجاع أو استبدال أي سلعة معيبة أو غير مطابقة للوصف خلال 14 يوماً من تاريخ الاستلام مع استرداد كامل المبلغ.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                  <span><strong>الفاتورة الرسمية:</strong> تصدر فاتورة شراء معتمدة تتضمن رقم السجل التجاري والبطاقة الضريبية للتاجر.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                  <span><strong>فض النزاعات المحايد:</strong> في حال نشوء أي خلاف بين العميل والتاجر، تتدخل منصة سوق دسوق للفصل الفوري وفق القوانين المنظمة.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Location & Contact Info */}
          <div className="space-y-6">
            <div className="bg-[#F5F2ED] p-6 rounded-3xl border border-[#800020]/10 space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#800020]" />
                مقر المتجر والتواصل المباشر
              </h3>

              <div className="space-y-3 text-xs text-gray-700">
                <div>
                  <span className="text-gray-400 block text-[10px]">العنوان بالتفصيل:</span>
                  <p className="font-semibold mt-0.5">{seller.address}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">المحافظة والمركز:</span>
                  <p className="font-semibold mt-0.5">{seller.city}، {seller.governorate}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">رقم هاتف المتجر:</span>
                  <p className="font-semibold mt-0.5">{seller.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">ساعات العمل:</span>
                  <p className="font-semibold mt-0.5">يومياً من 9:00 صباحاً حتى 11:00 مساءً</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/20${seller.phone.substring(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>مراسلة المتجر عبر واتساب</span>
                </a>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-white p-5 rounded-2xl border border-[#800020]/10 text-center space-y-2">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">سوق دسوق</span>
              <p className="text-xs text-gray-600 font-medium">
                شراء مباشر من التاجر مع شحن محلي سريع وضمان موثق.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
