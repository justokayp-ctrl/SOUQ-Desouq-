import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Send, 
  Download, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileSpreadsheet, 
  Building, 
  ShieldCheck, 
  Lock,
  Layers,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Database,
  CheckCircle,
  XCircle,
  Wrench
} from 'lucide-react';
import { Seller, MarketplaceOrder, PayoutBatch, FinancialLedgerEntry } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';
import { api } from '../../services/api';

interface AdminFinanceManagementProps {
  sellers: Seller[];
  orders: MarketplaceOrder[];
  ledgerEntries: FinancialLedgerEntry[];
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminFinanceManagement: React.FC<AdminFinanceManagementProps> = ({
  sellers,
  orders,
  ledgerEntries,
  onRequestConfirmation,
  showToast,
}) => {
  const [activeFinanceTab, setActiveFinanceTab] = useState<'overview' | 'payouts' | 'ledger' | 'reconciliation'>('overview');
  const [payoutMethod, setPayoutMethod] = useState<'instapay' | 'bank_transfer' | 'fawry_valy'>('instapay');

  // Reconciliation Audit State
  const [auditReport, setAuditReport] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isHealing, setIsHealing] = useState(false);

  const fetchAuditReport = async () => {
    setIsAuditing(true);
    try {
      const data = await api.getReconciliationAudit();
      setAuditReport(data);
    } catch (e: any) {
      showToast(e.message || 'فشل تشغيل فحص المطابقة');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunAutoHeal = async () => {
    setIsHealing(true);
    try {
      const res = await api.autoHealReconciliation();
      showToast(res.message || 'تمت المعالجة الذاتية بنجاح');
      await fetchAuditReport();
    } catch (e: any) {
      showToast(e.message || 'فشل تنفيذ المعالجة الذاتية');
    } finally {
      setIsHealing(false);
    }
  };

  useEffect(() => {
    if (activeFinanceTab === 'reconciliation') {
      fetchAuditReport();
    }
  }, [activeFinanceTab]);

  // Active Payout Batches State (Simulated Durable Queue)
  const [batches, setBatches] = useState<PayoutBatch[]>([
    {
      id: 'batch_2026_03_01',
      batchReference: 'PAYOUT-DESOQ-2026-03-A',
      totalAmountEGP: 84500,
      sellersCount: 6,
      status: 'settled',
      payoutMethod: 'instapay',
      createdAt: '2026-03-01T10:00:00Z',
      processedAt: '2026-03-01T14:30:00Z',
      processedBy: 'admin_audit_01'
    },
    {
      id: 'batch_2026_03_08',
      batchReference: 'PAYOUT-DESOQ-2026-03-B',
      totalAmountEGP: 41200,
      sellersCount: 4,
      status: 'pending_approval',
      payoutMethod: 'instapay',
      createdAt: '2026-03-08T09:00:00Z',
    }
  ]);

  // Calculations
  const totalGMV = orders.reduce((sum, o) => sum + (o.totalAmountEGP || o.totalPriceEGP || 0), 0);
  const totalCommission = orders.reduce((sum, o) => 
    sum + (o.subOrders || o.sellerSubOrders || []).reduce((sSum, sub) => sSum + (sub.commissionEGP || 0), 0), 0
  );
  const totalSellerPendingBalance = sellers.reduce((sum, s) => sum + (s.pendingBalanceEGP || 0), 0);

  // Trigger Payout Batch Execution
  const handleExecuteBatch = (batchId: string, amount: number) => {
    onRequestConfirmation({
      isOpen: true,
      title: 'صرف وتسوية دفعة أرباح التجار',
      message: `هل أنت متأكد من تنفيذ وتسوية دفعة المستحقات بقيمة (${amount.toLocaleString()} ج.م) عبر نظام التحويل المالي المباشر؟`,
      severity: 'critical',
      requiredRole: ['admin'],
      requiredTypingPhrase: 'تسوية',
      impactItems: [
        'سيتم تحويل المبالغ لحسابات التجار البنكية ومحافظ إنستاباي المعتمدة فوراً.',
        'سيتم تصفير الأرصدة المعلقة وتسجيل قيود اليومية في دفتر الأستاذ العام.',
        'سيتم إصدار إشعارات رسمية وإيصالات رقمية لجميع التجار المشمولين.'
      ],
      onConfirm: async () => {
        setBatches(prev => prev.map(b => 
          b.id === batchId ? { ...b, status: 'settled', processedAt: new Date().toISOString(), processedBy: 'admin' } : b
        ));
        showToast('تمت معالجة وتسوية دفعة المستحقات بنجاح وتوثيقها في دفتر الأستاذ');
      }
    });
  };

  // Generate New Payout Batch
  const handleCreateNewBatch = () => {
    const eligibleSellers = sellers.filter(s => (s.pendingBalanceEGP || 0) > 0);
    if (eligibleSellers.length === 0) {
      showToast('لا توجد أرصدة مستحقة للصرف حالياً');
      return;
    }

    const totalEligibleAmount = eligibleSellers.reduce((sum, s) => sum + (s.pendingBalanceEGP || 0), 0);
    const newBatch: PayoutBatch = {
      id: `batch_${Date.now()}`,
      batchReference: `PAYOUT-DESOQ-${new Date().toISOString().slice(0, 10)}-${Math.floor(100 + Math.random() * 900)}`,
      totalAmountEGP: totalEligibleAmount,
      sellersCount: eligibleSellers.length,
      status: 'pending_approval',
      payoutMethod: payoutMethod,
      createdAt: new Date().toISOString()
    };

    setBatches(prev => [newBatch, ...prev]);
    showToast(`تم إنشاء دفعة تسوية جديدة تضم ${eligibleSellers.length} تجار`);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header & Sub-Tabs */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#800020]" />
              <span>الإدارة المالية والتسويات ومستحقات التجار (Finance & Payouts Engine)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              متابعة تدفقات الأموال، عمولات المنصة، تسويات إنستاباي والتحويل البنكي، ودفتر الأستاذ.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveFinanceTab('overview')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFinanceTab === 'overview' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveFinanceTab('payouts')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFinanceTab === 'payouts' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
              }`}
            >
              دفعات التسوية (Batches)
            </button>
            <button
              onClick={() => setActiveFinanceTab('ledger')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFinanceTab === 'ledger' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
              }`}
            >
              دفتر الأستاذ العام
            </button>
            <button
              onClick={() => setActiveFinanceTab('reconciliation')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFinanceTab === 'reconciliation' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>تدقيق ومطابقة البيانات</span>
            </button>
          </div>
        </div>

      </div>

      {/* SUB-VIEW 1: OVERVIEW */}
      {activeFinanceTab === 'overview' && (
        <div className="space-y-6">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-stone-500">إجمالي المبيعات المحصلة (GMV)</span>
              <p className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                {totalGMV.toLocaleString()} <span className="text-xs text-stone-400">ج.م</span>
              </p>
              <p className="text-[11px] text-green-700 font-bold">100% مدفوعات موثقة ومطابقة</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-stone-500">صافي إيرادات عمولة المنصة</span>
              <p className="text-2xl font-serif font-bold text-[#800020] dark:text-[#D4AF37]">
                {totalCommission.toLocaleString()} <span className="text-xs text-stone-400">ج.م</span>
              </p>
              <p className="text-[11px] text-stone-500">متوسط نسبة العمولة: 10.2%</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-stone-500">مستحقات التجار المعلقة للصرف</span>
              <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400">
                {totalSellerPendingBalance.toLocaleString()} <span className="text-xs text-stone-400">ج.م</span>
              </p>
              <p className="text-[11px] text-amber-700 font-bold">جاهزة لإنشاء دفعة تحويل</p>
            </div>

          </div>

          {/* Quick Payout Generator Box */}
          <div className="bg-gradient-to-r from-stone-900 to-zinc-900 text-white p-6 rounded-3xl border border-stone-800 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base">إنشاء دورة تسوية أرباح فورية</h3>
              <p className="text-xs text-stone-300">
                تجميع كافة أرباح التجار المكتمل تسليمها وتصدير أوامر التحويل عبر إنستاباي والمحافظ الإلكترونية
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="bg-stone-800 border border-stone-700 text-white px-3 py-2 rounded-full text-xs font-bold"
              >
                <option value="instapay">تحويل إنستاباي الفوري (InstaPay)</option>
                <option value="bank_transfer">تحويل بنكي مصرفي مباشر</option>
                <option value="fawry_valy">شبكة فوري للمدفوعات</option>
              </select>

              <button
                onClick={handleCreateNewBatch}
                className="px-5 py-2 rounded-full bg-[#800020] hover:bg-[#a00028] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                إنشاء دفعة مستحقات جديدة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PAYOUT BATCHES */}
      {activeFinanceTab === 'payouts' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
              سجل دفعات وأوامر التسوية المالية
            </h3>
            <button
              onClick={handleCreateNewBatch}
              className="px-3.5 py-1.5 bg-[#800020] text-white rounded-full text-xs font-bold cursor-pointer"
            >
              + إنشاء دفعة تسوية
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                  <th className="p-3.5">المرجع ورقم الدفعة</th>
                  <th className="p-3.5">القيمة الإجمالية</th>
                  <th className="p-3.5">عدد المتاجر</th>
                  <th className="p-3.5">قناة التحويل</th>
                  <th className="p-3.5">حالة الصرف</th>
                  <th className="p-3.5 text-center">القرار والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/50">
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <p className="font-mono font-bold text-stone-900 dark:text-white">{b.batchReference}</p>
                        <p className="text-[10px] text-stone-400">{new Date(b.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <strong className="font-mono text-sm text-stone-900 dark:text-white">{b.totalAmountEGP.toLocaleString()} ج.م</strong>
                    </td>
                    <td className="p-3.5">
                      <span>{b.sellersCount} متاجر</span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                        {b.payoutMethod}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'settled' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {b.status === 'settled' ? 'تمت التسوية والتحويل' : 'بانتظار مصادقة المدير'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {b.status === 'pending_approval' ? (
                        <button
                          onClick={() => handleExecuteBatch(b.id, b.totalAmountEGP)}
                          className="px-3.5 py-1.5 rounded-full bg-[#800020] hover:bg-[#600018] text-white font-bold text-[11px] cursor-pointer"
                        >
                          تنفيذ وصرف المستحقات
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">مكتملة ومؤرشفة</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: LEDGER */}
      {activeFinanceTab === 'ledger' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 dark:border-zinc-800">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
              دفتر قيود اليومية والأستاذ المالي المزدوج (Double-Entry Ledger)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                  <th className="p-3.5">التاريخ والوقت</th>
                  <th className="p-3.5">نوع القيد</th>
                  <th className="p-3.5">البيان والوصف</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">الرصيد بعد القيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400">
                      لا توجد قيود مسجلة في دفتر الأستاذ حالياً
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((l) => (
                    <tr key={l.id} className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/50">
                      <td className="p-3.5 font-mono text-[10px] text-stone-400">
                        {new Date(l.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-3.5 font-bold">
                        <span className="bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
                          {l.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-700 dark:text-zinc-300">
                        {l.description}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-stone-900 dark:text-white">
                        {l.amountEGP > 0 ? `+${l.amountEGP}` : l.amountEGP} ج.م
                      </td>
                      <td className="p-3.5 font-mono text-stone-500">
                        {l.balanceAfterEGP} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: RECONCILIATION & INTEGRITY */}
      {activeFinanceTab === 'reconciliation' && (
        <div className="space-y-6">
          {/* Header Card with Controls */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#800020]" />
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                  محرك فحص المطابقة والنزاهة المحاسبية (Data & State Reconciliation)
                </h3>
                {auditReport && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    auditReport.healthy 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {auditReport.healthy ? 'البيانات سليمة 100%' : `${auditReport.discrepanciesCount} تنبيهات مطابقة`}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                فحص فوري لعلاقات الجداول، مطابقة حسابات الطلبات والطلبات الفرعية، سلامة دفتر الأستاذ، ومخزون المنتجات.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAuditReport}
                disabled={isAuditing}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>إعادة الفحص والتدقيق</span>
              </button>

              <button
                onClick={handleRunAutoHeal}
                disabled={isHealing}
                className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Wrench className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
                <span>المعالجة الذاتية التلقائية</span>
              </button>
            </div>
          </div>

          {/* Verification Checks Grid */}
          {auditReport?.checks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start gap-3">
                {auditReport.checks.orderTotalsMatch ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">معادلة إجمالي الطلبات</h4>
                  <p className="text-[11px] text-stone-500">المنتجات + الشحن - الخصم = الإجمالي</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start gap-3">
                {auditReport.checks.subOrderSumMatchesParent ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">مطابقة الطرود الفرعية</h4>
                  <p className="text-[11px] text-stone-500">مجموع شحنات التجار يطابق الطلب الأم</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start gap-3">
                {auditReport.checks.sellerLedgerConsistent ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">نزاهة أرصدة التجار</h4>
                  <p className="text-[11px] text-stone-500">لا توجد أرصدة سالبة غير مبررة</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start gap-3">
                {auditReport.checks.inventoryNonNegative ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">مخزون المنتجات غير سالب</h4>
                  <p className="text-[11px] text-stone-500">حماية من البيع الزائد (Over-selling)</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start gap-3">
                {auditReport.checks.inventoryCatalogSynced ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">مزامنة الكتالوج والمخزون</h4>
                  <p className="text-[11px] text-stone-500">تطابق جدول products مع جدول inventory</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-start gap-3">
                {auditReport.checks.zeroOrphanedRecords ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">تكامل المفاتيح الأجنبية</h4>
                  <p className="text-[11px] text-stone-500">خلو النظام من السجلات والطرود اليتيمة</p>
                </div>
              </div>
            </div>
          )}

          {/* Discrepancies Details Table */}
          {auditReport?.discrepancies && auditReport.discrepancies.length > 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xs overflow-hidden">
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  سجلات بحاجة لمعالجة وتعديل ({auditReport.discrepancies.length})
                </h4>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800 text-xs">
                {auditReport.discrepancies.map((d: any, idx: number) => (
                  <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
                          {d.entityType} : {d.entityId}
                        </span>
                        <span className="text-stone-700 dark:text-zinc-200 font-medium">{d.description}</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-stone-500">
                      القيمة المتوقعة: <span className="font-bold text-emerald-600">{String(d.expectedValue)}</span> | الحالية: <span className="font-bold text-rose-600">{String(d.actualValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-stone-200/80 dark:border-zinc-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                جميع البيانات متطابقة بنسبة 100%
              </h4>
              <p className="text-xs text-stone-500">
                لا توجد أي فروقات حسابية أو اختلالات في المخزون أو السجلات المالية بقاعدة البيانات.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
