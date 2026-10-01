export interface QAThresholds {
  maxResponseTimeMs: number;
  maxDbQueryTimeMs: number;
  minPassRatePercentage: number;
}

export interface QAPersona {
  id: string;
  role: 'customer' | 'seller' | 'support' | 'admin';
  email: string;
  sellerId?: string;
  fullName: string;
}

export interface QAConfig {
  baseUrl: string;
  environment: 'development' | 'testing' | 'production';
  thresholds: QAThresholds;
  personas: Record<string, QAPersona>;
  criticalEndpoints: Array<{
    path: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    expectedStatus: number;
    requiresAuth?: boolean;
    requiredRole?: 'customer' | 'seller' | 'support' | 'admin';
    descriptionAr: string;
  }>;
  complianceStandards: {
    law181_2018: {
      standardReturnDays: number;
      defectReturnDays: number;
      settlementSlaHours: number;
    };
    currency: 'EGP';
    supportedGovernorates: string[];
  };
}

export const defaultQAConfig: QAConfig = {
  baseUrl: 'http://localhost:3000',
  environment: 'testing',
  thresholds: {
    maxResponseTimeMs: 250,
    maxDbQueryTimeMs: 50,
    minPassRatePercentage: 100,
  },
  personas: {
    customer: {
      id: 'cust-demo',
      role: 'customer',
      email: 'customer@souqdesoq.eg',
      fullName: 'أحمد محمود النجار',
    },
    seller1: {
      id: 'user-seller-1',
      role: 'seller',
      email: 'farmawy@souqdesoq.eg',
      sellerId: 'seller-1',
      fullName: 'الحاج مصطفى الفرماوي',
    },
    seller2: {
      id: 'user-seller-2',
      role: 'seller',
      email: 'carpet@souqdesoq.eg',
      sellerId: 'seller-2',
      fullName: 'الأسطى عبد الحميد الغازي',
    },
    support: {
      id: 'user-support-1',
      role: 'support',
      email: 'support@souqdesoq.eg',
      fullName: 'أ. مروة الشاذلي',
    },
    admin: {
      id: 'user-admin-1',
      role: 'admin',
      email: 'admin@souqdesoq.eg',
      fullName: 'م. كريم دسوقي',
    },
  },
  criticalEndpoints: [
    {
      path: '/api/health',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'فحص الجاهزية والخدمات التشغيلية',
    },
    {
      path: '/api/catalog/products',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'قائمة منتجات الكتالوج المعتمد',
    },
    {
      path: '/api/catalog/categories',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'شجرة الأقسام التجارية والتصنيفات',
    },
    {
      path: '/api/catalog/search?q=قماش',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'محرك البحث والتطبيع اللغوي العربي',
    },
    {
      path: '/api/catalog/search/popular',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'الكلمات والمصطلحات الأكثر رواجاً',
    },
    {
      path: '/api/catalog/search/suggest?prefix=ملابس',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'محرك الإكمال التلقائي الذكي',
    },
    {
      path: '/api/auth/demo-users',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'قائمة حسابات الأدوار التجريبية والاعتماد',
    },
    {
      path: '/api/observability/metrics',
      method: 'GET',
      expectedStatus: 200,
      descriptionAr: 'قياسات الأداء ونبض النظام',
    },
  ],
  complianceStandards: {
    law181_2018: {
      standardReturnDays: 14,
      defectReturnDays: 30,
      settlementSlaHours: 48,
    },
    currency: 'EGP',
    supportedGovernorates: [
      'كفر الشيخ',
      'الغربية',
      'البحيرة',
      'الإسكندرية',
      'القاهرة',
      'الجيزة',
      'الدقهلية',
      'المنوفية',
    ],
  },
};
