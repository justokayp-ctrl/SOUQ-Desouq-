export type Role = 'customer' | 'seller' | 'admin' | 'support' | 'courier';

export type ShoppingUniverse = 'all' | 'women' | 'men' | 'kids';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  sellerId?: string;
  createdAt?: string;
  emailVerified?: boolean;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  token: string;
  user: AuthUser;
}

export type EgyptianGovernorate = 
  | 'كفر الشيخ' 
  | 'الغربية' 
  | 'البحيرة' 
  | 'الإسكندرية' 
  | 'القاهرة' 
  | 'الجيزة' 
  | 'الدقهلية' 
  | 'الشرقية' 
  | 'المنوفية' 
  | 'دمياط'
  | 'باقي محافظات مصر';

export interface EgyptianAddress {
  id: string;
  fullName: string;
  phone: string; // Egyptian phone format e.g. 01012345678
  governorate: EgyptianGovernorate;
  city: string; // e.g. دسوق، كفر الشيخ، فوه، مطوبس، قلين، سيدي سالم
  district: string; // e.g. شارع الجيش، الميدان الإبراهيمي، دحروج، الصفا، الكورنيش
  streetDetails: string;
  buildingNo: string;
  floorNo?: string;
  apartmentNo?: string;
  nearestLandmark?: string;
  isDefault?: boolean;
}

export type SellerStatus = 'active' | 'suspended' | 'under_review';

export interface Seller {
  id: string;
  name: string; // e.g. "أقمشة ومنسوجات دلتا دسوق"
  ownerName: string;
  arabicName: string;
  tradeName?: string;
  slug: string;
  logo: string;
  banner: string;
  logoUrl?: string;
  bannerUrl?: string;
  email?: string;
  sloganAr?: string;
  storyAr?: string;
  description?: string;
  rating: number;
  reviewCount: number;
  governorate: EgyptianGovernorate;
  city: string; // e.g. دسوق
  district?: string;
  address: string;
  detailedAddress?: string;
  phone: string;
  desoqDistrict?: string;
  kycDocuments?: any[];
  status?: SellerStatus;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  isVerified?: boolean;
  taxRegistrationNumber: string;
  commercialRecordNumber: string;
  joinedDate: string;
  memberSince?: string;
  commissionRate: number; // e.g. 0.08 for 8%
  bankAccountOrWallet: {
    type: 'instapay' | 'vodafone_cash' | 'bank_account';
    accountNumber: string;
    accountTitle: string;
  };
  totalSalesEGP: number;
  availableBalanceEGP: number;
  pendingBalanceEGP: number;
  isHeritageArtisan?: boolean;
}

export interface ProductCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr?: string;
  titleEn?: string;
  icon: string;
  description: string;
  productCount: number;
}

export type ProductListingStatus = 
  | 'active' 
  | 'draft' 
  | 'incomplete' 
  | 'pending_moderation' 
  | 'suppressed' 
  | 'out_of_stock' 
  | 'suspended' 
  | 'inactive'
  | 'archived';

export interface ListingComplianceIssue {
  id: string;
  type: 'missing_info' | 'invalid_attribute' | 'category_restriction' | 'brand_restriction' | 'image_error' | 'compliance_issue';
  severity: 'error' | 'warning' | 'info';
  field: string;
  titleAr: string;
  messageAr: string;
  suggestedStep: number;
}

export interface ProductVariant {
  id: string;
  name?: string; // e.g. "أزرق - مقاس L" or "عبوة 1 كجم"
  title?: string; // Alternative display label for variant
  nameAr?: string;
  nameEn?: string;
  sku?: string;
  barcode?: string;
  priceEGP: number;
  stock: number;
  gtin?: string;
  attributes?: Record<string, string>;
  size?: string;
  color?: string;
  colorHex?: string;
  style?: string;
  volume?: string;
  packSize?: string;
  image?: string;
  status?: ProductListingStatus;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerCity: string;
  rating: number;
  comment: string;
  date: string;
  isVerifiedPurchase: boolean;
  sellerResponse?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn?: string;
  category: string;
  subcategory?: string;
  productType?: string;
  priceEGP: number;
  originalPriceEGP?: number;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isDesoqLocalMade?: boolean; // خاص بمنتجات مصنعة في دسوق وتراثها
  isFastDesoqDelivery?: boolean; // تسليم فوري في دسوق خلال 24 ساعة
  
  // Enterprise Listing & Amazon-Style Catalog Specifications
  gtin?: string;
  gtinType?: 'GTIN' | 'EAN' | 'UPC' | 'ASIN' | 'ISBN' | 'DSQ_LOCAL';
  isGtinExempt?: boolean;
  gtinExemptionReason?: string;
  brand?: string;
  manufacturer?: string;
  modelNumber?: string;
  bulletPoints?: string[]; // 5 Key product bullet points
  searchTerms?: string[]; // Backend SEO search terms
  videoUrl?: string;
  condition?: 'new' | 'new_open_box' | 'refurbished' | 'handmade_custom';
  fulfillmentMethod?: 'FBM' | 'FBD'; // FBM = Merchant, FBD = Desoq Express
  handlingTimeDays?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  listingHealthScore?: number; // 0 - 100 Quality index
  complianceIssues?: ListingComplianceIssue[];
  
