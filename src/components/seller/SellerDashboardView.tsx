import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Tag, 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  ShieldCheck,
  Boxes,
  Zap,
  Printer,
  AlertTriangle,
  Wallet,
  Store,
  ExternalLink,
  ChevronLeft,
  SlidersHorizontal,
  XCircle
} from 'lucide-react';
import { Seller, Product, SellerSubOrder, OrderStatus } from '../../types';

interface SellerDashboardViewProps {
  seller: Seller;
  products: Product[];
  subOrders: (SellerSubOrder & {
    parentOrderId: string;
    parentTrackingCode: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: any;
    createdAt?: string;
  })[];
  lowStockProducts: Product[];
  unansweredMessagesCount: number;
  onNavigateTab: (tab: any) => void;
  onOpenProductWizard: (prod?: Product | null) => void;
  onOpenStockModal: (prod: Product) => void;
  onOpenPromoModal: () => void;
  onOpenShippingSlip: (order: any) => void;
  onQuickUpdateStatus: (parentOrderId: string, subOrderId: string, status: OrderStatus) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  seller,
  products,
  subOrders,
  lowStockProducts,
  unansweredMessagesCount,
  onNavigateTab,
  onOpenProductWizard,
  onOpenStockModal,
  onOpenPromoModal,
  onOpenShippingSlip,
  onQuickUpdateStatus,
}) => {
  // Operational Segments
  const ordersRequiringAction = subOrders.filter(
    (s) => s.status === 'seller_confirmed' || s.status === 'processing' || (s.status as any) === 'pending' || s.status === 'ready_for_pickup'
  );

  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const criticalStockList = products.filter((p) => p.stock < 10);
  const pendingProducts = products.filter((p) => 
    p.status === 'draft' || 
    p.status === 'incomplete' || 
    p.status === 'pending_moderation' || 
    p.status === 'suspended'
  );

  const isKycComplete = seller.verificationStatus === 'verified' && Boolean(seller.taxRegistrationNumber);
  const availableBalance = seller.availableBalanceEGP || 0;
  const pendingBalance = seller.pendingBalanceEGP || 0;
  const totalSales = seller.totalSalesEGP || 0;

  // Urgent attention counter
  const totalAttentionItems = 
    ordersRequiringAction.length + 
    criticalStockList.length + 
    pendingProducts.length + 
    (!isKycComplete ? 1 : 0) + 
    (unansweredMessagesCount > 0 ? 1 : 0);

  return (
    <div id="seller-dashboard-view" className="space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. PRIMARY OPERATIONAL HERO: "WHAT NEEDS YOUR ATTENTION?"                 */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-zinc-800 rounded-3xl border-2 border-[#800020]/20 dark:border-zinc-700 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-700">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#800020] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#800020]"></span>
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A1A] dark:text-zinc-100">
                ما الذي يحتاج انتباهك الآن؟
              </h2>
              <span className="text-xs bg-[#800020] text-[#D4AF37] font-black px-3 py-0.5 rounded-full">
                {totalAttentionItems} مهام تشغيلية عاجلة
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              مركز العمليات المباشر لإدارة متجرك بدسوق — الإجراءات السريعة مقدمة على التحليلات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenProductWizard(null)}
              className="bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>
        </div>

        {/* 6 OPERATIONAL ACTION HUBS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* CARD 1: Orders Requiring Action */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            ordersRequiringAction.length > 0 
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' 
              : 'bg-gray-50/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>طلبات تحتاج إجراء فوري</span>
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  ordersRequiringAction.length > 0 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                }`}>
                  {ordersRequiringAction.length}
                </span>
              </div>

              {ordersRequiringAction.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-blue-950 dark:text-blue-200 font-medium">
                    لديك <strong className="font-black text-blue-700 dark:text-blue-300">{ordersRequiringAction.length} طلبات</strong> بحاجة للتجهيز أو التسليم لمندوب الشحن:
                  </p>
                  
                  {/* Immediate Quick Action for the top order */}
                  {ordersRequiringAction.slice(0, 2).map((ord) => (
                    <div key={ord.id} className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A] dark:text-zinc-200">#{ord.parentTrackingCode}</span>
                        <span className="text-gray-500">{ord.subtotalEGP} ج.م</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 truncate">{ord.customerName} ({ord.shippingAddress?.city || 'دسوق'})</span>
                        {ord.status === 'seller_confirmed' && (
                          <button
                            type="button"
                            onClick={() => onQuickUpdateStatus(ord.parentOrderId, ord.id, 'processing')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            بدء التجهيز
                          </button>
                        )}
                        {ord.status === 'processing' && (
                          <button
                            type="button"
                            onClick={() => onQuickUpdateStatus(ord.parentOrderId, ord.id, 'ready_for_pickup')}
                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            جاهز للمندوب
                          </button>
                        )}
                        {ord.status === 'ready_for_pickup' && (
                          <button
                            type="button"
                            onClick={() => onQuickUpdateStatus(ord.parentOrderId, ord.id, 'shipped')}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            تسليم للمندوب
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  جميع الطلبات المستلمة تم تجهيزها وتسليمها لمندوبي التوصيل بنجاح.
                </p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-blue-100 dark:border-blue-900/40">
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="w-full text-center text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>إدارة ومتابعة كافة الطلبات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 2: Low Stock & Out of Stock */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            criticalStockList.length > 0 
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' 
              : 'bg-gray-50/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>تنبيهات انخفاض ونفاد المخزون</span>
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  criticalStockList.length > 0 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                }`}>
                  {criticalStockList.length}
                </span>
              </div>

              {criticalStockList.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-950 dark:text-amber-200 font-medium">
                    {outOfStockProducts.length > 0 && (
                      <span className="text-red-700 dark:text-red-400 font-bold block">
                        • {outOfStockProducts.length} منتج نفد تماماً (المخزون 0)
                      </span>
                    )}
                    <span>• {criticalStockList.length} منتج تحت الحد الأدنى (&lt;10 قطع)</span>
                  </p>

                  {/* Immediate Quick Restock buttons */}
                  {criticalStockList.slice(0, 2).map((prod) => (
                    <div key={prod.id} className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A] dark:text-zinc-200 truncate max-w-[160px]">{prod.titleAr}</span>
                        <span className={`font-black ${prod.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {prod.stock} قطع
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenStockModal(prod)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          تعديل المخزون
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  مخزون جميع المنتجات في حالة ممتازة ومستقرة.
                </p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-amber-100 dark:border-amber-900/40">
              <button
                type="button"
                onClick={() => onNavigateTab('inventory')}
                className="w-full text-center text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>المستودع وجرد المخزون</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 3: Pending Products & Moderation */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            pendingProducts.length > 0 
              ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50' 
              : 'bg-gray-50/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>منتجات معلقة ومسودات</span>
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  pendingProducts.length > 0 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                }`}>
                  {pendingProducts.length}
                </span>
              </div>

              {pendingProducts.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-purple-950 dark:text-purple-200 font-medium">
                    لديك <strong className="font-black text-purple-700 dark:text-purple-300">{pendingProducts.length} منتجات</strong> غير منشورة للعملاء (مسودة أو معلقة):
                  </p>

                  {pendingProducts.slice(0, 2).map((prod) => (
                    <div key={prod.id} className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A1A] dark:text-zinc-200 truncate max-w-[160px]">{prod.titleAr}</span>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded">
                          {prod.status || 'مسودة'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenProductWizard(prod)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          تعديل ونشر
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  كافة منتجات كتالوج متجرك منشورة ونشطة في سوق دسوق.
                </p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-purple-100 dark:border-purple-900/40">
              <button
                type="button"
                onClick={() => onNavigateTab('products')}
                className="w-full text-center text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>إدارة المنتجات والكتالوج</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 4: KYC & Verification Issues */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>التوثيق الرسمي KYC</span>
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                  seller.verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {seller.verificationStatus === 'verified' ? 'موثق ومعتمد' : 'قيد التدقيق'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 dark:text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>السجل التجاري:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{seller.commercialRecordNumber || 'CR-99201'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>البطاقة الضريبية:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{seller.taxRegistrationNumber || 'TR-100293'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الفرع الرئيسي:</span>
                  <span className="font-bold text-[#800020] dark:text-[#D4AF37]">{seller.city} — {seller.desoqDistrict || 'حي وسط'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => onNavigateTab('settings')}
                className="w-full text-center text-xs font-bold text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>خزينة مستندات التوثيق KYC</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD 5: Payment & Payout Issues */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span>الرصيد المالي والسحوبات</span>
                </span>
                <span className="text-xs font-black text-green-700 dark:text-green-400">
                  {availableBalance.toLocaleString()} ج.م متاح
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                  <span>رصيد معلق (قيد الشحن):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{pendingBalance.toLocaleString()} ج.م</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                  <span>عمولة المنصة:</span>
                  <span className="font-bold text-gray-800 dark:text-zinc-200">{(seller.commissionRate * 100).toFixed(0)}%</span>
                </div>
                <p className="text-[11px] text-green-700 dark:text-green-400 font-semibold pt-1">
                  ✓ متاح السحب الفوري عبر إنستاباي أو فودافون كاش
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateTab('finance')}
                className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                طلب سحب أرباح
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('finance')}
                className="text-xs font-bold text-gray-600 dark:text-zinc-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>كشف الحساب</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* CARD 6: Important Alerts & Store Health */}
          <div className="p-5 rounded-2xl border bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  <span>مؤشرات الجودة والتنبيهات</span>
                </span>
                <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37] flex items-center gap-1">
                  ★ {seller.rating?.toFixed(1) || '5.0'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>سرعة تلبية الطلبات:</span>
                  <span className="font-bold text-green-600">98.4% خلال 24 ساعة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>استفسارات المشترين:</span>
                  <span className={`font-bold ${unansweredMessagesCount > 0 ? 'text-purple-600' : 'text-gray-500'}`}>
                    {unansweredMessagesCount > 0 ? `${unansweredMessagesCount} رسالة غير مقروءة` : 'لا توجد استفسارات معلقة'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>نسبة النزاعات:</span>
                  <span className="font-bold text-green-600">0.0% (أداء ممتاز)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => onNavigateTab('customers')}
                className="w-full text-center text-xs font-bold text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>محادثات العملاء والتقييمات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OPERATIONAL SUMMARY METRICS STRIP                                     */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-xs">
          <div className="text-[11px] text-gray-500 font-semibold mb-1">إجمالي المبيعات التراكمية</div>
          <div className="text-xl sm:text-2xl font-serif font-black text-[#800020] dark:text-[#D4AF37]">
            {totalSales.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-xs">
          <div className="text-[11px] text-gray-500 font-semibold mb-1">المنتجات النشطة بالمتجر</div>
          <div className="text-xl sm:text-2xl font-serif font-black text-gray-800 dark:text-zinc-100">
            {products.length} <span className="text-xs font-bold text-gray-400">منتج</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-xs">
          <div className="text-[11px] text-gray-500 font-semibold mb-1">الطلبات المستلمة هذا الشهر</div>
          <div className="text-xl sm:text-2xl font-serif font-black text-blue-700 dark:text-blue-400">
            {subOrders.length} <span className="text-xs font-bold text-gray-400">طلب</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-xs">
          <div className="text-[11px] text-gray-500 font-semibold mb-1">الرصيد المتاح للسحب</div>
          <div className="text-xl sm:text-2xl font-serif font-black text-green-700 dark:text-green-400">
            {availableBalance.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FAST DAILY OPERATIONS ACTIONS SHORTCUTS                                */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-700 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D4AF37]" />
          <span>اختصارات العمليات اليومية السريعة</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-zinc-700/60 hover:bg-[#800020] hover:text-white transition-all text-right group cursor-pointer"
          >
            <Truck className="w-5 h-5 text-[#800020] dark:text-[#D4AF37] group-hover:text-white mb-2" />
            <div className="text-xs font-bold">تجهيز وشحن الطلبات</div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-white/80">طباعة البوالص وتغيير الحالات</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('inventory')}
            className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-zinc-700/60 hover:bg-[#800020] hover:text-white transition-all text-right group cursor-pointer"
          >
            <Boxes className="w-5 h-5 text-[#800020] dark:text-[#D4AF37] group-hover:text-white mb-2" />
            <div className="text-xs font-bold">تزويد المخزون السريع</div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-white/80">تحديث الكميات فوراً بالمخزن</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('products')}
            className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-zinc-700/60 hover:bg-[#800020] hover:text-white transition-all text-right group cursor-pointer"
          >
            <Package className="w-5 h-5 text-[#800020] dark:text-[#D4AF37] group-hover:text-white mb-2" />
            <div className="text-xs font-bold">إدارة وحذف المنتجات</div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-white/80">نشر، إيقاف، استنساخ، وتعديل</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('finance')}
            className="p-3.5 rounded-2xl bg-[#F5F2ED] dark:bg-zinc-700/60 hover:bg-[#800020] hover:text-white transition-all text-right group cursor-pointer"
          >
            <Wallet className="w-5 h-5 text-[#800020] dark:text-[#D4AF37] group-hover:text-white mb-2" />
            <div className="text-xs font-bold">سحب الأرباح الفوري</div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 group-hover:text-white/80">تحويل لرقمك عبر إنستاباي</div>
          </button>
        </div>
      </section>

    </div>
  );
};
