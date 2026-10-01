import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  Phone, 
  Store, 
  ChevronRight, 
  MessageSquare, 
  ArrowLeft,
  X
} from 'lucide-react';
import { Dispute, DisputeStatus } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';

interface AdminSupportDisputesProps {
  disputes: Dispute[];
  onArbitrateDispute: (disputeId: string, decision: 'refund_customer' | 'reject_claim' | 'partial_settlement', resolutionNotes: string) => void;
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminSupportDisputes: React.FC<AdminSupportDisputesProps> = ({
  disputes,
  onArbitrateDispute,
  onRequestConfirmation,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [arbitrationNotes, setArbitrationNotes] = useState('');

  // Filter Logic
  const filteredDisputes = disputes.filter(d => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = 
      (d.customerName || '').toLowerCase().includes(term) ||
      (d.sellerName || '').toLowerCase().includes(term) ||
      (d.orderId || '').toLowerCase().includes(term) ||
      (d.description || '').toLowerCase().includes(term);

    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Handle Arbitration Action with Confirmation
  const handleTriggerArbitration = (decision: 'refund_customer' | 'reject_claim' | 'partial_settlement') => {
    if (!selectedDispute) return;

    const labelMap = {
      refund_customer: 'استرجاع كامل المبلغ للعميل وتحميل التاجر المسؤولية',
      reject_claim: 'رفض شكوى العميل واعتماد موقف التاجر',
      partial_settlement: 'تسوية ودية وتوزيع التكلفة بالتناصف'
    };

    onRequestConfirmation({
      isOpen: true,
      title: 'قرار التحكيم الإداري النهائي للنزاع',
      message: `هل أنت متأكد من إصدار قرار [${labelMap[decision]}] للطلب رقم (${selectedDispute.orderId})؟`,
      severity: decision === 'refund_customer' ? 'danger' : 'warning',
      requiredRole: ['admin', 'support'],
      impactItems: [
        'القرار نهائي وملزم وفق بنود حماية المستهلك المصري وقواعد سوق دسوق.',
        'سيتم تحديث رصيد التاجر والمحفظة المالية بناءً على القرار الصادر.',
        'سيتم إشعار طرفي النزاع بنص القرار ومسوغاته القانونية فوراً.'
      ],
      onConfirm: async () => {
        onArbitrateDispute(selectedDispute.id, decision, arbitrationNotes || 'تم البت في النزاع عبر الإدارة المركزية');
        setSelectedDispute(null);
        setArbitrationNotes('');
        showToast('تم اعتماد قرار التحكيم وتوثيق القيد المالي بنجاح');
      }
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#800020]" />
              <span>غرفة التحكيم الإداري والنزاعات (Disputes & Arbitration)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              فض النزاعات التجارية، مسترجعات السلع، وتطبيق قانون حماية المستهلك المصري 181/2018.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم العميل، التاجر، أو رقم الطلب..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع النزاعات ({disputes.length})</option>
              <option value="open">نزاع مفتوح (Open)</option>
              <option value="urgent">نزاع عاجل (Urgent)</option>
              <option value="under_investigation">قيد التحقيق الفني</option>
              <option value="resolved">تم البت والحل (Resolved)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Disputes Grid & Arbitration Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredDisputes.length === 0 ? (
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 text-center text-stone-400 dark:text-zinc-500 text-xs">
              لا توجد نزاعات مفتوحة تطابق معايير التصفية الحالية
            </div>
          ) : (
            filteredDisputes.map((d) => {
              const isSelected = selectedDispute?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 bg-white dark:bg-zinc-900 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected 
                      ? 'border-[#800020] dark:border-[#D4AF37] shadow-md ring-1 ring-[#800020] dark:ring-[#D4AF37]' 
                      : 'border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-stone-900 dark:text-white">
                        طلب #{d.orderId} - {d.reason === 'defective_product' ? 'سلعة معيبة' : d.reason === 'not_as_described' ? 'غير مطابق للمواصفات' : 'تأخر شحن أو استبدال'}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                        العميل: <strong className="text-stone-800 dark:text-zinc-200">{d.customerName}</strong> ضد متجر: <strong className="text-stone-800 dark:text-zinc-200">{d.sellerName}</strong>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      d.status === 'urgent' ? 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300' : d.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {d.status === 'urgent' ? 'عاجل' : d.status === 'resolved' ? 'تم الحل' : 'مفتوح'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-zinc-300 line-clamp-2 bg-stone-50 dark:bg-zinc-800/60 p-2 rounded-xl">
                    {d.description}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Dispute Arbitration Deck */}
        <div className="lg:col-span-5">
          {selectedDispute ? (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4 sticky top-4">
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                  منصة البت والتحكيم الفوري
                </h3>
                <button
                  onClick={() => setSelectedDispute(null)}
                  aria-label="إلغاء تحديد النزاع"
                  className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs divide-y divide-stone-100 dark:divide-zinc-800">
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500 dark:text-zinc-400">المطالبة:</span>
                  <strong className="text-stone-900 dark:text-white">{selectedDispute.requestedResolution === 'refund' ? 'استرجاع نقدي كامل' : 'استبدال السلعة'}</strong>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500 dark:text-zinc-400">التاجر المشكو في حقه:</span>
                  <strong className="text-amber-700 dark:text-amber-400">{selectedDispute.sellerName}</strong>
                </div>
              </div>

              {/* Arbitration Resolution Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 block">
                  ملاحظات ومسوغات القرار الإداري:
                </label>
                <textarea
                  value={arbitrationNotes}
                  onChange={(e) => setArbitrationNotes(e.target.value)}
                  rows={3}
                  placeholder="أدخل حيثيات القرار للمشتري والتاجر..."
                  className="w-full p-3 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#800020] text-stone-900 dark:text-zinc-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleTriggerArbitration('refund_customer')}
                  className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  الحكم باسترجاع المبلغ للعميل (Refund)
                </button>
                <button
                  onClick={() => handleTriggerArbitration('reject_claim')}
                  className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  رفض شكوى العميل وتبرئة التاجر
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 dark:bg-zinc-850 p-8 rounded-3xl border border-stone-200/60 dark:border-zinc-800 text-center text-stone-400 text-xs space-y-2">
              <Scale className="w-8 h-8 mx-auto text-stone-300 dark:text-zinc-600" />
              <p>اختر نزاعاً من القائمة لمراجعة المستندات وإصدار قرار التحكيم</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
