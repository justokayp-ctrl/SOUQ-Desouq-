import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Check, X, Loader2, Info } from 'lucide-react';
import { Role } from '../../types';

export interface ConfirmationModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'critical' | 'danger' | 'warning' | 'info';
  requiredRole?: Role[];
  requiredTypingPhrase?: string;
  impactItems?: string[];
  requireReason?: boolean;
  onConfirm: (reason?: string) => Promise<void> | void;
}

interface AdminActionConfirmationModalProps {
  config: ConfirmationModalConfig | null;
  onClose: () => void;
  currentUserRole?: Role;
}

export const AdminActionConfirmationModal: React.FC<AdminActionConfirmationModalProps> = ({
  config,
  onClose,
  currentUserRole = 'admin',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!config || !config.isOpen) return null;

  const severity = config.severity || 'danger';
  const isCritical = severity === 'critical' || severity === 'danger';
  const hasRolePermission = !config.requiredRole || config.requiredRole.includes(currentUserRole);

  const isConfirmationSatisfied = 
    !config.requiredTypingPhrase || 
    typedInput.trim().toLowerCase() === config.requiredTypingPhrase.trim().toLowerCase();

  const isReasonSatisfied = 
    !config.requireReason || actionReason.trim().length >= 3;

  const handleExecute = async () => {
    if (!hasRolePermission) {
      setErrorMessage(`غير مصرح: هذه العملية تتطلب رتبة (${config.requiredRole?.join(' أو ')})`);
      return;
    }

    if (config.requiredTypingPhrase && !isConfirmationSatisfied) {
      setErrorMessage(`يرجى كتابة كلمة التأكيد المطلوبة بالضبط: "${config.requiredTypingPhrase}"`);
      return;
    }

    if (config.requireReason && !isReasonSatisfied) {
      setErrorMessage('سبب القرار إلزامي (3 أحرف على الأقل) للتسجيل في سجل التدقيق الرقابي');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await config.onConfirm(actionReason);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء تنفيذ الإجراء الحساس');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 max-w-lg w-full rounded-3xl p-6 sm:p-7 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-5 text-right animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isCritical 
              ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50' 
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
          }`}>
            {isCritical ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                {config.title}
              </h3>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isCritical ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>
                {isCritical ? 'إجراء حساس وإلزامي التوثيق' : 'إجراء تنفيذي معتمد'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
              {config.message}
            </p>
          </div>
        </div>

        {/* Impact List */}
        {config.impactItems && config.impactItems.length > 0 && (
          <div className="p-3.5 bg-stone-50 dark:bg-zinc-800/60 rounded-2xl border border-stone-200/70 dark:border-zinc-700/60 space-y-2">
            <span className="text-[11px] font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>الآثار التشغيلية المترتبة على هذا القرار:</span>
            </span>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-400 pr-4 list-disc">
              {config.impactItems.map((item, idx) => (
                <li key={idx} className="leading-snug">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mandatory Reason Input field */}
        {config.requireReason && (
          <div className="space-y-1.5 bg-stone-50 dark:bg-zinc-800/80 p-4 rounded-2xl border border-stone-200 dark:border-zinc-700">
            <label className="text-xs font-bold text-stone-800 dark:text-zinc-200 block">
              سبب تنفيذ القرار (إلزامي للتوثيق الرقابي):
            </label>
            <textarea
              rows={2}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="اكتب سبب الإجراء التنفيذي هنا لتسجيله في Audit Log..."
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
            />
          </div>
        )}

        {/* Typed confirmation input if required */}
        {config.requiredTypingPhrase && (
          <div className="space-y-2 bg-red-50/70 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/40">
            <label className="text-xs font-bold text-red-900 dark:text-red-300 block">
              لتأكيد الإجراء، يرجى كتابة <strong className="font-mono underline select-all px-1 bg-white dark:bg-zinc-800 rounded">{config.requiredTypingPhrase}</strong> أدناه:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={`اكتب "${config.requiredTypingPhrase}" هنا...`}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-800 rounded-xl outline-none focus:ring-2 focus:ring-red-700 dark:text-white"
            />
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 text-xs rounded-xl font-bold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Permission restriction warning */}
        {!hasRolePermission && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs rounded-xl font-bold">
            رتبتك الحالية ({currentUserRole}) لا تملك الصلاحية الكافية لتنفيذ هذا الإجراء مباشرة.
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-end gap-3 text-xs font-bold">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {config.cancelLabel || 'إلغاء التراجع'}
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isProcessing || !hasRolePermission || (Boolean(config.requiredTypingPhrase) && !isConfirmationSatisfied) || (Boolean(config.requireReason) && !isReasonSatisfied)}
            className={`px-5 py-2.5 rounded-full text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isCritical
                ? 'bg-red-700 hover:bg-red-800 shadow-md shadow-red-900/20'
                : 'bg-[#800020] hover:bg-[#600018] shadow-md'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التنفيذ والتسجيل...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{config.confirmLabel || 'تأكيد الإجراء فوراً'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
