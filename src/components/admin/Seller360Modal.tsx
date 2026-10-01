import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  FileCheck, 
  Star, 
  Activity, 
  AlertOctagon,
  ShieldCheck,
  Check,
  AlertTriangle,
  FileText,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Seller, Product, MarketplaceOrder, Dispute, KycDocument, SellerStatus } from '../../types';

interface Seller360ModalProps {
  seller: Seller | null;
  products: Product[];
  orders: MarketplaceOrder[];
  disputes: Dispute[];
  kycDocs: KycDocument[];
  onClose: () => void;
  onUpdateSellerStatus: (sellerId: string, status: SellerStatus, reason?: string) => void;
  onUpdateCommission: (sellerId: string, commissionRate: number) => void;
  onReviewKycDoc?: (kycId: string, status: 'approved' | 'rejected', notes?: string) => void;
}

export const Seller360Modal: React.FC<Seller360ModalProps> = ({
  seller,
  products,
  orders,
  disputes,
  kycDocs,
  onClose,
  onUpdateSellerStatus,
  onUpdateCommission,
  onReviewKycDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'finance' | 'kyc' | 'reviews' | 'activity' | 'violations'>('products');
  const [newCommissionRate, setNewCommissionRate] = useState<number>(seller?.commissionRate || 10);
  const [suspensionReason, setSuspensionReason] = useState('');

  if (!seller) return null;

  const sellerProducts = products.filter(p => p.sellerId === seller.id);
  
  // Sub-orders assigned to seller
  const sellerSubOrders: any[] = [];
  orders.forEach(o => {
    (o.subOrders || o.sellerSubOrders || []).forEach((so: any) => {
      if (so.sellerId === seller.id) {
        sellerSubOrders.push({ ...so, parentOrderId: o.id, createdAt: o.createdAt });
      }
    });
  });

  const sellerDisputes = disputes.filter(d => d.sellerId === seller.id);
  const sellerKycDocs = kycDocs.filter(k => k.sellerId === seller.id);

  const totalGMV = sellerSubOrders.reduce((sum, so) => sum + (so.totalEGP || so.priceEGP || 0), 0);

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 max-w-5xl w-full rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="p-5 bg-stone-950 text-white flex items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-lg shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold">{seller.name}</h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  seller.status === 'active' ? 'bg-green-500 text-white' :
                  seller.status === 'under_review' ? 'bg-amber-500 text-stone-950' : 'bg-red-500 text-white'
                }`}>
                  {seller.status}
                </span>
                {seller.isVerified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> موثق رسمياً
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-mono">
                كود المتجر: {seller.id} | المالك: {seller.ownerName} | المنطقة: {seller.district || 'دسوق'}
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

        {/* 7 Tabs Bar */}
        <div className="bg-stone-50 dark:bg-zinc-850 px-5 pt-3 border-b border-stone-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'products', label: `المنتجات (${sellerProducts.length})`, icon: Package },
            { id: 'orders', label: `الطلبات (${sellerSubOrders.length})`, icon: ShoppingBag },
            { id: 'finance', label: 'المالية والعمولة', icon: DollarSign },
            { id: 'kyc', label: `الـ KYC والوثائق (${sellerKycDocs.length})`, icon: FileCheck },
            { id: 'reviews', label: `التقييمات (${seller.rating || 4.9} ★)`, icon: Star },
            { id: 'activity', label: 'سجل النشاط والعمليات', icon: Activity },
            { id: 'violations', label: `المخالفات والنزاعات (${sellerDisputes.length})`, icon: AlertOctagon },
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

        {/* Modal Body Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: Products */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">منتجات المتجر المسجلة بالكتالوج</h4>
                <span className="text-stone-500 font-mono">إجمالي المنتجات: {sellerProducts.length}</span>
              </div>
              {sellerProducts.length === 0 ? (
                <p className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl">لا توجد منتجات مسجلة لهذا المتجر.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sellerProducts.map(p => (
                    <div key={p.id} className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200/70 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{p.titleAr}</p>
                          <p className="text-stone-500 text-[11px] font-mono">SKU: {p.attributes?.sku || p.id} | السعر: {p.priceEGP} ج.م | المخزون: {p.stock}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.stock > 0 ? `متاح (${p.stock})` : 'نفد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">الطلبات والشحنات التابعة للمتجر</h4>
              {sellerSubOrders.length === 0 ? (
                <p className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl">لا توجد شحنات مسجلة لهذا التاجر بعد.</p>
              ) : (
                <div className="space-y-2">
                  {sellerSubOrders.map((so, idx) => (
                    <div key={idx} className="p-3.5 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200/70 dark:border-zinc-800 flex items-center justify-between font-mono">
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">شحنة #{so.id} (طلب رئيسي #{so.parentOrderId})</span>
                        <p className="text-stone-500 text-[11px]">طريقة الشحن: {so.fulfillmentMethod || 'FBD سوق دسوق إكسبريس'}</p>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">{so.totalEGP || so.priceEGP} ج.م</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{so.status || 'processing'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-1">
                  <span className="text-stone-500">إجمالي المبيعات (GMV):</span>
                  <p className="text-lg font-mono font-bold text-stone-900 dark:text-white">{totalGMV.toLocaleString()} ج.م</p>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-1">
                  <span className="text-stone-500">الرصيد المتاح للسحب:</span>
                  <p className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">{(seller.availableBalanceEGP || totalGMV * 0.9).toLocaleString()} ج.م</p>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-1">
                  <span className="text-stone-500">نسبة عمولة المنصة الحالية:</span>
                  <p className="text-lg font-mono font-bold text-[#800020] dark:text-red-400">{seller.commissionRate || 10}%</p>
                </div>
              </div>

              {/* Commission Override Section */}
              <div className="p-5 bg-stone-50 dark:bg-zinc-850 rounded-3xl border border-stone-200 dark:border-zinc-800 space-y-3">
                <h5 className="font-bold text-stone-900 dark:text-white">تعديل عمولة المنصة للمتجر</h5>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="w-32 px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-xs"
                  />
                  <span className="font-bold">%</span>
                  <button
                    onClick={() => onUpdateCommission(seller.id, newCommissionRate)}
                    className="px-4 py-2 bg-[#800020] hover:bg-[#600018] text-white rounded-xl font-bold cursor-pointer transition-all"
                  >
                    حفظ وتطبيـق العمولة الجديدة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KYC Documents */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">وثائق ومستندات التحقق KYC القانونية</h4>
              <div className="p-4 bg-stone-50 dark:bg-zinc-850 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-600">السجل التجاري:</span>
                  <span className="font-mono font-bold">{seller.commercialRecordNumber || 'CR-1029384'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">الرقم الضريبي:</span>
                  <span className="font-mono font-bold">{seller.taxRegistrationNumber || 'TR-998877'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">الرقم القومي للمالك:</span>
                  <span className="font-mono font-bold">{(seller as any).nationalIdNumber || '28905151500998'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-stone-800 dark:text-zinc-200">الملفات المرفوعة للمراجعة:</h5>
                {sellerKycDocs.length === 0 ? (
                  <p className="p-4 text-center text-stone-500 bg-stone-50 rounded-xl">لا توجد وثائق مرفوعة حالياً.</p>
                ) : (
                  sellerKycDocs.map(doc => (
                    <div key={doc.id} className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{doc.titleAr}</p>
                          <p className="text-[10px] text-stone-400">تاريخ الرفع: {new Date(doc.createdAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status}
                        </span>
                        {onReviewKycDoc && doc.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onReviewKycDoc(doc.id, 'approved', 'مستند سليم ومطابق')}
                              className="px-2 py-1 bg-green-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              قبول ✓
                            </button>
                            <button
                              onClick={() => onReviewKycDoc(doc.id, 'rejected', 'مستند غير واضح')}
                              className="px-2 py-1 bg-red-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              رفض ✗
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-amber-900 text-base">تقييم المتجر العام</h4>
                  <p className="text-amber-800 text-xs">بناءً على {seller.reviewCount || 48} تقييماً من مشترين موثقين</p>
                </div>
                <div className="text-center font-bold text-amber-900">
                  <span className="text-3xl font-mono">{seller.rating || 4.9}</span>
                  <span className="text-lg"> / 5.0</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-3 font-mono">
              <h4 className="font-serif font-bold text-stone-900 dark:text-white text-sm">سجل العمليات والأنشطة الإدارية للمتجر</h4>
              {[
                { time: 'قبل 10 دقائق', act: 'تحديث المخزون لـ 5 منتجات' },
                { time: 'قبل 3 ساعات', act: 'تأكيد تجهيز الشحنة #ORD-9912' },
                { time: 'قبل يومين', act: 'تعديل أسعار قسم الأقمشة' },
              ].map((log, i) => (
                <div key={i} className="p-3 bg-stone-50 dark:bg-zinc-850 rounded-xl border border-stone-200/60 flex justify-between">
                  <span>{log.act}</span>
                  <span className="text-stone-400">{log.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: Violations & Status Control */}
          {activeTab === 'violations' && (
            <div className="space-y-5">
              <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-900/40 space-y-4">
                <h4 className="font-serif font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  <span>إدارة حالة المتجر وتجميد الحساب (Suspension & Violations)</span>
                </h4>

                <div className="space-y-2">
                  <label className="font-bold text-stone-800 dark:text-zinc-200 block">سبب التعديل أو التعليق (إلزامي للتوثيق في الـ Audit Log):</label>
                  <textarea
                    rows={2}
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="اكتب سبب التعليق أو تغيير الحالة هنا (مثال: مخالفة جودة الأسماك المملحة أو تأخير الشحن متكرر)..."
                    className="w-full p-3 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/40 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => onUpdateSellerStatus(seller.id, 'active', suspensionReason)}
                    className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    تفعيل المتجر (Active) ✓
                  </button>
                  <button
                    onClick={() => onUpdateSellerStatus(seller.id, 'suspended', suspensionReason || 'مخالفة معايير الجودة')}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    تجميد وتعليق المتجر (Suspend) ⛔
                  </button>
                  <button
                    onClick={() => onUpdateSellerStatus(seller.id, 'under_review', suspensionReason)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    وضع قيد المراجعة (Under Review) ⏳
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 dark:bg-zinc-850 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-mono">SOUQ DESOQ — SELLER 360 INTELLIGENCE TOWER</span>
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
