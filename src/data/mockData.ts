import { Seller, ProductCategory, Product, MarketplaceOrder, Dispute, EgyptianGovernorate } from '../types';

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'seller-1',
    name: 'أقمشة ومنسوجات دلتا دسوق',
    tradeName: 'أقمشة دلتا دسوق',
    arabicName: 'أقمشة دلتا دسوق',
    ownerName: 'الحاج مصطفى الفرماوي',
    slug: 'delta-fabrics',
    logo: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    phone: '01012345679',
    address: 'شارع الجيش، وسط البلد، دسوق',
    desoqDistrict: 'شارع الجيش',
    city: 'دسوق',
    governorate: 'كفر الشيخ',
    commercialRecordNumber: 'CR-10492-DSQ',
    taxRegistrationNumber: 'TR-88214-KFS',
    commissionRate: 0.08,
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.95,
    reviewCount: 48,
    bankAccountOrWallet: {
      type: 'vodafone_cash',
      accountNumber: '01012345679',
      accountTitle: 'مصطفى الفرماوي'
    },
    totalSalesEGP: 124500,
    availableBalanceEGP: 18450,
    pendingBalanceEGP: 3200,
    joinedDate: '2024-01-15T10:00:00Z',
  },
  {
    id: 'seller-2',
    name: 'سجاد وكليم دسوق التراثي (آل النحاس)',
    tradeName: 'سجاد وكليم دسوق التراثي',
    arabicName: 'سجاد وكليم دسوق التراثي',
    ownerName: 'الأسطى عبد الحميد الغازي',
    slug: 'desoq-rugs',
    logo: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=150',
    banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    phone: '01012345680',
    address: 'ميدان سيدي إبراهيم الدسوقي، دسوق',
    desoqDistrict: 'الميدان الإبراهيمي',
    city: 'دسوق',
    governorate: 'كفر الشيخ',
    commercialRecordNumber: 'CR-33910-DSQ',
    taxRegistrationNumber: 'TR-91823-KFS',
    commissionRate: 0.08,
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.98,
    reviewCount: 36,
    bankAccountOrWallet: {
      type: 'instapay',
      accountNumber: 'elghazi@instapay',
      accountTitle: 'عبد الحميد الغازي'
    },
    totalSalesEGP: 89000,
    availableBalanceEGP: 12500,
    pendingBalanceEGP: 1800,
    joinedDate: '2024-02-01T10:00:00Z',
  },
  {
    id: 'seller-3',
    name: 'عطور ومسك البرلس ودسوق الفاخر',
    tradeName: 'عطور ومسك دسوق الفاخر',
    arabicName: 'عطور ومسك دسوق الفاخر',
    ownerName: 'الحاج إبراهيم الشناوي',
    slug: 'desoq-perfumes',
    logo: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=150',
    banner: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800',
    phone: '01012345681',
    address: 'حي الصفا، دسوق',
    desoqDistrict: 'حي الصفا',
    city: 'دسوق',
    governorate: 'كفر الشيخ',
    commercialRecordNumber: 'CR-55412-DSQ',
    taxRegistrationNumber: 'TR-77123-KFS',
    commissionRate: 0.08,
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.88,
    reviewCount: 29,
    bankAccountOrWallet: {
      type: 'vodafone_cash',
      accountNumber: '01012345681',
      accountTitle: 'إبراهيم الشناوي'
    },
    totalSalesEGP: 64200,
    availableBalanceEGP: 9400,
    pendingBalanceEGP: 1100,
    joinedDate: '2024-03-10T10:00:00Z',
  },
  {
    id: 'seller-4',
    name: 'إلكترونيات وساعات المحطة الذكية',
    tradeName: 'إلكترونيات وساعات المحطة',
    arabicName: 'إلكترونيات وساعات المحطة',
    ownerName: 'م. أحمد بركات',
    slug: 'station-tech',
    logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150',
    banner: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeede?w=800',
    phone: '01012345682',
    address: 'شارع عمر أفندي، دسوق',
    desoqDistrict: 'شارع عمر أفندي',
    city: 'دسوق',
    governorate: 'كفر الشيخ',
    commercialRecordNumber: 'CR-66718-DSQ',
    taxRegistrationNumber: 'TR-44321-KFS',
    commissionRate: 0.08,
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.75,
    reviewCount: 52,
    bankAccountOrWallet: {
      type: 'bank_account',
      accountNumber: 'EG500002000100000012345678901',
      accountTitle: 'أحمد بركات للتجارة'
    },
    totalSalesEGP: 154000,
    availableBalanceEGP: 21000,
    pendingBalanceEGP: 4500,
    joinedDate: '2024-04-01T10:00:00Z',
  },
  {
    id: 'seller-5',
    name: 'دار النيل للعبايات والمفروشات الراقية',
    tradeName: 'دار النيل للعبايات',
    arabicName: 'دار النيل للعبايات',
    ownerName: 'الحاج رفعت الصياد',
    slug: 'dar-al-nile',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=150',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    phone: '01012345683',
    address: 'الكورنيش، دسوق',
    desoqDistrict: 'الكورنيش',
    city: 'دسوق',
    governorate: 'كفر الشيخ',
    commercialRecordNumber: 'CR-88219-DSQ',
    taxRegistrationNumber: 'TR-11982-KFS',
    commissionRate: 0.08,
    status: 'active',
    verificationStatus: 'verified',
    rating: 4.6,
    reviewCount: 22,
    bankAccountOrWallet: {
      type: 'vodafone_cash',
      accountNumber: '01012345683',
      accountTitle: 'رفعت الصياد'
    },
    totalSalesEGP: 72000,
    availableBalanceEGP: 8300,
    pendingBalanceEGP: 1500,
    joinedDate: '2024-05-15T10:00:00Z',
  }
];

