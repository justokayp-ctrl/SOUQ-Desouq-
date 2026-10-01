import { 
  Product, 
  Seller, 
  MarketplaceOrder, 
  Dispute, 
  CartItem, 
  EgyptianAddress, 
  PaymentMethod,
  OrderStatus,
  Role,
  AuthUser,
  AuthSessionResponse,
  StoredFile,
  KycDocument,
  KycStatus,
  KycDocumentType,
  CourierDeliveryStage,
  DeliveryExceptionReason,
  DeliveryExceptionResolution,
  CourierShiftSettlement
} from '../types';

const API_BASE = '/api';

export interface HealthTelemetry {
  status: string;
  version: string;
  architecture: string;
  uptimeSeconds: number;
  telemetry: {
    heapUsedMB: number;
    heapTotalMB: number;
    nodeVersion: string;
    environment: string;
  };
  services: Record<string, string>;
}

export interface AuditResponse {
  documentTitle: string;
  systemClassification: string;
  summary: {
    implemented: number;
    partiallyImplemented: number;
    simulated: number;
    declared: number;
    notImplemented: number;
    total: number;
  };
  tiers: Array<{
    tierNumber: string;
    code: string;
    nameEn: string;
    nameAr: string;
    classification: 'IMPLEMENTED' | 'PARTIALLY_IMPLEMENTED' | 'SIMULATED' | 'DECLARED' | 'NOT_IMPLEMENTED';
    badgeColor: string;
    auditFinding: string;
    v1Reality: string;
    v2ImplementationStatus: string;
    tested: boolean;
  }>;
}

// Client Auth Token Management (survives page refresh via standard client storage)
let currentToken: string | null = null;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    currentToken = localStorage.getItem('souq_desoq_auth_token');
  }
} catch {
  currentToken = null;
}

// Session lifecycle listeners for graceful 401 handling without state loss
type SessionExpiredHandler = (reason?: string) => void;
const sessionExpiredHandlers = new Set<SessionExpiredHandler>();

export function onSessionExpired(handler: SessionExpiredHandler) {
  sessionExpiredHandlers.add(handler);
  return () => {
    sessionExpiredHandlers.delete(handler);
  };
}

export function triggerSessionExpired(reason = 'انتهت جلستك، سجل الدخول للمتابعة.') {
  sessionExpiredHandlers.forEach(h => {
    try { h(reason); } catch {}
  });
}

export function setAuthToken(token: string | null) {
  currentToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        localStorage.setItem('souq_desoq_auth_token', token);
      } else {
        localStorage.removeItem('souq_desoq_auth_token');
      }
    } catch {
      // Ignore if localStorage is blocked by sandboxed iframe
    }
  }
}

export function getAuthToken(): string | null {
  return currentToken;
}

let inMemoryGuestId: string | null = null;
let activeRoleOverride: string | null = null;
let activeSellerIdHeader: string | null = null;

export function setRoleOverride(role: string | null) {
  activeRoleOverride = role;
}

export function setActiveSellerHeader(sellerId: string | null) {
  activeSellerIdHeader = sellerId;
}

function getGuestSessionId(): string {
  if (inMemoryGuestId) return inMemoryGuestId;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      let guestId = localStorage.getItem('guest_session_id');
      if (!guestId) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          guestId = 'guest-' + crypto.randomUUID();
        } else {
          guestId = 'guest-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        try {
          localStorage.setItem('guest_session_id', guestId);
        } catch {}
      }
      inMemoryGuestId = guestId;
      return guestId;
    }
  } catch {}
  inMemoryGuestId = 'guest-' + Math.random().toString(36).substring(2, 15);
  return inMemoryGuestId;
}

function authHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  } else {
    headers['X-Guest-Session-ID'] = getGuestSessionId();
  }
  if (activeRoleOverride) {
    headers['X-Role-Override'] = activeRoleOverride;
  }
  if (activeSellerIdHeader) {
    headers['X-Seller-ID'] = activeSellerIdHeader;
  }
  return headers;
}

