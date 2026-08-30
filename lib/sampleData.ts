import {
  Ingredient,
  Recipe,
  Missing1Suggestion,
  ShoppingItem,
  ZeroWasteStats,
  UserBadge,
  CommunityPost,
  TrendingRecipe,
  ChefMasterclass,
  KitchenHack,
  SponsoredDeal,
  MonthlySavingsPoint,
} from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Yumurta',
    category: 'sut_kahvaltilik',
    amount: 6,
    unit: 'adet',
    daysUntilExpiry: 12,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-2',
    name: 'Domates',
    category: 'sebze_meyve',
    amount: 4,
    unit: 'adet',
    daysUntilExpiry: 2,
    isPriority: true, // Urgent zero waste!
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-3',
    name: 'Kırmızı Biber / Kapya',
    category: 'sebze_meyve',
    amount: 2,
    unit: 'adet',
    daysUntilExpiry: 3,
    isPriority: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-4',
    name: 'Kaşar Peyniri',
    category: 'sut_kahvaltilik',
    amount: 200,
    unit: 'gram',
    daysUntilExpiry: 7,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-5',
    name: 'Zeytinyağı',
    category: 'baharat_sos',
    amount: 500,
    unit: 'ml',
    daysUntilExpiry: 90,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-6',
    name: 'Tavuk Göğsü',
    category: 'et_tavuk_balik',
    amount: 500,
    unit: 'gram',
    daysUntilExpiry: 2,
    isPriority: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-7',
    name: 'Kabak',
    category: 'sebze_meyve',
    amount: 3,
    unit: 'adet',
    daysUntilExpiry: 4,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-8',
    name: 'Sarımsak',
    category: 'sebze_meyve',
    amount: 1,
    unit: 'paket',
    daysUntilExpiry: 30,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-9',
    name: 'Yoğurt',
    category: 'sut_kahvaltilik',
    amount: 500,
    unit: 'gram',
    daysUntilExpiry: 5,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-10',
    name: 'Kekik & Pul Biber',
    category: 'baharat_sos',
    amount: 1,
    unit: 'paket',
    daysUntilExpiry: 180,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-11',
    name: 'Yulaf Ezmesi',
    category: 'kuru_gida',
    amount: 400,
    unit: 'gram',
    daysUntilExpiry: 60,
    isPriority: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'ing-12',
    name: 'Muz',
    category: 'sebze_meyve',
    amount: 2,
    unit: 'adet',
    daysUntilExpiry: 1,
    isPriority: true,
    addedAt: new Date().toISOString(),
  }
];

