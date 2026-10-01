export interface SubCategory {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  itemCount: number;
  popularSearchTerms: string[];
  bannerImage: string;
}

export interface ExtendedCategory {
  id: string;
  aliasIds?: string[];
  nameAr: string;
  nameEn: string;
  icon: string;
  iconName: string;
  description: string;
  descriptionEn: string;
  badgeAr?: string;
  subcategories: SubCategory[];
  heroImage: string;
  popularFilters: {
    labelAr: string;
    labelEn: string;
    key: string;
    options: string[];
  }[];
}

export const EXTENDED_CATEGORIES: ExtendedCategory[] = [
  {
    id: 'complete_looks',
    aliasIds: ['cat-complete-looks', 'complete_looks', 'lookbooks'],
    nameAr: 'أطقم كاملة وتنسيقات',
    nameEn: 'Complete Outfits & Bundles',
    icon: '✨',
    iconName: 'Crown',
    description: 'أطقم ملابس منسقة بالكامل (قميص + بنطلون + بدلة أو حذاء وإكسسوار) توفر وقتك وفلوسك مع خصم باقة',
    descriptionEn: 'Full head-to-toe coordinated outfits and stylist-curated sets with bundle savings.',
    badgeAr: 'خصم الطقم الكامل 15-20%',
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { 
        labelAr: 'المناسبة', 
        labelEn: 'Occasion', 
        key: 'occasion', 
        options: ['أفراح وسهرات', 'عمل واجتماعات', 'كاجوال ويومي', 'أعياد ومناسبات'] 
      },
      { 
        labelAr: 'نوع الطقم', 
        labelEn: 'Outfit Type', 
        key: 'outfit_type', 
        options: ['طقم بدلة 3 قطع', 'طقم كامل بالحذاء', 'طقم كاجوال خفيف', 'طقم حريمي كامل'] 
      },
      { 
        labelAr: 'القسم', 
        labelEn: 'Section', 
        key: 'realm', 
        options: ['أطقم رجالي', 'أطقم حريمي', 'أطقم شبابي', 'أطقم أطفال'] 
      },
    ],
    subcategories: [
      {
        id: 'sub-looks-men',
        categoryId: 'complete_looks',
        nameAr: 'أطقم رجالي كاملة',
        nameEn: "Men's Full Outfits",
        descriptionAr: 'تنسيق متكامل: بدلة أو قميص وبنطلون وحذاء جلد وإكسسوار متناسق',
        descriptionEn: 'Tailored suit, cotton shirt, matching leather footwear, and perfume.',
        itemCount: 18,
        popularSearchTerms: ['طقم عريس كامل', 'تنسيق بدلة للعمل', 'طقم كاجوال شيك'],
        bannerImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-looks-women',
        categoryId: 'complete_looks',
        nameAr: 'أطقم حريمي وسهرات',
        nameEn: "Women's Outfits & Sets",
        descriptionAr: 'عبايات سهرة مطرزة مع طرحة وشنطة متناسقة',
        descriptionEn: 'Luxury reception abaya with matching silk hijab, clutch, and jewelry.',
        itemCount: 22,
        popularSearchTerms: ['طقم سهرة كامل', 'طقم عباية وشال', 'طقم كتب كتاب'],
        bannerImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-looks-kids',
        categoryId: 'complete_looks',
        nameAr: 'أطقم أطفال للمناسبات',
        nameEn: 'Kids Outfits & Sets',
        descriptionAr: 'بدل أطفال وفساتين مريحة ومبهجة للأفراح والمناسبات والأعياد',
        descriptionEn: 'Matching wedding suits and princess dresses with orthopedic shoes.',
        itemCount: 14,
        popularSearchTerms: ['بدلة أطفال أفراح', 'فستان بنات للعيد', 'طقم سبوع'],
        bannerImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'men_fashion',
    aliasIds: ['cat-fashion-men', 'men_fashion'],
    nameAr: 'ملابس رجالي',
    nameEn: "Men's Fashion & Apparel",
    icon: '👔',
    iconName: 'UserCheck',
    description: 'بدل رسمية، قمصان قطن مصري، بليزرات، بنطلونات، وجلابيب خامات عالية الجودة',
    descriptionEn: 'Tailored suits, Egyptian cotton shirts, blazers, trousers, and complete menswear looks.',
    badgeAr: 'قطن مصري 100%',
    heroImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { labelAr: 'النوع', labelEn: 'Type', key: 'type', options: ['بدل وبليزرات', 'قمصان قطن', 'بناطيل وجينز', 'جلابيب مصرية', 'أطقم كاملة'] },
      { labelAr: 'المقاس', labelEn: 'Size', key: 'size', options: ['M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] },
      { labelAr: 'المناسبة', labelEn: 'Occasion', key: 'occasion', options: ['أفراح ومناسبات', 'عمل ورسميات', 'كاجوال يومي', 'صلاة وأعياد'] },
    ],
    subcategories: [
      {
        id: 'sub-men-suits',
        categoryId: 'men_fashion',
        nameAr: 'بدل وبليزرات',
        nameEn: 'Suits & Blazers',
        descriptionAr: 'بدل سليم وكلاسيك للمناسبات والأفراح والعمل والمؤتمرات',
        descriptionEn: 'Italian cut suits and blazers for weddings and business meetings',
        itemCount: 28,
        popularSearchTerms: ['بدلة رجالي', 'بدلة خطوبة', 'بدلة توكسيدو', 'بليزر كحلي'],
        bannerImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-men-shirts',
        categoryId: 'men_fashion',
        nameAr: 'قمصان قطن مصري',
        nameEn: 'Egyptian Cotton Shirts',
        descriptionAr: 'قمصان قطن مريحة ناصعة البياض وألوان عملية مناسبة للعمل والخروج',
        descriptionEn: 'Premium white and colored shirts crafted from long-staple Egyptian cotton',
        itemCount: 35,
        popularSearchTerms: ['قميص قطن مصري', 'قميص أبيض كلاسيك', 'قميص أكسفورد'],
        bannerImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-men-pants',
        categoryId: 'men_fashion',
        nameAr: 'بناطيل وجينز',
        nameEn: 'Trousers, Chinos & Jeans',
        descriptionAr: 'بناطيل قماش مريحة وتشينو وجينز عملي يتحمل الاستخدام اليومي',
        descriptionEn: 'Classic formal trousers, chinos, and durable denim pants',
        itemCount: 24,
        popularSearchTerms: ['بنطلون قماش كلاسيك', 'بنطلون تشينو زيتي', 'جينز سليم فيت'],
        bannerImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-men-heritage',
        categoryId: 'men_fashion',
        nameAr: 'جلابيب وعبايات رجالي',
        nameEn: 'Traditional Galabeyas & Robes',
        descriptionAr: 'جلابيب قطن وصوف مريحة وأصيلة للمناسبات والأعياد والصلاة',
        descriptionEn: 'Hand-embroidered Egyptian galabeyas and heritage robes',
        itemCount: 16,
        popularSearchTerms: ['جلابية رجالي صوف', 'جلابية قطن دسوقي', 'عباءة صلاة'],
        bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-men-looks',
        categoryId: 'men_fashion',
        nameAr: 'أطقم رجالية جاهزة',
        nameEn: "Men's Complete Looks",
        descriptionAr: 'تنسيقات كاملة جاهزة (بدلة + قميص + حذاء) بخصم خاص',
        descriptionEn: 'Full curated head-to-toe outfits with bundle discounts',
        itemCount: 12,
        popularSearchTerms: ['طقم كامل للرجل', 'تنسيق عريس', 'طقم بيزنس شيك'],
        bannerImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'women_fashion',
    aliasIds: ['cat-fashion-women', 'women_fashion'],
    nameAr: 'ملابس حريمي وعبايات',
    nameEn: "Women's Fashion & Abayas",
    icon: '👗',
    iconName: 'Heart',
    description: 'عبايات خروج واستقبال، فساتين سهرة، دريسات للمحجبات، وطرح وشيلان',
    descriptionEn: 'Elegant Saudi and Egyptian abayas, modest party dresses, and silk scarves.',
    badgeAr: 'موديلات جديدة 2026',
    heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { labelAr: 'الخامة', labelEn: 'Material', key: 'material', options: ['كريب ناعم', 'حرير طبيعي', 'شيفون خفيف', 'قطن مريح'] },
      { labelAr: 'المناسبة', labelEn: 'Occasion', key: 'occasion', options: ['عبايات خروج', 'فساتين سهرة', 'كاجوال يومي', 'طرح وشيلان'] },
    ],
    subcategories: [
      {
        id: 'sub-abayas',
        categoryId: 'women_fashion',
        nameAr: 'عبايات خروج واستقبال',
        nameEn: 'Abayas & Kaftans',
        descriptionAr: 'عبايات سوداء وملونة بتطريزات أنيقة وقماش مريح وبارد',
        descriptionEn: 'Hand-embroidered premium abayas for reception and formal outings',
        itemCount: 42,
        popularSearchTerms: ['عباية استقبال', 'عباية سوداء مطرزة', 'عباية سعودي'],
        bannerImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-dresses',
        categoryId: 'women_fashion',
        nameAr: 'فساتين ودريسات',
        nameEn: 'Evening Gowns & Dresses',
        descriptionAr: 'فساتين سهرة ومناسبات ودريسات خروج أنيقة ومحتشمة',
        descriptionEn: 'Chic long dresses and modest evening gowns',
        itemCount: 30,
        popularSearchTerms: ['فستان محجبات', 'فستان سهرة', 'فستان خروج'],
        bannerImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'perfumes_fragrances',
    aliasIds: ['cat-perfumes', 'perfumes_fragrances'],
    nameAr: 'عطور وبخور',
    nameEn: 'Perfumes & Fragrances',
    icon: '✨',
    iconName: 'Sparkles',
    description: 'عطور رجالي وحريمي، دهن عود أصلي، مسك الطهارة، وبخور فواح بثبات عالي',
    descriptionEn: 'Pure essential oils, white musk, rare oud attars, and artisanal perfumes.',
    badgeAr: 'ثبات يدوم طويلاً',
    heroImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { labelAr: 'النوع', labelEn: 'Type', key: 'type', options: ['عطور رجالي', 'عطور حريمي', 'دهن عود ومسك', 'بخور ومباخر'] },
    ],
    subcategories: [
      {
        id: 'sub-royal-perfumes',
        categoryId: 'perfumes_fragrances',
        nameAr: 'عطور رجالي وحريمي',
        nameEn: 'Perfumes & Fragrances',
        descriptionAr: 'عطور شرقية وغربية بتركيز عالي وثبات ممتاز يدوم طوال اليوم',
        descriptionEn: 'Long-lasting Eau de Parfum blends with royal silage',
        itemCount: 38,
        popularSearchTerms: ['عطر سلطان الدلتا', 'عطر رجالي ثبات', 'عطر نسائي فاخر'],
        bannerImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-musk-oud',
        categoryId: 'perfumes_fragrances',
        nameAr: 'عود ومسك وبخور',
        nameEn: 'Oud, Musk & Incense',
        descriptionAr: 'دهن عود معتق ومسك أبيض نقي بدون كحول بلمسة مخملية',
        descriptionEn: 'Alcohol-free aged oud oils and silky white musk attars',
        itemCount: 26,
        popularSearchTerms: ['مسك الطهارة', 'تولة دهن عود', 'مسك أبيض'],
        bannerImage: 'https://images.unsplash.com/photo-1608248597359-299313264426?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'watches_accessories',
    aliasIds: ['cat-watches', 'watches_accessories'],
    nameAr: 'ساعات وإكسسوارات',
    nameEn: 'Watches & Accessories',
    icon: '⌚',
    iconName: 'Watch',
    description: 'ساعات يد أنيقة، محافظ وأحزمة جلد طبيعي، ونظارات شمسية معتمدة',
    descriptionEn: 'Luxury wristwatches, genuine leather wallets, sunglasses, and gifts.',
    badgeAr: 'ضمان سنة كاملة',
    heroImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { labelAr: 'النوع', labelEn: 'Type', key: 'type', options: ['ساعات ستانلس', 'ساعات جلد', 'محافظ جلد طبيعي', 'نظارات شمسية'] },
    ],
    subcategories: [
      {
        id: 'sub-watches',
        categoryId: 'watches_accessories',
        nameAr: 'ساعات يد',
        nameEn: 'Wristwatches',
        descriptionAr: 'ساعات رجالي وحريمي ستانلس وجلد بتصاميم جذابة وضد الماء',
        descriptionEn: 'Japanese & Swiss movement timepieces with water resistance',
        itemCount: 32,
        popularSearchTerms: ['ساعة رجالي ضد الماء', 'ساعة ستانلس', 'ساعة حريمي'],
        bannerImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-leather-accessories',
        categoryId: 'watches_accessories',
        nameAr: 'محافظ وأحزمة ونظارات',
        nameEn: 'Wallets, Belts & Sunglasses',
        descriptionAr: 'محافظ جلد طبيعي 100% وأحزمة متينة ونظارات شمسية تحمي من الشمس',
        descriptionEn: 'Genuine leather wallets, belts, and polarized sunglasses',
        itemCount: 28,
        popularSearchTerms: ['محفظة جلد طبيعي', 'حزام جلد', 'نظارة شمسية'],
        bannerImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'shoes_bags',
    aliasIds: ['cat-shoes-bags', 'shoes_bags'],
    nameAr: 'أحذية وحقائب',
    nameEn: 'Shoes & Bags',
    icon: '👞',
    iconName: 'ShoppingBag',
    description: 'أحذية كلاسيك جلد طبيعي، كوتشيات وسنيكرز مريحة، وشنط يد وحقائب كروس',
    descriptionEn: 'Genuine leather classic shoes, casual sneakers, and ladies handbags.',
    badgeAr: 'جلد طبيعي 100%',
    heroImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { labelAr: 'النوع', labelEn: 'Type', key: 'type', options: ['أحذية كلاسيك رجالي', 'سنيكرز وكوتشيات', 'شنط يد حريمي', 'شنط كروس وسفر'] },
    ],
    subcategories: [
      {
        id: 'sub-shoes',
        categoryId: 'shoes_bags',
        nameAr: 'أحذية وكوتشيات',
        nameEn: 'Shoes & Sneakers',
        descriptionAr: 'أحذية جلد طبيعي مريحة وسنيكرز خفيفة للعمل والخروج اليومي',
        descriptionEn: 'Italian design leather shoes and breathable sneakers',
        itemCount: 30,
        popularSearchTerms: ['حذاء جلد طبيعي', 'سنيكرز رجالي', 'حذاء كلاسيك'],
        bannerImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'sub-bags',
        categoryId: 'shoes_bags',
        nameAr: 'شنط وحقائب',
        nameEn: 'Handbags & Backpacks',
        descriptionAr: 'شنط يد حريمي أنيقة وحقائب كروس عملية بخامات ممتازة',
        descriptionEn: 'Chic leather handbags and versatile crossbody bags',
        itemCount: 25,
        popularSearchTerms: ['شنطة يد حريمي', 'شنطة جلد', 'شنطة كروس'],
        bannerImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'kids_wear',
    aliasIds: ['cat-fashion-kids', 'kids_wear'],
    nameAr: 'ملابس أطفال',
    nameEn: "Kids' Clothes & Shoes",
    icon: '👶',
    iconName: 'Smile',
    description: 'ملابس قطنية ناعمة ومريحة للأولاد والبنات والمواليد خامات صحية وآمنة',
    descriptionEn: 'Pure cotton clothing and soft footwear for infants and kids.',
    badgeAr: 'قطن ناعم وصحي',
    heroImage: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1200&auto=format&fit=crop&q=80',
    popularFilters: [
      { labelAr: 'العمر', labelEn: 'Age', key: 'age', options: ['مواليد وحديثي الولادة', '1 - 3 سنوات', '4 - 8 سنوات', '9 - 14 سنة'] },
    ],
    subcategories: [
      {
        id: 'sub-kids-clothes',
        categoryId: 'kids_wear',
        nameAr: 'ملابس أولاد وبنات',
        nameEn: 'Kids Outfits & Dresses',
        descriptionAr: 'أطقم يومية قطن مصري مريح وفساتين بنات للمناسبات والأعياد',
        descriptionEn: 'Soft cotton playsuits and party dresses for kids',
        itemCount: 28,
        popularSearchTerms: ['ملابس أطفال قطن', 'طقم أولادي', 'فستان بناتي'],
        bannerImage: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80'
      }
    ]
  }
];
