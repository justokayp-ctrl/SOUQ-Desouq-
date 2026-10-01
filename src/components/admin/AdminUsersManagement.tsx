import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  MoreVertical, 
  Check, 
  X, 
  Shield, 
  Key, 
  Eye,
  Trash2,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { Role, AuthUser } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';

interface AdminUsersManagementProps {
  users: any[];
  currentUserRole: Role;
  onUpdateUserRole: (userId: string, targetName: string, newRole: Role) => void;
  onDeleteUser: (userId: string, targetName: string) => void;
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminUsersManagement: React.FC<AdminUsersManagementProps> = ({
  users,
  currentUserRole,
  onUpdateUserRole,
  onDeleteUser,
  onRequestConfirmation,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'fullName' | 'createdAt' | 'role'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // User Inspector Drawer/Modal
  const [inspectingUser, setInspectingUser] = useState<any | null>(null);

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = 
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.phone || '').includes(term) ||
        (u.id || '').toLowerCase().includes(term);

      const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

      return matchSearch && matchRole;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchTerm, selectedRoleFilter, sortField, sortOrder]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['المعرف', 'الاسم الكامل', 'البريد الإلكتروني', 'رقم الهاتف', 'الرتبة', 'تاريخ التسجيل'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.fullName}"`,
      u.email,
      u.phone,
      u.role,
      new Date(u.createdAt || Date.now()).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `souq-desoq-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف بيانات المستخدمين بنجاح بصيغة CSV');
  };

  // Bulk Role Changer
  const handleBulkRoleChange = (newRole: Role) => {
    if (selectedUserIds.length === 0) return;
    onRequestConfirmation({
      isOpen: true,
      title: 'تعديل صلاحيات جماعي للمستخدمين',
      message: `هل أنت متأكد من تغيير رتبة (${selectedUserIds.length}) مستخدمين محددين إلى [${newRole}]؟`,
      severity: 'warning',
      requiredRole: ['admin'],
      onConfirm: async () => {
        for (const id of selectedUserIds) {
          const user = users.find(u => u.id === id);
          if (user) {
            onUpdateUserRole(id, user.fullName, newRole);
          }
        }
        setSelectedUserIds([]);
        showToast(`تم تحديث رتب (${selectedUserIds.length}) مستخدمين بنجاح`);
      }
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header & Quick Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#800020]" />
              <span>إدارة حسابات ومستخدمي المنصة (User Management)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              إجمالي {users.length} مستخدم مسجل. تحكم في الرتب، تراخيص الدخول، والتدقيق الأمني.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          
          {/* Universal Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRoleFilter}
              onChange={(e) => { setSelectedRoleFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع الرتب (All Roles)</option>
              <option value="customer">عميل ومشتري (Customer)</option>
              <option value="seller">تاجر معتمد (Seller)</option>
              <option value="support">مسؤول دعم وتحكيم (Support)</option>
              <option value="admin">مدير نظام عليا (Admin)</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="sm:col-span-3 flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="createdAt">تاريخ الانضمام</option>
              <option value="fullName">الاسم الأبجدي</option>
              <option value="role">الرتبة والصلاحية</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-200 cursor-pointer"
              title="عكس اتجاه الترتيب"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* 2. Bulk Actions Ribbon (Appears when items are selected) */}
      {selectedUserIds.length > 0 && (
        <div className="bg-[#800020] text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{selectedUserIds.length}</span>
            <span>مستخدمين محددين حالياً</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] text-stone-200">تطبيق إجراء جماعي:</span>
            <button
              onClick={() => handleBulkRoleChange('customer')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[11px] font-bold cursor-pointer"
            >
              تعيين كـ عميل
            </button>
            <button
              onClick={() => handleBulkRoleChange('seller')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[11px] font-bold cursor-pointer"
            >
              تعيين كـ تاجر
            </button>
            <button
              onClick={() => handleBulkRoleChange('support')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[11px] font-bold cursor-pointer"
            >
              ترقية لـ دعم فني
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="px-2.5 py-1 text-stone-300 hover:text-white underline text-[11px] cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Powerful Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                <th className="p-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && selectedUserIds.length === paginatedUsers.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                  />
                </th>
                <th className="p-3.5">الاسم والمستخدم</th>
                <th className="p-3.5">الاتصال والبريد</th>
                <th className="p-3.5">الرتبة الحالية</th>
                <th className="p-3.5">المتجر المقترن</th>
                <th className="p-3.5 text-center">إجراءات الحوكمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    لا يوجد مستخدمين يطابقون معايير البحث الحالية
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-stone-50/70 dark:hover:bg-zinc-800/50 transition-colors ${
                        isSelected ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                        />
                      </td>

                      {/* Name & ID */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {u.role === 'admin' && (
                              <span title="مدير نظام"><Shield className="w-3.5 h-3.5 text-red-700" /></span>
                            )}
                          </p>
                          <p className="font-mono text-[10px] text-stone-400">{u.id}</p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="text-stone-600 dark:text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{u.email}</span>
                          </p>
                          <p className="text-stone-400 font-mono text-[10px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{u.phone}</span>
                          </p>
                        </div>
                      </td>

                      {/* Role Badge & Quick Change */}
                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateUserRole(u.id, u.fullName, e.target.value as Role)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer outline-none ${
                            u.role === 'admin' 
                              ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900' 
                              : u.role === 'support' 
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300' 
                              : u.role === 'seller' 
                              ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300' 
                              : 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          <option value="customer">عميل (Customer)</option>
                          <option value="seller">تاجر (Seller)</option>
                          <option value="support">دعم فني (Support)</option>
                          <option value="admin">مدير نظام (Admin)</option>
                        </select>
                      </td>

                      {/* Seller Association */}
                      <td className="p-3.5">
                        {u.sellerId ? (
                          <span className="font-mono text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200/60 font-bold">
                            {u.sellerId}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setInspectingUser(u)}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 transition-all cursor-pointer"
                            title="فحص ملف المستخدم بالكامل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteUser(u.id, u.fullName)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 transition-all cursor-pointer"
                            title="حذف الحساب نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows count */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-800/80 border-t border-stone-200/80 dark:border-zinc-700/80 flex items-center justify-between flex-wrap gap-4 text-xs font-bold text-stone-600 dark:text-zinc-300">
          <div className="flex items-center gap-3">
            <span>عرض</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>من أصل {filteredUsers.length} مستخدم</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3">صفحة {currentPage} من {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. User 360 Inspector Drawer / Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-4 text-right animate-in fade-in">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  ملف المستخدم الشامل (User 360)
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">ID: {inspectingUser.id}</span>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-stone-100 dark:divide-zinc-800">
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">الاسم الكامل:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingUser.fullName}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">البريد الإلكتروني:</span>
                <strong className="font-mono text-stone-900 dark:text-white">{inspectingUser.email}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">رقم الهاتف:</span>
                <strong className="font-mono text-stone-900 dark:text-white">{inspectingUser.phone}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">الصلاحية:</span>
                <span className="font-bold text-[#800020] uppercase">{inspectingUser.role}</span>
              </div>
              {inspectingUser.sellerId && (
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">المتجر التابع:</span>
                  <strong className="font-mono text-amber-700">{inspectingUser.sellerId}</strong>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setInspectingUser(null)}
                className="px-5 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full font-bold text-xs"
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