export const PANTRY_PRESETS = [
  {
    name: 'Pratik Şehir Dolabı',
    desc: 'Yumurta, domates, biber, kaşar, tavuk, yoğurt, kabak',
    icon: 'Zap',
    items: [
      { name: 'Yumurta', category: 'sut_kahvaltilik' as const, amount: 6, unit: 'adet' as const, daysUntilExpiry: 10 },
      { name: 'Domates', category: 'sebze_meyve' as const, amount: 4, unit: 'adet' as const, daysUntilExpiry: 2, isPriority: true },
      { name: 'Yeşil Biber', category: 'sebze_meyve' as const, amount: 5, unit: 'adet' as const, daysUntilExpiry: 3 },
      { name: 'Kaşar Peyniri', category: 'sut_kahvaltilik' as const, amount: 250, unit: 'gram' as const, daysUntilExpiry: 8 },
      { name: 'Tavuk Bonfile', category: 'et_tavuk_balik' as const, amount: 400, unit: 'gram' as const, daysUntilExpiry: 2, isPriority: true },
      { name: 'Zeytinyağı', category: 'baharat_sos' as const, amount: 500, unit: 'ml' as const, daysUntilExpiry: 90 },
      { name: 'Yoğurt', category: 'sut_kahvaltilik' as const, amount: 500, unit: 'gram' as const, daysUntilExpiry: 6 },
    ]
  },
  {
    name: 'Fit & Sporcu Mutfağı',
    desc: 'Yulaf, muz, yumurta akı, tavuk göğsü, lor, chia tohumu',
    icon: 'Flame',
    items: [
      { name: 'Yulaf Ezmesi', category: 'kuru_gida' as const, amount: 500, unit: 'gram' as const, daysUntilExpiry: 90 },
      { name: 'Yumurta', category: 'sut_kahvaltilik' as const, amount: 10, unit: 'adet' as const, daysUntilExpiry: 14 },
      { name: 'Tavuk Göğsü', category: 'et_tavuk_balik' as const, amount: 750, unit: 'gram' as const, daysUntilExpiry: 3, isPriority: true },
      { name: 'Muz', category: 'sebze_meyve' as const, amount: 4, unit: 'adet' as const, daysUntilExpiry: 2, isPriority: true },
      { name: 'Lor Peyniri', category: 'sut_kahvaltilik' as const, amount: 350, unit: 'gram' as const, daysUntilExpiry: 7 },
      { name: 'Fıstık Ezmesi', category: 'baharat_sos' as const, amount: 200, unit: 'gram' as const, daysUntilExpiry: 60 },
      { name: 'Süt', category: 'icecek' as const, amount: 1, unit: 'litre' as const, daysUntilExpiry: 5 },
    ]
  },
  {
    name: 'Akdeniz & Vejetaryen',
    desc: 'Kabak, patlıcan, domates, nohut, zeytinyağı, fesleğen',
    icon: 'Leaf',
    items: [
      { name: 'Kabak', category: 'sebze_meyve' as const, amount: 3, unit: 'adet' as const, daysUntilExpiry: 4 },
      { name: 'Patlıcan', category: 'sebze_meyve' as const, amount: 2, unit: 'adet' as const, daysUntilExpiry: 3, isPriority: true },
      { name: 'Haşlanmış Nohut', category: 'kuru_gida' as const, amount: 400, unit: 'gram' as const, daysUntilExpiry: 30 },
      { name: 'Zeytinyağı', category: 'baharat_sos' as const, amount: 750, unit: 'ml' as const, daysUntilExpiry: 120 },
      { name: 'Beyaz Peynir', category: 'sut_kahvaltilik' as const, amount: 300, unit: 'gram' as const, daysUntilExpiry: 10 },
      { name: 'Ceviz İçi', category: 'kuru_gida' as const, amount: 150, unit: 'gram' as const, daysUntilExpiry: 60 },
    ]
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Köz Domatesli & Kaşarlı Airfryer Menemeni',
    subtitle: 'Tükenmek üzere olan domates ve biberleri değerlendiren süper pratik öğün',
    category: 'kahvalti',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Kolay',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Domates', amount: 3, unit: 'adet', inStock: true },
      { name: 'Kırmızı Biber / Kapya', amount: 1, unit: 'adet', inStock: true },
      { name: 'Yumurta', amount: 3, unit: 'adet', inStock: true },
      { name: 'Kaşar Peyniri', amount: 80, unit: 'gram', inStock: true },
      { name: 'Zeytinyağı', amount: 15, unit: 'ml', inStock: true },
      { name: 'Kekik & Pul Biber', amount: 1, unit: 'tutam', inStock: true }
    ],
    steps: [
      'Domatesleri küp küp doğrayın ve biberleri ince halkalar halinde dilimleyin.',
      'Airfryer haznesine veya ısıya dayanıklı kaba domates, biber ve 1 yemek kaşığı zeytinyağını alıp 185°C\'de 6 dakika soteleyin.',
      'Yumurtaları bir kasede hafifçe çırpın, pişen sebzelerin üzerine dökün ve üzerine rendelenmiş kaşar peynirini serpin.',
      '175°C\'de 4 dakika daha pişirin. Peynir eriyip yumurta kıvam alınca kekik serpip sıcak servis yapın.'
    ],
    airfryerVsOven: {
      airfryer: {
        equipment: 'Airfryer',
        timeMinutes: 10,
        temperature: '180°C',
        healthBenefits: '%65 daha az yağ ile derin köz lezzeti ve minimum akrilamid oluşumu.',
        oilUsagePercent: -65,
        energySavingNote: 'Klasik fırına göre %70 daha az elektrik tüketir ve ön ısıtma gerekmez.'
      },
      oven: {
        equipment: 'Fırın',
        timeMinutes: 22,
        temperature: '200°C',
        healthBenefits: 'Geniş tepsiler için uygundur ancak uzun sürede domatesteki C vitamini kısmen azalabilir.',
        oilUsagePercent: -20,
        energySavingNote: 'Ön ısıtma süresi 10 dk ekler.'
      },
      stovetop: {
        equipment: 'Ocak / Tava',
        timeMinutes: 14,
        healthBenefits: 'Geleneksel kıvam, ancak tereyağı/sıvı yağ miktarı daha yüksek olabilir.',
        oilUsagePercent: 0,
        energySavingNote: 'Hızlı ve kolay kontrol imkanı.'
      },
      recommendation: 'Airfryer: %70 enerji tasarrufu ve 10 dakikada mükemmel karamelize lezzet.'
    },
    scientificBioTip: {
      title: 'Likopen Biyoyararlanımı & Kolin Gücü',
      fact: 'Domatesteki güçlü antioksidan likopen, zeytinyağında ısıtıldığında cis-likopen formuna dönüşür ve vücuttaki emilimi tam 4.4 kat artar. Yumurta sarısındaki kolin ise karaciğer yağlanmasını önlemeye yardımcı olur.',
      macroFocus: 'Hücre Yenilenmesi & Beyin Fonksiyonları'
    },
    macros: {
      calories: 345,
      proteinGrams: 22,
      carbsGrams: 9,
      fatGrams: 24,
      fiberGrams: 3
    },
    tags: ['Yüksek Protein', 'Ketojenik Uygun', 'Sıfır İsraf Şampiyonu', 'Airfryer']
  },
  {
    id: 'rec-2',
    title: 'Ballı & Fesleğenli Çıtır Tavuk Kabak Botları',
    subtitle: 'Tavuk göğsü ve kabakları mükemmel marine ederek kurutmadan pişirme tekniği',
    category: 'ana_yemek',
    prepTimeMinutes: 10,
    cookTimeMinutes: 16,
    servings: 2,
    difficulty: 'Orta',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Tavuk Göğsü', amount: 350, unit: 'gram', inStock: true },
      { name: 'Kabak', amount: 2, unit: 'adet', inStock: true },
      { name: 'Sarımsak', amount: 2, unit: 'diş', inStock: true },
      { name: 'Yoğurt', amount: 100, unit: 'gram', inStock: true },
      { name: 'Kaşar Peyniri', amount: 60, unit: 'gram', inStock: true },
      { name: 'Zeytinyağı', amount: 15, unit: 'ml', inStock: true }
    ],
    steps: [
      'Kabakları uzunlamasına ikiye bölün ve içlerini kaşık yardımıyla hafifçe oyun (çıkan içleri çorba için kenara ayırın).',
      'Tavuk göğsünü küçük küpler halinde doğrayın, yoğurt, ezilmiş sarımsak, zeytinyağı ve baharatlarla marine edin.',
      'Marine tavukları kabak sandallarının içine doldurun ve üzerine kaşar serpin.',
      'Airfryer haznesinde 185°C\'de 16 dakika (veya 200°C fırında 28 dakika) tavuklar altın sarısı olana kadar pişirin.'
    ],
    airfryerVsOven: {
      airfryer: {
        equipment: 'Airfryer',
        timeMinutes: 16,
        temperature: '185°C',
        healthBenefits: 'Sirküle hava tavuğun suyunu hapseder (%28 daha sulu doku), yağ eklemeden çıtırlık sağlar.',
        oilUsagePercent: -75,
        energySavingNote: 'Fırına kıyasla 18 dakika daha hızlıdır.'
      },
      oven: {
        equipment: 'Fırın',
        timeMinutes: 30,
        temperature: '200°C',
        healthBenefits: 'Aynı anda 6-8 porsiyon yapmak için idealdir.',
        oilUsagePercent: -30,
        energySavingNote: 'Büyük porsiyonlarda avantajlıdır.'
      },
      recommendation: 'Airfryer: Tavuk göğsünün kurumasını önleyerek sulu ve yumuşak kalmasını sağlar.'
    },
    scientificBioTip: {
      title: 'Yoğurt Marinasyonunun Proteaz Enzim Etkisi',
      fact: 'Yoğurttaki laktik asit ve doğal enzimler, tavuk kas liflerindeki kolajeni parçalayarak etin %35 daha yumuşak ve sindirimi kolay olmasını sağlar. Kabaktaki potasyum ise sodyum dengesini korur.',
      macroFocus: 'Kas Onarımı & Düşük Sodyum'
    },
    macros: {
      calories: 420,
      proteinGrams: 46,
      carbsGrams: 11,
      fatGrams: 20,
      fiberGrams: 4
    },
    tags: ['Yüksek Protein', 'Düşük Karb', 'Fit Akşam Yemeği', 'Glutensiz']
  },
  {
    id: 'rec-3',
    title: 'Olgun Muzlu & Yulaflı Sıfır İsraf Çıtır Kurabiye',
    subtitle: 'Kararmaya yüz tutmuş muzları una ve şekere ihtiyaç duymadan değerlendirin',
    category: 'tatli',
    prepTimeMinutes: 5,
    cookTimeMinutes: 9,
    servings: 2,
    difficulty: 'Kolay',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Muz', amount: 2, unit: 'adet', inStock: true },
      { name: 'Yulaf Ezmesi', amount: 120, unit: 'gram', inStock: true },
      { name: 'Kekik & Pul Biber', amount: 1, unit: 'tutam', inStock: false }, // Tarçın alternatifi
    ],
    steps: [
      'Olgunlaşmış muzları çatal yardımıyla püre haline getirin.',
      'Yulaf ezmesini ekleyip homojen bir harç elde edene kadar karıştırın.',
      'Kaşıkla ceviz büyüklüğünde parçalar alıp hafifçe yassılaştırarak Airfryer ızgarasına dizin.',
      '165°C\'de 9 dakika pişirin. Dışı kıtır içi yumuşacık doğal tatlınız hazır.'
    ],
    airfryerVsOven: {
      airfryer: {
        equipment: 'Airfryer',
        timeMinutes: 9,
        temperature: '165°C',
        healthBenefits: 'Sıfır rafine şeker ve sıfır ilave yağ. Doğal fruktoz ve beta-glukan lifi.',
        oilUsagePercent: -100,
        energySavingNote: 'Tek porsiyonluk tatlı krizinde fırın yakmaya son!'
      },
      oven: {
        equipment: 'Fırın',
        timeMinutes: 18,
        temperature: '175°C',
        healthBenefits: 'Toplu pişirme için uygundur.',
        oilUsagePercent: -100,
        energySavingNote: 'Ön ısıtma süresi gerektirir.'
      },
      recommendation: 'Airfryer: 9 dakikada sıfır yağ ve şekersiz sağlıklı atıştırmalık.'
    },
    scientificBioTip: {
      title: 'Beta-Glukan ve Dirençli Nişasta Sinerjisi',
      fact: 'Olgun muzlardaki fruktooligosakkaritler (FOS) bağırsak mikrobiyotasındaki faydalı probiyotikleri besler. Yulaftaki çözünür beta-glukan lifi ise tokluk hissini 3 saate kadar uzatır.',
      macroFocus: 'Sindirim Sağlığı & Şekersiz Enerji'
    },
    macros: {
      calories: 230,
      proteinGrams: 6,
      carbsGrams: 48,
      fatGrams: 3,
      fiberGrams: 7
    },
    tags: ['Şekersiz', 'Glutensiz Opsiyon', 'Lif Deposu', 'Vegan'],
    metabolicFocus: 'microbiome',
  },
  {
    id: 'rec-4',
    title: 'Bayat Ekmek & Köz Sebzeli Gurme Panzanella Tostu',
    subtitle: 'Dünden kalan bayat ekmekleri ve peynir kenarlarını çıtır İtalyan klasiğine çevirin',
    category: 'hizli_yemek',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 2,
    difficulty: 'Kolay',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Bayat Ekmek', amount: 4, unit: 'dilim', inStock: true },
      { name: 'Domates', amount: 2, unit: 'adet', inStock: true },
      { name: 'Kaşar Peyniri', amount: 60, unit: 'gram', inStock: true },
      { name: 'Zeytinyağı', amount: 15, unit: 'ml', inStock: true },
      { name: 'Kekik & Pul Biber', amount: 1, unit: 'tutam', inStock: true },
    ],
    steps: [
      'Bayat ekmek dilimlerini hafif zeytinyağı ve kekikle ovun.',
      'Üzerine ince doğranmış domatesleri ve rendelenmiş peynirleri yerleştirin.',
      'Airfryer\'da 190°C\'de 7-8 dakika peynirler altın sarısı kabarcıklar çıkarana dek fırınlayın.',
      'Çıtır çıtır taze fesleğen ve zeytinyağı gezdirerek sıcak servis edin.'
    ],
    airfryerVsOven: {
      airfryer: {
        equipment: 'Airfryer',
        timeMinutes: 7,
        temperature: '190°C',
        healthBenefits: 'Bayat ekmeğin nemini alarak mükemmel çıtırlık sağlar, yağ çekmez.',
        oilUsagePercent: -60,
        energySavingNote: '5 dakikalık hızlı çıtırlık.'
      },
      oven: {
        equipment: 'Fırın',
        timeMinutes: 15,
        temperature: '200°C',
        healthBenefits: 'Toplu ekmek kurtarmada idealdir.',
        oilUsagePercent: -30,
        energySavingNote: 'Geniş tepsi kapasitesi.'
      },
      recommendation: 'Airfryer: 7 dakikada bayat ekmekleri restorandaki bruschetta kıvamına getirir.'
    },
    scientificBioTip: {
      title: 'Retrogradasyon & Dirençli Nişasta Dönüşümü',
      fact: 'Bayatlayan ekmekteki nişasta retrogradasyona uğrar; bu durum sindirim hızını yavaşlatarak kan şekerinin ani yükselmesini engeller ve insülin duyarlılığını artırır.',
      macroFocus: 'Düşük Glisemik Yük & İsrafsız Karbonhidrat'
    },
    macros: {
      calories: 285,
      proteinGrams: 14,
      carbsGrams: 32,
      fatGrams: 12,
      fiberGrams: 4
    },
    tags: ['Artık Dönüştürücü', 'İnsülin Dostu', 'Sıfır Atık', 'Airfryer'],
    isLeftoverRecipe: true,
    leftoverBase: 'Bayat Ekmek',
    metabolicFocus: 'leftover_transform',
  },
  {
    id: 'rec-5',
    title: 'Sirkadiyen Fit Lorlu & Otlu Akşam Frittatası',
    subtitle: 'Hafif sindirim ve melatonin sentezini destekleyen düşük kalorili akşam öğünü',
    category: 'fit_hafif',
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'Kolay',
    imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Yumurta', amount: 3, unit: 'adet', inStock: true },
      { name: 'Kırmızı Biber / Kapya', amount: 1, unit: 'adet', inStock: true },
      { name: 'Zeytinyağı', amount: 10, unit: 'ml', inStock: true },
      { name: 'Yoğurt', amount: 50, unit: 'gram', inStock: true },
    ],
    steps: [
      'Biberleri ince şeritler halinde doğrayıp hafifçe soteleyin.',
      'Yumurta ve yoğurdu pürüzsüz kıvama gelene dek çırpın, baharatları ekleyin.',
      'Airfryer pişirme kabına döküp 165°C\'de 12 dakika kabarıp altın rengi olana kadar pişirin.'
    ],
    airfryerVsOven: {
      airfryer: {
        equipment: 'Airfryer',
        timeMinutes: 12,
        temperature: '165°C',
        healthBenefits: 'Yumuşak sufle kıvamı, sıfır trans yağ.',
        oilUsagePercent: -70,
        energySavingNote: 'Hızlı akşam yemeği.'
      },
      oven: {
        equipment: 'Fırın',
        timeMinutes: 20,
        temperature: '175°C',
        healthBenefits: 'Homojen pişirme.',
        oilUsagePercent: -40,
        energySavingNote: 'Klasik fırınlama.'
      },
      recommendation: 'Airfryer: 12 dakikada hafif sufle dokusunda akşam yemeği.'
    },
    scientificBioTip: {
      title: 'Triptofan & Gece Büyüme Hormonu Desteği',
      fact: 'Yumurta ve süt ürünlerindeki triptofan amino asidi, akşam saatlerinde serotonine ve melatonine dönüşerek derin REM uykusunu tetikler. Düşük karbonhidrat ise gece insülinini minimumda tutarak yağ yakımını maksimize eder.',
      macroFocus: 'Sirkadiyen Ritim & Gece Rejenerasyonu'
    },
    macros: {
      calories: 210,
      proteinGrams: 18,
      carbsGrams: 5,
      fatGrams: 13,
      fiberGrams: 2
    },
    tags: ['Sirkadiyen', 'İnsülin Dengesi', 'Yüksek Protein', 'Gece Fit'],
    metabolicFocus: 'circadian',
  }
];

