import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  Percent, 
  Check, 
  X, 
  Edit3, 
  Phone, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  DollarSign, 
  ExternalLink,
  Eye,
  Building2,
  Lock,
  Plus,
  CheckCircle2,
  BadgeCheck
} from 'lucide-react';
import { Seller, SellerStatus, KycDocument } from '../../types';
import { KycReviewCenter } from './KycReviewCenter';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';
import { useMarketplace } from '../../context/MarketplaceContext';

interface AdminSellersManagementProps {
  sellers: Seller[];
  kycDocs: KycDocument[];
  onUpdateSellerStatus: (sellerId: string, sellerName: string, status: SellerStatus) => void;
  onUpdateSellerCommission: (sellerId: string, sellerName: string, rate: number) => void;
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminSellersManagement: React.FC<AdminSellersManagementProps> = ({
  sellers,
  kycDocs,
  onUpdateSellerStatus,
  onUpdateSellerCommission,
  onRequestConfirmation,
  showToast,
}) => {
  const { createSeller, verifySeller, openSellerProfile } = useMarketplace();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'kyc_vault'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  
  // Commission inline editor state
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [commissionRateDraft, setCommissionRateDraft] = useState<number>(0.10);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk selection
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);

  // Detailed Seller Dossier Drawer
  const [inspectingSeller, setInspectingSeller] = useState<Seller | null>(null);

