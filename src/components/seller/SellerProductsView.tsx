import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Boxes, 
  Trash2, 
  Check, 
  Filter, 
  Eye, 
  Copy, 
  ArrowUpDown, 
  ShieldCheck, 
  Tag, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Download,
  AlertCircle,
  ExternalLink,
  Play,
  Pause,
  Archive,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Product, ProductCategory, Seller } from '../../types';

interface SellerProductsViewProps {
  products: Product[];
  categories: ProductCategory[];
  seller: Seller;
  onOpenWizard: (prod?: Product | null) => void;
  onOpenStockModal: (prod: Product) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (id: string) => Promise<boolean>;
  onDuplicateProduct?: (id: string) => Promise<Product | null>;
  onSetProductStatus?: (id: string, status: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SellerProductsView: React.FC<SellerProductsViewProps> = ({
  products,
  categories,
  seller,
  onOpenWizard,
  onOpenStockModal,
  onUpdateProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onSetProductStatus,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'desoq_local'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'inactive' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'price_asc' | 'price_desc' | 'stock_asc' | 'newest'>('newest');

  // Multi-selection state for batch actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkActionMenuOpen, setIsBulkActionMenuOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = 
        p.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.attributes?.brand && p.attributes.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;

      let matchStock = true;
      if (stockFilter === 'in_stock') matchStock = p.stock > 0;
      if (stockFilter === 'low_stock') matchStock = p.stock > 0 && p.stock < 10;
      if (stockFilter === 'out_of_stock') matchStock = p.stock === 0;
      if (stockFilter === 'desoq_local') matchStock = !!p.isDesoqLocalMade;

      let matchStatus = true;
      if (statusFilter !== 'all') {
        matchStatus = p.status === statusFilter;
      }

      return matchSearch && matchCat && matchStock && matchStatus;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceEGP - b.priceEGP;
      if (sortBy === 'price_desc') return b.priceEGP - a.priceEGP;
      if (sortBy === 'stock_asc') return a.stock - b.stock;
      if (sortBy === 'title') return a.titleAr.localeCompare(b.titleAr, 'ar');
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [products, searchQuery, categoryFilter, stockFilter, statusFilter, sortBy]);

  // Handle select all toggle
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProductIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk operations
  const handleBulkStatusChange = (newStatus: 'active' | 'inactive' | 'suspended') => {
    selectedProductIds.forEach((id) => {
      if (onSetProductStatus) {
        onSetProductStatus(id, newStatus);
      } else {
        onUpdateProduct(id, { status: newStatus });
      }
    });
    onShowToast(`تم تحديث حالة ${selectedProductIds.length} منتج بنجاح`);
    setSelectedProductIds([]);
    setIsBulkActionMenuOpen(false);
  };

  const handleDuplicate = async (prod: Product) => {
    if (onDuplicateProduct) {
      await onDuplicateProduct(prod.id);
    } else {
      onOpenWizard({
        ...prod,
        id: '',
        titleAr: `${prod.titleAr} (نسخة جديدة)`,
        titleEn: prod.titleEn ? `${prod.titleEn} (Copy)` : '',
        status: 'draft',
      });
    }
  };

  const handleSetStatus = (prod: Product, newStatus: string) => {
    if (onSetProductStatus) {
      onSetProductStatus(prod.id, newStatus);
    } else {
      onUpdateProduct(prod.id, { status: newStatus as any });
      onShowToast(`تم تعديل حالة "${prod.titleAr}" إلى ${newStatus}`);
    }
  };

  const handleDelete = async (prod: Product) => {
    if (onDeleteProduct) {
      const success = await onDeleteProduct(prod.id);
      if (success) {
        setDeleteConfirmId(null);
      }
    } else {
      onUpdateProduct(prod.id, { status: 'suspended' });
      onShowToast(`تم حذف وأرشفة المنتج "${prod.titleAr}"`);
      setDeleteConfirmId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,TitleAr,Category,PriceEGP,Stock,Status,DesoqLocal\n';
    const rows = filteredProducts
      .map(
        (p) =>
          `"${p.id}","${p.titleAr.replace(/"/g, '""')}","${p.category}",${p.priceEGP},${p.stock},"${p.status}",${p.isDesoqLocalMade ? 'Yes' : 'No'}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `souq-desoq-products-${seller.id}.csv`);
    document.body.appendChild(link);
    link.click();
    onShowToast('تم تنزيل ملف بيانات المنتجات بصيغة CSV');
  };

  return (
    <div id="seller-products-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. HEADER & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-zinc-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#800020] dark:text-[#D4AF37]" />
            <span>إدارة كتالوج المنتجات ({products.length} منتج)</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            إضافة، تعديل، استنساخ، نشر، إيقاف، وحذف المنتجات وفق الصلاحيات المحددة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenWizard(null)}
            className="flex items-center gap-1.5 bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer"
            id="seller-add-product-btn"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH CONTROL BAR */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الكود أو الماركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-xs text-[#1A1A1A] dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#800020]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-xs text-[#1A1A1A] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020] cursor-pointer"
          >
            <option value="all">جميع الأقسام والتصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-xs text-[#1A1A1A] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020] cursor-pointer"
          >
            <option value="all">حالة المخزون (الكل)</option>
            <option value="in_stock">متوفر في المستودع</option>
            <option value="low_stock">مخزون منخفض (&lt; 10)</option>
            <option value="out_of_stock">نفد من المخزن (0)</option>
            <option value="desoq_local">صنع في دسوق فقط</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#F5F2ED] dark:bg-zinc-700 rounded-xl text-xs text-[#1A1A1A] dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#800020] cursor-pointer"
          >
            <option value="all">حالة النشر (الكل)</option>
            <option value="active">نشط ومنشور للبيع</option>
            <option value="draft">مسودة غير منشورة</option>
            <option value="inactive">موقوف مؤقتاً</option>
            <option value="suspended">مؤرشف ومحجوب</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedProductIds.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
              تم تحديد {selectedProductIds.length} منتج للعمليات المجمعة
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('active')}
                className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                نشر للبيع (Active)
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('inactive')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                إيقاف مؤقت (Pause)
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('suspended')}
                className="bg-gray-700 hover:bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                أرشفة (Archive)
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductIds([])}
                className="text-xs text-gray-500 hover:underline px-2 cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. PRODUCTS DATA CARDS (Mobile / Tablet - md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 text-center text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 text-xs">
            لا توجد منتجات تطابق شروط البحث أو الفلاتر المحددة.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const isSelected = selectedProductIds.includes(prod.id);
            const isConfirmingDelete = deleteConfirmId === prod.id;

            return (
              <div 
                key={prod.id}
                className={`bg-white dark:bg-zinc-800 rounded-2xl border p-4 shadow-xs transition-all space-y-3 ${
                  isSelected ? 'border-[#D4AF37] bg-amber-50/30 dark:bg-amber-950/20' : 'border-gray-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(prod.id)}
                      className="mt-1 rounded border-gray-300 text-[#800020] focus:ring-[#800020] cursor-pointer w-4 h-4"
                      aria-label={`تحديد ${prod.titleAr}`}
                    />
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=120'}
                      alt={prod.titleAr}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-zinc-700 shrink-0 bg-gray-50"
                      loading="lazy"
                    />
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-[#1A1A1A] dark:text-zinc-100 line-clamp-2 leading-tight">
                        {prod.titleAr}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="font-mono">SKU: {prod.id}</span>
                        <span>•</span>
                        <span>{categories.find((c) => c.id === prod.category)?.nameAr || prod.category}</span>
                      </div>
                      {prod.isDesoqLocalMade && (
                        <span className="inline-block text-[9px] bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                          صنع في دسوق
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="font-serif font-bold text-sm text-[#800020] dark:text-[#D4AF37] block">
                      {prod.priceEGP} ج.م
                    </span>
                    {prod.originalPriceEGP && prod.originalPriceEGP > prod.priceEGP && (
                      <span className="text-[10px] text-gray-400 line-through block">
                        {prod.originalPriceEGP} ج.م
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-700/60 text-xs">
                  {/* Stock button */}
                  <button
                    type="button"
                    onClick={() => onOpenStockModal(prod)}
                    className={`font-bold px-3 py-1.5 min-h-[40px] rounded-xl border text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                      prod.stock === 0
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
                        : prod.stock < 10
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>{prod.stock} قطع</span>
                  </button>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    prod.status === 'active' || !prod.status
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                      : prod.status === 'draft'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : prod.status === 'inactive'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}>
                    {prod.status === 'active' || !prod.status
                      ? 'نشط ومنشور'
                      : prod.status === 'draft'
                      ? 'مسودة'
                      : prod.status === 'inactive'
                      ? 'موقوف مؤقتاً'
                      : 'مؤرشف'}
                  </span>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-700/60">
                  {isConfirmingDelete ? (
                    <div className="flex items-center justify-end gap-2 w-full animate-in fade-in">
                      <span className="text-xs text-red-600 font-bold">تأكيد حذف المنتج؟</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(prod)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[40px]"
                      >
                        نعم احذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[40px]"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenWizard(prod)}
                          className="px-3 py-1.5 min-h-[40px] rounded-xl bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 hover:bg-gray-200 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>تعديل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(prod)}
                          className="p-2 min-w-[40px] min-h-[40px] rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
                          title="استنساخ كمسودة"
                        >
                          <Copy className="w-3.5 h-3.5 text-purple-600" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {prod.status === 'active' || !prod.status ? (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(prod, 'inactive')}
                            className="px-3 py-1.5 min-h-[40px] rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5"
                          >
                            <Pause className="w-3.5 h-3.5" />
                            <span>إيقاف</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(prod, 'active')}
                            className="px-3 py-1.5 min-h-[40px] rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-bold flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>نشر</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(prod.id)}
                          className="p-2 min-w-[40px] min-h-[40px] rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. PRODUCTS DATA TABLE (Desktop - hidden md:block) */}
      <div className="hidden md:block bg-white dark:bg-zinc-800 rounded-3xl border border-[#800020]/10 dark:border-zinc-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#F5F2ED]/60 dark:bg-zinc-900/60 border-b border-gray-100 dark:border-zinc-700 text-xs font-bold text-gray-500 dark:text-zinc-400">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-gray-300 text-[#800020] focus:ring-[#800020] cursor-pointer"
                  />
                </th>
                <th className="p-4">المنتج</th>
                <th className="p-4">القسم</th>
                <th className="p-4">السعر</th>
                <th className="p-4">المخزون</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-zinc-400">
                    لا توجد منتجات تطابق شروط البحث أو الفلاتر المحددة.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  const isConfirmingDelete = deleteConfirmId === prod.id;

                  return (
                    <tr 
                      key={prod.id}
                      className={`hover:bg-[#F5F2ED]/30 dark:hover:bg-zinc-700/30 transition-colors ${
                        isSelected ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(prod.id)}
                          className="rounded border-gray-300 text-[#800020] focus:ring-[#800020] cursor-pointer"
                        />
                      </td>

                      {/* Product Info & Thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=120'}
                            alt={prod.titleAr}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-zinc-700 shrink-0 bg-gray-50"
                            loading="lazy"
                          />
                          <div className="space-y-0.5 max-w-xs sm:max-w-sm">
                            <div className="font-bold text-[#1A1A1A] dark:text-zinc-100 line-clamp-1">
                              {prod.titleAr}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              SKU: {prod.id}
                            </div>
                            {prod.isDesoqLocalMade && (
                              <span className="inline-block text-[9px] bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                                صنع في دسوق
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-gray-600 dark:text-zinc-300">
                        {categories.find((c) => c.id === prod.category)?.nameAr || prod.category}
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <span className="font-serif font-bold text-[#800020] dark:text-[#D4AF37]">
                          {prod.priceEGP} ج.م
                        </span>
                        {prod.originalPriceEGP && prod.originalPriceEGP > prod.priceEGP && (
                          <span className="block text-[10px] text-gray-400 line-through">
                            {prod.originalPriceEGP} ج.م
                          </span>
                        )}
                      </td>

                      {/* Stock with 1-click Modal */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => onOpenStockModal(prod)}
                          className={`font-bold px-2 py-1 rounded-lg border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                            prod.stock === 0
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
                              : prod.stock < 10
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300'
                          }`}
                          title="انقر لتعديل المخزون مباشرة"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>{prod.stock} قطع</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          prod.status === 'active' || !prod.status
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : prod.status === 'draft'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : prod.status === 'inactive'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}>
                          {prod.status === 'active' || !prod.status
                            ? 'نشط ومنشور'
                            : prod.status === 'draft'
                            ? 'مسودة'
                            : prod.status === 'inactive'
                            ? 'موقوف مؤقتاً'
                            : 'مؤرشف'}
                        </span>
                      </td>

                      {/* Direct Operational Actions */}
                      <td className="p-4">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-center gap-1.5 animate-in fade-in">
                            <span className="text-[10px] text-red-600 font-bold">تأكيد الحذف؟</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(prod)}
                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              نعم احذف
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* 1. Edit */}
                            <button
                              type="button"
                              onClick={() => onOpenWizard(prod)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer"
                              title="تعديل المنتج"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            </button>

                            {/* 2. Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicate(prod)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer"
                              title="استنساخ كمسودة جديدة"
                            >
                              <Copy className="w-3.5 h-3.5 text-purple-600" />
                            </button>

                            {/* 3. Publish / Pause Toggle */}
                            {prod.status === 'active' || !prod.status ? (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(prod, 'inactive')}
                                className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-600 transition-colors cursor-pointer"
                                title="إيقاف مؤقت (Pause)"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(prod, 'active')}
                                className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950 text-green-600 transition-colors cursor-pointer"
                                title="نشر للبيع (Publish)"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 4. Archive Toggle */}
                            {prod.status !== 'suspended' && (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(prod, 'suspended')}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 transition-colors cursor-pointer"
                                title="أرشفة (Archive)"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 5. Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(prod.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 transition-colors cursor-pointer"
                              title="حذف المنتج نهائياً وفق الصلاحيات"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
