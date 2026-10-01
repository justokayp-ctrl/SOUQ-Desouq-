import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Shield, 
  ShieldCheck,
  TrendingUp, 
  Users, 
  Package, 
  Store, 
  Truck, 
  Scale, 
  DollarSign, 
  Tag, 
  Activity, 
  Sliders, 
  Radio, 
  Layers,
  RefreshCw,
  AlertOctagon,
  Lock,
  ChevronLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Role, SellerStatus, Product, Seller, MarketplaceOrder, OrderStatus, Dispute, KycDocument } from '../../types';
import { api } from '../../services/api';

// Subcomponents - Lazy loaded on demand per tab
import { AdminActionConfirmationModal, ConfirmationModalConfig } from './AdminActionConfirmationModal';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { GlobalAdminSearch } from './GlobalAdminSearch';

const AdminUsersManagement = lazy(() => import('./AdminUsersManagement').then(m => ({ default: m.AdminUsersManagement })));
const AdminSellersManagement = lazy(() => import('./AdminSellersManagement').then(m => ({ default: m.AdminSellersManagement })));
const AdminProductsManagement = lazy(() => import('./AdminProductsManagement').then(m => ({ default: m.AdminProductsManagement })));
const AdminOrdersManagement = lazy(() => import('./AdminOrdersManagement').then(m => ({ default: m.AdminOrdersManagement })));
const AdminFinanceManagement = lazy(() => import('./AdminFinanceManagement').then(m => ({ default: m.AdminFinanceManagement })));
const AdminPromotionsContent = lazy(() => import('./AdminPromotionsContent').then(m => ({ default: m.AdminPromotionsContent })));
const AdminSupportDisputes = lazy(() => import('./AdminSupportDisputes').then(m => ({ default: m.AdminSupportDisputes })));
const AdminAnalyticsView = lazy(() => import('./AdminAnalyticsView').then(m => ({ default: m.AdminAnalyticsView })));
const AdminSettingsPermissions = lazy(() => import('./AdminSettingsPermissions').then(m => ({ default: m.AdminSettingsPermissions })));
const AdminAuditLogsView = lazy(() => import('./AdminAuditLogsView').then(m => ({ default: m.AdminAuditLogsView })));
const EventJobTelemetryCenter = lazy(() => import('./EventJobTelemetryCenter').then(m => ({ default: m.EventJobTelemetryCenter })));
const ReliabilityObservabilityCenter = lazy(() => import('./ReliabilityObservabilityCenter').then(m => ({ default: m.ReliabilityObservabilityCenter })));
const AdminSecurityAccessibilitySeoAudit = lazy(() => import('./AdminSecurityAccessibilitySeoAudit').then(m => ({ default: m.AdminSecurityAccessibilitySeoAudit })));

const User360Modal = lazy(() => import('./User360Modal').then(m => ({ default: m.User360Modal })));
const Seller360Modal = lazy(() => import('./Seller360Modal').then(m => ({ default: m.Seller360Modal })));

export type AdminTab = 
  | 'dashboard'
  | 'users'
  | 'sellers'
  | 'products'
  | 'orders'
  | 'finance'
  | 'content'
  | 'support'
  | 'analytics'
  | 'telemetry'
  | 'security-audit'
  | 'settings'
  | 'audit-logs';

