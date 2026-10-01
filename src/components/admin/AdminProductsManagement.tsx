import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  Truck, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { Product, Seller } from '../../types';
import { ConfirmationModalConfig } from './AdminActionConfirmationModal';

interface AdminProductsManagementProps {
  products: Product[];
  sellers: Seller[];
  onUpdateProductStatus: (productId: string, titleAr: string, status: 'active' | 'pending_moderation' | 'suspended') => void;
  onToggleProductBadge: (productId: string, badgeKey: 'isDesoqLocalMade' | 'isFastDesoqDelivery', currentValue: boolean) => void;
  onDeleteProduct: (productId: string, titleAr: string) => void;
  onRequestConfirmation: (config: ConfirmationModalConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminProductsManagement: React.FC<AdminProductsManagementProps> = ({
  products,
  sellers,
  onUpdateProductStatus,
  onToggleProductBadge,
  onDeleteProduct,
  onRequestConfirmation,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Detailed Product Modal
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [products]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = 
        (p.titleAr || '').toLowerCase().includes(term) ||
        (p.titleEn || '').toLowerCase().includes(term) ||
        (p.id || '').toLowerCase().includes(term);

      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      
      let matchStock = true;
      if (stockFilter === 'out_of_stock') matchStock = p.stock === 0;
      else if (stockFilter === 'low_stock') matchStock = p.stock > 0 && p.stock <= 5;
      else if (stockFilter === 'in_stock') matchStock = p.stock > 5;

      return matchSearch && matchCat && matchStatus && matchStock;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: 'active' | 'suspended') => {
    if (selectedProductIds.length === 0) return;
    const actionLabel = newStatus === 'active' ? 'نشر وتفعيل' : 'إيقاف وتعليق';
    onRequestConfirmation({
      isOpen: true,
      title: `تطبيق [${actionLabel}] جماعي للمنتجات`,
      message: `هل أنت متأكد من تطبيق [${actionLabel}] على (${selectedProductIds.length}) منتج محدد؟`,
      severity: newStatus === 'suspended' ? 'warning' : 'info',
      requiredRole: ['admin', 'support'],
      onConfirm: async () => {
        for (const id of selectedProductIds) {
          const p = products.find(item => item.id === id);
          if (p) {
            onUpdateProductStatus(id, p.titleAr, newStatus);
          }
        }
        setSelectedProductIds([]);
        showToast(`تم تحديث حالة (${selectedProductIds.length}) منتج بنجاح`);
      }
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['المعرف', 'اسم المنتج', 'التصنيف', 'السعر (ج.م)', 'المخزون', 'الحالة', 'منتج مميز', 'توصيل فوري'];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.titleAr}"`,
      `"${p.category}"`,
      p.priceEGP,
      p.stock,
      p.status,
      p.isDesoqLocalMade ? 'نعم' : 'لا',
      p.isFastDesoqDelivery ? 'نعم' : 'لا'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `souq-desoq-catalog-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف كتالوج المنتجات بنجاح');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#800020]" />
              <span>إدارة كتالوج المنتجات والرقابة (Catalog & Moderation)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              إجمالي {products.length} سلعة معروضة. فحص الجودة، الأسعار، شارات التراث الدسوقي، ومخزون المتاجر.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير الكتالوج CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="ابحث باسم المنتج، الكود، أو الوصف..."
              className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#800020] dark:text-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع التصنيفات ({categories.length})</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">جميع حالات النشر</option>
              <option value="active">معتمد ومنشور (Active)</option>
              <option value="pending_moderation">قيد مراجعة الجودة (Pending)</option>
              <option value="suspended">موقوف إدارياً (Suspended)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full text-xs font-bold text-stone-700 dark:text-zinc-200 outline-none"
            >
              <option value="all">كل مستويات المخزون</option>
              <option value="in_stock">متوفر (&gt; 5)</option>
              <option value="low_stock">مخزون حرج (1-5)</option>
              <option value="out_of_stock">نفد المخزون (0)</option>
            </select>
          </div>

        </div>

      </div>

      {/* 2. Bulk Selection Ribbon */}
      {selectedProductIds.length > 0 && (
        <div className="bg-[#800020] text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono">{selectedProductIds.length}</span>
            <span>منتجات محددة حالياً</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleBulkStatusChange('active')}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-full font-bold cursor-pointer"
            >
              نشر واعتماد الكل
            </button>
            <button
              onClick={() => handleBulkStatusChange('suspended')}
              className="px-3 py-1 bg-red-800 hover:bg-red-900 rounded-full font-bold cursor-pointer"
            >
              تعليق وإيقاف الكل
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="px-2 text-stone-200 underline cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Products: Mobile / Tablet Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {paginatedProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 p-8 text-center text-xs text-stone-400">
            لا توجد منتجات تطابق معايير التصفية الحالية
          </div>
        ) : (
          paginatedProducts.map((p) => {
            const isSelected = selectedProductIds.includes(p.id);
            const seller = sellers.find(s => s.id === p.sellerId);

            return (
              <div 
                key={p.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border p-4 shadow-2xs space-y-3 transition-colors ${
                  isSelected ? 'border-[#800020] bg-red-50/20 dark:bg-red-950/20' : 'border-stone-200/80 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(p.id)}
                      className="mt-1 rounded text-[#800020] focus:ring-[#800020] cursor-pointer w-4 h-4"
                      aria-label={`تحديد ${p.titleAr}`}
                    />
                    <img 
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'} 
                      alt={p.titleAr}
                      className="w-12 h-12 object-cover rounded-xl border border-stone-200 dark:border-zinc-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="font-bold text-xs text-stone-900 dark:text-white line-clamp-2">{p.titleAr}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 flex-wrap">
                        <span className="bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-bold text-stone-600 dark:text-zinc-300">
                          {p.category}
                        </span>
                        <span>•</span>
                        <span>{seller?.name || p.sellerId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="font-mono font-bold text-sm text-[#800020] dark:text-[#D4AF37] block">
                      {p.priceEGP.toLocaleString()} ج.م
                    </span>
                    <span className={`text-[10px] font-bold block ${
                      p.stock === 0 ? 'text-red-700 dark:text-red-400' : p.stock <= 5 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'
                    }`}>
                      المخزون: {p.stock}
                    </span>
                  </div>
                </div>

                {/* Desoq Badges */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onToggleProductBadge(p.id, 'isDesoqLocalMade', !p.isDesoqLocalMade)}
                    className={`px-2.5 py-1 min-h-[36px] rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                      p.isDesoqLocalMade 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' 
                        : 'bg-stone-100 text-stone-400 border-stone-200 hover:text-stone-700'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>منتج مميز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleProductBadge(p.id, 'isFastDesoqDelivery', !p.isFastDesoqDelivery)}
                    className={`px-2.5 py-1 min-h-[36px] rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                      p.isFastDesoqDelivery 
                        ? 'bg-green-100 text-green-900 border-green-300 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800' 
                        : 'bg-stone-100 text-stone-400 border-stone-200 hover:text-stone-700'
                    }`}
                  >
                    <Truck className="w-3 h-3" />
                    <span>تسليم 24h</span>
                  </button>

                  <div className="mr-auto">
                    <button
                      type="button"
                      onClick={() => setInspectingProduct(p)}
                      className="p-2 min-w-[36px] min-h-[36px] rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
                      title="معاينة وفحص المنتج"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Moderation Status Dropdown */}
                <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-stone-500">حالة الرقابة:</span>
                  <select
                    value={p.status}
                    onChange={(e) => onUpdateProductStatus(p.id, p.titleAr, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer outline-none min-h-[38px] ${
                      p.status === 'active'
                        ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/60 dark:text-green-300'
                        : p.status === 'suspended'
                        ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    <option value="active">معتمد ومنشور (Active)</option>
                    <option value="pending_moderation">مراجعة الجودة (Pending)</option>
                    <option value="suspended">موقوف إدارياً (Suspended)</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Main Products Table: Desktop (hidden md:block) */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-zinc-800/80 border-b border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 font-bold">
                <th className="p-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                  />
                </th>
                <th className="p-3.5">المنتج والتصنيف</th>
                <th className="p-3.5">السعر والمخزون</th>
                <th className="p-3.5">شارات الهوية الدسوقية</th>
                <th className="p-3.5">حالة النشر والاعتماد</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    لا توجد منتجات تطابق معايير التصفية الحالية
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const seller = sellers.find(s => s.id === p.sellerId);

                  return (
                    <tr 
                      key={p.id}
                      className={`hover:bg-stone-50/70 dark:hover:bg-zinc-800/50 transition-colors ${
                        isSelected ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded text-[#800020] focus:ring-[#800020] cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'} 
                            alt={p.titleAr}
                            className="w-10 h-10 object-cover rounded-xl border border-stone-200 dark:border-zinc-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5">
                            <p className="font-bold text-stone-900 dark:text-white line-clamp-1">{p.titleAr}</p>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400">
                              <span className="bg-stone-100 dark:bg-zinc-800 px-2 py-0.2 rounded font-bold text-stone-600 dark:text-zinc-300">
                                {p.category}
                              </span>
                              <span>المتجر: {seller?.name || p.sellerId}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-stone-900 dark:text-white">
                            {p.priceEGP.toLocaleString()} <span className="text-[10px] text-stone-400">ج.م</span>
                          </p>
                          <p className={`text-[10px] font-bold ${
                            p.stock === 0 ? 'text-red-700 dark:text-red-400' : p.stock <= 5 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'
                          }`}>
                            المتبقي: {p.stock} قطعة {p.stock === 0 && '(نفد المخزون)'}
                          </p>
                        </div>
                      </td>

                      {/* Desoq Badges toggles */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onToggleProductBadge(p.id, 'isDesoqLocalMade', !!p.isDesoqLocalMade)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                              p.isDesoqLocalMade 
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' 
                                : 'bg-stone-100 text-stone-400 border-stone-200 hover:text-stone-700'
                            }`}
                            title="تبديل شارة المنتج المميز"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>منتج مميز</span>
                          </button>

                          <button
                            onClick={() => onToggleProductBadge(p.id, 'isFastDesoqDelivery', !!p.isFastDesoqDelivery)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                              p.isFastDesoqDelivery 
                                ? 'bg-green-100 text-green-900 border-green-300 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800' 
                                : 'bg-stone-100 text-stone-400 border-stone-200 hover:text-stone-700'
                            }`}
                            title="تبديل شارة توصيل فوري خلال 24 ساعة"
                          >
                            <Truck className="w-2.5 h-2.5" />
                            <span>تسليم فوري 24h</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <select
                          value={p.status}
                          onChange={(e) => onUpdateProductStatus(p.id, p.titleAr, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer outline-none ${
                            p.status === 'active' 
                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/60 dark:text-green-300' 
                              : p.status === 'suspended' 
                              ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300' 
                              : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          <option value="active">معتمد ومنشور (Active)</option>
                          <option value="pending_moderation">قيد المراجعة (Pending)</option>
                          <option value="suspended">موقوف إدارياً (Suspended)</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setInspectingProduct(p)}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 transition-all cursor-pointer"
                            title="معاينة تفاصيل المنتج"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id, p.titleAr)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 transition-all cursor-pointer"
                            title="حذف المنتج نهائياً"
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

        {/* Pagination */}
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
            <span>من أصل {filteredProducts.length} منتج</span>
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

      {/* 4. Product Quick Inspector Modal */}
      {inspectingProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-lg w-full rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-4 text-right animate-in fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  بطاقة المنتج والرقابة الفنية
                </h3>
                <span className="text-[10px] text-stone-400 font-mono">ID: {inspectingProduct.id}</span>
              </div>
              <button
                onClick={() => setInspectingProduct(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs divide-y divide-stone-100 dark:divide-zinc-800">
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">اسم المنتج (عربي):</span>
                <strong className="text-stone-900 dark:text-white">{inspectingProduct.titleAr}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">التصنيف:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingProduct.category}</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">السعر:</span>
                <strong className="font-mono text-[#800020] text-sm">{inspectingProduct.priceEGP} ج.م</strong>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-stone-500">المخزون المتاح:</span>
                <strong className="text-stone-900 dark:text-white">{inspectingProduct.stock} وحدة</strong>
              </div>
              <div className="pt-2 flex flex-col gap-1">
                <span className="text-stone-500">الوصف التجاري:</span>
                <p className="text-stone-700 dark:text-zinc-300 leading-relaxed bg-stone-50 dark:bg-zinc-800 p-3 rounded-xl">
                  {inspectingProduct.descriptionAr}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setInspectingProduct(null)}
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
