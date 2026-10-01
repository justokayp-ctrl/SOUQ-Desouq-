import { DepartmentHouseConfig, DepartmentRealmId, LookbookItem } from '../types';

export const DEPARTMENT_HOUSES_CONFIG: Record<DepartmentRealmId, DepartmentHouseConfig> = {
  gentleman: {
    id: 'gentleman',
    titleAr: 'أزياء الرجال',
    titleEn: "Men's Department",
    taglineAr: 'بدل رسمية، قمصان قطن مصري، أحذية جلد، وساعات فاخرة',
    taglineEn: 'Impeccable Tailoring, Pure Egyptian Cotton & Distinguished Presence',
    sealBadgeAr: 'جودة مضمونة ومقاسات دقيقة',
    narrativeAr: 'تشكيلة كاملة للرجل: بدل مناسبات وعمل، قمصان قطنية عالية الجودة، وأحذية جلد طبيعي وعطور تناسب كل الأوقات.',
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-[#1A1A1D] via-[#2D1B22] to-[#800020]',
    primaryColor: '#800020',
    accentColor: '#D4AF37',
    icon: '👔',
    subWings: [
      {
        id: 'tailored_suits',
        nameAr: 'بدل وبليزرات',
        nameEn: 'Tailored Suits & Blazers',
        icon: '🤵',
        categoryFilter: 'men_fashion',
        descriptionAr: 'قصات سليم وكلاسيك للأفراح والمناسبات واجتماعات العمل',
        badgeAr: 'صوف وخامات فاخرة',
        featuredImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'cotton_shirts',
        nameAr: 'قمصان قطن مصري',
        nameEn: 'Egyptian Cotton Shirts',
        icon: '👕',
        categoryFilter: 'men_fashion',
        descriptionAr: 'قطن مصري 100% طويل التيلة ناصع البياض ومريح في اللبس',
        badgeAr: 'قطن مصري 100%',
        featuredImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'leather_footwear',
        nameAr: 'أحذية جلد طبيعي',
        nameEn: 'Handcrafted Leather Shoes',
        icon: '👞',
        categoryFilter: 'men_fashion',
        descriptionAr: 'أحذية كلاسيك وسنيكرز بنعل طبي مريح لصحة القدمين',
        badgeAr: 'جلد طبيعي 100%',
        featuredImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'watches_accessories',
        nameAr: 'ساعات وإكسسوارات',
        nameEn: 'Watches & Accessories',
        icon: '⌚',
        categoryFilter: 'watches_accessories',
        descriptionAr: 'ساعات يد أنيقة، محافظ جلد طبيعي، وأحزمة متينة',
        badgeAr: 'ضمان سنة كاملة',
        featuredImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'oud_perfumes',
        nameAr: 'عطور ودهن عود',
        nameEn: 'Oud & Fragrances',
        icon: '✨',
        categoryFilter: 'perfumes_fragrances',
        descriptionAr: 'عطور مميزة بنفحات العود والعنبر والمسك الأبيض بثبات عالي',
        badgeAr: 'ثبات يدوم طويلاً',
        featuredImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400'
      }
    ],
    occasions: [
      {
        id: 'royal_wedding',
        nameAr: 'أفراح ومناسبات',
        descriptionAr: 'بدل عرسان وتوكسيدو وأطقم مناسبات فاخرة',
        icon: '👑'
      },
      {
        id: 'formal_business',
        nameAr: 'عمل واجتماعات',
        descriptionAr: 'أطقم كلاسيكية أنيقة للعمل والمقابلات الرسمية',
        icon: '💼'
      },
      {
        id: 'daily_casual',
        nameAr: 'كاجوال ويومي',
        descriptionAr: 'قمصان بولو وبناطيل تشينو وسنيكرز مريحة',
        icon: '☕'
      },
      {
        id: 'festive_celebration',
        nameAr: 'أعياد ومناسبات',
        descriptionAr: 'جلابيب مصرية مريحة وعبايات رجالية أصيلة',
        icon: '🌙'
      }
    ]
  },

  sanctuary: {
    id: 'sanctuary',
    titleAr: 'أزياء السيدات',
    titleEn: "Women's Department",
    taglineAr: 'عبايات، فساتين سهرة، دريسات محجبات، وطرح وحقائب',
    taglineEn: 'Silks, Bespoke Haute Couture & Regal Egyptian Elegance',
    sealBadgeAr: 'أحدث صيحات وتصاميم 2026',
    narrativeAr: 'كل ما يخص المرأة العصرية من فساتين سواريه وعبايات استقبال مطرزة ودريسات خروج أنيقة وطرح ناعمة.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-[#2B000B] via-[#5A0A26] to-[#800020]',
    primaryColor: '#800020',
    accentColor: '#D4AF37',
    icon: '👗',
    subWings: [
      {
        id: 'evening_gowns',
        nameAr: 'فساتين سهرة ومناسبات',
        nameEn: 'Evening Gowns & Dresses',
        icon: '✨',
        categoryFilter: 'women_fashion',
        descriptionAr: 'فساتين سواريه وخطوبة بأقمشة راقية وتطريز أنيق',
        badgeAr: 'مقاسات متنوعة',
        featuredImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'luxury_abayas',
        nameAr: 'عبايات خروج واستقبال',
        nameEn: 'Abayas & Kaftans',
        icon: '🧕',
        categoryFilter: 'women_fashion',
        descriptionAr: 'عبايات كريب ناعمة ومطرزة بألوان وتصاميم متنوعة تناسب كل وقت',
        badgeAr: 'قماش بارد ومريح',
        featuredImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'modest_casual',
        nameAr: 'دريسات وملابس كاجوال',
        nameEn: 'Dresses & Modest Casual',
        icon: '🧥',
        categoryFilter: 'women_fashion',
        descriptionAr: 'دريسات مريحة وتنانير وكارديجان للمحجبات تناسب الخروج والجامعة',
        badgeAr: 'أناقة وحشمة',
        featuredImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'scarves_hijabs',
        nameAr: 'طرح وشيلات',
        nameEn: 'Hijabs & Scarves',
        icon: '🧣',
        categoryFilter: 'women_fashion',
        descriptionAr: 'طرح شيفون وحرير وكريب بأحدث الألوان وثابتة على الرأس',
        badgeAr: 'خامات ناعمة وثابتة',
        featuredImage: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'bags_and_heels',
        nameAr: 'شنط وأحذية سواريه',
        nameEn: 'Bags & Heels',
        icon: '👠',
        categoryFilter: 'women_fashion',
        descriptionAr: 'شنط يد أنيقة وأحذية كعب مريحة للمناسبات والعمل',
        badgeAr: 'تشكيلة أنيقة',
        featuredImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400'
      }
    ],
    occasions: [
      {
        id: 'royal_wedding',
        nameAr: 'أفراح وسهرات',
        descriptionAr: 'فساتين سواريه وشنط يد ومجوهرات مناسبات',
        icon: '💎'
      },
      {
        id: 'formal_business',
        nameAr: 'عمل وجامعة',
        descriptionAr: 'بليزرات وأطقم عملية ومريحة لليوم الدراسي والعملي',
        icon: '💼'
      },
      {
        id: 'daily_casual',
        nameAr: 'خروجات يومية',
        descriptionAr: 'دريسات مريحة وعبايات استقبال ناعمة',
        icon: '🌸'
      },
      {
        id: 'festive_celebration',
        nameAr: 'أعياد ومناسبات عائلية',
        descriptionAr: 'قفاطين وعبايات مميزة للأعياد والجمعات العائلية',
        icon: '🪞'
      }
    ]
  },

  vanguard: {
    id: 'vanguard',
    titleAr: 'ملابس الشباب والكاجوال',
    titleEn: 'Youth & Casual Department',
    taglineAr: 'هوديز، تيشيرتات، بناطيل جينز وكارجو، وسنيكرز مريحة',
    taglineEn: 'Streetwear, Contemporary Oversized & Kinetic Energy',
    sealBadgeAr: 'ستايل عصري ومريح',
    narrativeAr: 'أحدث صيحات الملابس الكاجوال المريحة، تيشيرتات وهوديز قطن، بناطيل جينز وكارجو، وسنيكرز خفيف ليوم عملي ومريح.',
    heroImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-[#111827] via-[#1E1B4B] to-[#31102A]',
    primaryColor: '#31102A',
    accentColor: '#D4AF37',
    icon: '🧢',
    subWings: [
      {
        id: 'oversized_hoodies',
        nameAr: 'هوديز وتيشيرتات',
        nameEn: 'Hoodies & Tees',
        icon: '🛹',
        categoryFilter: 'men_fashion',
        descriptionAr: 'قطن مصري ناعم، تصاميم واسعة مريحة وألوان شبابية',
        badgeAr: 'خامات قطنية ممتازة',
        featuredImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'cargo_denim',
        nameAr: 'بناطيل جينز وكارجو',
        nameEn: 'Cargo Pants & Jeans',
        icon: '👖',
        categoryFilter: 'men_fashion',
        descriptionAr: 'جينز مريح وكارجو متعدد الجيوب خامات قطنية متينة للتحمل',
        badgeAr: 'مريح وعملي',
        featuredImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'sneaker_vault',
        nameAr: 'سنيكرز وأحذية رياضية',
        nameEn: 'Sneakers & Sport Shoes',
        icon: '👟',
        categoryFilter: 'men_fashion',
        descriptionAr: 'أحذية رياضية وسنيكرز خفيفة ومريحة للحركة اليومية السريعة',
        badgeAr: 'راحة طوال اليوم',
        featuredImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'caps_backpacks',
        nameAr: 'كابات وشنط ظهر',
        nameEn: 'Caps & Backpacks',
        icon: '🎒',
        categoryFilter: 'watches_accessories',
        descriptionAr: 'شنط ظهر عملية للجامعة واللابتوب وكابات عصرية للشمس',
        badgeAr: 'عملية وخفيفة',
        featuredImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400'
      }
    ],
    occasions: [
      {
        id: 'daily_casual',
        nameAr: 'جامعة وخروجات يومية',
        descriptionAr: 'أطقم عملية ومريحة ليوم طويل من الحركة والنشاط',
        icon: '🎓'
      },
      {
        id: 'festive_celebration',
        nameAr: 'حفلات وسهرات شبابية',
        descriptionAr: 'ستايل عصري وجريء مع إكسسوارات مميزة',
        icon: '🔥'
      },
      {
        id: 'formal_business',
        nameAr: 'سمارت كاجوال وعمل',
        descriptionAr: 'تنسيق قميص كاجوال مع سنيكرز أبيض وبنطلون قماش',
        icon: '⚡'
      },
      {
        id: 'royal_wedding',
        nameAr: 'مناسبات الأصدقاء',
        descriptionAr: 'بليزر شبابي أنيق مع تيشيرت وبنطلون سليم',
        icon: '🎉'
      }
    ]
  },

  little_royals: {
    id: 'little_royals',
    titleAr: 'ملابس الأطفال والمواليد',
    titleEn: 'Kids & Newborns Department',
    taglineAr: 'ملابس قطنية ناعمة ومريحة للأولاد والبنات والمواليد',
    taglineEn: 'Pure Organic Cotton, Hypoallergenic Fabrics & Playful Joy',
    sealBadgeAr: 'قطن طبيعي آمن على بشرة الطفل',
    narrativeAr: 'ملابس مريحة وآمنة للأطفال من عمر يوم حتى 14 سنة بخامات قطنية ناعمة لا تسبب حساسية، مع بدل وفساتين للأفراح والمناسبات.',
    heroImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1600',
    bgGradient: 'from-[#1A2E3B] via-[#0F394C] to-[#1C5D79]',
    primaryColor: '#0F394C',
    accentColor: '#D4AF37',
    icon: '🧸',
    subWings: [
      {
        id: 'newborn_cotton',
        nameAr: 'مستلزمات المواليد',
        nameEn: 'Newborn Essentials',
        icon: '🍼',
        categoryFilter: 'kids_wear',
        descriptionAr: 'سالوبيتات وبطاطين وداخليات قطن 100% آمنة على بشرة الرضع',
        badgeAr: 'صديق لبشرة البيبي',
        featuredImage: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'little_gentlemen',
        nameAr: 'بدل أولاد للمناسبات',
        nameEn: 'Boys Party Suits',
        icon: '🤴',
        categoryFilter: 'kids_wear',
        descriptionAr: 'بدل أنيقة للأولاد بفيونكة وبليزرات للأفراح والمناسبات السعيدة',
        badgeAr: 'أناقة مبهجة',
        featuredImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'princess_dresses',
        nameAr: 'فساتين بنات وسهرات',
        nameEn: 'Girls Party Dresses',
        icon: '👑',
        categoryFilter: 'kids_wear',
        descriptionAr: 'فساتين بناتية مبهجة للأعياد والأفراح ببطانة قطنية تمنع التحسس',
        badgeAr: 'بطانة قطن طبيعي',
        featuredImage: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'kids_ortho_shoes',
        nameAr: 'أحذية أطفال مريحة',
        nameEn: 'Kids Shoes & Sneakers',
        icon: '👟',
        categoryFilter: 'kids_wear',
        descriptionAr: 'أحذية وسنيكرز خفيفة تدعم حركة ونمو قدم الطفل بأمان',
        badgeAr: 'نعل طبي مريح',
        featuredImage: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=400'
      }
    ],
    occasions: [
      {
        id: 'royal_wedding',
        nameAr: 'أفراح وحفلات عائلية',
        descriptionAr: 'أطقم وبدل وفساتين مبهجة للأطفال في الأفراح والأعياد',
        icon: '👑'
      },
      {
        id: 'festive_celebration',
        nameAr: 'أعياد ومواسم الفرح',
        descriptionAr: 'ملابس العيد الجديدة وفساتين ناعمة ومبهجة',
        icon: '🎈'
      },
      {
        id: 'daily_casual',
        nameAr: 'حضانة ومدرسة ولعب يومي',
        descriptionAr: 'ملابس قطنية عملية تمتص العرق وسهلة الغسيل',
        icon: '🎨'
      },
      {
        id: 'heritage_craft',
        nameAr: 'أطقم سبوع وهدايا مواليد',
        descriptionAr: 'أطقم سبوع متكاملة للمولود الجديد مطرزة بحب',
        icon: '✨'
      }
    ]
  }
};

export const REALM_LOOKBOOKS: LookbookItem[] = [
  // 1. Gentleman Lookbooks
  {
    id: 'look-gentleman-wedding',
    realmId: 'gentleman',
    titleAr: 'إطلالة التوكسيدو الملكية لليلة العمر',
    titleEn: 'The Royal Black-Tie Wedding Ensemble',
    occasion: 'royal_wedding',
    occasionNameAr: 'سهرات وأفراح ملكية',
    tagAr: 'تنسيق العريس المكتمل',
    descriptionAr: 'بدلة توكسيدو صوف إيطالي بياقة ستان سوداء، قميص قطني أبيض بأزرار مخفية، حذاء أكسفورد جلد طبيعي لامع، وعطر العود المعتق.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'ارتدِ البدلة مع حزام جلد طبيعي باللون الأسود وأزرار أكمام ذهبية مطفية لطلة لا تُنسى.',
    curatedPriceEGP: 3850,
    originalBundlePriceEGP: 4600,
    savingsPercentage: 16
  },
  {
    id: 'look-gentleman-business',
    realmId: 'gentleman',
    titleAr: 'طقم الدبلوماسي للاجتماعات والوقار',
    titleEn: 'The Diplomat Business Attire',
    occasion: 'formal_business',
    occasionNameAr: 'رسميات وأعمال',
    tagAr: 'هيبة الحضور',
    descriptionAr: 'سترة كحلية ملكية (Navy Blue Blazer) مع قميص مصري ناصع البياض، حذاء لوفير جلد جملي، وساعة كلاسيكية من الستانلس ستيل.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'تتناسق السترة الكحلية تماماً مع البنطال البيج أو الرمادي الفاتح لإبراز التباين الهادئ.',
    curatedPriceEGP: 2950,
    originalBundlePriceEGP: 3450,
    savingsPercentage: 14
  },
  {
    id: 'look-gentleman-casual',
    realmId: 'gentleman',
    titleAr: 'إطلالة الويك إند الساحلية الأنيقة',
    titleEn: 'The Riviera Smart Casual',
    occasion: 'daily_casual',
    occasionNameAr: 'كاجوال وأناقة يومية',
    tagAr: 'راحة بدون تنازل عن الأناقة',
    descriptionAr: 'قميص كتان بيور بأكمام قابلة للطي، بنطلون قطن تشينو زيتوني مريح، وحذاء جلد طبيعي بدون جوارب مع نظارة شمسية كلاسيكية.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'الكتان المصري يسمح بمرور الهواء ويمنحك انتعاشاً يدوم طوال اليوم في الطقس الحار.',
    curatedPriceEGP: 1750,
    originalBundlePriceEGP: 2100,
    savingsPercentage: 17
  },

  // 2. Sanctuary (Women) Lookbooks
  {
    id: 'look-sanctuary-soiree',
    realmId: 'sanctuary',
    titleAr: 'إطلالة سندريلا السهرة والشك اليدوي',
    titleEn: 'The Haute Soirée Crystal Gown',
    occasion: 'royal_wedding',
    occasionNameAr: 'أفراح وسهرات سواريه',
    tagAr: 'سحر المناسبات الكبرى',
    descriptionAr: 'فستان ستان ملكي بتطريز كريستالي يدوي من مشاغل دسوق، مع طرحة شيفون بيور متطابقة، وحذاء كعب عالي سواريه وحقيبة كلاتش ذهبية.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'اختاري لمسات مكياج دافئة مع إكسسوارات ذهبية ناعمة لإبراز فخامة التطريز اليدوي.',
    curatedPriceEGP: 3400,
    originalBundlePriceEGP: 4100,
    savingsPercentage: 17
  },
  {
    id: 'look-sanctuary-abaya',
    realmId: 'sanctuary',
    titleAr: 'طقم الأميرة بالعباية الحريرية المطرزة',
    titleEn: 'The Royal Velvet & Silk Abaya Ensemble',
    occasion: 'festive_celebration',
    occasionNameAr: 'أعياد ومواسم واحتفالات',
    tagAr: 'فخامة وستر ملكي',
    descriptionAr: 'عباءة كريب ندى أسود فاحم بتطريز خيوط حريرية ذهبية، مع شال حرير مغسول، وعطر مسك العروس الفاخر.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'سواد قماش ندى يعكس وقاراً ملكياً لا يبهت مع الغسيل ويمنحك انسيابية كاملة.',
    curatedPriceEGP: 1890,
    originalBundlePriceEGP: 2350,
    savingsPercentage: 20
  },

  // 3. Vanguard (Youth & Teens) Lookbooks
  {
    id: 'look-vanguard-street',
    realmId: 'vanguard',
    titleAr: 'طقم الأوفرسايز الحضري والسنيكرز الحصري',
    titleEn: 'The Urban Kinetic Streetwear Set',
    occasion: 'daily_casual',
    occasionNameAr: 'جامعة وخروجات شبابية',
    tagAr: 'ستايل عصري جريء',
    descriptionAr: 'هودي أوفرسايز قطن مصري 100% بلون موف عميق، بنطلون كارجو بجيوب جانبية، وسنيكرز خفيف بنعل هوائي.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'نسّق الهودي مع كاب أسود وحقيبة كروس مضادة للماء لستايل متكامل وعملي جداً.',
    curatedPriceEGP: 1420,
    originalBundlePriceEGP: 1750,
    savingsPercentage: 19
  },

  // 4. Little Royals (Kids) Lookbooks
  {
    id: 'look-royals-boy-wedding',
    realmId: 'little_royals',
    titleAr: 'طقم الأمير الصغير بالفيونكة والصديري',
    titleEn: 'The Little Prince Celebration Tuxedo',
    occasion: 'royal_wedding',
    occasionNameAr: 'أفراح ومناسبات عائلية',
    tagAr: 'بهجة العائلة',
    descriptionAr: 'بدلة أطفال قطنية ناعمة مكونة من صديري كلاسيكي، قميص أبيض بفيونكة، وبنطلون بحمالات جلدية مع حذاء خفيف مرن.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=800',
    productIds: [],
    stylingTipsAr: 'القماش القطني الخالص يحمي بشرة الطفل من الاحتكاك ويسمح له باللعب والحركة بحرية تامة.',
    curatedPriceEGP: 890,
    originalBundlePriceEGP: 1100,
    savingsPercentage: 19
  }
];

export function getProductGrandHouseId(product: { category?: string; titleAr?: string; titleEn?: string }): DepartmentRealmId {
  const cat = product.category || '';
  const title = (product.titleAr || '') + ' ' + (product.titleEn || '');

  if (cat === 'kids_wear' || title.includes('أطفال') || title.includes('بيبي') || title.includes('بنات') || title.includes('أولاد') || title.includes('سبوع') || title.includes('صغار')) {
    return 'little_royals';
  }

  if (cat === 'women_fashion' || title.includes('عباية') || title.includes('فستان') || title.includes('طرحة') || title.includes('سواريه') || title.includes('نسائي') || title.includes('هوانم') || title.includes('حريمي')) {
    return 'sanctuary';
  }

  if (title.includes('هودي') || title.includes('سنيكرز') || title.includes('كاب') || title.includes('كاجوال') || title.includes('شبابي') || title.includes('أوفرسايز') || title.includes('ستريت')) {
    return 'vanguard';
  }

  return 'gentleman';
}

export function getProductGrandHouse(product: { category?: string; titleAr?: string; titleEn?: string }): DepartmentHouseConfig {
  const houseId = getProductGrandHouseId(product);
  return DEPARTMENT_HOUSES_CONFIG[houseId] || DEPARTMENT_HOUSES_CONFIG.gentleman;
}

