import React, { useState } from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Scale, 
  Store, 
  User, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Truck,
  Plus,
  LifeBuoy,
  FileSpreadsheet,
  Phone,
  BarChart3,
  Users,
  ShoppingBag,
  Sparkles,
  Layers
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { TicketResolutionDesk } from './TicketResolutionDesk';
import { CustomerLookup360 } from './CustomerLookup360';
import { OrdersDisputeLookup } from './OrdersDisputeLookup';
import { SellerDisputeHealth } from './SellerDisputeHealth';
import { SupportReportsView } from './SupportReportsView';
import { SupportUnifiedInboxView } from './SupportUnifiedInboxView';
import { Inbox } from 'lucide-react';

export const SupportDisputesView: React.FC = () => {
  const { 
    disputes, 
    supportActiveTab, 
    setSupportActiveTab 
  } = useMarketplace();

  // Internal tab state synced with context - default to inbox for unified context
  const currentTab = supportActiveTab || 'inbox';

  // Cross-navigation handlers
  const handleOpenTicket = (ticketId: string) => {
    setSupportActiveTab('inbox');
  };

  const handleOpenCustomer = (customerId: string) => {
    setSupportActiveTab('customers');
  };

  const handleOpenOrder = (orderId: string) => {
    setSupportActiveTab('orders');
  };

  // Metrics Bar counts
  const totalCount = disputes.length;
  const openCount = disputes.filter(d => d.status === 'open' || d.status === 'opened').length;
  const urgentCount = disputes.filter(d => d.priority === 'urgent' && d.status !== 'resolved' && d.status !== 'rejected').length;
  const waitingCustomerCount = disputes.filter(d => d.status === 'waiting_for_customer').length;
  const waitingSellerCount = disputes.filter(d => d.status === 'waiting_for_seller' || d.status === 'seller_review').length;
  const resolvedCount = disputes.filter(d => d.status === 'resolved' || d.status === 'rejected' || d.status === 'resolved_refunded').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. Portal Header & Operational Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#800020]/10 text-[#800020] dark:bg-[#D4AF37]/20 dark:text-[#D4AF37]">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-stone-900 dark:text-zinc-100">
              مكتب الدعم الموحد والتحكيم التجاري | SOUQ DESOQ Support Desk
            </h1>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
            منظومة خدمة العملاء وحماية المستهلك وتدقيق النزاعات وسرعة المعالجة وفقاً لقانون 181 لسنة 2018.
          </p>
        </div>

        {/* Live SLA Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-right">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">معدل الاستجابة SLA</span>
              <strong className="text-xs text-emerald-900 dark:text-emerald-200">14 دقيقة / 98.6%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Ribbon (Fast Decision Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setSupportActiveTab('tickets')}
          className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xs hover:border-[#800020] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>كل التذاكر</span>
            <FileText className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <strong className="text-lg font-bold text-stone-900 dark:text-zinc-100 font-serif block mt-1">
            {totalCount}
          </strong>
        </div>

        <div 
          onClick={() => setSupportActiveTab('tickets')}
          className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xs hover:border-blue-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>قيد الفحص</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <strong className="text-lg font-bold text-blue-700 dark:text-blue-400 font-serif block mt-1">
            {openCount}
          </strong>
        </div>

        <div 
          onClick={() => setSupportActiveTab('tickets')}
          className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xs hover:border-rose-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-rose-600">
            <span>عاجل جداً</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <strong className="text-lg font-bold text-rose-600 dark:text-rose-400 font-serif block mt-1">
            {urgentCount}
          </strong>
        </div>

        <div 
          onClick={() => setSupportActiveTab('tickets')}
          className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xs hover:border-amber-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-amber-600">
            <span>انتظار العميل</span>
            <User className="w-3.5 h-3.5" />
          </div>
          <strong className="text-lg font-bold text-amber-700 dark:text-amber-400 font-serif block mt-1">
            {waitingCustomerCount}
          </strong>
        </div>

        <div 
          onClick={() => setSupportActiveTab('tickets')}
          className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xs hover:border-[#800020] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-[#800020] dark:text-rose-400">
            <span>انتظار التاجر</span>
            <Store className="w-3.5 h-3.5" />
          </div>
          <strong className="text-lg font-bold text-[#800020] dark:text-rose-400 font-serif block mt-1">
            {waitingSellerCount}
          </strong>
        </div>

        <div 
          onClick={() => setSupportActiveTab('tickets')}
          className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xs hover:border-emerald-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>تمت التسوية</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-serif block mt-1">
            {resolvedCount}
          </strong>
        </div>
      </div>

      {/* 3. Main Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl border border-stone-200 dark:border-zinc-700">
        {[
          { id: 'inbox', label: 'صندوق الوارد الموحد (Inbox 360°)', icon: Inbox },
          { id: 'tickets', label: 'مركز معالجة التذاكر الموحد', icon: Scale },
          { id: 'customers', label: 'سجل ودليل المشترين 360°', icon: Users },
          { id: 'orders', label: 'الطلبات والنزاعات المفتوحة', icon: ShoppingBag },
          { id: 'sellers', label: 'صحة المتاجر وسجل التجار', icon: Store },
          { id: 'reports', label: 'تقارير حماية المستهلك وSLA', icon: BarChart3 },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`support-nav-tab-${tab.id}`}
              type="button"
              onClick={() => setSupportActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#800020] text-white shadow-2xs dark:bg-[#D4AF37] dark:text-stone-950'
                  : 'text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Tab Subview Rendering */}
      <div>
        {currentTab === 'inbox' && (
          <SupportUnifiedInboxView 
            onOpenCustomer={handleOpenCustomer}
            onOpenOrder={handleOpenOrder}
          />
        )}

        {currentTab === 'tickets' && (
          <TicketResolutionDesk 
            onSelectCustomer={handleOpenCustomer}
            onSelectOrder={handleOpenOrder}
          />
        )}

        {currentTab === 'customers' && (
          <CustomerLookup360 
            onOpenTicket={handleOpenTicket}
            onOpenOrder={handleOpenOrder}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersDisputeLookup 
            onOpenTicket={handleOpenTicket}
            onOpenCustomer={handleOpenCustomer}
          />
        )}

        {currentTab === 'sellers' && (
          <SellerDisputeHealth 
            onOpenTicket={handleOpenTicket}
          />
        )}

        {currentTab === 'reports' && (
          <SupportReportsView />
        )}
      </div>

    </div>
  );
};
export default SupportDisputesView;
