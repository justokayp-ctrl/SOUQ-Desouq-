import React, { useState } from 'react';
import { X, Ruler, Calculator, Sparkles, Check, Info } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize?: (sizeName: string) => void;
  productTitle?: string;
  category?: string;
}

type SizeCategoryTab = 'men' | 'women_abaya' | 'shoes' | 'kids';

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  productTitle,
  category
}) => {
  const [activeTab, setActiveTab] = useState<SizeCategoryTab>('men');
  const [userHeight, setUserHeight] = useState<number>(175);
  const [userWeight, setUserWeight] = useState<number>(75);
  const [footLength, setFootLength] = useState<number>(26.5);

  if (!isOpen) return null;

  // Real-time Size Calculator logic
  const calculateRecommendedSize = () => {
    if (activeTab === 'men') {
      if (userWeight < 62) return { size: 'S (38)', label: 'صغير', cm: 'صدر 88-92 سم' };
      if (userWeight < 73) return { size: 'M (40)', label: 'متوسط', cm: 'صدر 96-100 سم' };
      if (userWeight < 84) return { size: 'L (42)', label: 'كبير', cm: 'صدر 104-108 سم' };
      if (userWeight < 95) return { size: 'XL (44)', label: 'كبير جداً', cm: 'صدر 112-116 سم' };
      if (userWeight < 108) return { size: '2XL (46)', label: '2XL', cm: 'صدر 120-124 سم' };
      return { size: '3XL (48)', label: '3XL ضخم', cm: 'صدر 128+ سم' };
    } else if (activeTab === 'women_abaya') {
      if (userHeight < 155) return { size: 'مقاس 52', label: 'طول 132 سم', cm: 'مناسب لقامة 150-155 سم' };
      if (userHeight < 160) return { size: 'مقاس 54', label: 'طول 137 سم', cm: 'مناسب لقامة 156-160 سم' };
      if (userHeight < 165) return { size: 'مقاس 56', label: 'طول 142 سم', cm: 'مناسب لقامة 161-165 سم' };
      if (userHeight < 170) return { size: 'مقاس 58', label: 'طول 147 سم', cm: 'مناسب لقامة 166-170 سم' };
      return { size: 'مقاس 60', label: 'طول 152 سم', cm: 'مناسب لقامة 171+ سم' };
    } else if (activeTab === 'shoes') {
      if (footLength <= 24.5) return { size: '40 EU', label: '24.5 سم', cm: 'UK 6.5 / US 7.5' };
      if (footLength <= 25.5) return { size: '41 EU', label: '25.5 سم', cm: 'UK 7.5 / US 8.5' };
      if (footLength <= 26.5) return { size: '42 EU', label: '26.5 سم', cm: 'UK 8.5 / US 9.5' };
      if (footLength <= 27.5) return { size: '43 EU', label: '27.5 سم', cm: 'UK 9.5 / US 10.5' };
      if (footLength <= 28.5) return { size: '44 EU', label: '28.5 سم', cm: 'UK 10.5 / US 11.5' };
      return { size: '45 EU', label: '29.5 سم', cm: 'UK 11.5 / US 12.5' };
    } else {
      if (userHeight < 100) return { size: 'سنتان (2Y)', label: 'طول 92-98 سم', cm: 'صدر 54 سم' };
      if (userHeight < 116) return { size: '4-6 سنوات', label: 'طول 104-116 سم', cm: 'صدر 60 سم' };
      if (userHeight < 130) return { size: '8-10 سنوات', label: 'طول 128-134 سم', cm: 'صدر 68 سم' };
      return { size: '12-14 سنة', label: 'طول 140-152 سم', cm: 'صدر 76 سم' };
    }
  };

  const recommendation = calculateRecommendedSize();

  const handleApplySize = (szName: string) => {
    if (onSelectSize) {
      onSelectSize(szName);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-[#D4AF37]/40 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#800020] to-[#520015] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#D4AF37] text-[#800020] flex items-center justify-center shadow-md">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg leading-tight text-[#FAF6EE]">
                دليل المقاسات التفاعلي الرسمي
              </h3>
              <p className="text-[11px] text-[#D4AF37] font-medium truncate max-w-xs sm:max-w-md">
                جدول قياسات متوافق مع المعايير الدولية والتايلور المصري
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق دليل المقاسات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#FAF6EE] dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('men')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'men'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            👔 بدل وقمصان رجالي
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('women_abaya')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'women_abaya'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            🧕 عبايات وأزياء حريمي
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shoes')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'shoes'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            👟 أحذية (EU / UK / US)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kids')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'kids'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'text-stone-600 dark:text-zinc-300 hover:text-[#800020]'
            }`}
          >
            👶 ملابس أطفال
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-zinc-100">

          {/* Interactive Calculator Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF6EE] to-[#F5E5A8]/30 dark:from-zinc-800 dark:to-zinc-800/60 border border-[#D4AF37]/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-black text-sm text-[#800020] dark:text-[#D4AF37] flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>حاسبة المقاس الأنسب الذكية</span>
              </h4>
              <span className="text-[10px] font-bold bg-[#800020] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>توصية فورية</span>
              </span>
            </div>

            {/* Inputs based on Category */}
            {activeTab !== 'shoes' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>الطول:</span>
                    <span className="text-[#800020] dark:text-[#D4AF37]">{userHeight} سم</span>
                  </div>
                  <input
                    type="range"
                    min={120}
                    max={205}
                    value={userHeight}
                    onChange={(e) => setUserHeight(Number(e.target.value))}
                    className="w-full accent-[#800020] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>الوزن:</span>
                    <span className="text-[#800020] dark:text-[#D4AF37]">{userWeight} كجم</span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={130}
                    value={userWeight}
                    onChange={(e) => setUserWeight(Number(e.target.value))}
                    className="w-full accent-[#800020] cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>طول القدم بالتلمس (من العقب حتى أكبر إصبع):</span>
                  <span className="text-[#800020] dark:text-[#D4AF37]">{footLength} سم</span>
                </div>
                <input
                  type="range"
                  min={22.0}
                  max={30.0}
                  step={0.5}
                  value={footLength}
                  onChange={(e) => setFootLength(Number(e.target.value))}
                  className="w-full accent-[#800020] cursor-pointer"
                />
              </div>
            )}

            {/* Result Badge */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-[#D4AF37]/50 flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#800020] text-[#D4AF37] font-black text-xs flex items-center justify-center shrink-0">
                  ★
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-zinc-400 block font-medium">
                    المقاس الموصى به لقياسك الحالي:
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-black text-[#800020] dark:text-[#D4AF37]">
                      {recommendation.size}
                    </span>
                    <span className="text-xs font-bold text-stone-600 dark:text-zinc-300">
                      ({recommendation.label})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplySize(recommendation.size)}
                className="bg-[#800020] hover:bg-[#66001A] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs border border-[#D4AF37]/40"
              >
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>اعتماد هذا المقاس</span>
              </button>
            </div>
          </div>

          {/* Size Chart Table */}
          <div className="space-y-2">
            <h4 className="font-serif font-black text-xs sm:text-sm text-stone-800 dark:text-zinc-200">
              جدول أبعاد القياسات المعتمد (بالسنتيمتر):
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-zinc-700">
              {activeTab === 'men' && (
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] font-black">
                    <tr>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">المقاس الدولي</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">محيط الصدر</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">محيط الخصر</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">الوزن التقديري</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">Small (S - 38)</td>
                      <td className="p-2.5">88 - 92 سم</td>
                      <td className="p-2.5">74 - 78 سم</td>
                      <td className="p-2.5">55 - 63 كجم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">Medium (M - 40)</td>
                      <td className="p-2.5">96 - 100 سم</td>
                      <td className="p-2.5">82 - 86 سم</td>
                      <td className="p-2.5">64 - 74 كجم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold text-[#800020] dark:text-[#D4AF37]">Large (L - 42)</td>
                      <td className="p-2.5">104 - 108 سم</td>
                      <td className="p-2.5">90 - 94 سم</td>
                      <td className="p-2.5">75 - 85 كجم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">XL (44)</td>
                      <td className="p-2.5">112 - 116 سم</td>
                      <td className="p-2.5">98 - 102 سم</td>
                      <td className="p-2.5">86 - 96 كجم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">2XL (46)</td>
                      <td className="p-2.5">120 - 124 سم</td>
                      <td className="p-2.5">106 - 110 سم</td>
                      <td className="p-2.5">97 - 108 كجم</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {activeTab === 'women_abaya' && (
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] font-black">
                    <tr>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">مقاس العباية</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">طول العباية</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">طول القامة الموصى به</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">عرض الصدر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">مقاس 52</td>
                      <td className="p-2.5">132 سم (52 إنش)</td>
                      <td className="p-2.5">150 - 155 سم</td>
                      <td className="p-2.5">53 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">مقاس 54</td>
                      <td className="p-2.5">137 سم (54 إنش)</td>
                      <td className="p-2.5">156 - 160 سم</td>
                      <td className="p-2.5">56 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold text-[#800020] dark:text-[#D4AF37]">مقاس 56</td>
                      <td className="p-2.5">142 سم (56 إنش)</td>
                      <td className="p-2.5">161 - 165 سم</td>
                      <td className="p-2.5">58 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">مقاس 58</td>
                      <td className="p-2.5">147 سم (58 إنش)</td>
                      <td className="p-2.5">166 - 170 سم</td>
                      <td className="p-2.5">61 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">مقاس 60</td>
                      <td className="p-2.5">152 سم (60 إنش)</td>
                      <td className="p-2.5">171 - 176 سم</td>
                      <td className="p-2.5">64 سم</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {activeTab === 'shoes' && (
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] font-black">
                    <tr>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">المقاس الأوروبي (EU)</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">طول القدم (سم)</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">المقاس البريطاني (UK)</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">المقاس الأمريكي (US)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">40 EU</td>
                      <td className="p-2.5">24.5 - 25.0 سم</td>
                      <td className="p-2.5">UK 6.5</td>
                      <td className="p-2.5">US 7.5</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">41 EU</td>
                      <td className="p-2.5">25.1 - 25.8 سم</td>
                      <td className="p-2.5">UK 7.5</td>
                      <td className="p-2.5">US 8.5</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold text-[#800020] dark:text-[#D4AF37]">42 EU</td>
                      <td className="p-2.5">25.9 - 26.6 سم</td>
                      <td className="p-2.5">UK 8.5</td>
                      <td className="p-2.5">US 9.5</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">43 EU</td>
                      <td className="p-2.5">26.7 - 27.4 سم</td>
                      <td className="p-2.5">UK 9.5</td>
                      <td className="p-2.5">US 10.5</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">44 EU</td>
                      <td className="p-2.5">27.5 - 28.2 سم</td>
                      <td className="p-2.5">UK 10.5</td>
                      <td className="p-2.5">US 11.5</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {activeTab === 'kids' && (
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] font-black">
                    <tr>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">العمر</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">طول الطفل (سم)</th>
                      <th className="p-2.5 border-b border-stone-200 dark:border-zinc-700">محيط الصدر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-medium">
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">2 - 3 سنوات</td>
                      <td className="p-2.5">92 - 98 سم</td>
                      <td className="p-2.5">54 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">4 - 5 سنوات</td>
                      <td className="p-2.5">104 - 110 سم</td>
                      <td className="p-2.5">58 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold text-[#800020] dark:text-[#D4AF37]">6 - 7 سنوات</td>
                      <td className="p-2.5">116 - 122 سم</td>
                      <td className="p-2.5">62 سم</td>
                    </tr>
                    <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold">8 - 9 سنوات</td>
                      <td className="p-2.5">128 - 134 سم</td>
                      <td className="p-2.5">67 سم</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Measuring Tip */}
          <div className="p-3 bg-[#FAF6EE] dark:bg-zinc-800/80 rounded-2xl border border-stone-200 dark:border-zinc-700 text-xs flex items-start gap-2 text-stone-600 dark:text-zinc-300">
            <Info className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>نصيحة قياس خياطي دسوق:</strong> عند أخذ القياس يفضل ارتداء الملابس الخفيفة وترك مسافة أصبعين تحت الشريط لراحة الحركة، وفي حالة الوقوع بين مقاسين يُفضل اختيار المقاس الأكبر دائماً.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 text-stone-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
