import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Truck, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { MarketplaceOrder, Seller } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { api } from '../../services/api';

interface CourierBulkPickupsViewProps {
  orders: MarketplaceOrder[];
  onRefresh: () => Promise<void>;
}

export const CourierBulkPickupsView: React.FC<CourierBulkPickupsViewProps> = ({ orders, onRefresh }) => {
  const { sellers, showToast } = useMarketplace();
  const [expandedSellerId, setExpandedSellerId] = useState<string | null>(null);
  const [loadingSellerId, setLoadingSellerId] = useState<string | null>(null);

  // Filter orders that are ready for pickup from workshops/merchants
  const pendingOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderStatus === 'processing' || 
      o.orderStatus === 'seller_confirmed' || 
      o.orderStatus === 'shipped'
    );
  }, [orders]);

  // Group pending orders by seller
  const groupedBySeller = useMemo(() => {
    const map = new Map<string, { seller: Seller | null; orders: MarketplaceOrder[] }>();

    pendingOrders.forEach(order => {
      // Find seller from subOrders or items
      const sellerId = order.subOrders?.[0]?.sellerId || 'unknown_seller';
      const seller = sellers.find(s => s.id === sellerId) || null;

      if (!map.has(sellerId)) {
        map.set(sellerId, { seller, orders: [] });
      }
      map.get(sellerId)!.orders.push(order);
    });

    return Array.from(map.values());
  }, [pendingOrders, sellers]);

  // Bulk pickup handler: Marks all orders for this merchant as out_for_delivery
  const handleBulkPickupForSeller = async (sellerOrders: MarketplaceOrder[], sellerName: string) => {
    const sellerId = sellerOrders[0]?.subOrders?.[0]?.sellerId || 'batch';
    try {
      setLoadingSellerId(sellerId);
      for (const order of sellerOrders) {
        await api.markOrderOutForDelivery(order.id);
      }
      showToast(`تم استلام ${sellerOrders.length} طرد من "${sellerName}" وتحويلها لمرحلة التوصيل الميداني!`, 'success');
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء استلام الطرود المجمعة', 'error');
    } finally {
      setLoadingSellerId(null);
    }
  };

  if (groupedBySeller.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-zinc-800 space-y-3">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-stone-900 dark:text-white">
          كافة طرود المتاجر والمشاغل تم استلامها!
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-md mx-auto">
          لا توجد حالياً أي طرود بانتظار الاستلام من ورش وتجار دسوق. يمكنك الانتقال إلى تبويب "الشحنات الميدانية" لتسليم الطرود للعملاء.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>استلامات المشاغل والمتاجر المجمعة (Pickup Hub)</span>
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            يوجد {pendingOrders.length} طرد جاهز للاستلام موزع على {groupedBySeller.length} متجر في مدينة دسوق.
          </p>
        </div>
        <span className="text-xs font-black bg-amber-500 text-white px-3 py-1 rounded-full font-mono">
          {pendingOrders.length} طرد
        </span>
      </div>

      {/* Sellers List */}
      <div className="space-y-3">
        {groupedBySeller.map(({ seller, orders: sellerOrders }) => {
          const sellerId = seller?.id || 'unknown';
          const sellerName = seller?.name || 'مشغل دسوق المعتمد';
          const sellerAddress = seller?.address || 'دسوق، شارع الجيش';
          const sellerPhone = seller?.phone || '01000000000';
          const isExpanded = expandedSellerId === sellerId;
          const isLoading = loadingSellerId === sellerId;

          return (
            <div
              key={sellerId}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#800020] dark:text-[#D4AF37] font-black shrink-0 border border-[#800020]/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-stone-900 dark:text-white">
                        {sellerName}
                      </h4>
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                        {sellerOrders.length} طرود جاهزة
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                        <span>{sellerAddress}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{sellerPhone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`tel:${sellerPhone}`}
                    className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                    title="اتصال بالتاجر"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`دسوق ${sellerAddress}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                    title="فتح العنوان على خرائط جوجل"
                  >
                    <MapPin className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  </a>

                  {/* Bulk Collect Button */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleBulkPickupForSeller(sellerOrders, sellerName)}
                    className="flex items-center gap-1.5 bg-[#800020] hover:bg-[#990026] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{isLoading ? 'جاري الاستلام...' : `استلام كافة الطرود (${sellerOrders.length})`}</span>
                  </button>

                  {/* Toggle Accordion */}
                  <button
                    type="button"
                    onClick={() => setExpandedSellerId(isExpanded ? null : sellerId)}
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="عرض تفاصيل الطرود"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              {/* Collapsible Order Items Details */}
              {isExpanded && (
                <div className="bg-stone-50 dark:bg-zinc-800/50 p-4 border-t border-stone-100 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-stone-600 dark:text-zinc-300 block mb-2">
                    الطرود المطلوب استلامها من هذا المتجر:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sellerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-stone-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#800020] dark:text-[#D4AF37]">
                              #{ord.trackingCode}
                            </span>
                            <span className="text-stone-400">•</span>
                            <span className="font-bold text-stone-800 dark:text-zinc-200">
                              {ord.customerName}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 dark:text-zinc-400 block mt-0.5">
                            الحي: {ord.shippingAddress?.district || 'وسط البلد'}
                          </span>
                        </div>

                        <div className="text-left font-mono">
                          <span className="font-black text-stone-900 dark:text-white block">
                            {ord.totalAmountEGP} ج.م
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {ord.paymentMethod === 'cash_on_delivery' ? 'كاش COD' : 'مدفوع'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
