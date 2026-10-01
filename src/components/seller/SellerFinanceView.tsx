import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  CreditCard, 
  Smartphone, 
  Building2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Receipt
} from 'lucide-react';
import { Seller } from '../../types';

interface SellerFinanceViewProps {
  seller: Seller;
  onRequestPayout: (sellerId: string, amount: number, method: string) => void;
  onShowToast: (msg: string) => void;
}

export const SellerFinanceView: React.FC<SellerFinanceViewProps> = ({
  seller,
  onRequestPayout,
  onShowToast,
}) => {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(seller.availableBalanceEGP || 0);
  const [payoutMethod, setPayoutMethod] = useState<'instapay' | 'vodafone_cash' | 'bank_transfer'>('instapay');
  const [payoutAccount, setPayoutAccount] = useState('01012345678@instapay');

  // Core Financial Figures
  const availableBalance = seller.availableBalanceEGP || 0;
  const pendingBalance = seller.pendingBalanceEGP || 0;
  const totalSales = seller.totalSalesEGP || 0;
  const commissionRate = seller.commissionRate || 0.05;
  const totalCommissionDeducted = Math.round(totalSales * commissionRate);
  const totalCompletedPayouts = Math.max(0, totalSales - totalCommissionDeducted - availableBalance - pendingBalance);

  const [ledgerHistory] = useState([
    {
      id: 'tx-109',
      type: 'payout',
      title: 'سحب أرباح عبر إنستاباي InstaPay',
      amount: -3500,
      status: 'completed',
      date: '14 سبتمبر 2026',
      reference: 'IPAY-98201',
    },
    {
      id: 'tx-108',
      type: 'sale',
      title: 'تحصيل طلب رقم #ORD-9912 (طقم ملايات قطن)',
      amount: +1250,
      status: 'completed',
      date: '13 سبتمبر 2026',
      reference: 'ORD-9912',
    },
    {
      id: 'tx-107',
      type: 'commission',
      title: 'خصم عمولة المنصة (5%) لطلب #ORD-9912',
      amount: -62.5,
      status: 'completed',
      date: '13 سبتمبر 2026',
      reference: 'COMM-9912',
    },
    {
      id: 'tx-106',
      type: 'sale',
      title: 'تحصيل طلب رقم #ORD-9884 (فستان سواريه مطرز)',
      amount: +2800,
      status: 'completed',
      date: '11 سبتمبر 2026',
      reference: 'ORD-9884',
    },
  ]);

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) {
      onShowToast('يرجى إدخال مبلغ صحيح للسحب');
      return;
    }
    if (payoutAmount > availableBalance) {
      onShowToast('المبلغ المطلوب يتجاوز الرصيد المتاح حالياً');
      return;
    }
    onRequestPayout(seller.id, payoutAmount, `${payoutMethod} (${payoutAccount})`);
    setIsPayoutModalOpen(false);
  };

  return (
    <div id="seller-finance-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & PAYOUT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>المالية والأرباح والمحفظة الرقمية</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            متابعة الرصيد المتاح، الرصيد المعلق، إجمالي المبيعات، العمولات، وتسوية السحوبات
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPayoutAmount(availableBalance);
            setIsPayoutModalOpen(true);
          }}
          disabled={availableBalance <= 0}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-all cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>طلب سحب أرباح فوري ({availableBalance.toLocaleString()} ج.م)</span>
        </button>
      </div>

      {/* 2. THE 5 CORE FINANCE CARDS (AVAILABLE, PENDING, SALES, COMMISSION, PAYOUTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Available Balance */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border-2 border-green-500/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-green-800 dark:text-green-300">Available Balance</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-serif font-black text-green-700 dark:text-green-400">
            {availableBalance.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
          <p className="text-[10px] text-gray-400">متاح للسحب الفوري لحسابك</p>
        </div>

        {/* Metric 2: Pending Balance */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-amber-800 dark:text-amber-300">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-black text-amber-600 dark:text-amber-400">
            {pendingBalance.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
          <p className="text-[10px] text-gray-400">شحنات جارية قيد التوصيل</p>
        </div>

        {/* Metric 3: Total Sales */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-gray-800 dark:text-zinc-200">Sales (المبيعات)</span>
            <TrendingUp className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-black text-[#800020] dark:text-[#D4AF37]">
            {totalSales.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
          <p className="text-[10px] text-gray-400">إجمالي قيمة البضائع المباعة</p>
        </div>

        {/* Metric 4: Platform Commission */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-purple-800 dark:text-purple-300">Commission (العمولة)</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-serif font-black text-purple-700 dark:text-purple-400">
            {totalCommissionDeducted.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
          <p className="text-[10px] text-gray-400">نسبة المنصة {(commissionRate * 100).toFixed(0)}% فقط</p>
        </div>

        {/* Metric 5: Total Completed Payouts */}
        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-blue-800 dark:text-blue-300">Payouts (السحوبات)</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-black text-blue-700 dark:text-blue-400">
            {totalCompletedPayouts.toLocaleString()} <span className="text-xs font-bold text-gray-400">ج.م</span>
          </div>
          <p className="text-[10px] text-gray-400">تم تحويلها لحسابك البنكي / المحفظة</p>
        </div>

      </div>

      {/* 3. TRANSACTION LEDGER */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
            <span>كشف الحساب المالي وسجل المعاملات</span>
          </h3>

          <button
            type="button"
            onClick={() => onShowToast('تم تصدير كشف الحساب المالي PDF')}
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-zinc-300 hover:text-[#800020] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل كشف الحساب</span>
          </button>
        </div>

        {/* Mobile / Tablet Cards (md:hidden) */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-zinc-700/60 p-2">
          {ledgerHistory.map((tx) => (
            <div key={tx.id} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-800 dark:text-zinc-200">{tx.title}</span>
                <span className={`font-serif font-bold text-sm ${
                  tx.amount > 0 ? 'text-green-600' : 'text-gray-800 dark:text-zinc-100'
                }`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span className="font-mono">{tx.reference} • {tx.date}</span>
                <span className="font-bold bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-0.5 rounded-full">
                  مكتملة
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F2ED]/60 dark:bg-zinc-900/60 border-b border-gray-100 dark:border-zinc-700 text-gray-500">
                <th className="p-3">المعاملة</th>
                <th className="p-3">المرجع</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/60">
              {ledgerHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/30">
                  <td className="p-3 font-semibold text-gray-800 dark:text-zinc-200">
                    {tx.title}
                  </td>
                  <td className="p-3 font-mono text-gray-400">
                    {tx.reference}
                  </td>
                  <td className="p-3 text-gray-500">
                    {tx.date}
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-0.5 rounded-full">
                      مكتملة
                    </span>
                  </td>
                  <td className={`p-3 text-left font-serif font-bold text-sm ${
                    tx.amount > 0 ? 'text-green-600' : 'text-gray-800 dark:text-zinc-100'
                  }`}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ج.م
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PAYOUT MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-700 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-700">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span>طلب سحب أرباح فوري</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  المبلغ المراد سحبه (الرصيد المتاح: {availableBalance} ج.م)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    max={availableBalance}
                    min={100}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-sm font-bold text-[#1A1A1A] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020]"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    ج.م
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  طريقة التحويل
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutMethod('instapay');
                      setPayoutAccount('01012345678@instapay');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutMethod === 'instapay'
                        ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    إنستاباي
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutMethod('vodafone_cash');
                      setPayoutAccount('01012345678');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutMethod === 'vodafone_cash'
                        ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    فودافون كاش
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutMethod('bank_transfer');
                      setPayoutAccount('EG123456789012345678901234');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    تحويل بنكي
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                  بيانات الحساب / رقم المحفظة
                </label>
                <input
                  type="text"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-xs font-bold text-[#1A1A1A] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  تأكيد وإرسال طلب السحب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