export const INITIAL_MISSING_1_SUGGESTIONS: Missing1Suggestion[] = [
  {
    id: 'miss-1',
    missingIngredientName: 'Krema (200ml)',
    missingIngredientCategory: 'sut_kahvaltilik',
    unlocksRecipeTitle: 'Kremalı & Sarımsaklı Tavuklu Mantarlı Fettuccine',
    prepTimeMinutes: 18,
    recipeDescription: 'Mutfaktaki tavuk, sarımsak ve baharatlarınıza sadece 1 kutu krema ekleyerek restoran kalitesinde enfes bir İtalyan klasiği yaratabilirsiniz.',
    whyThisItem: 'Elinizdeki protein ve baharat bazı hazır. Krema dokuyu bağlayarak 4 kişilik ana yemeğe dönüştürür.',
    estimatedPriceTl: '38 ₺',
    additionalRecipesCount: 4
  },
  {
    id: 'miss-2',
    missingIngredientName: 'Limon (1 File)',
    missingIngredientCategory: 'sebze_meyve',
    unlocksRecipeTitle: 'Zeytinyağlı & Limon Soslu Fırın Kabak Carpaccio',
    prepTimeMinutes: 12,
    recipeDescription: 'Kabak, zeytinyağı ve sarımsağınızı taze limon asidiyle parlatıp Akdeniz usulü ferahlatıcı bir meze ve fit öğün oluşturun.',
    whyThisItem: 'Asit dengesi sebzelerin doğal tatlılığını ortaya çıkarır ve antioksidan emilimini artırır.',
    estimatedPriceTl: '25 ₺',
    additionalRecipesCount: 7
  },
  {
    id: 'miss-3',
    missingIngredientName: 'Kuru Soğan (1 kg)',
    missingIngredientCategory: 'sebze_meyve',
    unlocksRecipeTitle: 'Karamelize Soğanlı & Kaşarlı Tavuk Güveç',
    prepTimeMinutes: 25,
    recipeDescription: 'Temel mutfak aromatiği olan soğan sayesinde mevcut tavuk ve peynir stoğunuzla 5 farklı geleneksel güveç ve tencere yemeği kilidini açın.',
    whyThisItem: 'Mutfaktaki neredeyse tüm kuru gıda ve etleri zenginleştiren vazgeçilmez temel taşı.',
    estimatedPriceTl: '22 ₺',
    additionalRecipesCount: 12
  }
];

