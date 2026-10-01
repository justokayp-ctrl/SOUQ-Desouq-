import React, { useState, useEffect } from 'react';
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
  CornerDownLeft,
  ExternalLink,
  LifeBuoy,
  FileSpreadsheet,
  Phone,
  Search,
  Filter,
  Send,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  ShieldCheck,
  Tag,
  Flame,
  HelpCircle,
  Package,
  Layers,
  Clock3,
  Calendar,
  Eye
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Dispute, DisputeStatus, DisputePriority } from '../../types';

interface TicketResolutionDeskProps {
  onSelectCustomer?: (customerId: string) => void;
  onSelectOrder?: (orderId: string) => void;
}

const CANNED_RESPONSES = [
  {
    id: 'canned-1',
    title: 'طلب صور وأدلة إضافية من المشتري',
    category: 'المشتري',
    text: 'عزيزي المشتري، نرجو التكرم بتزويدنا بصور واضحة للقطعة المستلمة وبوليصة الشحن الملصقة على الطرد خلال 24 ساعة لاستكمال التحقيق في الشكوى.'
  },
  {
    id: 'canned-2',
    title: 'إشعار التاجر بضرورة الرد والتحقق',
    category: 'التاجر',
    text: 'تنبيه للتاجر: يرجى مراجعة تفاصيل الشكوى وتوضيح حالة الطلب ورقم بوليصة الشحن خلال 24 ساعة كحد أقصى تفادياً لإصدار قرار تحكيم تلقائي لصالح المستهلك.'
  },
  {
    id: 'canned-3',
    title: 'تأكيد استبدال مجاني عبر دسوق إكسبريس',
    category: 'تحكيم',
    text: 'وفقاً للمادة 18 من قانون حماية المستهلك 181/2018، تقرر إلزام التاجر بإرسال قطعة بديلة جديدة مع مندوب دسوق إكسبريس واستلام القطعة المعيبة مجاناً دون أي مصاريف إضافية.'
  },
  {
    id: 'canned-4',
    title: 'تأكيد رد كامل المبلغ للمحفظة / الحساب',
    category: 'مالية',
    text: 'تم اعتماد قرار التحكيم برد كامل القيمة المدفوعة إلى حساب المشتري، وسيتم خصم المبلغ من الرصيد المعلق للتاجر في منصة سوق دسوق فوراً.'
  },
  {
    id: 'canned-5',
    title: 'توضيح أسباب حفظ الشكوى لعدم المطابقة',
    category: 'حفظ',
    text: 'بعد فحص الأدلة وتدقيق سجلات الشحن والفحص الفني، تبين سلامة الشحنة ومطابقتها للمواصفات المعروضة، وتقرر حفظ التذكرة وإغلاق النزاع.'
  }
];