export const api = {
  // System
  async getHealth(): Promise<HealthTelemetry> {
    const res = await fetch(`${API_BASE}/health`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getAudit(): Promise<AuditResponse> {
    const res = await fetch(`${API_BASE}/audit`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch audit data');
    return res.json();
  },

  // Authentication & Identity
  async login(identifier: string, password: string): Promise<AuthSessionResponse> {
    const guestSessionId = getGuestSessionId();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Guest-Session-ID': guestSessionId,
      },
      body: JSON.stringify({ identifier, password, guestSessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تسجيل الدخول' }));
      const errorObj: any = new Error(err.error || 'فشل تسجيل الدخول');
      errorObj.requireVerification = Boolean(err.requireVerification);
      errorObj.email = err.email;
      throw errorObj;
    }
    const data: AuthSessionResponse = await res.json();
    setAuthToken(data.token);
    return data;
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: Role;
    sellerId?: string;
    storeName?: string;
    tradeName?: string;
    ownerName?: string;
    desoqDistrict?: string;
    businessCategory?: string;
    commercialRecordNumber?: string;
    taxRegistrationNumber?: string;
    nationalIdNumber?: string;
  }): Promise<{
    authenticated: boolean;
    requireVerification?: boolean;
    email?: string;
    devVerificationCode?: string;
    message?: string;
    token?: string;
    user?: AuthUser;
    sellerId?: string;
  }> {
    const guestSessionId = getGuestSessionId();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Guest-Session-ID': guestSessionId,
      },
      body: JSON.stringify({ ...data, guestSessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء الحساب' }));
      throw new Error(err.error || 'فشل إنشاء الحساب');
    }
    const result = await res.json();
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  async verifyEmail(data: { email: string; code: string }): Promise<AuthSessionResponse> {
    const guestSessionId = getGuestSessionId();
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Guest-Session-ID': guestSessionId,
      },
      body: JSON.stringify({ ...data, guestSessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تأكيد رمز التحقق' }));
      const errorObj: any = new Error(err.error || 'فشل تأكيد رمز التحقق');
      errorObj.remainingAttempts = err.remainingAttempts;
      throw errorObj;
    }
    const result: AuthSessionResponse = await res.json();
    setAuthToken(result.token);
    return result;
  },

  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string; devVerificationCode?: string }> {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إعادة إرسال رمز التحقق' }));
      const errorObj: any = new Error(err.error || 'فشل إعادة إرسال رمز التحقق');
      errorObj.remainingSeconds = err.remainingSeconds;
      throw errorObj;
    }
    return await res.json();
  },

  async changeVerificationEmail(currentEmail: string, newEmail: string): Promise<{ success: boolean; email: string; message: string; devVerificationCode?: string }> {
    const res = await fetch(`${API_BASE}/auth/change-verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentEmail, newEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تحديث البريد الإلكتروني' }));
      throw new Error(err.error || 'فشل تحديث البريد الإلكتروني');
    }
    return await res.json();
  },

  async socialLogin(data: {
    provider: 'google' | 'apple';
    email: string;
    fullName?: string;
    avatarUrl?: string;
    idToken?: string;
  }): Promise<AuthSessionResponse> {
    const guestSessionId = getGuestSessionId();
    const res = await fetch(`${API_BASE}/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Session-ID': guestSessionId,
      },
      body: JSON.stringify({ ...data, guestSessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إتمام تسجيل الدخول' }));
      throw new Error(err.error || 'فشل إتمام تسجيل الدخول');
    }
    const result: AuthSessionResponse = await res.json();
    setAuthToken(result.token);
    return result;
  },

  async getCurrentUser(): Promise<{ authenticated: boolean; user: AuthUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      if (currentToken) {
        // Was logged in, token is now invalid or expired
        setAuthToken(null);
        triggerSessionExpired('انتهت جلستك، سجل الدخول للمتابعة.');
      }
      throw new Error('انتهت صلاحية الجلسة');
    }
    return res.json();
  },

  async refreshSession(): Promise<AuthSessionResponse> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      setAuthToken(null);
      triggerSessionExpired('انتهت جلستك، سجل الدخول للمتابعة.');
      throw new Error('فشل تجديد الجلسة');
    }
    const data: AuthSessionResponse = await res.json();
    setAuthToken(data.token);
    return data;
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } finally {
      setAuthToken(null);
    }
    return { success: true };
  },

  async getDemoUsers(): Promise<(AuthUser & { defaultPassword: string })[]> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    if (!res.ok) throw new Error('فشل جلب قائمة الحسابات التجريبية');
    return res.json();
  },

  // Catalog
  async getProducts(params?: { category?: string; sellerId?: string; isDesoqLocal?: boolean; q?: string }): Promise<Product[]> {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.sellerId) search.set('sellerId', params.sellerId);
    if (params?.isDesoqLocal) search.set('isDesoqLocal', 'true');
    if (params?.q) search.set('q', params.q);

    const res = await fetch(`${API_BASE}/catalog/products?${search.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch catalog products');
    return res.json();
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<Product> {
    const res = await fetch(`${API_BASE}/catalog/products`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error creating product' }));
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/catalog/products/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update product' }));
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/catalog/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete product' }));
      throw new Error(err.error || 'Failed to delete product');
    }
    return res.json();
  },

  async duplicateProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/catalog/products/${id}/duplicate`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to duplicate product' }));
      throw new Error(err.error || 'Failed to duplicate product');
    }
    return res.json();
  },

  async setProductStatus(id: string, status: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/catalog/products/${id}/status`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update product status' }));
      throw new Error(err.error || 'Failed to update product status');
    }
    return res.json();
  },

  async rateProduct(productId: string, rating: number): Promise<{ success: boolean; rating: number; reviewCount: number; userRating: number }> {
    const res = await fetch(`${API_BASE}/catalog/products/${productId}/rate`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل حفظ التقييم' }));
      throw new Error(err.error || 'فشل حفظ التقييم');
    }
    return res.json();
  },

  // Server-Authoritative Cart
  async getCart(userId?: string): Promise<CartItem[]> {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/cart${q}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
  },

  async addToCart(productId: string, variantId?: string, quantity = 1, userId?: string): Promise<CartItem[]> {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ productId, variantId, quantity, userId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add item to cart' }));
      throw new Error(err.error || err.message || 'Failed to add item to cart');
    }
    return res.json();
  },

  async updateCartQuantity(productId: string, quantity: number, variantId?: string, userId?: string): Promise<CartItem[]> {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ productId, variantId, quantity, userId }),
    });
    if (!res.ok) throw new Error('Failed to update cart quantity');
    return res.json();
  },

  async removeFromCart(productId: string, variantId?: string, userId?: string): Promise<CartItem[]> {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: 'DELETE',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ productId, variantId, userId }),
    });
    if (!res.ok) throw new Error('Failed to remove item from cart');
    return res.json();
  },

  async clearCart(userId?: string): Promise<CartItem[]> {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to clear cart');
    return res.json();
  },

  async mergeCart(guestSessionId?: string): Promise<{ success: boolean; cart: CartItem[] }> {
    const guestId = guestSessionId || getGuestSessionId();
    const res = await fetch(`${API_BASE}/cart/merge`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ guestSessionId: guestId }),
    });
    if (!res.ok) throw new Error('Failed to merge guest cart');
    return res.json();
  },

  // Sellers
  async getSellers(): Promise<Seller[]> {
    const res = await fetch(`${API_BASE}/sellers`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch sellers');
    return res.json();
  },

  async updateSellerStatus(id: string, status: 'active' | 'suspended' | 'under_review'): Promise<Seller> {
    const res = await fetch(`${API_BASE}/sellers/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update seller status' }));
      throw new Error(err.error || 'Failed to update seller status');
    }
    return res.json();
  },

  async updateSellerCommission(id: string, commissionRate: number): Promise<Seller> {
    const res = await fetch(`${API_BASE}/sellers/${id}/commission`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ commissionRate }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update seller commission' }));
      throw new Error(err.error || 'Failed to update seller commission');
    }
    return res.json();
  },

  async requestPayout(sellerId: string, amount: number, methodTitle: string): Promise<{ success: boolean; message: string; balance: number }> {
    const res = await fetch(`${API_BASE}/sellers/${sellerId}/payout`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ amount, methodTitle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Payout request failed' }));
      throw new Error(err.error || err.message || 'Payout request failed');
    }
    return res.json();
  },

  // Orders
  async getOrders(): Promise<MarketplaceOrder[]> {
    const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch orders' }));
      throw new Error(err.error || 'Failed to fetch orders');
    }
    return res.json();
  },

  async calculateQuote(params: {
    cart?: CartItem[];
    items?: Array<{ productId: string; variantId?: string; quantity: number }>;
    destinationCity?: string;
    discountCode?: string;
  }): Promise<{
    success: boolean;
    totalSubtotalEGP: number;
    totalShippingEGP: number;
    discountEGP: number;
    totalAmountEGP: number;
    vendorQuotes: Array<{
      sellerId: string;
      sellerName: string;
      subtotalEGP: number;
      shippingFeeEGP: number;
      commissionEGP: number;
      sellerNetEGP: number;
      items: Array<{
        productId: string;
        variantId?: string;
        titleAr: string;
        quantity: number;
        unitPriceEGP: number;
        totalPriceEGP: number;
      }>;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/orders/quote`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to calculate quote' }));
      throw new Error(err.error || 'Failed to calculate quote');
    }
    return res.json();
  },

  async createOrder(params: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: EgyptianAddress;
    paymentMethod: PaymentMethod;
    cart?: CartItem[];
    items?: Array<{ productId: string; variantId?: string; quantity: number }>;
    discountCode?: string;
    idempotencyKey?: string;
  }): Promise<MarketplaceOrder> {
    const customHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (params.idempotencyKey) {
      customHeaders['Idempotency-Key'] = params.idempotencyKey;
    }

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: authHeaders(customHeaders),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to place order' }));
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async updateSubOrderStatus(orderId: string, subOrderId: string, status: OrderStatus, noteAr: string): Promise<MarketplaceOrder> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/suborders/${subOrderId}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, noteAr }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update suborder status' }));
      throw new Error(err.error || 'Failed to update suborder status');
    }
    return res.json();
  },

  async updateOverallOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<MarketplaceOrder> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تحديث حالة الطلب' }));
      throw new Error(err.error || 'فشل تحديث حالة الطلب');
    }
    return res.json();
  },

  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; message?: string; order: MarketplaceOrder }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إلغاء الطلب' }));
      throw new Error(err.error || 'فشل إلغاء الطلب');
    }
    return res.json();
  },

  // Courier & Express Logistics Methods
  async getCourierDeliveries(): Promise<MarketplaceOrder[]> {
    const res = await fetch(`${API_BASE}/courier/deliveries`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل جلب شحنات المندوب' }));
      throw new Error(err.error || 'فشل جلب شحنات المندوب');
    }
    return res.json();
  },

  async markOrderOutForDelivery(orderId: string): Promise<MarketplaceOrder> {
    const res = await fetch(`${API_BASE}/courier/orders/${orderId}/out-for-delivery`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تحويل الشحنة للتوصيل' }));
      throw new Error(err.error || 'فشل تحويل الشحنة للتوصيل');
    }
    return res.json();
  },

  async confirmCourierDelivery(orderId: string, otp: string, paymentCollected?: number, notes?: string): Promise<{ success: boolean; order: MarketplaceOrder }> {
    const res = await fetch(`${API_BASE}/courier/orders/${orderId}/deliver`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ otp, paymentCollected, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تأكيد التسليم' }));
      throw new Error(err.error || 'فشل تأكيد التسليم');
    }
    return res.json();
  },

  async updateCourierWorkflowStage(orderId: string, stage: CourierDeliveryStage, note?: string): Promise<MarketplaceOrder> {
    const res = await fetch(`${API_BASE}/courier/orders/${orderId}/workflow`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ stage, note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تحديث مرحلة التوصيل' }));
      throw new Error(err.error || 'فشل تحديث مرحلة التوصيل');
    }
    return res.json();
  },

  async reportCourierException(orderId: string, data: {
    reason: DeliveryExceptionReason;
    resolution: DeliveryExceptionResolution;
    note?: string;
    rescheduleDate?: string;
  }): Promise<{ success: boolean; order: MarketplaceOrder }> {
    const res = await fetch(`${API_BASE}/courier/orders/${orderId}/exception`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تسجيل تعذر التسليم' }));
      throw new Error(err.error || 'فشل تسجيل تعذر التسليم');
    }
    return res.json();
  },

  async submitCourierShiftSettlement(settlement: Partial<CourierShiftSettlement>): Promise<{ success: boolean; settlement: CourierShiftSettlement }> {
    const res = await fetch(`${API_BASE}/courier/shift/settlement`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settlement),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تسوية الوردية' }));
      throw new Error(err.error || 'فشل تسوية الوردية');
    }
    return res.json();
  },

  async getCourierShiftSettlements(): Promise<CourierShiftSettlement[]> {
    const res = await fetch(`${API_BASE}/courier/shift/settlements`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل جلب تسويات الوردية' }));
      throw new Error(err.error || 'فشل جلب تسويات الوردية');
    }
    return res.json();
  },

  async getSupportInbox(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/support/inbox`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل جلب صندوق وارد الدعم الفني' }));
      throw new Error(err.error || 'فشل جلب صندوق وارد الدعم الفني');
    }
    return res.json();
  },

  async getSupportCustomer360(customerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/support/customer-360/${customerId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل جلب بيانات العميل 360' }));
      throw new Error(err.error || 'فشل جلب بيانات العميل 360');
    }
    return res.json();
  },

  async refundSubOrder(orderId: string, subOrderId: string, params: {
    amountEGP?: number;
    reason: string;
    restockInventory?: boolean;
  }): Promise<{ success: boolean; order: MarketplaceOrder; refundId: string }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/suborders/${subOrderId}/refund`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to refund suborder' }));
      throw new Error(err.error || 'Failed to refund suborder');
    }
    return res.json();
  },

  async confirmPayment(orderId: string, transactionRef?: string, paymentMethod?: PaymentMethod): Promise<MarketplaceOrder> {
    const res = await fetch(`${API_BASE}/payments/confirm`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ orderId, transactionRef, paymentMethod }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to confirm payment' }));
      throw new Error(err.error || 'Failed to confirm payment');
    }
    return res.json();
  },

  // Disputes
  async getDisputes(): Promise<Dispute[]> {
    const res = await fetch(`${API_BASE}/disputes`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch disputes' }));
      throw new Error(err.error || 'Failed to fetch disputes');
    }
    return res.json();
  },

  async createDispute(data: {
    orderId: string;
    subOrderId: string;
    reason: Dispute['reason'];
    description: string;
    requestedResolution: Dispute['requestedResolution'];
  }): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create dispute' }));
      throw new Error(err.error || 'Failed to create dispute');
    }
    return res.json();
  },

  async replyToDispute(disputeId: string, message: string, sender?: 'customer' | 'seller' | 'admin' | 'support', senderName?: string): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/${disputeId}/messages`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message, sender, senderName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async addDisputeNote(disputeId: string, note: string): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/${disputeId}/notes`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add internal note' }));
      throw new Error(err.error || 'Failed to add internal note');
    }
    return res.json();
  },

  async updateDisputeStatus(disputeId: string, status: string, priority?: string): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/${disputeId}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, priority }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update ticket status' }));
      throw new Error(err.error || 'Failed to update ticket status');
    }
    return res.json();
  },

  async resolveDispute(disputeId: string, status: 'resolved' | 'rejected', resolutionText: string, refundAmountEGP?: number): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, resolutionText, refundAmountEGP }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to resolve dispute' }));
      throw new Error(err.error || 'Failed to resolve dispute');
    }
    return res.json();
  },

  async getDisputeContext(disputeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/disputes/${disputeId}/context`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch dispute context' }));
      throw new Error(err.error || 'Failed to fetch dispute context');
    }
    return res.json();
  },

  // Admin Metrics & Ledger
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch admin metrics' }));
      throw new Error(err.error || 'Failed to fetch admin metrics');
    }
    return res.json();
  },

  async getAdminLedger() {
    const res = await fetch(`${API_BASE}/admin/ledger`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch admin ledger' }));
      throw new Error(err.error || 'Failed to fetch admin ledger');
    }
    return res.json();
  },

  async getReconciliationAudit(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reconciliation/audit`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل فحص مطابقة وتدقيق البيانات' }));
      throw new Error(err.error || 'فشل فحص مطابقة وتدقيق البيانات');
    }
    return res.json();
  },

  async autoHealReconciliation(): Promise<{ healedCount: number; message: string }> {
    const res = await fetch(`${API_BASE}/admin/reconciliation/auto-heal`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تنفيذ المعالجة الذاتية للبيانات' }));
      throw new Error(err.error || 'فشل تنفيذ المعالجة الذاتية للبيانات');
    }
    return res.json();
  },

  // Media, Object Storage & KYC Vault (Tier 06)
  async uploadMedia(data: {
    filename: string;
    mimeType: string;
    purpose: string;
    base64Data: string;
    associatedEntityType?: string;
    associatedEntityId?: string;
  }): Promise<StoredFile> {
    const res = await fetch(`${API_BASE}/storage/upload`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل رفع الملف' }));
      throw new Error(err.error || 'فشل رفع الملف');
    }
    return res.json();
  },

  async getFileMetadata(fileId: string): Promise<StoredFile> {
    const res = await fetch(`${API_BASE}/storage/files/${fileId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل جلب بيانات الملف' }));
      throw new Error(err.error || 'فشل جلب بيانات الملف');
    }
    return res.json();
  },

  async getSignedFileUrl(fileId: string, expiresInSeconds: number = 1800): Promise<{ signedUrl: string; expiresAt: string }> {
    const res = await fetch(`${API_BASE}/storage/files/${fileId}/signed-url?expiresIn=${expiresInSeconds}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء رابط التحميل الآمن' }));
      throw new Error(err.error || 'فشل إنشاء رابط التحميل الآمن');
    }
    return res.json();
  },

  async getKycDocuments(sellerId?: string): Promise<KycDocument[]> {
    const q = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : '';
    const res = await fetch(`${API_BASE}/storage/kyc${q}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل جلب مستندات التحقق' }));
      throw new Error(err.error || 'فشل جلب مستندات التحقق');
    }
    return res.json();
  },

  async uploadKycDocument(data: {
    sellerId?: string;
    documentType: KycDocumentType;
    titleAr: string;
    documentNumber?: string;
    filename: string;
    mimeType: string;
    base64Data: string;
    purpose?: string;
  }): Promise<KycDocument> {
    const res = await fetch(`${API_BASE}/storage/kyc`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل رفع مستند التحقق' }));
      throw new Error(err.error || 'فشل رفع مستند التحقق');
    }
    return res.json();
  },

  async reviewKycDocument(
    kycId: string, 
    status: KycStatus, 
    reviewNotes?: string, 
    expiryDate?: string
  ): Promise<KycDocument> {
    const res = await fetch(`${API_BASE}/storage/kyc/${kycId}/review`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, reviewNotes, expiryDate }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تسجيل قرار المراجعة' }));
      throw new Error(err.error || 'فشل تسجيل قرار المراجعة');
    }
    return res.json();
  },

  // Admin User & Product Management
  async getAdminUsers(): Promise<AuthUser[]> {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch admin users' }));
      throw new Error(err.error || 'Failed to fetch admin users');
    }
    return res.json();
  },

  async updateUserRole(id: string, role: Role): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update user role' }));
      throw new Error(err.error || 'Failed to update user role');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete user' }));
      throw new Error(err.error || 'Failed to delete user');
    }
    return res.json();
  },

  async getAdminAuditLogs(params?: { actorId?: string; action?: string; resourceType?: string; severity?: string; limit?: number }): Promise<any[]> {
    const q = new URLSearchParams();
    if (params?.actorId) q.set('actorId', params.actorId);
    if (params?.action) q.set('action', params.action);
    if (params?.resourceType) q.set('resourceType', params.resourceType);
    if (params?.severity) q.set('severity', params.severity);
    if (params?.limit) q.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/admin/audit-logs?${q.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch audit logs' }));
      throw new Error(err.error || 'Failed to fetch audit logs');
    }
    return res.json();
  },

  // Certified Sellers & Moderation
  async createSeller(sellerData: any): Promise<Seller> {
    const res = await fetch(`${API_BASE}/sellers`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(sellerData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إضافة المتجر المعتمد' }));
      throw new Error(err.error || 'فشل إضافة المتجر المعتمد');
    }
    return res.json();
  },

  async verifySeller(sellerId: string, status: 'verified' | 'pending' | 'rejected'): Promise<Seller> {
    const res = await fetch(`${API_BASE}/sellers/${sellerId}/verification`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تحديث حالة الاعتماد' }));
      throw new Error(err.error || 'فشل تحديث حالة الاعتماد');
    }
    return res.json();
  },

  // Announcements & Banner Ads
  async getAnnouncements(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/announcements`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createAnnouncement(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء الإعلان' }));
      throw new Error(err.error || 'فشل إنشاء الإعلان');
    }
    return res.json();
  },

  async updateAnnouncement(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تعديل الإعلان' }));
      throw new Error(err.error || 'فشل تعديل الإعلان');
    }
    return res.json();
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('فشل حذف الإعلان');
    return res.json();
  },

  // Hero Carousel Slides
  async getHeroSlides(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/hero-slides`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createHeroSlide(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/hero-slides`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إضافة شريحة البانر' }));
      throw new Error(err.error || 'فشل إضافة شريحة البانر');
    }
    return res.json();
  },

  async deleteHeroSlide(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/hero-slides/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('فشل حذف شريحة البانر');
    return res.json();
  },

  // Coupons & Promo Codes
  async getCoupons(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/coupons`, { headers: authHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createCoupon(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء كود الخصم' }));
      throw new Error(err.error || 'فشل إنشاء كود الخصم');
    }
    return res.json();
  },

  async deleteCoupon(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('فشل حذف الكوبون');
    return res.json();
  },

  // --- High-Scale Inventory Reservations & Flash-Sale TTL Lock Engine ---
  async reserveItem(params: {
    productId: string;
    variantId?: string;
    size?: string;
    quantity?: number;
    durationMinutes?: number;
  }): Promise<{
    success: boolean;
    reservation?: any;
    availableStock?: number;
    reservedByOthers?: number;
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/inventory/reserve`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async releaseReservation(reservationId?: string): Promise<{ success: boolean; releasedCount?: number }> {
    const res = await fetch(`${API_BASE}/inventory/release`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reservationId }),
    });
    return res.json();
  },

  async getInventoryStatus(productId: string, variantId?: string): Promise<{
    productId: string;
    variantId?: string;
    totalStock: number;
    reservedByOthers: number;
    reservedByCaller: number;
    availableNow: number;
    isScarce: boolean;
    hasCompetitorHold: boolean;
    callerReservationId?: string;
    callerExpiresAt?: string;
    callerRemainingSeconds?: number;
  }> {
    const q = variantId ? `?variantId=${encodeURIComponent(variantId)}` : '';
    const res = await fetch(`${API_BASE}/inventory/status/${encodeURIComponent(productId)}${q}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      return {
        productId,
        variantId,
        totalStock: 5,
        reservedByOthers: 0,
        reservedByCaller: 0,
        availableNow: 5,
        isScarce: false,
        hasCompetitorHold: false,
      };
    }
    return res.json();
  },

  async getMyReservations(): Promise<{ reservations: any[] }> {
    const res = await fetch(`${API_BASE}/inventory/my-reservations`, {
      headers: authHeaders(),
    });
    if (!res.ok) return { reservations: [] };
    return res.json();
  }
};
