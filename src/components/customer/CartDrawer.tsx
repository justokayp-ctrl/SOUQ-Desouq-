import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Store, 
  ShoppingBag, 
  Truck, 
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BadgeCheck
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { FocusTrap } from '../common/FocusTrap';

export const CartDrawer: React.FC<{ onProceedToCheckout: () => void }> = ({ onProceedToCheckout }) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartGroupedBySeller, 
    cartSubtotalEGP, 
    cartTotalShippingEGP, 
    cartGrandTotalEGP, 
    cartTotalCount,
    openSellerProfile
  } = useMarketplace();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 1000;
  const isFreeDeliveryQualified = cartSubtotalEGP >= freeDeliveryThreshold;
  const deliveryProgressPercent = Math.min(100, Math.round((cartSubtotalEGP / freeDeliveryThreshold) * 100));

  return (
    <FocusTrap
      isActive={isCartOpen}
      onClose={() => {
        setConfirmClearOpen(false);
        setIsCartOpen(false);
      }}
      aria-label="سلة التسوق الموحدة"
      id="cart-drawer-overlay" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div 
        className="w-full max-w-md sm:max-w-lg bg-[#FDFBF7] dark:bg-zinc-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-r border-[#800020]/10 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-b border-[#800020]/10 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#800020] dark:bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[#D4AF37]/30">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#800020] dark:text-[#D4AF37]">
                سلة سوق دسوق الموحدة
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 font-medium">
                {cartTotalCount > 0 
                  ? `${cartTotalCount} قطعة من ${cartGroupedBySeller.length} متاجر مستقلة` 
                  : 'سلة المشتريات فارغة'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmClearOpen(false);
              setIsCartOpen(false);
            }}
            className="p-2 min-w-[44px] min-h-[44px] rounded-full border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 flex items-center justify-center text-stone-600 dark:text-zinc-300 hover:text-[#800020] dark:hover:text-[#D4AF37] hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            aria-label="إغلاق سلة التسوق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Local Delivery Goal Progress */}
        {cart.length > 0 && (
          <div className="mx-4 mt-3 p-3.5 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs space-y-2 shrink-0 shadow-xs">
            <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {isFreeDeliveryQualified ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    تهانينا! طلبيتك مؤهلة للتوصيل السريع المخفض/المجاني داخل دسوق
                  </span>
                ) : (
                  <span>
                    أضف بقيمة <strong className="underline decoration-emerald-500 font-black text-emerald-800 dark:text-emerald-300">{freeDeliveryThreshold - cartSubtotalEGP} ج.م</strong> إضافية للتوصيل المجاني
                  </span>
                )}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                {deliveryProgressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-200/70 dark:bg-emerald-900/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${deliveryProgressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Multi-Vendor Marketplace Notice */}
        {cart.length > 0 && (
          <div className="bg-[#FAF7F2] dark:bg-zinc-800/90 p-3 mx-4 mt-2 rounded-2xl border border-[#800020]/10 dark:border-zinc-700 text-xs text-stone-700 dark:text-zinc-300 flex items-start gap-2.5 shrink-0">
            <Store className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-stone-900 dark:text-zinc-100 block">
                تجميع طرود متعدد التجار:
              </span>
              <p className="text-[11px] text-stone-600 dark:text-zinc-400 leading-relaxed">
                مشترياتك مقسمة حسب متاجر دسوق المعتمدة لضمان فحص وتغليف كل طرد من مقره فوراً.
              </p>
            </div>
          </div>
        )}

        {/* Cart Items Grouped by Seller */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-5">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center mx-auto text-4xl shadow-inner border border-stone-200 dark:border-zinc-700">
                🛍️
              </div>
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-zinc-100">
                  سلة التسوق فارغة حالياً
                </h4>
                <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  تصفح تشكيلة سوق دسوق من العبايات والفساتين، العطور والمسك الأصلي، الإكسسوارات والمجوهرات، والمنتجات الحرفية الأصيلة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="bg-[#800020] hover:bg-[#600018] text-white px-7 py-3 min-h-[44px] rounded-full font-bold text-xs shadow-md transition-all hover:shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <span>تصفح سوق دسوق الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            cartGroupedBySeller.map((group, gIdx) => {
              const sellerName = group.seller?.name || 'متجر معتمد';
              const sellerCity = group.seller?.city || 'دسوق';

              return (
                <div 
                  key={group.seller?.id || `seller-group-${gIdx}`}
                  className="bg-white dark:bg-zinc-800/90 rounded-2xl border border-stone-200 dark:border-zinc-700 overflow-hidden shadow-xs space-y-1"
                >
                  {/* Seller Group Header */}
                  <div className="p-3 bg-[#FAF7F2] dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700 flex items-center justify-between">
                    <div 
                      onClick={() => {
                        if (group.seller?.id) {
                          setIsCartOpen(false);
                          openSellerProfile(group.seller.id);
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#800020] dark:hover:text-[#D4AF37] transition-colors"
                      title={`زيارة متجر ${sellerName}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-2 ring-[#D4AF37]/30"></span>
                      <span className="font-bold text-xs text-[#800020] dark:text-[#D4AF37] hover:underline flex items-center gap-1">
                        {sellerName}
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 inline" />
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400">({sellerCity})</span>
                    </div>
                    <span className="text-[11px] text-stone-600 dark:text-zinc-300 font-semibold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-stone-200 dark:border-zinc-700">
                      شحن: {group.shippingFeeEGP} ج.م
                    </span>
                  </div>

                  {/* Items in this sub-order */}
                  <div className="divide-y divide-stone-100 dark:divide-zinc-700/80 p-2">
                    {group.items.map((item, itIdx) => {
                      const itemPrice = item.selectedVariant ? item.selectedVariant.priceEGP : item.product?.priceEGP || 0;
                      const itemImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
                      const itemTitle = item.product?.titleAr || 'منتج من سوق دسوق';

                      return (
                        <div 
                          key={`${item.product?.id || 'prod'}-${item.selectedVariant?.id || 'base'}-${itIdx}`} 
                          className="p-2.5 flex items-center gap-3 hover:bg-stone-50/50 dark:hover:bg-zinc-800/40 rounded-xl transition-colors"
                        >
                          <img 
                            src={itemImage} 
                            alt={itemTitle} 
                            className="w-14 h-14 object-cover rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-900 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-stone-900 dark:text-zinc-100 truncate">
                              {itemTitle}
                            </h5>
                            {item.selectedVariant && (
                              <span className="text-[10px] text-stone-500 dark:text-zinc-400 block truncate font-medium">
                                المقاس / اللون: {item.selectedVariant.name}
                              </span>
                            )}
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-xs font-serif font-black text-[#800020] dark:text-[#E5C158]">
                                {itemPrice} ج.م
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">
                                  ({itemPrice * item.quantity} ج.م)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls (Clean Touch Pills with Ergonomic Targets) */}
                          <div className="flex items-center gap-1.5 bg-[#F5F2ED] dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedVariant?.id)}
                              aria-label={`إنقاص كمية ${itemTitle}`}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 dark:text-zinc-200 hover:text-[#800020] dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 transition-colors cursor-pointer active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold w-6 text-center text-stone-900 dark:text-zinc-100 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedVariant?.id)}
                              aria-label={`زيادة كمية ${itemTitle}`}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 dark:text-zinc-200 hover:text-[#800020] dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 transition-colors cursor-pointer active:scale-90"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                            aria-label={`حذف ${itemTitle} من السلة`}
                            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-stone-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer active:scale-90"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub-order Subtotal Footer */}
                  <div className="bg-[#FAF7F2] dark:bg-zinc-800 px-4 py-2 border-t border-stone-200 dark:border-zinc-700 flex items-center justify-between text-xs text-stone-600 dark:text-zinc-400">
                    <span>إجمالي منتجات {sellerName}:</span>
                    <span className="font-bold text-stone-900 dark:text-zinc-100">{group.subtotalEGP} ج.م</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Drawer Bottom Checkout Summary with Safe-Area */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-stone-200 dark:border-zinc-800 space-y-3.5 shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-xl">
            
            {/* Clear Cart Confirmation Banner */}
            {confirmClearOpen ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-2 text-xs text-red-900 dark:text-red-200 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>هل أنت متأكد من تفريغ سلة التسوق بالكامل؟</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    تراجع
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await clearCart();
                      setConfirmClearOpen(false);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-[11px] hover:bg-red-700 cursor-pointer"
                  >
                    نعم، تفريغ السلة
                  </button>
                </div>
              </div>
            ) : null}

            {/* Financial breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>إجمالي المنتجات ({cartTotalCount} قطعة):</span>
                <span className="font-bold text-stone-900 dark:text-zinc-100 font-mono">{cartSubtotalEGP} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
                  مصاريف الشحن ({cartGroupedBySeller.length} شحنات للتجار):
                </span>
                <span className="font-bold text-stone-900 dark:text-zinc-100 font-mono">{cartTotalShippingEGP} ج.م</span>
              </div>
              <div className="flex items-center justify-between text-sm font-serif font-bold pt-2 border-t border-stone-200 dark:border-zinc-800">
                <span className="text-base text-stone-900 dark:text-zinc-100">المجموع الكلي المطلوب:</span>
                <span className="text-xl font-black font-mono text-[#800020] dark:text-[#F3BA2F]">{cartGrandTotalEGP} ج.م</span>
              </div>
            </div>

            {/* Courier Express Local Badge */}
            <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2 text-[11px] text-amber-900 dark:text-amber-200 font-bold">
              <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>توصيل سريع مع كابتن دسوق Express • معاينة وقياس قبل السداد</span>
            </div>

            {/* Guarantees pill */}
            <div className="bg-[#FAF7F2] dark:bg-zinc-800/90 p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-[11px] text-stone-700 dark:text-zinc-300 space-y-1 text-center font-medium">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>حق المعاينة الكاملة عند الاستلام • استرجاع واستبدال 14 يوماً</span>
              </p>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400">
                دفع كاش أو إنستاباي / فودافون كاش عند استلام طردك من مندوب الشحن
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              id="proceed-checkout-btn"
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3.5 min-h-[48px] rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-[#D4AF37]/30"
            >
              <span>متابعة الشراء وتحديد العنوان والدفع</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Clear Cart Trigger */}
            {!confirmClearOpen && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="w-full text-center text-xs text-stone-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors py-1 cursor-pointer min-h-[32px] flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إفراغ سلة التسوق</span>
              </button>
            )}
          </div>
        )}
      </div>
    </FocusTrap>
  );
};

