import React from 'react';
import { Printer, X, Truck, ShieldCheck, MapPin, Phone, User, Package, QrCode } from 'lucide-react';
import { Seller, SellerSubOrder } from '../../types';

interface SellerAirwayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
  subOrder: (SellerSubOrder & {
    parentOrderId?: string;
    parentTrackingCode?: string;
    customerName?: string;
    customerPhone?: string;
    shippingAddress?: any;
    createdAt?: string;
  }) | null;
}

export const SellerAirwayBillModal: React.FC<SellerAirwayBillModalProps> = ({
  isOpen,
  onClose,
  seller,
  subOrder,
}) => {
  if (!isOpen || !subOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-zinc-700 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-zinc-100">
              بوليصة شحن رسمية (Airway Bill - AWB)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Shipping Label Sheet */}
        <div id="printable-awb-slip" className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-2xl p-5 bg-white text-gray-900 space-y-4 text-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <div className="font-serif font-black text-base text-[#800020]">سوق دسوق الرقمي | Souq Desoq</div>
              <div className="text-[10px] text-gray-500 font-semibold">شبكة التوصيل والشحن المحلي الموحد بدسوق</div>
            </div>
            <div className="text-left font-mono">
              <div className="font-black text-sm text-[#800020]">#{subOrder.parentTrackingCode || 'DES-9901'}</div>
              <div className="text-[10px] text-gray-500">AWB: {subOrder.trackingNumber || 'TRK-8820'}</div>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-200 space-y-1">
            <div className="font-mono tracking-widest text-lg font-bold">||| | |||| | ||| |||| | || | |||</div>
            <div className="text-[10px] font-mono text-gray-600 font-bold">{subOrder.trackingNumber || 'TRK-882019'}</div>
          </div>

          {/* Shipper & Consignee Grid */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200">
            {/* Shipper (الراسل) */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-gray-400">الراسل (التاجر / المتجر):</div>
              <div className="font-bold text-gray-900">{seller.name}</div>
              <div className="text-[11px] text-gray-600">{seller.city} — {seller.address}</div>
              <div className="text-[10px] text-gray-500 font-mono">هاتف: {seller.phone || '01000000000'}</div>
            </div>

            {/* Consignee (المستلم) */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-gray-400">المستلم (المشتري):</div>
              <div className="font-bold text-gray-900">{subOrder.customerName || 'عميل سوق دسوق'}</div>
              <div className="text-[11px] text-gray-600">
                {subOrder.shippingAddress?.city || 'دسوق'} — {subOrder.shippingAddress?.district || 'حي وسط'}
              </div>
              <div className="text-[10px] text-gray-500 font-mono">هاتف: {subOrder.customerPhone || '01012345678'}</div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="space-y-1.5">
            <div className="font-bold text-[11px] text-gray-700">محتويات الطرد:</div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2">المنتج</th>
                    <th className="p-2 text-center">الكمية</th>
                    <th className="p-2 text-left">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subOrder.items.map((it: any, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium">{it.product?.titleAr || it.productTitleAr || 'منتج'}</td>
                      <td className="p-2 text-center font-bold">{it.quantity}</td>
                      <td className="p-2 text-left font-bold">{(it.product?.priceEGP || it.priceEGP || 0) * it.quantity} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-900 font-bold block">المبلغ المطلوب تحصيله (COD):</span>
              <span className="text-[9px] text-amber-700">شامل مصاريف التوصيل وضريبة القيمة المضافة</span>
            </div>
            <div className="text-base font-serif font-black text-[#800020]">
              {subOrder.subtotalEGP} ج.م
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] text-gray-500">
            <div className="border-t border-gray-300 pt-1 text-center">توقيع مندوب التوصيل</div>
            <div className="border-t border-gray-300 pt-1 text-center">توقيع واستلام العميل</div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>طباعة البوليصة AWB</span>
          </button>
        </div>

      </div>
    </div>
  );
};
