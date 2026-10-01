import React from 'react';
import { 
  Scale, 
  Ticket, 
  Users, 
  ShoppingBag, 
  Store, 
  FileSpreadsheet, 
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BrandShield } from '../common/ui';

export const SupportHeader: React.FC = () => {
  const { 
    disputes, 
    setRole, 
    setActiveView, 
    supportActiveTab, 
    setSupportActiveTab 
  } = useMarketplace();

  const totalCount = disputes.length;
  const openCount = disputes.filter(d => d.status === 'open' || d.status === 'opened').length;
  const urgentCount = disputes.filter(d => d.priority === 'urgent' && d.status !== 'resolved' && d.status !== 'rejected').length;

  const supportNavTabs = [
    { id: 'tickets', label: 'تذاكر النزاعات والشكاوى', icon: Ticket, badge: openCount },
    { id: 'customers', label: 'سجل المشترين 360', icon: Users },
    { id: 'orders', label: 'الطلبات والمنازعات', icon: ShoppingBag },
    { id: 'sellers', label: 'تقييم صحة التجار والامتثال', icon: Store },
    { id: 'reports', label: 'تقارير حماية المستهلك (قانون 181)', icon: FileSpreadsheet },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveView('support_disputes');
    setSupportActiveTab(tabId);
  };

  return (
    <header id="support-desk-header" className="sticky top-0 z-40 bg-[#171A21] text-[#FAF6EE] border-b border-[#D4AF37]/30 shadow-xl">
      
      {/* 1. ARBITRATION OPERATIONAL BAR */}
      <div className="bg-[#0F1218] border-b border-white/10 px-3 sm:px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Regulatory Mandate */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => handleTabClick('tickets')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <BrandShield size="sm" variant="burgundy" animate />
              <div className="flex flex-col">
                <span className="font-serif font-black text-sm text-white tracking-tight group-hover:text-[#D4AF37] transition-colors">
                  سوق دسوق
                </span>
                <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider">
                  مكتب التحكيم وحماية المستهلك (قانون 181)
                </span>
              </div>
            </div>

            {/* Legal Statutory SLA Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الالتزام القانوني بالرد (SLA): 98.6% خلال 24 ساعة</span>
            </div>
          </div>

          {/* Center Arbitration KPIs */}
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-gray-400 text-[10px]">نزاعات قيد الفحص:</span>
              <strong className="text-white font-mono">{openCount}</strong>
            </div>

            {urgentCount > 0 && (
              <button
                type="button"
                onClick={() => handleTabClick('tickets')}
                className="flex items-center gap-1.5 bg-red-950/70 hover:bg-red-900/70 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/40 transition-colors cursor-pointer text-xs font-bold animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{urgentCount} نزاع عاجل بحاجة لقرار استرداد</span>
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
                onClick={() => { setRole('admin'); setActiveView('admin_deck'); }}
                className="px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
                title="لوحة الإدارة"
              >
                الإدارة
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. ARBITRATION NAVIGATION TABS STRIP */}
      <div className="bg-[#1D222C] px-3 sm:px-6 py-1.5 border-t border-white/5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full">
            {supportNavTabs.map((tab) => {
              const isActive = (supportActiveTab || 'tickets') === tab.id;
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
            <span>الخط الساخن: <strong>19000</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">حماية المستهلك المصري</span>
          </div>
        </div>
      </div>

    </header>
  );
};
