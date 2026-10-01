import React from 'react';
import { 
  Scale, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  ShieldCheck, 
  FileText,
  BarChart3,
  Award,
  Users
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const SupportReportsView: React.FC = () => {
  const { disputes, orders } = useMarketplace();

  const totalDisputes = disputes.length;
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved' || d.status === 'rejected' || d.status === 'resolved_refunded').length;
  const openDisputes = totalDisputes - resolvedDisputes;
  const urgentDisputes = disputes.filter(d => d.priority === 'urgent' && d.status !== 'resolved').length;

  const refundDisputes = disputes.filter(d => d.requestedResolution === 'refund');
  const replacementDisputes = disputes.filter(d => d.requestedResolution === 'replacement');

  const defectiveCount = disputes.filter(d => d.reason === 'defective_product').length;
  const notDescribedCount = disputes.filter(d => d.reason === 'not_as_described').length;
  const wrongItemCount = disputes.filter(d => d.reason === 'wrong_item').length;
  const lateDeliveryCount = disputes.filter(d => d.reason === 'late_delivery').length;

  const resolutionRate = totalDisputes > 0 ? Math.round((resolvedDisputes / totalDisputes) * 100) : 100;

  // Calculate approximate refund volume
  const totalRefundAmountEGP = disputes
    .filter(d => d.status === 'resolved' && d.requestedResolution === 'refund')
    .reduce((acc, d) => {
      const ord = orders.find(o => o.id === d.orderId);
      return acc + (ord?.totalAmountEGP || 450);
    }, 0);

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 relative overflow-hidden border border-[#D4AF37]/30 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-[#D4AF37] font-serif">
                تقرير أداء التحكيم وحماية المستهلك (SLA & Arbitration Analytics)
              </h2>
            </div>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              مؤشرات الأداء التشغيلي وسرعة الاستجابة وفقاً للمعايير القياسية لقانون حماية المستهلك المصري رقم 181 لسنة 2018 ولائحة سوق دسوق للسلع الحرفية.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-stone-300 block">نسبة الالتزام بـ SLA</span>
              <strong className="text-base text-emerald-400 font-bold">98.6%</strong>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-stone-300 block">متوسط زمن الاستجابة</span>
              <strong className="text-base text-[#D4AF37] font-bold">14 دقيقة</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">إجمالي النزاعات المسجلة</span>
            <div className="p-2 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-bold text-stone-900 dark:text-zinc-100 font-serif block">{totalDisputes}</strong>
          <span className="text-[11px] text-stone-400">تغطية شاملة لكافة الطلبات</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">معدل التسوية الناجحة</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-serif block">{resolutionRate}%</strong>
          <span className="text-[11px] text-emerald-600 font-semibold">{resolvedDisputes} تذكرة تم تسويتها</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">قيمة المبالغ المستردة للمشترين</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-bold text-[#800020] dark:text-[#D4AF37] font-serif block">{totalRefundAmountEGP} ج.م</strong>
          <span className="text-[11px] text-stone-400">تسوية فورية مع التاجر</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">تذاكر عاجلة قيد المتابعة</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-bold text-rose-600 font-serif block">{urgentDisputes}</strong>
          <span className="text-[11px] text-rose-600 font-semibold">أولوية قصوى للفريق</span>
        </div>
      </div>

      {/* Deep Breakdown Tables & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Reasons Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>تصنيف أسباب الشكاوى والنزاعات:</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'عيب صناعة أو تلف أثناء الشحن', count: defectiveCount, color: 'bg-rose-500' },
              { label: 'عدم مطابقة للمواصفات المعروضة', count: notDescribedCount, color: 'bg-amber-500' },
              { label: 'استلام منتج أو مقاس خاطئ', count: wrongItemCount, color: 'bg-blue-500' },
              { label: 'تأخر الشحنة والتوصيل', count: lateDeliveryCount, color: 'bg-stone-500' },
            ].map((item, idx) => {
              const percent = totalDisputes > 0 ? Math.round((item.count / totalDisputes) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-700 dark:text-zinc-300">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.count} حالة ({percent}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all`} 
                      style={{ width: `${Math.max(percent, 4)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Outcome Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>قرارات التحكيم الصادرة وتوزيع الحلول:</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <strong className="text-emerald-900 dark:text-emerald-200 block">رد مالي كامل للمشتري</strong>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300">استرداد فوري وتعديل رصيد التاجر</span>
                </div>
              </div>
              <strong className="text-emerald-900 dark:text-emerald-100 text-sm font-bold">{refundDisputes.length} حالات</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <div>
                  <strong className="text-blue-900 dark:text-blue-200 block">استبدال مجاني مع دسوق إكسبريس</strong>
                  <span className="text-[11px] text-blue-700 dark:text-blue-300">شحن قطعة بديلة واسترجاع التالف</span>
                </div>
              </div>
              <strong className="text-blue-900 dark:text-blue-100 text-sm font-bold">{replacementDisputes.length} حالات</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-stone-500" />
                <div>
                  <strong className="text-stone-900 dark:text-zinc-100 block">حفظ النزاع لعدم استيفاء الشروط</strong>
                  <span className="text-[11px] text-stone-500">فحص فني وتطابق كامل للمواصفات</span>
                </div>
              </div>
              <strong className="text-stone-900 dark:text-zinc-100 text-sm font-bold">
                {disputes.filter(d => d.status === 'rejected').length} حالات
              </strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
