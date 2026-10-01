import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Wallet, 
  AlertCircle,
  Navigation,
  KeyRound,
  FileText,
  DollarSign,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Building2,
  AlertTriangle,
  Receipt,
  Smartphone,
  LayoutGrid,
  Award,
  Zap
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  MarketplaceOrder, 
  OrderStatus, 
  CourierShiftSettlement, 
  DeliveryExceptionReason,
  CourierDeliveryStage,
  DeliveryExceptionResolution
} from '../../types';
import { api } from '../../services/api';
import { WhatsAppQuickButton } from './WhatsAppQuickButton';
import { CourierDeliveryExceptionModal } from './CourierDeliveryExceptionModal';
import { CourierShiftSettlementModal } from './CourierShiftSettlementModal';
import { CourierBulkPickupsView } from './CourierBulkPickupsView';
import { CourierScorecardView } from './CourierScorecardView';
import { CourierHomeView } from './CourierHomeView';
import { CourierShiftView } from './CourierShiftView';

export const CourierDispatchView: React.FC = () => {
  const { 
    orders, 
    refreshData, 
    showToast, 
    isLoading,
    courierActiveTab,
    setCourierActiveTab
  } = useMarketplace();

  // Navigation Tabs: Home is primary
  const activeTab = (courierActiveTab as any) || 'home';
  const setActiveTab = (tab: any) => setCourierActiveTab(tab);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  // Field vs Standard view mode
  const [viewMode, setViewMode] = useState<'standard' | 'field'>('field');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'out_for_delivery' | 'delivered'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  
  // Modals state
  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState<MarketplaceOrder | null>(null);
  const [exceptionOrder, setExceptionOrder] = useState<MarketplaceOrder | null>(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);

  // OTP Form inputs
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [courierNotes, setCourierNotes] = useState('');
  const [cashCollectedInput, setCashCollectedInput] = useState<number>(0);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Status progression action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Saved Settlements from Server Database (Source of Truth)
  const [settlements, setSettlements] = useState<CourierShiftSettlement[]>([]);
  const [isSettlementsLoading, setIsSettlementsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSettlements = async () => {
      setIsSettlementsLoading(true);
      try {
        const data = await api.getCourierShiftSettlements();
        if (isMounted && Array.isArray(data)) {
          setSettlements(data);
        }
      } catch (e) {
        console.error('Failed to fetch courier settlements from API', e);
      } finally {
        if (isMounted) setIsSettlementsLoading(false);
      }
    };
    fetchSettlements();
    return () => { isMounted = false; };
  }, []);

  const handleSaveSettlement = async (newSettlement: CourierShiftSettlement) => {
    try {
      const res = await api.submitCourierShiftSettlement(newSettlement);
      const saved = res.settlement || newSettlement;
      setSettlements(prev => [saved, ...prev.filter(s => s.id !== saved.id)]);
      showToast(`تم اعتماد تسوية الوردية #${saved.id} وتوثيقها بقاعدة البيانات!`, 'success');
    } catch (e: any) {
      // Fallback local update if offline
      setSettlements(prev => [newSettlement, ...prev]);
      showToast(e.message || `تم حفظ تسوية الوردية محلياً`, 'info');
    }
  };

  // Filter orders for courier dispatch view
  const courierOrders = useMemo(() => {
    return orders.filter(ord => {
      // Query filter
      const matchesQuery = 
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerPhone.includes(searchQuery) ||
        (ord.shippingAddress?.district || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;

      // Status filter
      if (statusFilter === 'pending') {
        return ord.orderStatus === 'processing' || ord.orderStatus === 'seller_confirmed' || ord.orderStatus === 'shipped';
      }
      if (statusFilter === 'out_for_delivery') {
        return ord.orderStatus === 'out_for_delivery';
      }
      if (statusFilter === 'delivered') {
        return ord.orderStatus === 'delivered';
      }

      // District filter
      if (selectedDistrict !== 'all') {
        return ord.shippingAddress?.district === selectedDistrict;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, selectedDistrict]);

  // Unique Desoq Districts for filtering
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.shippingAddress?.district) {
        set.add(o.shippingAddress.district);
      }
    });
    return Array.from(set);
  }, [orders]);

  // KPIs
  const outForDeliveryOrders = orders.filter(o => o.orderStatus === 'out_for_delivery');
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
  const pendingPickupOrders = orders.filter(o => 
    o.orderStatus === 'processing' || 
    o.orderStatus === 'seller_confirmed' || 
    o.orderStatus === 'shipped'
  );

  const totalCodPending = outForDeliveryOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery' && o.paymentStatus !== 'paid')
    .reduce((sum, o) => sum + (o.totalAmountEGP || 0), 0);

  const totalCashCollectedToday = deliveredOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery')
    .reduce((sum, o) => sum + (o.totalAmountEGP || 0), 0);

  // Transition to "Out for Delivery"
  const handleMarkOutForDelivery = async (order: MarketplaceOrder) => {
    try {
      setActionLoadingId(order.id);
      await api.markOrderOutForDelivery(order.id);
      showToast(`تم استلام الشحنة #${order.trackingCode} وخرجت للتوصيل الآن`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'تعذر تحديث حالة الشحنة', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open OTP verification modal
  const openDeliveryModal = (order: MarketplaceOrder) => {
    setActiveDeliveryOrder(order);
    setDeliveryOtpInput('');
    setCourierNotes('');
    setOtpError(null);
    setCashCollectedInput(order.paymentMethod === 'cash_on_delivery' ? order.totalAmountEGP : 0);
  };

  // Submit OTP & complete delivery
  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeliveryOrder) return;
    if (!deliveryOtpInput.trim()) {
      setOtpError('يرجى إدخال كود التأكيد (OTP) المكون من 4 أرقام والموجود لدى العميل');
      return;
    }

    try {
      setIsSubmittingDelivery(true);
      setOtpError(null);
      await api.confirmCourierDelivery(
        activeDeliveryOrder.id,
        deliveryOtpInput.trim(),
        cashCollectedInput,
        courierNotes
      );
      showToast(`تم تسليم الشحنة #${activeDeliveryOrder.trackingCode} بنجاح وإغلاق الطلب`, 'success');
      setActiveDeliveryOrder(null);
      await refreshData();
    } catch (err: any) {
      setOtpError(err.message || 'كود التحقق غير صحيح، يرجى مراجعة العميل المستلم');
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  // Handle Workflow Stage Progression (Assigned -> Picked Up -> In Transit -> Arrived -> Delivered -> Failed)
  const handleUpdateWorkflowStage = async (orderId: string, stage: CourierDeliveryStage, note?: string) => {
    try {
      setActionLoadingId(orderId);
      await api.updateCourierWorkflowStage(orderId, stage, note);
      const stageLabels: Record<CourierDeliveryStage, string> = {
        assigned: 'مسندة للكابتن',
        picked_up: 'تم الاستلام من المخزن',
        in_transit: 'خرجت الشحنة للتوصيل الميداني',
        arrived: 'وصل الكابتن لموقع العميل',
        delivered: 'تم تسليم الشحنة بنجاح',
        failed: 'تعذر تسليم الشحنة'
      };
      showToast(`تم تحديث مرحلة الشحنة #${orderId}: ${stageLabels[stage]}`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث مرحلة الشحنة', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delivery Exception Submit with Resolution Workflow
  const handleSubmitException = async (
    order: MarketplaceOrder, 
    reason: DeliveryExceptionReason, 
    note: string, 
    rescheduleDate: string,
    resolution: DeliveryExceptionResolution
  ) => {
    try {
      await api.reportCourierException(order.id, {
        reason,
        resolution,
        note,
        rescheduleDate
      });
      showToast(`تم تسجيل تعذر التسليم للشحنة #${order.id} واعتماد الإجراء (${resolution})`, 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ حالة الشحنة', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-right">
      
      {/* 1. TOP DISPATCH HEADER WITH TABS & ACTIONS */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-black shrink-0 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-stone-900 dark:text-white">
                  بوابة كابتن التوزيع الميداني (Desoq Express)
                </h1>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full">
                  نشط الآن ✓
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                توزيع واستلام الشحنات وتأكيد الكود الرقمي OTP وتصفية العهد النقدية بدسوق
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'standard' ? 'field' : 'standard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                viewMode === 'field'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:bg-stone-200'
              }`}
              title="التبديل بين الوضع الميداني السريع للهاتف والوضع المكتبي المفصل"
            >
              <Smartphone className="w-4 h-4" />
              <span>{viewMode === 'field' ? 'الوضع الميداني السريع (مفعل)' : 'تفعيل الوضع الميداني'}</span>
            </button>

            {/* End of Shift Settlement Button */}
            <button
              type="button"
              onClick={() => setIsSettlementOpen(true)}
              className="flex items-center gap-1.5 bg-[#800020] hover:bg-[#990026] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Wallet className="w-4 h-4 text-[#D4AF37]" />
              <span>إقفال الوردية وتوريد العهدة</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => refreshData()}
              className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-stone-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'home'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>مهام اليوم السريعة (Home)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'settlement'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>الوردية والتسوية (Shift)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deliveries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'deliveries'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>كافة الشحنات ({courierOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pickups')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'pickups'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>استلامات المشاغل والتجار ({pendingPickupOrders.length})</span>
            {pendingPickupOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'scorecard'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-50 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>بطاقة الأداء</span>
          </button>
        </div>

      </div>

      {/* 2. TAB CONTENT SWITCHER */}
      {activeTab === 'home' || activeTab === 'exceptions' ? (
        <CourierHomeView
          orders={orders}
          currentOrderId={currentOrderId}
          onSelectCurrentOrder={(id) => {
            setCurrentOrderId(id);
            setActiveTab('home');
          }}
          onUpdateWorkflowStage={handleUpdateWorkflowStage}
          onOpenOtpModal={openDeliveryModal}
          onOpenExceptionModal={(order) => setExceptionOrder(order)}
          onGoToShift={() => setActiveTab('settlement')}
          onGoToAllTasks={() => setActiveTab('deliveries')}
        />
      ) : activeTab === 'settlement' || activeTab === 'profile' ? (
        <CourierShiftView
          orders={orders}
          settlements={settlements}
          onSaveSettlement={handleSaveSettlement}
          onOpenSettlementModal={() => setIsSettlementOpen(true)}
          showToast={showToast}
        />
      ) : activeTab === 'pickups' ? (
        <CourierBulkPickupsView orders={orders} onRefresh={refreshData} />
      ) : activeTab === 'scorecard' ? (
        <CourierScorecardView orders={orders} settlements={settlements} />
      ) : (
        /* DELIVERIES TAB */
        <div className="space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-bold">جاهز للاستلام والتوزيع</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-mono text-stone-900 dark:text-white">
                {pendingPickupOrders.length}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block">
                بانتظار خروجها للعملاء
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
                <span className="text-xs font-bold">في الطريق مع الكابتن</span>
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-900 dark:text-amber-200">
                {outForDeliveryOrders.length}
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1 block">
                قيد التسليم في شوارع دسوق
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
                <span className="text-xs font-bold">تم التسليم بنجاح</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-200">
                {deliveredOrders.length}
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 block">
                تم إثبات كود OTP الرقمي
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-2">
                <span className="text-xs font-bold">العهدة النقدية المحصلة</span>
                <Wallet className="w-4 h-4 text-[#800020] dark:text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-[#800020] dark:text-amber-400">
                {totalCashCollectedToday.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium mt-1 block">
                جاهزة للتوريد إلى الخزينة
              </span>
            </div>

          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الطلب، كود التتبع، العميل، الهاتف أو الحي..."
                  className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
                  }`}
                >
                  الكل ({orders.length})
                </button>
                <button
                  onClick={() => setStatusFilter('out_for_delivery')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'out_for_delivery'
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
                  }`}
                >
                  <Truck className="w-3 h-3" />
                  <span>في الطريق ({outForDeliveryOrders.length})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'pending'
                      ? 'bg-[#800020] text-white'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>جاهز للاستلام ({pendingPickupOrders.length})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('delivered')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'delivered'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تم التسليم ({deliveredOrders.length})</span>
                </button>
              </div>

            </div>

            {/* Desoq District Chips */}
            {availableDistricts.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800 text-xs">
                <span className="text-stone-400 font-bold shrink-0 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  أحياء ومناطق دسوق:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  <button
                    onClick={() => setSelectedDistrict('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedDistrict === 'all'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    جميع الأحياء
                  </button>
                  {availableDistricts.map(dist => (
                    <button
                      key={dist}
                      onClick={() => setSelectedDistrict(dist)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        selectedDistrict === dist
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40'
                          : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200'
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Orders Cards List */}
          <div className="space-y-4">
            {courierOrders.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-zinc-800">
                <Truck className="w-12 h-12 text-stone-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-zinc-200">
                  لا توجد شحنات مطابقة لخيارات البحث المحددة
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                  يمكنك تغيير فلاتر الحالة أو البحث برقم تتبع آخر.
                </p>
              </div>
            ) : (
              courierOrders.map(order => {
                const isOut = order.orderStatus === 'out_for_delivery';
                const isDelivered = order.orderStatus === 'delivered';
                const isPending = !isOut && !isDelivered;
                const isCOD = order.paymentMethod === 'cash_on_delivery';

                if (viewMode === 'field') {
                  /* DRIVER FIELD VIEW (Large High-Contrast Mobile Cards) */
                  return (
                    <div
                      key={order.id}
                      className={`bg-white dark:bg-zinc-900 rounded-3xl border-2 p-5 shadow-md space-y-4 ${
                        isOut
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/[0.02]'
                          : isDelivered
                          ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                          : 'border-stone-300 dark:border-zinc-700'
                      }`}
                    >
                      {/* Top Bar with Tracking & COD Amount */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
                        <span className="font-mono text-sm font-black bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 px-3 py-1 rounded-xl">
                          #{order.trackingCode}
                        </span>

                        <div className="text-left font-mono">
                          <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                            isCOD 
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300' 
                              : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {isCOD ? `تحصيل: ${order.totalAmountEGP} ج.م` : 'مدفوع إلكترونياً'}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info & Address */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-stone-900 dark:text-white">
                          {order.customerName}
                        </h3>

                        <div className="flex items-start gap-1.5 text-xs text-stone-700 dark:text-zinc-300 font-medium">
                          <MapPin className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>
                            <strong>{order.shippingAddress?.district || 'دسوق'}</strong> - {order.shippingAddress?.streetDetails || 'شارع الجيش'}
                            {order.shippingAddress?.nearestLandmark && (
                              <span className="text-amber-600 dark:text-amber-400 block mt-0.5 font-bold">
                                📍 علامة مميزة: {order.shippingAddress.nearestLandmark}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Operational Field Touch Targets (Big Buttons) */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        
                        {/* Call Button */}
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center justify-center gap-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-zinc-200 font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                        >
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <span>اتصال بالعميل</span>
                        </a>

                        {/* Map Button */}
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`دسوق ${order.shippingAddress?.district || ''} ${order.shippingAddress?.streetDetails || ''}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-black py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                        >
                          <Navigation className="w-4 h-4 text-blue-600" />
                          <span>ملاحة الخريطة</span>
                        </a>

                        {/* WhatsApp Dropdown */}
                        <div className="col-span-2">
                          <WhatsAppQuickButton order={order} variant="field" />
                        </div>

                        {/* Delivery Actions */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleMarkOutForDelivery(order)}
                            disabled={actionLoadingId === order.id}
                            className="col-span-2 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-2xl text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            <Truck className="w-4 h-4" />
                            <span>استلام وخروج للتوصيل الميداني</span>
                          </button>
                        )}

                        {isOut && (
                          <>
                            <button
                              type="button"
                              onClick={() => openDeliveryModal(order)}
                              className="col-span-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-sm shadow-md transition-all cursor-pointer"
                            >
                              <KeyRound className="w-4 h-4 text-emerald-200" />
                              <span>تأكيد التسليم الرسمي وإدخال OTP</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setExceptionOrder(order)}
                              className="col-span-2 flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold py-2 rounded-xl text-xs border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>تعذر التسليم / تأجيل الموعد</span>
                            </button>
                          </>
                        )}

                        {isDelivered && (
                          <div className="col-span-2 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black text-xs text-center border border-emerald-300">
                            تم إثبات التسليم بنجاح مع كود OTP ✓
                          </div>
                        )}

                      </div>
                    </div>
                  );
                }

                /* STANDARD VIEW */
                return (
                  <div 
                    key={order.id}
                    className={`bg-white dark:bg-zinc-900 rounded-3xl border transition-all p-4 sm:p-5 shadow-xs ${
                      isOut 
                        ? 'border-amber-500/50 ring-1 ring-amber-500/20' 
                        : isDelivered 
                        ? 'border-emerald-500/30 bg-emerald-500/[0.02]' 
                        : 'border-stone-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Shipment Identifiers & Status Badge */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700">
                            كود التتبع: {order.trackingCode}
                          </span>

                          {/* Status Badge */}
                          {isOut && (
                            <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
                              <Truck className="w-3.5 h-3.5" />
                              <span>في الطريق للتسليم</span>
                            </span>
                          )}
                          {isDelivered && (
                            <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تم التسليم بنجاح (OTP مؤكد)</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-[#800020]/10 text-[#800020] dark:text-amber-400 border border-[#800020]/30 text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>جاهز للاستلام والتوزيع</span>
                            </span>
                          )}

                          {/* Payment Status Badge */}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isCOD
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          }`}>
                            {isCOD ? `الدفع عند الاستلام (COD): ${order.totalAmountEGP.toLocaleString()} ج.م` : 'مدفوع إلكترونياً بالكامل'}
                          </span>
                        </div>

                        {/* Customer & Address Details in Desoq */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-stone-900 dark:text-white">
                              العميل: {order.customerName}
                            </strong>
                            <span className="text-stone-400">•</span>
                            <a 
                              href={`tel:${order.customerPhone}`}
                              className="font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          </div>

                          <div className="flex items-start gap-1.5 text-stone-600 dark:text-zinc-300">
                            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>{order.shippingAddress?.district || 'دسوق'}</strong> - {order.shippingAddress?.streetDetails || 'شارع الجيش'}
                              {order.shippingAddress?.buildingNo && `، عمارة ${order.shippingAddress.buildingNo}`}
                              {order.shippingAddress?.floorNo && `، دور ${order.shippingAddress.floorNo}`}
                              {order.shippingAddress?.nearestLandmark && (
                                <span className="text-amber-600 dark:text-amber-400 font-bold"> (علامة مميزة: {order.shippingAddress.nearestLandmark})</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Sub-orders & Sellers */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-500 dark:text-zinc-400">
                          <span>المتاجر المشحونة:</span>
                          {order.subOrders.map(sub => (
                            <span key={sub.id} className="bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-stone-700 dark:text-zinc-300">
                              {sub.sellerName} ({sub.items.length} منتج)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Operational Courier Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                        
                        {/* Action 1: If pending, button to move to Out for Delivery */}
                        {isPending && (
                          <button
                            onClick={() => handleMarkOutForDelivery(order)}
                            disabled={actionLoadingId === order.id}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Truck className="w-4 h-4" />
                            <span>{actionLoadingId === order.id ? 'جاري التحويل...' : 'خروج للتوصيل الآن'}</span>
                          </button>
                        )}

                        {/* Action 2: If Out for Delivery, Deliver OTP & Exception buttons */}
                        {isOut && (
                          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                            <button
                              onClick={() => openDeliveryModal(order)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                              <KeyRound className="w-4 h-4" />
                              <span>تأكيد التسليم (إدخال كود OTP)</span>
                            </button>

                            <button
                              onClick={() => setExceptionOrder(order)}
                              className="bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>تعذر التسليم / تأجيل</span>
                            </button>
                          </div>
                        )}

                        {/* Quick Call, WhatsApp, & Location actions */}
                        <div className="flex items-center gap-1.5">
                          <WhatsAppQuickButton order={order} />

                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-center bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            title="اتصال هاتفي"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>اتصال</span>
                          </a>

                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(`دسوق ${order.shippingAddress?.district || ''} ${order.shippingAddress?.streetDetails || ''}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-center bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            title="فتح العنوان على الخريطة"
                          >
                            <Navigation className="w-3.5 h-3.5 text-blue-500" />
                            <span>خريطة</span>
                          </a>
                        </div>

                        {/* If delivered, show note */}
                        {isDelivered && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم تحصيل {order.totalAmountEGP.toLocaleString()} ج.م وتأكيد الكود</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* 3. MODALS */}

      {/* OTP Delivery Modal */}
      {activeDeliveryOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 text-right">
          <div className="bg-white dark:bg-zinc-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>إثبات تسليم الشحنة عبر كود OTP</span>
              </div>
              <button
                onClick={() => setActiveDeliveryOrder(null)}
                className="text-stone-400 hover:text-stone-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-stone-800 dark:text-zinc-200">
                <span>العميل: {activeDeliveryOrder.customerName}</span>
                <span className="font-mono">{activeDeliveryOrder.customerPhone}</span>
              </div>
              <div className="text-stone-500 dark:text-zinc-400">
                شحنة رقم: <strong className="font-mono text-stone-700 dark:text-zinc-300">#{activeDeliveryOrder.trackingCode}</strong>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-amber-200/60 dark:border-amber-800/40 font-bold">
                <span className="text-stone-600 dark:text-zinc-300">المبلغ المطلوب تحصيله:</span>
                <span className="text-amber-700 dark:text-amber-400 text-sm font-mono">
                  {activeDeliveryOrder.paymentMethod === 'cash_on_delivery' 
                    ? `${activeDeliveryOrder.totalAmountEGP.toLocaleString()} ج.م (نقدًا)` 
                    : 'مدفوع إلكترونياً (0 ج.م)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4">
              
              {/* OTP Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300">
                  كود التأكيد الرقمي (OTP) الخاص بالعميل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="text"
                    maxLength={6}
                    value={deliveryOtpInput}
                    onChange={(e) => {
                      setDeliveryOtpInput(e.target.value);
                      setOtpError(null);
                    }}
                    placeholder="اطلب الكود المكون من 4 أرقام من العميل المستلم"
                    className="w-full pr-10 pl-3 py-3 text-center tracking-widest font-mono text-lg font-bold rounded-2xl bg-stone-50 dark:bg-zinc-800 border-2 border-amber-500/50 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>
                {otpError && (
                  <div className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
                <span className="text-[10px] text-stone-400 block">
                  ملاحظة للمندوب: الكود يصل للعميل في تفاصيل طلبه (لأغراض العرض كود العميل هو: <strong className="font-mono text-amber-600 dark:text-amber-400">{activeDeliveryOrder.deliveryOtp || '9876'}</strong> أو 0000)
                </span>
              </div>

              {/* Cash Collection Input if COD */}
              {activeDeliveryOrder.paymentMethod === 'cash_on_delivery' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300">
                    المبلغ المحصل نقداً من العميل (ج.م)
                  </label>
                  <input
                    type="number"
                    value={cashCollectedInput}
                    onChange={(e) => setCashCollectedInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-white"
                  />
                </div>
              )}

              {/* Courier Delivery Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300">
                  ملاحظات التسليم (اختياري)
                </label>
                <input
                  type="text"
                  value={courierNotes}
                  onChange={(e) => setCourierNotes(e.target.value)}
                  placeholder="مثال: تم التسليم للعميل باليد واستلام المبلغ كاملاً"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDelivery}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingDelivery ? 'جاري التحقق والتسليم...' : 'تأكيد التسليم الرسمي'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeliveryOrder(null)}
                  className="bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 dark:text-zinc-300 px-4 py-3 rounded-2xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Exception Modal */}
      {exceptionOrder && (
        <CourierDeliveryExceptionModal
          order={exceptionOrder}
          onClose={() => setExceptionOrder(null)}
          onSubmitException={handleSubmitException}
        />
      )}

      {/* Shift Settlement Modal */}
      {isSettlementOpen && (
        <CourierShiftSettlementModal
          orders={orders}
          onClose={() => setIsSettlementOpen(false)}
          onSaveSettlement={handleSaveSettlement}
        />
      )}

    </div>
  );
};

export default CourierDispatchView;
