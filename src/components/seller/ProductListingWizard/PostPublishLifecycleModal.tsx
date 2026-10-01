import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  Boxes, 
  ShoppingBag, 
  Truck, 
  DollarSign, 
  MessageSquare, 
  Sparkles, 
  BarChart3, 
  RefreshCw,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Product } from '../../../types';

interface PostPublishLifecycleModalProps {
  product: Product;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenProductPage: (product: Product) => void;
}

export const PostPublishLifecycleModal: React.FC<PostPublishLifecycleModalProps> = ({
  product,
  onClose,
  onNavigateToTab,
  onOpenProductPage
}) => {
  const lifecycleStages = [
    {
      step: 1,
      title: 'الـ Listing منشور ونشط',
      desc: 'تمت فهرسة المنتج بنجاح في محرك بحث سوق دسوق وهو متاح الآن للطلب.',
      icon: Package,
      actionLabel: 'معاينة في المتجر',
      action: () => onOpenProductPage(product),
      status: 'completed'
    },
    {
      step: 2,
      title: 'إدارة المخزون والتنبيهات',
      desc: `الكمية الحالية بالمخزن: ${product.stock} قطعة. سيصلك تنبيه فوري عند انخفاض الرصيد.`,
      icon: Boxes,
      actionLabel: 'تعديل المخزون',
      action: () => {
        onClose();
        onNavigateToTab('inventory');
      },
      status: 'active'
    },
    {
      step: 3,
      title: 'استقبال وتجهيز الطلبات',
      desc: 'عند قيام عميل بشراء هذا المنتج ستصلك إشعارات وتحديثات فورية في لوحة الطلبات.',
      icon: ShoppingBag,
      actionLabel: 'شاشة الطلبات',
      action: () => {
        onClose();
        onNavigateToTab('orders');
      },
      status: 'ready'
    },
    {
      step: 4,
      title: 'الشحن وخدمة التوصيل',
      desc: product.fulfillmentMethod === 'FBD' ? 'شحن فوري عبر شبكة دسوق إكسبريس (24 ساعة)' : 'شحن مباشر من مقر متجرك (FBM)',
      icon: Truck,
      status: 'ready'
    },
    {
      step: 5,
      title: 'تقييمات العملاء وخدمة ما بعد البيع',
      desc: 'متابعة آراء المشترين والرد على الاستفسارات لرفع تقييم متجرك وبناء الثقة.',
      icon: MessageSquare,
      actionLabel: 'التقييمات',
      action: () => {
        onClose();
        onNavigateToTab('analytics');
      },
      status: 'ready'
    },
    {
      step: 6,
      title: 'تحليلات الأداء والتحسين المستمر',
      desc: 'مراقبة عدد المشاهدات، نسبة الإضافة للسلة، ومعدل التحويل (Conversion Rate).',
      icon: BarChart3,
      actionLabel: 'لوحة التحليلات',
      action: () => {
        onClose();
        onNavigateToTab('analytics');
      },
      status: 'ready'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 text-right max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-100">
            تم إطلاق ونشر الـ Listing بنجاح في سوق دسوق!
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto">
            منتجك <strong className="text-[#800020] dark:text-amber-300">"{product.titleAr}"</strong> أصبح الآن جزءاً من الكتالوج المعتمد ومرئياً لآلاف المتسوقين.
          </p>
        </div>

        {/* Operational Lifecycle Stepper */}
        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              دورة التشغيل المستمرة للمنتج (Continuous Operational Lifecycle):
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              جاهز للتشغيل
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lifecycleStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-zinc-800 text-[#800020] dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {stage.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                        {stage.desc}
                      </div>
                    </div>
                  </div>

                  {stage.actionLabel && stage.action && (
                    <button
                      type="button"
                      onClick={stage.action}
                      className="text-[11px] font-bold text-[#800020] dark:text-amber-400 hover:underline flex items-center gap-1 self-end pt-1"
                    >
                      <span>{stage.actionLabel}</span>
                      <span>←</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenProductPage(product)}
            className="flex-1 py-3 px-4 bg-[#800020] hover:bg-[#660018] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>عرض صفحة المنتج في المتجر</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all"
          >
            إغلاق والعودة لإدارة المنتجات
          </button>
        </div>
      </div>
    </div>
  );
};
