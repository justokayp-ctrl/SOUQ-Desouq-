import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Code, 
  User, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Activity,
  Lock
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  status: 'success' | 'failure' | 'denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  payload?: any;
}

interface AdminAuditLogsViewProps {
  logs: AuditLogEntry[];
  showToast: (msg: string) => void;
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({
  logs,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Inspector Modal
  const [inspectingLog, setInspectingLog] = useState<AuditLogEntry | null>(null);

  // Simulated fallback logs if empty
  const displayLogs: AuditLogEntry[] = useMemo(() => {
    if (logs && logs.length > 0) return logs;
    return [
      {
        id: 'audit_101',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        actorId: 'admin_master_01',
        actorRole: 'admin',
        action: 'SELLER_COMMISSION_UPDATED',
        resourceType: 'seller',
        resourceId: 'seller_desoq_01',
        status: 'success',
        severity: 'medium',
        ipAddress: '197.38.112.44',
        payload: { previousRate: 0.12, newRate: 0.10, sellerName: 'فسخاني أهل دسوق' }
      },
      {
        id: 'audit_102',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        actorId: 'support_agent_02',
        actorRole: 'support',
        action: 'DISPUTE_ARBITRATION_REFUND',
        resourceType: 'dispute',
        resourceId: 'disp_9041',
        status: 'success',
        severity: 'high',
        ipAddress: '197.38.112.90',
        payload: { orderId: 'SD-2026-8941', refundAmountEGP: 650, resolution: 'تعويض العميل عن تلف الشحنة' }
      },
      {
        id: 'audit_103',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        actorId: 'admin_master_01',
        actorRole: 'admin',
        action: 'KYC_DOCUMENT_APPROVED',
        resourceType: 'kyc_document',
        resourceId: 'kyc_doc_882',
        status: 'success',
        severity: 'low',
        ipAddress: '197.38.112.44',
        payload: { sellerId: 'seller_desoq_04', docType: 'commercial_register' }
      }
    ];
  }, [logs]);

  // Filter logic
  const filteredLogs = useMemo(() => {
    return displayLogs.filter(l => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = 
        (l.action || '').toLowerCase().includes(term) ||
        (l.actorId || '').toLowerCase().includes(term) ||
        (l.resourceType || '').toLowerCase().includes(term) ||
        (l.resourceId || '').toLowerCase().includes(term) ||
        (l.ipAddress || '').includes(term);

      const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
      const matchAction = actionFilter === 'all' || l.action === actionFilter;

      return matchSearch && matchSeverity && matchAction;
    });
  }, [displayLogs, searchTerm, severityFilter, actionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['المعرف', 'التوقيت', 'المستخدم المسئول', 'الرتبة', 'نوع الإجراء', 'المورد', 'الخطورة', 'عنوان IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.actorId,
      l.actorRole,
      l.action,
      `${l.resourceType}:${l.resourceId || ''}`,
      l.severity,
      l.ipAddress || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `souq-desoq-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير سجل التدقيق الأمني بنجاح');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#800020]" />
              <span>سجلات التدقيق الأمني والرقابة الجنائية (Audit Trail & Forensics)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              سجل تدقيق غير قابل للتعديل يوثق كافة القرارات الإدارية، التحويلات، وتغييرات الصلاحيات.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير السجل CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="ابحث برقم المعرف، اسم الإجراء، معرف المورد، أو عنوان IP..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع مستويات الخطورة (All Severities)</option>
              <option value="critical">شديد الخطورة (Critical)</option>
              <option value="high">مرتفع (High)</option>
              <option value="medium">متوسط (Medium)</option>
              <option value="low">منخفض (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Audit Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                <th className="p-3.5">التوقيت</th>
                <th className="p-3.5">المسؤول والرتبة</th>
                <th className="p-3.5">الإجراء المنفذ</th>
                <th className="p-3.5">المورد المستهدف</th>
                <th className="p-3.5">الخطورة والـ IP</th>
                <th className="p-3.5 text-center">البيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {paginatedLogs.map((l) => (
                <tr key={l.id} className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/50">
                  <td className="p-3.5 font-mono text-[10px] text-stone-400">
                    {new Date(l.timestamp).toLocaleString('ar-EG')}
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <p className="font-bold text-stone-900 dark:text-white">{l.actorId}</p>
                      <span className="text-[9px] uppercase font-mono bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-stone-600">
                        {l.actorRole}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-xs text-stone-900 dark:text-white">
                    {l.action}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] text-stone-600 dark:text-zinc-300">
                      {l.resourceType}:{l.resourceId || '—'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.severity === 'critical' ? 'bg-red-100 text-red-900 font-black' :
                        l.severity === 'high' ? 'bg-red-50 text-red-800' :
                        l.severity === 'medium' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {l.severity}
                      </span>
                      <p className="font-mono text-[9px] text-stone-400">{l.ipAddress || '127.0.0.1'}</p>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setInspectingLog(l)}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 cursor-pointer"
                      title="عرض حمولة الـ JSON الكاملة"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-800/80 border-t border-stone-200/80 dark:border-zinc-700/80 flex items-center justify-between flex-wrap gap-4 text-xs font-bold text-stone-600 dark:text-zinc-300">
          <span>عرض {paginatedLogs.length} من أصل {filteredLogs.length} سجل</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="الصفحة السابقة"
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 disabled:opacity-40 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3">صفحة {currentPage} من {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="الصفحة التالية"
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 disabled:opacity-40 cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-4 text-right animate-in fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  بيانات سجل التدقيق الجنائي
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">ID: {inspectingLog.id}</span>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                aria-label="إغلاق نافذة المعاينة"
                className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">الإجراء:</span>
                <strong className="font-mono text-[#800020] dark:text-[#D4AF37]">{inspectingLog.action}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">المسؤول:</span>
                <strong className="font-mono text-stone-900 dark:text-zinc-100">{inspectingLog.actorId} ({inspectingLog.actorRole})</strong>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">حمولة البيانات (Payload Data):</span>
              <pre className="p-3 bg-stone-900 text-green-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60" dir="ltr">
                {JSON.stringify(inspectingLog.payload || inspectingLog, null, 2)}
              </pre>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-5 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 rounded-full font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
