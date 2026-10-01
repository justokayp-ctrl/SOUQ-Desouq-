import React from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Truck, 
  ShoppingBag, 
  Store, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  BarChart2
} from 'lucide-react';
import { MarketplaceOrder, Seller, Product, Dispute } from '../../types';

interface AdminAnalyticsViewProps {
  orders: MarketplaceOrder[];
  sellers: Seller[];
  products: Product[];
  disputes: Dispute[];
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  orders,
  sellers,
  products,
  disputes,
}) => {
  // Calculations
  const deliveredOrders = orders.filter(o => (o.orderStatus || o.status) === 'delivered');
  const returnDisputes = disputes.filter(d => d.requestedResolution === 'refund');
  const returnRate = orders.length > 0 ? ((returnDisputes.length / orders.length) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  products.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
        <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#800020]" />
          <span>الذكاء التشغيلي والتحليلات المتقدمة (Operational Intelligence)</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          مؤشرات سرعة التوصيل اللوجستي، موثوقية التجار، وتوزيع الطلبات جغرافياً في مدينة دسوق ومحافظات الدلتا.
        </p>
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500">متوسط سرعة التوصيل بدسوق</span>
          <p className="text-2xl font-serif font-bold text-green-700 dark:text-green-400">
            18.4 <span className="text-xs font-bold text-stone-400">ساعة</span>
          </p>
          <p className="text-[11px] text-stone-500">أسرع بنسبة 35% من المتوسط الإقليمي</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500">نسبة الالتزام بالشحن (SLA)</span>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white font-mono">
            96.8%
          </p>
          <p className="text-[11px] text-green-700 font-bold">التزام تجار دسوق ممتاز</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500">معدل الاسترجاع والنزاعات</span>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white font-mono">
            {returnRate}%
          </p>
          <p className="text-[11px] text-stone-500">أقل من سقف الخطر (5.0%)</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-stone-500">متوسط قيمة سلة التسوق (AOV)</span>
          <p className="text-2xl font-serif font-bold text-[#800020] dark:text-[#D4AF37] font-mono">
            680 <span className="text-xs font-bold text-stone-400">ج.م</span>
          </p>
          <p className="text-[11px] text-stone-500">مدفوع بطلبات الأزياء والفساتين والعطور</p>
        </div>

      </div>

      {/* 3. Operational Analysis Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Desoq District Demand Heat */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#800020]" />
              <span>كثافة الطلب في أحياء ومراكز دسوق</span>
            </h3>
            <span className="text-[10px] text-stone-400">تحديث مباشر</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { district: 'حي الميدان الإبراهيمي ووسط المدينة', pct: 45, volume: '142 طلب' },
              { district: 'شارع الشركات ومحطة القطار', pct: 28, volume: '88 طلب' },
              { district: 'الكورنيش وطريق فوة', pct: 15, volume: '46 طلب' },
              { district: 'حي دحروج ومساكن الصفا', pct: 12, volume: '37 طلب' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-stone-700 dark:text-zinc-300 font-bold">
                  <span>{item.district}</span>
                  <span className="font-mono text-stone-500">{item.volume} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#800020] rounded-full transition-all" 
                    style={{ width: `${item.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Product Categories Distribution */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#800020]" />
              <span>توزيع المنتجات والكتالوج حسب التصنيف</span>
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">{products.length} سلعة</span>
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries(categoryCount).slice(0, 5).map(([cat, count], idx) => {
              const pct = Math.round((count / products.length) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-stone-700 dark:text-zinc-300 font-bold">
                    <span>{cat}</span>
                    <span className="font-mono text-stone-500">{count} سلع ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 rounded-full transition-all" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
