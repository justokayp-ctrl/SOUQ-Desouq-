import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  CreditCard, 
  MapPin, 
  Phone, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Package, 
  Store, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { MarketplaceOrder, OrderStatus, PaymentMethod } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';

interface AdminOrdersManagementProps {
  orders: MarketplaceOrder[];
  onUpdateOrderStatus: (orderId: string, trackingCode: string, newStatus: OrderStatus) => void;
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminOrdersManagement: React.FC<AdminOrdersManagementProps> = ({
  orders,
  onUpdateOrderStatus,
  onRequestConfirmation,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Expanded Master Orders (accordion to see sub-orders)
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);

  // Detailed Order Modal
  const [inspectingOrder, setInspectingOrder] = useState<MarketplaceOrder | null>(null);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = 
        (o.trackingCode || '').toLowerCase().includes(term) ||
        (o.customerName || '').toLowerCase().includes(term) ||
        (o.customerPhone || '').includes(term) ||
        (o.id || '').toLowerCase().includes(term) ||
        (o.shippingAddress?.city || '').toLowerCase().includes(term);

      const orderSt = o.orderStatus || o.status;
      const matchStatus = statusFilter === 'all' || orderSt === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Pagination Slices
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Accordion toggle
  const toggleExpand = (id: string) => {
    setExpandedOrderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Status badge styling helper
  const getStatusBadge = (st: OrderStatus) => {
    switch (st) {
      case 'delivered':
        return <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">تم التسليم</span>;
      case 'shipped':
      case 'out_for_delivery':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">جاري الشحن والتوصيل</span>;
      case 'processing':
      case 'seller_confirmed':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">قيد التجهيز بالمحل</span>;
      case 'cancelled':
      case 'returned':
        return <span className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">ملغي / مرتجع</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">بانتظار الدفع</span>;
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['كود التتبع', 'العميل', 'الهاتف', 'طريقة الدفع', 'الإجمالي (ج.م)', 'الحالة', 'تاريخ الطلب'];
    const rows = filteredOrders.map(o => [
      o.trackingCode || o.id,
      `"${o.customerName}"`,
      o.customerPhone,
      o.paymentMethod,
      o.totalAmountEGP || o.totalPriceEGP,
      o.orderStatus || o.status,
      new Date(o.createdAt || Date.now()).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `souq-desoq-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف سجل الطلبات بنجاح');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#800020]" />
              <span>إدارة الطلبات والشحنات اللوجستية (Orders & Logistics Command)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              إجمالي {orders.length} طلباً مسجلاً عبر مندوبي دسوق إكسبريس وبوسطة وأرامكس.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير الطلبات CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="ابحث برقم التتبع، اسم العميل، الهاتف، أو المدينة..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع حالات الشحن والطلب</option>
              <option value="processing">قيد التجهيز (Processing)</option>
              <option value="seller_confirmed">أكده التاجر (Confirmed)</option>
              <option value="shipped">تم الشحن (Shipped)</option>
              <option value="delivered">تم التسليم (Delivered)</option>
              <option value="cancelled">ملغي (Cancelled)</option>
              <option value="returned">مرتجع (Returned)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع طرق الدفع</option>
              <option value="cash_on_delivery">دفع عند الاستلام (COD)</option>
              <option value="fawry">فوري (Fawry)</option>
              <option value="vodafone_cash">فودافون كاش ومحافظ</option>
              <option value="instapay">إنستاباي (InstaPay)</option>
              <option value="bank_card">بطاقة بنكية / ميزة</option>
            </select>
          </div>

        </div>

      </div>

      {/* 2. Main Orders: Mobile / Tablet Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {paginatedOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 p-8 text-center text-xs text-stone-400">
            لا توجد طلبات تطابق معايير التصفية الحالية
          </div>
        ) : (
          paginatedOrders.map((o) => {
            const isExpanded = expandedOrderIds.includes(o.id);
            const subOrders = o.subOrders || o.sellerSubOrders || [];
            const orderSt = o.orderStatus || o.status || 'processing';

            return (
              <div 
                key={o.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-stone-900 dark:text-white block">
                      {o.trackingCode || o.id}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {subOrders.length} شحنات لتجار متعددين
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="font-mono font-bold text-sm text-[#800020] dark:text-[#D4AF37] block">
                      {(o.totalAmountEGP || o.totalPriceEGP || 0).toLocaleString()} ج.م
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {o.paymentMethod === 'cash_on_delivery' ? 'دفع استلام' : o.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-y border-stone-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 dark:text-white block">{o.customerName}</span>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{o.shippingAddress?.district || o.shippingAddress?.city || 'دسوق'}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectingOrder(o)}
                    className="px-3 py-1.5 min-h-[40px] rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>فحص</span>
                  </button>
                </div>

                {/* Status selector & expand toggle */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    {getStatusBadge(orderSt)}
                    <select
                      value={orderSt}
                      onChange={(e) => onUpdateOrderStatus(o.id, o.trackingCode || o.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 rounded-lg text-xs font-bold border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer outline-none min-h-[36px]"
                    >
                      <option value="pending_payment">بانتظار الدفع</option>
                      <option value="processing">قيد التجهيز</option>
                      <option value="seller_confirmed">تأكيد التاجر</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">إلغاء الطلب</option>
                      <option value="returned">استرجاع</option>
                    </select>
                  </div>

                  {subOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(o.id)}
                      className="px-2.5 py-1 min-h-[36px] rounded-lg bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 text-stone-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>التجار ({subOrders.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Sub-orders Expand */}
                {isExpanded && (
                  <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-2">
                    <p className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#800020]" />
                      <span>الشحنات الفرعية للتجار:</span>
                    </p>
                    {subOrders.map((sub, idx) => (
                      <div 
                        key={sub.id || idx}
                        className="p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl space-y-1 text-xs"
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span>{sub.sellerName}</span>
                          <span className="text-stone-500 font-mono text-[10px]">{sub.shippingProvider || 'DesoqExpress'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-500">
                          <span>قيمة: {sub.subtotalEGP} ج.م</span>
                          <span>عمولة: {sub.commissionEGP || 0} ج.م</span>
                          <span className="font-bold text-stone-700 dark:text-zinc-200">صافي: {sub.sellerNetEGP || sub.subtotalEGP} ج.م</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Main Orders Table: Desktop (hidden md:block) */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                <th className="p-3.5 w-10"></th>
                <th className="p-3.5">كود التتبع والطلب</th>
                <th className="p-3.5">العميل والعنوان</th>
                <th className="p-3.5">طريقة الدفع والقيمة</th>
                <th className="p-3.5">حالة الشحن والتنفيذ</th>
                <th className="p-3.5 text-center">إجراءات الحوكمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    لا توجد طلبات تطابق معايير التصفية الحالية
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  const isExpanded = expandedOrderIds.includes(o.id);
                  const subOrders = o.subOrders || o.sellerSubOrders || [];
                  const orderSt = o.orderStatus || o.status || 'processing';

                  return (
                    <React.Fragment key={o.id}>
                      <tr className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                        
                        {/* Accordion Expand Button */}
                        <td className="p-3.5 text-center">
                          {subOrders.length > 0 && (
                            <button
                              onClick={() => toggleExpand(o.id)}
                              className="p-1 rounded-md hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-500 cursor-pointer"
                              title="عرض الشحنات الفرعية للتجار"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </td>

                        {/* Tracking Code */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <p className="font-mono font-bold text-stone-900 dark:text-white">
                              {o.trackingCode || o.id}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              {subOrders.length} شحنات لتجار متعددين
                            </p>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <p className="font-bold text-stone-900 dark:text-white">{o.customerName}</p>
                            <p className="text-[10px] text-stone-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{o.shippingAddress?.district || o.shippingAddress?.city || 'دسوق'}</span>
                            </p>
                          </div>
                        </td>

                        {/* Payment & Total */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <p className="font-mono font-bold text-[#800020] dark:text-[#D4AF37]">
                              {(o.totalAmountEGP || o.totalPriceEGP || 0).toLocaleString()} ج.م
                            </p>
                            <p className="text-[10px] text-stone-500 font-medium">
                              {o.paymentMethod === 'cash_on_delivery' ? 'دفع عند الاستلام' : o.paymentMethod}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(orderSt)}
                            <select
                              value={orderSt}
                              onChange={(e) => onUpdateOrderStatus(o.id, o.trackingCode || o.id, e.target.value as OrderStatus)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer outline-none"
                            >
                              <option value="pending_payment">بانتظار الدفع</option>
                              <option value="processing">قيد التجهيز</option>
                              <option value="seller_confirmed">تأكيد التاجر</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التسليم</option>
                              <option value="cancelled">إلغاء الطلب</option>
                              <option value="returned">استرجاع</option>
                            </select>
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setInspectingOrder(o)}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 transition-all cursor-pointer"
                            title="فحص بوليصة الشحن الكاملة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>

                      {/* Expanded Sub-orders Row */}
                      {isExpanded && (
                        <tr className="bg-stone-50/80 dark:bg-zinc-850/80 border-b border-stone-200/60 dark:border-zinc-750">
                          <td colSpan={6} className="p-4 pr-12">
                            <div className="space-y-3">
                              <p className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-[#800020]" />
                                <span>الشحنات الفرعية للتجار ضمن هذا الطلب (Multi-Seller Sub-Orders):</span>
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {subOrders.map((sub, idx) => (
                                  <div 
                                    key={sub.id || idx}
                                    className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/70 dark:border-zinc-750 space-y-2 text-xs"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-stone-900 dark:text-white">
                                        متجر: {sub.sellerName}
                                      </span>
                                      <span className="text-[10px] font-mono bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                        شركة الشحن: {sub.shippingProvider || 'DesoqExpress'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-stone-500">
                                      <span>قيمة السلع: {sub.subtotalEGP} ج.م</span>
                                      <span>عمولة المنصة: {sub.commissionEGP || 0} ج.م</span>
                                      <span className="font-bold text-stone-800 dark:text-zinc-200">صافي التاجر: {sub.sellerNetEGP || sub.subtotalEGP} ج.م</span>
                                    </div>
                                    <div className="text-[10px] text-stone-400 font-mono">
                                      رقم بوليصة التاجر: {sub.trackingNumber || 'قيد الإصدار'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-800/80 border-t border-stone-200/80 dark:border-zinc-700/80 flex items-center justify-between flex-wrap gap-4 text-xs font-bold text-stone-600 dark:text-zinc-300">
          <div className="flex items-center gap-3">
            <span>عرض</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>من أصل {filteredOrders.length} طلب</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="الصفحة السابقة"
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3">صفحة {currentPage} من {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="الصفحة التالية"
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Order Inspector Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-4 text-right animate-in fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  بوليصة الطلب والتحصيل (Order Dossier)
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">كود التتبع: {inspectingOrder.trackingCode || inspectingOrder.id}</span>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                aria-label="إغلاق معاينة بوليصة الطلب"
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-stone-100 dark:divide-zinc-800">
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">اسم المستلم:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingOrder.customerName}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">رقم الهاتف:</span>
                <strong className="font-mono text-stone-900 dark:text-white">{inspectingOrder.customerPhone}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">عنوان التوصيل:</span>
                <strong className="text-stone-900 dark:text-white">
                  {inspectingOrder.shippingAddress?.streetDetails || (inspectingOrder.shippingAddress as any)?.street || ''}, {inspectingOrder.shippingAddress?.district || inspectingOrder.shippingAddress?.city}
                </strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">طريقة الدفع:</span>
                <strong className="text-[#800020] dark:text-[#D4AF37] uppercase">{inspectingOrder.paymentMethod}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">إجمالي المبلغ المحصل:</span>
                <strong className="font-mono text-base font-bold text-stone-900 dark:text-white">
                  {(inspectingOrder.totalAmountEGP || inspectingOrder.totalPriceEGP || 0).toLocaleString()} ج.م
                </strong>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setInspectingOrder(null)}
                className="px-5 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 rounded-full font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
