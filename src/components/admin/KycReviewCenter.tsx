import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Loader2, 
  RefreshCw, 
  Search, 
  KeyRound, 
  ExternalLink,
  Store,
  Calendar,
  Lock,
  Check,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { Seller, KycDocument, KycStatus } from '../../types';

interface KycReviewCenterProps {
  sellers: Seller[];
  onSellerStatusUpdated?: (sellerId: string, status: 'active' | 'under_review' | 'suspended') => void;
  showToast: (msg: string) => void;
}

export const KycReviewCenter: React.FC<KycReviewCenterProps> = ({
  sellers,
  onSellerStatusUpdated,
  showToast,
}) => {
  const [kycDocs, setKycDocs] = useState<KycDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected doc for review modal
  const [selectedDoc, setSelectedDoc] = useState<KycDocument | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const docs = await api.getKycDocuments();
      setKycDocs(docs);
    } catch (err: any) {
      console.error('[KycReviewCenter] Failed to fetch documents:', err);
      showToast('فشل تحميل وثائق الـ KYC');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleOpenReviewModal = (doc: KycDocument) => {
    setSelectedDoc(doc);
    setReviewDecision(doc.status === 'approved' ? 'approved' : 'approved');
    setReviewNotes(doc.reviewNotes || '');
    setExpiryDate(doc.expiryDate || '');
  };

  const handleViewDocument = async (doc: KycDocument) => {
    setViewingFileId(doc.fileId);
    try {
      const res = await api.getSignedFileUrl(doc.fileId, 3600);
      window.open(res.signedUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'فشل توليد رابط التحميل الآمن');
    } finally {
      setViewingFileId(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setIsSubmitting(true);
    try {
      const updated = await api.reviewKycDocument(
        selectedDoc.id,
        reviewDecision,
        reviewNotes.trim() || undefined,
        expiryDate || undefined
      );

      showToast(`تم ${reviewDecision === 'approved' ? 'اعتماد' : 'رفض'} الوثيقة بنجاح`);
      setSelectedDoc(null);
      await fetchDocs();
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل قرار المراجعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocs = kycDocs.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const seller = sellers.find(s => s.id === doc.sellerId);
      const sellerName = seller?.name.toLowerCase() || '';
      const docTitle = doc.titleAr.toLowerCase();
      const docNumber = (doc.documentNumber || '').toLowerCase();
      return sellerName.includes(q) || docTitle.includes(q) || docNumber.includes(q);
    }
    return true;
  });

  const pendingCount = kycDocs.filter(d => d.status === 'pending').length;
  const approvedCount = kycDocs.filter(d => d.status === 'approved').length;
  const rejectedCount = kycDocs.filter(d => d.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="bg-white rounded-3xl border border-[#800020]/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-bold text-2xl shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                  مركز تدقيق ومطابقة وثائق الـ KYC (Compliance & Verification Vault)
                </h3>
                <span className="bg-[#800020] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  RBAC Level: Admin & Compliance
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                التحقق الأمني من السجلات التجارية، البطاقات الضريبية، وبطاقات الهوية للمتاجر المستقلة في دسوق.
              </p>
            </div>
          </div>

          <button
            onClick={fetchDocs}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#800020] bg-[#F5F2ED] px-3.5 py-2 rounded-xl transition-all font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث السجلات
          </button>
        </div>

        {/* Status Counter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div 
            onClick={() => setFilterStatus('all')}
            className={`p-3.5 rounded-xl cursor-pointer transition-all ${
              filterStatus === 'all' ? 'bg-[#800020] text-white shadow-xs' : 'bg-[#F5F2ED] text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="block text-[10px] opacity-80">إجمالي الوثائق:</span>
            <span className="font-bold text-sm">{kycDocs.length} وثيقة</span>
          </div>

          <div 
            onClick={() => setFilterStatus('pending')}
            className={`p-3.5 rounded-xl cursor-pointer transition-all ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span className="block text-[10px] opacity-80">بانتظار القرار (Pending):</span>
            <span className="font-bold text-sm">{pendingCount} وثيقة</span>
          </div>

          <div 
            onClick={() => setFilterStatus('approved')}
            className={`p-3.5 rounded-xl cursor-pointer transition-all ${
              filterStatus === 'approved' ? 'bg-green-700 text-white shadow-xs' : 'bg-green-50 text-green-900 hover:bg-green-100'
            }`}
          >
            <span className="block text-[10px] opacity-80">معتمدة ومطابقة (Approved):</span>
            <span className="font-bold text-sm">{approvedCount} وثيقة</span>
          </div>

          <div 
            onClick={() => setFilterStatus('rejected')}
            className={`p-3.5 rounded-xl cursor-pointer transition-all ${
              filterStatus === 'rejected' ? 'bg-red-700 text-white shadow-xs' : 'bg-red-50 text-red-900 hover:bg-red-100'
            }`}
          >
            <span className="block text-[10px] opacity-80">مرفوضة (Rejected):</span>
            <span className="font-bold text-sm">{rejectedCount} وثيقة</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المتجر، نوع الوثيقة، أو رقم السجل..."
            className="w-full pr-10 pl-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#800020] outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">تصفية حسب الحالة:</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterStatus === st 
                  ? 'bg-[#800020] text-white shadow-xs' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {st === 'all' ? 'الكل' : st === 'pending' ? 'قيد الفحص' : st === 'approved' ? 'معتمد' : 'مرفوض'}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="bg-white rounded-3xl border border-[#800020]/10 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#800020]" />
            <p className="text-xs">جاري فحص وتشفير بيانات الوثائق...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-700">لا توجد وثائق تطابق الفلتر الحالي</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F5F2ED] text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4">المتجر والمالك</th>
                  <th className="p-4">نوع الوثيقة</th>
                  <th className="p-4">رقم القيد / الملف</th>
                  <th className="p-4">الحجم والتشفير</th>
                  <th className="p-4">تاريخ الرفع</th>
                  <th className="p-4">حالة التدقيق</th>
                  <th className="p-4">الإجراءات والقرار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => {
                  const seller = sellers.find(s => s.id === doc.sellerId);
                  const file = doc.file;

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1A1A1A]">{seller?.name || doc.sellerId}</p>
                            <p className="text-[10px] text-gray-400">المالك: {seller?.ownerName || '—'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-800">{doc.titleAr}</span>
                          <span className="block text-[10px] text-gray-400 font-mono">{file?.originalFilename || 'document'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-gray-600">
                        {doc.documentNumber || '—'}
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-gray-700">
                            {file?.sizeBytes ? `${(file.sizeBytes / 1024).toFixed(1)} ك.ب` : '—'}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-mono">
                            <Lock className="w-2.5 h-2.5 inline" />
                            <span>SHA256 موثق</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status === 'approved' ? 'معتمد رسميًا' :
                           doc.status === 'rejected' ? 'مرفوض' : 'قيد الفحص'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            disabled={viewingFileId === doc.fileId}
                            className="p-1.5 rounded-lg bg-[#F5F2ED] text-gray-700 hover:text-[#800020] hover:bg-gray-200 transition-all"
                            title="معاينة الوثيقة عبر رابط مشفر مؤقت"
                          >
                            {viewingFileId === doc.fileId ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#800020]" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenReviewModal(doc)}
                            className="bg-[#800020] hover:bg-[#600018] text-white px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <span>مراجعة واتخاذ قرار</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#800020]/10 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    قرار التدقيق والامتثال القانوني (KYC Review)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    الوثيقة: {selectedDoc.titleAr} ({sellers.find(s => s.id === selectedDoc.sellerId)?.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Document Metadata Summary */}
            <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-gray-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">الملف الأصلي:</span>
                <span className="font-mono font-bold text-gray-700">{selectedDoc.file?.originalFilename || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">بصمة SHA-256:</span>
                <span className="font-mono text-[10px] text-gray-600 truncate max-w-[240px]">
                  {selectedDoc.file?.sha256Checksum || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span className="text-gray-400">معاينة الملف:</span>
                <button
                  type="button"
                  onClick={() => handleViewDocument(selectedDoc)}
                  className="text-[#800020] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>فتح المستند في نافذة آمنة</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-2">القرار النهائي:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approved')}
                    className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      reviewDecision === 'approved'
                        ? 'bg-green-700 text-white border-green-700 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>اعتماد ومطابقة (Approve)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('rejected')}
                    className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      reviewDecision === 'rejected'
                        ? 'bg-red-700 text-white border-red-700 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>رفض الوثيقة (Reject)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  ملاحظات المراجعة وتوجيهات الامتثال (تظهر للتاجر):
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={reviewDecision === 'approved' ? 'تمت مطابقة السجل مع بيانات الغرفة التجارية بنجاح' : 'يرجى إعادة رفع صورة واضحة للسجل التجاري مع الختم الرسمي'}
                  className="w-full bg-[#F5F2ED] border-none rounded-xl p-3 outline-none min-h-[80px] focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">تاريخ انتهاء صلاحية الوثيقة (اختياري):</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#F5F2ED] border-none rounded-xl p-2.5 outline-none font-mono focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#800020] text-white font-bold hover:bg-[#600018] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>تثبيت القرار في السجل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
