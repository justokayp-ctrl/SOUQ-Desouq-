import React, { useState } from 'react';
import { 
  MessageSquare, 
  User, 
  Send, 
  Star, 
  Clock, 
  CheckCircle2, 
  Search, 
  Phone, 
  MapPin, 
  Sparkles,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';
import { Seller } from '../../types';

interface SellerCustomersViewProps {
  seller: Seller;
  onShowToast: (msg: string) => void;
}

export const SellerCustomersView: React.FC<SellerCustomersViewProps> = ({
  seller,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'crm' | 'reviews'>('inquiries');

  // Customer Inquiries
  const [inquiries, setInquiries] = useState([
    {
      id: 'msg-1',
      customerName: 'أحمد محمود العبد',
      customerPhone: '01098471234',
      productTitle: 'طقم مفروشات قطن مصري فاخر',
      query: 'هل متوفر اللون الأبيض المطرز بذهبي من هذا الطقم بدسوق؟ وهل التوصيل فوري لشارع الجيش؟',
      date: 'منذ ساعتين',
      replied: false,
      replyText: '',
    },
    {
      id: 'msg-2',
      customerName: 'مريم السيد الشهاوي',
      customerPhone: '01123456789',
      productTitle: 'سجادة دمنهوري صوف طبيعي',
      query: 'هل يمكن التوصيل اليوم لمنطقة حي الصفا بدسوق؟ وهل هناك إمكانية للمعاينة قبل الدفع؟',
      date: 'منذ 5 ساعات',
      replied: true,
      replyText: 'أهلاً بحضرتك يا فندم. نعم متوفر توصيل خلال 24 ساعة عبر مندوب دسوق إكسبريس، والمعاينة متاحة وفق قانون حماية المستهلك.',
    },
    {
      id: 'msg-3',
      customerName: 'د. خالد عبد السميع',
      customerPhone: '01011223344',
      productTitle: 'عطر مسك الختام والعود الملكي 100ml',
      query: 'هل التغليف محكم للإرسال كهدية لمحافظة الإسكندرية مع كرت إهداء؟',
      date: 'أمس',
      replied: false,
      replyText: '',
    }
  ]);

  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({});

  // Quick Reply Templates
  const quickTemplates = [
    'نعم متوفر تسليم فوري في دسوق وضواحيها خلال 24 ساعة عبر مندوب دسوق إكسبريس.',
    'جميع منتجاتنا مصنعة من القطن المصري الخالص بنسبة 100% مع ضمان الجودة والاسترجاع خلال 14 يوماً.',
    'التغليف محكم للغاية ومعد خصيصاً للشحن داخل وخارج كفر الشيخ كهدية تراثية فاخرة.',
  ];

  // Repeat Customers (CRM)
  const [customersCRM] = useState([
    {
      id: 'cust-1',
      name: 'أحمد محمود العبد',
      phone: '01098471234',
      city: 'دسوق - شارع الجيش',
      ordersCount: 4,
      totalSpentEGP: 3850,
      lastOrderDate: 'منذ يومين',
      rating: 5.0,
      notes: 'عميل دائم يفضل المفروشات القطنية المطرزة',
    },
    {
      id: 'cust-2',
      name: 'مريم السيد الشهاوي',
      phone: '01123456789',
      city: 'دسوق - حي الصفا',
      ordersCount: 2,
      totalSpentEGP: 1950,
      lastOrderDate: 'منذ أسبوع',
      rating: 4.8,
      notes: 'تطلب التوصيل المسائي دائماً',
    },
    {
      id: 'cust-3',
      name: 'د. خالد عبد السميع',
      phone: '01011223344',
      city: 'كفر الشيخ - تقسيم الزهور',
      ordersCount: 3,
      totalSpentEGP: 2400,
      lastOrderDate: 'منذ أسبوعين',
      rating: 5.0,
      notes: 'يشتري حلويات دسوق كهدايا رسمية',
    }
  ]);

  const handleSendReply = (msgId: string) => {
    const text = replyInput[msgId];
    if (text?.trim()) {
      setInquiries((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, replied: true, replyText: text } : m))
      );
      onShowToast('تم إرسال الرد الفوري للعميل بنجاح');
      setReplyInput((prev) => ({ ...prev, [msgId]: '' }));
    }
  };

  const handleApplyTemplate = (msgId: string, templateText: string) => {
    setReplyInput((prev) => ({ ...prev, [msgId]: templateText }));
  };

  return (
    <div id="seller-customers-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>خدمة العملاء واستفسارات المشترين</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            التواصل المباشر مع زبائن دسوق، الردود السريعة، وإدارة ولاء العملاء (CRM)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700'
            }`}
          >
            الاستفسارات والرسائل ({inquiries.filter((m) => !m.replied).length} معلق)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700'
            }`}
          >
            دليل العملاء والولاء ({customersCRM.length})
          </button>
        </div>
      </div>

      {/* 2. INQUIRIES VIEW */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.map((msg) => (
            <div
              key={msg.id}
              className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 p-6 shadow-xs space-y-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-700/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] font-bold flex items-center justify-center">
                    {msg.customerName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A] dark:text-zinc-100">{msg.customerName}</span>
                    <span className="text-gray-400 block text-[11px]">• استفسار حول: {msg.productTitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-400">{msg.date}</span>
                  {msg.replied ? (
                    <span className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 font-bold px-2 py-0.5 rounded-full">
                      تم الرد ✓
                    </span>
                  ) : (
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      بانتظار ردك
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Query */}
              <div className="p-4 bg-[#FAF7F2] dark:bg-zinc-900 rounded-2xl text-gray-800 dark:text-zinc-200 font-medium">
                "{msg.query}"
              </div>

              {/* Replied state or Reply Form */}
              {msg.replied ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl space-y-1">
                  <span className="font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>رد متجرك المعتمد:</span>
                  </span>
                  <p className="text-gray-700 dark:text-zinc-300 pr-5">{msg.replyText}</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Quick Response Templates */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-gray-400 text-[10px] block w-full mb-0.5">قوالب ردود سريعة بضغطة واحدة:</span>
                    {quickTemplates.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(msg.id, tmpl)}
                        className="bg-[#FAF7F2] dark:bg-zinc-700 hover:bg-[#800020] hover:text-white dark:hover:bg-[#800020] text-gray-700 dark:text-zinc-300 px-3 py-1 rounded-full text-[10px] font-medium transition-colors cursor-pointer text-right line-clamp-1 max-w-[280px]"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyInput[msg.id] || ''}
                      onChange={(e) => setReplyInput({ ...replyInput, [msg.id]: e.target.value })}
                      placeholder="اكتب ردك المباشر للمشتري..."
                      className="flex-1 bg-[#FAF7F2] dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 text-xs outline-none focus:border-[#800020]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply(msg.id);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(msg.id)}
                      className="bg-[#800020] hover:bg-[#600018] text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. CRM DIRECTORY VIEW */}
      {activeTab === 'crm' && (
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
              <span>قائمة الزبائن المكررين والأكثر ولاءً لمتجرك بدسوق</span>
            </h3>
            <span className="text-xs text-gray-500">تساعدك على تقديم عروض وخصومات خاصة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] dark:bg-zinc-900 border-b border-[#800020]/10 text-gray-600 dark:text-zinc-400 font-bold">
                  <th className="p-4">العميل والموقع</th>
                  <th className="p-4">رقم الهاتف</th>
                  <th className="p-4">عدد الطلبات</th>
                  <th className="p-4">إجمالي المشتريات (EGP)</th>
                  <th className="p-4">ملاحظات التاجر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                {customersCRM.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1A1A1A] dark:text-zinc-100">{cust.name}</p>
                          <span className="text-[10px] text-gray-400">{cust.city}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-semibold text-gray-700 dark:text-zinc-300">
                      {cust.phone}
                    </td>

                    <td className="p-4 font-bold text-blue-700 dark:text-blue-400">
                      {cust.ordersCount} طلبات
                    </td>

                    <td className="p-4 font-serif font-bold text-sm text-[#800020] dark:text-[#D4AF37]">
                      {cust.totalSpentEGP.toLocaleString()} ج.م
                    </td>

                    <td className="p-4 text-gray-600 dark:text-zinc-300 text-[11px]">
                      {cust.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
