import React from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ListingFormData, ListingWizardStep } from './types';
import { calculateListingCompletion, StepValidationStatus } from './draftManager';

interface Step10ReviewProps {
  formData: ListingFormData;
  onJumpToStep: (step: ListingWizardStep) => void;
}

export const Step10Review: React.FC<Step10ReviewProps> = ({
  formData,
  onJumpToStep
}) => {
  const completion = calculateListingCompletion(formData);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-review-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-amber-50 via-amber-50/40 to-yellow-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-amber-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                10. المراجعة الشاملة وفحص الامتثال (Review & Compliance)
              </h3>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                الخطوة 10 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              فحص جودة الإدراج، التحقق من عدم وجود أخطاء في الأسعار أو تكرار رموز SKU، والتأكد من مطابقة معايير النشر.
            </p>
          </div>
        </div>
      </div>

      {/* Main Review Card */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        {/* Quality Score Header */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-serif font-bold text-xl ${
              completion.overallPercentage >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              completion.overallPercentage >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {completion.overallPercentage}%
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                مؤشر اكتمال وجودة بطاقة المنتج
              </span>
              <span className="text-xs text-zinc-500">
                {completion.criticalErrors.length === 0
                  ? 'جميع البيانات الأساسية مكتملة وجاهزة للنشر الفوري'
                  : `يوجد ${completion.criticalErrors.length} ملاحظات حرجة يجب معالجتها قبل النشر`}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completion.overallPercentage >= 80 ? 'bg-emerald-500' :
                completion.overallPercentage >= 50 ? 'bg-amber-500' :
                'bg-rose-500'
              }`}
              style={{ width: `${completion.overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Critical Errors (if any) */}
        {completion.criticalErrors.length > 0 && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>ملاحظات إجبارية تمنع النشر:</span>
            </div>
            <ul className="text-xs text-rose-700 dark:text-rose-300 space-y-1 pr-4 list-disc">
              {completion.criticalErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps Audit List */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            فحص خطوات الإدراج التفصيلية:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completion.stepsStatus.slice(0, 8).map((step) => {
              const hasErrors = step.errors.length > 0;
              return (
                <div
                  key={step.stepId}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    hasErrors
                      ? 'border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-800'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {hasErrors ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                        {step.labelAr}
                      </span>
                      {hasErrors ? (
                        <span className="text-[11px] text-rose-600 font-medium block truncate">
                          {step.errors[0]}
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium block">
                          مكتمل بنجاح
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToStep(step.stepId as ListingWizardStep)}
                    className="text-[11px] font-bold text-[#800020] dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
                  >
                    تعديل
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal & Marketplace Policy Checklist */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>إقرار الامتثال للمعايير والقوانين المصرية:</span>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <label className="flex items-start gap-2 cursor-pointer">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>المنتج أصلي 100% وخالٍ من أي انتهاكات لحقوق الملكية الفكرية أو العلامات المقلدة.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>الأسعار والمواصفات مطابقة تماماً للمنتج الذي سيتم تسليمه للمشتري دون أي اختلاف.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>الالتزام بقانون حماية المستهلك المصري رقم 181 لسنة 2018 للاستبدال والاسترجاع.</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
