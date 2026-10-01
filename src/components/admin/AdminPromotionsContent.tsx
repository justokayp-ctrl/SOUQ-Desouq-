import React, { useState } from 'react';
import { 
  Tag, 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar, 
  Percent, 
  Check, 
  X, 
  AlertTriangle, 
  Send,
  Eye,
  Sliders,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AdminCoupon, AdminAnnouncement, HeroSlide } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';
import { useMarketplace } from '../../context/MarketplaceContext';

interface AdminPromotionsContentProps {
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminPromotionsContent: React.FC<AdminPromotionsContentProps> = ({
  onRequestConfirmation,
  showToast,
}) => {
  const {
    coupons,
    createCoupon,
    deleteCoupon,
    announcements,
    createAnnouncement,
    deleteAnnouncement,
    heroSlides,
    createHeroSlide,
    deleteHeroSlide,
    user
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'coupons' | 'announcements' | 'hero_banners'>('coupons');

  // New Coupon Modal State
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed_egp'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(250);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState(100);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // New Announcement Modal State
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnncTitle, setNewAnncTitle] = useState('');
  const [newAnncContent, setNewAnncContent] = useState('');
  const [newAnncType, setNewAnncType] = useState<'info' | 'warning' | 'promotion' | 'emergency'>('promotion');
  const [newAnncPlacement, setNewAnncPlacement] = useState<'top_banner' | 'modal' | 'toast' | 'all'>('top_banner');
  const [newAnncActionLink, setNewAnncActionLink] = useState('');

  // New Hero Slide Modal State
  const [isCreatingHeroSlide, setIsCreatingHeroSlide] = useState(false);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideDesc, setNewSlideDesc] = useState('');
  const [newSlideTag, setNewSlideTag] = useState('');
  const [newSlideCtaText, setNewSlideCtaText] = useState('تسوق الآن');
  const [newSlideCategory, setNewSlideCategory] = useState('men_fashion');
  const [newSlideBadge, setNewSlideBadge] = useState('عرض خاص');
  const [newSlideImage, setNewSlideImage] = useState('https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200');
  const [newSlideGradient, setNewSlideGradient] = useState('from-[#800020] via-[#5C0017] to-[#141416]');

