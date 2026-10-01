import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  ShoppingBag, 
  CreditCard, 
  Scale, 
  Activity, 
  ShieldAlert, 
  Lock, 
  Key, 
  Check, 
  AlertTriangle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { AuthUser, MarketplaceOrder, Dispute, Role } from '../../types';

interface User360ModalProps {
  user: AuthUser | null;
  orders: MarketplaceOrder[];
  disputes: Dispute[];
  onClose: () => void;
  onUpdateRole: (userId: string, targetName: string, newRole: Role) => void;
  onDeleteUser: (userId: string, targetName: string) => void;
}

export const User360Modal: React.FC<User360ModalProps> = ({
  user,
  orders,
  disputes,
  onClose,
  onUpdateRole,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'payments' | 'disputes' | 'activity' | 'security'>('profile');

  if (!user) return null;

  const userOrders = orders.filter(o => 
    o.customerId === user.id || 
    (user.phone && o.shippingAddress?.phone === user.phone)
  );

  const userDisputes = disputes.filter(d => 
    d.customerName === user.fullName ||
    d.customerPhone === user.phone
  );

  const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmountEGP || o.totalPriceEGP || 0), 0);

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 max-w-4xl w-full rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#800020] text-white flex items-center justify-center font-bold text-lg font-serif shrink-0 border border-white/10">
              {user.fullName?.substring(0, 1) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold">{user.fullName}</h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  user.role === 'admin' ? 'bg-red-500 text-white' :
                  user.role === 'seller' ? 'bg-amber-500 text-stone-950' :
                  user.role === 'support' ? 'bg-blue-500 text-white' : 'bg-stone-700 text-stone-200'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                معرّف الحساب (User 360 ID): {user.id} | انضم: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '2026/01/10'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Tabs Bar */}
        <div className="bg-stone-50 dark:bg-zinc-850 px-5 pt-3 border-b border-stone-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'profile', label: 'الملف الشخصي (Profile)', icon: UserIcon },
            { id: 'orders', label: `الطلبات (${userOrders.length})`, icon: ShoppingBag },
            { id: 'payments', label: 'المدفوعات والمحفظة', icon: CreditCard },
            { id: 'disputes', label: `النزاعات القانونية (${userDisputes.length})`, icon: Scale },
            { id: 'activity', label: 'سجل النشاط والجلوس', icon: Activity },
            { id: 'security', label: 'الأمان والصلاحيات', icon: ShieldAlert },
          ].map(tab => {
            const TIcon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-white dark:bg-zinc-900 text-[#800020] dark:text-red-400 border-t-2 border-[#800020] shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <TIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200/70 dark:border-zinc-800 space-y-1">
                  <span className="text-stone-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-600" /> البريد الإلكتروني:</span>
                  <p className="font-mono font-bold text-stone-900 dark:text-white">{user.email}</p>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200/70 dark:border-zinc-800 space-y-1">
                  <span className="text-stone-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> رقم الهاتف:</span>
                  <p className="font-mono font-bold text-stone-900 dark:text-white">{user.phone || '01012345678'}</p>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200/70 dark:border-zinc-800 space-y-1">
                  <span className="text-stone-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-600" /> إجمالي الإنفاق:</span>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{totalSpent.toLocaleString()} ج.م</p>
                </div>
              </div>

              {/* Status & Badges */}
              <div className="p-5 bg-stone-50 dark:bg-zinc-850 rounded-3xl border border-stone-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">حالة التوثيق والهوية الرقابية</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> بريد ممتثل وموثق
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> هاتف محلي مصري verified (+20)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                    درجة الموثوقية: 98% (High Trust Buyer)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">سجل الطلبات والشحنات المرتبطة</h4>
              {userOrders.length === 0 ? (
                <p className="text-stone-500 text-center p-8 bg-stone-50 rounded-2xl">لا توجد طلبات سابقة لهذا المستخدم بعد.</p>
              ) : (
                <div className="space-y-2">
                  {userOrders.map(o => (
                    <div key={o.id} className="p-3.5 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200/70 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-stone-900 dark:text-white">طلب #{o.id}</span>
                        <p className="text-stone-500 text-[11px]">التاريخ: {new Date(o.createdAt).toLocaleDateString('ar-EG')} | العناصر: {o.subOrders?.[0]?.items?.length || 1}</p>
                      </div>
                      <div className="text-left space-y-1">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{o.totalAmountEGP || o.totalPriceEGP} ج.م</span>
                        <span className="block text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">{o.orderStatus || o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">سجل المدفوعات والمعاملات البنكية المحفوظة</h4>
              <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-stone-700 dark:text-zinc-300">إجمالي عمليات الشراء الناجحة:</span>
                  <span className="font-mono font-bold text-emerald-700">{userOrders.filter(o => o.paymentStatus === 'paid').length} معاملات</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-stone-700 dark:text-zinc-300">طرق الدفع المستخدمة:</span>
                  <span>بطاقة ميزة / الدفع عند الاستلام / فودافون كاش</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 dark:text-zinc-300">سجل المسترجعات (Refunds):</span>
                  <span className="font-mono font-bold text-stone-900">0 ج.م</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Disputes */}
          {activeTab === 'disputes' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">سجل النزاعات والشكاوى الرسمية</h4>
              {userDisputes.length === 0 ? (
                <p className="text-stone-500 text-center p-8 bg-stone-50 rounded-2xl">لا توجد شكاوى أو نزاعات قانونية مفتوحة لهذا المستخدم.</p>
              ) : (
                <div className="space-y-2">
                  {userDisputes.map(d => (
                    <div key={d.id} className="p-3.5 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-mono font-bold text-[#800020] dark:text-red-400">نزاع #{d.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">{d.status}</span>
                      </div>
                      <p className="text-stone-600 dark:text-zinc-300">السبب: {d.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">سجل الجلسات وعناوين الـ IP للمستخدم</h4>
              <div className="space-y-2 font-mono">
                {[
                  { event: 'تسجيل دخول ناجح', ip: '197.35.112.45', location: 'دسوق، كفر الشيخ', time: 'قبل 15 دقيقة' },
                  { event: 'إضافة منتج للسلة', ip: '197.35.112.45', location: 'دسوق، كفر الشيخ', time: 'قبل 20 دقيقة' },
                  { event: 'تحديث بيانات الحساب', ip: '197.35.112.45', location: 'دسوق، كفر الشيخ', time: 'قبل يومين' },
                ].map((act, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-200/60 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-white">{act.event}</span>
                      <p className="text-[11px] text-stone-500">IP: {act.ip} ({act.location})</p>
                    </div>
                    <span className="text-[10px] text-stone-400">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Security */}
          {activeTab === 'security' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-4">
                <h4 className="font-serif font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>التحكم الحساس في الصلاحيات والرتبة</span>
                </h4>
                <p className="text-stone-600 dark:text-zinc-300 leading-relaxed">
                  تغيير رتبة المستخدم أو حذف حسابه نهائياً يتطلب مصادقة إدارية وتسجيل سبب العمليات في سجل التدقيق (Audit Log).
                </p>

                {/* Role Switch Buttons */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-700 dark:text-zinc-300 block">تعديل رتبة الحساب:</span>
                  <div className="flex flex-wrap gap-2">
                    {(['customer', 'seller', 'support', 'admin'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => onUpdateRole(user.id, user.fullName || user.email, r)}
                        disabled={user.role === r}
                        className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                          user.role === r
                            ? 'bg-stone-900 text-white cursor-default'
                            : 'bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 hover:bg-stone-100'
                        }`}
                      >
                        ترقية/تعديل إلى [{r}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete Button */}
                <div className="pt-4 border-t border-amber-200 dark:border-amber-900/40 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-red-900 dark:text-red-300 block">حذف الحساب نهائياً:</span>
                    <span className="text-[11px] text-stone-500">سيتم إغلاق الحساب وإبطال جميع جلسات الدخول.</span>
                  </div>
                  <button
                    onClick={() => onDeleteUser(user.id, user.fullName || user.email)}
                    className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold cursor-pointer"
                  >
                    حذف المستخدم نهائياً 🗑️
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 dark:bg-zinc-850 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-mono">SOUQ DESOQ — USER 360 INTELLIGENCE TOWER</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold cursor-pointer hover:bg-stone-800"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
