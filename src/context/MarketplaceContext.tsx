import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Role, 
  ShoppingUniverse,
  DepartmentRealmId,
  Product, 
  Seller, 
  ProductCategory, 
  CartItem, 
  MarketplaceOrder, 
  EgyptianAddress, 
  PaymentMethod, 
  OrderStatus, 
  Dispute,
  ProductVariant,
  AuthUser,
  AdminCoupon,
  AdminAnnouncement,
  HeroSlide
} from '../types';
import { CATEGORIES } from '../data/mockData';
import { api, getAuthToken, setRoleOverride, setActiveSellerHeader, onSessionExpired } from '../services/api';
import { translations, Language } from '../i18n/translations';
import { 
  clientEventBus, 
  ClientEventBus, 
  MarketplaceEventType, 
  OrderStatusUpdatedPayload, 
  OrderCreatedPayload, 
  OrderRefundedPayload 
} from '../events/eventBus';

export type ThemeMode = 'light' | 'dark' | 'system';

interface MarketplaceContextType {
  // Real-Time Event Bus & Live Cross-Persona Synchronization
  eventBus: ClientEventBus;
  publishEvent: <T = any>(event: MarketplaceEventType, payload: T) => void;
  subscribeToEvent: <T = any>(event: MarketplaceEventType, callback: (data: T) => void) => () => void;
  realtimeConnected: boolean;
  lastRealtimeEvent: { event: string; payload: any; timestamp: string } | null;

  // i18n & Theme State
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  t: (key: keyof typeof translations['ar']) => string;

