export interface CategoryAttributeField {
  id: string;
  labelAr: string;
  labelEn: string;
  type: 'select' | 'text' | 'number' | 'multi-select' | 'textarea' | 'boolean';
  placeholderAr?: string;
  required?: boolean;
  options?: { value: string; labelAr: string }[];
  helpTextAr?: string;
  unitAr?: string;
}

export interface CategoryListingSchema {
  categoryId: string;
  categoryNameAr: string;
  iconName: string;
  suggestedProductTypes: string[];
  recommendedVariationThemes: ('size' | 'color' | 'style' | 'size_color' | 'volume' | 'pack_size' | 'custom')[];
  specificAttributes: CategoryAttributeField[];
  titleGuidelinesAr: string;
  imageGuidelinesAr: string;
  defaultWarrantyAr?: string;
  complianceWarningAr?: string;
}

export const CATEGORY_SCHEMAS: Record<string, CategoryListingSchema> = {
  // 1. أزياء وملابس رجالية
  'men_fashion': {
    categoryId: 'men_fashion',
    categoryNameAr: 'أزياء وبدل رجالية',
    iconName: 'Shirt',
    suggestedProductTypes: ['بدل كلاسيك', 'قمصان قطن مصري', 'بليزر كاجوال', 'بناطيل قماش وجينز', 'جلاليب وأثواب رجالي', 'تيشيرتات وبولو'],
    recommendedVariationThemes: ['size_color', 'size', 'color'],
    titleGuidelinesAr: '[العلامة التجارية] + [نوع المنتج والخامة] + [القصة/الموديل] + [اللون] + [المقاس]',
    imageGuidelinesAr: 'صورة رئيسية واضحة بخلفية بيضاء/محايدة بدون علامات مائية مع صورة لجدول المقاسات وصورة مقربة لنسيج القماش.',
    defaultWarrantyAr: '14 يوماً استبدال واسترجاع وفق قانون حماية المستهلك المصري (بشرط عدم نزع التيكت)',
    specificAttributes: [
      {
        id: 'fabric',
        labelAr: 'نوع القماش والخامة (Material)',
        labelEn: 'Fabric & Material',
        type: 'select',
        required: true,
        options: [
          { value: 'egyptian_cotton_100', labelAr: 'قطن مصري طويل التيلة 100%' },
          { value: 'pure_linen', labelAr: 'كتان طبيعي خالص' },
          { value: 'italian_wool_blend', labelAr: 'صوف إيطالي مخلوط للبدل' },
          { value: 'cotton_crepe', labelAr: 'كريب قطني فاخر' },
          { value: 'gabardine', labelAr: 'جبردين قطني كاجوال' },
          { value: 'denim', labelAr: 'جينز دينيم أصلي' },
          { value: 'oxford_cotton', labelAr: 'قطن أكسفورد ناعم' }
        ]
      },
      {
        id: 'fitType',
        labelAr: 'نوع القصة والتصميم (Fit)',
        labelEn: 'Fit Type',
        type: 'select',
        required: true,
        options: [
          { value: 'slim_fit', labelAr: 'سليم فيت (Slim Fit مجسم)' },
          { value: 'regular_fit', labelAr: 'ريجولار كلاسيك (Regular Fit مريح)' },
          { value: 'oversized', labelAr: 'أوفر سايز عصري (Oversized)' },
          { value: 'tailored', labelAr: 'تفصيل خاص ومقاس مضبوط' }
        ]
      },
      {
        id: 'collarStyle',
        labelAr: 'نوع الياقة / الرقبة',
        labelEn: 'Collar Style',
        type: 'select',
        required: false,
        options: [
          { value: 'classic_collar', labelAr: 'ياقة قميص كلاسيكية' },
          { value: 'mandarin_band', labelAr: 'ياقة صينية / ماو ستاند' },
          { value: 'cutaway_italian', labelAr: 'ياقة إيطالية مفتوحة للبدل' },
          { value: 'crew_neck', labelAr: 'ياقة دائرية كاجوال' },
          { value: 'v_neck', labelAr: 'ياقة V كاجوال' }
        ]
      },
      {
        id: 'season',
        labelAr: 'الموسم المناسب',
        labelEn: 'Target Season',
        type: 'select',
        required: false,
        options: [
          { value: 'all_seasons', labelAr: 'مناسب لجميع فصول السنة' },
          { value: 'summer', labelAr: 'صيفي خفيف وبارد' },
          { value: 'winter', labelAr: 'شتوي دافئ ثقيل' },
          { value: 'spring_autumn', labelAr: 'ربيعي / خريفي معتدل' }
        ]
      },
      {
        id: 'careInstructions',
        labelAr: 'تعليمات الغسيل والعناية',
        labelEn: 'Care Instructions',
        type: 'text',
        placeholderAr: 'مثال: غسيل بارد على 30 درجة، كوي على درجة منخفضة، تجنب المبيضات',
        required: false
      }
    ]
  },

  // 2. أزياء نسائية وعبايات
  'women_fashion': {
    categoryId: 'women_fashion',
    categoryNameAr: 'أزياء نسائية وعبايات',
    iconName: 'Heart',
    suggestedProductTypes: ['عبايات خليجي وكريب', 'فساتين سهرة وسواريه', 'إسدالات صلاة قطنية', 'دريسات محجبات', 'أوشحة وطرح', 'كارديجان وكيمونو'],
    recommendedVariationThemes: ['size_color', 'size', 'color', 'style'],
    titleGuidelinesAr: '[الماركة/المشغل] + [عباية/فستان/إسدال] + [الخامة والتطريز] + [اللون والتفاصيل]',
    imageGuidelinesAr: 'صور أنيقة تبرز تفاصيل التطريز، القفلة، الطرحة المرفقة، مع صورة لجدول القياسات الدقيقة.',
    defaultWarrantyAr: '14 يوماً استبدال واسترجاع وفق قانون حماية المستهلك المصري',
    specificAttributes: [
      {
        id: 'fabric',
        labelAr: 'خامة القماش الرئيسية (Material)',
        labelEn: 'Primary Fabric',
        type: 'select',
        required: true,
        options: [
          { value: 'saudi_crepe', labelAr: 'كريب سعودي ملكي فاخر' },
          { value: 'egyptian_cotton', labelAr: 'قطن مصري ناعم 100%' },
          { value: 'satin_silk', labelAr: 'حرير ستان تركي لامع' },
          { value: 'chiffon', labelAr: 'شيفون بيور مبطن' },
          { value: 'velvet', labelAr: 'قطيفة كورية فاخرة' },
          { value: 'linen', labelAr: 'كتان هندي طبيعي' }
        ]
      },
      {
        id: 'embroideryType',
        labelAr: 'نوع التطريز والزخرفة',
        labelEn: 'Embroidery & Details',
        type: 'select',
        required: false,
        options: [
          { value: 'hand_embroidery', labelAr: 'تطريز يدوي بخيوط حريرية' },
          { value: 'sequins_crystal', labelAr: 'خرز وكريستال سواريه لامع' },
          { value: 'machine_laser', labelAr: 'حفر ليزر وتطريز كمبيوتر دقيق' },
          { value: 'plain_minimalist', labelAr: 'سادة أنيق بدون تطريز (Minimalist)' }
        ]
      },
      {
        id: 'includesHijab',
        labelAr: 'هل يشتمل على طرحة / شيلة مطابقة؟',
        labelEn: 'Includes Matching Hijab',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', labelAr: 'نعم، يشمل طرحة مطابقة مجاناً' },
          { value: 'no', labelAr: 'لا، القطعة بمفردها فقط' }
        ]
      },
      {
        id: 'lengthCm',
        labelAr: 'طول الموديل المعتاد (سم)',
        labelEn: 'Standard Length (cm)',
        type: 'number',
        unitAr: 'سم',
        placeholderAr: 'مثال: 145',
        required: false
      }
    ]
  },

  // 3. عطور وبخور وزيوت ملكية (Perfumes & Fragrances)
  'perfumes_fragrances': {
    categoryId: 'perfumes_fragrances',
    categoryNameAr: 'عطور وبخور وزيوت ملكية',
    iconName: 'Sparkles',
    suggestedProductTypes: ['عطور نيش شرقية', 'دهن عود ومسك الختام', 'بخور ومعمول معطر', 'معطرات جو ومفارش فاخرة', 'زيوت عطرية نقية'],
    recommendedVariationThemes: ['volume', 'pack_size', 'style'],
    titleGuidelinesAr: '[دار العطور] + [اسم العطر] + [التركيز: Extrait / EDP] + [الحجم: مل أو تولة] + [النوتة الأبرز]',
    imageGuidelinesAr: 'صورة نقية لزجاجة العطر وتغليف الصندوق الفاخر مع توضيح شكل التولة ولون الزيت العطري.',
    defaultWarrantyAr: 'ضمان الأصالة والثبات لمدة 48 ساعة أو استرداد كامل للمنتجات المغلفة',
    complianceWarningAr: 'يجب أن تكون الزيوت العطرية مطابقة لاشتراطات هيئة الدواء المصرية وخالية من الكحول المغشوش.',
    specificAttributes: [
      {
        id: 'perfumeConcentration',
        labelAr: 'نوع ودرجة التركيز (Concentration)',
        labelEn: 'Concentration Type',
        type: 'select',
        required: true,
        options: [
          { value: 'pure_oil_attar', labelAr: 'دهن زيت نقي خالص بدون كحول (تولة خام Attar 100%)' },
          { value: 'extrait_de_parfum', labelAr: 'اكستري دي بارفان (Extrait de Parfum 30-40% ثبات فائق)' },
          { value: 'eau_de_parfum', labelAr: 'أو دي بارفان (Eau de Parfum 15-20% ثبات يوم كامل)' },
          { value: 'eau_de_toilette', labelAr: 'أو دي تواليت (Eau de Toilette منعش خفيف)' },
          { value: 'home_linen_mist', labelAr: 'معطر مفارش وجو بيور ثابت' }
        ]
      },
      {
        id: 'bottleVolume',
        labelAr: 'الحجم الصافي للعبوة (Volume)',
        labelEn: 'Bottle Volume / Size',
        type: 'select',
        required: true,
        options: [
          { value: 'quarter_tola_3ml', labelAr: 'ربع تولة (3 مل)' },
          { value: 'half_tola_6ml', labelAr: 'نصف تولة (6 مل)' },
          { value: 'tola_12ml', labelAr: 'تولة كاملة (12 مل / جم)' },
          { value: 'bottle_30ml', labelAr: 'زجاجة بخاخ 30 مل' },
          { value: 'bottle_50ml', labelAr: 'زجاجة بخاخ 50 مل' },
          { value: 'bottle_100ml', labelAr: 'زجاجة بخاخ 100 مل' },
          { value: 'bottle_200ml', labelAr: 'عبوة كبيرة 200 مل' }
        ]
      },
      {
        id: 'scentFamily',
        labelAr: 'العائلة العطرية (Scent Family / Type)',
        labelEn: 'Scent Family',
        type: 'select',
        required: true,
        options: [
          { value: 'oriental_oud', labelAr: 'شرقي دافئ / عود وعنبر وتوابل' },
          { value: 'french_floral', labelAr: 'زهري فرنسي / ياسمين وورد ومسك' },
          { value: 'woody_smoky', labelAr: 'خشبي مدخن / خشب صندل وأرز' },
          { value: 'fresh_citrus', labelAr: 'حمضي منعش / برغموت وليمون وبحر' },
          { value: 'gourmand_sweet', labelAr: 'غورماند حلو / فانيليا كراميل وعسل' }
        ]
      },
      {
        id: 'topNotes',
        labelAr: 'النوتات العليا (الافتتاحية)',
        labelEn: 'Top Notes',
        type: 'text',
        placeholderAr: 'مثال: برغموت، زعفران، هيل، توت أحمر',
        required: false
      },
      {
        id: 'heartNotes',
        labelAr: 'نوتات القلب (الوسط)',
        labelEn: 'Heart Notes',
        type: 'text',
        placeholderAr: 'مثال: ياسمين دمياطي، ورد طائفي، عنبر، قرفة',
        required: false
      },
      {
        id: 'baseNotes',
        labelAr: 'نوتات القاعدة والثبات',
        labelEn: 'Base Notes',
        type: 'text',
        placeholderAr: 'مثال: عود كمبودي معتق، مسك أبيض، فانيليا مدغشقر',
        required: false
      },
      {
        id: 'sillageLongevity',
        labelAr: 'معدل الثبات والفوحان المقدر',
        labelEn: 'Sillage & Longevity',
        type: 'select',
        required: false,
        options: [
          { value: 'extreme_24h_plus', labelAr: 'ثبات فائق +24 ساعة (فوحان قوي يملأ المكان)' },
          { value: 'strong_12_18h', labelAr: 'ثبات قوي من 12 إلى 18 ساعة' },
          { value: 'moderate_6_8h', labelAr: 'ثبات معتدل يومي من 6 إلى 8 ساعات' }
        ]
      }
    ]
  },

  // 4. أحذية وحقائب راقية (Shoes & Leather Bags)
  'shoes_bags': {
    categoryId: 'shoes_bags',
    categoryNameAr: 'أحذية وحقائب راقية',
    iconName: 'ShoppingBag',
    suggestedProductTypes: ['أحذية كلاسيك جلد طبيعي', 'سنيكرز كاجوال طبي', 'صنادل وشباشب جلد', 'حقائب يد نسائية', 'محافظ جلد طبيعي'],
    recommendedVariationThemes: ['size_color', 'size', 'color'],
    titleGuidelinesAr: '[الماركة] + [حذاء/حقيبة] + [جلد طبيعي/خامة] + [اللون والمقاس]',
    imageGuidelinesAr: 'صورة من الجانب وصورة للنعل وصورة مقربة لتقفيل الخياطة والجلد الطبيعي.',
    defaultWarrantyAr: '30 يوماً ضمان استبدال ضد عيوب الصناعة والجلد',
    specificAttributes: [
      {
        id: 'upperMaterial',
        labelAr: 'خامة الوجه الخارجي (Upper Material)',
        labelEn: 'Upper Material',
        type: 'select',
        required: true,
        options: [
          { value: 'genuine_cow_leather', labelAr: 'جلد بقر طبيعي مصري فاخر' },
          { value: 'suede_leather', labelAr: 'جلد شمواه / كانترا طبيعي' },
          { value: 'patent_leather', labelAr: 'جلد ورنيش لامع كلاسيك' },
          { value: 'breathable_canvas', labelAr: 'قماش كانفاس مسامي خفيف' },
          { value: 'vegan_synthetic', labelAr: 'جلد صناعي معالج عالي التحمل' }
        ]
      },
      {
        id: 'soleType',
        labelAr: 'نوع النعل الداخلي والخارجي',
        labelEn: 'Sole & Insole Type',
        type: 'select',
        required: true,
        options: [
          { value: 'orthopedic_memory_foam', labelAr: 'فرش طبي ميموري فوم مريح للقدم' },
          { value: 'durable_rubber', labelAr: 'نعل كاوتش بيور مضاد للانزلاق' },
          { value: 'genuine_leather_sole', labelAr: 'نعل جلد طبيعي مدبوغ (كلاسيك)' },
          { value: 'lightweight_eva', labelAr: 'نعل فوم EVA خفيف جداً للركض' }
        ]
      },
      {
        id: 'shoeClosure',
        labelAr: 'طريقة الإغلاق / اللبس',
        labelEn: 'Closure Type',
        type: 'select',
        required: false,
        options: [
          { value: 'lace_up', labelAr: 'رباط كلاسيكي' },
          { value: 'slip_on', labelAr: 'سليب أون سهل الارتداء (بدون رباط)' },
          { value: 'buckle_strap', labelAr: 'إبزيم معدني أنيق' },
          { value: 'zipper', labelAr: 'سوستة جانبية' }
        ]
      }
    ]
  },

  // 5. مأكولات وتراث دسوق الغذائي والفسيخ (Delicacies)
  'desoq_delicacies': {
    categoryId: 'desoq_delicacies',
    categoryNameAr: 'مأكولات وتراث دسوق الغذائي والفسيخ',
    iconName: 'Utensils',
    suggestedProductTypes: ['فسيخ دسوقي سمن بلدي قليل الملوحة', 'رنجة هولندي سوبر جامبو', 'سردين بلدي مخلل', 'حلويات وبسبوسة دسوقية', 'عسل نحل بلدي بري'],
    recommendedVariationThemes: ['pack_size', 'style'],
    titleGuidelinesAr: '[اسم المعلم/المحل] + [فسيخ/رنجة/حلويات] + [درجة الملوحة والتجهيز] + [الوزن الصافي]',
    imageGuidelinesAr: 'صور طازجة عالية الوضوح للمنتج المجهز المعبأ بتفريغ الهواء (Vacuum) مع بطاقة فحص الجودة وتاريخ التعبئة.',
    defaultWarrantyAr: 'ضمان استبدال فوري أو استرداد كامل خلال 24 ساعة في حال وجود أي ملاحظة على جودة الشحنة المبردة',
    complianceWarningAr: 'يخضع هذا التصنيف لمعايير النقل المبرد وشروط سلامة الغذاء بمحافظة كفر الشيخ.',
    specificAttributes: [
      {
        id: 'saltLevel',
        labelAr: 'درجة الملوحة والتتبيل (Salt Level)',
        labelEn: 'Salt Level & Curing',
        type: 'select',
        required: true,
        options: [
          { value: 'mild_sweet', labelAr: 'عادم خفيف جداً زبدة (Low Salt Gourmet)' },
          { value: 'medium_balanced', labelAr: 'مضبوط متوسط الملوحة (Classic Balanced)' },
          { value: 'traditional_cured', labelAr: 'حادق بلدي قديم تقليدي' }
        ]
      },
      {
        id: 'prepStyle',
        labelAr: 'حالة التجهيز والتنظيف',
        labelEn: 'Preparation & Cleaning',
        type: 'select',
        required: true,
        options: [
          { value: 'fillet_vacuum_oil', labelAr: 'مخلي فيليه جاهز للأكل في زيت نقي وليمون (فاكيوم)' },
          { value: 'whole_cleaned_vacuum', labelAr: 'سمكة كاملة منظفة الرأس والبطن مفرغة الهواء' },
          { value: 'whole_traditional', labelAr: 'سمكة كاملة سليمة بدون تنظيف (طازجة)' }
        ]
      },
      {
        id: 'netWeightGrams',
        labelAr: 'الوزن الصافي للعبوة',
        labelEn: 'Net Weight',
        type: 'select',
        required: true,
        options: [
          { value: '500g', labelAr: 'نصف كيلو (500 جم صافي)' },
          { value: '1000g', labelAr: '1 كيلو جرام صافي' },
          { value: '1500g', labelAr: '1.5 كيلو جرام صافي' },
          { value: '2000g', labelAr: '2 كيلو جرام صافي' },
          { value: '3000g_jumbo', labelAr: 'صندوق جامبو عائلي 3 كجم' }
        ]
      },
      {
        id: 'storageTemp',
        labelAr: 'درجة حرارة الحفظ الموصى بها',
        labelEn: 'Storage Temp',
        type: 'select',
        required: true,
        options: [
          { value: 'chilled_2_4c', labelAr: 'حفظ مبرد بالثلاجة (2 إلى 4 درجات مئوية)' },
          { value: 'frozen_minus_18c', labelAr: 'حفظ مجمد بالفريزر (-18 درجة مئوية)' },
          { value: 'room_temp_dry', labelAr: 'مكان جاف وبارد بعيداً عن أشعة الشمس (للحلويات والعسل)' }
        ]
      },
      {
        id: 'shelfLifeDays',
        labelAr: 'مدة الصلاحية المقررة (بالأيام)',
        labelEn: 'Shelf Life (Days)',
        type: 'number',
        unitAr: 'يوم',
        placeholderAr: 'مثال: 30',
        required: true
      }
    ]
  },

  // 6. أقمشة ومنسوجات بالمتر (Fabrics & Textiles)
  'fabrics_textiles': {
    categoryId: 'fabrics_textiles',
    categoryNameAr: 'أقمشة ومنسوجات بالمتر',
    iconName: 'Layers',
    suggestedProductTypes: ['قماش بدل صوف إيطالي', 'حرير طبيعي ستان', 'كتان نقي بالمتر', 'قطن مصري أقطان دسوق', 'شيفون وتل سهرة'],
    recommendedVariationThemes: ['color', 'style'],
    titleGuidelinesAr: '[المورد/الورشة] + [نوع القماش] + [العرض بالسم] + [الخامة واللون] + [سعر المتر]',
    imageGuidelinesAr: 'صورة مفرودة للقماش مع صورة مقربة للإضاءة ولون الخيوط.',
    defaultWarrantyAr: 'ضمان مطابقة العينة والألوان وسلامة النسيج من العيوب',
    specificAttributes: [
      {
        id: 'fabricWidthCm',
        labelAr: 'عرض القماش القياسي (سم)',
        labelEn: 'Fabric Width (cm)',
        type: 'select',
        required: true,
        options: [
          { value: 'width_140cm', labelAr: 'عرض 140 سم (عرض واحد قياسي)' },
          { value: 'width_150cm', labelAr: 'عرض 150 سم (عرضين)' },
          { value: 'width_180cm', labelAr: 'عرض 180 سم (عرض خاص)' },
          { value: 'width_280cm', labelAr: 'عرض 280-300 سم (عرض ستائر ومفارش كبير)' }
        ]
      },
      {
        id: 'unitType',
        labelAr: 'وحدة البيع والتسعير',
        labelEn: 'Pricing Unit',
        type: 'select',
        required: true,
        options: [
          { value: 'per_meter', labelAr: 'بالمتر الطولي (Meter)' },
          { value: 'per_roll', labelAr: 'بالتوب / الرول الكامل (Roll 30m)' },
          { value: 'per_kupon', labelAr: 'بالكوبون الجاهز (قطعة تفصيل 3.5 متر)' }
        ]
      },
      {
        id: 'composition',
        labelAr: 'نسبة التكوين والألياف',
        labelEn: 'Fiber Composition',
        type: 'text',
        placeholderAr: 'مثال: 80% صوف طبيعي + 20% حرير طبيعي',
        required: true
      }
    ]
  },

  // 7. تراث وحرف يدوية دسوقية (Heritage Crafts)
  'heritage_crafts': {
    categoryId: 'heritage_crafts',
    categoryNameAr: 'تراث وحرف يدوية دسوقية',
    iconName: 'Crown',
    suggestedProductTypes: ['كليم فوه ودسوق صوف يدوي', 'فخار وخزف يدوي مزخرف', 'شغل نحاس وأرابيسك مطعم بالصدف', 'سبح يدوية وخشب أبنوس'],
    recommendedVariationThemes: ['size', 'style', 'color'],
    titleGuidelinesAr: '[اسم الصانع/الورشة] + [كليم/فخار/نحاس] + [النقشة والتقنية اليدوية] + [الأبعاد]',
    imageGuidelinesAr: 'صورة للقطعة الحرفية مع لقطات لآثار النول اليدوي وتوقيع الحرفي.',
    defaultWarrantyAr: 'شهادة أصالة حرفية مع ضمان جودة يدوم لسنوات',
    specificAttributes: [
      {
        id: 'craftTechnique',
        labelAr: 'التقنية اليدوية المستخدمة',
        labelEn: 'Handmade Technique',
        type: 'select',
        required: true,
        options: [
          { value: 'traditional_handloom', labelAr: 'نول يدوي تقليدي أصيل (Hand Loom)' },
          { value: 'brass_inlay_mother_of_pearl', labelAr: 'تطعيم صدف طبيعي وخيوط نحاس أصفر' },
          { value: 'hand_turned_pottery', labelAr: 'فخار دولاب يدوي مشوي في أفران حطب' },
          { value: 'hand_carved_wood', labelAr: 'حفر ونحت يدوي على خشب زان وأرو' }
        ]
      },
      {
        id: 'artisanName',
        labelAr: 'اسم الحرفي / شيخ الصنعة أو الورشة',
        labelEn: 'Master Artisan / Workshop',
        type: 'text',
        placeholderAr: 'مثال: ورشة عم صبحي لصناعة الكليم اليدوي بفوه',
        required: false
      },
      {
        id: 'itemDimensions',
        labelAr: 'الأبعاد الدقيقة للقطعة (سم)',
        labelEn: 'Exact Dimensions (L x W x H cm)',
        type: 'text',
        placeholderAr: 'مثال: 120 × 180 × 2 سم',
        required: false
      }
    ]
  },

  // 8. ساعات وإكسسوارات وهدايا (Watches & Accessories)
  'watches_accessories': {
    categoryId: 'watches_accessories',
    categoryNameAr: 'ساعات وإكسسوارات وهدايا',
    iconName: 'Watch',
    suggestedProductTypes: ['ساعات رجالية كلاسيك', 'ساعات نسائية مرصعة', 'نظارات شمسية قطبية', 'أزرار أكمام ودبابيس كرافتة', 'محافظ جلد طبيعي'],
    recommendedVariationThemes: ['color', 'style'],
    titleGuidelinesAr: '[الماركة] + [ساعة/نظارة/إكسسوار] + [نوع الماكينة/الخامة] + [اللون ومقاومة الماء]',
    imageGuidelinesAr: 'صورة للمنتج مع العلبة الأصلية والضمان وصورة مقربة للميناء والعقارب.',
    defaultWarrantyAr: 'ضمان عام كامل ضد عيوب الماكينة والبطارية',
    specificAttributes: [
      {
        id: 'movementType',
        labelAr: 'نوع الماكينة والحركة',
        labelEn: 'Movement Type',
        type: 'select',
        required: true,
        options: [
          { value: 'quartz_japan', labelAr: 'كوارتز ياباني دقيق (بطارية)' },
          { value: 'automatic_mechanical', labelAr: 'أوتوماتيك ميكانيكي بحركة اليد' },
          { value: 'solar_powered', labelAr: 'تعمل بالطاقة الشمسية والضوء' },
          { value: 'smart_digital', labelAr: 'شاشة رقمية ذكية' }
        ]
      },
      {
        id: 'strapMaterial',
        labelAr: 'خامة السوار / الحزام',
        labelEn: 'Strap Material',
        type: 'select',
        required: true,
        options: [
          { value: 'stainless_steel_316l', labelAr: 'ستانلس ستيل 316L مقاوم للصدأ' },
          { value: 'genuine_leather', labelAr: 'جلد طبيعي ناعم مع خياطة يدوية' },
          { value: 'silicone_rubber', labelAr: 'سيليكون طبي مريح رياضي' },
          { value: 'mesh_magnetic', labelAr: 'حزام شبكي معدني مغناطيسي' }
        ]
      },
      {
        id: 'waterResistance',
        labelAr: 'مقاومة الماء',
        labelEn: 'Water Resistance',
        type: 'select',
        required: false,
        options: [
          { value: '3atm_splash', labelAr: '3 ATM (مقاومة لرذاذ الماء وغسيل الأيدي)' },
          { value: '5atm_swim', labelAr: '5 ATM (مقاومة للسباحة والاستحمام)' },
          { value: '10atm_dive', labelAr: '10 ATM (مقاومة للغطس والغوص)' },
          { value: 'not_waterproof', labelAr: 'غير مقاومة للماء' }
        ]
      }
    ]
  },

  // 9. أجهزة وأدوات منزلية (Electronics & Appliances)
  'electronics_appliances': {
    categoryId: 'electronics_appliances',
    categoryNameAr: 'أجهزة وأدوات إلكترونية ومنزلية',
    iconName: 'Tv',
    suggestedProductTypes: ['شواحن وبنوك طاقة', 'سماعات بلوتوث', 'مكاوي بخار عمودية للملابس', 'موازين طعام رقمية', 'ماكينات حلاقة وتشذيب'],
    recommendedVariationThemes: ['color', 'style'],
    titleGuidelinesAr: '[الماركة] + [اسم الجهاز والموديل] + [القدرة/الواط] + [المواصفات والضمان]',
    imageGuidelinesAr: 'صورة للجهاز وملحقات العلبة وشهادة الضمان المصرية المعتمدة.',
    defaultWarrantyAr: 'ضمان عامان استبدال وصيانة معتمد',
    specificAttributes: [
      {
        id: 'powerWattage',
        labelAr: 'القدرة الكهربائية / الواط',
        labelEn: 'Power (Watt)',
        type: 'number',
        unitAr: 'واط',
        placeholderAr: 'مثال: 1500',
        required: false
      },
      {
        id: 'warrantyYears',
        labelAr: 'مدة الضمان المعتمد (سنوات)',
        labelEn: 'Warranty Period (Years)',
        type: 'select',
        required: true,
        options: [
          { value: '1_year', labelAr: 'ضمان سنة واحدة' },
          { value: '2_years', labelAr: 'ضمان عامان كاملان' },
          { value: '3_years', labelAr: 'ضمان 3 سنوات' },
          { value: '6_months', labelAr: 'ضمان 6 أشهر' }
        ]
      },
      {
        id: 'connectivity',
        labelAr: 'نوع الاتصال والمنافذ',
        labelEn: 'Connectivity & Ports',
        type: 'text',
        placeholderAr: 'مثال: بلوتوث 5.3 + منفذ Type-C شحن سريع',
        required: false
      }
    ]
  }
};