export const CATEGORIES: ProductCategory[] = [
  {
    id: 'complete_looks',
    nameAr: 'أطقم كاملة وتنسيقات',
    nameEn: 'Complete Outfits & Bundles',
    icon: 'Crown',
    description: 'أطقم ملابس منسقة بالكامل وجاهزة للارتداء توفر وقتك وفلوسك مع خصم باقة',
    productCount: 1,
  },
  {
    id: 'men_fashion',
    nameAr: 'ملابس رجالي',
    nameEn: "Men's Fashion & Suits",
    icon: 'UserCheck',
    description: 'بدل رسمية، قمصان قطن مصري، بليزرات، بنطلونات، وجلابيب خامات عالية الجودة',
    productCount: 2,
  },
  {
    id: 'women_fashion',
    nameAr: 'ملابس حريمي وعبايات',
    nameEn: "Women's Fashion & Abayas",
    icon: 'Heart',
    description: 'عبايات خروج واستقبال، فساتين سهرة، دريسات للمحجبات، وطرح وشيلان',
    productCount: 1,
  },
  {
    id: 'perfumes_fragrances',
    nameAr: 'عطور وبخور',
    nameEn: 'Perfumes & Fragrances',
    icon: 'Sparkles',
    description: 'عطور رجالي وحريمي، دهن عود أصلي، مسك الطهارة، وبخور فواح بثبات عالي',
    productCount: 1,
  },
  {
    id: 'watches_accessories',
    nameAr: 'ساعات وإكسسوارات',
    nameEn: 'Watches & Accessories',
    icon: 'Watch',
    description: 'ساعات يد أنيقة، محافظ وأحزمة جلد طبيعي، ونظارات شمسية معتمدة',
    productCount: 1,
  },
  {
    id: 'shoes_bags',
    nameAr: 'أحذية وحقائب',
    nameEn: 'Shoes & Bags',
    icon: 'ShoppingBag',
    description: 'أحذية كلاسيك جلد طبيعي، كوتشيات وسنيكرز مريحة، وشنط يد وحقائب كروس',
    productCount: 0,
  },
  {
    id: 'kids_wear',
    nameAr: 'ملابس أطفال',
    nameEn: "Kids' Clothes & Shoes",
    icon: 'Smile',
    description: 'ملابس قطنية ناعمة ومريحة للأولاد والبنات والمواليد خامات صحية وآمنة',
    productCount: 0,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sellerId: 'seller-1',
    titleAr: 'طقم قماش رجالي فاخر قطن مصري 100% تطريز يدوي مع أزرار صدف طبيعي',
    titleEn: 'Luxury Egyptian Cotton Men Fabric Set with Hand Embroidery & Natural Shell Buttons',
    descriptionAr: 'أفخر أقمشة القطن المصري طويل التيلة من مصانع دسوق التراثية، ملمس فائق النعومة، يشمل قماش تفصيل ثوب رجالي كامل، مع تطريز ياقة وأكمام وأزرار صدف طبيعية.',
    category: 'men_fashion',
    priceEGP: 850,
    originalPriceEGP: 1050,
    stock: 25,
    rating: 4.95,
    reviewCount: 156,
    isFeatured: true,
    isDesoqLocalMade: true,
    isFastDesoqDelivery: true,
    attributes: {
      brand: 'أقمشة دلتا دسوق',
      origin: 'دسوق، كفر الشيخ',
      material: '100% قطن مصري سوبر جيزة 94',
      warranty: 'ضمان ثبات اللون ومقاومة الكرمشة'
    },
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      {
        id: 'v1-1',
        name: 'أبيض ناصع - قطعة 3.5 متر',
        sku: 'FAB-MEN-WHT-35',
        priceEGP: 850,
        stock: 15,
        attributes: { color: 'أبيض', length: '3.5 متر' }
      },
      {
        id: 'v1-2',
        name: 'سكري كلاسيك - قطعة 3.5 متر',
        sku: 'FAB-MEN-CRM-35',
        priceEGP: 850,
        stock: 10,
        attributes: { color: 'سكري', length: '3.5 متر' }
      }
    ],
    status: 'active',
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'prod-2',
    sellerId: 'seller-2',
    titleAr: 'كليم يدوي صوف طبيعي تراثي - نقوش هندسية دسوقية أصيلة',
    titleEn: 'Heritage Handwoven Pure Wool Kilim Carpet (Desoq Geometric)',
    descriptionAr: 'كليم وسجاد يدوي أصيل من صوف الأغنام الطبيعي المصبوغ بنباتات برية، صناعة يدوية دقيقة بأيدي نساجي دسوق وكفر الشيخ، تحفة فنية تدوم لعشرات السنين.',
    category: 'complete_looks',
    priceEGP: 980,
    originalPriceEGP: 1250,
    stock: 33,
    rating: 4.98,
    reviewCount: 280,
    isFeatured: true,
    isDesoqLocalMade: true,
    isFastDesoqDelivery: true,
    attributes: {
      brand: 'سجاد وكليم دسوق التراثي',
      origin: 'ميدان سيدي إبراهيم الدسوقي، دسوق',
      material: 'صوف طبيعي 100%',
      warranty: 'صناعة يدوية أصيلة وضمان مدى الحياة'
    },
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      {
        id: 'v2-1',
        name: 'مقاس 150×200 سم - نبيتي كلاسيك',
        sku: 'KLM-WOL-1520-RED',
        priceEGP: 980,
        stock: 20,
        attributes: { size: '150×200 سم', color: 'نبيتي' }
      },
      {
        id: 'v2-2',
        name: 'مقاس 200×300 سم - كحلي ملكي',
        sku: 'KLM-WOL-2030-BLU',
        priceEGP: 1650,
        stock: 13,
        attributes: { size: '200×300 سم', color: 'كحلي' }
      }
    ],
    status: 'active',
    createdAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'prod-3',
    sellerId: 'seller-3',
    titleAr: 'توليفة مسك الختام ودهن عود دسوق الملكي المعتق (زجاجة كريستال فاخرة)',
    titleEn: 'Royal Aged Oud & Misk Al-Khitam Fragrance (Crystal Bottle)',
    descriptionAr: 'أرقى دهن عود هندي معتق ممتزج بمسك الغزال الملكي النقي وعبير زهور النيل، ثبات فواح يدوم لأكثر من 48 ساعة بتركيز اكستري دي بارفان زيتي نقي.',
    category: 'perfumes_fragrances',
    priceEGP: 450,
    originalPriceEGP: 550,
    stock: 60,
    rating: 4.88,
    reviewCount: 142,
    isFeatured: true,
    isDesoqLocalMade: true,
    isFastDesoqDelivery: true,
    attributes: {
      brand: 'عطور ومسك دسوق الفاخر',
      origin: 'دسوق، كفر الشيخ',
      perfumeConcentration: 'extrait_de_parfum',
      bottleVolume: 'bottle_50ml',
      scentFamily: 'oriental_oud'
    },
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      {
        id: 'v3-1',
        name: 'تولة دهن عود ومسك فاخر (12 مل)',
        sku: 'FRG-OUD-TOL',
        priceEGP: 450,
        stock: 35,
        attributes: { size: '12 مل' }
      },
      {
        id: 'v3-2',
        name: 'أوقية ملكية كاملة (30 مل)',
        sku: 'FRG-OUD-OQY',
        priceEGP: 850,
        stock: 25,
        attributes: { size: '30 مل' }
      }
    ],
    status: 'active',
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'prod-4',
    sellerId: 'seller-4',
    titleAr: 'ساعة يد كلاسيك رجالية كوارتز مع سوار ستانلس ستيل مقاوم للماء',
    titleEn: 'Classic Men Quartz Watch with Stainless Steel Waterproof Band',
    descriptionAr: 'ساعة رجالية أنيقة بتصميم عصري راقٍ، زجاج ياقوتي مقاوم للخدش، ماكينة يابانية فائقة الدقة، ومقاومة للماء حتى عمق 30 متراً مع علبة هدايا جلدية فاخرة.',
    category: 'watches_accessories',
    priceEGP: 1250,
    originalPriceEGP: 1490,
    stock: 18,
    rating: 4.75,
    reviewCount: 63,
    isFeatured: false,
    isFastDesoqDelivery: true,
    attributes: {
      brand: 'إلكترونيات وساعات المحطة',
      origin: 'وكيل معتمد',
      warranty: 'ضمان سنتين شامل البطارية والماكينة'
    },
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      {
        id: 'v4-1',
        name: 'ميناء أسود ملكي وسوار فضي',
        sku: 'WTC-MEN-BLK-SLV',
        priceEGP: 1250,
        stock: 12,
        attributes: { dialColor: 'أسود', bandColor: 'فضي' }
      },
      {
        id: 'v4-2',
        name: 'ميناء أزرق بحري وسوار ذهبي',
        sku: 'WTC-MEN-BLU-GLD',
        priceEGP: 1350,
        stock: 6,
        attributes: { dialColor: 'أزرق', bandColor: 'ذهبي' }
      }
    ],
    status: 'active',
    createdAt: '2026-09-10T10:00:00Z'
  },
  {
    id: 'prod-5',
    sellerId: 'seller-5',
    titleAr: 'عباية كريب سعودي حريري مطرزة خيوط حرير - تصميم أميري راقي',
    titleEn: 'Luxury Silk Crepe Abaya with Hand Embroidery (Emiri Cut)',
    descriptionAr: 'عباية نسائية فاخرة من الكريب الحريري الملكي الناعم، مزينة بتطريزات يدوية راقية على الأكمام والصدر، قصة واسعة مريحة مع طرحة من نفس القماش مجاناً.',
    category: 'women_fashion',
    priceEGP: 1450,
    originalPriceEGP: 1850,
    stock: 19,
    rating: 4.9,
    reviewCount: 78,
    isFeatured: true,
    isDesoqLocalMade: true,
    isFastDesoqDelivery: true,
    attributes: {
      brand: 'دار النيل للعبايات',
      origin: 'دسوق - كفر الشيخ',
      material: 'كريب حريري سعودي نخب أول',
      warranty: 'استبدال واسترجاع 14 يوماً'
    },
    images: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      {
        id: 'v5-1',
        name: 'مقاس 56 - أسود كاحل',
        sku: 'ABY-EMR-56-BLK',
        priceEGP: 1450,
        stock: 10,
        attributes: { size: '56', color: 'أسود' }
      },
      {
        id: 'v5-2',
        name: 'مقاس 58 - أسود كاحل',
        sku: 'ABY-EMR-58-BLK',
        priceEGP: 1450,
        stock: 9,
        attributes: { size: '58', color: 'أسود' }
      }
    ],
    status: 'active',
    createdAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'prod-6',
    sellerId: 'seller-1',
    titleAr: 'بشكير حمام قطن مصري فاخر كثافة 650 جرام (طقم قطعتين)',
    titleEn: 'Luxury Egyptian Cotton Bath Towels 650 GSM (Set of 2)',
    descriptionAr: 'مناشف استحمام بأعلى معايير الجودة العالمية، أقمشة قطن مصري فائق النعومة والامتصاص وسريعة الجفاف، حياكة دسوقية متقنة.',
    category: 'men_fashion',
    priceEGP: 460,
    originalPriceEGP: 580,
    stock: 34,
    rating: 4.85,
    reviewCount: 52,
    isFeatured: false,
    isDesoqLocalMade: true,
    isFastDesoqDelivery: true,
    attributes: {
      brand: 'أقمشة دلتا دسوق',
      origin: 'دسوق، كفر الشيخ',
      material: '100% قطن مصري ممتاز',
      warranty: 'ضمان ثبات اللون بعد الغسيل المتكرر'
    },
    images: [
      'https://images.unsplash.com/photo-1583845112239-97ef1341b271?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    createdAt: '2026-09-01T10:00:00Z'
  }
];

