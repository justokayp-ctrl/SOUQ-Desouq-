import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  Truck, 
  Tag, 
  Store, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  User, 
  ShoppingBag, 
  Heart, 
  Scale, 
  Globe, 
  Moon, 
  Sun,
  Crown,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { DEPARTMENT_HOUSES_CONFIG } from '../../data/departmentHousesData';
import { DepartmentRealmId, Role } from '../../types';
import { BrandShield } from './ui/BrandShield';
import { FocusTrap } from './FocusTrap';
import { RealmIcon } from './HouseIcon';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    setSelectedCategory, 
    setOnlyDesoqLocal, 
    setActiveView, 
    openDepartmentRealm,
    setRole, 
    role,
    lang, 
    setLang, 
    theme, 
    setTheme,
    cart,
    wishlist,
    t
  } = useMarketplace();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActionClick = (viewName: string, roleName?: Role) => {
    if (roleName && roleName !== role) {
      setRole(roleName);
    }
    setActiveView(viewName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="القائمة الجانبية الشاملة لسوق دسوق"
    >
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <FocusTrap isActive={isOpen} onClose={onClose}>
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-[#141416] text-[#141416] dark:text-zinc-100 shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#800020]/20 animate-in slide-in-from-right duration-300">
            
            {/* 1. AMAZON/NOON USER GREETING HEADER */}
            <div className="bg-gradient-to-r from-[#800020] via-[#66001A] to-[#141416] p-5 text-white flex items-center justify-between border-b-2 border-[#D4AF37]/40">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#FAF6EE] flex items-center justify-center text-[#800020] shadow-md border border-[#D4AF37]">
                  <BrandShield size="sm" variant="burgundy" />
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-200 block font-medium">مرحباً بك في</span>
                  <h3 className="text-base font-serif font-black text-[#FAF6EE]">سوق دسوق</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. SCROLLABLE DRAWER BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin">
              
              {/* Grand Houses of Desoq */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#800020] dark:text-[#D4AF37]">
                    أقسام التسوق الرئيسية
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(['gentleman', 'sanctuary', 'vanguard', 'little_royals'] as DepartmentRealmId[]).map((rId) => {
                    const rConf = DEPARTMENT_HOUSES_CONFIG[rId];
                    return (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => {
                          openDepartmentRealm(rId);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6EE]/80 dark:bg-zinc-800/80 hover:bg-[#800020] hover:text-white border border-stone-200 dark:border-zinc-700 hover:border-[#D4AF37] text-right transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 text-[#800020] dark:text-[#D4AF37] border border-stone-200 dark:border-zinc-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#D4AF37] group-hover:text-[#800020] transition-all shadow-2xs">
                            <RealmIcon realmId={rId} className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-white block">
                              {rConf.titleAr}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-zinc-400 group-hover:text-stone-200 block">
                              {rConf.taglineAr}
                            </span>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#D4AF37] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fast Trending Shortcuts */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-2.5">
                  روابط سريعة للتسوق
                </h4>
                <div className="space-y-1">
                  
                  <button
                    type="button"
                    onClick={() => handleActionClick('category_hub', 'customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center shadow-xs">
                        <Layers className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        كل الأقسام والتصنيفات
                      </span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#800020]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('sellers_directory', 'customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center shadow-xs">
                        <Store className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        دليل المتاجر والتجار
                      </span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#800020]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('flash_deals', 'customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center shadow-xs">
                        <Flame className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        عروض وتخفيضات اليوم
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#800020] text-white px-2 py-0.5 rounded-full font-bold">
                      خصومات حتى 50%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('curated_collections', 'customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        تنسيقات مميزة وأطقم كاملة
                      </span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#800020]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('orders', 'customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center shadow-xs">
                        <PackageCheck className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        طلباتي وتتبع الشحنات
                      </span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#800020]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('wishlist', 'customer')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] dark:bg-zinc-800 text-[#800020] border border-[#800020]/20 flex items-center justify-center shadow-xs">
                        <Heart className="w-4 h-4 text-[#800020] fill-[#800020]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020] dark:group-hover:text-[#D4AF37]">
                        المنتجات المفضلة
                      </span>
                    </div>
                    <span className="text-[10px] bg-stone-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full font-bold">
                      {wishlist.length}
                    </span>
                  </button>

                </div>
              </div>

              <hr className="border-stone-200 dark:border-zinc-800" />

              {/* Platform Management & Merchant Decks */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-2.5">
                  بوابات المنظومة
                </h4>
                <div className="space-y-1">
                  
                  <button
                    type="button"
                    onClick={() => handleActionClick('seller_dashboard', 'seller')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] text-[#800020] border border-[#D4AF37] flex items-center justify-center">
                        <Store className="w-4 h-4 text-[#800020]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020]">
                        حساب التاجر (المبيعات والمنتجات)
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      دخول التاجر
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('courier_dispatch', 'courier')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] text-[#800020] border border-[#D4AF37] flex items-center justify-center">
                        <Truck className="w-4 h-4 text-[#800020]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020]">
                        حساب مندوب التوصيل
                      </span>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                      شحن وتوصيل
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('admin_deck', 'admin')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] text-[#800020] border border-[#800020] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-[#800020]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020]">
                        لوحة تحكم الإدارة
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick('support_disputes', 'support')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6EE] dark:hover:bg-zinc-800 text-right transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] text-[#800020] border border-[#800020] flex items-center justify-center">
                        <Scale className="w-4 h-4 text-[#800020]" />
                      </div>
                      <span className="text-xs font-bold text-[#141416] dark:text-zinc-200 group-hover:text-[#800020]">
                        خدمة العملاء والشكاوى
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <hr className="border-stone-200 dark:border-zinc-800" />

              {/* Customer Care Hotline */}
              <div className="bg-[#FAF6EE] dark:bg-zinc-800/80 p-4 rounded-2xl border border-[#D4AF37]/30 space-y-2 text-right">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37]">
                    خدمة العملاء والدعم الفني
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-zinc-300">
                  الخط الساخن الموحد: <strong className="font-mono text-sm text-[#800020]">19000</strong>
                </p>
                <span className="text-[10px] text-stone-400 block">
                  متاحون 24 ساعة يومياً طوال أيام الأسبوع
                </span>
              </div>

            </div>

            {/* 3. DRAWER FOOTER / SETTINGS (Language, Theme) */}
            <div className="bg-stone-50 dark:bg-zinc-900 p-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              
              <button
                type="button"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:text-[#800020] cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:text-[#800020] cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-[#D4AF37]" />
                    <span>الوضع الفاتح</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#800020]" />
                    <span>الوضع الليلي</span>
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      </FocusTrap>
    </div>
  );
};