// Aliases for legacy IDs
CATEGORY_SCHEMAS['cat-men-fashion'] = CATEGORY_SCHEMAS['men_fashion'];
CATEGORY_SCHEMAS['cat-women-fashion'] = CATEGORY_SCHEMAS['women_fashion'];
CATEGORY_SCHEMAS['cat-perfumes'] = CATEGORY_SCHEMAS['perfumes_fragrances'];
CATEGORY_SCHEMAS['cat-shoes-leather'] = CATEGORY_SCHEMAS['shoes_bags'];
CATEGORY_SCHEMAS['cat-desoq-heritage-foods'] = CATEGORY_SCHEMAS['desoq_delicacies'];
CATEGORY_SCHEMAS['cat-carpets-rugs'] = CATEGORY_SCHEMAS['heritage_crafts'];
CATEGORY_SCHEMAS['kids_wear'] = CATEGORY_SCHEMAS['men_fashion'];
CATEGORY_SCHEMAS['complete_looks'] = CATEGORY_SCHEMAS['men_fashion'];
CATEGORY_SCHEMAS['home_decor'] = CATEGORY_SCHEMAS['heritage_crafts'];

export const DEFAULT_CATEGORY_SCHEMA: CategoryListingSchema = {
  categoryId: 'default',
  categoryNameAr: 'منتجات عامة وتراثية',
  iconName: 'Package',
  suggestedProductTypes: ['منتج أصلي جديد'],
  recommendedVariationThemes: ['size_color', 'size', 'color', 'volume', 'pack_size'],
  titleGuidelinesAr: '[الماركة/الصانع] + [اسم المنتج الرئيسي] + [المواصفة الأبرز] + [اللون/المقاس إن وجد]',
  imageGuidelinesAr: 'صورة واضحة للمنتج بدون تشويش على خلفية فاتحة ومحايدة.',
  defaultWarrantyAr: '14 يوماً استبدال واسترجاع وفق قانون حماية المستهلك المصري',
  specificAttributes: [
    {
      id: 'material',
      labelAr: 'المادة المصنعة / الخامة (Material)',
      labelEn: 'Material',
      type: 'text',
      placeholderAr: 'مثال: خشب طبيعي، ستانلس ستيل، جلد طبيعي، قطن',
      required: false
    },
    {
      id: 'origin',
      labelAr: 'بلد / مدينة المنشأ',
      labelEn: 'Country / City of Origin',
      type: 'text',
      placeholderAr: 'دسوق، محافظة كفر الشيخ، جمهورية مصر العربية',
      required: false
    }
  ]
};

export function getCategoryListingSchema(categoryId: string): CategoryListingSchema {
  return CATEGORY_SCHEMAS[categoryId] || DEFAULT_CATEGORY_SCHEMA;
}