  // Authoritative Authentication & RBAC (Server-Enforced)
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: Role;
  setRole: (role: Role) => void;
  login: (identifier: string, password?: string, destination?: string) => Promise<{ success: boolean; requireVerification?: boolean; email?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  register: (data: { email: string; password: string; fullName: string; phone: string; role?: Role; sellerId?: string }) => Promise<{
    success: boolean;
    requireVerification?: boolean;
    email?: string;
    devVerificationCode?: string;
    message?: string;
    error?: string;
  }>;
  registerSeller: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    storeName: string;
    tradeName?: string;
    ownerName?: string;
    desoqDistrict?: string;
    businessCategory?: string;
    commercialRecordNumber?: string;
    taxRegistrationNumber?: string;
    nationalIdNumber?: string;
  }) => Promise<{
    success: boolean;
    requireVerification?: boolean;
    email?: string;
    devVerificationCode?: string;
    message?: string;
    error?: string;
  }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; message?: string; error?: string; devVerificationCode?: string; remainingSeconds?: number }>;
  changeVerificationEmail: (currentEmail: string, newEmail: string) => Promise<{ success: boolean; email?: string; message?: string; error?: string; devVerificationCode?: string }>;
  socialLogin: (data: {
    provider: 'google' | 'apple';
    email: string;
    fullName?: string;
    avatarUrl?: string;
    idToken?: string;
  }) => Promise<boolean>;
  switchPersona: (role: Role, customEmail?: string) => Promise<boolean>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'login' | 'register' | 'register_seller';
  setAuthModalInitialTab: (tab: 'login' | 'register' | 'register_seller') => void;
  sessionExpiredNotice: string | null;
  clearSessionExpiredNotice: () => void;
  pendingDestination: string | null;
  setPendingDestination: (dest: string | null) => void;

  activeView: string;
  setActiveView: (view: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  
  // Catalog & Search
  products: Product[];
  sellers: Seller[];
  categories: ProductCategory[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;
  selectedUniverse: ShoppingUniverse;
  setSelectedUniverse: (u: ShoppingUniverse) => void;
  activeRealm: DepartmentRealmId | null;
  setActiveRealm: (realm: DepartmentRealmId | null) => void;
  openDepartmentRealm: (realm: DepartmentRealmId) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  onlyDesoqLocal: boolean;
  setOnlyDesoqLocal: (val: boolean) => void;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  setSortBy: (sort: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest') => void;
  rateProduct: (productId: string, rating: number) => Promise<void>;
  userRatings: Record<string, number>;

  // Comparison & Wishlist (Non-authoritative client UI states)
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Server-Authoritative Cart & Multi-Vendor Checkout
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotalCount: number;
  cartSubtotalEGP: number;
  cartTotalShippingEGP: number;
  cartGrandTotalEGP: number;
  cartGroupedBySeller: {
    seller: Seller;
    items: CartItem[];
    subtotalEGP: number;
    shippingFeeEGP: number;
  }[];

  // Orders
  orders: MarketplaceOrder[];
  activeOrder: MarketplaceOrder | null;
  setActiveOrder: (order: MarketplaceOrder | null) => void;
  placeOrder: (
    shippingAddress: EgyptianAddress, 
    paymentMethod: PaymentMethod,
    options?: { idempotencyKey?: string; discountCode?: string }
  ) => Promise<MarketplaceOrder | null>;
  createDirectOrder: (params: {
    customerName: string;
    customerPhone: string;
    shippingAddress: EgyptianAddress;
    paymentMethod: PaymentMethod;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    discountCode?: string;
  }) => Promise<MarketplaceOrder | null>;
  updateSubOrderStatus: (
    orderId: string, 
    subOrderId: string, 
    status: OrderStatus, 
    noteAr: string
  ) => Promise<void>;
  updateOverallOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<{ success: boolean; order?: MarketplaceOrder }>;
  refundSubOrder: (
    orderId: string,
    subOrderId: string,
    reason: string,
    amountEGP?: number
  ) => Promise<void>;

  // Seller Management
  activeSellerId: string;
  setActiveSellerId: (id: string) => void;
  activeSeller: Seller | undefined;
  selectedSellerProfileId: string | null;
  setSelectedSellerProfileId: (id: string | null) => void;
  openSellerProfile: (sellerId?: string) => void;
  createSeller: (sellerData: any) => Promise<Seller>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<boolean>;
  duplicateProduct: (productId: string) => Promise<Product | null>;
  setProductStatus: (productId: string, status: string) => Promise<void>;
  updateSeller: (sellerId: string, updates: Partial<Seller>) => Promise<void>;
  requestSellerPayout: (sellerId: string, amount: number, method: string) => Promise<void>;

  // Admin & Moderation
  updateSellerStatus: (sellerId: string, status: 'active' | 'suspended' | 'under_review') => Promise<void>;
  verifySeller: (sellerId: string, status: 'verified' | 'rejected') => Promise<void>;
  moderateProduct: (productId: string, status: 'active' | 'suspended') => Promise<void>;
  updateSellerCommission: (sellerId: string, rate: number) => Promise<void>;

  // Announcements, Hero Banners & Coupons
  announcements: AdminAnnouncement[];
  heroSlides: HeroSlide[];
  coupons: AdminCoupon[];
  createAnnouncement: (data: any) => Promise<void>;
  updateAnnouncement: (id: string, data: any) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  createHeroSlide: (data: any) => Promise<void>;
  deleteHeroSlide: (id: string | number) => Promise<void>;
  createCoupon: (data: any) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Disputes & Support
  disputes: Dispute[];
  createDispute: (
    orderId: string, 
    subOrderId: string, 
    reason: Dispute['reason'], 
    description: string, 
    requestedResolution: Dispute['requestedResolution']
  ) => Promise<Dispute | null>;
  replyToDispute: (disputeId: string, message: string, sender: 'customer' | 'seller' | 'admin' | 'support') => Promise<void>;
  resolveDispute: (disputeId: string, status: 'resolved' | 'rejected' | 'resolved_refunded', resolutionText?: string) => Promise<void>;
  addDisputeNote: (disputeId: string, note: string) => Promise<void>;
  updateDisputeStatus: (disputeId: string, status: string, priority?: string) => Promise<void>;
  getTicketContext: (disputeId: string) => Promise<any>;

  // Portal Sub-Tab State Management
  sellerActiveTab: string;
  setSellerActiveTab: (tab: string) => void;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  supportActiveTab: string;
  setSupportActiveTab: (tab: string) => void;
  courierActiveTab: string;
  setCourierActiveTab: (tab: string) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string, type?: string) => void;
  authToken: string | null;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language & Theme State
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('souq_desoq_lang');
      return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('souq_desoq_theme');
      return (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('souq_desoq_lang', newLang);
    } catch {
      // safe fallback
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('souq_desoq_theme', newTheme);
    } catch {
      // safe fallback
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else if (theme === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const t = useCallback((key: keyof typeof translations['ar']): string => {
    const langDict = translations[lang] || translations.ar;
    return langDict[key] || translations.ar[key] || key;
  }, [lang]);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register' | 'register_seller'>('login');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const role: Role = user?.role || 'customer';
  const isAuthenticated = Boolean(user);

  const clearSessionExpiredNotice = useCallback(() => {
    setSessionExpiredNotice(null);
  }, []);

  const [activeView, setActiveView] = useState<string>('catalog');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Authoritative Business Data State (Loaded directly from Backend API)
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories] = useState<ProductCategory[]>(CATEGORIES);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);

  // Filters & Search (Client-side view state)
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('souq_desoq_recent_searches');
      return saved ? JSON.parse(saved) : ['فستان سواريه مطرز', 'عطر مسك الختام والعود', 'طقم فضة استرليني'];
    } catch {
      return ['فستان سواريه مطرز', 'عطر مسك الختام والعود', 'طقم فضة استرليني'];
    }
  });

  const addRecentSearch = useCallback((term: string) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('souq_desoq_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    if (!term) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const next = prev.filter(item => item.toLowerCase() !== clean.toLowerCase());
      try {
        localStorage.setItem('souq_desoq_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('souq_desoq_recent_searches');
    } catch {}
  }, []);

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const addRecentlyViewed = useCallback((prod: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== prod.id);
      return [prod, ...filtered].slice(0, 8);
    });
  }, []);

  const [selectedUniverse, setSelectedUniverseState] = useState<ShoppingUniverse>(() => {
    try {
      const saved = localStorage.getItem('souq_desoq_universe');
      return (saved === 'women' || saved === 'men' || saved === 'kids' || saved === 'all') ? saved : 'all';
    } catch {
      return 'all';
    }
  });

  const setSelectedUniverse = useCallback((u: ShoppingUniverse) => {
    setSelectedUniverseState(u);
    try {
      localStorage.setItem('souq_desoq_universe', u);
    } catch {}
  }, []);

  const [activeRealm, setActiveRealm] = useState<DepartmentRealmId | null>(null);

  const openDepartmentRealm = useCallback((realm: DepartmentRealmId) => {
    setActiveRealm(realm);
    setSelectedCategory(null);
    setActiveView('department_realm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [onlyDesoqLocal, setOnlyDesoqLocal] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');

  // Selection & UI State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [activeOrder, setActiveOrder] = useState<MarketplaceOrder | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist: Client UI preference
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('souq_desoq_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('souq_desoq_wishlist', JSON.stringify(wishlist));
    } catch {
      // safe fallback
    }
  }, [wishlist]);

  // Active Seller in Seller Portal
  const [activeSellerId, setActiveSellerId] = useState<string>('seller-1');

  // Selected Seller Profile (Public View)
  const [selectedSellerProfileId, setSelectedSellerProfileId] = useState<string | null>('seller-1');

  // Real-Time Event Bus & Live Cross-Persona Synchronization State
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(clientEventBus.getIsConnected());
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<{ event: string; payload: any; timestamp: string } | null>(null);

  const publishEvent = useCallback(<T = any>(event: MarketplaceEventType, payload: T) => {
    clientEventBus.publish(event, payload);
  }, []);

  const subscribeToEvent = useCallback(<T = any>(event: MarketplaceEventType, callback: (data: T) => void) => {
    return clientEventBus.subscribe(event, callback);
  }, []);

  // Sub-Tab Navigation States for elevated portals
  const [sellerActiveTab, setSellerActiveTab] = useState<string>('dashboard');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('dashboard');
  const [supportActiveTab, setSupportActiveTab] = useState<string>('tickets');
  const [courierActiveTab, setCourierActiveTab] = useState<string>('home');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string, _type?: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Sync role and seller headers whenever view, seller or user changes
  useEffect(() => {
    if (activeView === 'seller_dashboard' || activeView === 'seller') {
      setRoleOverride('seller');
      setActiveSellerHeader(activeSellerId);
    } else if (activeView === 'admin_portal' || activeView === 'admin') {
      setRoleOverride('admin');
      setActiveSellerHeader(null);
    } else if (activeView === 'support_desk' || activeView === 'support') {
      setRoleOverride('support');
      setActiveSellerHeader(null);
    } else {
      setRoleOverride(user ? user.role : null);
      setActiveSellerHeader(null);
    }
  }, [activeView, activeSellerId, user]);

  // INITIAL DATA SYNC: Fetch all authoritative marketplace data from Backend API
  const refreshData = useCallback(async () => {
    try {
      const [prods, slrs, ords, disps, crt, anncs, slides, cpns] = await Promise.all([
        api.getProducts(),
        api.getSellers(),
        api.getOrders().catch(() => []),
        api.getDisputes().catch(() => []),
        api.getCart().catch(() => []),
        api.getAnnouncements().catch(() => []),
        api.getHeroSlides().catch(() => []),
        api.getCoupons().catch(() => []),
      ]);
      setProducts(prods);
      setSellers(slrs);
      setOrders(ords);
      if (ords.length > 0) {
        setActiveOrder(prev => prev || ords[0]);
      }
      setDisputes(disps);
      setCart(crt);
      setAnnouncements(anncs);
      setHeroSlides(slides);
      setCoupons(cpns);
    } catch (err) {
      console.error('[MarketplaceContext] Failed to refresh data from server:', err);
    }
  }, []);

  // REAL-TIME EVENT BUS SYNCHRONIZATION LISTENER:
  // Listens for order status transitions, creates, and deliveries across tabs & server SSE
  useEffect(() => {
    const unsubStatus = clientEventBus.subscribe('order:status_updated', (payload: OrderStatusUpdatedPayload) => {
      setLastRealtimeEvent({ 
        event: 'order:status_updated', 
        payload, 
        timestamp: payload.timestamp || new Date().toISOString() 
      });

      // 1. If payload carries the fully updated order object, update in-memory cache directly
      if (payload.updatedOrder) {
        setOrders(prev => prev.map(o => o.id === payload.updatedOrder!.id ? payload.updatedOrder! : o));
        setActiveOrder(current => current?.id === payload.updatedOrder!.id ? payload.updatedOrder! : current);
      } else if (payload.orderId) {
        // 2. Otherwise update matching sub-order status and status history in state
        setOrders(prev => prev.map(o => {
          if (o.id !== payload.orderId) return o;
          const updatedSubOrders = o.subOrders.map(sub => {
            if (payload.subOrderId && sub.id !== payload.subOrderId) return sub;
            const newHistory = [
              ...(sub.statusHistory || []),
              {
                status: payload.status,
                timestamp: payload.timestamp || new Date().toISOString(),
                noteAr: payload.noteAr || `تم تحديث الحالة إلى ${payload.status}`
              }
            ];
            return { ...sub, status: payload.status, statusHistory: newHistory };
          });
          return { ...o, subOrders: updatedSubOrders };
        }));

        setActiveOrder(current => {
          if (!current || current.id !== payload.orderId) return current;
          const updatedSubOrders = current.subOrders.map(sub => {
            if (payload.subOrderId && sub.id !== payload.subOrderId) return sub;
            const newHistory = [
              ...(sub.statusHistory || []),
              {
                status: payload.status,
                timestamp: payload.timestamp || new Date().toISOString(),
                noteAr: payload.noteAr || `تم تحديث الحالة إلى ${payload.status}`
              }
            ];
            return { ...sub, status: payload.status, statusHistory: newHistory };
          });
          return { ...current, subOrders: updatedSubOrders };
        });
      }

      // If status changed to delivered, synchronize seller balances
      if (payload.status === 'delivered') {
        api.getSellers().then(setSellers).catch(() => {});
      }

      // Show real-time notification toast if event was broadcast from merchant / server
      if (payload.source === 'broadcast' || payload.source === 'sse') {
        const statusMapAr: Record<string, string> = {
          seller_confirmed: 'تأكيد التاجر وبدء التجهيز',
          processing: 'جاري التجهيز والتعبئة',
          shipped: 'تم تسليم الشحنة لشركة النقل',
          out_for_delivery: 'الشحنة مع مندوب التوصيل',
          delivered: 'تم التسليم بنجاح للعميل',
          cancelled: 'تم إلغاء الطلب',
          returned: 'تم إرجاع الشحنة'
        };
        const statusLabel = statusMapAr[payload.status] || payload.status;
        showToast(`⚡ إشعار لحظي (Event Bus): تم تحديث حالة شحنتك #${(payload.orderId || '').slice(-6)} إلى "${statusLabel}"`);
      }
    });

    const unsubCreated = clientEventBus.subscribe('order:created', (payload: OrderCreatedPayload) => {
      setLastRealtimeEvent({ 
        event: 'order:created', 
        payload, 
        timestamp: payload.timestamp || new Date().toISOString() 
      });

      if (payload.order) {
        setOrders(prev => {
          const exists = prev.some(o => o.id === payload.order.id);
          return exists ? prev : [payload.order, ...prev];
        });
        if (payload.source === 'broadcast' || payload.source === 'sse') {
          showToast(`⚡ طلب جديد #${payload.order.trackingCode || payload.order.id.slice(-6)} تم تسجيله بالمنصة!`);
        }
      }
    });

    const unsubDelivered = clientEventBus.subscribe('order:delivered', (payload: any) => {
      if (payload.source === 'broadcast' || payload.source === 'sse') {
        showToast(`🎉 تهانينا! تم تسليم الشحنة #${(payload.orderId || '').slice(-6)} بنجاح!`);
      }
      api.getSellers().then(setSellers).catch(() => {});
    });

    const unsubRefunded = clientEventBus.subscribe('order:refunded', (payload: OrderRefundedPayload) => {
      setLastRealtimeEvent({ 
        event: 'order:refunded', 
        payload, 
        timestamp: payload.timestamp || new Date().toISOString() 
      });
      if (payload.source === 'broadcast' || payload.source === 'sse') {
        showToast(`⚡ تم استرداد مالي للشحنة #${(payload.orderId || '').slice(-6)}`);
      }
    });

    const unsubConn = clientEventBus.subscribe('connection:state_changed', (payload: any) => {
      setRealtimeConnected(payload.connected);
    });

    return () => {
      unsubStatus();
      unsubCreated();
      unsubDelivered();
      unsubRefunded();
      unsubConn();
    };
  }, [showToast]);

  // Real Login flow with Destination routing
  const login = async (identifier: string, password = 'Password123!', destination?: string): Promise<{
    success: boolean;
    requireVerification?: boolean;
    email?: string;
    error?: string;
  }> => {
    try {
      setIsLoading(true);
      const res = await api.login(identifier, password);
      setUser(res.user);
      if (res.user.sellerId) {
        setActiveSellerId(res.user.sellerId);
      }
      setSessionExpiredNotice(null);
      showToast(`مرحباً: ${res.user.fullName} (${res.user.role})`);
      await refreshData();

      // Resolve destination
      const dest = destination || pendingDestination;
      if (dest) {
        setActiveView(dest);
        setPendingDestination(null);
      } else if (res.user.role === 'seller') {
        setActiveView('seller_dashboard');
        setSellerActiveTab('dashboard');
      } else if (res.user.role === 'admin') {
        setActiveView('admin_deck');
        setAdminActiveTab('dashboard');
      } else if (res.user.role === 'support') {
        setActiveView('support_disputes');
        setSupportActiveTab('tickets');
      } else if (res.user.role === 'courier') {
        setActiveView('courier_dispatch');
      }
      return { success: true };
    } catch (err: any) {
      if (err.requireVerification) {
        return { 
          success: false, 
          requireVerification: true, 
          email: err.email || identifier, 
          error: err.message || 'يرجى تأكيد بريدك الإلكتروني أولاً لتسجيل الدخول' 
        };
      }
      showToast(err.message || 'فشل تسجيل الدخول');
      return { success: false, error: err.message || 'فشل تسجيل الدخول' };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Logout flow
  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
      setUser(null);
      setActiveView('catalog');
      showToast('تم تسجيل الخروج بنجاح');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الخروج');
    } finally {
      setIsLoading(false);
    }
  };

  // Session refresh flow
  const refreshSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.refreshSession();
      setUser(res.user);
      if (res.user.sellerId) {
        setActiveSellerId(res.user.sellerId);
      }
      setSessionExpiredNotice(null);
      showToast('تم تجديد الجلسة بنجاح');
      return true;
    } catch (err: any) {
      showToast(err.message || 'تعذر تجديد الجلسة، يرجى إعادة تسجيل الدخول');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Real Register flow for Customer
  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: Role;
    sellerId?: string;
  }): Promise<{
    success: boolean;
    requireVerification?: boolean;
    email?: string;
    devVerificationCode?: string;
    message?: string;
    error?: string;
  }> => {
    try {
      setIsLoading(true);
      const res = await api.register(data);
      if (res.requireVerification) {
        showToast(res.message || 'تم إنشاء الحساب بنجاح. يرجى إدخال رمز التحقق لتفعيل حسابك.');
        return {
          success: true,
          requireVerification: true,
          email: res.email || data.email,
          devVerificationCode: res.devVerificationCode,
          message: res.message,
        };
      }
      if (res.user) {
        setUser(res.user);
        if (res.user.sellerId) {
          setActiveSellerId(res.user.sellerId);
        }
        setSessionExpiredNotice(null);
        showToast(`تم إنشاء الحساب بنجاح: مرحباً ${res.user.fullName}`);
        await refreshData();
      }
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الحساب');
      return { success: false, error: err.message || 'فشل إنشاء الحساب' };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Multi-step Seller Registration & Onboarding flow
  const registerSeller = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    storeName: string;
    tradeName?: string;
    ownerName?: string;
    desoqDistrict?: string;
    businessCategory?: string;
    commercialRecordNumber?: string;
    taxRegistrationNumber?: string;
    nationalIdNumber?: string;
  }): Promise<{
    success: boolean;
    requireVerification?: boolean;
    email?: string;
    devVerificationCode?: string;
    message?: string;
    error?: string;
  }> => {
    try {
      setIsLoading(true);
      const res = await api.register({
        ...data,
        role: 'seller'
      });
      if (res.requireVerification) {
        showToast(res.message || 'تم تسجيل الحساب بنجاح. يرجى تأكيد بريدك الإلكتروني لتفعيل متجرك.');
        return {
          success: true,
          requireVerification: true,
          email: res.email || data.email,
          devVerificationCode: res.devVerificationCode,
          message: res.message,
        };
      }
      if (res.user) {
        setUser(res.user);
        if (res.user.sellerId) {
          setActiveSellerId(res.user.sellerId);
        }
        setSessionExpiredNotice(null);
        showToast(`🎉 مبارك! تم تسجيل متجر "${data.storeName}" بنجاح في سوق دسوق`);
        await refreshData();

        // Route directly to Seller Portal
        setActiveView('seller_dashboard');
        setSellerActiveTab('dashboard');
      }
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل حساب التاجر');
      return { success: false, error: err.message || 'فشل تسجيل حساب التاجر' };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Email Verification Method
  const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.verifyEmail({ email, code });
      setUser(res.user);
      if (res.user.sellerId) {
        setActiveSellerId(res.user.sellerId);
      }
      setSessionExpiredNotice(null);
      showToast(`تم تأكيد الحساب بنجاح: مرحباً ${res.user.fullName}`);
      await refreshData();

      const dest = pendingDestination;
      if (dest) {
        setActiveView(dest);
        setPendingDestination(null);
      } else if (res.user.role === 'seller') {
        setActiveView('seller_dashboard');
        setSellerActiveTab('dashboard');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل تأكيد الرمز' };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Email Verification Code
  const resendVerificationCode = async (email: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    devVerificationCode?: string;
    remainingSeconds?: number;
  }> => {
    try {
      const res = await api.resendVerificationCode(email);
      showToast(res.message || 'تم إرسال رمز تحقق جديد');
      return { success: true, message: res.message, devVerificationCode: res.devVerificationCode };
    } catch (err: any) {
      return { success: false, error: err.message, remainingSeconds: err.remainingSeconds };
    }
  };

  // Change Email during Verification Step
  const changeVerificationEmail = async (currentEmail: string, newEmail: string): Promise<{
    success: boolean;
    email?: string;
    message?: string;
    error?: string;
    devVerificationCode?: string;
  }> => {
    try {
      const res = await api.changeVerificationEmail(currentEmail, newEmail);
      showToast(res.message || 'تم تحديث البريد الإلكتروني');
      return { success: true, email: res.email, message: res.message, devVerificationCode: res.devVerificationCode };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Google & Apple Social Login Flow
  const socialLogin = async (data: {
    provider: 'google' | 'apple';
    email: string;
    fullName?: string;
    avatarUrl?: string;
    idToken?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.socialLogin(data);
      setUser(res.user);
      if (res.user.sellerId) {
        setActiveSellerId(res.user.sellerId);
      }
      setSessionExpiredNotice(null);
      showToast(`مرحباً بك: ${res.user.fullName}`);
      await refreshData();

      if (res.user.role === 'admin') {
        setActiveView('admin_deck');
        setAdminActiveTab('dashboard');
      } else {
        const dest = pendingDestination;
        if (dest) {
          setActiveView(dest);
          setPendingDestination(null);
        }
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدخول الاجتماعي');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Role switching credentials
  const DEMO_CREDENTIALS: Record<Role, { email: string; password?: string; sellerId?: string }> = {
    customer: { email: 'customer@souqdesoq.eg' },
    seller: { email: 'abayas@souqdesoq.eg', sellerId: 'seller-1' },
    courier: { email: 'courier@souqdesoq.eg' },
    support: { email: 'support@souqdesoq.eg' },
    admin: { email: 'justokayp@gmail.com', password: 'Admin@2026!' },
  };

  const switchPersona = async (targetRole: Role, customEmail?: string) => {
    try {
      setIsLoading(true);
      const cred = customEmail ? { email: customEmail, password: 'Password123!' } : DEMO_CREDENTIALS[targetRole];
      const pwd = cred.password || 'Password123!';
      const loginRes = await login(cred.email, pwd);
      if (loginRes.success) {
        if (targetRole === 'seller') {
          setActiveSellerId(cred.sellerId || 'seller-1');
          setActiveView('seller_dashboard');
          setSellerActiveTab('dashboard');
        } else if (targetRole === 'courier') {
          setActiveView('courier_dispatch');
        } else if (targetRole === 'admin') {
          setActiveView('admin_deck');
          setAdminActiveTab('dashboard');
        } else if (targetRole === 'support') {
          setActiveView('support_disputes');
          setSupportActiveTab('tickets');
        } else {
          setActiveView('catalog');
        }
      }
      return Boolean(loginRes.success);
    } catch (err: any) {
      showToast(err.message || 'تعذر تسجيل الدخول بالدور المطلوب');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // setRole triggers real backend authentication and RBAC identity update or routes directly to the role's home view
  const setRole = useCallback((newRole: Role) => {
    if (user?.role === newRole) {
      if (newRole === 'seller') {
        setActiveView('seller_dashboard');
        setSellerActiveTab('dashboard');
      } else if (newRole === 'courier') {
        setActiveView('courier_dispatch');
      } else if (newRole === 'admin') {
        setActiveView('admin_deck');
        setAdminActiveTab('dashboard');
      } else if (newRole === 'support') {
        setActiveView('support_disputes');
        setSupportActiveTab('tickets');
      } else {
        setActiveView('catalog');
      }
      return;
    }
    switchPersona(newRole);
  }, [user?.role]);

  const openSellerProfile = (sellerId?: string) => {
    const targetId = sellerId || activeSellerId;
    setSelectedSellerProfileId(targetId);
    setActiveView('seller_profile');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialState = async () => {
      try {
        setIsLoading(true);
        // Verify current session
        let currentUser: AuthUser | null = null;
        try {
          const authRes = await api.getCurrentUser();
          currentUser = authRes.user;
        } catch {
          // Keep as anonymous guest
        }

        if (isMounted && currentUser) {
          setUser(currentUser);
          if (currentUser.sellerId) {
            setActiveSellerId(currentUser.sellerId);
          }
        }

        const [prods, slrs, ords, disps, crt] = await Promise.all([
          api.getProducts(),
          api.getSellers(),
          api.getOrders().catch(() => []),
          api.getDisputes().catch(() => []),
          api.getCart().catch(() => []),
        ]);

        if (isMounted) {
          setProducts(prods);
          setSellers(slrs);
          setOrders(ords);
          if (ords.length > 0) {
            setActiveOrder(ords[0]);
          }
          setDisputes(disps);
          setCart(crt);

          // Deep-link resolution for crawlers, social shares, and direct URLs
          if (typeof window !== 'undefined' && window.location) {
            try {
              const params = new URLSearchParams(window.location.search);
              const prodId = params.get('product') || (window.location.pathname.startsWith('/products/') ? window.location.pathname.split('/products/')[1] : null);
              const sellerId = params.get('seller') || (window.location.pathname.startsWith('/sellers/') ? window.location.pathname.split('/sellers/')[1] : null);
              const categoryId = params.get('category');
              const viewParam = params.get('view');

              if (prodId) {
                const targetProd = prods.find(p => p.id === prodId);
                if (targetProd) setSelectedProduct(targetProd);
              } else if (sellerId) {
                const targetSeller = slrs.find(s => s.id === sellerId);
                if (targetSeller) {
                  setSelectedSellerProfileId(sellerId);
                  setActiveView('seller_profile');
                }
              } else if (categoryId) {
                setSelectedCategory(categoryId);
                setActiveView('search_results');
              } else if (viewParam) {
                if (viewParam === 'search') setActiveView('search_results');
                else if (viewParam === 'products' || viewParam === 'products_all' || viewParam === 'categories') setActiveView('search_results');
                else if (viewParam === 'seller_portal') setActiveView('seller_dashboard');
                else if (viewParam === 'home') setActiveView('catalog');
                else setActiveView(viewParam);
              }
            } catch (err) {
              console.warn('[MarketplaceContext] Initial URL query parsing warning:', err);
            }
          }
        }
      } catch (err) {
        console.error('[MarketplaceContext] Initial server load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitialState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Graceful Session Expiration & Cross-Tab Synchronization
  useEffect(() => {
    // 1. Listen for API 401 Session Expiry
    const unsubExpiry = onSessionExpired((reason) => {
      setUser(null);
      setSessionExpiredNotice(reason || 'انتهت جلستك، سجل الدخول للمتابعة.');
      // Keep user's active view (e.g. cart or checkout) and open the auth modal gracefully
      setAuthModalInitialTab('login');
      setIsAuthModalOpen(true);
    });

    // 2. Listen to cross-tab storage changes (Login/Logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'souq_desoq_auth_token') {
        if (!e.newValue) {
          // Logged out in another tab
          setUser(null);
          showToast('تم تسجيل الخروج من نافذة أخرى');
        } else if (e.newValue !== e.oldValue) {
          // Logged in or switched user in another tab
          api.getCurrentUser()
            .then(res => {
              setUser(res.user);
              if (res.user.sellerId) setActiveSellerId(res.user.sellerId);
              showToast(`تم تحديث الحساب النشط: ${res.user.fullName}`);
              refreshData();
            })
            .catch(() => {
              setUser(null);
            });
        }
      }
    };

    // 3. Network Interruption & Online Recovery
    const handleOnline = () => {
      showToast('تمت استعادة الاتصال بالشبكة');
      // If we had an active token, verify session still holds
      if (getAuthToken()) {
        api.getCurrentUser()
          .then(res => {
            setUser(res.user);
          })
          .catch(() => {
            // Token invalidated while offline
          });
      }
    };

    const handleOffline = () => {
      showToast('انقطع الاتصال بالإنترنت، جاري العمل في وضع عدم الاتصال المؤقت');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      unsubExpiry();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [showToast, refreshData]);

  // Listen to browser popstate (back/forward navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('product') || (window.location.pathname.startsWith('/products/') ? window.location.pathname.split('/products/')[1] : null);
        const sellerId = params.get('seller') || (window.location.pathname.startsWith('/sellers/') ? window.location.pathname.split('/sellers/')[1] : null);
        const categoryId = params.get('category');
        const viewParam = params.get('view');

        if (prodId) {
          const targetProd = products.find(p => p.id === prodId);
          if (targetProd) setSelectedProduct(targetProd);
        } else {
          setSelectedProduct(null);
          if (sellerId) {
            setSelectedSellerProfileId(sellerId);
            setActiveView('seller_profile');
          } else if (categoryId) {
            setSelectedCategory(categoryId);
            setActiveView('search_results');
          } else if (viewParam) {
            if (viewParam === 'search') setActiveView('search_results');
            else if (viewParam === 'products' || viewParam === 'products_all' || viewParam === 'categories') setActiveView('search_results');
            else if (viewParam === 'seller_portal') setActiveView('seller_dashboard');
            else if (viewParam === 'home') setActiveView('catalog');
            else setActiveView(viewParam);
          } else {
            setActiveView('catalog');
          }
        }
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, sellers]);

  // Compare handlers
  const addToCompare = (product: Product) => {
    if (compareList.some(p => p.id === product.id)) {
      showToast('المنتج موجود بالفعل في قائمة المقارنة');
      return;
    }
    if (compareList.length >= 4) {
      showToast('الحد الأقصى للمقارنة هو 4 منتجات');
      return;
    }
    setCompareList(prev => [...prev, product]);
    showToast(`تمت إضافة "${product.titleAr.slice(0, 30)}..." للمقارنة`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Wishlist handler
  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
      showToast('تمت الإزالة من قائمة الرغبات');
    } else {
      setWishlist(prev => [...prev, productId]);
      showToast('تمت الإضافة إلى قائمة الرغبات والمفضلة');
    }
  };

  // --- SERVER-AUTHORITATIVE CART HANDLERS ---
  const addToCart = async (product: Product, variant?: ProductVariant, quantity = 1) => {
    try {
      const serverCart = await api.addToCart(product.id, variant?.id, quantity);
      setCart(serverCart);
      showToast(`تمت إضافة "${product.titleAr.slice(0, 30)}..." إلى سلة التسوق`);
    } catch (err: any) {
      showToast(err.message || 'تعذر إضافة المنتج إلى السلة');
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    try {
      const serverCart = await api.removeFromCart(productId, variantId);
      setCart(serverCart);
      showToast('تم حذف المنتج من السلة');
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف المنتج من السلة');
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number, variantId?: string) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId, variantId);
        return;
      }
      const serverCart = await api.updateCartQuantity(productId, quantity, variantId);
      setCart(serverCart);
    } catch (err: any) {
      showToast(err.message || 'تعذر تحديث كمية المنتج');
    }
  };

  const clearCart = async () => {
    try {
      const serverCart = await api.clearCart();
      setCart(serverCart);
    } catch (err: any) {
      console.error('Failed to clear cart on server:', err);
    }
  };

  // Cart Totals and Multi-Vendor Breakdown (Computed from authoritative Cart items and Sellers)
  const cartTotalCount = cart.reduce((sum, item) => sum + (item?.quantity || 0), 0);

  const cartGroupedBySeller = useMemo(() => {
    const groups: { [sellerId: string]: CartItem[] } = {};
    cart.forEach(item => {
      if (!item) return;
      const sId = item.sellerId || item.product?.sellerId || 'seller-1';
      if (!groups[sId]) {
        groups[sId] = [];
      }
      groups[sId].push(item);
    });

    return Object.keys(groups).map(sellerId => {
      const seller = sellers.find(s => s.id === sellerId) || {
        id: sellerId,
        name: 'تاجر بسوق دسوق',
        arabicName: 'تاجر بسوق دسوق',
        ownerName: 'تاجر معتمد',
        slug: 'seller',
        logo: '',
        banner: '',
        rating: 4.8,
        reviewCount: 50,
        governorate: 'كفر الشيخ',
        city: 'دسوق',
        address: 'دسوق، مصر',
        phone: '01000000000',
        verificationStatus: 'verified',
        taxRegistrationNumber: '000',
        commercialRecordNumber: '000',
        joinedDate: '2024-01-01',
        commissionRate: 0.10,
        bankAccountOrWallet: { type: 'instapay', accountNumber: '', accountTitle: '' },
        totalSalesEGP: 0,
        availableBalanceEGP: 0,
        pendingBalanceEGP: 0,
      } as Seller;

      const items = groups[sellerId] || [];
      const subtotalEGP = items.reduce((sum, item) => {
        if (!item) return sum;
        const itemPrice = item.selectedVariant ? item.selectedVariant.priceEGP : (item.product?.priceEGP ?? 0);
        return sum + (itemPrice * (item.quantity || 1));
      }, 0);

      // Standard Desoq marketplace delivery flat rate: 25 EGP per seller package
      const shippingFeeEGP = 25;

      return {
        seller,
        items,
        subtotalEGP,
        shippingFeeEGP,
      };
    });
  }, [cart, sellers]);

  const cartSubtotalEGP = cartGroupedBySeller.reduce((sum, group) => sum + group.subtotalEGP, 0);
  const cartTotalShippingEGP = cartGroupedBySeller.reduce((sum, group) => sum + group.shippingFeeEGP, 0);
  const cartGrandTotalEGP = cartSubtotalEGP + cartTotalShippingEGP;

  // --- SERVER-AUTHORITATIVE ORDER PLACEMENT ---
  const placeOrder = async (
    shippingAddress: EgyptianAddress, 
    paymentMethod: PaymentMethod,
    options?: { idempotencyKey?: string; discountCode?: string }
  ): Promise<MarketplaceOrder | null> => {
    try {
      const idempotencyKey = options?.idempotencyKey || (
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `order-idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      );

      const newOrder = await api.createOrder({
        customerId: user?.id,
        customerName: shippingAddress.fullName,
        customerPhone: shippingAddress.phone,
        shippingAddress,
        paymentMethod,
        cart,
        discountCode: options?.discountCode,
        idempotencyKey,
      });

      // Update state strictly from the server's authoritative response
      setOrders(prev => {
        const existingIdx = prev.findIndex(o => o.id === newOrder.id);
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = newOrder;
          return copy;
        }
        return [newOrder, ...prev];
      });
      setActiveOrder(newOrder);
      setCart([]);

      // Resync products and sellers from server (stock decremented, balances credited)
      const [freshProducts, freshSellers] = await Promise.all([
        api.getProducts(),
        api.getSellers()
      ]);
      setProducts(freshProducts);
      setSellers(freshSellers);

      // Publish Order Created Event to Client Event Bus & Cross-tab sync
      clientEventBus.publish('order:created', {
        order: newOrder,
        timestamp: new Date().toISOString()
      });

      showToast(`تم تأكيد الطلب بنجاح في الخادم برقم تتبع: ${newOrder.trackingCode}`);
      return newOrder;
    } catch (err: any) {
      showToast(err.message || 'تعذر إتمام الطلب، يرجى مراجعة الكميات المتاحة');
      return null;
    }
  };

  // --- MANUAL DIRECT ORDER CREATION (FOR MERCHANTS & STOREFRONT SALES) ---
  const createDirectOrder = async (params: {
    customerName: string;
    customerPhone: string;
    shippingAddress: EgyptianAddress;
    paymentMethod: PaymentMethod;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    discountCode?: string;
  }): Promise<MarketplaceOrder | null> => {
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `manual-ord-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newOrder = await api.createOrder({
        customerId: user?.id,
        customerName: params.customerName.trim(),
        customerPhone: params.customerPhone.trim(),
        shippingAddress: params.shippingAddress,
        paymentMethod: params.paymentMethod,
        items: params.items,
        discountCode: params.discountCode,
        idempotencyKey,
      });

      // Insert new order into orders state
      setOrders(prev => {
        const existingIdx = prev.findIndex(o => o.id === newOrder.id);
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = newOrder;
          return copy;
        }
        return [newOrder, ...prev];
      });

      // Synchronize database records for fresh stock and balances
      const [freshProducts, freshSellers] = await Promise.all([
        api.getProducts(),
        api.getSellers()
      ]);
      setProducts(freshProducts);
      setSellers(freshSellers);

      // Broadcast order created event to Event Bus
      clientEventBus.publish('order:created', {
        order: newOrder,
        timestamp: new Date().toISOString()
      });

      showToast(`تم تسجيل وتأكيد الطلب بنجاح برقم: ${newOrder.trackingCode}`);
      return newOrder;
    } catch (err: any) {
      showToast(err.message || 'تعذر تسجيل الطلب، يرجى مراجعة البيانات والكميات المتوفرة');
      return null;
    }
  };

  // --- SUB-ORDER STATUS PROGRESSION ---
  const updateSubOrderStatus = async (
    orderId: string, 
    subOrderId: string, 
    status: OrderStatus, 
    noteAr: string
  ) => {
    try {
      const updatedOrder = await api.updateSubOrderStatus(orderId, subOrderId, status, noteAr);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (activeOrder?.id === updatedOrder.id) {
        setActiveOrder(updatedOrder);
      }
      // If delivered, refresh sellers to reflect updated balances in server DB
      if (status === 'delivered') {
        const freshSellers = await api.getSellers();
        setSellers(freshSellers);
      }

      // Publish Real-Time Event to Client Event Bus & Cross Tabs
      clientEventBus.publish('order:status_updated', {
        orderId,
        subOrderId,
        status,
        noteAr,
        updatedOrder,
        updatedBy: activeSeller?.name || 'التاجر',
        timestamp: new Date().toISOString()
      });

      showToast(`تم تحديث حالة الشحنة الفرعية إلى: ${status}`);
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الشحنة');
    }
  };

  const refundSubOrder = async (
    orderId: string,
    subOrderId: string,
    reason: string,
    amountEGP?: number
  ) => {
    try {
      const res = await api.refundSubOrder(orderId, subOrderId, { reason, amountEGP });
      setOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
      if (activeOrder?.id === res.order.id) {
        setActiveOrder(res.order);
      }
      const [freshProducts, freshSellers] = await Promise.all([
        api.getProducts(),
        api.getSellers()
      ]);
      setProducts(freshProducts);
      setSellers(freshSellers);

      // Publish Refund Event to Event Bus
      clientEventBus.publish('order:refunded', {
        orderId,
        subOrderId,
        refundId: res.refundId,
        amountEGP,
        reason,
        timestamp: new Date().toISOString()
      });

      showToast(`تم استرداد الشحنة بنجاح: #${res.refundId}`);
    } catch (err: any) {
      showToast(err.message || 'فشل تنفيذ الاسترداد المالي');
    }
  };

  // Active Seller in Seller Portal
  const activeSeller = sellers.find(s => s.id === activeSellerId) || sellers[0];

  // --- SELLER OPERATIONS VIA BACKEND API ---
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    try {
      const newProd = await api.createProduct({
        ...productData,
        sellerId: activeSellerId,
      });
      setProducts(prev => [newProd, ...prev]);
      showToast(`تم إضافة المنتج "${newProd.titleAr}" بنجاح إلى متجرك في سوق دسوق`);
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة المنتج');
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const updatedProd = await api.updateProduct(productId, updates);
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      showToast('تم تحديث بيانات المنتج بنجاح في الخادم');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات المنتج');
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('تم حذف المنتج بنجاح من متجرك وقاعدة البيانات');
      return true;
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المنتج');
      return false;
    }
  };

  const duplicateProduct = async (productId: string): Promise<Product | null> => {
    try {
      const duplicated = await api.duplicateProduct(productId);
      setProducts(prev => [duplicated, ...prev]);
      showToast(`تم استنساخ المنتج "${duplicated.titleAr}" كمسودة بنجاح`);
      return duplicated;
    } catch (err: any) {
      showToast(err.message || 'فشل استنساخ المنتج');
      return null;
    }
  };

  const setProductStatus = async (productId: string, status: string) => {
    try {
      const updated = await api.setProductStatus(productId, status);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      const statusLabels: Record<string, string> = {
        active: 'نشط ومنشور للبيع',
        inactive: 'موقوف مؤقتاً',
        suspended: 'مؤرشف',
        out_of_stock: 'نفد من المخزن',
      };
      showToast(`تم تغيير حالة المنتج إلى "${statusLabels[status] || status}"`);
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير حالة المنتج');
    }
  };

  const updateSeller = async (sellerId: string, updates: Partial<Seller>) => {
    try {
      setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, ...updates } : s));
      showToast('تم تحديث إعدادات وبيانات المتجر بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات المتجر');
    }
  };

  const requestSellerPayout = async (sellerId: string, amount: number, method: string) => {
    try {
      const res = await api.requestPayout(sellerId, amount, method);
      const freshSellers = await api.getSellers();
      setSellers(freshSellers);
      showToast(res.message || `تم تحويل طلب سحب ${amount} ج.م بنجاح`);
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل طلب سحب الأرباح');
    }
  };

  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('desoq_user_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const rateProduct = async (productId: string, rating: number) => {
    try {
      const res = await api.rateProduct(productId, rating);
      setUserRatings(prev => {
        const next = { ...prev, [productId]: rating };
        try { localStorage.setItem('desoq_user_ratings', JSON.stringify(next)); } catch {}
        return next;
      });
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return { ...p, rating: res.rating, reviewCount: res.reviewCount };
        }
        return p;
      }));
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(prev => prev ? { ...prev, rating: res.rating, reviewCount: res.reviewCount } : null);
      }
      showToast(`شكراً لك! تم تسجيل تقييمك (${rating}★) بنجاح`);
    } catch (err: any) {
      setUserRatings(prev => {
        const next = { ...prev, [productId]: rating };
        try { localStorage.setItem('desoq_user_ratings', JSON.stringify(next)); } catch {}
        return next;
      });
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          const newCount = p.reviewCount + 1;
          const newRating = Number((((p.rating * p.reviewCount) + rating) / newCount).toFixed(2));
          return { ...p, rating: newRating, reviewCount: newCount };
        }
        return p;
      }));
      showToast(`شكراً لك! تم تسجيل تقييمك (${rating}★) بنجاح`);
    }
  };

  // --- ADMIN ACTIONS VIA BACKEND API ---
  const updateSellerStatus = async (sellerId: string, status: 'active' | 'suspended' | 'under_review') => {
    try {
      const updated = await api.updateSellerStatus(sellerId, status);
      setSellers(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast(`تم تحديث حالة التاجر إلى: ${status === 'active' ? 'نشط ومعتمد' : 'موقوف مؤقتاً'}`);
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة التاجر');
    }
  };

  const verifySeller = async (sellerId: string, status: 'verified' | 'rejected') => {
    try {
      const updated = await api.verifySeller(sellerId, status);
      setSellers(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast(`تم ${status === 'verified' ? 'توثيق واعتماد' : 'إلغاء اعتماد'} التاجر بنجاح`);
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة اعتماد التاجر');
    }
  };

  const createSeller = async (sellerData: any): Promise<Seller> => {
    try {
      const created = await api.createSeller(sellerData);
      setSellers(prev => [created, ...prev]);
      showToast(`تم إضافة المتجر المعتمد "${created.name}" بنجاح!`);
      return created;
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة المتجر');
      throw err;
    }
  };

  const updateOverallOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      const updated = await api.updateOverallOrderStatus(orderId, status, note);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (activeOrder?.id === updated.id) {
        setActiveOrder(updated);
      }

      // Publish status update to Event Bus
      clientEventBus.publish('order:status_updated', {
        orderId,
        status,
        noteAr: note,
        updatedOrder: updated,
        updatedBy: 'إدارة سوق دسوق',
        timestamp: new Date().toISOString()
      });

      showToast(`تم تحديث حالة الطلب إلى: ${status}`);
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الطلب');
      throw err;
    }
  };

  const cancelOrder = async (orderId: string, reason?: string): Promise<{ success: boolean; order?: MarketplaceOrder }> => {
    try {
      const res = await api.cancelOrder(orderId, reason);
      if (res.order) {
        setOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
        if (activeOrder?.id === res.order.id) {
          setActiveOrder(res.order);
        }
        // Resync fresh catalog and seller balances because cancelled order restocks items
        const [freshProducts, freshSellers] = await Promise.all([
          api.getProducts(),
          api.getSellers()
        ]);
        setProducts(freshProducts);
        setSellers(freshSellers);

        clientEventBus.publish('order:status_updated', {
          orderId,
          status: 'cancelled',
          noteAr: reason || 'تم إلغاء الطلب بواسطة العميل',
          updatedOrder: res.order,
          updatedBy: user?.fullName || 'العميل',
          timestamp: new Date().toISOString()
        });
      }
      showToast(res.message || 'تم إلغاء الطلب بنجاح');
      return { success: true, order: res.order };
    } catch (err: any) {
      showToast(err.message || 'تعذر إلغاء الطلب');
      return { success: false };
    }
  };

  // --- PROMOTIONS & ADS (Announcements, Hero Slides, Coupons) ---
  const createAnnouncement = async (data: any) => {
    try {
      const created = await api.createAnnouncement(data);
      setAnnouncements(prev => [created, ...prev]);
      showToast('تم نشر الإعلان بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل نشر الإعلان');
      throw err;
    }
  };

  const updateAnnouncement = async (id: string, data: any) => {
    try {
      const updated = await api.updateAnnouncement(id, data);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      showToast('تم تحديث الإعلان');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الإعلان');
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('تم حذف الإعلان');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الإعلان');
      throw err;
    }
  };

  const createHeroSlide = async (data: any) => {
    try {
      const created = await api.createHeroSlide(data);
      setHeroSlides(prev => [...prev, created]);
      showToast('تمت إضافة شريحة البانر الإعلاني بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة الشريحة');
      throw err;
    }
  };

  const deleteHeroSlide = async (id: string | number) => {
    try {
      await api.deleteHeroSlide(String(id));
      setHeroSlides(prev => prev.filter(s => String(s.id) !== String(id)));
      showToast('تم حذف شريحة البانر');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الشريحة');
      throw err;
    }
  };

  const createCoupon = async (data: any) => {
    try {
      const created = await api.createCoupon(data);
      setCoupons(prev => [created, ...prev]);
      showToast(`تم إنشاء كود الخصم "${created.code}" بنجاح`);
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الكوبون');
      throw err;
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast('تم حذف كود الخصم');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الكوبون');
      throw err;
    }
  };

  const moderateProduct = async (productId: string, status: 'active' | 'suspended') => {
    try {
      const updated = await api.updateProduct(productId, { status });
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(`تم تحديث حالة المنتج إلى: ${status === 'active' ? 'نشط ومعروض' : 'موقوف مؤقتاً'}`);
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة المنتج');
    }
  };

  const updateSellerCommission = async (sellerId: string, rate: number) => {
    try {
      const updated = await api.updateSellerCommission(sellerId, rate);
      setSellers(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast(`تم تحديث نسبة عمولة التاجر إلى ${(rate * 100).toFixed(1)}%`);
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث نسبة العمولة');
    }
  };

  // --- DISPUTES VIA BACKEND API (LAW 181/2018) ---
  const createDispute = async (
    orderId: string, 
    subOrderId: string, 
    reason: Dispute['reason'], 
    description: string, 
    requestedResolution: Dispute['requestedResolution']
  ): Promise<Dispute | null> => {
    try {
      const newDispute = await api.createDispute({
        orderId,
        subOrderId,
        reason,
        description,
        requestedResolution,
      });
      setDisputes(prev => [newDispute, ...prev]);
      showToast('تم فتح طلب الإرجاع والنزاع ومشاركته مع التاجر وإدارة السوق');
      return newDispute;
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل النزاع');
      return null;
    }
  };

  const replyToDispute = async (disputeId: string, message: string, sender: 'customer' | 'seller' | 'admin' | 'support') => {
    try {
      const dispute = disputes.find(d => d.id === disputeId);
      const senderName = sender === 'admin' 
        ? 'إدارة سوق دسوق (لجنة فض المنازعات)' 
        : (sender === 'support'
          ? 'مكتب الدعم والتحكيم (الدعم الفني)'
          : (sender === 'seller' ? (dispute?.sellerName || 'التاجر') : (dispute?.customerName || 'المشتري')));

      const updated = await api.replyToDispute(disputeId, message, sender, senderName);
      setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast('تم إرسال الرد بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل إرسال الرد');
    }
  };

  const resolveDispute = async (
    disputeId: string, 
    status: 'resolved' | 'rejected' | 'resolved_refunded', 
    resolutionText?: string
  ) => {
    try {
      const finalStatus: 'resolved' | 'rejected' = (status === 'resolved_refunded' || status === 'resolved') ? 'resolved' : 'rejected';
      const text = resolutionText || (finalStatus === 'resolved' 
        ? 'بموجب المادة 18 من قانون حماية المستهلك المصري، تقرر رد كامل المبلغ للمشتري وخصم القيمة من محفظة التاجر.' 
        : 'تم رفض طلب النزاع لعدم استيفاء شروط المرتجع المحددة في سياسة المنصة.');

      const updated = await api.resolveDispute(disputeId, finalStatus, text);
      setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d));
      // Refresh sellers because refund modifies balance
      const freshSellers = await api.getSellers();
      setSellers(freshSellers);
      showToast(`تم إصدار القرار الإداري في النزاع: ${finalStatus === 'resolved' ? 'رد الأموال للمشتري' : 'رفض الطلب'}`);
    } catch (err: any) {
      showToast(err.message || 'فشل اعتماد قرار التحكيم');
    }
  };

  const addDisputeNote = async (disputeId: string, note: string) => {
    try {
      const updated = await api.addDisputeNote(disputeId, note);
      setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast('تمت إضافة الملاحظة الداخلية بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة الملاحظة الداخلية');
    }
  };

  const updateDisputeStatus = async (disputeId: string, status: string, priority?: string) => {
    try {
      const updated = await api.updateDisputeStatus(disputeId, status, priority);
      setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast('تم تحديث حالة التذكرة والنزاع');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث التذكرة');
    }
  };

  const getTicketContext = async (disputeId: string) => {
    try {
      return await api.getDisputeContext(disputeId);
    } catch (err: any) {
      console.error('Failed to load ticket context:', err);
      return null;
    }
  };

  return (
    <MarketplaceContext.Provider value={{
      lang,
      setLang,
      theme,
      setTheme,
      t,
      user,
      isAuthenticated,
      role,
      setRole,
      login,
      logout,
      refreshSession,
      register,
      registerSeller,
      verifyEmail,
      resendVerificationCode,
      changeVerificationEmail,
      socialLogin,
      switchPersona,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalInitialTab,
      setAuthModalInitialTab,
      sessionExpiredNotice,
      clearSessionExpiredNotice,
      pendingDestination,
      setPendingDestination,
      activeView,
      setActiveView,
      isLoading,
      refreshData,
      products,
      sellers,
      categories,
      searchQuery,
      setSearchQuery,
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
      recentlyViewed,
      addRecentlyViewed,
      selectedUniverse,
      setSelectedUniverse,
      activeRealm,
      setActiveRealm,
      openDepartmentRealm,
      selectedCategory,
      setSelectedCategory,
      selectedProduct,
      setSelectedProduct,
      onlyDesoqLocal,
      setOnlyDesoqLocal,
      sortBy,
      setSortBy,
      rateProduct,
      userRatings,
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      wishlist,
      toggleWishlist,
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotalCount,
      cartSubtotalEGP,
      cartTotalShippingEGP,
      cartGrandTotalEGP,
      cartGroupedBySeller,
      orders,
      activeOrder,
      setActiveOrder,
      placeOrder,
      createDirectOrder,
      updateSubOrderStatus,
      updateOverallOrderStatus,
      cancelOrder,
      refundSubOrder,
      activeSellerId,
      setActiveSellerId,
      activeSeller,
      selectedSellerProfileId,
      setSelectedSellerProfileId,
      openSellerProfile,
      createSeller,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      setProductStatus,
      updateSeller,
      requestSellerPayout,
      updateSellerStatus,
      verifySeller,
      moderateProduct,
      updateSellerCommission,
      announcements,
      heroSlides,
      coupons,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      createHeroSlide,
      deleteHeroSlide,
      createCoupon,
      deleteCoupon,
      disputes,
      createDispute,
      replyToDispute,
      resolveDispute,
      addDisputeNote,
      updateDisputeStatus,
      getTicketContext,
      sellerActiveTab,
      setSellerActiveTab,
      adminActiveTab,
      setAdminActiveTab,
      supportActiveTab,
      setSupportActiveTab,
      courierActiveTab,
      setCourierActiveTab,
      toastMessage,
      showToast,
      authToken: getAuthToken(),
      // Real-Time Event Bus for Merchants, Admins, and Customers
      eventBus: clientEventBus,
      publishEvent,
      subscribeToEvent,
      realtimeConnected,
      lastRealtimeEvent,
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
