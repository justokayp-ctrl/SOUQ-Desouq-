import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Truck, 
  Building2,
  Lock,
  Phone,
  Mail,
  HelpCircle,
  Ruler,
  Scissors,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Headphones,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Compass,
  Shirt
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { BrandShield } from './common/ui';
import { SizeGuideModal } from './common/SizeGuideModal';
import { DepartmentRealmId } from '../types';

export const Footer: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    role, 
    setRole, 
    openDepartmentRealm, 
    lang, 
    t, 
    showToast 
  } = useMarketplace();

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Determine current display mode based on active view and user role
  const isCheckoutMode = activeView === 'checkout';
  const isCourierMode = activeView === 'courier_dispatch' || role === 'courier';
  const isSellerMode = activeView === 'seller_dashboard' || activeView === 'seller_products' || activeView === 'seller_orders' || role === 'seller';
  const isAdminMode = activeView === 'admin_deck' || role === 'admin';

  // ==========================================
  // MODE 1: CHECKOUT & CART MINIMAL TRUST FOOTER
  // ==========================================
  if (isCheckoutMode) {
    return (
      <footer id="souq-desoq-checkout-footer" className="bg-[#121212] text-white/80 py-8 border-t border-[#800020]/30 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <BrandShield size="sm" variant="gold" />
              <div>
                <span className="font-serif font-bold text-white text-base">سوق دسوق للملابس والأزياء</span>
                <span className="text-[10px] block text-[#D4AF37] font-semibold">بوابة الدفع الآمن وضمان المقاسات 100%</span>
              </div>
            </div>

            {/* 3 Quick Checkout Security Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
                <Lock className="w-3.5 h-3.5" />
                <span>تشفير SSL 256-Bit</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#FAF6EE] bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>استبدال المقاس مجاناً خلال 14 يوماً</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#FAF6EE] bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>معاينة خامة القماش قبل الدفع</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/70">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>دعم الطلبات العاجل: <strong>19000</strong></span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} سوق دسوق الرقمي للملابس - مرخص وفقاً للقانون المصري 181 لسنة 2018.
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">فودافون كاش</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">إنستاباي InstaPay</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">فوري Fawry</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">ميزة Meeza</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">الدفع عند الاستلام</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ==========================================
  // MODE 2: COURIER DISPATCH OPERATIONS FOOTER
  // ==========================================
  if (isCourierMode) {
    return (
      <footer id="souq-desoq-courier-footer" className="bg-[#0F172A] text-slate-300 py-10 border-t-2 border-amber-500/30 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-700/60">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-sm">غرفة عمليات مناديب أزياء دسوق</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                مركز المتابعة اللوجستية وتوزيع شحنات الملابس للعملاء والمشاغل داخل مراكز وقرى دسوق وكفر الشيخ ودلتا مصر.
              </p>
              <p className="text-xs text-amber-300 font-semibold">
                خط طوارئ الديسپاتش المباشر: 01099887766
              </p>
            </div>

            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>بروتوكول معاينة المقاس عند التسليم</span>
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                يُمنح العميل مهلة حتى 5 دقائق لمعاينة خامة القماش ومطابقة المقاس أمام الكابتن. في حال عدم تناسب المقاس يتم تدوين استثناء (عدم مطابقة مقاس) لإرسال البديل فوراً.
              </p>
            </div>

            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>تصفية العهد النقدية (COD Remittance)</span>
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                يجب توريد المبالغ المحصلة لخزينة دسوق يومياً قبل الساعة 10:00 مساءً أو عبر التحويل المباشر لحساب المنصة بـ InstaPay.
              </p>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              بوابة المناديب الرسمية — سوق دسوق للملابس © {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => { setRole('customer'); setActiveView('catalog'); }}
                className="text-amber-400 hover:text-white underline transition-colors cursor-pointer"
              >
                العودة للتسوق كعميل
              </button>
              <button 
                type="button" 
                onClick={() => { setActiveView('courier_dispatch'); }}
                className="text-slate-300 hover:text-white transition-colors"
              >
                لوحة المناوبة والحسابات
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ==========================================
  // MODE 3: SELLER & BESPOKE TAILOR PORTAL FOOTER
  // ==========================================
  if (isSellerMode) {
    return (
      <footer id="souq-desoq-seller-footer" className="bg-[#1C1318] text-rose-100/80 py-10 border-t-2 border-[#D4AF37]/30 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8 border-b border-white/10">
            
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <Scissors className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="font-bold text-white text-sm">بوابة ترزية وتجار مشاغل دسوق للملابس</h4>
              </div>
              <p className="text-xs text-rose-200/70 leading-relaxed max-w-lg">
                نوفر لأصحاب المشاغل ومعارض الأزياء ومصانع الأقطان في دسوق منصة موحدة لعرض الموديلات، استقبال طلبات التفصيل، وإدارة الشحن السريع لباقي المحافظات بنظام عمولة تنافسي.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>دعم المشاغل والشراكات: 047-3200000 (داخلي 204)</span>
              </div>
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
              <h5 className="font-bold text-white flex items-center gap-1.5 text-[#D4AF37]">
                <ShieldCheck className="w-4 h-4" />
                <span>معايير الأقمشة المعتمدة</span>
              </h5>
              <p className="text-[11px] text-white/60 leading-relaxed">
                يلتزم التاجر بتوضيح نسبة القطن المصري وخامة الكريب أو الصوف بدقة في بطاقة المنتج، وضمان دقة جدول المقاسات لتفادي المرتجعات.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
              <h5 className="font-bold text-white flex items-center gap-1.5 text-emerald-400">
                <CreditCard className="w-4 h-4" />
                <span>دورة تحويل الأرباح (T+2)</span>
              </h5>
              <p className="text-[11px] text-white/60 leading-relaxed">
                يتم تحويل قيمة مبيعات الملابس المسلمة لمحفظة التاجر أو حسابه البنكي/InstaPay خلال 48 ساعة من تأكيد استلام العميل.
              </p>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <div>
              منصة إدارة المشاغل وتجار الملابس — دسوق © {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => { setRole('customer'); setActiveView('catalog'); }}
                className="text-[#D4AF37] hover:text-white underline transition-colors cursor-pointer"
              >
                معاينة المتجر كمتسوق
              </button>
              <button 
                type="button" 
                onClick={() => { setActiveView('seller_dashboard'); }}
                className="text-white/70 hover:text-white transition-colors"
              >
                لوحة تحكم المتجر
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ==========================================
  // MODE 4: ADMIN & GOVERNANCE DECK FOOTER
  // ==========================================
  if (isAdminMode) {
    return (
      <footer id="souq-desoq-admin-footer" className="bg-[#0A0A0C] text-zinc-400 py-8 border-t border-red-900/40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <BrandShield size="sm" variant="gold" />
            <span>لوحة الرقابة المركزية — إدارة سوق دسوق الرقمي للملابس والأزياء</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              المنظومة تعمل بكفاءة 100%
            </span>
            <button 
              type="button" 
              onClick={() => { setRole('customer'); setActiveView('catalog'); }}
              className="text-[#D4AF37] hover:underline cursor-pointer"
            >
              العودة للواجهة العامة
            </button>
          </div>
        </div>
      </footer>
    );
  }

  // ==========================================
  // MODE 5: GENERAL CONSUMER CLOTHING & FASHION MARKETPLACE FOOTER (DEFAULT)
  // ==========================================
  return (
    <>
      <footer id="souq-desoq-footer" className="bg-[#141214] text-white/80 pt-16 pb-24 md:pb-14 mt-20 border-t border-[#800020]/30 select-none relative overflow-hidden">
        
        {/* Subtle Moroccan / Islamic Geometric Watermark pattern for Desoq heritage */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* 1. THE 4 PILLARS OF CLOTHING & APPAREL TRUST IN DESOQ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 border-b border-white/10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Pillar 1: Size & Fabric Inspection */}
            <div className="flex items-start gap-3.5 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/[0.08] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">معاينة المقاس قبل الاستلام</h4>
                <p className="text-xs text-white/65 leading-relaxed">
                  يحق لك فتح الطرد، فحص خامة القماش ومطابقة المقاس أمام مندوب التوصيل في دسوق قبل إتمام الدفع.
                </p>
              </div>
            </div>

            {/* Pillar 2: 100% Egyptian Cotton & Verified Ateliers */}
            <div className="flex items-start gap-3.5 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/[0.08] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">أقطان مصرية 100% ومشاغل موثقة</h4>
                <p className="text-xs text-white/65 leading-relaxed">
                  خامات أقطان طويلة التيلة، صوف إيطالي، وكريب سعودي أصيل بحياكة كبار ترزية ومشاغل دسوق.
                </p>
              </div>
            </div>

            {/* Pillar 3: 14-Day Free Size Exchange Under Egyptian Law */}
            <div className="flex items-start gap-3.5 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/[0.08] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">استبدال المقاس خلال 14 يوماً</h4>
                <p className="text-xs text-white/65 leading-relaxed">
                  استبدال فوري للمقاس غير المناسب مجاناً وفقاً للمادة 18 من قانون حماية المستهلك رقم 181 لسنة 2018.
                </p>
              </div>
            </div>

            {/* Pillar 4: Desoq Express Clothing Delivery */}
            <div className="flex items-start gap-3.5 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#D4AF37]/60 hover:bg-white/[0.08] transition-all">
              <div className="w-10 h-10 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">تسليم فوري للملابس بدسوق 24 ساعة</h4>
                <p className="text-xs text-white/65 leading-relaxed">
                  شحنات الملابس تصلك إلى باب المنزل في أي حي بدسوق وكفر الشيخ خلال 24 ساعة، وشحن سريع لباقي مصر.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 2. MAIN FOOTER SITEMAP & CLOTHING NAVIGATION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Identity & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5">
                <BrandShield size="md" variant="gold" />
                <div className="flex flex-col">
                  <span className="text-xl font-serif font-black text-white tracking-tight">سوق دسوق للملابس</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">SOUQ DESOQ FASHION & APPAREL</span>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed max-w-sm">
                المنصة المتخصصة الأولى التي تجمع مصممي الأزياء وترزية البدل الإيطالية ومصنعي العبايات والأقطان المصرية في مدينة دسوق ومحافظة كفر الشيخ مع المتسوق المصري مع ضمان المقاس وسرعة المعاينة.
              </p>
              
              <div className="space-y-2 pt-1 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>المقر الرئيسي: شارع سعد زغلول / شارع الجيش، دسوق، كفر الشيخ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>خدمة عملاء الأزياء والطلبات: <strong>19000</strong> (متاح 24/7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>البريد الإلكتروني: fashion@souqdesoq.eg</span>
                </div>
              </div>

              {/* Interactive Size Guide Launch Button in Footer */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/40 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Ruler className="w-4 h-4" />
                  <span>حاسبة ودليل مقاسات الملابس المصرية</span>
                </button>
              </div>
            </div>

            {/* Clothing Houses & Realms */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">أروقة دور الأزياء</h4>
              <ul className="space-y-2.5 text-xs text-white/70">
                <li>
                  <button 
                    type="button" 
                    onClick={() => openDepartmentRealm('gentleman')} 
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>👔</span>
                    <span>«ديوان الأناقة» — بدل ورجالي</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => openDepartmentRealm('sanctuary')} 
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>👗</span>
                    <span>«رواق الهوانم» — عبايات وسهرات</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => openDepartmentRealm('vanguard')} 
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🛹</span>
                    <span>«دار الطليعة» — أوفرسايز وكاجوال</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => openDepartmentRealm('little_royals')} 
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🧸</span>
                    <span>«عرين الصغار» — قطنيات وأطفال</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => setActiveView('curated_collections')} 
                    className="hover:text-white transition-colors cursor-pointer text-[#D4AF37] flex items-center gap-1.5 font-semibold"
                  >
                    <span>✨</span>
                    <span>الباقات والإطلالات الكاملة (خصم 20%)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Customer Care & Tailor Directory */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">خدمات المتسوق</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button type="button" onClick={() => setActiveView('catalog')} className="hover:text-white transition-colors cursor-pointer">
                    كافة تشكيلات الملابس
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveView('sellers_directory')} className="hover:text-white transition-colors cursor-pointer">
                    دليل مشاغل وترزية دسوق المعتمدين
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveView('category_explorer')} className="hover:text-white transition-colors cursor-pointer">
                    مستكشف مقاسات وأنواع الأقمشة
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveView('orders')} className="hover:text-white transition-colors cursor-pointer">
                    تتبع طلبات الملابس والشحنات
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveView('wishlist')} className="hover:text-white transition-colors cursor-pointer">
                    قائمة الإطلالات المحفوظة
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setIsSizeGuideOpen(true)} className="hover:text-white transition-colors cursor-pointer text-[#D4AF37]">
                    جدول مقاسات البدل والعبايات
                  </button>
                </li>
              </ul>
            </div>

            {/* Merchant Portals & Official Accreditations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">بوابات المهنيين والتوثيق</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button 
                    type="button" 
                    onClick={() => { setRole('seller'); setActiveView('seller_dashboard'); }} 
                    className="hover:text-white transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>بوابة أصحاب المشاغل والتجار</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => { setRole('courier'); setActiveView('courier_dispatch'); }} 
                    className="hover:text-white transition-colors cursor-pointer text-amber-400 font-bold flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>بوابة كباتن التوصيل بدسوق</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => { setRole('admin'); setActiveView('admin_deck'); }} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    لوحة الإدارة والرقابة
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => { setRole('support'); setActiveView('support_disputes'); }} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    لجنة فض منازعات المقاسات والشكاوى
                  </button>
                </li>
              </ul>

              {/* Legal Registration badge */}
              <div className="pt-2 text-[10px] text-white/50 space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <p className="font-semibold text-[#D4AF37]">الغرفة التجارية بكفر الشيخ</p>
                <p>شعبة صناعة الملابس الجاهزة والأقمشة</p>
                <p>سجل تجاري: 40912 دسوق — ب.ض: 398-102-441</p>
              </div>
            </div>

          </div>
        </div>

        {/* 4. BOTTOM LEGAL COPYRIGHT & PAYMENT GATEWAYS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 relative z-10">
          <div>
            © {new Date().getFullYear()} سوق دسوق الرقمي للملابس والأزياء (Souq Desoq Fashion). جميع الحقوق محفوظة.
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-md text-[10px] font-bold">فودافون كاش</span>
            <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-md text-[10px] font-bold">إنستاباي InstaPay</span>
            <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-md text-[10px] font-bold">فوري Fawry</span>
            <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-md text-[10px] font-bold">ميزة Meeza</span>
            <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-md text-[10px] font-bold">Visa / Mastercard</span>
            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-md text-[10px] font-bold">
              معاينة ودفع عند الاستلام
            </span>
          </div>
        </div>

      </footer>

      {/* Global Interactive Size Guide Modal Triggered from Footer */}
      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />
    </>
  );
};
