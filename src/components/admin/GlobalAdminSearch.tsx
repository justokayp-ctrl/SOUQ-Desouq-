import React, { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  Store, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  Scale, 
  ArrowLeft,
  X,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { AuthUser, Seller, Product, MarketplaceOrder, Dispute } from '../../types';

interface GlobalAdminSearchProps {
  users: AuthUser[];
  sellers: Seller[];
  products: Product[];
  orders: MarketplaceOrder[];
  disputes: Dispute[];
  onSelectUser: (user: AuthUser) => void;
  onSelectSeller: (seller: Seller) => void;
  onSelectProduct?: (product: Product) => void;
  onSelectOrder?: (order: MarketplaceOrder) => void;
  onSelectDispute?: (dispute: Dispute) => void;
}

export const GlobalAdminSearch: React.FC<GlobalAdminSearchProps> = ({
  users,
  sellers,
  products,
  orders,
  disputes,
  onSelectUser,
  onSelectSeller,
  onSelectProduct,
  onSelectOrder,
  onSelectDispute,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'sellers' | 'products' | 'orders' | 'payments' | 'disputes'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const cleanQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!cleanQuery) return { users: [], sellers: [], products: [], orders: [], payments: [], disputes: [] };

    const matchingUsers = users.filter(u => 
      u.id?.toLowerCase().includes(cleanQuery) ||
      u.fullName?.toLowerCase().includes(cleanQuery) ||
      u.email?.toLowerCase().includes(cleanQuery) ||
      u.phone?.includes(cleanQuery) ||
      u.role?.toLowerCase().includes(cleanQuery)
    );

    const matchingSellers = sellers.filter(s => 
      s.id?.toLowerCase().includes(cleanQuery) ||
      s.name?.toLowerCase().includes(cleanQuery) ||
      s.ownerName?.toLowerCase().includes(cleanQuery) ||
      s.district?.toLowerCase().includes(cleanQuery) ||
      s.commercialRecordNumber?.toLowerCase().includes(cleanQuery) ||
      s.taxRegistrationNumber?.toLowerCase().includes(cleanQuery)
    );

    const matchingProducts = products.filter(p => 
      p.id?.toLowerCase().includes(cleanQuery) ||
      p.titleAr?.toLowerCase().includes(cleanQuery) ||
      p.titleEn?.toLowerCase().includes(cleanQuery) ||
      p.attributes?.sku?.toLowerCase().includes(cleanQuery) ||
      p.category?.toLowerCase().includes(cleanQuery) ||
      p.brand?.toLowerCase().includes(cleanQuery)
    );

    const matchingOrders = orders.filter(o => 
      o.id?.toLowerCase().includes(cleanQuery) ||
      o.customerName?.toLowerCase().includes(cleanQuery) ||
      o.customerId?.toLowerCase().includes(cleanQuery) ||
      o.shippingAddress?.phone?.includes(cleanQuery) ||
      (o.subOrders || []).some(so => so.id.toLowerCase().includes(cleanQuery) || so.trackingNumber?.toLowerCase().includes(cleanQuery))
    );

    // Filter payments from orders
    const matchingPayments = orders.filter(o => 
      (o.paymentMethod || '').toLowerCase().includes(cleanQuery) ||
      (o.paymentStatus || '').toLowerCase().includes(cleanQuery) ||
      (o.fawryReferenceCode || '').toLowerCase().includes(cleanQuery) ||
      o.id.toLowerCase().includes(cleanQuery)
    );

    const matchingDisputes = disputes.filter(d => 
      d.id?.toLowerCase().includes(cleanQuery) ||
      d.orderId?.toLowerCase().includes(cleanQuery) ||
      d.customerName?.toLowerCase().includes(cleanQuery) ||
      d.sellerName?.toLowerCase().includes(cleanQuery) ||
      d.reason?.toLowerCase().includes(cleanQuery)
    );

    return {
      users: matchingUsers.slice(0, 6),
      sellers: matchingSellers.slice(0, 6),
      products: matchingProducts.slice(0, 6),
      orders: matchingOrders.slice(0, 6),
      payments: matchingPayments.slice(0, 6),
      disputes: matchingDisputes.slice(0, 6),
    };
  }, [cleanQuery, users, sellers, products, orders, disputes]);

  const totalResultsCount = 
    results.users.length + 
    results.sellers.length + 
    results.products.length + 
    results.orders.length + 
    results.payments.length + 
    results.disputes.length;

  return (
    <div className="relative w-full max-w-2xl" dir="rtl">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-stone-400 absolute right-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="البحث الشامل في برج المراقبة (مستخدم، متجر، منتج، طلب، دفعة، نزاع قانوني)..."
          className="w-full pr-10 pl-10 py-2.5 text-xs bg-stone-100 dark:bg-zinc-850 hover:bg-stone-200/60 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-750 rounded-2xl outline-none focus:ring-2 focus:ring-[#800020] dark:focus:ring-red-500 text-stone-900 dark:text-white transition-all font-medium placeholder:text-stone-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute left-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Global Results Overlay Box */}
      {isOpen && cleanQuery.length > 0 && (
        <div className="absolute right-0 left-0 top-12 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-2xl z-50 max-h-[75vh] overflow-hidden flex flex-col divide-y divide-stone-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header & Category Filters */}
          <div className="p-3 bg-stone-50 dark:bg-zinc-850 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold text-stone-600 dark:text-zinc-300">
              نتائج البحث الشامل ({totalResultsCount} نتيجة)
            </span>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'users', 'sellers', 'products', 'orders', 'payments', 'disputes'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#800020] text-white'
                      : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-750'
                  }`}
                >
                  {filter === 'all' && 'الكل'}
                  {filter === 'users' && `المستخدمين (${results.users.length})`}
                  {filter === 'sellers' && `التجار (${results.sellers.length})`}
                  {filter === 'products' && `المنتجات (${results.products.length})`}
                  {filter === 'orders' && `الطلبات (${results.orders.length})`}
                  {filter === 'payments' && `المدفوعات (${results.payments.length})`}
                  {filter === 'disputes' && `النزاعات (${results.disputes.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Results List Area */}
          <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
            {totalResultsCount === 0 ? (
              <div className="p-8 text-center space-y-2 text-stone-500">
                <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
                <p className="text-xs font-bold">لم نجد أي سجلات تطابق عبارة البحث "{query}"</p>
                <p className="text-[11px]">جرّب البحث برقم الطلب، البريد الإلكتروني، رمز المنتج SKU، أو اسم المتجر.</p>
              </div>
            ) : (
              <>
                {/* 1. Users */}
                {(activeFilter === 'all' || activeFilter === 'users') && results.users.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase px-2">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>المستخدمون (User 360)</span>
                    </h4>
                    <div className="space-y-1">
                      {results.users.map(u => (
                        <div
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.fullName?.substring(0, 1) || 'U'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                {u.fullName}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
                                {u.email} | {u.phone || 'بدون هاتف'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              u.role === 'admin' ? 'bg-red-100 text-red-800' :
                              u.role === 'seller' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-800'
                            }`}>
                              {u.role}
                            </span>
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-[-2px] transition-transform">
                              عرض User 360 ↗
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Sellers */}
                {(activeFilter === 'all' || activeFilter === 'sellers') && results.sellers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase px-2">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>التجار والمتاجر (Seller 360)</span>
                    </h4>
                    <div className="space-y-1">
                      {results.sellers.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            onSelectSeller(s);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-2xl hover:bg-amber-50/70 dark:hover:bg-amber-950/40 border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300">
                                {s.name}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                                المالِك: {s.ownerName} | المنطقة: {s.district || 'دسوق'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {s.status}
                            </span>
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-[-2px] transition-transform">
                              عرض Seller 360 ↗
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Products */}
                {(activeFilter === 'all' || activeFilter === 'products') && results.products.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase px-2">
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                      <span>المنتجات في الكتالوج</span>
                    </h4>
                    <div className="space-y-1">
                      {results.products.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProduct?.(p);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-2xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f'} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-emerald-700">
                                {p.titleAr}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
                                SKU: {p.attributes?.sku || p.id} | السعر: {p.priceEGP} ج.م | المخزون: {p.stock}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            فحص الكتالوج ↗
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Orders */}
                {(activeFilter === 'all' || activeFilter === 'orders') && results.orders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase px-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>الطلبات والشحنات</span>
                    </h4>
                    <div className="space-y-1">
                      {results.orders.map(o => (
                        <div
                          key={o.id}
                          onClick={() => {
                            onSelectOrder?.(o);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-2xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-stone-900 dark:text-white font-mono group-hover:text-indigo-700">
                              طلب #{o.id}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                              المشتري: {o.customerName} | الإجمالي: {o.totalAmountEGP || o.totalPriceEGP} ج.م
                            </p>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {o.orderStatus || o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Payments */}
                {(activeFilter === 'all' || activeFilter === 'payments') && results.payments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase px-2">
                      <CreditCard className="w-3.5 h-3.5 text-green-600" />
                      <span>معاملات الدفع والتسويات</span>
                    </h4>
                    <div className="space-y-1">
                      {results.payments.map(o => (
                        <div
                          key={`pay-${o.id}`}
                          onClick={() => {
                            onSelectOrder?.(o);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-2xl hover:bg-green-50/70 dark:hover:bg-green-950/40 border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-stone-900 dark:text-white font-mono">
                              عملية دفع لطلب #{o.id}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                              طريقة الدفع: {o.paymentMethod || 'الدفع عند الاستلام'} | الحساب: {o.totalAmountEGP || o.totalPriceEGP} ج.م
                            </p>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            {o.paymentStatus || 'مكتمل'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Disputes */}
                {(activeFilter === 'all' || activeFilter === 'disputes') && results.disputes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5 uppercase px-2">
                      <Scale className="w-3.5 h-3.5 text-red-600" />
                      <span>نزاعات حماية المستهلك (قانون 181/2018)</span>
                    </h4>
                    <div className="space-y-1">
                      {results.disputes.map(d => (
                        <div
                          key={d.id}
                          onClick={() => {
                            onSelectDispute?.(d);
                            setIsOpen(false);
                          }}
                          className="p-2.5 rounded-2xl hover:bg-red-50/70 dark:hover:bg-red-950/40 border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-[#800020] dark:text-red-400 font-mono">
                              نزاع #{d.id} (طلب #{d.orderId})
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                              العميل: {d.customerName} | السبب: {d.reason}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