  // Variations
  hasVariations?: boolean;
  variationTheme?: 'none' | 'size' | 'color' | 'style' | 'size_color' | 'pack_size' | 'volume' | 'custom';
  parentListingId?: string;
  variants?: ProductVariant[];

  attributes: {
    brand?: string;
    origin?: string;
    warranty?: string;
    material?: string;
    weight?: string;
    sku?: string;
    [key: string]: string | undefined;
  };
  status: ProductListingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  sellerId: string;
}

export type PaymentMethod = 
  | 'cash_on_delivery' // الدفع عند الاستلام
  | 'fawry' // فوري كود
  | 'vodafone_cash' // فودافون كاش ومحافظ المحمول
  | 'instapay' // إنستاباي
  | 'bank_card'; // بطاقة ائتمان / ميزة

export type OrderStatus = 
  | 'pending_payment'
  | 'processing'
  | 'seller_confirmed'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded'
  | 'exception';

export interface SellerSubOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotalEGP: number;
  shippingFeeEGP: number;
  commissionEGP: number;
  sellerNetEGP: number;
  status: OrderStatus;
  shippingProvider: 'DesoqExpress' | 'Bosta' | 'Aramex' | 'Mylerz';
  trackingNumber: string;
  estimatedDelivery: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    noteAr: string;
  }[];
}

export interface MarketplaceOrder {
  id: string;
  trackingCode: string; // e.g. SD-2026-8941
  idempotencyKey?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: EgyptianAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending_cod' | 'pending_fawry' | 'refunded' | 'partially_refunded';
  fawryReferenceCode?: string;
  subOrders: SellerSubOrder[];
  sellerSubOrders?: SellerSubOrder[];
  totalSubtotalEGP: number;
  totalShippingEGP: number;
  discountEGP: number;
  totalAmountEGP: number;
  totalPriceEGP?: number;
  createdAt: string;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  deliveryOtp?: string; // 4-digit code e.g. "4829"
  assignedCourierId?: string;
  assignedCourierName?: string;
  collectedCashEGP?: number;
  deliveredAt?: string;
  deliveryStage?: CourierDeliveryStage;
  exceptionReason?: DeliveryExceptionReason;
  exceptionResolution?: DeliveryExceptionResolution;
  exceptionNote?: string;
  exceptionTimestamp?: string;
}

export type DisputeStatus = 
  | 'open' 
  | 'urgent'
  | 'waiting_for_customer'
  | 'waiting_for_seller'
  | 'under_investigation' 
  | 'resolved' 
  | 'rejected'
  | 'opened' 
  | 'seller_review' 
  | 'admin_arbitration' 
  | 'resolved_refunded';

export type DisputePriority = 'urgent' | 'high' | 'normal' | 'low';

export interface InternalNote {
  id: string;
  authorName: string;
  note: string;
  timestamp: string;
}

export interface TicketAttachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  subOrderId: string;
  sellerId: string;
  sellerName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  reason: 'defective_product' | 'not_as_described' | 'wrong_item' | 'late_delivery' | 'other';
  description: string;
  requestedResolution: 'refund' | 'replacement';
  status: DisputeStatus;
  priority?: DisputePriority;
  resolution?: string;
  createdAt: string;
  updatedAt?: string;
  messages: {
    sender: 'customer' | 'seller' | 'admin' | 'support';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
  internalNotes?: InternalNote[];
  attachments?: TicketAttachment[];
}

export interface FinancialLedgerEntry {
  id: string;
  timestamp: string;
  type: string;
  sellerId: string;
  orderId?: string;
  subOrderId?: string;
  amountEGP: number;
  description: string;
  balanceAfterEGP: number;
}

// 18 Architecture Domains Representation (Version 2 Baseline & Implementation Audit)
// ==========================================
// Media, Object Storage & KYC Vault Types
// ==========================================
export type KycDocumentType = 
  | 'commercial_register' 
  | 'tax_card' 
  | 'national_id' 
  | 'bank_proof' 
  | 'other';

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface StoredFile {
  id: string;
  storageKey: string;
  bucket: 'public' | 'private';
  purpose: string;
  originalFilename: string;
  sanitizedFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256Checksum: string;
  ownerUserId?: string;
  ownerSellerId?: string;
  associatedEntityType: string;
  associatedEntityId?: string;
  publicUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    optimized?: boolean;
    isSensitive?: boolean;
    [key: string]: any;
  };
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  sellerId: string;
  fileId: string;
  file?: StoredFile;
  documentType: KycDocumentType;
  titleAr: string;
  documentNumber?: string;
  status: KycStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Admin Control Center Operational Types
