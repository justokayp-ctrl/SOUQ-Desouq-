/**
 * ============================================================================
 * SOUQ DESOQ — INFORMATION ARCHITECTURE & ROLE-BASED NAVIGATION SYSTEM
 * ============================================================================
 * Defines the navigation model, routes, primary & secondary actions,
 * permissions, and workflows for each role:
 * 1. CUSTOMER: Discovery, Search, Catalog, Product Detail, Cart, Checkout, Orders, Wishlist, Compare, Storefronts
 * 2. SELLER: Dashboard, Products, Inventory, Orders, Buyers/Messages, Reviews, Promotions, Analytics, Finance/Payouts, KYC, Store Settings
 * 3. SUPPORT: Dispute Tickets, Customers, Orders & Audits, Sellers, Conversations, Resolution & Consumer Protection (Law 181/2018)
 * 4. ADMIN: Executive GMV Dashboard, Marketplace Control, Seller Onboarding & Approvals, Product Moderation, Orders & Logistics, DesoqPay Financial Ledger, KYC Vault, Circuit Breakers, Audit Logs
 * ============================================================================
 */

import { Role } from '../types';

export interface RouteMeta {
  id: string;
  role: Role | 'all';
  path: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  badge?: string;
  primaryAction?: {
    labelAr: string;
    labelEn: string;
    actionId: string;
  };
  secondaryActions?: {
    labelAr: string;
    labelEn: string;
    actionId: string;
  }[];
  breadcrumbs: {
    labelAr: string;
    labelEn: string;
    path: string;
  }[];
  requiredPermission?: string;
}

export interface RoleNavigationConfig {
  role: Role;
  roleTitleAr: string;
  roleTitleEn: string;
  defaultRoute: string;
  navGroups: {
    groupTitleAr: string;
    groupTitleEn: string;
    routes: RouteMeta[];
  }[];
}

