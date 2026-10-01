import React from 'react';
import { 
  Truck, 
  PackageCheck, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BrandShield } from '../common/ui/BrandShield';

export const CourierHeader: React.FC = () => {
  const { 
    user, 
    orders, 
    setRole, 
    setActiveView, 
    theme, 
    setTheme, 
    refreshData,
    realtimeConnected 
  } = useMarketplace();

  // Compute courier metrics
  const activeOrders = orders.filter(o => 
    o.orderStatus === 'shipped' || 
    o.orderStatus === 'out_for_delivery' || 
    o.orderStatus === 'seller_confirmed' ||
    o.orderStatus === 'processing'
  );
  const outForDeliveryCount = orders.filter(o => o.orderStatus === 'out_for_delivery').length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;
  const totalCashToCollect = activeOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery' && o.paymentStatus !== 'paid')
    .reduce((sum, o) => sum + (o.totalAmountEGP || 0), 0);

  return (
    <header id="courier-header" className="sticky top-0 z-40 bg-[#0F172A] text-slate-100 border-b border-amber-500/30 shadow-xl">
      {/* 1. TOP DISPATCH STATUS BAR */}
      <div className="bg-[#020617] border-b border-slate-800 px-3 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Captain & Hub Identity */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveView('courier_dispatch')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <BrandShield size="sm" variant="gold" animate />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors">
                    دسوق Express
                  </span>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    بوابة الكابتن
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  محور: دسوق ومراكز كفر الشيخ
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-slate-700 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>الكابتن: <strong>{user?.fullName || 'إبراهيم عاشور'}</strong></span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-400">مركبة: فان رقم (د س 4598)</span>
            </div>
          </div>

          {/* Quick Metrics Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Truck className="w-3.5 h-3.5" />
                <span>معي بالسيارة: <strong>{outForDeliveryCount}</strong></span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <PackageCheck className="w-3.5 h-3.5" />
                <span>تم التسليم: <strong>{deliveredCount}</strong></span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Wallet className="w-3.5 h-3.5" />
                <span>المطلوب تحصيله: <strong>{totalCashToCollect.toLocaleString()} ج.م</strong></span>
              </div>
            </div>

            {/* Live Sync Status */}
            <button
              onClick={() => refreshData()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="تحديث البيانات الفوري"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="تبديل المظهر"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Return to Customer Store */}
            <button
              onClick={() => {
                setRole('customer');
                setActiveView('catalog');
              }}
              className="flex items-center gap-1.5 bg-[#800020] hover:bg-[#600018] text-white px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-sm border border-[#D4AF37]/30"
              title="العودة لمتجر سوق دسوق للعملاء"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">سوق دسوق</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB NAVIGATION BAR */}
      <div className="bg-[#0F172A]/90 backdrop-blur-md px-3 sm:px-6 py-2 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-0.5 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>جدول شحنات التوصيل السريع لمدينة دسوق وضواحيها</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>تأكيد الاستلام والتسليم مشفر عبر OTP الرقمي</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GPS المتصل: حي دحروج، دسوق
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
