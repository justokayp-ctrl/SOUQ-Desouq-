import React, { useState } from 'react';
import { 
  User, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Package,
  Plus
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { MarketplaceOrder, Dispute } from '../../types';

interface CustomerLookup360Props {
  onOpenTicket?: (ticketId: string) => void;
  onOpenOrder?: (orderId: string) => void;
}

export const CustomerLookup360: React.FC<CustomerLookup360Props> = ({ 
  onOpenTicket, 
  onOpenOrder 
}) => {
  const { orders, disputes, showToast } = useMarketplace();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Derive unique customers from orders and disputes
  const customersMap = new Map<string, {
    id: string;
    name: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
    orders: MarketplaceOrder[];
    disputes: Dispute[];
    totalSpendEGP: number;
    joinedDate: string;
  }>();

  // Populate from orders
  orders.forEach(ord => {
    const custId = ord.customerId || `cust-${ord.customerPhone}`;
    if (!customersMap.has(custId)) {
      customersMap.set(custId, {
        id: custId,
        name: ord.customerName || 'مشتري دسوق',
        phone: ord.customerPhone || '010XXXXXXXX',
        email: `${custId.slice(0, 8)}@souqdesoq.eg`,
        governorate: ord.shippingAddress?.governorate || 'كفر الشيخ',
        city: ord.shippingAddress?.city || 'دسوق',
        orders: [],
        disputes: [],
        totalSpendEGP: 0,
        joinedDate: ord.createdAt
      });
    }
    const record = customersMap.get(custId)!;
    record.orders.push(ord);
    record.totalSpendEGP += ord.totalAmountEGP || 0;
  });

  // Populate from disputes
  disputes.forEach(disp => {
    const matchedOrder = orders.find(o => o.id === disp.orderId);
    const custId = matchedOrder?.customerId || `cust-${disp.customerName}`;
    if (!customersMap.has(custId)) {
      customersMap.set(custId, {
        id: custId,
        name: disp.customerName || 'مشتري دسوق',
        phone: matchedOrder?.customerPhone || '01012345678',
        email: `${custId.slice(0, 8)}@souqdesoq.eg`,
        governorate: 'كفر الشيخ',
        city: 'دسوق',
        orders: matchedOrder ? [matchedOrder] : [],
        disputes: [disp],
        totalSpendEGP: matchedOrder?.totalAmountEGP || 0,
        joinedDate: disp.createdAt
      });
    } else {
      const record = customersMap.get(custId)!;
      if (!record.disputes.some(d => d.id === disp.id)) {
        record.disputes.push(disp);
      }
    }
  });

  const allCustomers = Array.from(customersMap.values());

  const filteredCustomers = allCustomers.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  });

  const activeCustomer = allCustomers.find(c => c.id === selectedCustomerId) || filteredCustomers[0] || allCustomers[0];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="support-customer-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث فوري في قاعدة بيانات المشترين بالاسم، رقم الهاتف، البريد، أو المعرف..."
            className="w-full bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#800020] transition-all"
          />
        </div>
      </div>

      {/* Grid: Customers List + Customer 360 View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Customer Directory List (4 spans) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
              دليل المشترين المسجلين ({filteredCustomers.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-0.5">
            {filteredCustomers.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 text-center text-xs text-stone-400">
                لا يوجد مشتري يطابق نص البحث.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = activeCustomer?.id === cust.id;
                const hasDisputes = cust.disputes.length > 0;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/40 dark:bg-zinc-800 border-[#800020] dark:border-[#D4AF37] ring-1 ring-[#800020]/20 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#800020]/10 dark:bg-[#D4AF37]/20 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                          {cust.name.slice(0, 1)}
                        </div>
                        <div>
                          <strong className="text-xs text-stone-900 dark:text-zinc-100 block">{cust.name}</strong>
                          <span className="text-[11px] text-stone-400 font-mono">{cust.phone}</span>
                        </div>
                      </div>
                      {hasDisputes && (
                        <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          {cust.disputes.length} نزاعات
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 pt-1.5 border-t border-stone-100 dark:border-zinc-800">
                      <span>{cust.orders.length} طلبات مكتملة</span>
                      <strong className="text-[#800020] dark:text-[#D4AF37]">{cust.totalSpendEGP} ج.م</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Customer 360 Workspace Profile (8 spans) */}
        <div className="lg:col-span-8">
          {activeCustomer ? (
            <div className="space-y-4">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-bold text-lg">
                      {activeCustomer.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">{activeCustomer.name}</h2>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>حساب موثق</span>
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">معرف المشتري: {activeCustomer.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeCustomer.phone}`}
                      className="bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-200 dark:border-zinc-700"
                    >
                      <Phone className="w-3 h-3 text-[#800020]" />
                      <span>اتصال هاتف</span>
                    </a>
                  </div>
                </div>

                {/* 4 Stats Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">إجمالي الطلبات</span>
                    <strong className="text-sm text-stone-900 dark:text-zinc-100">{activeCustomer.orders.length} طلبات</strong>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">إجمالي الإنفاق</span>
                    <strong className="text-sm text-[#800020] dark:text-[#D4AF37]">{activeCustomer.totalSpendEGP} ج.م</strong>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">سجل النزاعات</span>
                    <strong className={`text-sm ${activeCustomer.disputes.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {activeCustomer.disputes.length} حالات
                    </strong>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">المنطقة الجغرافية</span>
                    <strong className="text-sm text-stone-900 dark:text-zinc-100">{activeCustomer.city}، {activeCustomer.governorate}</strong>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span>سجل طلبات ومشتريات العميل ({activeCustomer.orders.length}):</span>
                </h3>

                <div className="space-y-2">
                  {activeCustomer.orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-stone-900 dark:text-zinc-100">{ord.trackingCode}</strong>
                          <span className="text-stone-400">• {new Date(ord.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {ord.subOrders?.length || 1} شحنات فرعية • {ord.paymentMethod === 'cash_on_delivery' ? 'دفع عند الاستلام' : 'دفع إلكتروني'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <strong className="text-[#800020] dark:text-[#D4AF37]">{ord.totalAmountEGP} ج.م</strong>
                        {onOpenOrder && (
                          <button
                            type="button"
                            onClick={() => onOpenOrder(ord.id)}
                            className="text-[11px] font-bold text-stone-700 dark:text-zinc-200 hover:text-[#800020] flex items-center gap-0.5 bg-white dark:bg-zinc-700 px-2 py-1 rounded-lg border border-stone-200 dark:border-zinc-600"
                          >
                            <span>التفاصيل</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispute History */}
              {activeCustomer.disputes.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>تذاكر النزاعات والشكاوى المرفوعة ({activeCustomer.disputes.length}):</span>
                  </h3>

                  <div className="space-y-2">
                    {activeCustomer.disputes.map((disp) => (
                      <div 
                        key={disp.id}
                        className="p-3 rounded-xl bg-rose-50/40 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">{disp.id}</span>
                            <span className="text-stone-400">• {new Date(disp.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-zinc-300 line-clamp-1">{disp.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            disp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {disp.status === 'resolved' ? 'تم الحل' : 'قيد المعالجة'}
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
              اختر مشتري من القائمة لعرض سجله الكامل ومعاملاته.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
