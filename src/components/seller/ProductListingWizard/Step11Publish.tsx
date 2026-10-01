import React from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  PauseCircle, 
  FileText, 
  Archive, 
  Clock, 
  ExternalLink, 
  Eye, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ListingFormData } from './types';
import { ProductListingStatus } from '../../../types';
import { calculateListingCompletion } from './draftManager';

interface Step11PublishProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  onFinalSubmit: (targetStatus: ProductListingStatus) => void;
  isSubmitting: boolean;
  publishedProductId: string | null;
  onViewProductPdp?: (productId: string) => void;
  onCloseWizard?: () => void;
}

export const Step11Publish: React.FC<Step11PublishProps> = ({
  formData,
  setFormData,
  onFinalSubmit,
  isSubmitting,
  publishedProductId,
  onViewProductPdp,
  onCloseWizard
}) => {
  const completion = calculateListingCompletion(formData);
  const canPublishLive = completion.criticalErrors.length === 0;

  if (publishedProductId) {
    return (
      <div className="bg-white dark:bg-zinc-800/90 p-8 rounded-3xl border border-emerald-200 dark:border-zinc-700 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            تم تسجيل المنتج بنجاح في سوق دسوق! 🎉
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            تم حفظ المنتج وتحديث الكتالوج. يمكنك الآن معاينة الصفحة كما يراها المشترون أو العودة لإدارة المخزون.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onViewProductPdp && (
            <button
              type="button"
              onClick={() => onViewProductPdp(publishedProductId)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#800020] hover:bg-[#600018] text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>مشاهدة صفحة المنتج في المتجر</span>
            </button>
          )}

          {onCloseWizard && (
            <button
              type="button"
              onClick={onCloseWizard}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold text-sm cursor-pointer"
            >
              العودة إلى لوحة تحكم التاجر
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="step-publish-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-50 via-emerald-50/40 to-teal-50/30 dark:from-zinc-800 dark:to-zinc-800/80 p-5 rounded-3xl border border-emerald-200/80 dark:border-zinc-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                11. النشر وتعيين دورة حياة المنتج (Publish & Lifecycle)
              </h3>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                الخطوة 11 من 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              حدد حالة إطلاق المنتج في السوق، سواء بنشره فوراً للعملاء، أو حفظه كمسودة، أو إيقافه مؤقتاً.
            </p>
          </div>
        </div>
      </div>

      {/* Main Lifecycle Options */}
      <div className="bg-white dark:bg-zinc-800/90 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-xs space-y-6">
        <div className="space-y-3">
          <label className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
            اختر حالة المنتج المستهدفة (Target Lifecycle Status):
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Active / Published */}
            <button
              type="button"
              id="status-active-btn"
              onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
              disabled={!canPublishLive}
              className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                formData.status === 'active'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-zinc-700/80 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/50'
              } ${!canPublishLive ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                formData.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600'
              }`}>
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    نشر مباشر ونشط (Active / Published)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    متاح للبيع الفوري
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  يظهر المنتج فوراً في متجر سوق دسوق ونتائج البحث لجميع المتسوقين.
                </p>
              </div>
            </button>

            {/* Pending Review */}
            <button
              type="button"
              id="status-pending-btn"
              onClick={() => setFormData(prev => ({ ...prev, status: 'pending_moderation' }))}
              className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                formData.status === 'pending_moderation'
                  ? 'border-amber-600 bg-amber-50/50 dark:bg-zinc-700/80 shadow-xs ring-2 ring-amber-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                formData.status === 'pending_moderation' ? 'bg-amber-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  إرسال للتدقيق والمراجعة (Pending Review)
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  مراجعة فريق الجودة للصور والأسعار قبل ظهوره في المتجر.
                </p>
              </div>
            </button>

            {/* Draft */}
            <button
              type="button"
              id="status-draft-btn"
              onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
              className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                formData.status === 'draft'
                  ? 'border-zinc-600 bg-zinc-100 dark:bg-zinc-700 shadow-xs ring-2 ring-zinc-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                formData.status === 'draft' ? 'bg-zinc-800 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  حفظ كمسودة غير منشورة (Draft)
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  حفظ البيانات والعودة إليها لاستكمال التفاصيل لاحقاً دون إتاحتها للمشترين.
                </p>
              </div>
            </button>

            {/* Paused / Suspended */}
            <button
              type="button"
              id="status-suspended-btn"
              onClick={() => setFormData(prev => ({ ...prev, status: 'suspended' }))}
              className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                formData.status === 'suspended'
                  ? 'border-rose-600 bg-rose-50/50 dark:bg-zinc-700 shadow-xs ring-2 ring-rose-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                formData.status === 'suspended' ? 'bg-rose-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600'
              }`}>
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                  إيقاف مؤقت (Paused / Suspended)
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  إخفاء السلعة من المتجر مؤقتاً لحين تجديد الكميات أو تعديل الأسعار.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Action Button Card */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
              تأكيد وحفظ بطاقة المنتج في الكتالوج
            </span>
            <span className="text-xs text-zinc-500">
              سيتم حفظ جميع الحقول وتحديث قواعد البيانات فوراً
            </span>
          </div>

          <button
            type="button"
            id="final-publish-action-btn"
            disabled={isSubmitting || (formData.status === 'active' && !canPublishLive)}
            onClick={() => onFinalSubmit(formData.status)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#800020] hover:bg-[#600018] text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ والنشر...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>
                  {formData.status === 'active' ? 'نشر المنتج الآن في السوق 🚀' : 'حفظ حالة المنتج'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