export const INITIAL_ORDERS: MarketplaceOrder[] = [
  {
    id: 'SD-558433',
    trackingCode: 'DSQ-ORD-558433',
    customerId: 'cust-demo',
    customerName: 'فاطمة إبراهيم النجار',
    customerPhone: '01012345678',
    shippingAddress: {
      id: 'addr-seed-1',
      fullName: 'فاطمة إبراهيم النجار',
      phone: '01012345678',
      governorate: 'كفر الشيخ',
      city: 'دسوق',
      district: 'حي الصفا',
      streetDetails: 'شارع الجيش - بجوار البنك الأهلي',
      buildingNo: '14',
      floorNo: '3',
      apartmentNo: '6'
    },
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending_cod',
    subOrders: [
      {
        id: 'SD-558433-SUB-1',
        sellerId: 'seller-1',
        sellerName: 'أقمشة ومنسوجات دلتا دسوق',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 1,
            sellerId: 'seller-1'
          }
        ],
        subtotalEGP: 850,
        shippingFeeEGP: 25,
        commissionEGP: 68,
        sellerNetEGP: 782,
        status: 'delivered',
        shippingProvider: 'DesoqExpress',
        trackingNumber: 'DSQ-TRK-404466',
        estimatedDelivery: 'خلال 24 ساعة (تسليم دسوق السريع)',
        statusHistory: [
          {
            status: 'seller_confirmed',
            timestamp: '2026-09-10T10:00:00Z',
            noteAr: 'تم تجهيز الطرد وتغليفه'
          },
          {
            status: 'delivered',
            timestamp: '2026-09-11T12:30:00Z',
            noteAr: 'تم تسليم الطرد للعميل بنجاح'
          }
        ]
      },
      {
        id: 'SD-558433-SUB-2',
        sellerId: 'seller-2',
        sellerName: 'سجاد وكليم دسوق التراثي (آل النحاس)',
        items: [
          {
            product: INITIAL_PRODUCTS[1],
            quantity: 1,
            sellerId: 'seller-2'
          }
        ],
        subtotalEGP: 980,
        shippingFeeEGP: 35,
        commissionEGP: 78.4,
        sellerNetEGP: 901.6,
        status: 'seller_confirmed',
        shippingProvider: 'DesoqExpress',
        trackingNumber: 'DSQ-TRK-313100',
        estimatedDelivery: 'خلال 24 ساعة (تسليم دسوق السريع)',
        statusHistory: [
          {
            status: 'seller_confirmed',
            timestamp: '2026-09-10T10:00:00Z',
            noteAr: 'تم تأكيد الطلب وجاري تجهيز السجاد للشحن'
          }
        ]
      }
    ],
    totalSubtotalEGP: 1830,
    totalShippingEGP: 60,
    discountEGP: 0,
    totalAmountEGP: 1890,
    createdAt: '2026-09-10T10:00:00Z',
    orderStatus: 'processing'
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'DISP-2026-8196',
    orderId: 'SD-558433',
    subOrderId: 'SD-558433-SUB-1',
    sellerId: 'seller-1',
    sellerName: 'أقمشة ومنسوجات دلتا دسوق',
    customerName: 'فاطمة إبراهيم النجار',
    reason: 'defective_product',
    description: 'السلعة بها عيب تصنيع واضح ومطلوب رد المبلغ وفق قانون حماية المستهلك',
    requestedResolution: 'refund',
    status: 'resolved',
    createdAt: '2026-09-12T10:00:00Z',
    messages: [
      {
        sender: 'customer',
        senderName: 'فاطمة إبراهيم النجار',
        message: 'السلعة بها عيب تصنيع واضح ومطلوب رد المبلغ وفق قانون حماية المستهلك',
        timestamp: '2026-09-12T10:00:00Z'
      },
      {
        sender: 'admin',
        senderName: 'إدارة التحكيم وحماية المستهلك بسوق دسوق',
        message: 'قرار التحكيم النهائي: بناء على فحص العيب المصنعي تقرر رد المبلغ بالكامل للمشتري وخصمه من مستحقات التاجر',
        timestamp: '2026-09-12T12:00:00Z'
      }
    ],
    resolution: 'بناء على فحص العيب المصنعي تقرر رد المبلغ بالكامل للمشتري وخصمه من مستحقات التاجر'
  }
];

export const EGYPTIAN_GOVERNORATES: EgyptianGovernorate[] = [
  'كفر الشيخ',
  'الغربية',
  'البحيرة',
  'الإسكندرية',
  'القاهرة',
  'الجيزة',
  'الدقهلية',
  'الشرقية',
  'المنوفية',
  'دمياط',
  'باقي محافظات مصر'
];

export const DESOQ_DISTRICTS = [
  'شارع الجيش',
  'الميدان الإبراهيمي',
  'حي الصفا',
  'دحروج',
  'شارع عمر أفندي',
  'الكورنيش',
  'تقسيم معلمي دسوق',
  'حي السلام',
  'مركز ومدينة دسوق'
];
