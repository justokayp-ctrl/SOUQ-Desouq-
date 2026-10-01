import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Save, 
  Camera, 
  Palmtree, 
  FileText,
  AlertCircle,
  Truck
} from 'lucide-react';
import { Seller } from '../../types';

interface SellerStoreSettingsViewProps {
  seller: Seller;
  onUpdateSeller: (updates: Partial<Seller>) => void;
  onShowToast: (msg: string) => void;
}

export const SellerStoreSettingsView: React.FC<SellerStoreSettingsViewProps> = ({
  seller,
  onUpdateSeller,
  onShowToast,
}) => {
  const [name, setName] = useState(seller.name);
  const [sloganAr, setSloganAr] = useState(seller.sloganAr || '');
  const [storyAr, setStoryAr] = useState(seller.storyAr || '');
  const [city, setCity] = useState(seller.city || 'دسوق');
  const [district, setDistrict] = useState(seller.district || 'شارع الجيش');
  const [landmark, setLandmark] = useState('بجوار ساحة مسجد سيدي إبراهيم الدسوقي');
  const [phone, setPhone] = useState(seller.phone || '01019842510');
  const [whatsapp, setWhatsapp] = useState(seller.phone || '01019842510');
  const [vacationMode, setVacationMode] = useState(false);
  const [dispatchCutoffTime, setDispatchCutoffTime] = useState('04:00 PM');
  const [allowLocalPickup, setAllowLocalPickup] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSeller({
      name,
      sloganAr,
      storyAr,
      city,
      district,
      phone,
    });
    onShowToast('تم حفظ إعدادات متجر دسوق بنجاح');
  };

  return (
    <div id="seller-store-settings-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>إعدادات واجهة المتجر والهوية التراثية</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            تخصيص بيانات المتجر العامة، العنوان الفعلي بدسوق، ساعات العمل، ومواعيد الشحن
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="bg-[#800020] hover:bg-[#600018] text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#D4AF37]" />
          <span>حفظ التعديلات</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* 2. STORE BRANDING & VISUAL IDENTITY */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2 border-b pb-3">
            <Store className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>الهوية البصرية والتعريفية للمتجر</span>
          </h3>

          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <img
                src={seller.logo}
                alt={seller.name}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-[#800020]/20 bg-gray-50"
              />
              <button
                type="button"
                onClick={() => onShowToast('يمكنك رفع شعار جديد من خلال تحديث الرابط')}
                className="absolute -bottom-2 -left-2 bg-[#800020] text-white p-2 rounded-full shadow-md cursor-pointer"
                title="تغيير الشعار"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">{seller.name}</h4>
              <p className="text-gray-400 text-[11px]">عضو موثق بسوق دسوق منذ {seller.memberSince || '2024'}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                سجل تجاري وبطاقة ضريبية معتمدة ✓
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                اسم المتجر الرسمي (بالعربية):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none focus:border-[#800020]"
                required
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                الشعار اللفظي أو التخصص:
              </label>
              <input
                type="text"
                value={sloganAr}
                onChange={(e) => setSloganAr(e.target.value)}
                placeholder="مثال: أصالة القطن المصري ومفروشات العرائس بدسوق"
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
              قصة المتجر وتاريخ الحرفة في دسوق:
            </label>
            <textarea
              rows={3}
              value={storyAr}
              onChange={(e) => setStoryAr(e.target.value)}
              placeholder="اكتب نبذة عن تاريخ ورشتكم وتوارث الصنعة في مدينة دسوق..."
              className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none focus:border-[#800020] resize-none"
            />
          </div>
        </div>

        {/* 3. PHYSICAL LOCATION & CONTACT IN DESOQ */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2 border-b pb-3">
            <MapPin className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>المقر الفعلي ومعلومات الاتصال بدسوق</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                المدينة / المركز:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                الحي أو الشارع:
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                أقرب معلم مميز:
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                رقم هاتف خدمة العملاء:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1.5">
                رقم الواتساب لاستقبال الاستفسارات:
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. OPERATIONS & VACATION MODE */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2 border-b pb-3">
            <Truck className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>السياسات التشغيلية وشحن الطلبات</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF7F2] dark:bg-zinc-900 rounded-2xl space-y-2">
              <label className="font-bold text-gray-800 dark:text-zinc-200 block">
                آخر موعد لتجهيز الشحنات لنفس اليوم (Cutoff):
              </label>
              <input
                type="text"
                value={dispatchCutoffTime}
                onChange={(e) => setDispatchCutoffTime(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 rounded-xl p-2.5 font-bold outline-none border border-gray-200 dark:border-zinc-700"
              />
              <span className="text-[10px] text-gray-400 block">الطلبات الواردة قبل هذا التوقيت تُسلّم للمندوب في نفس اليوم</span>
            </div>

            <div className="p-4 bg-[#FAF7F2] dark:bg-zinc-900 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 dark:text-zinc-200">وضع الإجازة المؤقتة (Vacation Mode)</span>
                <input
                  type="checkbox"
                  checked={vacationMode}
                  onChange={(e) => setVacationMode(e.target.checked)}
                  className="w-4 h-4 accent-[#800020] cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-gray-500">
                إيقاف استقبال طلبات جديدة مؤقتاً أثناء الجرد أو السفر دون التأثير على تقييم المتجر.
              </p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
