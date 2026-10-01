import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  Eye, 
  Loader2, 
  Lock, 
  RefreshCw, 
  FileCheck2,
  FileCode,
  KeyRound
} from 'lucide-react';
import { api } from '../../services/api';
import { Seller, KycDocument, KycDocumentType } from '../../types';

interface KycVaultManagerProps {
  seller: Seller;
  onKycUpdated?: () => void;
}

const DOCUMENT_TYPE_CONFIG: Record<KycDocumentType, { titleAr: string; descAr: string; required: boolean }> = {
  commercial_register: {
    titleAr: 'السجل التجاري المصري',
    descAr: 'صورة حديثة وسارية من السجل التجاري التابع للغرفة التجارية بكفر الشيخ/دسوق.',
    required: true,
  },
  tax_card: {
    titleAr: 'البطاقة الضريبية',
    descAr: 'شهادة التسجيل الضريبي أو البطاقة الضريبية الصادرة من مصلحة الضرائب المصرية.',
    required: true,
  },
  national_id: {
    titleAr: 'بطاقة الرقم القومي للمالك',
    descAr: 'صورة الوجهين لبطاقة الرقم القومي سارية للممثل القانوني للمتجر.',
    required: true,
  },
  bank_proof: {
    titleAr: 'إثبات حساب بنكي / إنستاباي',
    descAr: 'إفادة حساب بنكي أو كشف حساب معتمد أو لقطة تأكيد عنوان الدفع اللحظي InstaPay.',
    required: false,
  },
  other: {
    titleAr: 'مستند إضافي / تراخيص صناعية',
    descAr: 'شهادة ترخيص ورشة محلية، علامة تجارية مسجلة، أو شهادة جودة حرفية.',
    required: false,
  },
};

