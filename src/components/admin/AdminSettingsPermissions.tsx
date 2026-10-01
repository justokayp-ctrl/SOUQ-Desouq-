import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  Sliders, 
  Check, 
  X, 
  Zap, 
  Server, 
  KeyRound, 
  Eye, 
  RefreshCw,
  Power
} from 'lucide-react';
import { Role } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';

interface AdminSettingsPermissionsProps {
  currentUserRole: Role;
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminSettingsPermissions: React.FC<AdminSettingsPermissionsProps> = ({
  currentUserRole,
  onRequestConfirmation,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'circuit_breakers' | 'system'>('rbac');

  // Circuit Breakers State
  const [isEmergencyFreezeActive, setIsEmergencyFreezeActive] = useState(false);
  const [isMaintenanceModeActive, setIsMaintenanceModeActive] = useState(false);
  const [rateLimiterAggressiveness, setRateLimiterAggressiveness] = useState<'standard' | 'high' | 'strict'>('standard');

  // Toggle Emergency Checkout Freeze with Confirmation
  const handleToggleEmergencyFreeze = () => {
    const willEnable = !isEmergencyFreezeActive;
    onRequestConfirmation({
      isOpen: true,
      title: willEnable ? 'تفعيل قاطع الطوارئ: تجميد إتمام الطلبات' : 'إلغاء تجميد إتمام الطلبات',
      message: willEnable 
        ? 'تحذير: سيتم إيقاف معالجة سلات التسوق ومنع إنشاء أي طلبات جديدة فوراً على كامل المنصة لحين فك التجميد.'
        : 'سيتم إعادة السماح للعملاء بإتمام طلبات الشراء عبر جميع بوابات الدفع.',
      severity: willEnable ? 'critical' : 'warning',
      requiredRole: ['admin'],
      requiredTypingPhrase: willEnable ? 'تجميد' : undefined,
      impactItems: [
        'سيتم إظهار شريط تنبيه لجميع المستخدمين في سلة التسوق.',
        'لن تتأثر الشحنات الجاري توصيلها بالفعل لدى مندوبي دسوق إكسبريس.',
        'تسجيل الحدث فورياً في سجل التدقيق الأمني للرقابة الإدارية.'
      ],
      onConfirm: () => {
        setIsEmergencyFreezeActive(willEnable);
        showToast(willEnable ? 'تم تفعيل قاطع الطوارئ وتجميد إنشاء الطلبات' : 'تم استئناف استقبال الطلبات بنجاح');
      }
    });
  };

  // Toggle Maintenance Mode with Confirmation
  const handleToggleMaintenance = () => {
    const willEnable = !isMaintenanceModeActive;
    onRequestConfirmation({
      isOpen: true,
      title: willEnable ? 'تفعيل وضع الصيانة الشاملة' : 'إلغاء وضع الصيانة',
      message: willEnable 
        ? 'تحذير: سيتم حظر جميع المستخدمين غير المدراء وعرض صفحة الصيانة الدورية.'
        : 'سيتم فتح واجهة المتجر للمتسوقين والتجار.',
      severity: willEnable ? 'critical' : 'info',
      requiredRole: ['admin'],
      onConfirm: () => {
        setIsMaintenanceModeActive(willEnable);
        showToast(willEnable ? 'تم إدخال المنصة في وضع الصيانة' : 'تم إنهاء وضع الصيانة بنجاح');
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
              <ShieldCheck className="w-5 h-5 text-[#800020]" />
              <span>إعدادات الحوكمة والصلاحيات وقواطع النظام (Governance & Circuit Breakers)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              مصفوفة الصلاحيات (RBAC)، قواطع الطوارئ التشغيلية، ومحددات الأمان ومعدلات الاستخدام.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rbac' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
              }`}
            >
              مصفوفة الصلاحيات (RBAC)
            </button>
            <button
              onClick={() => setActiveTab('circuit_breakers')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'circuit_breakers' ? 'bg-[#800020] text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
              }`}
            >
              قواطع الطوارئ (Circuit Breakers)
            </button>
          </div>
        </div>

      </div>

      {/* SUB-VIEW 1: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 dark:border-zinc-800">
            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
              مصفوفة الصلاحيات وأدوار المستخدمين (Role-Based Access Control)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                  <th className="p-3.5">القدرة والوظيفة</th>
                  <th className="p-3.5 text-center">عميل (Customer)</th>
                  <th className="p-3.5 text-center">تاجر (Seller)</th>
                  <th className="p-3.5 text-center">دعم وتحكيم (Support)</th>
                  <th className="p-3.5 text-center">مدير نظام (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {[
                  { label: 'تصفح وشراء المنتجات وتتبع الشحنة', c: true, s: true, sup: true, a: true },
                  { label: 'إضافة منتجات وتعديل أسعار المتجر', c: false, s: true, sup: false, a: true },
                  { label: 'رفع وثائق التحقق التجاري (KYC)', c: false, s: true, sup: false, a: true },
                  { label: 'مراجعة واعتماد وثائق الـ KYC', c: false, s: false, sup: true, a: true },
                  { label: 'البت في النزاعات وإصدار أحكام التعويض', c: false, s: false, sup: true, a: true },
                  { label: 'تعديل نسب عمولات التجار', c: false, s: false, sup: false, a: true },
                  { label: 'اعتماد وصرف دفعات أرباح التجار', c: false, s: false, sup: false, a: true },
                  { label: 'إدارة المستخدمين وترقية الرتب', c: false, s: false, sup: false, a: true },
                  { label: 'تفعيل قواطع الطوارئ وإيقاف النظام', c: false, s: false, sup: false, a: true },
                  { label: 'الاطلاع على سجلات التدقيق الأمني (Audit)', c: false, s: false, sup: true, a: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/50">
                    <td className="p-3.5 font-bold text-stone-800 dark:text-zinc-200">{row.label}</td>
                    <td className="p-3.5 text-center">
                      {row.c ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-zinc-600 mx-auto" />}
                    </td>
                    <td className="p-3.5 text-center">
                      {row.s ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-zinc-600 mx-auto" />}
                    </td>
                    <td className="p-3.5 text-center">
                      {row.sup ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-stone-300 dark:text-zinc-600 mx-auto" />}
                    </td>
                    <td className="p-3.5 text-center">
                      {row.a ? <Check className="w-4 h-4 text-green-600 mx-auto font-black" /> : <X className="w-4 h-4 text-stone-300 dark:text-zinc-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CIRCUIT BREAKERS */}
      {activeTab === 'circuit_breakers' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Emergency Checkout Freeze Switch */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Power className={`w-5 h-5 ${isEmergencyFreezeActive ? 'text-red-700 animate-pulse' : 'text-stone-400'}`} />
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">قاطع إتمام الطلبات (Checkout Freeze)</h4>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    تجميد استقبال طلبات جديدة فوراً عند حدوث خلل لوجستي أو أمني مفاجئ.
                  </p>
                </div>
                <button
                  onClick={handleToggleEmergencyFreeze}
                  className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    isEmergencyFreezeActive 
                      ? 'bg-red-700 text-white shadow-md' 
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200'
                  }`}
                >
                  {isEmergencyFreezeActive ? 'التجميد نشط (إلغاء)' : 'تفعيل التجميد'}
                </button>
              </div>

              <div className={`p-3 rounded-2xl text-xs font-bold ${
                isEmergencyFreezeActive ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
              }`}>
                الحالة: {isEmergencyFreezeActive ? 'النظام مجمد ولا يقبل طلبات جديدة' : 'النظام يعمل بشكل طبيعي ومتاح للمتسوقين'}
              </div>
            </div>

            {/* Maintenance Mode Switch */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Server className={`w-5 h-5 ${isMaintenanceModeActive ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} />
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">وضع الصيانة الدورية (Maintenance Mode)</h4>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    حظر زيارات العملاء وعرض شاشة الصيانة وتحديث خوادم قاعدة البيانات.
                  </p>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    isMaintenanceModeActive 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200'
                  }`}
                >
                  {isMaintenanceModeActive ? 'الصيانة نشطة (إلغاء)' : 'تفعيل الصيانة'}
                </button>
              </div>

              <div className={`p-3 rounded-2xl text-xs font-bold ${
                isMaintenanceModeActive ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'
              }`}>
                الحالة: {isMaintenanceModeActive ? 'المنصة مغلقة في وضع الصيانة' : 'المنصة متاحة للجمهور بالكامل'}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
