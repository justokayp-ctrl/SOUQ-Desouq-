import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Download, 
  ExternalLink,
  Package,
  Calendar,
  Check,
  ShieldCheck,
  FileText,
  Plus,
  Boxes,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { SellerSubOrder, OrderStatus, Seller } from '../../types';
import { ManualOrderModal } from './ManualOrderModal';

interface SellerOrdersViewProps {
  seller: Seller;
  subOrders: (SellerSubOrder & {
    parentOrderId: string;
    parentTrackingCode: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: any;
    createdAt?: string;
  })[];
  onUpdateSubOrderStatus: (orderId: string, subOrderId: string, status: OrderStatus, noteAr: string) => void;
  onOpenShippingSlip: (order: any) => void;
  onShowToast: (msg: string) => void;
}

export const SellerOrdersView: React.FC<SellerOrdersViewProps> = ({
  seller,
  subOrders,
  onUpdateSubOrderStatus,
  onOpenShippingSlip,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<
    'all' | 'new' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'exception'
  >('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);

  // Workflow categorization
  const filteredOrders = useMemo(() => {
    return subOrders.filter((sub) => {
      const matchSearch =
        sub.parentTrackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.customerPhone.includes(searchQuery) ||
        (sub.shippingAddress?.city && sub.shippingAddress.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.shippingAddress?.district && sub.shippingAddress.district.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchWorkflow = true;
      if (activeWorkflowTab === 'new') {
        matchWorkflow = sub.status === 'seller_confirmed' || (sub.status as any) === 'pending' || (sub.status as any) === 'pending_payment';
      } else if (activeWorkflowTab === 'preparing') {
        matchWorkflow = sub.status === 'processing';
      } else if (activeWorkflowTab === 'ready') {
        matchWorkflow = sub.status === 'ready_for_pickup';
      } else if (activeWorkflowTab === 'shipped') {
        matchWorkflow = sub.status === 'shipped' || sub.status === 'out_for_delivery';
      } else if (activeWorkflowTab === 'delivered') {
        matchWorkflow = sub.status === 'delivered';
      } else if (activeWorkflowTab === 'exception') {
        matchWorkflow = sub.status === 'cancelled' || sub.status === 'returned';
      }

      return matchSearch && matchWorkflow;
    });
  }, [subOrders, searchQuery, activeWorkflowTab]);

  // Counts for each step of the 6-stage workflow
  const countNew = subOrders.filter(
    (s) => s.status === 'seller_confirmed' || (s.status as any) === 'pending' || (s.status as any) === 'pending_payment'
  ).length;
  const countPreparing = subOrders.filter((s) => s.status === 'processing').length;
  const countReady = subOrders.filter((s) => s.status === 'ready_for_pickup').length;
  const countShipped = subOrders.filter((s) => s.status === 'shipped' || s.status === 'out_for_delivery').length;
  const countDelivered = subOrders.filter((s) => s.status === 'delivered').length;
  const countException = subOrders.filter((s) => s.status === 'cancelled' || s.status === 'returned').length;

  const handleAdvanceStatus = (
    order: SellerSubOrder & { parentOrderId: string },
    nextStatus: OrderStatus,
    note: string
  ) => {
    onUpdateSubOrderStatus(order.parentOrderId, order.id, nextStatus, note);
    onShowToast(`تم تحديث حالة الطلب إلى "${note}"`);
  };

  return (
    <div id="seller-orders-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>إدارة الطلبات والشحنات ({subOrders.length} طلب)</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            دورة العمل التشغيلية للطلبات: جديد → تجهيز → جاهز للمندوب → تم الشحن → تم التسليم → استثناءات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManualOrderModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer"
            id="seller-add-manual-order-btn"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>تسجيل طلب بيع فوري / هاتفي</span>
          </button>
        </div>
      </div>

      {/* 2. SIX-STAGE WORKFLOW NAVIGATION TABS */}
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          
          {/* Tab: All */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeWorkflowTab === 'all'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            الكل ({subOrders.length})
          </button>

          {/* Stage 1: New */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('new')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeWorkflowTab === 'new'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-blue-700 dark:text-blue-400'
            }`}
          >
            <span>1. جديد (New)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 dark:bg-black/30 font-black">
              {countNew}
            </span>
          </button>

          {/* Stage 2: Preparing */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('preparing')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeWorkflowTab === 'preparing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-amber-700 dark:text-amber-400'
            }`}
          >
            <span>2. قيد التجهيز (Preparing)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 dark:bg-black/30 font-black">
              {countPreparing}
            </span>
          </button>

          {/* Stage 3: Ready */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('ready')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeWorkflowTab === 'ready'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-indigo-700 dark:text-indigo-400'
            }`}
          >
            <span>3. جاهز للمندوب (Ready)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 dark:bg-black/30 font-black">
              {countReady}
            </span>
          </button>

          {/* Stage 4: Shipped */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('shipped')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeWorkflowTab === 'shipped'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-purple-700 dark:text-purple-400'
            }`}
          >
            <span>4. مع المندوب (Shipped)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 dark:bg-black/30 font-black">
              {countShipped}
            </span>
          </button>

          {/* Stage 5: Delivered */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('delivered')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeWorkflowTab === 'delivered'
                ? 'bg-green-600 text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-green-700 dark:text-green-400'
            }`}
          >
            <span>5. تم التسليم (Delivered)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 dark:bg-black/30 font-black">
              {countDelivered}
            </span>
          </button>

          {/* Stage 6: Exception */}
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('exception')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeWorkflowTab === 'exception'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-[#F5F2ED] dark:bg-zinc-700 text-red-700 dark:text-red-400'
            }`}
          >
            <span>6. استثناءات (Exception)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 dark:bg-black/30 font-black">
              {countException}
            </span>
          </button>

        </div>
      </div>

      {/* 3. SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ابحث برقم التتبع أو اسم العميل أو الهاتف أو المدينة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-9 pl-4 py-2.5 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-xs text-[#1A1A1A] dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#800020] shadow-xs"
        />
      </div>

      {/* 4. ORDERS LISTING WITH DIRECT WORKFLOW ACTIONS */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-gray-200 dark:border-zinc-700 text-center text-gray-500 dark:text-zinc-400">
            لا توجد طلبات في هذه المرحلة من دورة العمل.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div 
                key={order.id}
                className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-5 shadow-xs space-y-4 hover:border-[#800020]/30 transition-all"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-zinc-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                      #{order.parentTrackingCode.slice(-4)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                        <span>كود الطلب: {order.parentTrackingCode}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({order.trackingNumber})</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{order.customerName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{order.shippingAddress?.city || 'دسوق'} - {order.shippingAddress?.district || 'حي وسط'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      order.status === 'seller_confirmed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : order.status === 'processing'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : order.status === 'ready_for_pickup'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : order.status === 'shipped' || order.status === 'out_for_delivery'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : order.status === 'delivered'
                        ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {order.status === 'seller_confirmed' ? '1. جديد (New)' :
                       order.status === 'processing' ? '2. قيد التجهيز (Preparing)' :
                       order.status === 'ready_for_pickup' ? '3. جاهز للمندوب (Ready)' :
                       order.status === 'shipped' || order.status === 'out_for_delivery' ? '4. مع المندوب (Shipped)' :
                       order.status === 'delivered' ? '5. تم التسليم (Delivered)' : '6. استثناء (Exception)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenShippingSlip(order)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="طباعة بوليصة الشحن الرسمية AWB"
                    >
                      <Printer className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    </button>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((it: any, idx) => (
                    <div key={idx} className="flex items-center justify-between text-gray-700 dark:text-zinc-300">
                      <span>• {it.product?.titleAr || it.productTitleAr || 'منتج'} (الكمية: {it.quantity})</span>
                      <span className="font-bold">{(it.product?.priceEGP || it.priceEGP || 0) * it.quantity} ج.م</span>
                    </div>
                  ))}
                </div>

                {/* Footer Action Bar with Direct Operational Transitions */}
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-gray-500">إجمالي التحصيل عند الاستلام (COD): </span>
                    <strong className="font-serif font-black text-[#800020] dark:text-[#D4AF37] text-sm">
                      {order.subtotalEGP} ج.م
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Stage 1: New -> Start Preparing */}
                    {(order.status === 'seller_confirmed' || (order.status as any) === 'pending') && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(order, 'processing', 'بدء التجهيز والتغليف')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>بدء التجهيز والتغليف</span>
                      </button>
                    )}

                    {/* Stage 2: Preparing -> Ready for pickup */}
                    {order.status === 'processing' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(order, 'ready_for_pickup', 'الطرد جاهز لاستلام المندوب')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد الجاهزية للمندوب</span>
                      </button>
                    )}

                    {/* Stage 3: Ready -> Handed to Courier (Shipped) */}
                    {order.status === 'ready_for_pickup' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(order, 'shipped', 'تم التسليم لمندوب التوصيل بدسوق')}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>تسليم لمندوب الشحن</span>
                      </button>
                    )}

                    {/* Stage 4: Shipped -> Delivered */}
                    {(order.status === 'shipped' || order.status === 'out_for_delivery') && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(order, 'delivered', 'تم تسليم الطرد للعميل وتحصيل المبلغ')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تأكيد التسليم والتحصيل</span>
                      </button>
                    )}

                    {/* Stage 6: Exception / Cancellation */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(order, 'cancelled', 'استثناء أو إلغاء بناء على طلب المشتري')}
                        className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 dark:bg-zinc-700 dark:text-zinc-300 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        تسجيل استثناء / إلغاء
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. MANUAL ORDER MODAL */}
      <ManualOrderModal
        isOpen={isManualOrderModalOpen}
        onClose={() => setIsManualOrderModalOpen(false)}
      />

    </div>
  );
};