  // Handle Create Coupon
  const handleSaveCoupon = async () => {
    if (!newCouponCode.trim()) {
      showToast('يرجى إدخال كود القسيمة');
      return;
    }

    try {
      await createCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType,
        discountValue: Number(newCouponVal),
        minOrderValueEGP: Number(newCouponMinOrder),
        maxDiscountEGP: newCouponType === 'percentage' ? Number(newCouponMaxDiscount) : undefined,
        usageLimit: 1000,
        status: 'active',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '2026-12-31',
        descriptionAr: newCouponDesc || 'قسيمة خصم ترويجية لأهالي دسوق'
      });
      setIsCreatingCoupon(false);
      setNewCouponCode('');
      setNewCouponDesc('');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الكوبون');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = (id: string, code: string) => {
    onRequestConfirmation({
      isOpen: true,
      title: 'حذف قسيمة ترويجية',
      message: `هل أنت متأكد من حذف قسيمة الخصم (${code}) نهائياً من قاعدة البيانات؟`,
      severity: 'danger',
      requiredRole: ['admin'],
      onConfirm: async () => {
        await deleteCoupon(id);
      }
    });
  };

  // Handle Create Announcement
  const handleSaveAnnouncement = async () => {
    if (!newAnncTitle.trim() || !newAnncContent.trim()) {
      showToast('يرجى إدخال عنوان الإعلان وتفاصيله');
      return;
    }

    try {
      await createAnnouncement({
        titleAr: newAnncTitle.trim(),
        contentAr: newAnncContent.trim(),
        type: newAnncType,
        placement: newAnncPlacement,
        actionLink: newAnncActionLink.trim() || undefined,
        isActive: true,
        authorName: user?.fullName || 'إدارة منصة سوق دسوق'
      });
      setIsCreatingAnnouncement(false);
      setNewAnncTitle('');
      setNewAnncContent('');
      setNewAnncActionLink('');
    } catch (err: any) {
      showToast(err.message || 'فشل نشر الإعلان');
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string, title: string) => {
    onRequestConfirmation({
      isOpen: true,
      title: 'حذف الإعلان العام',
      message: `هل أنت متأكد من حذف الإعلان "${title}" نهائياً من الواجهة؟`,
      severity: 'danger',
      requiredRole: ['admin'],
      onConfirm: async () => {
        await deleteAnnouncement(id);
      }
    });
  };

  // Handle Create Hero Slide
  const handleSaveHeroSlide = async () => {
    if (!newSlideTitle.trim() || !newSlideDesc.trim()) {
      showToast('يرجى كتابة عنوان الشريحة ووصفها');
      return;
    }

    try {
      await createHeroSlide({
        title: newSlideTitle.trim(),
        desc: newSlideDesc.trim(),
        tag: newSlideTag.trim() || 'عرض جديد',
        ctaText: newSlideCtaText.trim() || 'تسوق الآن',
        category: newSlideCategory,
        badge: newSlideBadge.trim() || 'حصرياً بسوق دسوق',
        image: newSlideImage.trim(),
        bgGradient: newSlideGradient
      });
      setIsCreatingHeroSlide(false);
      setNewSlideTitle('');
      setNewSlideDesc('');
      setNewSlideTag('');
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة شريحة البانر');
    }
  };

  // Delete Hero Slide
  const handleDeleteHeroSlide = (id: string | number, title: string) => {
    onRequestConfirmation({
      isOpen: true,
      title: 'حذف شريحة البانر الإعلاني',
      message: `هل أنت متأكد من حذف شريحة البانر "${title}" من واجهة المتجر الرئيسية؟`,
      severity: 'danger',
      requiredRole: ['admin'],
      onConfirm: async () => {
        await deleteHeroSlide(id);
      }
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#800020]" />
              <span>إدارة العروض الترويجية والإعلانات والبانرات (Promotions & Ad System)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              إنشاء وإدارة كوبونات الخصم، شرائح البانر بالصفحة الرئيسية، وإشعارات الطوارئ الحية المتصلة بقاعدة البيانات.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'coupons' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
              }`}
            >
              قسائم وكوبونات الخصم ({coupons.length})
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'announcements' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
              }`}
            >
              شريط الإعلانات والتعميمات ({announcements.length})
            </button>
            <button
              onClick={() => setActiveTab('hero_banners')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hero_banners' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>شرائح البانر الرئيسية ({heroSlides.length})</span>
            </button>
          </div>
        </div>

      </div>

      {/* SUB-VIEW 1: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
              الكوبونات الترويجية الفعالة في المنصة
            </h3>
            <button
              onClick={() => setIsCreatingCoupon(true)}
              className="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء كوبون جديد</span>
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl text-center text-stone-500 border border-stone-200 dark:border-zinc-800">
              لا توجد كوبونات حالياً. أنشئ أول كوبون لعملائك في دسوق!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div 
                  key={c.id}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="font-mono font-black text-sm bg-stone-100 dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] px-3 py-1 rounded-xl border border-stone-200 dark:border-zinc-700 tracking-wider">
                        {c.code}
                      </span>
                      <p className="text-xs font-bold text-stone-800 dark:text-zinc-200 pt-1.5">{c.descriptionAr}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {c.status === 'active' ? 'مفعل ونشط' : 'معطل'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100 dark:border-zinc-800 text-stone-600 dark:text-zinc-400">
                    <div>
                      قيمة الخصم: <strong className="text-stone-900 dark:text-white">{c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} ج.م`}</strong>
                    </div>
                    <div>
                      الحد الأدنى للطلب: <strong className="text-stone-900 dark:text-white">{c.minOrderValueEGP} ج.م</strong>
                    </div>
                    <div>
                      الاستخدامات: <strong className="text-stone-900 dark:text-white font-mono">{c.usedCount || 0} / {c.usageLimit || 1000}</strong>
                    </div>
                    <div>
                      تاريخ الانتهاء: <strong className="text-stone-900 dark:text-white">{c.endDate || 'مستمر'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-[11px] text-stone-400">كود متصل بالسيرفر الحي</span>
                    <button
                      onClick={() => handleDeleteCoupon(c.id, c.code)}
                      className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                      title="حذف القسيمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* SUB-VIEW 2: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
              التعميمات والتنبيهات العامة المبثوثة في أعلى الموقع
            </h3>
            <button
              onClick={() => setIsCreatingAnnouncement(true)}
              className="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>نشر إعلان جديد</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl text-center text-stone-500 border border-stone-200 dark:border-zinc-800">
              لا توجد إعلانات عامة نشطة حالياً.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div 
                  key={ann.id}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#800020]" />
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">{ann.titleAr}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold">بث مباشر نشط</span>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.titleAr)}
                        className="p-1 text-stone-400 hover:text-red-700 rounded-lg cursor-pointer"
                        title="حذف الإعلان"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                    {ann.contentAr || ann.messageAr}
                  </p>
                  <div className="text-[10px] text-stone-400 flex justify-between pt-2 border-t border-stone-100 dark:border-zinc-800">
                    <span>المكان: {ann.placement}</span>
                    <span>الناشر: {ann.authorName || 'إدارة سوق دسوق'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: HERO SLIDES (BANNER ADS) */}
      {activeTab === 'hero_banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
              شرائح البانر الإعلاني الكبير بالصفحة الرئيسية (Hero Carousel)
            </h3>
            <button
              onClick={() => setIsCreatingHeroSlide(true)}
              className="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شريحة بانر جديدة</span>
            </button>
          </div>

          {heroSlides.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl text-center text-stone-500 border border-stone-200 dark:border-zinc-800">
              لا توجد شرائح إعلانية مخصصة، يتم عرض الشرائح الافتراضية. أضف شريحتك الأولى الآن!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroSlides.map((slide) => (
                <div 
                  key={slide.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-md overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-40 bg-stone-900 overflow-hidden">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-between text-white">
                      <span className="self-start px-2.5 py-0.5 bg-[#D4AF37] text-[#800020] text-[10px] font-black rounded-full shadow-xs">
                        {slide.badge || slide.tag}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-sm line-clamp-1">{slide.title}</h4>
                        <p className="text-[11px] text-stone-200 line-clamp-1">{slide.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between border-t border-stone-100 dark:border-zinc-800 text-xs">
                    <div className="space-y-0.5 text-stone-600 dark:text-zinc-400">
                      <div>القسم المرتبط: <strong className="text-stone-900 dark:text-white font-mono">{slide.category}</strong></div>
                      <div>نص الزر: <strong className="text-stone-900 dark:text-white">{slide.ctaText}</strong></div>
                    </div>
                    <button
                      onClick={() => handleDeleteHeroSlide(slide.id, slide.title)}
                      className="p-2 text-stone-400 hover:text-red-700 rounded-lg cursor-pointer"
                      title="حذف شريحة البانر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE COUPON */}
      {isCreatingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-zinc-800">
            <div className="flex justify-between items-center border-b pb-3 border-stone-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">إنشاء كوبون خصم جديد</h3>
              <button onClick={() => setIsCreatingCoupon(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">كود القسيمة (مثال: DESOQ2026):</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">نوع الخصم:</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed_egp">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">القيمة:</label>
                  <input
                    type="number"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">الحد الأدنى لقيمة السلة (ج.م):</label>
                <input
                  type="number"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">الوصف بالعربية:</label>
                <input
                  type="text"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder="خصم خاص لأهل دسوق..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setIsCreatingCoupon(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCoupon}
                className="px-5 py-2 bg-[#800020] text-white rounded-full cursor-pointer hover:bg-[#600018]"
              >
                حفظ ونشر القسيمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ANNOUNCEMENT */}
      {isCreatingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-zinc-800">
            <div className="flex justify-between items-center border-b pb-3 border-stone-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">نشر إعلان وتعميم عام</h3>
              <button onClick={() => setIsCreatingAnnouncement(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">عنوان الإعلان:</label>
                <input
                  type="text"
                  value={newAnncTitle}
                  onChange={(e) => setNewAnncTitle(e.target.value)}
                  placeholder="مثال: خصومات كولكشن الربيع بدسوق"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">تفاصيل الإعلان / الرسالة:</label>
                <textarea
                  value={newAnncContent}
                  onChange={(e) => setNewAnncContent(e.target.value)}
                  rows={3}
                  placeholder="اكتب نص الإعلان التوجيهي أو الترويجي..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">نوع التنبيه:</label>
                  <select
                    value={newAnncType}
                    onChange={(e) => setNewAnncType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  >
                    <option value="promotion">ترويجي وعروض</option>
                    <option value="info">إرشادي عام</option>
                    <option value="warning">تنبيه تشغيلي</option>
                    <option value="emergency">عاجل وطارئ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">مكان الظهور:</label>
                  <select
                    value={newAnncPlacement}
                    onChange={(e) => setNewAnncPlacement(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  >
                    <option value="top_banner">شريط أعلى الصفحة</option>
                    <option value="all">كافة الواجهات</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">رابط أو قسم التوجيه (اختياري):</label>
                <input
                  type="text"
                  value={newAnncActionLink}
                  onChange={(e) => setNewAnncActionLink(e.target.value)}
                  placeholder="مثال: category:men_fashion"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setIsCreatingAnnouncement(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="px-5 py-2 bg-[#800020] text-white rounded-full cursor-pointer hover:bg-[#600018]"
              >
                نشر الإعلان فوراً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE HERO SLIDE */}
      {isCreatingHeroSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 border-stone-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>إضافة شريحة بانر للصفحة الرئيسية</span>
              </h3>
              <button onClick={() => setIsCreatingHeroSlide(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">العنوان الرئيسي للشريحة:</label>
                <input
                  type="text"
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  placeholder="مثال: تشكيلة العطور والمسك الملكي بدسوق"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">الوصف الفرعي:</label>
                <input
                  type="text"
                  value={newSlideDesc}
                  onChange={(e) => setNewSlideDesc(e.target.value)}
                  placeholder="مثال: خصومات حصرية وتوصيل مباشر حتى باب بيتك"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">الوسم / Tag:</label>
                  <input
                    type="text"
                    value={newSlideTag}
                    onChange={(e) => setNewSlideTag(e.target.value)}
                    placeholder="ركن العطور"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">شارة العرض (Badge):</label>
                  <input
                    type="text"
                    value={newSlideBadge}
                    onChange={(e) => setNewSlideBadge(e.target.value)}
                    placeholder="خصم حتى 30%"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">القسم المستهدف:</label>
                  <select
                    value={newSlideCategory}
                    onChange={(e) => setNewSlideCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  >
                    <option value="men_fashion">أزياء رجالي</option>
                    <option value="women_fashion">أزياء نسائية</option>
                    <option value="perfumes_fragrances">عطور وبخور</option>
                    <option value="watches_accessories">إكسسوارات وساعات</option>
                    <option value="electronics_appliances">أجهزة وإلكترونيات</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">نص زر التفاعل:</label>
                  <input
                    type="text"
                    value={newSlideCtaText}
                    onChange={(e) => setNewSlideCtaText(e.target.value)}
                    placeholder="تسوق الآن"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">رابط صورة الخلفية (Image URL):</label>
                <input
                  type="text"
                  value={newSlideImage}
                  onChange={(e) => setNewSlideImage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setIsCreatingHeroSlide(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveHeroSlide}
                className="px-5 py-2 bg-[#800020] text-white rounded-full cursor-pointer hover:bg-[#600018]"
              >
                حفظ وإضافة للبانر
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