export const TicketResolutionDesk: React.FC<TicketResolutionDeskProps> = ({ 
  onSelectCustomer, 
  onSelectOrder 
}) => {
  const { 
    disputes, 
    resolveDispute,
    replyToDispute,
    addDisputeNote,
    updateDisputeStatus,
    getTicketContext,
    showToast 
  } = useMarketplace();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'urgent' | 'waiting_customer' | 'waiting_seller' | 'in_progress' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'normal' | 'low'>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  
  // Context state
  const [ticketContext, setTicketContext] = useState<any | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [selectedContextNode, setSelectedContextNode] = useState<'customer' | 'order' | 'product' | 'seller' | 'payment' | 'shipping'>('customer');
  
  // Input states
  const [adminReply, setAdminReply] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [arbitrationMemo, setArbitrationMemo] = useState('');
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  // Sync selection
  useEffect(() => {
    if (disputes.length > 0 && !selectedDisputeId) {
      setSelectedDisputeId(disputes[0].id);
    }
  }, [disputes, selectedDisputeId]);

  // Load ticket context on selection
  useEffect(() => {
    if (!selectedDisputeId) {
      setTicketContext(null);
      return;
    }

    let isMounted = true;
    const loadContext = async () => {
      setIsLoadingContext(true);
      try {
        const ctx = await getTicketContext(selectedDisputeId);
        if (isMounted) {
          setTicketContext(ctx);
        }
      } catch (err) {
        if (isMounted) {
          showToast('تعذر تحميل بيانات السياق المرتبطة بالنزاع');
        }
      } finally {
        if (isMounted) {
          setIsLoadingContext(false);
        }
      }
    };

    loadContext();
    return () => {
      isMounted = false;
    };
  }, [selectedDisputeId, disputes, getTicketContext, showToast]);

  // Filtered Disputes
  const filteredDisputes = disputes.filter(d => {
    // 1. Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchId = d.id.toLowerCase().includes(term);
      const matchCustomer = d.customerName?.toLowerCase().includes(term);
      const matchSeller = d.sellerName?.toLowerCase().includes(term);
      const matchOrder = d.orderId?.toLowerCase().includes(term);
      const matchDesc = d.description?.toLowerCase().includes(term);
      if (!matchId && !matchCustomer && !matchSeller && !matchOrder && !matchDesc) {
        return false;
      }
    }

    // 2. Status filter
    if (statusFilter === 'open') {
      if (d.status !== 'open' && d.status !== 'opened') return false;
    } else if (statusFilter === 'urgent') {
      if (d.priority !== 'urgent' || d.status === 'resolved' || d.status === 'rejected') return false;
    } else if (statusFilter === 'waiting_customer') {
      if (d.status !== 'waiting_for_customer') return false;
    } else if (statusFilter === 'waiting_seller') {
      if (d.status !== 'waiting_for_seller' && d.status !== 'seller_review') return false;
    } else if (statusFilter === 'in_progress') {
      if (d.status !== 'under_investigation' && d.status !== 'admin_arbitration') return false;
    } else if (statusFilter === 'resolved') {
      if (d.status !== 'resolved' && d.status !== 'rejected' && d.status !== 'resolved_refunded') return false;
    }

    // 3. Priority filter
    if (priorityFilter !== 'all' && d.priority !== priorityFilter) {
      return false;
    }

    // 4. Reason filter
    if (reasonFilter !== 'all' && d.reason !== reasonFilter) {
      return false;
    }

    return true;
  });

  const activeDispute = disputes.find(d => d.id === selectedDisputeId) || filteredDisputes[0] || disputes[0];

  // Actions
  const handleSendMessage = async () => {
    if (!adminReply.trim() || !activeDispute) return;
    try {
      await replyToDispute(activeDispute.id, adminReply, 'admin');
      setAdminReply('');
      showToast('تم إرسال الرد الرسمي بنجاح وإشعار أطراف النزاع');
    } catch {
      showToast('خطأ أثناء إرسال الرسالة');
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNoteInput.trim() || !activeDispute) return;
    try {
      await addDisputeNote(activeDispute.id, internalNoteInput);
      setInternalNoteInput('');
      showToast('تم حفظ الملاحظة الداخلية السرية');
    } catch {
      showToast('تعذر حفظ الملاحظة');
    }
  };

  const handleUpdateStatusAndPriority = async (newStatus: string, newPriority: string) => {
    if (!activeDispute) return;
    try {
      await updateDisputeStatus(activeDispute.id, newStatus, newPriority);
      showToast('تم تحديث تصنيف وحالة التذكرة بنجاح');
    } catch {
      showToast('تعذر تحديث تصنيف التذكرة');
    }
  };

  const handleEscalateTicket = async (department: 'senior_arbiter' | 'legal' | 'logistics') => {
    if (!activeDispute) return;
    const labels = {
      senior_arbiter: 'كبير محكمي المنصة',
      legal: 'المستشار القانوني (حماية المستهلك)',
      logistics: 'مدير شحن دسوق إكسبريس'
    };
    const noteText = `[تصعيد إداري عاجل]: تم تصعيد التذكرة إلى (${labels[department]}) لفحص النزاع وإصدار قرار عاجل.`;
    try {
      await addDisputeNote(activeDispute.id, noteText);
      await updateDisputeStatus(activeDispute.id, 'under_investigation', 'urgent');
      showToast(`تم تصعيد التذكرة إلى ${labels[department]} وتحديث الأولوية إلى عاجلة جداً`);
    } catch {
      showToast('تعذر تصعيد التذكرة');
    }
  };

  const handleArbitrate = async (action: 'refund' | 'replacement' | 'dismiss') => {
    if (!activeDispute) return;
    
    let resolutionText = '';
    let status: 'resolved' | 'rejected' = 'resolved';

    if (action === 'refund') {
      resolutionText = arbitrationMemo.trim() || `تم الحكم لصالح المشتري برد كامل المبلغ وفقاً للمادة 18 من قانون حماية المستهلك رقم 181 لسنة 2018 وخصم القيمة من التاجر.`;
      status = 'resolved';
    } else if (action === 'replacement') {
      resolutionText = arbitrationMemo.trim() || `تم إلزام التاجر بإرسال قطعة بديلة جديدة مع مندوب دسوق إكسبريس واستلام التالف مجاناً دون تكلفة إضافية.`;
      status = 'resolved';
    } else {
      resolutionText = arbitrationMemo.trim() || `تم فحص الأدلة وتدقيق سلامة المنتج والبوليصة، وتقرر رفض الشكوى وحفظ النزاع لعدم استيفاء شروط المرتجع.`;
      status = 'rejected';
    }

    try {
      await resolveDispute(activeDispute.id, status, resolutionText);
      setArbitrationMemo('');
      showToast('تم إصدار واعتماد قرار التحكيم النهائي وتحديث حسابات الأطراف');
    } catch {
      showToast('خطأ أثناء إرسال قرار التحكيم');
    }
  };

  const insertCannedReply = (text: string) => {
    setAdminReply(text);
  };

  return (
    <div className="space-y-4">
      {/* Search & Comprehensive Filter Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Universal Fast Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="support-ticket-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث سريع برقم التذكرة، اسم المشتري، رقم الطلب، اسم التاجر، أو الكلمات المفتاحية..."
              className="w-full bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#800020] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-stone-500">الأولوية:</span>
              <select
                id="support-filter-priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">كل الأولويات</option>
                <option value="urgent">عاجل جداً</option>
                <option value="high">مرتفع</option>
                <option value="normal">عادي</option>
                <option value="low">منخفض</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-stone-500">السبب:</span>
              <select
                id="support-filter-reason"
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">كل الأسباب</option>
                <option value="defective_product">عيب صناعة أو تلف</option>
                <option value="not_as_described">غير مطابق للمواصفات</option>
                <option value="wrong_item">استلام منتج خاطئ</option>
                <option value="late_delivery">تأخر الشحنة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-stone-100 dark:border-zinc-800">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'open', label: 'قيد الفحص (Open)' },
            { key: 'urgent', label: 'عاجل جداً (Urgent)' },
            { key: 'waiting_customer', label: 'بانتظار العميل (Waiting Customer)' },
            { key: 'waiting_seller', label: 'بانتظار التاجر (Waiting Seller)' },
            { key: 'in_progress', label: 'قيد التحقيق (In Progress)' },
            { key: 'resolved', label: 'تم الحل والتسوية (Resolved)' },
          ].map((chip) => {
            const isActive = statusFilter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setStatusFilter(chip.key as any)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#800020] text-white border-[#5C061E] dark:bg-[#D4AF37] dark:text-stone-950 dark:border-[#B89628] shadow-2xs'
                    : 'bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:bg-stone-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Triage List + Coherent 360 Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Triage List (4 spans) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
              قائمة التذاكر النشطة ({filteredDisputes.length})
            </span>
            <span className="text-[11px] text-stone-400">تحديث فوري</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[860px] pr-0.5">
            {filteredDisputes.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 text-center text-xs text-stone-400">
                لا توجد تذاكر تطابق معايير البحث والتصفية المحددة.
              </div>
            ) : (
              filteredDisputes.map((dispute) => {
                const isSelected = activeDispute?.id === dispute.id;
                const isUrgent = dispute.priority === 'urgent';
                const isResolved = dispute.status === 'resolved' || dispute.status === 'rejected' || dispute.status === 'resolved_refunded';

                return (
                  <div
                    key={dispute.id}
                    id={`ticket-card-${dispute.id}`}
                    onClick={() => setSelectedDisputeId(dispute.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/40 dark:bg-zinc-800 border-[#800020] dark:border-[#D4AF37] ring-1 ring-[#800020]/20 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                    } ${isUrgent && !isResolved ? 'border-r-4 border-r-rose-500' : ''}`}
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-stone-100 dark:border-zinc-800">
                      <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                        {dispute.id}
                      </span>
                      <div className="flex items-center gap-1">
                        {isUrgent && (
                          <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 text-[10px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 text-rose-600" />
                            <span>عاجل</span>
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dispute.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          dispute.status === 'under_investigation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          dispute.status === 'waiting_for_customer' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          dispute.status === 'waiting_for_seller' || dispute.status === 'seller_review' ? 'bg-rose-100 text-[#800020] dark:bg-rose-950 dark:text-rose-300' :
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {dispute.status === 'open' ? 'قيد الفحص' :
                           dispute.status === 'under_investigation' ? 'قيد التحقيق' :
                           dispute.status === 'waiting_for_customer' ? 'انتظار العميل' :
                           dispute.status === 'waiting_for_seller' || dispute.status === 'seller_review' ? 'انتظار التاجر' : 'تم الحل'}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Merchant */}
                    <div className="mt-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-stone-800 dark:text-zinc-200">
                        <span className="font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{dispute.customerName}</span>
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {dispute.sellerName}
                        </span>
                      </div>

                      <p className="text-stone-500 dark:text-zinc-400 text-[11px] line-clamp-1">
                        {dispute.reason === 'defective_product' ? 'عيب صناعة أو تلف أثناء الشحن' :
                         dispute.reason === 'not_as_described' ? 'غير مطابق للمواصفات المعروضة' :
                         dispute.reason === 'wrong_item' ? 'استلام منتج أو مقاس مختلف' : 'تأخر استلام الشحنة'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                        <span>{new Date(dispute.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{dispute.messages?.length || 0} رسائل</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Unified Coherent Workspace (8 spans) */}
        <div className="lg:col-span-8">
          {activeDispute ? (
            <div className="space-y-4">
              
              {/* 1. Ticket Meta & Status/Priority Bar */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-stone-900 dark:text-zinc-50 font-serif">
                        التذكرة: {activeDispute.id}
                      </h2>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        activeDispute.priority === 'urgent' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        activeDispute.priority === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        الأولوية: {activeDispute.priority === 'urgent' ? 'عاجلة جداً' : activeDispute.priority === 'high' ? 'مرتفعة' : 'عادية'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span>الطلب المرجعي: <strong className="text-stone-800 dark:text-zinc-200 font-mono">{activeDispute.orderId}</strong></span>
                      <span>تاريخ الفتح: {new Date(activeDispute.createdAt).toLocaleString('ar-EG')}</span>
                    </div>
                  </div>

                  {/* Fast Action Controls */}
                  <div className="flex items-center gap-2">
                    <select
                      id="update-ticket-status-dropdown"
                      value={activeDispute.status}
                      onChange={(e) => handleUpdateStatusAndPriority(e.target.value as DisputeStatus, activeDispute.priority || 'normal')}
                      className="bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-zinc-100 cursor-pointer focus:outline-none"
                    >
                      <option value="open">تذكرة مفتوحة (Open)</option>
                      <option value="under_investigation">قيد التحقيق الإداري</option>
                      <option value="waiting_for_customer">في انتظار رد المشتري</option>
                      <option value="waiting_for_seller">في انتظار رد التاجر</option>
                      <option value="resolved">تم الحل والتسوية</option>
                    </select>

                    <select
                      id="update-ticket-priority-dropdown"
                      value={activeDispute.priority || 'normal'}
                      onChange={(e) => handleUpdateStatusAndPriority(activeDispute.status, e.target.value as DisputePriority)}
                      className="bg-rose-50 text-rose-900 dark:bg-zinc-800 dark:text-rose-300 border border-rose-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer focus:outline-none"
                    >
                      <option value="urgent">عاجلة جداً</option>
                      <option value="high">مرتفعة</option>
                      <option value="normal">عادية</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </div>
                </div>

                {/* 2. Coherent 360° Context Graph (Customer ➔ Order ➔ Product ➔ Seller ➔ Payment ➔ Shipping) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                      <span>سياق النزاع المترابط (Coherent 360° Context):</span>
                    </span>
                    <span className="text-[11px] text-stone-400">سجلات حية من قاعدة البيانات</span>
                  </div>

                  {/* Context Node Selector Bar */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200 dark:border-zinc-800">
                    {[
                      { node: 'customer', label: 'المشتري', icon: User },
                      { node: 'order', label: 'الطلب', icon: FileSpreadsheet },
                      { node: 'product', label: 'المنتج', icon: Package },
                      { node: 'seller', label: 'التاجر', icon: Store },
                      { node: 'payment', label: 'المدفوعات', icon: CreditCard },
                      { node: 'shipping', label: 'الشحن', icon: Truck },
                    ].map((item) => {
                      const isNodeActive = selectedContextNode === item.node;
                      return (
                        <button
                          key={item.node}
                          type="button"
                          onClick={() => setSelectedContextNode(item.node as any)}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                            isNodeActive
                              ? 'bg-[#800020] text-white shadow-2xs dark:bg-[#D4AF37] dark:text-stone-950'
                              : 'text-stone-600 dark:text-zinc-300 hover:bg-stone-200/60 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Context Data Card */}
                  <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800 min-h-[120px]">
                    {isLoadingContext ? (
                      <div className="flex items-center justify-center h-20 text-xs text-stone-400 gap-2">
                        <Clock className="w-4 h-4 animate-spin text-[#800020]" />
                        <span>جاري قراءة سجلات قاعدة البيانات المترابطة...</span>
                      </div>
                    ) : ticketContext ? (
                      <div>
                        {/* Customer Context */}
                        {selectedContextNode === 'customer' && ticketContext.customer && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                <span>سجل وهوية المشتري:</span>
                              </h4>
                              {onSelectCustomer && (
                                <button
                                  type="button"
                                  onClick={() => onSelectCustomer(ticketContext.customer.id)}
                                  className="text-[11px] font-bold text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
                                >
                                  <span>فتح الملف الكامل</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-[11px] text-stone-500 block">الاسم:</span>
                                <strong className="text-stone-900 dark:text-zinc-100">{ticketContext.customer.fullName}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">الهاتف:</span>
                                <strong className="text-stone-900 dark:text-zinc-100 font-mono">{ticketContext.customer.phone}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">البريد:</span>
                                <strong className="text-stone-900 dark:text-zinc-100 truncate block">{ticketContext.customer.email}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">تاريخ التسجيل:</span>
                                <strong className="text-stone-900 dark:text-zinc-100">{new Date(ticketContext.customer.createdAt).toLocaleDateString('ar-EG')}</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Context */}
                        {selectedContextNode === 'order' && ticketContext.order && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>تفاصيل الطلب الأصلي:</span>
                              </h4>
                              {onSelectOrder && (
                                <button
                                  type="button"
                                  onClick={() => onSelectOrder(ticketContext.order.id)}
                                  className="text-[11px] font-bold text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
                                >
                                  <span>عرض كامل الطلب</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-[11px] text-stone-500 block">كود التتبع:</span>
                                <strong className="text-stone-900 dark:text-zinc-100 font-mono">{ticketContext.order.trackingCode}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">إجمالي المبلغ:</span>
                                <strong className="text-[#800020] dark:text-[#D4AF37] font-bold">{ticketContext.order.totalAmountEGP} ج.م</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">طريقة الدفع:</span>
                                <strong className="text-stone-900 dark:text-zinc-100">
                                  {ticketContext.order.paymentMethod === 'cash_on_delivery' ? 'دفع عند الاستلام' : 'دفع رقمي (فوري/بطاقة)'}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">حالة الشحنة:</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                  {ticketContext.order.orderStatus === 'delivered' ? 'تم التسليم' : 'قيد التجهيز والشحن'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Product Context */}
                        {selectedContextNode === 'product' && ticketContext.product && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              <span>السلعة المتنازع عليها:</span>
                            </h4>
                            <div className="flex items-center gap-3">
                              {ticketContext.product.images && ticketContext.product.images.length > 0 && (
                                <img
                                  src={ticketContext.product.images[0]}
                                  alt={ticketContext.product.titleAr}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-zinc-700"
                                />
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs flex-1">
                                <div>
                                  <span className="text-[11px] text-stone-500 block">اسم المنتج:</span>
                                  <strong className="text-stone-900 dark:text-zinc-100">{ticketContext.product.titleAr}</strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-stone-500 block">السعر:</span>
                                  <strong className="text-[#800020] dark:text-[#D4AF37]">{ticketContext.product.priceEGP} ج.م</strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-stone-500 block">المخزون الحالي:</span>
                                  <strong className="text-stone-900 dark:text-zinc-100">{ticketContext.product.stock} قطع</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Seller Context */}
                        {selectedContextNode === 'seller' && ticketContext.seller && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" />
                              <span>بيانات التاجر المستقل في دسوق:</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-[11px] text-stone-500 block">اسم المتجر:</span>
                                <strong className="text-stone-900 dark:text-zinc-100">{ticketContext.seller.name}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">هاتف الدعم:</span>
                                <strong className="text-stone-900 dark:text-zinc-100 font-mono">{ticketContext.seller.phone || ticketContext.seller.supportPhone || '01012345678'}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">حي المتجر بدسوق:</span>
                                <strong className="text-stone-900 dark:text-zinc-100">{ticketContext.seller.desoqDistrict}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">التوثيق التجاري:</span>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">موثق ومعتمد</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Context */}
                        {selectedContextNode === 'payment' && ticketContext.payment && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>المعاملة المالية وبوابة الدفع:</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-[11px] text-stone-500 block">رقم المعاملة:</span>
                                <strong className="text-stone-900 dark:text-zinc-100 font-mono">{ticketContext.payment.id}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">قيمة المدفوع:</span>
                                <strong className="text-[#800020] dark:text-[#D4AF37] font-bold">{ticketContext.payment.amountEGP} ج.م</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">المرجع البنكي:</span>
                                <strong className="text-stone-900 dark:text-zinc-100 font-mono">{ticketContext.payment.transactionRef || 'COD'}</strong>
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block">حالة التحصيل:</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                  {ticketContext.payment.status === 'completed' ? 'تم التحصيل بالكامل' : 'في انتظار التحصيل'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Shipping Context */}
                        {selectedContextNode === 'shipping' && (
                          ticketContext.shipment ? (
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" />
                                <span>شحن ولوجستيات دسوق إكسبريس:</span>
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-[11px] text-stone-500 block">رقم البوليصة:</span>
                                  <strong className="text-stone-900 dark:text-zinc-100 font-mono">{ticketContext.shipment.trackingNumber}</strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-stone-500 block">مزود التوصيل:</span>
                                  <strong className="text-stone-900 dark:text-zinc-100">{ticketContext.shipment.provider}</strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-stone-500 block">الحالة:</span>
                                  <span className="font-bold text-blue-700 dark:text-blue-300">
                                    {ticketContext.shipment.status === 'delivered' ? 'تم التسليم' : 'جاري النقل'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-stone-500 block">مسار الرحلة:</span>
                                  <strong className="text-stone-900 dark:text-zinc-100 truncate block">
                                    {ticketContext.shipment.originAddress} ➔ {ticketContext.shipment.destinationAddress}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-stone-400 py-3 text-center">لا توجد بوليصة شحن مسجلة لهذا الطلب حتى الآن.</div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-400 py-3 text-center">لا تتوفر بيانات سياق لهذا النزاع.</div>
                    )}
                  </div>
                </div>

                {/* Dispute Statement & Egyptian Consumer Protection Reference */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">بيان المشتري وموضوع الشكوى:</span>
                    <p className="text-stone-800 dark:text-zinc-200 leading-relaxed">
                      "{activeDispute.description}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                    <Scale className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">المستند القانوني للتحكيم (قانون حماية المستهلك رقم 181 لسنة 2018):</span>
                      <p className="opacity-90 leading-relaxed">
                        يلتزم التاجر برد القيمة أو استبدال السلعة دون أي تكلفة خلال 14 يوماً من الاستلام (وتصل إلى 30 يوماً في العيوب غير الظاهرة) في حال عدم المطابقة للمواصفات المعروضة.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence Attachments Viewer */}
                {activeDispute.attachments && activeDispute.attachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 block">
                      مستندات وأدلة الإثبات المرفقة ({activeDispute.attachments.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeDispute.attachments.map((file) => (
                        <div 
                          key={file.id} 
                          className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-[#800020] shrink-0" />
                            <div className="overflow-hidden">
                              <p className="font-bold text-stone-800 dark:text-zinc-200 truncate">{file.fileName}</p>
                              <p className="text-[10px] text-stone-400">{file.fileType}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewAttachmentUrl(file.url)}
                            className="bg-white dark:bg-zinc-700 hover:bg-stone-100 text-stone-700 dark:text-zinc-200 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-600 flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3 h-3" />
                            <span>معاينة</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Multi-Party Timeline & Conversation + Canned Responses */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>سجل المحادثة الرسمية بين المشتري والتاجر والدعم:</span>
                  </h3>
                  <span className="text-[10px] text-stone-400">محادثة موثقة قانونياً</span>
                </div>

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {activeDispute.messages && activeDispute.messages.length > 0 ? (
                    activeDispute.messages.map((msg, i) => {
                      const isAdmin = msg.sender === 'admin' || msg.sender === 'support';
                      const isSeller = msg.sender === 'seller';
                      return (
                        <div key={i} className={`flex flex-col space-y-1 max-w-[85%] ${isAdmin ? 'mr-auto items-start' : 'ml-auto items-end'}`}>
                          <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-100 rounded-tr-none'
                              : isSeller
                              ? 'bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 rounded-tl-none border border-rose-100 dark:border-rose-900'
                              : 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 rounded-tl-none border border-amber-100 dark:border-amber-900'
                          }`}>
                            <span className="font-bold block text-[10px] opacity-75 mb-1">
                              {msg.senderName} ({isAdmin ? 'إدارة سوق دسوق' : isSeller ? 'التاجر' : 'المشتري'})
                            </span>
                            <p>{msg.message}</p>
                          </div>
                          <span className="text-[9px] text-stone-400 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-stone-400 text-center py-4">لا توجد رسائل مسجلة بعد.</div>
                  )}
                </div>

                {/* Quick Canned Response Macros */}
                <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>قوالب ردود قانونية سريعة (Macros):</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CANNED_RESPONSES.map((macro) => (
                      <button
                        key={macro.id}
                        type="button"
                        onClick={() => insertCannedReply(macro.text)}
                        className="text-[10px] font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-[#800020]/10 dark:hover:bg-zinc-700 px-2 py-1 rounded-md border border-stone-200 dark:border-zinc-700 transition-colors"
                      >
                        {macro.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Composer */}
                <div className="flex gap-2 pt-1">
                  <input
                    id="support-reply-input"
                    type="text"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="اكتب توجيه أو قرار يظهر لكافة الأطراف..."
                    className="flex-1 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <button
                    id="support-send-reply-btn"
                    type="button"
                    onClick={handleSendMessage}
                    className="bg-[#800020] dark:bg-[#D4AF37] text-white dark:text-stone-950 font-bold px-4 py-2 rounded-xl text-xs hover:opacity-90 flex items-center gap-1.5 shrink-0 transition-opacity"
                  >
                    <Send className="w-3 h-3" />
                    <span>إرسال</span>
                  </button>
                </div>
              </div>

              {/* 4. Private Support Internal Notes & Escalation */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <LifeBuoy className="w-4 h-4 text-amber-600" />
                    <span>ملاحظات الدعم الداخلية والتحكيم (سرية لفريق العمل):</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400">تصعيد سريع:</span>
                    <button
                      type="button"
                      onClick={() => handleEscalateTicket('senior_arbiter')}
                      className="text-[10px] font-bold bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200"
                    >
                      كبير المحكمين
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEscalateTicket('legal')}
                      className="text-[10px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200"
                    >
                      الشؤون القانونية
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {activeDispute.internalNotes && activeDispute.internalNotes.length > 0 ? (
                    activeDispute.internalNotes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-amber-800 dark:text-amber-300 font-bold">
                          <span>المحرر: {note.authorName}</span>
                          <span>{new Date(note.timestamp).toLocaleString('ar-EG')}</span>
                        </div>
                        <p className="text-stone-700 dark:text-zinc-300 leading-relaxed">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-stone-400 text-center py-2">لا توجد ملاحظات داخلية سرية بعد.</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    id="support-internal-note-input"
                    type="text"
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="اكتب ملاحظة تحكيم سرية..."
                    className="flex-1 bg-amber-50/20 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddInternalNote();
                    }}
                  />
                  <button
                    id="support-save-internal-note-btn"
                    type="button"
                    onClick={handleAddInternalNote}
                    className="bg-amber-600 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-amber-700 shrink-0"
                  >
                    حفظ الملاحظة
                  </button>
                </div>
              </div>

              {/* 5. Resolution & Final Decision Actions */}
              {activeDispute.status !== 'resolved' && activeDispute.status !== 'rejected' && activeDispute.status !== 'resolved_refunded' ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                    إصدار قرار التحكيم النهائي (Resolution Action):
                  </h3>

                  <textarea
                    id="support-arbitration-memo"
                    rows={2}
                    value={arbitrationMemo}
                    onChange={(e) => setArbitrationMemo(e.target.value)}
                    placeholder="اكتب مذكرة وحيثيات القرار النهائي (سيتم تسجيلها في السجل المالي وسجل النزاعات)..."
                    className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      id="arbitrate-refund-btn"
                      type="button"
                      onClick={() => handleArbitrate('refund')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>رد كامل المبلغ للمشتري</span>
                    </button>

                    <button
                      id="arbitrate-replacement-btn"
                      type="button"
                      onClick={() => handleArbitrate('replacement')}
                      className="bg-[#800020] hover:bg-[#600018] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>إلزام التاجر بالاستبدال</span>
                    </button>

                    <button
                      id="arbitrate-dismiss-btn"
                      type="button"
                      onClick={() => handleArbitrate('dismiss')}
                      className="border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>حفظ ورفض الشكوى</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>قرار التحكيم النهائي الصادر والمعتمد:</span>
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 pr-5 leading-relaxed">
                    {activeDispute.resolution || 'تم حل وتسوية النزاع رسمياً.'}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-12 text-center text-xs text-stone-400">
              اختر تذكرة نزاع من القائمة لمعاينتها والبدء في إجراءات التسوية والتحكيم.
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Modal for Evidence Attachments */}
      {previewAttachmentUrl && (
        <div 
          id="evidence-preview-modal"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewAttachmentUrl(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-4 space-y-3 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">معاينة مستند الإثبات والفحص</span>
              <button
                type="button"
                onClick={() => setPreviewAttachmentUrl(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[500px] overflow-auto flex items-center justify-center bg-stone-100 dark:bg-zinc-800 rounded-xl p-2">
              <img
                src={previewAttachmentUrl}
                alt="دليل النزاع"
                referrerPolicy="no-referrer"
                className="max-h-[460px] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
