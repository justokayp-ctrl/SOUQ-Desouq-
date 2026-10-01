import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Star, 
  ShieldCheck, 
  MapPin, 
  ArrowUpRight,
  Filter,
  Flame,
  Scale
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Seller } from '../../types';

interface SellerDisputeHealthProps {
  onOpenTicket?: (ticketId: string) => void;
}

export const SellerDisputeHealth: React.FC<SellerDisputeHealthProps> = ({ 
  onOpenTicket 
}) => {
  const { sellers, disputes, products } = useMarketplace();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [filterDisputedOnly, setFilterDisputedOnly] = useState(false);

  const enrichedSellers = sellers.map(seller => {
    const sellerDisputes = disputes.filter(d => d.sellerId === seller.id || d.sellerName === seller.name);
    const activeDisputes = sellerDisputes.filter(d => d.status !== 'resolved' && d.status !== 'rejected' && d.status !== 'resolved_refunded');
    const resolvedDisputes = sellerDisputes.filter(d => d.status === 'resolved' || d.status === 'rejected' || d.status === 'resolved_refunded');
    const sellerProducts = products.filter(p => p.sellerId === seller.id);
    const resolutionRate = sellerDisputes.length > 0 
      ? Math.round((resolvedDisputes.length / sellerDisputes.length) * 100) 
      : 100;

    return {
      ...seller,
      disputes: sellerDisputes,
      activeDisputesCount: activeDisputes.length,
      resolvedDisputesCount: resolvedDisputes.length,
      resolutionRate,
      productCount: sellerProducts.length
    };
  });

  const filteredSellers = enrichedSellers.filter(s => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(term);
      const matchDistrict = s.desoqDistrict?.toLowerCase().includes(term);
      const matchPhone = s.phone?.includes(term);
      if (!matchName && !matchDistrict && !matchPhone) return false;
    }

    if (filterDisputedOnly && s.disputes.length === 0) {
      return false;
    }

    return true;
  });

  const activeSeller = enrichedSellers.find(s => s.id === selectedSellerId) || filteredSellers[0] || enrichedSellers[0];

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="support-seller-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في سجل تجار دسوق بالاسم، الحي التجاري، أو الهاتف..."
              className="w-full bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl pr-10 pl-4 py-2.5 text-xs text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#800020] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterDisputedOnly(!filterDisputedOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterDisputedOnly
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700'
              }`}
            >
              {filterDisputedOnly ? 'عرض كل التجار' : 'إظهار المتاجر التي لديها نزاعات فقط'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Sellers List + Seller 360 Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Sellers Queue (4 spans) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
              دليل التجار المعتمدين ({filteredSellers.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-0.5">
            {filteredSellers.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 text-center text-xs text-stone-400">
                لا يوجد تجار يطابقون البحث.
              </div>
            ) : (
              filteredSellers.map((seller) => {
                const isSelected = activeSeller?.id === seller.id;
                const hasActiveDisputes = seller.activeDisputesCount > 0;
                return (
                  <div
                    key={seller.id}
                    onClick={() => setSelectedSellerId(seller.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/40 dark:bg-zinc-800 border-[#800020] dark:border-[#D4AF37] ring-1 ring-[#800020]/20 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#800020]/10 dark:bg-[#D4AF37]/20 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-xs text-stone-900 dark:text-zinc-100 block">{seller.name}</strong>
                          <span className="text-[11px] text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{seller.desoqDistrict || 'دسوق المركز'}</span>
                          </span>
                        </div>
                      </div>

                      {hasActiveDisputes ? (
                        <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-rose-600" />
                          <span>{seller.activeDisputesCount} نزاع نشط</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          سجل نظيف
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 pt-1.5 border-t border-stone-100 dark:border-zinc-800">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                        <strong className="text-stone-900 dark:text-zinc-100">{seller.rating || 4.9}</strong>
                      </span>
                      <span>نسبة التسوية: <strong className="text-emerald-700 dark:text-emerald-300 font-bold">{seller.resolutionRate}%</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Seller 360 Workspace (8 spans) */}
        <div className="lg:col-span-8">
          {activeSeller ? (
            <div className="space-y-4">
              
              {/* Seller Header */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-bold text-lg">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">{activeSeller.name}</h2>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>تاجر موثق برقم قومي</span>
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">معرف التاجر: {activeSeller.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeSeller.phone}`}
                      className="bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-200 dark:border-zinc-700"
                    >
                      <Phone className="w-3 h-3 text-[#800020]" />
                      <span>اتصال هاتفي</span>
                    </a>
                  </div>
                </div>

                {/* 4 Stats Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">المنتجات النشطة</span>
                    <strong className="text-sm text-stone-900 dark:text-zinc-100">{activeSeller.productCount} منتج</strong>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">تقييم المشترين</span>
                    <strong className="text-sm text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span>{activeSeller.rating || 4.9} / 5.0</span>
                    </strong>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">النزاعات النشطة</span>
                    <strong className={`text-sm ${activeSeller.activeDisputesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {activeSeller.activeDisputesCount} حالة
                    </strong>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <span className="text-[11px] text-stone-500 block">معدل التسوية والامتثال</span>
                    <strong className="text-sm text-emerald-700 dark:text-emerald-300">{activeSeller.resolutionRate}%</strong>
                  </div>
                </div>
              </div>

              {/* Seller Disputes List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                  <span>سجل النزاعات والشكاوى الخاصة بمتجر ({activeSeller.name}) ({activeSeller.disputes.length}):</span>
                </h3>

                {activeSeller.disputes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-zinc-800 rounded-xl">
                    سجل المتجر ناصع ولا توجد أي شكاوى أو نزاعات مسجلة ضده.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeSeller.disputes.map((disp) => (
                      <div 
                        key={disp.id}
                        className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">{disp.id}</span>
                            <span className="text-stone-400">• المشتري: {disp.customerName}</span>
                            <span className="text-stone-400">• {new Date(disp.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-zinc-300 line-clamp-1">{disp.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            disp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {disp.status === 'resolved' ? 'تم الحل' : 'قيد التحكيم'}
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
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-12 text-center text-xs text-stone-400">
              اختر تاجراً من القائمة لعرض مؤشرات الامتثال والنزاعات.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