export const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Krema (200ml)',
    amount: 1,
    unit: 'paket',
    category: 'sut_kahvaltilik',
    checked: false,
    source: 'missing_1',
    addedAt: new Date().toISOString(),
    estimatedPrice: 38
  },
  {
    id: 'shop-2',
    name: 'Limon',
    amount: 3,
    unit: 'adet',
    category: 'sebze_meyve',
    checked: false,
    source: 'missing_1',
    addedAt: new Date().toISOString(),
    estimatedPrice: 25
  }
];

export const INITIAL_ZERO_WASTE_STATS: ZeroWasteStats = {
  mealsCooked: 7,
  ingredientsSaved: 23,
  approxMoneySavedTl: 685,
  co2SavedKg: 8.4,
  streakDays: 4,
  rescuedKg: 5.8,
  waterSavedLiters: 4850,
};

export const INITIAL_USER_BADGES: UserBadge[] = [
  {
    id: 'badge-1',
    name: 'Atık Avcısı',
    description: 'Dolaptaki 20+ bozulma riski olan malzemeyi başarıyla kurtardın.',
    icon: '🥇',
    category: 'eco',
    unlocked: true,
    unlockedAt: 'Dün',
    progressPercent: 100,
    rewardText: '+50 Sıfır İsraf Puanı',
  },
  {
    id: 'badge-2',
    name: 'Airfryer Büyücüsü',
    description: 'Airfryer ile klasik fırına göre %70 enerji tasarruflu 5 öğün pişirdin.',
    icon: '⚡',
    category: 'speed',
    unlocked: true,
    unlockedAt: '3 gün önce',
    progressPercent: 100,
    rewardText: 'Özel Airfryer Gurme Şablonu',
  },
  {
    id: 'badge-3',
    name: 'Karbon Kahramanı',
    description: 'Gıda israfını önleyerek 10 kg CO₂ salımını engelleme hedefine yaklaştın.',
    icon: '🌍',
    category: 'eco',
    unlocked: false,
    progressPercent: 84,
    rewardText: 'Yeşil Gezegen Şef Sertifikası',
  },
  {
    id: 'badge-4',
    name: 'Bayat Ekmek & Peynir Ustası',
    description: 'Kalan peynir kabukları ve bayat ekmeklerle 3 yaratıcı tarif yap.',
    icon: '🍞',
    category: 'culinary',
    unlocked: true,
    unlockedAt: 'Geçen hafta',
    progressPercent: 100,
    rewardText: 'İtalyan Panzanella Rehberi',
  },
  {
    id: 'badge-5',
    name: 'Sıfır İsraf Serisi (7 Gün)',
    description: 'Kesintisiz 7 gün boyunca evdeki malzemelerle öğün hazırla.',
    icon: '🔥',
    category: 'streak',
    unlocked: false,
    progressPercent: 57,
    rewardText: 'Süper Tasarrufçu Rozeti',
  },
  {
    id: 'badge-6',
    name: '1-Eksik Stratejisti',
    description: 'Market listesine 1-Eksik önerilerinden 5 malzeme ekleyip pişir.',
    icon: '✨',
    category: 'culinary',
    unlocked: true,
    unlockedAt: '5 gün önce',
    progressPercent: 100,
    rewardText: 'Gurme Menü Kilidi',
  },
];

