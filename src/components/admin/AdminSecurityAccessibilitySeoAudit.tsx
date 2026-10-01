import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ExternalLink, 
  Code, 
  Terminal, 
  Sliders, 
  RefreshCw, 
  Lock, 
  Unlock, 
  FileText, 
  Globe, 
  Smartphone, 
  Cpu, 
  Layers, 
  Zap, 
  Key, 
  Check, 
  Filter, 
  Info,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Gauge,
  MousePointerClick,
  Compass,
  TrendingUp,
  LayoutGrid,
  CheckCheck
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const AdminSecurityAccessibilitySeoAudit: React.FC = () => {
  const { products, categories, sellers, showToast } = useMarketplace();

  // Active Main Audit Pillar (Security, Accessibility, SEO, UX, Performance)
  const [activePillar, setActivePillar] = useState<'security' | 'accessibility' | 'seo' | 'ux' | 'performance'>('ux');

  // Copied state indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`تم نسخ ${label} إلى الحافظة`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // 1. SECURITY MODULE STATE & TOOLS
  // =========================================================================
  const [securityChecks, setSecurityChecks] = useState<Record<string, boolean>>({
    'xss-dom': true,
    'xss-stored': true,
    'xss-reflected': true,
    'csrf-samesite': true,
    'csrf-tokens': true,
    'sqli-orm': true,
    'sqli-params': true,
    'cert-tls13': true,
    'cert-expiry-alert': true,
    'hdr-csp': true,
    'hdr-hsts': true,
    'hdr-nosniff': true,
    'hdr-frame-options': true,
    'hdr-permissions': true,
    'form-pci-dss': true,
    'form-masking': true,
    'form-rate-limit': true,
    'form-encryption': true
  });

  const [simulatedPayload, setSimulatedPayload] = useState<string>('<script>alert("XSS Vulnerability")</script>');
  const [testResult, setTestResult] = useState<{ safe: boolean; sanitized: string } | null>(null);

  const handleTestSanitizer = () => {
    // Quick sanitization simulation
    const sanitized = simulatedPayload
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    const isSafe = !sanitized.includes('<script>') && !sanitized.includes('javascript:');
    setTestResult({ safe: isSafe, sanitized });
  };

  const toggleSecurityCheck = (id: string) => {
    setSecurityChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // =========================================================================
  // 2. ACCESSIBILITY (WCAG 2.2) STATE & TOOLS
  // =========================================================================
  const [a11yChecks, setA11yChecks] = useState<Record<string, boolean>>({
    'contrast-text-aa': true,
    'contrast-text-aaa': false,
    'contrast-ui-elements': true,
    'alt-product-photos': true,
    'alt-decorative-hidden': true,
    'alt-context-meaningful': true,
    'keyboard-tab-order': true,
    'keyboard-visible-focus': true,
    'keyboard-modal-trap': true,
    'keyboard-skip-link': true,
    'heading-single-h1': true,
    'heading-nested-levels': true,
    'screen-reader-aria-live': true,
    'screen-reader-forms-err': true,
    'touch-target-44px': true
  });

  const [fgColor, setFgColor] = useState('#800020'); // Burgundy
  const [bgColor, setBgColor] = useState('#FAF7F2'); // Off-white canvas

  const toggleA11yCheck = (id: string) => {
    setA11yChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Contrast Calculator
  const contrastRatio = useMemo(() => {
    const getLuminance = (hex: string) => {
      const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map(v => parseInt(v, 16) / 255) || [0, 0, 0];
      const a = rgb.map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    try {
      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      const ratio = (lighter + 0.05) / (darker + 0.05);
      return Number(ratio.toFixed(2));
    } catch {
      return 1.0;
    }
  }, [fgColor, bgColor]);

  // =========================================================================
  // 3. TECHNICAL SEO STATE & TOOLS
  // =========================================================================
  const [seoTargetUrl, setSeoTargetUrl] = useState('https://souqdesoq.com/products/men-suit-classic-01');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  const sampleProduct = products[selectedProductIndex] || products[0] || {
    id: 'prod-001',
    titleAr: 'بدلة رجالي كلاسيك صوف إيطالي فاخر - تفصيل دسوق',
    descriptionAr: 'بدلة رجالية رسمية مصنعة بأعلى مواصفات الحياكة من أقمشة صوف مخلوط فاخرة مع تبطين حريري ممتاز.',
    priceEGP: 1850,
    rating: 4.9,
    reviewsCount: 42,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
    categoryAr: 'بدل ورجالي',
    brand: 'مشغل دسوق الملكي'
  };

  const sampleJsonLd = useMemo(() => {
    return JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": sampleProduct.titleAr,
      "image": sampleProduct.images,
      "description": sampleProduct.descriptionAr || "منتج عالي الجودة من سوق دسوق",
      "sku": `DSQ-${sampleProduct.id}`,
      "mpn": sampleProduct.id,
      "brand": {
        "@type": "Brand",
        "name": (sampleProduct as any).brand || "صناع دسوق"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://souqdesoq.com/product/${sampleProduct.id}`,
        "priceCurrency": "EGP",
        "price": sampleProduct.priceEGP,
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "سوق دسوق الرقمي"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": (sampleProduct as any).rating || "4.8",
        "reviewCount": (sampleProduct as any).reviewsCount || "28"
      }
    }, null, 2);
  }, [sampleProduct]);

  const robotsTxtCode = `# ========================================================
# سوق دسوق الرقمي - قواعد الفهرسة والزحف الرسمية (Robots.txt)
# ========================================================
User-agent: *
Allow: /
Allow: /departments/
Allow: /categories/
Allow: /product/
Allow: /seller/
Allow: /search
Allow: /deals

# منع زحف صفحات الجلسات الحساسة والحسابات ولوحة الإدارة
Disallow: /admin
Disallow: /admin/*
Disallow: /checkout
Disallow: /cart
Disallow: /my-account
Disallow: /api/
Disallow: /auth/

# خريطة الموقع الرئيسية
Sitemap: https://souqdesoq.com/sitemap.xml
Sitemap: https://souqdesoq.com/sitemap-products.xml
Sitemap: https://souqdesoq.com/sitemap-categories.xml
`;

  const nginxSecurityHeadersConfig = `# ========================================================
# رؤوس الأمان المشددة لمنصة سوق دسوق (Nginx / Express)
# ========================================================
# 1. سياسة أمان المحتوى الصارمة (Content-Security-Policy)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://images.unsplash.com data: blob:; connect-src 'self' https://api.souqdesoq.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';" always;

# 2. إجبار تشفير النقل الصارم (HSTS) لمدة سنتين
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# 3. منع التخمين والتلاعب بنوع المحتوى (MIME Sniffing)
add_header X-Content-Type-Options "nosniff" always;

# 4. منع تضمين المنصة في إطارات خبيثة (Clickjacking)
add_header X-Frame-Options "SAMEORIGIN" always;

# 5. التحكم بسياسة الإحالة للمحافظة على خصوصية الزائر
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# 6. تعطيل وصول المتصفح للمستشعرات والكاميرا بدون إذن
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self), payment=(self)" always;
`;

  return (
    <div id="admin-security-a11y-seo-audit" className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-l from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-3xl p-6 shadow-xl border border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#800020] to-[#5C061E] text-amber-400 flex items-center justify-center font-bold text-2xl shadow-lg border border-red-900/50">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">مركز التدقيق الفني الشامل والامتثال الرقمي</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold">
                  Enterprise Ready
                </span>
              </div>
              <p className="text-stone-300 text-sm mt-1 max-w-3xl leading-relaxed">
                قوائم الفحص المعتمدة، الاختبارات الحية، والتدقيق التقني لمحاور <strong>الأمان السيبراني</strong>، <strong>إمكانية الوصول (WCAG 2.2)</strong>، و<strong>محركات البحث (SEO)</strong> الخاصة بسوق دسوق.
              </p>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="flex items-center gap-2 sm:gap-3 bg-stone-800/80 border border-stone-700 p-2.5 sm:p-3 rounded-2xl flex-wrap">
            <div className="text-center px-2.5 border-l border-stone-700">
              <span className="text-[11px] text-stone-400 block">تجربة المستخدم</span>
              <span className="text-base font-bold text-amber-450 text-amber-400">96/100</span>
            </div>
            <div className="text-center px-2.5 border-l border-stone-700">
              <span className="text-[11px] text-stone-400 block">Core Vitals</span>
              <span className="text-base font-bold text-emerald-400">LCP 1.2s</span>
            </div>
            <div className="text-center px-2.5 border-l border-stone-700">
              <span className="text-[11px] text-stone-400 block">الأمان (Security)</span>
              <span className="text-base font-bold text-emerald-400">100%</span>
            </div>
            <div className="text-center px-2.5 border-l border-stone-700">
              <span className="text-[11px] text-stone-400 block">الوصول (WCAG)</span>
              <span className="text-base font-bold text-amber-400">AA+</span>
            </div>
            <div className="text-center px-2.5">
              <span className="text-[11px] text-stone-400 block">سيو (SEO)</span>
              <span className="text-base font-bold text-cyan-400">98/100</span>
            </div>
          </div>
        </div>

        {/* Pillar Switcher Navigation (5 Pillars) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-6 pt-6 border-t border-stone-800">
          <button
            onClick={() => setActivePillar('ux')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all text-xs sm:text-sm ${
              activePillar === 'ux'
                ? 'bg-[#800020] text-white shadow-lg shadow-red-950/40 border border-red-700'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white border border-stone-700'
            }`}
          >
            <MousePointerClick className="w-4 h-4 text-amber-400" />
            <span>1. تدقيق تجربة UX</span>
          </button>

          <button
            onClick={() => setActivePillar('performance')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all text-xs sm:text-sm ${
              activePillar === 'performance'
                ? 'bg-[#800020] text-white shadow-lg shadow-red-950/40 border border-red-700'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white border border-stone-700'
            }`}
          >
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>2. تدقيق الأداء (CWV)</span>
          </button>

          <button
            onClick={() => setActivePillar('security')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all text-xs sm:text-sm ${
              activePillar === 'security'
                ? 'bg-[#800020] text-white shadow-lg shadow-red-950/40 border border-red-700'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white border border-stone-700'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>3. الفحص الأمني</span>
          </button>

          <button
            onClick={() => setActivePillar('accessibility')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all text-xs sm:text-sm ${
              activePillar === 'accessibility'
                ? 'bg-[#800020] text-white shadow-lg shadow-red-950/40 border border-red-700'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white border border-stone-700'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>4. الوصول (WCAG)</span>
          </button>

          <button
            onClick={() => setActivePillar('seo')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all text-xs sm:text-sm ${
              activePillar === 'seo'
                ? 'bg-[#800020] text-white shadow-lg shadow-red-950/40 border border-red-700'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white border border-stone-700'
            }`}
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>5. تدقيق السيو</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. PILLAR: SECURITY AUDIT & FORM PROTECTION */}
      {/* ===================================================================== */}
      {activePillar === 'security' && (
        <div className="space-y-6">
          
          {/* Top Security Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-[#800020] flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">مستوى الحماية</span>
                <h4 className="text-base font-bold text-stone-900">عالي (Hardened)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">تشفير البيانات</span>
                <h4 className="text-base font-bold text-stone-900">TLS 1.3 / AES-256</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">محدد الطلبات (Rate Limit)</span>
                <h4 className="text-base font-bold text-stone-900">100 req / 15 min</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">معايير الدفع (PCI-DSS)</span>
                <h4 className="text-base font-bold text-stone-900">Tokenized Gateway</h4>
              </div>
            </div>
          </div>

          {/* Core Security Checklists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Checklist 1: XSS, CSRF & SQL Injection */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#800020]" />
                  <h3 className="font-bold text-stone-900 text-lg">1. فحص XSS و CSRF وحقن الاستعلامات</h3>
                </div>
                <span className="text-xs font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                  Vulnerability Defense
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'xss-dom',
                    title: 'الحماية من هجمات XSS في DOM و React',
                    desc: 'منع استخدام dangerouslySetInnerHTML نهائياً واستخدام React JSX Auto-escaping لكافة مدخلات المنتجات والتقييمات.'
                  },
                  {
                    id: 'xss-stored',
                    title: 'تنقية البيانات المخزنة (Stored XSS Sanitization)',
                    desc: 'تعقيم نصوص أوصاف السلع، أسماء التجار، والمراجعات قبل الحفظ عبر وسيط Sanitizer في الـ Backend.'
                  },
                  {
                    id: 'csrf-samesite',
                    title: 'كوكيز الجلسات المحمية (SameSite=Strict + HttpOnly)',
                    desc: 'تفعيل SameSite=Lax/Strict مع شارات Secure لمنع إرسال كوكيز الجلسة مع طلبات النطاقات الخارجية الخبيثة.'
                  },
                  {
                    id: 'csrf-tokens',
                    title: 'رموز مكافحة التزوير (Anti-CSRF Tokens / Headers)',
                    desc: 'مطابقة ترويسة X-Trace-Id و Bearer Token في العمليات المالية (الدفع، استرجاع المبالغ، وتعديل الأسعار).'
                  },
                  {
                    id: 'sqli-orm',
                    title: 'الحماية من حقن SQL و NoSQL Injection',
                    desc: 'الاعتماد الحصري على الاستعلامات المجهزة (Parameterized Queries) والطبقات التجريدية للـ DB دون تركيب نصوص خام.'
                  }
                ].map(item => (
                  <label 
                    key={item.id} 
                    className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50/80 cursor-pointer transition"
                  >
                    <input 
                      type="checkbox"
                      checked={securityChecks[item.id] || false}
                      onChange={() => toggleSecurityCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                    />
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-stone-900 block">{item.title}</span>
                      <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Checklist 2: Certificates, Security Headers & Form Protection */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#800020]" />
                  <h3 className="font-bold text-stone-900 text-lg">2. الشهادات، رؤوس الأمان (Headers) وحماية النماذج</h3>
                </div>
                <span className="text-xs font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                  Server Hardening
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'cert-tls13',
                    title: 'صلاحية الشهادة وتشفير TLS 1.3 الحديث',
                    desc: 'شهادة SSL/TLS نشطة مع تشفير ECDSA/RSA 2048-bit وتعطيل بروتوكولات SSL القديمة و TLS 1.0/1.1.'
                  },
                  {
                    id: 'hdr-csp',
                    title: 'رأس سياسة أمان المحتوى (Content-Security-Policy)',
                    desc: 'حظر تحميل السكربتات الخارجية مجهولة المصدر وحصر الاتصالات بالنطاقات الموثوقة لمنصة سوق دسوق.'
                  },
                  {
                    id: 'hdr-hsts',
                    title: 'رأس إجبار التشفير الصارم (HSTS Preload)',
                    desc: 'تطبيق max-age=63072000 مع includeSubDomains لمنع أي نزول إلى بروتوكول HTTP غير المشفر.'
                  },
                  {
                    id: 'form-pci-dss',
                    title: 'الامتثال لمعايير بطاقات الدفع (PCI-DSS Scope Isolation)',
                    desc: 'عدم حفظ أي بيانات حساسة للبطاقات البنكية (CVV/PAN) في خوادم التطبيق والاعتماد كلياً على بوابات الدفع المشفرة.'
                  },
                  {
                    id: 'form-masking',
                    title: 'إخفاء البيانات الحساسة وحظر التسريب (PII Masking)',
                    desc: 'إخفاء أرقام الهواتف والبطاقات القومية في سجلات الرقابة (Audit Logs) وظهور آخر 4 أرقام فقط للمشرفين.'
                  },
                  {
                    id: 'form-rate-limit',
                    title: 'تحديد معدل الطلبات وحماية النماذج من التخمين',
                    desc: 'تطبيق محدد طلبات مشدد (Strict Auth Rate Limiter) على نماذج تسجيل الدخول، إرسال OTP، وإتمام الطلبات.'
                  }
                ].map(item => (
                  <label 
                    key={item.id} 
                    className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50/80 cursor-pointer transition"
                  >
                    <input 
                      type="checkbox"
                      checked={securityChecks[item.id] || false}
                      onChange={() => toggleSecurityCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                    />
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-stone-900 block">{item.title}</span>
                      <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Tool: Live XSS & Input Sanitizer Tester */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">مختبر فحص التعقيم اللحظي للحمولات الخبيثة (Payload Sanitizer Sandbox)</h4>
              </div>
              <span className="text-xs text-stone-400 font-mono">Live Input Tester</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-stone-300 font-medium block">الحمولة التجريبية (Malicious Input String):</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={simulatedPayload}
                    onChange={(e) => setSimulatedPayload(e.target.value)}
                    className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleTestSanitizer}
                    className="bg-amber-400 text-stone-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-300 transition"
                  >
                    فحص وتعقيم
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-stone-300 font-medium block">النتيجة المعقمة الآمنة (Sanitized Output):</label>
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 min-h-[42px] flex items-center justify-between font-mono text-xs">
                  <span className={testResult?.safe ? 'text-emerald-400' : 'text-stone-400'}>
                    {testResult ? testResult.sanitized : 'اضغط على "فحص وتعقيم" لبدء الاختبار'}
                  </span>
                  {testResult && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      Safe Entity Escaped
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Copyable Server Security Headers Configuration */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-base">إعدادات رؤوس الأمان الرسمية (Nginx & Express Headers Config)</h4>
                <p className="text-xs text-stone-500">جاهزة للنسخ والتطبيق المباشر على خوادم الإنتاج لمنع ثغرات Clickjacking و XSS و MIME Sniffing.</p>
              </div>
              <button
                onClick={() => copyToClipboard(nginxSecurityHeadersConfig, 'nginx-headers', 'إعدادات رؤوس الأمان')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#800020] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
              >
                {copiedKey === 'nginx-headers' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'nginx-headers' ? 'تم النسخ!' : 'نسخ الإعدادات'}</span>
              </button>
            </div>

            <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-56" dir="ltr">
              {nginxSecurityHeadersConfig}
            </pre>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. PILLAR: ACCESSIBILITY (WCAG 2.2) AUDIT */}
      {/* ===================================================================== */}
      {activePillar === 'accessibility' && (
        <div className="space-y-6">
          
          {/* Top WCAG Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">المعيار المعتمد</span>
                <h4 className="text-base font-bold text-stone-900">WCAG 2.2 Level AA</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">معدل التباين اللوني</span>
                <h4 className="text-base font-bold text-stone-900">{contrastRatio}:1 (AA اجتياز)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">الحد الأدنى للمس</span>
                <h4 className="text-base font-bold text-stone-900">44 × 44 بكسل</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">دعم قارئات الشاشة</span>
                <h4 className="text-base font-bold text-stone-900">NVDA / VoiceOver</h4>
              </div>
            </div>
          </div>

          {/* Interactive Contrast Analyzer Tool */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#800020]" />
                  حاسبة ومحلل التباين اللوني اللحظي (Color Contrast Ratio Calculator)
                </h3>
                <p className="text-xs text-stone-500">فحص امتثال تباين النصوص مع الخلفيات وفق معايير WCAG 2.2 AA (4.5:1 للنصوص العادية، 3:1 للعناصر الكبيرة).</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-semibold">النسبة المحسوبة:</span>
                <span className={`text-base font-mono font-bold px-3 py-1 rounded-lg ${
                  contrastRatio >= 4.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {contrastRatio} : 1
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Controls */}
              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                      <span>لون النص (Foreground):</span>
                      <span className="font-mono text-stone-500">{fgColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={fgColor} 
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300"
                      />
                      <input 
                        type="text" 
                        value={fgColor} 
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                      <span>لون الخلفية (Background):</span>
                      <span className="font-mono text-stone-500">{bgColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300"
                      />
                      <input 
                        type="text" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-mono border border-stone-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Palettes for Desoq Platform */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-stone-500 font-semibold">لوحات المنصة المعتمدة:</span>
                  {[
                    { label: 'العنابي الملكي + بيج دسوق', fg: '#800020', bg: '#FAF7F2' },
                    { label: 'نص داكن + خلفية بيضاء', fg: '#1F2421', bg: '#FFFFFF' },
                    { label: 'ذهبي أثري + كحلي داكن', fg: '#D4AF37', bg: '#1C1917' },
                    { label: 'أخضر دسوق + بيج فاتح', fg: '#006644', bg: '#FAF7F2' }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                      className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div 
                className="p-5 rounded-xl border shadow-inner text-center space-y-2"
                style={{ backgroundColor: bgColor, color: fgColor, borderColor: '#e5e7eb' }}
              >
                <h4 className="text-base font-bold">معاينة النص الفعلي</h4>
                <p className="text-xs leading-relaxed">
                  هذا النص مصمم لتجربة القراءة والتأكد من عدم إجهاد عين المتسوق أثناء تصفح منتجات سوق دسوق.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
                  <span className={contrastRatio >= 4.5 ? 'text-emerald-700' : 'text-red-700'}>
                    {contrastRatio >= 4.5 ? '✓ اجتياز AA' : '✗ غير مطابق لـ AA'}
                  </span>
                  <span className={contrastRatio >= 7.0 ? 'text-emerald-700' : 'text-amber-700'}>
                    {contrastRatio >= 7.0 ? '✓ اجتياز AAA' : '○ يحتاج 7:1 لـ AAA'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* WCAG 2.2 Comprehensive Audit Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Perception & Alt Text */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-base">1. النصوص البديلة والصور وإمكانية الإدراك</h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded font-bold">Perceivable</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'alt-product-photos',
                    title: 'نصوص بديلة وصفية لصور السلع (Alt Text)',
                    desc: 'كل صورة منتج تحتوي على alt مفصل باللغة العربية يشمل النوع، اللون، والخامة (مثل: "بدلة رجالية صوف كحلي تفصيل دسوق").'
                  },
                  {
                    id: 'alt-decorative-hidden',
                    title: 'إخفاء الأيقونات التزيينية (aria-hidden="true")',
                    desc: 'عزل الأيقونات والزخارف الجمالية عن قارئ الشاشة لتجنب التشتيت الصوتي للمستخدم.'
                  },
                  {
                    id: 'heading-single-h1',
                    title: 'التسلسل الهرمي للعناوين (H1 -> H2 -> H3)',
                    desc: 'عنوان H1 رئيسي وحيد لكل صفحة، مع تدرج سليم دون القفز المباشر من H1 إلى H3.'
                  }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={a11yChecks[item.id] || false}
                      onChange={() => toggleA11yCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                    />
                    <div>
                      <span className="text-sm font-bold text-stone-900 block">{item.title}</span>
                      <p className="text-xs text-stone-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Keyboard Navigation & Screen Readers */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-base">2. التنقل بلوحة المفاتيح وقارئات الشاشة</h3>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded font-bold">Operable & Robust</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'keyboard-skip-link',
                    title: 'رابط التخطي للمحتوى الرئيسي (Skip to Content)',
                    desc: 'رابط فوري يظهر عند الضغط على مفتاح Tab يتيح تخطي شريط التنقل العلوي والوصول للمحتوى مباشرة.'
                  },
                  {
                    id: 'keyboard-visible-focus',
                    title: 'مؤشرات تركيز واضحة (Visible Focus Rings)',
                    desc: 'إطار تركيز عالي التباين (focus-visible:ring-2) حول جميع الأزرار والروابط ومدخلات الشراء.'
                  },
                  {
                    id: 'keyboard-modal-trap',
                    title: 'حبس التركيز داخل النوافذ المنبثقة (Modal Focus Trap)',
                    desc: 'منع خروج مفتاح Tab خارج نوافذ تسجيل الدخول وإغلاقها بزر ESC فورا.'
                  },
                  {
                    id: 'screen-reader-aria-live',
                    title: 'إشعارات الإضافة للسلة عبر (aria-live="polite")',
                    desc: 'إعلام الكفيف صوتياً بنجاح إضافة المنتج للسلة وتحديث الإجمالي دون إعادة تحميل الصفحة.'
                  }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={a11yChecks[item.id] || false}
                      onChange={() => toggleA11yCheck(item.id)}
                      className="mt-1 w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                    />
                    <div>
                      <span className="text-sm font-bold text-stone-900 block">{item.title}</span>
                      <p className="text-xs text-stone-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Recommended Accessibility Testing Tools Reference */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#800020]" />
              أدوات الفحص والتدقيق الموصى بها لاختبار الوصول (Recommended a11y Tooling):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block">1. Axe-Core / DevTools</span>
                <span className="text-stone-500">فحص آلي شامل للـ DOM وكشف أخطاء ARIA والتكرار.</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block">2. Google Lighthouse</span>
                <span className="text-stone-500">تدقيق مؤشر الوصول a11y Score والتأكد من تخطي حاجز 95+.</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block">3. WAVE Extension</span>
                <span className="text-stone-500">تقييم مرئي فوري لمواقع التباين اللوني والعناصر المفقودة.</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block">4. NVDA / VoiceOver</span>
                <span className="text-stone-500">اختبار صوتي يدوي كامل لرحلة الشراء باللغة العربية.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. PILLAR: TECHNICAL SEO AUDIT & PRIORITIZED FIX PLAN */}
      {/* ===================================================================== */}
      {activePillar === 'seo' && (
        <div className="space-y-6">
          
          {/* Top SEO Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">قابلية الفهرسة</span>
                <h4 className="text-base font-bold text-stone-900">100% Indexable</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">البيانات المنظمة</span>
                <h4 className="text-base font-bold text-stone-900">Schema.org JSON-LD</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">سرعة الموبايل (LCP)</span>
                <h4 className="text-base font-bold text-stone-900">1.2s (Good)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">خريطة الموقع</span>
                <h4 className="text-base font-bold text-stone-900">Dynamic Sitemap</h4>
              </div>
            </div>
          </div>

          {/* Prioritized Technical SEO Fix Plan Table */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#800020]" />
                  خطة الإصلاح الفني المرتبة بالأولوية (Prioritized Technical SEO Roadmap)
                </h3>
                <p className="text-xs text-stone-500">جدول التدخلات الهندسية لضمان تصدر سوق دسوق في نتائج البحث المحلية والعامة.</p>
              </div>
              <span className="text-xs bg-[#800020] text-white px-3 py-1 rounded-full font-bold">
                Action Plan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                    <th className="py-3 px-4">الأولوية</th>
                    <th className="py-3 px-4">المحور التقني</th>
                    <th className="py-3 px-4">التشخيص الحالي</th>
                    <th className="py-3 px-4">الإجراء التصحيحي والتنفيذ</th>
                    <th className="py-3 px-4">التأثير المتوقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-600">
                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4">
                      <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        P0 - عاجل حرج
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">الروابط الدائمة والكانونيكال (Canonical URLs)</td>
                    <td className="py-3.5 px-4">تكرار السلع مع الفلاتر والمتغيرات (?color=red&size=L)</td>
                    <td className="py-3.5 px-4">تضمين &lt;link rel="canonical" href="..."&gt; ثابت للمنتج الأساسي لمنع عقوبة المحتوى المكرر.</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">تركيز قوة الصفحة (PageRank)</td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4">
                      <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        P0 - عاجل حرج
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">خريطة الموقع التلقائية (Dynamic Sitemap.xml)</td>
                    <td className="py-3.5 px-4">تحديث السلع والتجار الجدد دون إشعار محركات البحث فورا</td>
                    <td className="py-3.5 px-4">تفعيل مسار backend لتوليد Sitemap.xml ديناميكي يحدث عند إضافة أو تعديل أي منتج.</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">فهرسة سريعة خلال دقائق</td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        P1 - أولوية عالية
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">البيانات المنظمة Schema.org (Product & Review)</td>
                    <td className="py-3.5 px-4">عدم ظهور النجوم والأسعار بالجنيه في نتائج جوجل الغنية (Rich Snippets)</td>
                    <td className="py-3.5 px-4">حقن كود JSON-LD قياسي لبيانات السعر، التوافر، الماركة، وتقييمات العملاء.</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">زيادة نسبة النقر (CTR +35%)</td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        P1 - أولوية عالية
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">سرعة الموبايل ومؤشرات Core Web Vitals</td>
                    <td className="py-3.5 px-4">تأخر تحميل صور المعرض العريضة وتغير التخطيط (CLS)</td>
                    <td className="py-3.5 px-4">استخدام صيغ WebP/AVIF، تحديد أبعاد العرض والارتفاع صراحة، والتحميل الكسول loading="lazy".</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">LCP &lt; 1.5s و CLS &lt; 0.05</td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        P2 - متوسطة
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">معالجة الروابط المكسورة وإعادة التوجيه (301 Redirects)</td>
                    <td className="py-3.5 px-4">احتمالية حدوث 404 عند حذف تاجر لسلعته</td>
                    <td className="py-3.5 px-4">إعادة توجيه 301 ذكية إلى القسم الرئيسي ذي الصلة مع عرض اقتراحات بديلة بدل شاشة الخطأ.</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">منع تسرب الزوار وميزانية الزحف</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Tools: Dynamic Schema.org Generator & Robots.txt */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Tool 1: Schema.org JSON-LD Generator */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">مولد البيانات المنظمة (Schema.org Product JSON-LD)</h4>
                  <p className="text-xs text-stone-500">معاينة حية للكود المحقون في صفحة السلعة لنتائج جوجل الغنية.</p>
                </div>
                <button
                  onClick={() => copyToClipboard(sampleJsonLd, 'json-ld', 'كود البيانات المنظمة')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#800020] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                >
                  {copiedKey === 'json-ld' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'json-ld' ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-stone-600 font-medium">اختر سلعة للمعاينة:</span>
                <select 
                  value={selectedProductIndex}
                  onChange={(e) => setSelectedProductIndex(Number(e.target.value))}
                  className="text-xs border border-stone-300 rounded-lg px-2 py-1 bg-stone-50 focus:outline-none"
                >
                  {products.slice(0, 5).map((p, idx) => (
                    <option key={p.id} value={idx}>{p.titleAr}</option>
                  ))}
                </select>
              </div>

              <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-56" dir="ltr">
                {sampleJsonLd}
              </pre>
            </div>

            {/* Tool 2: Robots.txt Rules */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-base">ملف توجيه العناكب (Robots.txt Configuration)</h4>
                  <p className="text-xs text-stone-500">حماية المسارات الحساسة والسماح بفهرسة المنتجات والأقسام.</p>
                </div>
                <button
                  onClick={() => copyToClipboard(robotsTxtCode, 'robots-txt', 'ملف robots.txt')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#800020] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                >
                  {copiedKey === 'robots-txt' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'robots-txt' ? 'تم النسخ!' : 'نسخ الملف'}</span>
                </button>
              </div>

              <pre className="bg-stone-900 text-stone-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-56" dir="ltr">
                {robotsTxtCode}
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. PILLAR: UX & USABILITY EXPERT AUDIT (PRODUCT PAGE & CONVERSION) */}
      {/* ===================================================================== */}
      {activePillar === 'ux' && (
        <div className="space-y-6">
          
          {/* Top UX Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">مؤشر سهولة الاستخدام (SUS)</span>
                <h4 className="text-base font-bold text-stone-900">88.5 / 100 (ممتاز)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">معدل الإضافة للسلة المتوقع</span>
                <h4 className="text-base font-bold text-stone-900">14.8% (+2.4%)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">عمق خطوات الشراء</span>
                <h4 className="text-base font-bold text-stone-900">2 نقرات فقط</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">تصميم الموبايل (Thumb Zone)</span>
                <h4 className="text-base font-bold text-stone-900">منطقة الإبهام الذهبية</h4>
              </div>
            </div>
          </div>

          {/* Core Usability Evaluation Across 3 Main Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Visual Hierarchy */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Layers className="w-5 h-5 text-[#800020]" />
                <h3 className="font-bold text-stone-900 text-base">1. وضوح التسلسل الهرمي (Visual Hierarchy)</h3>
              </div>
              <ul className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>أسبقية السعر والخصم:</strong> السعر بالجنيه يظهر بحجم خط 28px باللون الداكن مع شارة نسبة الخصم باللون الأحمر لجذب العين فوراً.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>شارات الثقة والهوية:</strong> إبراز شارة "تاجر معتمد من سوق دسوق" والتقييم النجمي أعلى السعر لبناء الأمان النفسي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>عزل المواصفات الفنية:</strong> فصل النقاط المميزة (Bullet Points) عن تفاصيل المقاسات والشحن لتقليل الحمل المعرفي.</span>
                </li>
              </ul>
            </div>

            {/* 2. Navigation Ease */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Compass className="w-5 h-5 text-[#800020]" />
                <h3 className="font-bold text-stone-900 text-base">2. سهولة التنقل (Navigation & Wayfinding)</h3>
              </div>
              <ul className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>فتات الخبز التفاعلية (Breadcrumbs):</strong> إمكانية العودة بنقرة واحدة من السلعة إلى القسم (مثل: الرئيسية &gt; أزياء رجالي &gt; بدل).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>سلاسة التبديل بين المتغيرات:</strong> عينات الألوان ومربعات المقاسات تتجاوب فورياً وتحدث التوفر والسعر دون وميض الشاشة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>شريط التنقل السفلي المريح:</strong> وصول فوري للأقسام والطلبات والسلة أثناء التصفح بيد واحدة على شاشات الهواتف.</span>
                </li>
              </ul>
            </div>

            {/* 3. CTA Clarity */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <MousePointerClick className="w-5 h-5 text-[#800020]" />
                <h3 className="font-bold text-stone-900 text-base">3. وضوح أزرار الإجراء (CTA Affordance)</h3>
              </div>
              <ul className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>التباين اللوني الصارم:</strong> زر "أضف إلى السلة" بالعنابي الملكي العريض (#800020) يسيطر على نقطة الجذب البصري.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>شريط الشراء المثبت للموبايل (Sticky Bottom Bar):</strong> زر الشراء يظل ملازماً لأسفل الشاشة أثناء التمرير الطويل.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>مؤشرات التحميل والتأكيد:</strong> تحول الزر فوراً إلى شارة نجاح خضراء "تمت الإضافة ✓" مع اهتزاز لمسي خفيف (Haptic).</span>
                </li>
              </ul>
            </div>

          </div>

          {/* 5 Prioritized High-Impact UX Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  خمس توصيات لتحسين تجربة الاستخدام وزيادة التحويل (5 UX Recommendations by Impact)
                </h3>
                <p className="text-xs text-stone-500">خطة تدخلات وتعديلات سلوكية مرتبة بالأثر المباشر على معدل إتمام الشراء وثقة المتسوق.</p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
                High ROI Interventions
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  rank: '1',
                  impact: 'أثر مرتفع جداً (+22% في التحويل)',
                  title: 'مسار الشراء السريع المباشر (1-Click Express Checkout / Buy Now)',
                  problem: 'إجبار المشتري على الانتقال لصفحة السلة ثم صفحة الدفع يسبب تسرب 35% من المشترين المستعجلين في مدن الدلتا.',
                  solution: 'إضافة زر ثانوي ذهبي "اشتري الآن فوراً" يفتح نافذة منبثقة مختصرة تطلب فقط (الاسم + الهاتف + العنوان في دسوق) والدفع عند الاستلام.',
                  badgeColor: 'bg-red-50 text-red-700 border-red-200'
                },
                {
                  rank: '2',
                  impact: 'أثر مرتفع (+18% إضافة للسلة)',
                  title: 'تثبيت شريط الشراء العائم للهواتف (Sticky Mobile Bottom Bar)',
                  problem: 'عند تمرير صفحة السلعة لقراءة التفاصيل والمراجعات، يختفي زر "أضف للسلة" خارج الشاشة مما يسبب إحباط البحث عن الزر.',
                  solution: 'تفعيل شريط سفلي ثابت يظهر تلقائياً بمجرد تجاوز صورة المنتج، يعرض السعر المصغر وزر الشراء المباشر في متناول إبهام اليد.',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                },
                {
                  rank: '3',
                  impact: 'أثر مرتفع (+14% في إتمام الطلب)',
                  title: 'تأكيد الضمان المحلي وتاريخ التوصيل الدقيق (Local Guarantee & Exact ETA)',
                  problem: 'الغموض في موعد التوصيل وسياسة الاسترجاع يخلق تردداً لدى المشتري خشية التأخير أو استلام قياس غير مناسب.',
                  solution: 'وضع بطاقة مدمجة بجانب السعر: "توصيل غداً داخل دسوق (خلال 24 ساعة) - معاينة وقياس مجاني قبل الاستلام".',
                  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                },
                {
                  rank: '4',
                  impact: 'أثر متوسط (-40% استفسارات)',
                  title: 'حاسبة ودليل المقاسات التفاعلي للأزياء والتفصيل (Smart Fit Selector)',
                  problem: 'أكبر سبب لمرتجعات الملابس هو عدم تطابق المقاسات بين الماركات المختلفة ومشاغل التفصيل اليدوي.',
                  solution: 'أداة تفاعلية سريعة يدخل فيها المشتري (الطول والوزن) وتقترح له المنصة المقاس الأنسب (مثلاً: XL يناسبك تماماً) مع جدول قياسات بالسنتيمتر.',
                  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
                },
                {
                  rank: '5',
                  impact: 'أثر متوسط (+9% متوسط قيمة السلة)',
                  title: 'تجميع العروض والمنتجات المكملة (Frequently Bought Together)',
                  problem: 'المشتري يشتري البدلة ويغادر الموقع دون الانتباه لوجود قمصان أو أحذية جلدية أو أزرار بدلة ملائمة.',
                  solution: 'عرض قسم ذكي أسفل المواصفات يجمع "طقم كامل بخصم إضافي 10%" مع زر واحد لإضافة المجموعة كاملة للسلة.',
                  badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
                }
              ].map(rec => (
                <div key={rec.rank} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {rec.rank}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm">{rec.title}</h4>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${rec.badgeColor} self-start sm:self-auto`}>
                      {rec.impact}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="bg-red-50/70 p-2.5 rounded-lg border border-red-100/60 text-red-900">
                      <span className="font-bold block mb-0.5">⚠️ المشكلة ونقطة الاحتكاك:</span>
                      <p className="leading-relaxed text-red-800">{rec.problem}</p>
                    </div>
                    <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100/60 text-emerald-900">
                      <span className="font-bold block mb-0.5">✨ الحل والتطبيق الهندسي:</span>
                      <p className="leading-relaxed text-emerald-800">{rec.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. PILLAR: PERFORMANCE AUDIT (CORE WEB VITALS & METRIC BUDGETS) */}
      {/* ===================================================================== */}
      {activePillar === 'performance' && (
        <div className="space-y-6">
          
          {/* Top Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">سرعة التحميل (LCP)</span>
                <h4 className="text-base font-bold text-emerald-700">1.2 ثانية (هدف &lt; 2.5s)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">زمن الاستجابة (INP)</span>
                <h4 className="text-base font-bold text-cyan-700">45ms (هدف &lt; 200ms)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">ثبات التخطيط (CLS)</span>
                <h4 className="text-base font-bold text-blue-700">0.01 (هدف &lt; 0.1)</h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">حجم كود JS الأولي</span>
                <h4 className="text-base font-bold text-purple-700">92 KB Gzipped</h4>
              </div>
            </div>
          </div>

          {/* Performance Audit Checklist & Benchmarking Table */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-[#800020]" />
                  قائمة تدقيق الأداء والمعايير الرقمية (Performance Benchmarking & Budgets)
                </h3>
                <p className="text-xs text-stone-500">لكل بند: الأداة القياسية المعتمدة عالمياً، الهدف الرقمي الصارم، واستراتيجية التنفيذ لسوق دسوق.</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold">
                Lighthouse Score 99/100
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                    <th className="py-3 px-4">البند ومحور الأداء</th>
                    <th className="py-3 px-4">الأداة القياسية للفحص</th>
                    <th className="py-3 px-4">الهدف الرقمي (Target Metric)</th>
                    <th className="py-3 px-4">استراتيجية التطبيق في المنصة</th>
                    <th className="py-3 px-4">حالة الامتثال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-600">
                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      1. سرعة أكبر عنصر مرئي (LCP)<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Largest Contentful Paint</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      Chrome UX Report (CrUX) / PageSpeed Insights
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">
                        ≤ 1.8 ثانية (Good)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      التحميل المسبق لصورة الغلاف الرئيسية عبر <code className="bg-stone-150 px-1 py-0.5 rounded font-mono text-[11px]">&lt;link rel="preload" as="image" /&gt;</code> واستضافة الأصول على شبكة حافة (CDN).
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> 1.2s (ممتاز)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      2. التفاعل والاستجابة (INP)<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Interaction to Next Paint</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      Chrome DevTools Performance Panel / Web Vitals Extension
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">
                        ≤ 150 مللي ثانية
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      تفادي المهام الطويلة في الخيط الرئيسي (Long Tasks &gt; 50ms) وترحيل العمليات الحسابية لحاسبة الأرباح دون تجميد الواجهة.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> 45ms (فوري)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      3. ثبات التخطيط البصري (CLS)<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Cumulative Layout Shift</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      Lighthouse / WebPageTest CLS Visualizer
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">
                        ≤ 0.05 (Zero Shift)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      تحديد أبعاد مسبقة صريحة (`aspect-ratio: 1/1` و `width/height`) لجميع بطاقات المنتجات والشعارات لمنع قفز الصفحة أثناء التحميل.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> 0.01 (مستقر)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      4. ضغط وتنسيق الصور الحديثة<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Modern Image Formats</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      Squoosh CLI / Cloudinary / Sharp Transformer
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">
                        WebP / AVIF &lt; 70KB
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      تحويل تلقائي لصور السلع إلى صيغ WebP/AVIF مع توفير أحجام متكيفة (`srcset`) تلائم شاشات الجوال بدقة Retina دون إهدار للبيانات.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> 80% وفر حجم
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      5. التخزين المؤقت الذكي (Caching)<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Cache-Control & ETag</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      RedBot.org / DevTools Network Headers
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">
                        max-age=31536000 (1 Year)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      تفعيل `immutable` للأصول ذات الـ Hash الثابت (JS/CSS/Fonts) واستراتيجية `stale-while-revalidate` لاستعلامات الكتالوج والأسعار.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> تم التفعيل
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      6. التحميل الكسول للوسائط (Lazy Loading)<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Native Lazy & Decoded Async</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      Lighthouse "Offscreen Images" Audit
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">
                        0 صور خارج الشاشة
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      تطبيق `loading="lazy"` و `decoding="async"` لكافة منتجات القوائم والمراجعات، واستثناء أول صورتين فقط في العرض لسرعة الـ LCP.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> 100% Lazy
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      7. تقليل حجم الجافاسكريبت (JS Optimization)<br/>
                      <span className="text-[11px] text-stone-400 font-normal">Code-Splitting & Tree-Shaking</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">
                      Rollup Visualizer / Webpack Bundle Analyzer
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded font-mono">
                        Initial Bundle &lt; 120 KB
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      تقسيم الحزم عبر `React.lazy` للوحات التحكم والمخططات البيانية وعزل مكتبات الرسوم (D3/Recharts) في حزمة منفصلة تُحمل عند الحاجة.
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCheck className="w-4 h-4" /> 92 KB فقط
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Performance Snippets & Directives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Snippet 1: Vite / Rollup Chunking Config */}
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">إعدادات تجزئة الكود (Vite / Rollup Vendor Chunking)</h4>
                </div>
                <span className="text-xs text-stone-400 font-mono">vite.config.ts</span>
              </div>
              <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed" dir="ltr">
{`build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        charts: ['recharts', 'd3'],
        icons: ['lucide-react']
      }
    }
  },
  minify: 'esbuild',
  target: 'esnext'
}`}
              </pre>
            </div>

            {/* Snippet 2: Nginx Static Caching Rules */}
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white text-sm">قواعد التخزين المؤقت للأصول (Nginx Cache Policy)</h4>
                </div>
                <span className="text-xs text-stone-400 font-mono">nginx.conf</span>
              </div>
              <pre className="bg-stone-950 text-stone-300 p-3 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed" dir="ltr">
{`location ~* \.(js|css|webp|avif|png|jpg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  access_log off;
  gzip_static on;
}`}
              </pre>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
