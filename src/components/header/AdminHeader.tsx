import React from 'react';
import { 
  Shield, 
  TrendingUp, 
  Store, 
  Package, 
  ShoppingBag, 
  Wallet, 
  ShieldCheck, 
  Headphones, 
  FileCode, 
  Activity, 
  Sliders, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BrandShield } from '../common/ui';

export const AdminHeader: React.FC = () => {
  const { 
    orders, 
    sellers, 
    disputes, 
    setRole, 
    setActiveView, 
    adminActiveTab, 
    setAdminActiveTab,
    showToast 
  } = useMarketplace();

  // Compute platform vitals
  const totalGMV = orders.reduce((sum, o) => sum + (o.totalAmountEGP || o.totalPriceEGP || 0), 0);
  const pendingSellersCount = sellers.filter(s => s.status === 'under_review').length;
  const urgentDisputesCount = disputes.filter(d => (d.status === 'open' || d.status === 'urgent') && d.priority === 'urgent').length;

  const adminNavTabs = [
    { id: 'dashboard', label: 'لوحة القيادة (GMV)', icon: TrendingUp },
    { id: 'sellers', label: 'التجار والاعتماد', icon: Store, badge: pendingSellersCount },
    { id: 'products', label: 'المنتجات والرقابة', icon: Package },
    { id: 'orders', label: 'الطلبات والشحن', icon: ShoppingBag },
    { id: 'finance', label: 'المالية ودسوق باي', icon: Wallet },
    { id: 'content', label: 'توثيق KYC المركزي', icon: FileCheck, badge: pendingSellersCount },
    { id: 'support', label: 'النزاعات وحماية المستهلك', icon: Headphones, badge: urgentDisputesCount },
    { id: 'telemetry', label: 'مفاتيح الأمان وقواطع الحماية', icon: FileCode },
    { id: 'audit-logs', label: 'سجل التدقيق الأمني', icon: ShieldCheck },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveView('admin_deck');
    setAdminActiveTab(tabId);
  };

  return (
    <header id="admin-deck-header" className="sticky top-0 z-40 bg-[#121820] text-[#FAF6EE] border-b border-[#D4AF37]/30 shadow-xl">
      
      {/* 1. EXECUTIVE OPERATIONAL BAR */}
      <div className="bg-[#0A0E14] border-b border-white/10 px-3 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Executive Brand & Security Status */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <BrandShield size="sm" variant="burgundy" animate />
              <div className="flex flex-col">
                <span className="font-serif font-black text-sm text-white tracking-tight group-hover:text-[#D4AF37] transition-colors">
                  سوق دسوق
                </span>
                <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider">
                  الإدارة العليا والرقابة المركزية
                </span>
              </div>
            </div>

            {/* Platform Live Telemetry Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الأنظمة مستقرة (100% Uptime)</span>
            </div>
          </div>

          {/* Center KPIs (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-gray-400 text-[10px]">إجمالي التداول (GMV):</span>
              <strong className="text-white font-mono">{totalGMV.toLocaleString()} ج.م</strong>
            </div>

            {pendingSellersCount > 0 && (
              <button
                type="button"
                onClick={() => handleTabClick('content')}
                className="flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-colors cursor-pointer text-xs font-bold"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{pendingSellersCount} وثائق KYC بانتظار الاعتماد</span>
              </button>
            )}

            {urgentDisputesCount > 0 && (
              <button
                type="button"
                onClick={() => handleTabClick('support')}
                className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/40 transition-colors cursor-pointer text-xs font-bold animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{urgentDisputesCount} نزاع عاجل</span>
              </button>
            )}
          </div>

          {/* Right Role Switcher */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg border border-white/15 text-[10px]">
              <button
                type="button"
                onClick={() => { setRole('customer'); setActiveView('catalog'); }}
                className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold flex items-center gap-1"
                title="الواجهة كمتسوق"
              >
                <ArrowLeft className="w-3 h-3 text-[#D4AF37]" />
                <span className="hidden sm:inline">متجر المشترين</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('seller'); setActiveView('seller_dashboard'); }}
                className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
                title="بوابة التاجر"
              >
                التاجر
              </button>
              <button
                type="button"
                onClick={() => { setRole('courier'); setActiveView('courier_dispatch'); }}
                className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
                title="بوابة المندوب"
              >
                المندوب
              </button>
              <button
                type="button"
                onClick={() => { setRole('support'); setActiveView('support_disputes'); }}
                className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
                title="مكتب التحكيم"
              >
                التحكيم
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. EXECUTIVE NAVIGATION TABS STRIP */}
      <div className="bg-[#18202A] px-3 sm:px-6 py-1.5 border-t border-white/5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full">
            {adminNavTabs.map((tab) => {
              const isActive = (adminActiveTab || 'dashboard') === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#800020] text-white border border-[#D4AF37]/60 shadow-xs'
                      : 'text-[#FAF6EE]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="bg-[#D4AF37] text-[#800020] font-black text-[10px] px-1.5 py-0.2 rounded-full ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0 pl-2 border-r border-white/10 text-[10px] text-gray-400">
            <span>سلطة الإدارة العليا</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">تدقيق أمني شامل</span>
          </div>
        </div>
      </div>

    </header>
  );
};