export const KycVaultManager: React.FC<KycVaultManagerProps> = ({ seller, onKycUpdated }) => {
  const [kycDocs, setKycDocs] = useState<KycDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upload Form State
  const [selectedType, setSelectedType] = useState<KycDocumentType>('commercial_register');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewName, setPreviewName] = useState('');

  // Signed URL for viewing
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);
  const [signedUrlData, setSignedUrlData] = useState<{ url: string; expiresAt: string } | null>(null);

  const fetchKycDocs = async () => {
    setIsLoading(true);
    try {
      const docs = await api.getKycDocuments(seller.id);
      setKycDocs(docs);
    } catch (err: any) {
      console.error('[KycVault] Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycDocs();
  }, [seller.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewName(file.name);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('يرجى اختيار ملف الوثيقة لرفعه');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('فشل قراءة بيانات الملف'));
      });

      reader.readAsDataURL(selectedFile);
      const base64Data = await base64Promise;

      const typeConfig = DOCUMENT_TYPE_CONFIG[selectedType];

      await api.uploadKycDocument({
        sellerId: seller.id,
        documentType: selectedType,
        titleAr: typeConfig.titleAr,
        documentNumber: docNumber.trim() || undefined,
        filename: selectedFile.name,
        mimeType: selectedFile.type || 'application/octet-stream',
        base64Data,
      });

      setSuccessMessage('تم تشفير المستند وحفظه في خزينة الـ KYC الخاصة بمتجرك بنجاح');
      setSelectedFile(null);
      setPreviewName('');
      setDocNumber('');
      await fetchKycDocs();
      onKycUpdated?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل رفع مستند التحقق');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = async (doc: KycDocument) => {
    setViewingFileId(doc.fileId);
    try {
      const res = await api.getSignedFileUrl(doc.fileId, 3600);
      setSignedUrlData({ url: res.signedUrl, expiresAt: res.expiresAt });
      // Open in a new tab safely or direct download link
      window.open(res.signedUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'فشل توليد رابط التحميل الآمن');
    } finally {
      setViewingFileId(null);
    }
  };

  // Check how many core docs are approved
  const approvedDocs = kycDocs.filter(d => d.status === 'approved');
  const pendingDocs = kycDocs.filter(d => d.status === 'pending');
  const rejectedDocs = kycDocs.filter(d => d.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Status */}
      <div className="bg-white rounded-3xl border border-[#800020]/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs ${
              seller.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {seller.status === 'active' ? <ShieldCheck className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                  خزينة مستندات التوثيق والـ KYC السحابية (Private Vault)
                </h3>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  seller.status === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {seller.status === 'active' ? 'تاجر موثق ومعتمد رسميًا' : 'قيد التدقيق والمراجعة القانونية'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                يتم تخزين كافة مستندات الهوية والسجلات التجارية في خادم Object Storage معزول بروابط وصول مشفرة رقميًا.
              </p>
            </div>
          </div>

          <button
            onClick={fetchKycDocs}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#800020] bg-[#F5F2ED] px-3.5 py-2 rounded-xl transition-all font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث المستندات
          </button>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F5F2ED]">
            <span className="text-gray-400 block text-[10px]">إجمالي المستندات:</span>
            <span className="font-bold text-sm text-[#1A1A1A]">{kycDocs.length} وثائق</span>
          </div>
          <div className="p-3.5 rounded-xl bg-green-50 text-green-900">
            <span className="text-green-700 block text-[10px]">المعتمدة رسمياً:</span>
            <span className="font-bold text-sm text-green-800">{approvedDocs.length} وثيقة</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900">
            <span className="text-amber-700 block text-[10px]">قيد المراجعة:</span>
            <span className="font-bold text-sm text-amber-800">{pendingDocs.length} وثيقة</span>
          </div>
          <div className="p-3.5 rounded-xl bg-red-50 text-red-900">
            <span className="text-red-700 block text-[10px]">مرفوضة / تتطلب إعادة رفع:</span>
            <span className="font-bold text-sm text-red-800">{rejectedDocs.length} وثيقة</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload New Document Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-[#800020]/10 p-6 shadow-xs space-y-4">
          <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#800020]" />
            رفع مستند جديد للخزينة
          </h4>
          <p className="text-[11px] text-gray-500">
            الملفات المدعومة: PDF, JPG, PNG, WebP (بحد أقصى 15 ميجابايت).
          </p>

          <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">نوع المستند:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as KycDocumentType)}
                className="w-full bg-[#F5F2ED] border-none rounded-xl p-2.5 outline-none font-semibold focus:ring-1 focus:ring-[#D4AF37]"
              >
                {Object.entries(DOCUMENT_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.titleAr} {config.required ? '(إلزامي)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">رقم المستند / السجل (اختياري):</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="مثال: 184920/2024"
                className="w-full bg-[#F5F2ED] border-none rounded-xl p-2.5 outline-none font-mono focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">اختر الملف من جهازك:</label>
              <label className="border-2 border-dashed border-gray-200 hover:border-[#800020]/40 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-[#FDFBF7] transition-all">
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[11px] font-bold text-gray-700 line-clamp-1">
                  {previewName || 'اضغط لاختيار الملف'}
                </span>
                <span className="text-[9px] text-gray-400 mt-0.5">فحص البصمة الثنائية تلقائياً</span>
              </label>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-semibold bg-red-50 p-2.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-1.5 text-green-700 text-[11px] font-semibold bg-green-50 p-2.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full py-2.5 bg-[#800020] hover:bg-[#600018] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التشفير والرفع...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>حفظ وتأمين المستند</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Document Vault List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#800020]/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#800020]" />
              المستندات المحفوظة في الخزينة الرقمية
            </h4>
            <span className="text-[11px] text-gray-400">
              تخزين معزول (Private Bucket)
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#800020]" />
              <p className="text-xs">جاري فحص الخزينة المشفرة...</p>
            </div>
          ) : kycDocs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2 border border-dashed rounded-2xl p-6">
              <FileText className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-600">لم تقم برفع أي مستندات توثيق بعد</p>
              <p className="text-[11px] text-gray-400">
                يرجى رفع السجل التجاري والبطاقة الضريبية لتفعيل شارة التاجر المعتمد.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {kycDocs.map((doc) => {
                const config = DOCUMENT_TYPE_CONFIG[doc.documentType] || DOCUMENT_TYPE_CONFIG.other;
                const file = doc.file;

                return (
                  <div 
                    key={doc.id} 
                    className="p-4 rounded-2xl bg-[#FDFBF7] border border-gray-100 hover:border-[#800020]/20 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs text-[#1A1A1A]">{doc.titleAr || config.titleAr}</h5>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.status === 'approved' ? 'معتمد رسميًا' :
                               doc.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                            </span>
                          </div>
                          {doc.documentNumber && (
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                              رقم القيد: {doc.documentNumber}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            تم الرفع: {new Date(doc.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {file?.sizeBytes ? ` • ${(file.sizeBytes / 1024).toFixed(1)} ك.ب` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          disabled={viewingFileId === doc.fileId}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#800020] text-xs font-semibold text-gray-700 hover:text-[#800020] transition-all shadow-2xs"
                        >
                          {viewingFileId === doc.fileId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          <span>معاينة آمنة</span>
                        </button>
                      </div>
                    </div>

                    {/* Review Notes or Security Meta */}
                    {doc.reviewNotes && (
                      <div className="bg-amber-50/70 border border-amber-100 p-2.5 rounded-xl text-[10px] text-amber-900 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
                        <div>
                          <strong className="block text-amber-800">ملاحظات فريق المراجعة والامتثال:</strong>
                          <span>{doc.reviewNotes}</span>
                        </div>
                      </div>
                    )}

                    {file?.sha256Checksum && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100/60 text-[9px] text-gray-400 font-mono">
                        <KeyRound className="w-3 h-3 text-gray-300" />
                        <span className="truncate">SHA-256: {file.sha256Checksum}</span>
                        <span className="shrink-0 text-emerald-700 font-sans font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                          مشفر وموثق
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