export const ROLE_NAVIGATION_REGISTRY: Record<Role, RoleNavigationConfig> = {
  customer: {
    role: 'customer',
    roleTitleAr: 'المشتري',
    roleTitleEn: 'Customer Experience',
    defaultRoute: 'catalog',
    navGroups: [
      {
        groupTitleAr: 'التسوق والاستكشاف',
        groupTitleEn: 'Shop & Discover',
        routes: [
          {
            id: 'catalog',
            role: 'customer',
            path: '/',
            titleAr: 'الرئيسية واكتشاف السوق',
            titleEn: 'Home & Marketplace Discovery',
            descriptionAr: 'استكشف واجهة سوق دسوق الرئيسية، العروض اليومية، والمصنوعات التراثية',
            descriptionEn: 'Explore Souq Desoq home discovery, daily deals, and heritage artisan collections',
            iconName: 'Home',
            breadcrumbs: [{ labelAr: 'الرئيسية', labelEn: 'Home', path: '/' }],
          },
          {
            id: 'category_hub',
            role: 'customer',
            path: '/categories',
            titleAr: 'دليل ومستكشف الأقسام الشامل',
            titleEn: 'Category Explorer & Directory',
            descriptionAr: 'استكشف كافة الأروقة والتصنيفات الدقيقة للمنتجات والمصنوعات في دسوق',
            descriptionEn: 'Comprehensive category tree, subcategories, and precision product discovery',
            iconName: 'Layers',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'دليل الأقسام', labelEn: 'Categories', path: '/categories' },
            ],
          },
          {
            id: 'sellers_directory',
            role: 'customer',
            path: '/sellers',
            titleAr: 'دليل صُنّاع ومتاجر دسوق المعتمدين',
            titleEn: 'Artisans & Sellers Directory',
            descriptionAr: 'تصفح قائمة المشاغل وورش وتجار دسوق الموثقين وتعرف على تقييماتهم ومعروضاتهم',
            descriptionEn: 'Discover verified Desoq artisans, workshops, and official merchant stores',
            iconName: 'Store',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'دليل المتاجر', labelEn: 'Sellers', path: '/sellers' },
            ],
          },
          {
            id: 'flash_deals',
            role: 'customer',
            path: '/deals',
            titleAr: 'صفقات التوفير والعروض الخاطفة',
            titleEn: 'Flash Deals & Daily Drops',
            descriptionAr: 'عروض يومية وخصومات تصل إلى 50% من مصانع وتجار دسوق مع شحن سريع',
            descriptionEn: 'Time-limited flash deals, factory clearance sales, and daily savings',
            iconName: 'Flame',
            badge: 'خصومات اليوم',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'عروض اليوم', labelEn: 'Deals', path: '/deals' },
            ],
          },
          {
            id: 'curated_collections',
            role: 'customer',
            path: '/collections',
            titleAr: 'المجموعات المختارة ودليل المناسبات',
            titleEn: 'Curated Collections & Gift Guides',
            descriptionAr: 'باقات وتنسيقات منتقاة لجهاز العروسة، الهدايا، والأناقة الملكية مع تخفيض باقات فوري',
            descriptionEn: 'Themed gift bundles, wedding suites, and complete lookbooks',
            iconName: 'Sparkles',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'المجموعات المختارة', labelEn: 'Collections', path: '/collections' },
            ],
          },
          {
            id: 'search_results',
            role: 'customer',
            path: '/search',
            titleAr: 'البحث المتقدم والفرز',
            titleEn: 'Search & Multi-Facet Filters',
            descriptionAr: 'بحث ذكي مع تصفية الأسعار، التقييمات، المصنوعات المحلية، والتسليم السريع',
            descriptionEn: 'Smart catalog search with multi-facet filters, sorting, and price range controls',
            iconName: 'Search',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'نتائج البحث', labelEn: 'Search', path: '/search' },
            ],
          },
          {
            id: 'wishlist',
            role: 'customer',
            path: '/wishlist',
            titleAr: 'قائمة الرغبات والمحفوظات',
            titleEn: 'Wishlist & Saved Items',
            descriptionAr: 'المنتجات التي قمت بحفظها لشرائها لاحقاً',
            descriptionEn: 'Saved handcrafted products for future purchase',
            iconName: 'Heart',
            primaryAction: {
              labelAr: 'نقل الكل للسلة',
              labelEn: 'Move All to Cart',
              actionId: 'move_all_to_cart',
            },
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'المفضلة', labelEn: 'Wishlist', path: '/wishlist' },
            ],
          },
          {
            id: 'compare',
            role: 'customer',
            path: '/compare',
            titleAr: 'المقارنة الفنية بين المنتجات',
            titleEn: 'Product Comparison Matrix',
            descriptionAr: 'قارن المواصفات والأسعار والمواد الخام جنباً إلى جنب',
            descriptionEn: 'Compare specifications, materials, and pricing side-by-side',
            iconName: 'SlidersHorizontal',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'المقارنة', labelEn: 'Compare', path: '/compare' },
            ],
          },
        ],
      },
      {
        groupTitleAr: 'الطلبات والخدمات',
        groupTitleEn: 'Orders & Services',
        routes: [
          {
            id: 'orders',
            role: 'customer',
            path: '/orders',
            titleAr: 'تتبع الطلبات والشحنات',
            titleEn: 'Track Orders & Deliveries',
            descriptionAr: 'متابعة مسار الشحنة خطوة بخطوة من مستودعات تجار دسوق إلى باب منزلك',
            descriptionEn: 'Track package journey from Desoq merchant hubs to your doorstep',
            iconName: 'Truck',
            badge: 'مباشر',
            primaryAction: {
              labelAr: 'فتح نزاع / إرجاع (قانون ١٨١)',
              labelEn: 'Open Return / Dispute',
              actionId: 'open_dispute',
            },
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'تتبع الطلبات', labelEn: 'Orders', path: '/orders' },
            ],
          },
          {
            id: 'seller_profile',
            role: 'customer',
            path: '/sellers',
            titleAr: 'دليل ورش ومتاجر دسوق المعتمدة',
            titleEn: 'Verified Desoq Storefronts',
            descriptionAr: 'تصفح ملفات التجار والسجلات التجارية وتقييمات المشترين السابقة',
            descriptionEn: 'Browse merchant profiles, commercial registrations, and ratings',
            iconName: 'Store',
            breadcrumbs: [
              { labelAr: 'الرئيسية', labelEn: 'Home', path: '/' },
              { labelAr: 'المتاجر المعتمدة', labelEn: 'Stores', path: '/sellers' },
            ],
          },
        ],
      },
    ],
  },

  seller: {
    role: 'seller',
    roleTitleAr: 'بوابة التاجر الدسوقي',
    roleTitleEn: 'Desoq Merchant Portal',
    defaultRoute: 'seller_dashboard',
    navGroups: [
      {
        groupTitleAr: 'العمليات الأساسية',
        groupTitleEn: 'Core Operations',
        routes: [
          {
            id: 'dashboard',
            role: 'seller',
            path: '/seller/dashboard',
            titleAr: 'لوحة قيادة المبيعات والأداء',
            titleEn: 'Merchant Dashboard',
            descriptionAr: 'نظرة شاملة على مبيعات اليوم، الطلبات المعلقة، وإجمالي الرصيد القابل للسحب',
            descriptionEn: 'Overview of daily sales, pending orders, and payout balances',
            iconName: 'LayoutDashboard',
            primaryAction: {
              labelAr: 'إضافة منتج جديد',
              labelEn: 'Add New Product',
              actionId: 'open_product_wizard',
            },
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'لوحة القيادة', labelEn: 'Dashboard', path: '/seller/dashboard' },
            ],
          },
          {
            id: 'products',
            role: 'seller',
            path: '/seller/products',
            titleAr: 'إدارة الكتالوج والمخزون',
            titleEn: 'Catalog & Inventory',
            descriptionAr: 'إضافة وتعديل المنتجات، ضبط الأسعار بالجنيه، وتحديث كميات المخزون وتنبيهات النفاذ',
            descriptionEn: 'Manage product listings, pricing in EGP, inventory levels, and stock alerts',
            iconName: 'Package',
            primaryAction: {
              labelAr: '+ منتج جديد',
              labelEn: '+ New Product',
              actionId: 'open_product_wizard',
            },
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'المنتجات والمخزون', labelEn: 'Products', path: '/seller/products' },
            ],
          },
          {
            id: 'orders',
            role: 'seller',
            path: '/seller/orders',
            titleAr: 'شحنات وطلبات المشترين',
            titleEn: 'Customer Orders & Shipments',
            descriptionAr: 'تأكيد تجهيز الطلبات، طباعة بوالص الشحن، وتسليم الطرود لمندوبي التوصيل',
            descriptionEn: 'Fulfill customer orders, generate waybills, and hand over parcels',
            iconName: 'ShoppingBag',
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'الطلبات والشحنات', labelEn: 'Orders', path: '/seller/orders' },
            ],
          },
        ],
      },
      {
        groupTitleAr: 'التسويق والتواصل والمالية',
        groupTitleEn: 'Engagement & Finance',
        routes: [
          {
            id: 'messages',
            role: 'seller',
            path: '/seller/messages',
            titleAr: 'استفسارات ومحادثات المشترين',
            titleEn: 'Customer Inquiries & Messages',
            descriptionAr: 'الرد المباشر على أسئلة المشترين حول المقاسات والمواصفات وخيارات التخصيص',
            descriptionEn: 'Direct buyer communications regarding custom orders and sizing',
            iconName: 'MessageSquare',
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'الرسائل', labelEn: 'Messages', path: '/seller/messages' },
            ],
          },
          {
            id: 'reviews',
            role: 'seller',
            path: '/seller/reviews',
            titleAr: 'تقييمات وآراء العملاء',
            titleEn: 'Customer Reviews & Reputation',
            descriptionAr: 'متابعة تقييمات الجودة والرد الرسمي على مراجعات المشترين',
            descriptionEn: 'Monitor store ratings and post verified merchant responses',
            iconName: 'Star',
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'التقييمات', labelEn: 'Reviews', path: '/seller/reviews' },
            ],
          },
          {
            id: 'promotions',
            role: 'seller',
            path: '/seller/promotions',
            titleAr: 'العروض وكوبونات الخصم',
            titleEn: 'Discounts & Promo Codes',
            descriptionAr: 'إنشاء قسائم خصم مخصصة ومواسم التخفيضات المحلية',
            descriptionEn: 'Create promotional campaigns and custom discount codes',
            iconName: 'Tag',
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'العروض', labelEn: 'Promotions', path: '/seller/promotions' },
            ],
          },
          {
            id: 'payouts',
            role: 'seller',
            path: '/seller/payouts',
            titleAr: 'المحفظة المالية وطلبات السحب',
            titleEn: 'Financial Wallet & Payouts',
            descriptionAr: 'كشف حساب المبيعات والعمولات وطلب تحويل فوري عبر إنستاباي، فودافون كاش، أو الحساب البنكي',
            descriptionEn: 'Sales ledger, platform commissions, and instant payouts via InstaPay / Mobile Wallets',
            iconName: 'Wallet',
            primaryAction: {
              labelAr: 'طلب سحب أرباح فوري',
              labelEn: 'Request Payout',
              actionId: 'request_payout',
            },
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'المستحقات المالية', labelEn: 'Payouts', path: '/seller/payouts' },
            ],
          },
          {
            id: 'kyc',
            role: 'seller',
            path: '/seller/kyc',
            titleAr: 'التوثيق القانوني ومستودع KYC',
            titleEn: 'Legal KYC Verification Vault',
            descriptionAr: 'رفع وتجديد السجل التجاري والبطاقة الضريبية لضمان شارة التاجر الموثوق',
            descriptionEn: 'Upload and verify Commercial Register and Tax Card for verified status',
            iconName: 'ShieldCheck',
            breadcrumbs: [
              { labelAr: 'بوابة التاجر', labelEn: 'Seller Portal', path: '/seller' },
              { labelAr: 'التوثيق KYC', labelEn: 'KYC Vault', path: '/seller/kyc' },
            ],
          },
        ],
      },
    ],
  },

  support: {
    role: 'support',
    roleTitleAr: 'مركز الدعم والتحكيم وفض المنازعات',
    roleTitleEn: 'Arbitration & Customer Support',
    defaultRoute: 'support_disputes',
    navGroups: [
      {
        groupTitleAr: 'فض المنازعات وحماية المستهلك',
        groupTitleEn: 'Dispute Arbitration',
        routes: [
          {
            id: 'tickets',
            role: 'support',
            path: '/support/tickets',
            titleAr: 'تذاكر النزاعات وقانون ١٨١',
            titleEn: 'Dispute Tickets (Law 181/2018)',
            descriptionAr: 'التحقيق في طلبات الاسترجاع والشكاوى وتطبيق الضمانات القانونية بين المشتري والتاجر',
            descriptionEn: 'Arbitrate customer returns and ensure compliance with Law 181/2018',
            iconName: 'Ticket',
            badge: 'مستعجل',
            primaryAction: {
              labelAr: 'إصدار قرار تحكيم',
              labelEn: 'Issue Arbitration Ruling',
              actionId: 'resolve_ticket',
            },
            breadcrumbs: [
              { labelAr: 'مركز الدعم', labelEn: 'Support Center', path: '/support' },
              { labelAr: 'تذاكر النزاعات', labelEn: 'Tickets', path: '/support/tickets' },
            ],
          },
          {
            id: 'customers',
            role: 'support',
            path: '/support/customers',
            titleAr: 'سجل المشترين والشكاوى السابقة',
            titleEn: 'Customer History & Records',
            descriptionAr: 'الاطلاع على سجل طلبات المشترين وعناوين الشحن وسجل النزاعات السابقة',
            descriptionEn: 'View customer purchase histories, verified addresses, and dispute records',
            iconName: 'Users',
            breadcrumbs: [
              { labelAr: 'مركز الدعم', labelEn: 'Support Center', path: '/support' },
              { labelAr: 'سجل المشترين', labelEn: 'Customers', path: '/support/customers' },
            ],
          },
          {
            id: 'sellers',
            role: 'support',
            path: '/support/sellers',
            titleAr: 'ملفات التجار وسجل الالتزام',
            titleEn: 'Merchant Compliance Records',
            descriptionAr: 'متابعة نسبة الشكاوى لكل تاجر وسرعة استجابته لطلبات الاستبدال ورد الأموال',
            descriptionEn: 'Track merchant dispute rates, response times, and refund records',
            iconName: 'Store',
            breadcrumbs: [
              { labelAr: 'مركز الدعم', labelEn: 'Support Center', path: '/support' },
              { labelAr: 'ملفات التجار', labelEn: 'Sellers', path: '/support/sellers' },
            ],
          },
        ],
      },
    ],
  },

  admin: {
    role: 'admin',
    roleTitleAr: 'لوحة الإدارة والرقابة العليا',
    roleTitleEn: 'Executive Marketplace Deck',
    defaultRoute: 'admin_deck',
    navGroups: [
      {
        groupTitleAr: 'الرقابة وإدارة المنصة',
        groupTitleEn: 'Marketplace Governance',
        routes: [
          {
            id: 'dashboard',
            role: 'admin',
            path: '/admin/dashboard',
            titleAr: 'مؤشرات الأداء والحجم الإجمالي (GMV)',
            titleEn: 'GMV & Executive Analytics',
            descriptionAr: 'مراقبة إجمالي المعاملات المالية، حجم الطلبات، ومعدل نمو التجار في كفر الشيخ',
            descriptionEn: 'Monitor Gross Merchandise Volume, order velocity, and merchant growth',
            iconName: 'BarChart3',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'المؤشرات المالية', labelEn: 'Analytics', path: '/admin/dashboard' },
            ],
          },
          {
            id: 'sellers',
            role: 'admin',
            path: '/admin/sellers',
            titleAr: 'اعتماد التجار وتوثيق السجلات',
            titleEn: 'Merchant Approvals & Onboarding',
            descriptionAr: 'مراجعة طلبات انضمام التجار الجدد وتحديد نسبة العمولة الرسمية وتوثيق السجل التجاري',
            descriptionEn: 'Approve new merchant applications, set commission rates, and audit licenses',
            iconName: 'Store',
            badge: 'طلبات معلقة',
            primaryAction: {
              labelAr: 'اعتماد تاجر جديد',
              labelEn: 'Approve Seller',
              actionId: 'approve_seller',
            },
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'إدارة التجار', labelEn: 'Sellers', path: '/admin/sellers' },
            ],
          },
          {
            id: 'products',
            role: 'admin',
            path: '/admin/products',
            titleAr: 'رقابة الكتالوج والمنتجات',
            titleEn: 'Product Catalog Moderation',
            descriptionAr: 'فحص جودة المنتجات، اعتماد شارات التميز، وحظر المنتجات المخالفة',
            descriptionEn: 'Inspect product quality, assign premium badges, and enforce policy',
            iconName: 'Package',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'رقابة المنتجات', labelEn: 'Products', path: '/admin/products' },
            ],
          },
          {
            id: 'orders',
            role: 'admin',
            path: '/admin/orders',
            titleAr: 'حركة الطلبات والشحن المركزي',
            titleEn: 'Orders & Logistics Operations',
            descriptionAr: 'مراقبة خطوط الشحن، أداء شركات التوصيل، والتأخيرات اللوجستية في دلتا مصر',
            descriptionEn: 'Monitor delivery partners, courier performance, and fulfillment times',
            iconName: 'Truck',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'الطلبات واللوجستيات', labelEn: 'Orders', path: '/admin/orders' },
            ],
          },
        ],
      },
      {
        groupTitleAr: 'المالية والأمان والتكامل',
        groupTitleEn: 'Finance, Security & Telemetry',
        routes: [
          {
            id: 'finance',
            role: 'admin',
            path: '/admin/finance',
            titleAr: 'الدفتر المالي المركزي ودسوق باي',
            titleEn: 'DesoqPay Central Financial Ledger',
            descriptionAr: 'سجل العمليات المالية المزدوجة، التسويات البنكية، والتدقيق المحاسبي للعمولات',
            descriptionEn: 'Double-entry transaction ledger, banking reconciliation, and revenue auditing',
            iconName: 'Wallet',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'الدفتر المالي', labelEn: 'Finance', path: '/admin/finance' },
            ],
          },
          {
            id: 'content',
            role: 'admin',
            path: '/admin/content',
            titleAr: 'خزنة وثائق KYC والرقابة القانونية',
            titleEn: 'Central KYC Vault & Legal Compliance',
            descriptionAr: 'فحص المستندات الحكومية المشفرة وتجديد صلاحيات السجلات والبطاقات الضريبية',
            descriptionEn: 'Audit encrypted legal documents and review tax compliance certificates',
            iconName: 'ShieldCheck',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'وثائق KYC', labelEn: 'KYC Vault', path: '/admin/content' },
            ],
          },
          {
            id: 'system-status',
            role: 'admin',
            path: '/admin/system-status',
            titleAr: 'مفاتيح الأمان وقواطع الدائرة (Circuit Breakers)',
            titleEn: 'System Health & Circuit Breakers',
            descriptionAr: 'التحكم الفوري في بوابات الدفع الإلكتروني وخدمات الشحن الخارجي وقت الطوارئ',
            descriptionEn: 'Control emergency circuit breakers for payments and shipping integrations',
            iconName: 'FileCode',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'قواطع الأمان', labelEn: 'Circuit Breakers', path: '/admin/system-status' },
            ],
          },
          {
            id: 'audit-logs',
            role: 'admin',
            path: '/admin/audit-logs',
            titleAr: 'سجل التدقيق والامتثال الأمني',
            titleEn: 'Security Audit Logs & Compliance',
            descriptionAr: 'سجل غير قابل للتعديل لجميع العمليات الإدارية الحساسة والتغييرات المالية',
            descriptionEn: 'Immutable audit logs tracking sensitive administrative and financial actions',
            iconName: 'ShieldCheck',
            breadcrumbs: [
              { labelAr: 'لوحة الإدارة', labelEn: 'Admin Deck', path: '/admin' },
              { labelAr: 'سجل التدقيق', labelEn: 'Audit Logs', path: '/admin/audit-logs' },
            ],
          },
        ],
      },
    ],
  },
  courier: {
    role: 'courier',
    roleTitleAr: 'مندوب الشحن والتوصيل',
    roleTitleEn: 'Delivery Agent & Courier',
    defaultRoute: 'courier_dispatch',
    navGroups: [
      {
        groupTitleAr: 'إدارة التوصيل والميدان',
        groupTitleEn: 'Dispatch & Field Operations',
        routes: [
          {
            id: 'courier_dispatch',
            role: 'courier',
            path: '/courier/dispatch',
            titleAr: 'جدول الشحنات والتوزيع الميداني',
            titleEn: 'Field Dispatch & Delivery Schedule',
            descriptionAr: 'استلام الطرود من التجار، تتبع خطوط السير بدسوق، وتأكيد التسليم برمز OTP',
            descriptionEn: 'Merchant package pickup, route optimization across Desoq, and OTP delivery confirmation',
            iconName: 'Truck',
            badge: 'مباشر',
            breadcrumbs: [
              { labelAr: 'بوابة المندوب', labelEn: 'Courier Portal', path: '/courier/dispatch' },
              { labelAr: 'جدول التوزيع', labelEn: 'Dispatch', path: '/courier/dispatch' },
            ],
          },
        ],
      },
    ],
  },
};
