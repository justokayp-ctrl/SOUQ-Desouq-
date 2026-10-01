import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, 
  User, 
  ShoppingBag, 
  Store, 
  Scale, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Send, 
  RotateCcw, 
  FileText, 
  ArrowRight, 
  Search, 
  Filter, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  DollarSign, 
  ChevronRight,
  RefreshCw,
  ExternalLink,
  MapPin,
  Flame,
  Check,
  X
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { api } from '../../services/api';
import { Dispute, DisputeStatus, DisputePriority } from '../../types';

interface SupportUnifiedInboxViewProps {
  onOpenCustomer?: (customerId: string) => void;
  onOpenOrder?: (orderId: string) => void;
}

export const SupportUnifiedInboxView: React.FC<SupportUnifiedInboxViewProps> = ({
  onOpenCustomer,
  onOpenOrder
}) => {
  const { 
    disputes, 
    orders,
    sellers,
    replyToDispute, 
    addDisputeNote, 
    resolveDispute, 
    showToast,
    refreshData
  } = useMarketplace();

  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'all_context' | 'customer' | 'order' | 'seller' | 'dispute' | 'resolution'>('all_context');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'normal'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'waiting' | 'resolved'>('all');

  // Input states
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to build fallback inbox items from context
  const buildFallbackInbox = () => {
    return disputes.map(d => {
      const o = orders.find(ord => ord.id === d.orderId);
      const s = sellers.find(sel => sel.id === d.sellerId);
      return {
        dispute: d,
        customer: {
          id: d.customerId,
          name: d.customerName,
          phone: o?.customerPhone || '01012345678',
          email: 'customer@souqdesoq.eg',
          totalOrders: 3,
          totalSpentEGP: 2450,
          disputeRatePercent: 8,
          city: o?.shippingAddress?.city || 'دسوق',
          trustScore: 94
        },
        order: o ? {
          id: o.id,
          createdAt: o.createdAt,
          totalAmountEGP: o.totalAmountEGP,
          orderStatus: o.orderStatus,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          shippingAddress: o.shippingAddress,
          items: o.subOrders?.flatMap(sub => sub.items) || [],
          assignedCourierName: o.assignedCourierName
        } : null,
        seller: s ? {
          id: s.id,
          storeName: s.name,
          category: (s as any).category || (s as any).businessCategory || 'تراث وتجارة دسوق',
          complianceRating: s.rating,
          fulfilledOrders: 142,
          city: 'دسوق',
          disputeResolutionRatePercent: 98
        } : null
      };
    });
  };

  // Load Inbox from backend
  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSupportInbox();
      if (Array.isArray(data) && data.length > 0) {
        setInboxItems(data);
        if (!selectedDisputeId) {
          setSelectedDisputeId(data[0].dispute.id);
        }
      } else {
        const fallback = buildFallbackInbox();
        setInboxItems(fallback);
        if (fallback.length > 0 && !selectedDisputeId) {
          setSelectedDisputeId(fallback[0].dispute.id);
        }
      }
    } catch (err: any) {
      console.warn('Fallback to local disputes:', err.message);
      const fallback = buildFallbackInbox();
      setInboxItems(fallback);
      if (fallback.length > 0 && !selectedDisputeId) {
        setSelectedDisputeId(fallback[0].dispute.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  // Filtered inbox list
  const filteredInbox = useMemo(() => {
    return inboxItems.filter(item => {
      const d: Dispute = item.dispute;
      if (!d) return false;

      if (filterPriority !== 'all' && d.priority !== filterPriority) return false;
      if (filterStatus === 'open' && (d.status === 'resolved' || d.status === 'rejected')) return false;
      if (filterStatus === 'resolved' && d.status !== 'resolved' && d.status !== 'rejected') return false;
      if (filterStatus === 'waiting' && !d.status.includes('waiting')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCustomer = item.customer?.name?.toLowerCase().includes(q) || false;
        const matchesOrder = item.order?.id?.toLowerCase().includes(q) || false;
        const matchesSeller = item.seller?.storeName?.toLowerCase().includes(q) || false;
        const matchesReason = d.description?.toLowerCase().includes(q) || false;
        return matchesCustomer || matchesOrder || matchesSeller || matchesReason;
      }

      return true;
    });
  }, [inboxItems, searchQuery, filterPriority, filterStatus]);

  // Selected item
  const activeItem = useMemo(() => {
    if (!selectedDisputeId) return filteredInbox[0] || null;
    return inboxItems.find(i => i.dispute.id === selectedDisputeId) || filteredInbox[0] || null;
  }, [inboxItems, filteredInbox, selectedDisputeId]);

  // One-click canned response applier
  const applyCannedReply = (text: string) => {
    setReplyText(text);
  };

  // Submit reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !activeItem) return;
    try {
      setIsSubmitting(true);
      await replyToDispute(activeItem.dispute.id, replyText, 'support');
      showToast('تم إرسال الرد وتحديث سجل النزاع', 'success');
      setReplyText('');
      await fetchInbox();
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال الرد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add internal note
  const handleAddInternalNote = async () => {
    if (!internalNoteText.trim() || !activeItem) return;
    try {
      setIsSubmitting(true);
      await addDisputeNote(activeItem.dispute.id, internalNoteText);
      showToast('تمت إضافة ملاحظة التحقيق الداخلية بنجاح', 'success');
      setInternalNoteText('');
      await fetchInbox();
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة الملاحظة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-Click Arbitration Actions
  const handleArbitrate = async (action: 'refund' | 'replacement' | 'reject') => {
    if (!activeItem) return;
    const notes: Record<string, string> = {
      refund: 'إلزام التاجر برد كامل المبلغ للمشتري لحساب المحفظة لعدم مطابقة الشحنة وفق قانون 181 لسنة 2018.',
      replacement: 'إلزام التاجر بإرسال قطعة بديلة جديدة مطابقة للمواصفات مع استلام المعيبة مجاناً.',
      reject: 'رفض الشكوى وحفظ النزاع لثبوت سلامة الشحنة ومطابقتها للشروط، مع الإفراج عن مستحقات التاجر.'
    };

    try {
      setIsSubmitting(true);
      await resolveDispute(activeItem.dispute.id, action === 'reject' ? 'rejected' : 'resolved', notes[action]);
      showToast(`تم اعتماد قرار التحكيم: ${action === 'refund' ? 'رد المبلغ' : action === 'replacement' ? 'استبدال مجاني' : 'حفظ النزاع'}`, 'success');
      await fetchInbox();
    } catch (err: any) {
      showToast(err.message || 'فشل تطبيق قرار التحكيم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* 1. TOP PIPELINE BREADCRUMB INDICATOR */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-stone-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37]">
                <Inbox className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-stone-900 dark:text-white">
                صندوق وارد الدعم والنزاعات | Unified Support Inbox
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              عرض سياق النزاع الشامل (Customer 360 + Order + Seller + Dispute + Resolution) دون التنقل بين صفحات متعددة
            </p>
          </div>

          {/* Refresh & Security Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>صلاحيات دعم فني وتحكيم تجاري (Support RBAC)</span>
            </span>

            <button
              type="button"
              onClick={fetchInbox}
              className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 dark:text-zinc-300 cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5-Step Unified Pipeline Ribbon */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
          {[
            { id: 'all_context', label: 'كل سياق النزاع (Unified 360°)', icon: Sparkles },
            { id: 'customer', label: '1. العميل (Customer 360)', icon: User },
            { id: 'order', label: '2. تفاصيل الطلب (Order)', icon: ShoppingBag },
            { id: 'seller', label: '3. سجل التاجر (Seller)', icon: Store },
            { id: 'dispute', label: '4. محادثة النزاع (Dispute)', icon: MessageSquare },
            { id: 'resolution', label: '5. قرار التحكيم (Resolution)', icon: Scale },
          ].map((step, idx) => {
            const isActive = activeStep === step.id;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#800020] text-white shadow-xs dark:bg-[#D4AF37] dark:text-stone-950 font-black'
                    : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SPLIT: INBOX LIST (RIGHT) + CONTEXT COCKPIT (LEFT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: INBOX TICKETS LIST (4 COLS) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 p-4 shadow-xs space-y-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالعميل، الطلب، أو التاجر..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700"
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterStatus === 'all' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600'}`}
            >
              الكل ({inboxItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'urgent' ? 'all' : 'urgent')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterPriority === 'urgent' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}
            >
              عاجل ⚡
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('open')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterStatus === 'open' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'}`}
            >
              مفتوحة
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('resolved')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterStatus === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'}`}
            >
              مغلقة
            </button>
          </div>

          {/* Tickets List */}
          <div className="space-y-2 max-h-[750px] overflow-y-auto scrollbar-thin">
            {filteredInbox.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                لا توجد نزاعات تطابق معايير البحث
              </div>
            ) : (
              filteredInbox.map(item => {
                const d: Dispute = item.dispute;
                const isSelected = selectedDisputeId === d.id;
                const isUrgent = d.priority === 'urgent';

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDisputeId(d.id);
                      if (window.innerWidth < 1024) {
                        document.getElementById('support-context-cockpit')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 relative ${
                      isSelected
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-stone-50/60 dark:bg-zinc-800/40 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-stone-900 dark:text-white">
                        <span className="font-mono text-[11px]">#{d.id}</span>
                        {isUrgent && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            عاجل
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {d.createdAt?.slice(0, 10)}
                      </span>
                    </div>

                    {/* Customer & Seller Snippet */}
                    <div className="text-stone-700 dark:text-zinc-300">
                      <div className="font-bold flex items-center justify-between">
                        <span>المشتري: {item.customer?.name}</span>
                        <span className="font-mono text-[11px] text-stone-500">#{item.order?.id}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                        التاجر: {item.seller?.storeName}
                      </div>
                    </div>

                    {/* Dispute Reason preview */}
                    <p className="text-[11px] text-stone-600 dark:text-zinc-400 line-clamp-1 bg-white/60 dark:bg-zinc-900/60 p-1.5 rounded-lg">
                      {d.description}
                    </p>

                    {/* Status Pill */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        d.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'urgent' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status === 'resolved' ? 'تمت التسوية' :
                         d.status === 'urgent' ? 'عاجل جداً' :
                         d.status === 'waiting_for_seller' ? 'بانتظار التاجر' : 'قيد الفحص'}
                      </span>

                      <span className="text-[10px] text-stone-400">
                        {d.messages?.length || 0} رسائل
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LEFT COLUMN: 360° CONTEXT COCKPIT (8 COLS) */}
        <div id="support-context-cockpit" className="lg:col-span-8 space-y-5">
          {activeItem ? (
            <>
              {/* SUMMARY HERO BANNER FOR THE ACTIVE DISPUTE */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#800020] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono">
                      تذكرة #{activeItem.dispute.id}
                    </span>
                    <span className="font-black text-stone-900 dark:text-white text-base">
                      {activeItem.dispute.reason === 'defective_product' ? 'منتج معيب أو تالف' :
                       activeItem.dispute.reason === 'wrong_item' ? 'استلام قطعة مختلفة' :
                       activeItem.dispute.reason === 'not_as_described' ? 'غير مطابق للمواصفات' :
                       'تأخر وصول الشحنة'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-zinc-400 mt-1">
                    طلب التحكيم من المشتري: <strong className="text-rose-600">{activeItem.dispute.requestedResolution === 'refund' ? 'استرداد كامل المبلغ المدفوع' : 'استبدال بقطعة سليمة'}</strong>
                  </p>
                </div>

                {/* Quick Call Customer / Merchant */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${activeItem.customer?.phone}`}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال بالعميل</span>
                  </a>

                  <a
                    href={`tel:${activeItem.seller?.phone}`}
                    className="flex items-center gap-1.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-zinc-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Store className="w-3.5 h-3.5 text-[#800020]" />
                    <span>اتصال بالتاجر</span>
                  </a>
                </div>
              </div>

              {/* SECTION A: CUSTOMER 360 & ORDER 360 SIDE-BY-SIDE */}
              {(activeStep === 'all_context' || activeStep === 'customer' || activeStep === 'order') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* 1. CUSTOMER 360 CARD */}
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-black text-stone-900 dark:text-white">
                          بيانات العميل (Customer 360)
                        </h3>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        درجة الثقة: {activeItem.customer?.trustScore || 95}%
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">اسم العميل:</span>
                        <strong className="text-stone-900 dark:text-white">{activeItem.customer?.name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">رقم الهاتف:</span>
                        <span className="font-mono text-stone-800 dark:text-zinc-200">{activeItem.customer?.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">المدينة / المركز:</span>
                        <span className="text-stone-800 dark:text-zinc-200">{activeItem.customer?.city || 'دسوق'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">إجمالي الطلبات السابقة:</span>
                        <span className="font-mono font-bold text-stone-800 dark:text-zinc-200">{activeItem.customer?.totalOrders} طلبات</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">معدل رفع النزاعات:</span>
                        <span className="font-mono font-bold text-rose-600">{activeItem.customer?.disputeRatePercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">إجمالي الإنفاق:</span>
                        <span className="font-mono font-black text-emerald-600">{activeItem.customer?.totalSpentEGP} ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. ORDER 360 CARD */}
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-600" />
                        <h3 className="text-sm font-black text-stone-900 dark:text-white">
                          سياق الطلب محل النزاع (Order)
                        </h3>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                        #{activeItem.order?.id}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">قيمة الطلب:</span>
                        <strong className="font-mono text-base font-black text-[#800020] dark:text-[#D4AF37]">
                          {activeItem.order?.totalAmountEGP} ج.م
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">طريقة الدفع:</span>
                        <span className="font-bold text-stone-800 dark:text-zinc-200">
                          {activeItem.order?.paymentMethod === 'cash_on_delivery' ? 'دفع عند الاستلام (COD)' : 'مدفوع إلكترونياً'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">مندوب التوصيل:</span>
                        <span className="text-stone-800 dark:text-zinc-200">{activeItem.order?.assignedCourierName || 'كابتن دسوق إكسبريس'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">عنوان التسليم:</span>
                        <span className="text-stone-700 dark:text-zinc-300 text-left font-medium">
                          {activeItem.order?.shippingAddress?.district} - {activeItem.order?.shippingAddress?.streetDetails}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION B: SELLER 360 */}
              {(activeStep === 'all_context' || activeStep === 'seller') && activeItem.seller && (
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#800020]" />
                      <h3 className="text-sm font-black text-stone-900 dark:text-white">
                        سجل التاجر وموقفه القانوني (Seller 360)
                      </h3>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {activeItem.seller.status === 'active' ? 'تاجر نشط ومعتمد' : 'تحت المراجعة'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-2xl">
                      <span className="text-stone-500 text-[11px] block">اسم المتجر</span>
                      <strong className="text-stone-900 dark:text-white mt-1 block">{activeItem.seller.storeName}</strong>
                    </div>
                    <div className="bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-2xl">
                      <span className="text-stone-500 text-[11px] block">المالك المسؤول</span>
                      <strong className="text-stone-900 dark:text-white mt-1 block">{activeItem.seller.ownerName}</strong>
                    </div>
                    <div className="bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-2xl">
                      <span className="text-stone-500 text-[11px] block">السجل التجاري</span>
                      <strong className="font-mono text-stone-900 dark:text-white mt-1 block">{activeItem.seller.commercialRegister}</strong>
                    </div>
                    <div className="bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-2xl">
                      <span className="text-stone-500 text-[11px] block">تقييم المتجر</span>
                      <strong className="text-amber-600 mt-1 block font-mono">★ {activeItem.seller.rating || 4.8} / 5.0</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: DISPUTE TIMELINE & MESSAGES */}
              {(activeStep === 'all_context' || activeStep === 'dispute') && (
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-black text-stone-900 dark:text-white">
                        سجل المحادثة وتصريحات الطرفين (Dispute Messages)
                      </h3>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      تاريخ الفتح: {activeItem.dispute.createdAt}
                    </span>
                  </div>

                  {/* Customer statement */}
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">
                      بيان المشتري الأولي:
                    </span>
                    <p className="text-stone-700 dark:text-zinc-300 leading-relaxed">
                      "{activeItem.dispute.description}"
                    </p>
                  </div>

                  {/* Message thread */}
                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin p-1">
                    {activeItem.dispute.messages && activeItem.dispute.messages.length > 0 ? (
                      activeItem.dispute.messages.map((m: any, i: number) => {
                        const isSupport = m.sender === 'support' || m.sender === 'admin';
                        const isCustomer = m.sender === 'customer';

                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                              isSupport
                                ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 mr-auto text-sky-900 dark:text-sky-200'
                                : isCustomer
                                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 ml-auto text-stone-800 dark:text-zinc-200'
                                : 'bg-stone-100 dark:bg-zinc-800 border border-stone-200 text-stone-800 dark:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-75">
                              <span>{m.senderName || (isSupport ? 'مكتب الدعم والتحكيم' : isCustomer ? 'المشتري' : 'التاجر')}</span>
                              <span className="font-mono">{m.timestamp?.slice(11, 16) || ''}</span>
                            </div>
                            <p className="leading-relaxed">{m.message}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-stone-400 py-2">لا توجد رسائل إضافية مسجلة بعد في التذكرة.</p>
                    )}
                  </div>

                  {/* Quick Canned Responses */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-stone-400">ردود قانونية معتمدة جاهزة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyCannedReply('عزيزي المشتري، نرجو التكرم بتزويدنا بصور واضحة للقطعة وبوليصة الشحن الملصقة على الطرد خلال 24 ساعة لاستكمال التحقيق.')}
                        className="bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                      >
                        طلب صور إضافية
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCannedReply('تنبيه للتاجر: يرجى توضيح سبب الخلاف وإرسال إثبات الفحص الفني قبل الشحن خلال 24 ساعة تفادياً لإصدار قرار تحكيم تلقائي لصالح المشتري.')}
                        className="bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                      >
                        إشعار التاجر بالرد
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCannedReply('وفقاً للمادة 18 من قانون حماية المستهلك رقم 181 لسنة 2018، تقرر إلزام التاجر باستبدال فوري مجاني دون أي رسوم إضافية.')}
                        className="bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                      >
                        إشعار استبدال مجاني
                      </button>
                    </div>
                  </div>

                  {/* Reply Composer */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="اكتب رداً رسمياً موجهاً لأطراف النزاع..."
                      className="flex-1 p-2.5 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={isSubmitting || !replyText.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION D: ONE-CLICK ARBITRATION ACTIONS (RESOLUTION) */}
              {(activeStep === 'all_context' || activeStep === 'resolution') && (
                <div className="bg-gradient-to-r from-stone-900 to-zinc-900 text-white p-6 rounded-3xl border border-stone-700 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-black tracking-tight">
                        إجراءات التحكيم التجاري وقرار التسوية (Resolution)
                      </h3>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      قانون حماية المستهلك 181/2018
                    </span>
                  </div>

                  <p className="text-xs text-stone-300">
                    بصفتك ممثل الدعم المعتمد، يمكنك اتخاذ قرار التحكيم الملزم وتطبيقه على النظام المالي مباشرة:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    
                    {/* 1. Full Refund */}
                    <button
                      type="button"
                      onClick={() => handleArbitrate('refund')}
                      disabled={isSubmitting || activeItem.dispute.status === 'resolved'}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black p-3.5 rounded-2xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 min-h-[72px]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>رد كامل المبلغ للمشتري</span>
                      <span className="text-[10px] opacity-80">خصم من رصيد التاجر</span>
                    </button>

                    {/* 2. Free Replacement */}
                    <button
                      type="button"
                      onClick={() => handleArbitrate('replacement')}
                      disabled={isSubmitting || activeItem.dispute.status === 'resolved'}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-black p-3.5 rounded-2xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 min-h-[72px]"
                    >
                      <Truck className="w-4 h-4" />
                      <span>استبدال فوري مجاني</span>
                      <span className="text-[10px] opacity-80">عبر دسوق إكسبريس</span>
                    </button>

                    {/* 3. Reject / Close */}
                    <button
                      type="button"
                      onClick={() => handleArbitrate('reject')}
                      disabled={isSubmitting || activeItem.dispute.status === 'resolved'}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-black p-3.5 rounded-2xl text-xs flex flex-col items-center justify-center gap-1.5 border border-stone-700 transition-all cursor-pointer disabled:opacity-50 min-h-[72px]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-stone-400" />
                      <span>رفض النزاع وحفظ الشكوى</span>
                      <span className="text-[10px] opacity-80">الإفراج عن مستحقات التاجر</span>
                    </button>

                  </div>

                  {/* Internal Note Input for Audit */}
                  <div className="pt-3 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      placeholder="أضف ملاحظة تحقيق داخلية للملف (سرية للرقابة الداخلية فقط)..."
                      className="flex-1 p-2.5 text-xs rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddInternalNote}
                      disabled={isSubmitting || !internalNoteText.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      حفظ الملاحظة
                    </button>
                  </div>

                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-zinc-800 shadow-sm">
              <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-stone-800 dark:text-zinc-200">
                اختر تذكرة نزاع من القائمة لمعاينة السياق الشامل
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                سيظهر سياق العميل والطلب والتاجر وتاريخ الرسائل وخيارات التحكيم في شاشة واحدة موحدة.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