// ==========================================
export interface AdminCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_egp';
  discountValue: number;
  discountPercent?: number;
  minOrderValueEGP: number;
  maxDiscountEGP?: number;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  startDate: string;
  endDate: string;
  targetCategory?: string;
  descriptionAr: string;
}

export interface AdminAnnouncement {
  id: string;
  titleAr: string;
  titleEn?: string;
  messageAr: string;
  contentAr?: string;
  actionLink?: string;
  type: 'info' | 'warning' | 'critical' | 'success' | 'promotion' | 'emergency';
  placement: 'top_banner' | 'modal' | 'seller_portal' | 'toast' | 'all';
  isActive: boolean;
  startDate: string;
  endDate: string;
  authorName: string;
}

export interface PayoutBatch {
  id: string;
  batchReference: string;
  totalAmountEGP: number;
  sellersCount: number;
  status: 'pending_approval' | 'processing' | 'settled' | 'rejected';
  payoutMethod: 'instapay' | 'bank_transfer' | 'fawry_valy';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface SystemAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  titleAr: string;
  descriptionAr: string;
  sourceModule: string;
  timestamp: string;
  isResolved: boolean;
  actionRequired?: string;
}

export interface HeroSlide {
  id: string | number;
  tag: string;
  title: string;
  titleAr?: string;
  desc: string;
  descAr?: string;
  ctaText: string;
  category: string;
  badge: string;
  bgGradient?: string;
  image: string;
}

export type DepartmentRealmId = 
  | 'gentleman'       // «ديوان الأناقة» - The Gentleman's Realm
  | 'sanctuary'       // «رواق الهوانم والمخمل» - The Haute Sanctuary
  | 'vanguard'        // «منصة العصر والريادة» - The Vanguard & Youth
  | 'little_royals';  // «عرين الصغار وأمراء الغد» - Little Royals & Co.

export type OccasionType = 
  | 'royal_wedding'       // سهرات ومناسبات ملكية
  | 'formal_business'     // رسميات وأعمال ولقاءات
  | 'daily_casual'        // كاجوال وأناقة يومية
  | 'festive_celebration' // أعياد ومواسم واحتفالات
  | 'heritage_craft';     // تراث دسوق وأصالة الصناعة

export interface LookbookItem {
  id: string;
  realmId: DepartmentRealmId;
  titleAr: string;
  titleEn: string;
  occasion: OccasionType;
  occasionNameAr: string;
  tagAr: string;
  descriptionAr: string;
  image: string;
  productIds: string[];
  stylingTipsAr: string;
  curatedPriceEGP: number;
  originalBundlePriceEGP: number;
  savingsPercentage: number;
}

export interface DepartmentSubWing {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  categoryFilter?: string;
  descriptionAr: string;
  badgeAr?: string;
  featuredImage?: string;
}

export interface DepartmentHouseConfig {
  id: DepartmentRealmId;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  sealBadgeAr: string;
  narrativeAr: string;
  heroImage: string;
  bgGradient: string;
  primaryColor: string;
  accentColor: string;
  icon: string;
  subWings: DepartmentSubWing[];
  occasions: {
    id: OccasionType;
    nameAr: string;
    descriptionAr: string;
    icon: string;
  }[];
}

export type CourierDeliveryStage = 
  | 'assigned' 
  | 'picked_up' 
  | 'in_transit' 
  | 'arrived' 
  | 'delivered' 
  | 'failed';

export interface CourierShiftSettlement {
  id: string;
  courierId: string;
  courierName: string;
  date: string;
  ordersDeliveredCount: number;
  ordersFailedCount?: number;
  ordersPendingCount?: number;
  totalCodCollectedEGP: number;
  courierCommissionsEGP: number;
  netRemittanceDueEGP: number;
  paymentMethod: 'cash_safe' | 'instapay' | 'vodafone_cash';
  transactionRef?: string;
  notes?: string;
  status: 'submitted' | 'confirmed' | 'rejected';
  createdAt: string;
}

export type DeliveryExceptionReason = 
  | 'customer_unavailable' // العميل غير متاح
  | 'wrong_address'        // عنوان خاطئ أو غير دقيق
  | 'refused'              // رفض الاستلام
  | 'payment_problem'      // مشكلة في الدفع أو الفكة
  | 'damaged_package'      // طرد تالف أو متضرر
  | 'customer_unreachable' // alias
  | 'phone_switched_off'   // alias
  | 'customer_rescheduled' // alias
  | 'inaccurate_address'   // alias
  | 'customer_refused'     // alias
  | 'weather_or_traffic';

export type DeliveryExceptionResolution = 
  | 'reschedule'           // إعادة الجدولة
  | 'return_to_merchant'   // إرجاع للمتجر/المخزن
  | 'escalate_to_support'; // تصعيد لخدمة العملاء والتحكيم

export interface DeliveryExceptionRecord {
  id: string;
  orderId: string;
  trackingCode: string;
  reason: DeliveryExceptionReason;
  reasonAr: string;
  resolution?: DeliveryExceptionResolution;
  note?: string;
  rescheduleDate?: string;
  timestamp: string;
}