export const INITIAL_TRENDING_RECIPES: TrendingRecipe[] = [
  {
    id: 'trend-1',
    title: 'Köz Domatesli & Kaşarlı Airfryer Menemeni',
    category: 'kahvalti',
    cookedCountThisWeek: 1420,
    approxSavedKg: 890,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    primaryEquipment: 'Airfryer (10 dk)',
    tag: 'Haftanın #1 Popüleri',
  },
  {
    id: 'trend-2',
    title: 'Çıtır Tavuklu & Fesleğenli Kabak Botları',
    category: 'ana_yemek',
    cookedCountThisWeek: 980,
    approxSavedKg: 640,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    primaryEquipment: 'Airfryer / Fırın',
    tag: 'Fit & Düşük Karb',
  },
  {
    id: 'trend-3',
    title: 'Olgun Muzlu & Yulaflı Şekersiz Kurabiye',
    category: 'tatli',
    cookedCountThisWeek: 840,
    approxSavedKg: 420,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    primaryEquipment: 'Airfryer (9 dk)',
    tag: 'Sıfır Rafine Şeker',
  },
  {
    id: 'trend-4',
    title: 'Kalan Sebzeli İtalyan Frittata & Otlu Peynir',
    category: 'kahvalti',
    cookedCountThisWeek: 730,
    approxSavedKg: 510,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80',
    primaryEquipment: 'Tava / Fırın',
    tag: 'Hızlı & Kurtarıcı',
  },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Ceren Yılmaz',
    authorRole: 'Sıfır Atık Gönüllüsü',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipeTitle: 'Buruşan Domateslerle Köz Airfryer Menemeni 🍅',
    caption: 'Buzdolabında 4 gündür bekleyen yumuşamış domatesleri atmak yerine ŞefSıfır ile 10 dakikada şahane bir menemene dönüştürdüm! Ekmek bandırmalık oldu resmen.',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    savedIngredients: ['3 Domates', '2 Kapya Biber', 'Kaşar Peyniri'],
    equipmentUsed: 'Airfryer',
    likesCount: 142,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        authorName: 'Burak Demir',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Harika görünüyor! Domates kabuklarını da kurutup toz baharat yapmayı deneyebilirsin.',
        timestamp: '2 saat önce',
      },
      {
        id: 'c2',
        authorName: 'Elif Kaya',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'Airfryer menemenini ben de dün yaptım, tava temizleme derdi olmaması efsane.',
        timestamp: '45 dk önce',
      },
    ],
    timeAgo: '3 saat önce',
    moneySavedTl: 95,
    tags: ['Sıfırİsraf', 'AirfryerMenemeni', 'Tasarruf', 'PazarDolabı'],
  },
  {
    id: 'post-2',
    authorName: 'Kaan Aksoy',
    authorRole: 'Amatör Gurme Şef',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    recipeTitle: 'Kararan Muzlardan 9 Dk Çıtır Yulaf Kurabiyesi 🍌',
    caption: 'Muzların kabuğu kararınca herkes çöp sanıyor ama aslında fruktozu tam zirveye çıkıyor! Şekersiz, unsuz, sadece 2 muz ve yulafla çayın yanına çıtır atıştırmalık yaptım.',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80',
    savedIngredients: ['2 Olgun Muz', '120g Yulaf Ezmesi'],
    equipmentUsed: 'Airfryer',
    likesCount: 218,
    isLiked: true,
    comments: [
      {
        id: 'c3',
        authorName: 'Selin Arıkan',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        text: 'İçine biraz tarçın ve ceviz de ekleyince enerji bombası oluyor!',
        timestamp: '1 saat önce',
      },
    ],
    timeAgo: '5 saat önce',
    moneySavedTl: 65,
    tags: ['MuzKurtarıldı', 'ŞekersizTatlı', 'FitMutfak', 'Airfryer'],
  },
  {
    id: 'post-3',
    authorName: 'Deniz Şimşek',
    authorRole: 'Beslenme Uzmanı & Anne',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    recipeTitle: 'Artan Kabak İçlerinden Kremasız İpeksi Detoks Çorbası 🥣',
    caption: 'Kabak sandalları yaparken çıkardığım kabak içlerini saklamıştım. Sarımsak, yoğurt ve nane ile blenderdan geçirip 15 dakikada harika bir lif çorbası pişirdim.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    savedIngredients: ['Kabak İçi', 'Yoğurt', 'Sarımsak', 'Nane'],
    equipmentUsed: 'Tencere',
    likesCount: 176,
    isLiked: false,
    comments: [],
    timeAgo: 'Dün',
    moneySavedTl: 80,
    tags: ['Detoks', 'SıfırAtıkÇorba', 'BiyoHap', 'EvYapımı'],
  },
];

