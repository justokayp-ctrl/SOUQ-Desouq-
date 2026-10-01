import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Minus, 
  DollarSign, 
  Clock, 
  SlidersHorizontal,
  Download,
  ShieldAlert,
  Archive,
  Lock
} from 'lucide-react';
import { Product, Seller, SellerSubOrder } from '../../types';

interface SellerInventoryViewProps {
  products: Product[];
  seller: Seller;
  subOrders?: (SellerSubOrder & {
    parentOrderId: string;
    parentTrackingCode: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: any;
    createdAt?: string;
  })[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onShowToast: (msg: string) => void;
}

export const SellerInventoryView: React.FC<SellerInventoryViewProps> = ({
  products,
  seller,
  subOrders = [],
  onUpdateProduct,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockHealthFilter, setStockHealthFilter] = useState<'all' | 'available' | 'reserved' | 'low_stock' | 'out_of_stock'>('all');
  const [stockAdjustmentLog, setStockAdjustmentLog] = useState<{
    id: string;
    productTitle: string;
    delta: number;
    newStock: number;
    timestamp: string;
  }[]>([
    {
      id: 'log-1',
      productTitle: 'طقم ملايات قطن مصري 100%',
      delta: +25,
      newStock: 30,
      timestamp: 'اليوم، 10:30 ص',
    },
    {
      id: 'log-2',
      productTitle: 'فستان سواريه مطرز أنيق فاخر',
      delta: -2,
      newStock: 8,
      timestamp: 'أمس، 04:15 م (خصم طلبية)',
    },
  ]);

  // Reserved units calculation based on active fulfillment sub-orders
  const reservedUnitsMap = useMemo(() => {
    const map: Record<string, number> = {};
    const activeSubOrders = subOrders.filter(
      (s) => s.status === 'seller_confirmed' || s.status === 'processing' || s.status === 'ready_for_pickup'
    );
    activeSubOrders.forEach((sub) => {
      sub.items.forEach((it: any) => {
        const pId = it.product?.id || it.productId;
        if (pId) {
          map[pId] = (map[pId] || 0) + it.quantity;
        }
      });
    });
    return map;
  }, [subOrders]);

  // Operational Stock Metrics
  const totalUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.stock || 0), 0);
  }, [products]);

  const totalReservedUnits = useMemo(() => {
    return Object.values(reservedUnitsMap).reduce((sum, q) => sum + q, 0);
  }, [reservedUnitsMap]);

  const availableUnits = Math.max(0, totalUnits - totalReservedUnits);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = 
        p.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.attributes?.brand && p.attributes.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const isReserved = (reservedUnitsMap[p.id] || 0) > 0;
      const isLow = p.stock > 0 && p.stock < 10;
      const isOut = p.stock === 0;
      const isAvailable = p.stock >= 10;

      let matchFilter = true;
      if (stockHealthFilter === 'available') matchFilter = isAvailable;
      if (stockHealthFilter === 'reserved') matchFilter = isReserved;
      if (stockHealthFilter === 'low_stock') matchFilter = isLow;
      if (stockHealthFilter === 'out_of_stock') matchFilter = isOut;

      return matchSearch && matchFilter;
    });
  }, [products, searchQuery, stockHealthFilter, reservedUnitsMap]);

  const handleAdjustStock = (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    onUpdateProduct(prod.id, { 
      stock: newStock,
      status: newStock === 0 ? 'out_of_stock' : prod.status 
    });

    setStockAdjustmentLog((prev) => [
      {
        id: `log-${Date.now()}`,
        productTitle: prod.titleAr,
        delta,
        newStock,
        timestamp: 'الآن',
      },
      ...prev.slice(0, 19),
    ]);

    onShowToast(`تم تعديل مخزون "${prod.titleAr}" إلى ${newStock} قطعة (${delta > 0 ? `+${delta}` : delta})`);
  };

  const handleSetExactStock = (prod: Product, value: number) => {
    const newStock = Math.max(0, value);
    const delta = newStock - prod.stock;
    onUpdateProduct(prod.id, { 
      stock: newStock,
      status: newStock === 0 ? 'out_of_stock' : prod.status
    });

    setStockAdjustmentLog((prev) => [
      {
        id: `log-${Date.now()}`,
        productTitle: prod.titleAr,
        delta,
        newStock,
        timestamp: 'الآن',
      },
      ...prev.slice(0, 19),
    ]);

    onShowToast(`تم تعيين مخزون "${prod.titleAr}" إلى ${newStock} قطعة`);
  };

  return (
    <div id="seller-inventory-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP OPERATIONAL STATS: AVAILABLE, RESERVED, LOW STOCK, OUT OF STOCK */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Available (المتاح الفعلي للبيع الفوري) */}
        <div 
          onClick={() => setStockHealthFilter('available')}
          className={`bg-white dark:bg-zinc-800 p-5 rounded-3xl border shadow-xs space-y-2 cursor-pointer transition-all ${
            stockHealthFilter === 'available' ? 'ring-2 ring-green-600 border-green-500' : 'border-gray-200 dark:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-green-800 dark:text-green-300">Available (المتاح للبيع)</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-serif font-black text-green-700 dark:text-green-400">
            {availableUnits.toLocaleString()} <span className="text-xs font-bold text-gray-400">قطعة</span>
          </div>
          <p className="text-[10px] text-gray-400">جاهزة فوراً للشحن المباشر للمشترين</p>
        </div>

        {/* Metric 2: Reserved (المحجوز في طلبات جارية) */}
        <div 
          onClick={() => setStockHealthFilter('reserved')}
          className={`bg-white dark:bg-zinc-800 p-5 rounded-3xl border shadow-xs space-y-2 cursor-pointer transition-all ${
            stockHealthFilter === 'reserved' ? 'ring-2 ring-blue-600 border-blue-500' : 'border-gray-200 dark:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-blue-800 dark:text-blue-300">Reserved (المحجوز)</span>
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-black text-blue-700 dark:text-blue-400">
            {totalReservedUnits.toLocaleString()} <span className="text-xs font-bold text-gray-400">قطعة</span>
          </div>
          <p className="text-[10px] text-gray-400">محجوزة في طلبات قيد التجهيز والشحن</p>
        </div>

        {/* Metric 3: Low Stock (المخزون المنخفض) */}
        <div 
          onClick={() => setStockHealthFilter('low_stock')}
          className={`bg-white dark:bg-zinc-800 p-5 rounded-3xl border shadow-xs space-y-2 cursor-pointer transition-all ${
            stockHealthFilter === 'low_stock' ? 'ring-2 ring-amber-600 border-amber-500' : 'border-gray-200 dark:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-amber-800 dark:text-amber-300">Low Stock (مخزون منخفض)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-black text-amber-600 dark:text-amber-400">
            {lowStockCount} <span className="text-xs font-bold text-gray-400">منتجات</span>
          </div>
          <p className="text-[10px] text-gray-400">أقل من 10 قطع بالمستودع</p>
        </div>

        {/* Metric 4: Out of Stock (النافد من المخزن) */}
        <div 
          onClick={() => setStockHealthFilter('out_of_stock')}
          className={`bg-white dark:bg-zinc-800 p-5 rounded-3xl border shadow-xs space-y-2 cursor-pointer transition-all ${
            stockHealthFilter === 'out_of_stock' ? 'ring-2 ring-red-600 border-red-500' : 'border-gray-200 dark:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-red-800 dark:text-red-300">Out of Stock (نافد)</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-serif font-black text-red-600 dark:text-red-400">
            {outOfStockCount} <span className="text-xs font-bold text-gray-400">منتجات</span>
          </div>
          <p className="text-[10px] text-gray-400">المخزون صفر — غير متاح للبيع</p>
        </div>

      </div>

      {/* 2. INVENTORY FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن منتج بالاسم أو كود SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-xs text-[#1A1A1A] dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#800020]"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStockHealthFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              stockHealthFilter === 'all' ? 'bg-[#800020] text-white' : 'bg-[#F5F2ED] dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            الكل ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStockHealthFilter('available')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              stockHealthFilter === 'available' ? 'bg-green-600 text-white' : 'bg-[#F5F2ED] dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            المتاح
          </button>
          <button
            type="button"
            onClick={() => setStockHealthFilter('reserved')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              stockHealthFilter === 'reserved' ? 'bg-blue-600 text-white' : 'bg-[#F5F2ED] dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            المحجوز
          </button>
          <button
            type="button"
            onClick={() => setStockHealthFilter('low_stock')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              stockHealthFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-[#F5F2ED] dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            المنخفض ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockHealthFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              stockHealthFilter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-[#F5F2ED] dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            النافد ({outOfStockCount})
          </button>
        </div>

      </div>

      {/* 3. INVENTORY CARDS (Mobile / Tablet - md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 text-center text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 text-xs">
            لا توجد منتجات تطابق شروط الفلتر المحددة.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const reserved = reservedUnitsMap[prod.id] || 0;
            const available = Math.max(0, prod.stock - reserved);

            return (
              <div 
                key={prod.id}
                className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=120'}
                      alt={prod.titleAr}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-zinc-700 shrink-0 bg-gray-50"
                      loading="lazy"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-bold text-xs text-[#1A1A1A] dark:text-zinc-100 line-clamp-2 leading-tight">
                        {prod.titleAr}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono block">SKU: {prod.id}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    prod.stock === 0
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : prod.stock < 10
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                  }`}>
                    {prod.stock === 0 ? 'نافد' : prod.stock < 10 ? 'منخفض' : 'متوفر'}
                  </span>
                </div>

                {/* Stock Stats Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 dark:bg-zinc-900/60 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">المتاح</span>
                    <span className={`font-black text-sm ${
                      available === 0 ? 'text-red-600' : available < 10 ? 'text-amber-600' : 'text-green-700 dark:text-green-400'
                    }`}>
                      {available}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">المحجوز</span>
                    <span className="font-bold text-sm text-blue-700 dark:text-blue-400">
                      {reserved}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">الإجمالي</span>
                    <span className="font-bold text-sm text-gray-800 dark:text-zinc-200">
                      {prod.stock}
                    </span>
                  </div>
                </div>

                {/* Inline Quick Stepper Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">تزويد سريع:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, -1)}
                      disabled={prod.stock <= 0}
                      className="min-w-[40px] min-h-[40px] rounded-xl bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 text-gray-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer touch-manipulation"
                      title="خصم قطعة (-1)"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, +5)}
                      className="px-3 min-h-[40px] rounded-xl bg-green-50 dark:bg-green-950/60 hover:bg-green-100 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold text-xs cursor-pointer touch-manipulation"
                      title="إضافة 5 قطع (+5)"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, +10)}
                      className="px-3 min-h-[40px] rounded-xl bg-green-50 dark:bg-green-950/60 hover:bg-green-100 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold text-xs cursor-pointer touch-manipulation"
                      title="إضافة 10 قطع (+10)"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, +25)}
                      className="px-3 min-h-[40px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs cursor-pointer touch-manipulation shadow-xs"
                      title="تزويد دفعة (+25)"
                    >
                      +25
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. INVENTORY TABLE (Desktop - hidden md:block) */}
      <div className="hidden md:block bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#F5F2ED]/60 dark:bg-zinc-900/60 border-b border-gray-100 dark:border-zinc-700 text-xs font-bold text-gray-500 dark:text-zinc-400">
                <th className="p-4">المنتج</th>
                <th className="p-4">المتاح (Available)</th>
                <th className="p-4">المحجوز (Reserved)</th>
                <th className="p-4">إجمالي المخزن</th>
                <th className="p-4">حالة المخزون</th>
                <th className="p-4 text-center">تزويد سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                    لا توجد منتجات تطابق شروط الفلتر المحددة.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const reserved = reservedUnitsMap[prod.id] || 0;
                  const available = Math.max(0, prod.stock - reserved);

                  return (
                    <tr key={prod.id} className="hover:bg-[#F5F2ED]/30 dark:hover:bg-zinc-700/30 transition-colors">
                      {/* Product */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=120'}
                            alt={prod.titleAr}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-zinc-700 shrink-0 bg-gray-50"
                            loading="lazy"
                          />
                          <div className="space-y-0.5 max-w-xs sm:max-w-sm">
                            <div className="font-bold text-[#1A1A1A] dark:text-zinc-100 line-clamp-1">
                              {prod.titleAr}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              SKU: {prod.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Available */}
                      <td className="p-4">
                        <span className={`font-black text-sm ${
                          available === 0 ? 'text-red-600' : available < 10 ? 'text-amber-600' : 'text-green-700 dark:text-green-400'
                        }`}>
                          {available} قطعة
                        </span>
                      </td>

                      {/* Reserved */}
                      <td className="p-4">
                        <span className="font-bold text-blue-700 dark:text-blue-400">
                          {reserved} قطعة
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="p-4">
                        <span className="font-bold text-gray-800 dark:text-zinc-200">
                          {prod.stock} قطعة
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.stock === 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : prod.stock < 10
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                        }`}>
                          {prod.stock === 0 ? 'Out of stock (نافد)' : prod.stock < 10 ? 'Low stock (منخفض)' : 'Available (متوفر)'}
                        </span>
                      </td>

                      {/* Quick Adjust buttons */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(prod, -1)}
                            disabled={prod.stock <= 0}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 text-gray-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer"
                            title="خصم قطعة (-1)"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(prod, +5)}
                            className="px-2 h-7 rounded-lg bg-green-50 dark:bg-green-950/60 hover:bg-green-100 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold text-[11px] cursor-pointer"
                            title="إضافة 5 قطع (+5)"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(prod, +10)}
                            className="px-2 h-7 rounded-lg bg-green-50 dark:bg-green-950/60 hover:bg-green-100 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold text-[11px] cursor-pointer"
                            title="إضافة 10 قطع (+10)"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(prod, +25)}
                            className="px-2 h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] cursor-pointer"
                            title="تزويد دفعة كاملة (+25)"
                          >
                            +25
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. STOCK ADJUSTMENT LOGS */}
      {stockAdjustmentLog.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>سجل حركات الجرد والمخزون الأخيرة</span>
          </h4>

          <div className="divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs">
            {stockAdjustmentLog.map((log) => (
              <div key={log.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800 dark:text-zinc-200">{log.productTitle}</span>
                  <span className="text-[10px] text-gray-400 mr-2">({log.timestamp})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black ${log.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.delta > 0 ? `+${log.delta}` : log.delta}
                  </span>
                  <span className="text-[11px] text-gray-500">المخزون الحالي: {log.newStock} قطعة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