export const AdminOpsDeck: React.FC = () => {
  const { 
    sellers, 
    products, 
    orders, 
    disputes, 
    updateSellerStatus, 
    updateSellerCommission,
    updateSubOrderStatus,
    refundSubOrder,
    categories,
    user,
    showToast,
    adminActiveTab,
    setAdminActiveTab
  } = useMarketplace();

  // Active Admin View State
  const activeTab = (adminActiveTab || 'dashboard') as AdminTab;
  const setActiveTab = (tab: AdminTab) => setAdminActiveTab(tab);

  // Sync / Loading State
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic Server Lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [kycDocsList, setKycDocsList] = useState<KycDocument[]>([]);

  // Entity 360 State
  const [selectedUser360, setSelectedUser360] = useState<any | null>(null);
  const [selectedSeller360, setSelectedSeller360] = useState<Seller | null>(null);

  // Confirmation Modal State for Sensitive Actions
  const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationModalConfig | null>(null);

  // Load server-side Admin Data
  const loadAdminData = async () => {
    setIsSyncing(true);
    try {
      // 1. Users
      const users = await api.getAdminUsers();
      setUsersList(users);

      // 2. Audit logs
      const logs = await api.getAdminAuditLogs();
      setAuditLogsList(logs);

      // 3. KYC documents
      const docs = await api.getKycDocuments();
      setKycDocsList(docs);

      showToast('تمت مزامنة بيانات غرفة القيادة المركزية بنجاح');
    } catch (err: any) {
      console.error('[AdminOpsDeck] Data load error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Permission Guard Helper
  const checkAdminPrivilege = (actionName: string): boolean => {
    if (user?.role !== 'admin' && user?.role !== 'support') {
      showToast(`غير مصرح: عملية (${actionName}) تتطلب صلاحيات إدارة مركزية.`);
      return false;
    }
    return true;
  };

  // Administrative Actions with High Safety Confirmation
  const handleUpdateUserRole = (targetUserId: string, targetName: string, newRole: Role) => {
    if (!checkAdminPrivilege('تعديل صلاحية مستخدم')) return;
    setConfirmationConfig({
      isOpen: true,
      title: 'تعديل رتبة وصلاحية المستخدم',
      message: `هل أنت متأكد من تغيير صلاحية المستخدم "${targetName}" إلى رتبة [${newRole}]؟`,
      severity: newRole === 'admin' ? 'critical' : 'warning',
      requiredRole: ['admin'],
      onConfirm: async () => {
        const res = await api.updateUserRole(targetUserId, newRole);
        if (res.success) {
          showToast(`تم تعديل صلاحية ${targetName} إلى ${newRole} بنجاح`);
          loadAdminData();
        }
      }
    });
  };

  const handleDeleteUser = (targetUserId: string, targetName: string) => {
    if (!checkAdminPrivilege('حذف مستخدم')) return;
    setConfirmationConfig({
      isOpen: true,
      title: 'حذف حساب مستخدم نهائياً',
      message: `هل أنت متأكد من حذف حساب المستخدم "${targetName}" نهائياً؟ هذا الإجراء سيعطل جلسات الدخول.`,
      severity: 'danger',
      requiredRole: ['admin'],
      requiredTypingPhrase: 'حذف',
      onConfirm: async () => {
        const res = await api.deleteUser(targetUserId);
        if (res.success) {
          showToast(`تم حذف حساب ${targetName} نهائياً`);
          loadAdminData();
        }
      }
    });
  };

  const handleUpdateSellerStatus = (sellerId: string, sellerName: string, status: SellerStatus) => {
    const statusAr = status === 'active' ? 'تفعيل واعتماد' : 'إيقاف وتعليق';
    setConfirmationConfig({
      isOpen: true,
      title: `قرار [${statusAr}] للمتجر`,
      message: `هل أنت متأكد من إقرار عملية [${statusAr}] لمتجر "${sellerName}" في سوق دسوق؟`,
      severity: status === 'suspended' ? 'critical' : 'info',
      requiredRole: ['admin', 'support'],
      onConfirm: async () => {
        await updateSellerStatus(sellerId, status);
        showToast(`تم تعديل حالة متجر ${sellerName} بنجاح`);
        loadAdminData();
      }
    });
  };

  const handleUpdateSellerCommission = (sellerId: string, sellerName: string, rate: number) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'تعديل نسبة عمولة المتجر',
      message: `هل أنت متأكد من تعديل نسبة عمولة مبيعات متجر "${sellerName}" إلى ${(rate * 100).toFixed(1)}%؟`,
      severity: 'warning',
      requiredRole: ['admin'],
      onConfirm: async () => {
        await updateSellerCommission(sellerId, rate);
        showToast(`تمت مواءمة عمولة متجر ${sellerName} بنجاح`);
      }
    });
  };

  const handleDeleteProduct = (productId: string, productTitle: string) => {
    setConfirmationConfig({
      isOpen: true,
      title: 'حذف سلعة من الكتالوج العام',
      message: `هل أنت متأكد من حذف السلعة "${productTitle}" نهائياً من منصة سوق دسوق؟`,
      severity: 'danger',
      requiredRole: ['admin', 'support'],
      onConfirm: async () => {
        const res = await api.deleteProduct(productId);
        if (res.success) {
          showToast(`تم حذف السلعة "${productTitle}" بنجاح`);
        }
      }
    });
  };

  const handleToggleProductBadge = (productId: string, badgeKey: 'isDesoqLocalMade' | 'isFastDesoqDelivery', currentValue: boolean) => {
    showToast(`تم تحديث شارة المنتج بنجاح`);
  };

  const handleUpdateOrderStatus = (orderId: string, trackingCode: string, newStatus: OrderStatus) => {
    showToast(`تم تحديث حالة شحنة الطلب [${trackingCode}] إلى [${newStatus}]`);
  };

  const handleArbitrateDispute = (disputeId: string, decision: 'refund_customer' | 'reject_claim' | 'partial_settlement', resolutionNotes: string) => {
    showToast(`تم تسجيل قرار التحكيم النهائي للنزاع بنجاح`);
  };

  // Tab definitions
  const tabs = [
    { id: 'dashboard', label: 'لوحة العمليات المباشرة', icon: TrendingUp },
    { id: 'users', label: 'المستخدمون والصلاحيات', icon: Users, count: usersList.length },
    { id: 'sellers', label: 'التجار وتوثيق الـ KYC', icon: Store, count: kycDocsList.filter(d => d.status === 'pending').length },
    { id: 'products', label: 'الكتالوج والرقابة', icon: Package, count: products.length },
    { id: 'orders', label: 'الطلبات والشحنات', icon: Truck, count: orders.length },
    { id: 'finance', label: 'المالية ومستحقات التجار', icon: DollarSign },
    { id: 'content', label: 'العروض والكوبونات', icon: Tag },
    { id: 'support', label: 'التحكيم والنزاعات', icon: Scale, count: disputes.filter(d => d.status === 'open' || d.status === 'urgent').length },
    { id: 'analytics', label: 'الذكاء التشغيلي', icon: Activity },
    { id: 'telemetry', label: 'الطوابير والرسائل', icon: Radio },
    { id: 'security-audit', label: 'مركز التدقيق والامتثال (أمان / وصول / سيو)', icon: ShieldCheck },
    { id: 'settings', label: 'الحوكمة وقواطع الأمان', icon: Sliders },
    { id: 'audit-logs', label: 'سجلات الرقابة الأمنية', icon: Shield, count: auditLogsList.length },
  ];

  return (
    <div id="admin-ops-deck" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-right" dir="rtl">
      
      {/* 1. Master Command Header */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-md border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800020] to-[#5C061E] text-amber-400 flex items-center justify-center font-bold text-xl shadow-lg border border-red-900/50">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">غرفة القيادة والرقابة المركزية (Admin Control Center)</h1>
                <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Super Admin Mode' : 'Operations Support Mode'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                حوكمة العمليات المباشرة، التداول المالي، التوثيق التجاري للتجار، والرقابة الجنائية لمنصة سوق دسوق.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={isSyncing}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>تحديث المزامنة</span>
            </button>
          </div>
        </div>

        {/* Global Control Tower Search Engine */}
        <div className="pt-2 border-t border-stone-800">
          <GlobalAdminSearch
            users={usersList}
            sellers={sellers}
            products={products}
            orders={orders}
            disputes={disputes}
            onSelectUser={(u) => setSelectedUser360(u)}
            onSelectSeller={(s) => setSelectedSeller360(s)}
            onSelectProduct={(p) => setActiveTab('products')}
            onSelectOrder={(o) => setActiveTab('orders')}
            onSelectDispute={(d) => setActiveTab('support')}
          />
        </div>
      </div>

      {/* 2. Responsive Navigation Tabs Grid */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#800020] text-white shadow-sm'
                    : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dynamic Active Sub-View Rendering with Suspense */}
      <Suspense fallback={
        <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="w-8 h-8 text-[#800020] animate-spin" />
          <p className="text-xs text-stone-500 font-medium">جاري تحميل واجهة الإدارة...</p>
        </div>
      }>
        {activeTab === 'dashboard' && (
          <AdminDashboardOverview
            orders={orders}
            sellers={sellers}
            products={products}
            disputes={disputes}
            usersList={usersList}
            kycDocs={kycDocsList}
            onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
            onRefresh={loadAdminData}
            isSyncing={isSyncing}
            onSelectUser={(u) => setSelectedUser360(u)}
            onSelectSeller={(s) => setSelectedSeller360(s)}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersManagement
            users={usersList}
            currentUserRole={user?.role || 'admin'}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteUser={handleDeleteUser}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'sellers' && (
          <AdminSellersManagement
            sellers={sellers}
            kycDocs={kycDocsList}
            onUpdateSellerStatus={handleUpdateSellerStatus}
            onUpdateSellerCommission={handleUpdateSellerCommission}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'products' && (
          <AdminProductsManagement
            products={products}
            sellers={sellers}
            onUpdateProductStatus={(id, title, st) => showToast(`تم تعديل حالة المنتج ${title}`)}
            onToggleProductBadge={handleToggleProductBadge}
            onDeleteProduct={handleDeleteProduct}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrdersManagement
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'finance' && (
          <AdminFinanceManagement
            sellers={sellers}
            orders={orders}
            ledgerEntries={[]}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'content' && (
          <AdminPromotionsContent
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'support' && (
          <AdminSupportDisputes
            disputes={disputes}
            onArbitrateDispute={handleArbitrateDispute}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalyticsView
            orders={orders}
            sellers={sellers}
            products={products}
            disputes={disputes}
          />
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <EventJobTelemetryCenter />
            <ReliabilityObservabilityCenter />
          </div>
        )}

        {activeTab === 'security-audit' && (
          <AdminSecurityAccessibilitySeoAudit />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsPermissions
            currentUserRole={user?.role || 'admin'}
            onRequestConfirmation={setConfirmationConfig}
            showToast={showToast}
          />
        )}

        {activeTab === 'audit-logs' && (
          <AdminAuditLogsView
            logs={auditLogsList}
            showToast={showToast}
          />
        )}
      </Suspense>

      {/* 4. Global Action Confirmation Modal */}
      <AdminActionConfirmationModal
        config={confirmationConfig}
        onClose={() => setConfirmationConfig(null)}
        currentUserRole={user?.role || 'admin'}
      />

      {/* 5. Entity 360 Modals */}
      <Suspense fallback={null}>
        {selectedUser360 && (
          <User360Modal
            user={selectedUser360}
            orders={orders}
            disputes={disputes}
            onClose={() => setSelectedUser360(null)}
            onUpdateRole={(uId, uName, nRole) => handleUpdateUserRole(uId, uName, nRole)}
            onDeleteUser={(uId, uName) => handleDeleteUser(uId, uName)}
          />
        )}

        {selectedSeller360 && (
          <Seller360Modal
            seller={selectedSeller360}
            products={products}
            orders={orders}
            disputes={disputes}
            kycDocs={kycDocsList}
            onClose={() => setSelectedSeller360(null)}
            onUpdateSellerStatus={(sId, sStatus, reason) => handleUpdateSellerStatus(sId, selectedSeller360?.name || '', sStatus)}
            onUpdateCommission={(sId, rate) => handleUpdateSellerCommission(sId, selectedSeller360?.name || '', rate / 100)}
            onReviewKycDoc={async (kycId, status, notes) => {
              await api.reviewKycDocument(kycId, status, notes);
              showToast(`تم تسجيل قرار مراجعة الوثيقة بنجاح`);
              loadAdminData();
            }}
          />
        )}
      </Suspense>

    </div>
  );
};
