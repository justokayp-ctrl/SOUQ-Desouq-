import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  CreditCard, 
  User, 
  Store, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Package,
  Plus,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { MarketplaceOrder, OrderStatus } from '../../types';

interface OrdersDisputeLookupProps {
  onOpenTicket?: (ticketId: string) => void;
  onOpenCustomer?: (customerId: string) => void;
}

export const OrdersDisputeLookup: React.FC<OrdersDisputeLookupProps> = ({ 
  onOpenTicket,
  onOpenCustomer 
}) => {
  const { orders, disputes, createDispute, showToast } = useMarketplace();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // New dispute modal state
  const [isCreateDisputeOpen, setIsCreateDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState<'defective_product' | 'not_as_described' | 'wrong_item' | 'late_delivery'>('defective_product');
  const [disputeDesc, setDisputeDesc] = useState('');

  const filteredOrders = orders.filter(o => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchId = o.id.toLowerCase().includes(term);
      const matchCode = o.trackingCode.toLowerCase().includes(term);
      const matchCust = o.customerName.toLowerCase().includes(term);
      const matchPhone = o.customerPhone.includes(term);
      if (!matchId && !matchCode && !matchCust && !matchPhone) return false;
    }

    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) {
      return false;
    }

    return true;
  });

  const activeOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0] || orders[0];
  const linkedDisputes = disputes.filter(d => d.orderId === activeOrder?.id);

  const handleCreateDisputeForOrder = async () => {
    if (!activeOrder || !disputeDesc.trim()) return;
    const subOrderId = activeOrder.subOrders?.[0]?.id || `sub-${activeOrder.id}`;
    try {
      const newD = await createDispute(
        activeOrder.id,
        subOrderId,
        disputeReason,
        disputeDesc.trim(),
        'refund'
      );
      setIsCreateDisputeOpen(false);
      setDisputeDesc('');
      if (newD && onOpenTicket) {
        onOpenTicket(newD.id);
      }
    } catch {
      showToast('تعذر فتح تذكرة الدعم');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="support-order-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في الطلبات برقم الطلب، كود التتبع DSQ-XXXX، اسم العميل، أو الهاتف..."
              className="w-full bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#800020] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <select
              id="support-order-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 dark:text-zinc-200 cursor-pointer focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="processing">قيد التجهيز</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
              <option value="refunded">مسترد</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Orders List + Order 360 View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Orders Queue (4 spans) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
              سجل الطلبات ({filteredOrders.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-0.5">
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 text-center text-xs text-stone-400">
                لا توجد طلبات مطابقة.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                const hasDispute = disputes.some(d => d.orderId === ord.id);
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/40 dark:bg-zinc-800 border-[#800020] dark:border-[#D4AF37] ring-1 ring-[#800020]/20 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] pb-2 border-b border-stone-100 dark:border-zinc-800">
                      <strong className="font-mono text-stone-900 dark:text-zinc-100">{ord.trackingCode}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {ord.orderStatus === 'delivered' ? 'تم التسليم' :
                         ord.orderStatus === 'shipped' ? 'تم الشحن' : 'قيد التجهيز'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-1">
                      <div className="flex items-center justify-between text-stone-800 dark:text-zinc-200">
                        <span>{ord.customerName}</span>
                        <strong className="text-[#800020] dark:text-[#D4AF37]">{ord.totalAmountEGP} ج.م</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                        <span>{new Date(ord.createdAt).toLocaleDateString('ar-EG')}</span>
                        {hasDispute && (
                          <span className="text-rose-600 font-bold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>تذكرة مفتوحة</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Order 360 Workspace (8 spans) */}
        <div className="lg:col-span-8">
          {activeOrder ? (
            <div className="space-y-4">
              
              {/* Order Meta Header */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100 font-serif">
                        الطلب: {activeOrder.trackingCode}
                      </h2>
                      <span className="text-xs text-stone-400 font-mono">({activeOrder.id})</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      تاريخ الشراء: {new Date(activeOrder.createdAt).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="open-dispute-from-order-btn"
                      type="button"
                      onClick={() => setIsCreateDisputeOpen(true)}
                      className="bg-[#800020] text-white hover:bg-[#600018] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>فتح تذكرة دعم للطلب</span>
                    </button>
                  </div>
                </div>

                {/* Grid of Key Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Customer Card */}
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-1">
                    <span className="font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>بيانات المشتري:</span>
                    </span>
                    <p className="font-bold text-stone-900 dark:text-zinc-100">{activeOrder.customerName}</p>
                    <p className="text-stone-500 font-mono">{activeOrder.customerPhone}</p>
                    {onOpenCustomer && (
                      <button
                        type="button"
                        onClick={() => onOpenCustomer(activeOrder.customerId)}
                        className="text-[10px] font-bold text-[#800020] hover:underline flex items-center gap-0.5 pt-1"
                      >
                        <span>عرض الملف الكامل</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Payment Card */}
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-1">
                    <span className="font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      <span>المدفوعات:</span>
                    </span>
                    <strong className="text-[#800020] dark:text-[#D4AF37] text-sm block">{activeOrder.totalAmountEGP} ج.م</strong>
                    <p className="text-stone-500 text-[11px]">
                      {activeOrder.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 'دفع إلكتروني (فوري)'}
                    </p>
                  </div>

                  {/* Address Card */}
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-1">
                    <span className="font-bold text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>عنوان التوصيل:</span>
                    </span>
                    <p className="text-stone-800 dark:text-zinc-200 text-[11px] leading-relaxed">
                      {activeOrder.shippingAddress?.district || 'شارع الجيش'}، {activeOrder.shippingAddress?.city || 'دسوق'}، {activeOrder.shippingAddress?.governorate || 'كفر الشيخ'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suborders & Items Breakdown */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span>الشحنات الفرعية والمحتويات ({activeOrder.subOrders?.length || 1}):</span>
                </h3>

                <div className="space-y-3">
                  {(activeOrder.subOrders || []).map((sub) => (
                    <div 
                      key={sub.id}
                      className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-[#800020]" />
                          <strong className="text-stone-900 dark:text-zinc-100">{sub.sellerName}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-stone-500">بوليصة: <strong className="font-mono">{sub.trackingNumber}</strong></span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{sub.shippingProvider}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {(sub.items || []).map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-stone-700 dark:text-zinc-300">
                            <span>{it.quantity}x {it.product?.titleAr || 'منتج بسوق دسوق'}</span>
                            <strong className="text-stone-900 dark:text-zinc-100">{(it.product?.priceEGP || 0) * it.quantity} ج.م</strong>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-2 border-t border-stone-200 dark:border-zinc-700 text-stone-500">
                        <span>قيمة الشحن: {sub.shippingFeeEGP} ج.م</span>
                        <strong className="text-[#800020] dark:text-[#D4AF37] text-xs">إجمالي الشحنة: {sub.subtotalEGP + sub.shippingFeeEGP} ج.م</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Disputes on this order */}
              {linkedDisputes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>تذاكر الدعم والنزاع المرتبطة بهذا الطلب ({linkedDisputes.length}):</span>
                  </h3>

                  <div className="space-y-2">
                    {linkedDisputes.map((disp) => (
                      <div 
                        key={disp.id}
                        className="p-3 rounded-xl bg-rose-50/40 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <strong className="font-mono text-stone-900 dark:text-zinc-100">{disp.id}</strong>
                          <p className="text-[11px] text-stone-600 dark:text-zinc-300 line-clamp-1">{disp.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            disp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {disp.status === 'resolved' ? 'تم الحل' : 'قيد الفحص'}
                          </span>
                          {onOpenTicket && (
                            <button
                              type="button"
                              onClick={() => onOpenTicket(disp.id)}
                              className="text-[11px] font-bold text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center gap-0.5"
                            >
                              <span>فتح التذكرة</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-12 text-center text-xs text-stone-400">
              اختر طلباً من القائمة لعرض تفاصيل التتبع ومحتوياته.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Create Dispute on behalf of customer */}
      {isCreateDisputeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100">فتح تذكرة دعم للطلب: {activeOrder?.trackingCode}</h3>
              <button
                type="button"
                onClick={() => setIsCreateDisputeOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-zinc-300 block mb-1">سبب الشكوى:</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value as any)}
                  className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="defective_product">عيب صناعة أو تلف أثناء الشحن</option>
                  <option value="not_as_described">غير مطابق للمواصفات</option>
                  <option value="wrong_item">استلام منتج أو مقاس خاطئ</option>
                  <option value="late_delivery">تأخر الشحنة</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-zinc-300 block mb-1">تفاصيل الشكوى:</label>
                <textarea
                  rows={3}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="اكتب بيان المشكلة بدقة..."
                  className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateDisputeForOrder}
                  className="flex-1 bg-[#800020] text-white py-2.5 rounded-xl font-bold hover:bg-[#600018] transition-colors text-xs"
                >
                  تسجيل التذكرة والبدء
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateDisputeOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