export const INITIAL_CHEF_MASTERCLASSES: ChefMasterclass[] = [
  {
    id: 'class-1',
    chefName: 'Şef Mehmet Gürs',
    chefTitle: 'Michelin Yeşil Yıldız Öncüsü',
    chefAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    chefBadge: 'Misafir Usta Şef',
    eventTitle: 'Bayat Ekmek ve Peynir Kabuklarından 3 Yıldızlı Risotto & Çıtırlar',
    description: 'Evdeki parmesan ve eski kaşar kabuklarını kaynatarak elde edilen derin umami stok suyunun bayat ekmek çıtırlarıyla buluştuğu sıfır atık gastronomi atölyesi.',
    dateStr: 'Bu Akşam',
    timeStr: '20:30',
    status: 'upcoming',
    attendeesCount: 642,
    isRegistered: true,
    keyTopics: ['Peynir Kabuğu Umami Suyu', 'Bayat Ekmek Panzanella', 'Doğal Emülsiyonlar'],
    sponsoredBy: {
      brandName: 'Philips Airfryer XXL',
      logoText: 'PHILIPS',
      offerText: 'KITCHZERO20 kodu ile resmi mağazada %20 indirim',
      discountCode: 'KITCHZERO20',
    },
  },
  {
    id: 'class-2',
    chefName: 'Diyetisyen Melis Torun',
    chefTitle: 'Fonksiyonel Beslenme ve Makro Koçu',
    chefAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    chefBadge: 'Beslenme Danışmanı',
    eventTitle: '15 Dakikada Yüksek Proteinli & Düşük Karbonhidratlı Pratik Akşam Yemeği',
    description: 'Mutfaktaki tavuk, yumurta ve sebzeleri kurutmadan yüksek biyo-yararlanım ile pişirme, glisemik indeksi düşük tutarak gece yağ depolanmasını engelleme rehberi.',
    dateStr: 'Yarın',
    timeStr: '19:00',
    status: 'upcoming',
    attendeesCount: 489,
    isRegistered: false,
    keyTopics: ['Proteaz Enzimleri ile Marinasyon', 'Gece İnsülin Dengesini Koruma', 'Fit Tatlı Alternatifleri'],
    sponsoredBy: {
      brandName: 'Karaca BioDiamond',
      logoText: 'KARACA',
      offerText: 'Sıfır Yağ ile Pişirme Tencere Setlerinde %15 Ek Tasarruf',
      discountCode: 'BIOZERO15',
    },
  },
  {
    id: 'class-3',
    chefName: 'Şef Hazer Amani',
    chefTitle: 'Sokak Lezzetleri & Modern Mutfak Şefi',
    chefAvatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
    chefBadge: 'Airfryer Ustası',
    eventTitle: 'Airfryer\'da Marinasyon, Çıtır Doku ve Et Mühürleme Sırları',
    description: 'Sıvı kaybı olmadan etlerin içini sulu, dışını nar gibi kızartma teknikleri, baharat yağlarının yanmadan lezzet verme püf noktaları.',
    dateStr: 'Pazar',
    timeStr: '18:00',
    status: 'upcoming',
    attendeesCount: 812,
    isRegistered: false,
    keyTopics: ['Hava Sirkülasyonu Kontrolü', 'Marinasyon Tuz Oranı', 'Duman Noktası Düşük Yağlar'],
  },
];