  // Add Seller Modal State
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDistrict, setNewDistrict] = useState('شارع الجيش');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState('men_fashion');
  const [newTaxNumber, setNewTaxNumber] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState(10);
  const [newDescription, setNewDescription] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300');
  const [newCoverUrl, setNewCoverUrl] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200');

  // Filtering
  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = 
        (s.name || '').toLowerCase().includes(term) ||
        (s.ownerName || '').toLowerCase().includes(term) ||
        (s.taxRegistrationNumber || '').includes(term) ||
        (s.id || '').toLowerCase().includes(term);

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchDistrict = districtFilter === 'all' || s.desoqDistrict === districtFilter;

      return matchSearch && matchStatus && matchDistrict;
    });
  }, [sellers, searchTerm, statusFilter, districtFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / pageSize) || 1;
  const paginatedSellers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSellers.slice(start, start + pageSize);
  }, [filteredSellers, currentPage, pageSize]);

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSellerIds(paginatedSellers.map(s => s.id));
    } else {
      setSelectedSellerIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedSellerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: SellerStatus) => {
    onRequestConfirmation({
      isOpen: true,
      title: 'تعديل جماعي لحالة التجار',
      message: `هل أنت متأكد من تغيير حالة ${selectedSellerIds.length} متجراً إلى (${status === 'active' ? 'نشط ومعتمد' : 'موقوف'})؟`,
      severity: status === 'suspended' ? 'danger' : 'info',
      requiredRole: ['admin'],
      onConfirm: () => {
        selectedSellerIds.forEach(id => {
          const s = sellers.find(item => item.id === id);
          if (s) onUpdateSellerStatus(id, s.name, status);
        });
        setSelectedSellerIds([]);
        showToast(`تم تحديث حالة ${selectedSellerIds.length} متجراً بنجاح`);
      }
    });
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Owner,Phone,District,CommissionRate,Status\n';
    const rows = filteredSellers.map(s => 
      `"${s.id}","${s.name}","${s.ownerName}","${s.phone}","${s.desoqDistrict || s.city}","${s.commissionRate}","${s.status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `desoq_sellers_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNewSeller = async () => {
    if (!newStoreName.trim() || !newOwnerName.trim() || !newPhone.trim()) {
      showToast('يرجى ملء اسم المتجر، اسم المالك، ورقم الهاتف');
      return;
    }

    try {
      await createSeller({
        name: newStoreName.trim(),
        ownerName: newOwnerName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || `${newStoreName.trim().toLowerCase().replace(/\s+/g, '')}@desoq.market`,
        desoqDistrict: newDistrict,
        city: 'دسوق',
        governorate: 'كفر الشيخ',
        detailedAddress: newAddress.trim() || `شارع ${newDistrict}، دسوق`,
        taxRegistrationNumber: newTaxNumber.trim() || `TX-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        commissionRate: Number(newCommissionRate) / 100,
        description: newDescription.trim() || 'متجر تجاري معتمد ومرخص على منصة سوق دسوق',
        logoUrl: newLogoUrl,
        bannerUrl: newCoverUrl,
        isVerified: true,
        verificationStatus: 'verified',
        status: 'active'
      });

      setIsAddSellerModalOpen(false);
      setNewStoreName('');
      setNewOwnerName('');
      setNewPhone('');
      setNewEmail('');
      setNewAddress('');
      setNewTaxNumber('');
      setNewDescription('');
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء المتجر');
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar with Sub-Tabs & Add Seller Button */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-[#800020]" />
              <span>إدارة التجار وتوثيق الهوية التجارية (Sellers & KYC Management)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              حوكمة {sellers.length} متجراً مسجلاً في دسوق وضبط العمولات وتوثيق المتاجر المعتمدة.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddSellerModalOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#D4AF37] hover:bg-[#b89628] text-[#800020] shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ إضافة متجر معتمد جديد</span>
            </button>
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'directory' 
                  ? 'bg-[#800020] text-white shadow-sm' 
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
              }`}
            >
              دليل المتاجر والعمولات
            </button>
            <button
              onClick={() => setActiveSubTab('kyc_vault')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'kyc_vault' 
                  ? 'bg-[#800020] text-white shadow-sm' 
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>خزينة التحقق المستندي (KYC)</span>
            </button>
          </div>
        </div>

        {activeSubTab === 'directory' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="ابحث باسم المتجر، المالك، السجل التجاري..."
                className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
              >
                <option value="all">جميع الحالات (All Statuses)</option>
                <option value="active">نشط ومعتمد (Active)</option>
                <option value="under_review">قيد المراجعة (Under Review)</option>
                <option value="suspended">موقوف مؤقتاً (Suspended)</option>
              </select>
            </div>

            <div className="sm:col-span-4 flex gap-2">
              <select
                value={districtFilter}
                onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
              >
                <option value="all">كل أحياء ومراكز دسوق</option>
                <option value="حي الميدان الإبراهيمي">الميدان الإبراهيمي</option>
                <option value="شارع الشركات">شارع الشركات</option>
                <option value="الكورنيش">الكورنيش</option>
                <option value="حي دحروج">حي دحروج</option>
                <option value="شارع الجيش">شارع الجيش</option>
                <option value="شارع النحريري">شارع النحريري</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="p-2.5 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-200 cursor-pointer"
                title="تصدير CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* SUB-VIEW 1: DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Bulk Selection Ribbon */}
          {selectedSellerIds.length > 0 && (
            <div className="bg-[#800020] text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{selectedSellerIds.length}</span>
                <span>متاجر محددة حالياً</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="px-3 py-1 bg-green-700 hover:bg-green-800 text-white rounded-lg font-bold cursor-pointer transition-colors"
                >
                  اعتماد وتنشيط
                </button>
                <button
                  onClick={() => handleBulkStatusChange('suspended')}
                  className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold cursor-pointer transition-colors"
                >
                  إيقاف مؤقت
                </button>
                <button
                  onClick={() => setSelectedSellerIds([])}
                  className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-100 dark:border-zinc-800 text-stone-500 font-bold">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={paginatedSellers.length > 0 && selectedSellerIds.length === paginatedSellers.length}
                        className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">اسم المتجر والمالك</th>
                    <th className="p-3.5">السجل والموقع بدسوق</th>
                    <th className="p-3.5">نسبة العمولة</th>
                    <th className="p-3.5">حالة التوثيق والنشاط</th>
                    <th className="p-3.5 text-center">الإجراءات والصفحة الرسمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                  {paginatedSellers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        لا توجد متاجر تطابق معايير التصفية الحالية
                      </td>
                    </tr>
                  ) : (
                    paginatedSellers.map((s) => {
                      const isSelected = selectedSellerIds.includes(s.id);
                      return (
                        <tr 
                          key={s.id}
                          className={`hover:bg-stone-50/70 dark:hover:bg-zinc-800/50 transition-colors ${
                            isSelected ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(s.id)}
                              className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                            />
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              {(s.logo || s.logoUrl) && (
                                <img src={s.logo || s.logoUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover border" />
                              )}
                              <div className="space-y-0.5">
                                <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                  <span>{s.name}</span>
                                  {(s.verificationStatus === 'verified' || s.isVerified) && (
                                    <BadgeCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                  )}
                                </p>
                                <p className="text-[10px] text-stone-400">المالك: {s.ownerName} | {s.phone}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <p className="text-stone-600 dark:text-zinc-300 font-mono text-[11px]">{s.taxRegistrationNumber || 'سجل تحت المراجعة'}</p>
                              <p className="text-stone-400 text-[10px] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                <span>{s.desoqDistrict || s.city}</span>
                              </p>
                            </div>
                          </td>

                          {/* Commission Rate Inline Editor */}
                          <td className="p-3.5">
                            {editingCommissionId === s.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max="0.40"
                                  step="0.01"
                                  value={commissionRateDraft}
                                  onChange={(e) => setCommissionRateDraft(parseFloat(e.target.value))}
                                  className="w-16 px-2 py-1 bg-white dark:bg-zinc-800 border rounded font-mono text-xs"
                                />
                                <button
                                  onClick={() => {
                                    onUpdateSellerCommission(s.id, s.name, commissionRateDraft);
                                    setEditingCommissionId(null);
                                  }}
                                  className="p-1 bg-green-700 hover:bg-green-800 text-white rounded cursor-pointer"
                                  title="حفظ النسبة"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingCommissionId(null)}
                                  className="p-1 bg-stone-200 text-stone-700 rounded cursor-pointer"
                                  title="إلغاء"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 font-bold">
                                <span className="font-mono text-xs font-bold text-stone-900 dark:text-white">
                                  {(s.commissionRate * 100).toFixed(0)}%
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingCommissionId(s.id);
                                    setCommissionRateDraft(s.commissionRate);
                                  }}
                                  className="text-[#800020] dark:text-[#D4AF37] hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>تعديل</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                s.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' 
                                  : s.status === 'suspended' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {s.status === 'active' ? 'نشط ومعتمد' : s.status === 'suspended' ? 'موقوف مؤقتاً' : 'قيد المراجعة'}
                              </span>

                              <button
                                onClick={() => verifySeller(s.id, s.verificationStatus === 'verified' ? 'rejected' : 'verified')}
                                className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                                  s.verificationStatus === 'verified' 
                                    ? 'bg-sky-100 text-sky-800 hover:bg-sky-200' 
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                                title={s.verificationStatus === 'verified' ? 'إلغاء التوثيق' : 'توثيق كمتجر معتمد'}
                              >
                                {s.verificationStatus === 'verified' ? '✓ موثق' : '+ توثيق'}
                              </button>
                            </div>
                          </td>

                          {/* Action Buttons & Store Page Link */}
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => openSellerProfile(s.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#FAF6EE] text-[#800020] border border-[#800020]/30 hover:bg-[#800020] hover:text-white font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                title="فتح الصفحة الرسمية للمتجر"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>صفحة المتجر</span>
                              </button>

                              <button
                                onClick={() => setInspectingSeller(s)}
                                className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 transition-all cursor-pointer"
                                title="عرض ملف التاجر الشامل"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {s.status === 'active' ? (
                                <button
                                  onClick={() => onUpdateSellerStatus(s.id, s.name, 'suspended')}
                                  className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold text-[10px] transition-all cursor-pointer hover:bg-red-100"
                                >
                                  إيقاف
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateSellerStatus(s.id, s.name, 'active')}
                                  className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 font-bold text-[10px] transition-all cursor-pointer hover:bg-green-100"
                                >
                                  تنشيط
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-stone-50/50 dark:bg-zinc-800/40 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-stone-500">
                عرض {filteredSellers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} إلى {Math.min(currentPage * pageSize, filteredSellers.length)} من إجمالي {filteredSellers.length} متجراً
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border bg-white dark:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-3 font-mono font-bold">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border bg-white dark:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: KYC REVIEW VAULT */}
      {activeSubTab === 'kyc_vault' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 p-6 shadow-2xs">
          <KycReviewCenter 
            sellers={sellers}
            showToast={showToast}
          />
        </div>
      )}

      {/* 3. Seller Dossier Modal */}
      {inspectingSeller && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-4 text-right animate-in fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  ملف المتجر والاعتماد (Seller Dossier)
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">ID: {inspectingSeller.id}</span>
              </div>
              <button
                onClick={() => setInspectingSeller(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-stone-100 dark:divide-zinc-800">
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">اسم المتجر:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingSeller.name}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">المالك المسؤول:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingSeller.ownerName}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">رقم الهاتف:</span>
                <strong className="font-mono text-stone-900 dark:text-white">{inspectingSeller.phone}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">الموقع الجغرافي:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingSeller.desoqDistrict || inspectingSeller.city}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">نسبة العمولة:</span>
                <strong className="text-[#800020] font-mono">{(inspectingSeller.commissionRate * 100).toFixed(1)}%</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">حالة المتجر:</span>
                <span className="font-bold uppercase text-green-700">{inspectingSeller.status}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setInspectingSeller(null);
                  openSellerProfile(inspectingSeller.id);
                }}
                className="px-4 py-2 bg-[#800020] text-white rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#600018]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح واجهة المتجر الرسمية</span>
              </button>
              <button
                onClick={() => setInspectingSeller(null)}
                className="px-5 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: ADD NEW CERTIFIED SELLER */}
      {isAddSellerModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-xl w-full rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-4 text-right animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#800020]" />
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  إضافة متجر جديد لقائمة التجار المعتمدين
                </h3>
              </div>
              <button
                onClick={() => setIsAddSellerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">اسم المتجر / العلامة التجارية *:</label>
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="مثال: دار العطور الملكية"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">اسم المالك / المدير المسؤول *:</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="مثال: الحاج محمود الدسوقي"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">رقم الهاتف (واتساب / تواصل) *:</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono text-left"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">البريد الإلكتروني للتاجر:</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="seller@desoq.market"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">الحي / المنطقة داخل دسوق:</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-bold"
                  >
                    <option value="شارع الجيش">شارع الجيش</option>
                    <option value="حي الميدان الإبراهيمي">الميدان الإبراهيمي</option>
                    <option value="شارع الشركات">شارع الشركات</option>
                    <option value="الكورنيش">الكورنيش</option>
                    <option value="حي دحروج">حي دحروج</option>
                    <option value="شارع النحريري">شارع النحريري</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">نسبة العمولة %:</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">العنوان التفصيلي:</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="مثال: برج الصفوة، بجوار مسجد سيدي إبراهيم الدسوقي"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">السجل التجاري / البطاقة الضريبية:</label>
                  <input
                    type="text"
                    value={newTaxNumber}
                    onChange={(e) => setNewTaxNumber(e.target.value)}
                    placeholder="CR-2026-9812"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">رابط الشعار (Logo URL):</label>
                  <input
                    type="text"
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">نبذة عن المتجر:</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="وصف مختصر لنشاط المتجر والمنتجات..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-800 border rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setIsAddSellerModalOpen(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 rounded-full cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNewSeller}
                className="px-5 py-2 bg-[#800020] text-white rounded-full cursor-pointer hover:bg-[#600018] shadow-md"
              >
                اعتماد وإضافة المتجر فوراً
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
