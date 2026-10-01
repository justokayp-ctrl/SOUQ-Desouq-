import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Percent, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Copy, 
  Flame,
  ShieldCheck
} from 'lucide-react';
import { Seller } from '../../types';

interface SellerPromotionsViewProps {
  seller: Seller;
  onShowToast: (msg: string) => void;
}

export const SellerPromotionsView: React.FC<SellerPromotionsViewProps> = ({
  seller,
  onShowToast,
}) => {
  const [coupons, setCoupons] = useState([
    {
      id: 'promo-1',
      code: 'DESOQ15',
      type: 'percent',
      discountValue: 15,
      minOrderEGP: 300,
      usageCount: 42,
      usageLimit: 100,
      expiryDate: '2026-12-31',
      status: 'active',
      description: 'خصم 15% على جميع منسوجات ومفروشات قطن دسوق',
    },
    {
      id: 'promo-2',
      code: 'ROYAL50',
      type: 'fixed',
      discountValue: 50,
      minOrderEGP: 350,
      usageCount: 18,
      usageLimit: 50,
      expiryDate: '2026-10-15',
      status: 'active',
      description: 'خصم 50 ج.م على العطور والإكسسوارات الفاخرة',
    }
  ]);

  // New Coupon Form Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percent' | 'fixed'>('percent');
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinOrder, setNewMinOrder] = useState<number>(200);
  const [newUsageLimit, setNewUsageLimit] = useState<number>(100);
  const [newDescription, setNewDescription] = useState('');

  // Seasonal Campaigns enrollment
  const [campaigns, setCampaigns] = useState([
    {
      id: 'camp-1',
      title: 'مهرجان قطن دلتا دسوق الذهبي',
      subtitle: 'حملة تسويقية كبرى لمنتجات الأقمشة والمنسوجات المصرية',
      discountOffered: '10% خصم إضافي تدعمه المنصة',
      enrolled: true,
      badge: 'مهرجان رسمي 🇪🇬',
    },
    {
      id: 'camp-2',
      title: 'أسبوع حلويات وهدايا المولد الدسوقي',
      subtitle: 'عروض حصرية لزوار دسوق وطلبات الشحن لباقي المحافظات',
      discountOffered: 'شحن مجاني للطلبات فوق 350 ج.م',
      enrolled: false,
      badge: 'موسم رائج 🔥',
    }
  ]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      onShowToast('يرجى إدخال رمز الكوبون');
      return;
    }

    const newCoupon = {
      id: `promo-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      type: newType,
      discountValue: Number(newValue),
      minOrderEGP: Number(newMinOrder),
      usageCount: 0,
      usageLimit: Number(newUsageLimit),
      expiryDate: '2026-12-31',
      status: 'active',
      description: newDescription || `خصم ${newValue}${newType === 'percent' ? '%' : ' ج.م'} لمتجر ${seller.name}`,
    };

    setCoupons([newCoupon, ...coupons]);
    onShowToast(`تم تفعيل كود الخصم "${newCoupon.code}" بنجاح`);
    setIsCreateOpen(false);
    setNewCode('');
    setNewDescription('');
  };

  const handleToggleCampaign = (campId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campId ? { ...c, enrolled: !c.enrolled } : c))
    );
    onShowToast('تم تحديث حالة الاشتراك في الحملة الترويجية');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    onShowToast(`تم نسخ الكوبون: ${code}`);
  };

  return (
    <div id="seller-promotions-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & CREATE BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>العروض الترويجية وأكواد الخصم</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            تحفيز المبيعات، إطلاق قسائم الخصم، والاشتراك في مهرجانات سوق دسوق الترويجية
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#800020] hover:bg-[#600018] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>إنشاء كود خصم جديد</span>
        </button>
      </div>

      {/* 2. ACTIVE COUPONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 shadow-xs space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode(coupon.code)}
                  className="px-3 py-1.5 bg-[#FAF7F2] dark:bg-zinc-900 border border-[#800020]/30 rounded-xl font-mono font-black text-sm text-[#800020] dark:text-[#D4AF37] flex items-center gap-1.5 cursor-pointer hover:bg-[#800020] hover:text-white transition-colors"
                  title="انقر للنسخ"
                >
                  <span>{coupon.code}</span>
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <span className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  نشط الآن ✓
                </span>
              </div>

              <div className="text-right">
                <span className="font-serif font-black text-base text-[#800020] dark:text-[#D4AF37]">
                  {coupon.type === 'percent' ? `${coupon.discountValue}%` : `${coupon.discountValue} ج.م`}
                </span>
                <span className="text-[10px] text-gray-400 block">قيمة الخصم</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-zinc-300 font-medium">
              {coupon.description}
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAF7F2] dark:bg-zinc-900/60 rounded-2xl text-[11px] text-gray-500">
              <div>
                <span className="block text-gray-400 text-[10px]">الحد الأدنى للطلب:</span>
                <strong className="text-gray-800 dark:text-zinc-200">{coupon.minOrderEGP} ج.م</strong>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px]">مرات الاستخدام:</span>
                <strong className="text-blue-700 dark:text-blue-400">{coupon.usageCount} / {coupon.usageLimit}</strong>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px]">صلاحية حتى:</span>
                <strong className="text-gray-800 dark:text-zinc-200">{coupon.expiryDate}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. SEASONAL CAMPAIGNS ENROLLMENT */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>المهرجانات والحملات التسويقية العامة بسوق دسوق</span>
        </h3>
        <p className="text-xs text-gray-500">
          انضمامك لهذه الحملات يرفع ظهور منتجاتك في الصفحة الرئيسية للمنصة ويستقطب آلاف الزوار
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                camp.enrolled
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                  : 'bg-[#FAF7F2] dark:bg-zinc-900 border-gray-200 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                  {camp.badge}
                </span>
                {camp.enrolled && (
                  <span className="text-green-700 dark:text-green-400 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    متجرك مشترك
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">{camp.title}</h4>
                <p className="text-gray-500 text-[11px]">{camp.subtitle}</p>
                <div className="pt-1 text-[#800020] dark:text-[#D4AF37] font-semibold text-[11px]">
                  ✨ ميزة الحملة: {camp.discountOffered}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleCampaign(camp.id)}
                className={`w-full py-2.5 rounded-xl font-bold transition-colors cursor-pointer text-xs ${
                  camp.enrolled
                    ? 'bg-gray-200 dark:bg-zinc-700 hover:bg-red-100 hover:text-red-700 text-gray-700 dark:text-zinc-200'
                    : 'bg-[#800020] hover:bg-[#600018] text-white shadow-xs'
                }`}
              >
                {camp.enrolled ? 'إلغاء الاشتراك في الحملة' : 'الاشتراك في المهرجان الآن'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CREATE COUPON MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-[#800020]/20 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                <span>إنشاء قسيمة خصم جديدة</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="font-bold block mb-1 text-gray-700 dark:text-zinc-300">
                  رمز الكوبون (بالإنجليزية):
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="مثال: SUMMER20"
                  className="w-full bg-[#FAF7F2] dark:bg-zinc-800 border-none rounded-xl p-3 font-mono font-bold uppercase text-[#800020] dark:text-[#D4AF37] outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-gray-700 dark:text-zinc-300">
                    نوع الخصم:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] dark:bg-zinc-800 border-none rounded-xl p-3 font-bold outline-none cursor-pointer"
                  >
                    <option value="percent">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-gray-700 dark:text-zinc-300">
                    قيمة الخصم:
                  </label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    min={1}
                    className="w-full bg-[#FAF7F2] dark:bg-zinc-800 border-none rounded-xl p-3 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-gray-700 dark:text-zinc-300">
                    الحد الأدنى للطلب (ج.م):
                  </label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(Number(e.target.value))}
                    min={0}
                    className="w-full bg-[#FAF7F2] dark:bg-zinc-800 border-none rounded-xl p-3 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-gray-700 dark:text-zinc-300">
                    أقصى عدد استخدامات:
                  </label>
                  <input
                    type="number"
                    value={newUsageLimit}
                    onChange={(e) => setNewUsageLimit(Number(e.target.value))}
                    min={1}
                    className="w-full bg-[#FAF7F2] dark:bg-zinc-800 border-none rounded-xl p-3 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-gray-700 dark:text-zinc-300">
                  وصف العرض للمشتري:
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="مثال: خصم 15% على مفروشات السرير بمناسبة الصيف"
                  className="w-full bg-[#FAF7F2] dark:bg-zinc-800 border-none rounded-xl p-3 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#800020] hover:bg-[#600018] text-white font-bold py-3 rounded-full shadow-md transition-colors cursor-pointer"
              >
                تفعيل ونشر كود الخصم
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