export const INITIAL_KITCHEN_HACKS: KitchenHack[] = [
  {
    id: 'hack-1',
    title: 'Solan Yeşillikleri 10 Dakikada Canlandırma Buzlu Su Şoku',
    category: 'canlandirma',
    summary: 'Kendini bırakmış dereotu, maydanoz veya rokaları çöpe atmayın; ozmoz basıncıyla kütür kütür yapın.',
    readTime: '2 dk okuma',
    icon: '🥬',
    steps: [
      'Derin bir kaba bol buz ve soğuk su doldurun.',
      'İçine 1 tatlı kaşığı sirke veya birkaç damla limon suyu damlatın.',
      'Solmuş yeşillikleri 10-12 dakika bu suda bekletin.',
      'Hücre çeperleri suyu hızla emerek bitkiyi ilk günkü diriliğine kavuşturur.',
    ],
    scientificReason: 'Hücre turgor basıncının soğuk su ve hafif asidik ortamda anında toparlanması prensibine dayanır.',
    likes: 342,
    isFavorite: true,
  },
  {
    id: 'hack-2',
    title: 'Kalan Soğan & Sarımsak Kabuklarından Umami Zeytinyağı',
    category: 'saklama',
    summary: 'Soyulan temiz kabukları atmayın; 70°C zeytinyağında dinlendirerek gurme sos yapın.',
    readTime: '3 dk okuma',
    icon: '🧄',
    steps: [
      'Temiz yıkadığınız soğan ve sarımsak dış kabuklarını bir cam kavanoza koyun.',
      'Üzerini kaliteli sızma zeytinyağı ile doldurun.',
      'Benmari usulü ılık suda 20 dakika bekletip süzün.',
      'Salata ve makarnalarınıza 5 yıldızlı restoran aroması kazandırın.',
    ],
    scientificReason: 'Kabuklardaki kükürtlü aromatik bileşikler ve kuersetin flavanoidi lipofilik olup yağa homojen geçer.',
    likes: 289,
    isFavorite: false,
  },
  {
    id: 'hack-3',
    title: 'Kullanılmış Limon Kabuklarıyla Fırın ve Airfryer Temizliği',
    category: 'temizlik',
    summary: 'Sıkılmış limonları hazneye atıp 5 dakika buhar yaptırarak yağları sıfır kimyasalla çözün.',
    readTime: '1 dk okuma',
    icon: '🍋',
    steps: [
      'Sıkılmış yarım limonları 1 çay bardağı suyla Airfryer veya fırın kabına koyun.',
      '180°C\'de 5 dakika çalıştırın.',
      'Limon buharı yağları yumuşatır; ardından nemli bezle tek hamlede silin.',
    ],
    scientificReason: 'Limon kabuğundaki d-limonen doğal bir organik çözücüdür ve yanmış yağ asitlerini hızla parçalar.',
    likes: 412,
    isFavorite: true,
  },
  {
    id: 'hack-4',
    title: 'Kararmış Muzları Dondurucuda 3 Ay Saklama ve Smoothie Bazı',
    category: 'saklama',
    summary: 'Kararan muzları soyup dilimleyin; kilitli poşette dondurarak doğal dondurma kıvamı elde edin.',
    readTime: '2 dk okuma',
    icon: '🍌',
    steps: [
      'Kabuğu siyahlaşmış muzları soyup 1 cm kalınlığında dilimleyin.',
      'Birbirine yapışmaması için yağlı kağıt üzerinde 1 saat ön dondurma yapın.',
      'Kilitli poşete alıp 3 aya kadar saklayın.',
      'Blenderda donuk muz + süt veya yoğurt çekildiğinde rafine şekersiz kremamsı dondurma olur.',
    ],
    scientificReason: 'Donma sürecinde nişasta kristalleşmesi ve doğal pektin lifleri kadifemsi dondurma dokusu oluşturur.',
    likes: 520,
    isFavorite: false,
  },
];

export const INITIAL_SPONSORED_DEALS: SponsoredDeal[] = [
  {
    id: 'deal-1',
    brand: 'Philips',
    productName: 'Airfryer XXL Smart Sensing Teknolojili Fritöz',
    originalPrice: 7999,
    discountedPrice: 6399,
    discountPercent: 20,
    couponCode: 'KITCHZERO20',
    features: ['%90 daha az yağ', '%70 elektrik tasarrufu', 'Akıllı pişirme sensörleri', 'Bulaşık makinesinde yıkanabilir'],
    imageUrl: 'https://images.unsplash.com/photo-1585672840546-44445c7eb344?w=500&auto=format&fit=crop&q=80',
    affiliateUrl: 'https://philips.com.tr?utm_source=kitchzero&utm_medium=affiliate&code=KITCHZERO20',
    ecoFeature: 'Geleneksel fırına göre yılda ~1.850 ₺ elektrik tasarrufu sağlar.',
  },
  {
    id: 'deal-2',
    brand: 'Karaca',
    productName: 'BioDiamond Elmas Kristal 7 Parça Tencere Seti',
    originalPrice: 4499,
    discountedPrice: 3824,
    discountPercent: 15,
    couponCode: 'BIOZERO15',
    features: ['Sıfır yağ ile yapışmaz taban', 'PFOA içermeyen elmas kaplama', '10 Yıl Garanti'],
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
    affiliateUrl: 'https://karaca.com?utm_source=kitchzero&utm_medium=affiliate&code=BIOZERO15',
    ecoFeature: 'Düşük ısıda hızlı pişirme ile gaz ve elektrik tüketimini %40 azaltır.',
  },
];

export const INITIAL_MONTHLY_SAVINGS: MonthlySavingsPoint[] = [
  { month: 'Ekim', savedTl: 380, wastedAvoidedKg: 3.2, mealsCooked: 4 },
  { month: 'Kasım', savedTl: 540, wastedAvoidedKg: 4.8, mealsCooked: 6 },
  { month: 'Aralık', savedTl: 720, wastedAvoidedKg: 6.5, mealsCooked: 9 },
  { month: 'Ocak', savedTl: 910, wastedAvoidedKg: 7.9, mealsCooked: 11 },
  { month: 'Şubat (Şu An)', savedTl: 1240, wastedAvoidedKg: 10.4, mealsCooked: 15 },
];

