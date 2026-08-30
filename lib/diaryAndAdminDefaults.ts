import { ChefDiaryEntry, AdminSettings } from './types';

export const INITIAL_DIARY_ENTRIES: ChefDiaryEntry[] = [
  {
    id: 'diary-1',
    date: new Date().toISOString().split('T')[0],
    title: 'Kahvaltı Dışarıda & Akşam Airfryer Denemesi',
    content: 'Sabah toplantı nedeniyle kahvaltıyı dışarıda yaptık. Dolapta 4 adet taze yumurta ve yarım kangal sucuk kaldı. Akşam kuru gıdalardan kırmızı mercimek çorbası ve Airfryer ile çıtır nohut atıştırmalığı deneyeceğim. Yarın için domates ve taze nane alışveriş listesinde.',
    mood: 'dengeli',
    tags: ['Dışarıda Yedim', 'Kuru Gıda', 'Airfryer Testi', 'Yarın Alışveriş'],
    meals: {
      breakfast: 'Dışarıda serpme kahvaltı & menemen',
      lunch: 'Hafif kinoa salatası',
      dinner: 'Kırmızı mercimek çorbası + Airfryer baharatlı nohut',
      snacks: '1 avuç çiğ badem + yeşil çay',
    },
    shoppingTodos: ['2 kg Çanakkale Domatesi', '1 Demet Taze Nane', 'Sızma Zeytinyağı'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'diary-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    title: 'Buzluk ve Kiler Envanter Başlangıcı',
    content: 'Kilerdeki kuru fasulye, pirinç ve tam buğday ununu sisteme sesli komutla tek tek ekledim. Ses tanıma gramajları kusursuz ayrıştırdı. Buzluğu tek tek boşaltmak yerine ilk aşamada en çok kullandığım dondurulmuş bezelye ve tavuk göğsünü kaydettim.',
    mood: 'harika',
    tags: ['Kiler Girişi', 'Sesli Komut', 'Buzluk'],
    meals: {
      breakfast: 'Yulaf ezmesi + ceviz + bal',
      lunch: 'Ev yapımı tavuklu wrap',
      dinner: 'Zeytinyağlı taze fasulye + yoğurt',
    },
    shoppingTodos: ['Yulaf Sütü', 'Chia Tohumu'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  geminiModel: 'gemini-3.7-flash',
  simulatedUserCount: 61,
  developerUnlockAll: false,
  marketLinks: [
    {
      id: 'getir',
      name: 'Getir Mutfak',
      baseUrl: 'https://getir.com/ara?q=',
      commissionPercent: 4.5,
      enabled: true,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      id: 'migros',
      name: 'Migros Sanal Market',
      baseUrl: 'https://www.migros.com.tr/arama?q=',
      commissionPercent: 5.0,
      enabled: true,
      color: 'from-orange-500 to-amber-600',
    },
    {
      id: 'yemeksepeti',
      name: 'Yemeksepeti Mahalle',
      baseUrl: 'https://www.yemeksepeti.com/market/search?query=',
      commissionPercent: 4.0,
      enabled: true,
      color: 'from-rose-500 to-red-600',
    },
    {
      id: 'trendyol',
      name: 'Trendyol Hızlı Market',
      baseUrl: 'https://www.trendyol.com/sr?q=',
      commissionPercent: 4.8,
      enabled: true,
      color: 'from-amber-500 to-orange-600',
    },
  ],
  metabolicTags: [
    {
      id: 'high_protein',
      label: 'Yüksek Protein',
      active: true,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      description: 'Kas onarımı ve tokluk hormonu (GLP-1) tetikleyici öğünler.',
    },
    {
      id: 'low_glycemic',
      label: 'Düşük Glisemik / İnsülin Dengesi',
      active: true,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
      description: 'Kan şekeri dalgalanmalarını önleyen kompleks lifli tarifler.',
    },
    {
      id: 'microbiome',
      label: 'Mikrobiyom & Bağırsak Dostu',
      active: true,
      color: 'text-teal-400 border-teal-500/40 bg-teal-950/40',
      description: 'Fermente ve prebiyotik zengin sindirim destekleyici içerikler.',
    },
    {
      id: 'circadian',
      label: 'Sirkadiyen / Akşam Hafif',
      active: true,
      color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40',
      description: 'Uyku kalitesini ve melatonin sentezini bozmayan hafif menüler.',
    },
    {
      id: 'ketogenic',
      label: 'Ketojenik / Düşük Karbonhidrat',
      active: true,
      color: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
      description: 'Sağlıklı yağlar ve minimum karbonhidrat odaklı enerji metabolizması.',
    },
    {
      id: 'gluten_free',
      label: 'Glutensiz Alternatifler',
      active: true,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      description: 'Gluten hassasiyetine uygun karabuğday, kinoa ve pirinç alternatifleri.',
    },
  ],
  allowCameraOCR: true,
  allowVoiceRecognition: true,
  autoDeductOnCook: true,
  systemLogs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      event: 'Sistem Başlatıldı',
      details: 'Kürşad Profili ve Gemini 3.7 Flash devrede.',
    },
  ],
};

export interface TestingProtocolItem {
  id: string;
  dayRange: string;
  title: string;
  category: 'kuru' | 'dolap' | 'artik' | 'admin';
  badgeColor: string;
  objective: string;
  steps: Array<{
    id: string;
    text: string;
    actionHint: string;
  }>;
}

export const FIFTEEN_DAY_TEST_PROTOCOL: TestingProtocolItem[] = [
  {
    id: 'test-phase-1',
    dayRange: 'GÜN 1 - 3',
    title: 'Kuru Gıda & Kiler Testi (En Kolay Başlangıç)',
    category: 'kuru',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    objective: 'Buzluğu tek tek indirmeden kilerdeki bakliyat, baharat ve tahıllarla sesli/metin veri girişini doğrula.',
    steps: [
      {
        id: 'p1-1',
        text: 'Bakliyat, baharat, un, makarna, zeytinyağı gibi ürünleri sesle veya elle gir.',
        actionHint: '🎤 "Sesle Ekle" butonuna basıp: "2 paket makarna, 1 kilo pirinç, pul biber, zeytinyağı" de.',
      },
      {
        id: 'p1-2',
        text: 'Otomatik kategori ve birim ayrıştırmasının doğruluğunu kontrol et.',
        actionHint: 'Malzemelerin "Kuru Gıda" ve "Baharat & Sos" altında listelendiğini gör.',
      },
      {
        id: 'p1-3',
        text: '"Öğünüm" sekmesine geçip "Pratik / 15 Dk" filtresiyle kuru gıda tarifleri üret.',
        actionHint: 'Gemini yapay zekasının kiler malzemelerinizle anlık 3 gurme tarif oluşturmasını izleyin.',
      },
    ],
  },
  {
    id: 'test-phase-2',
    dayRange: 'GÜN 4 - 7',
    title: 'Buzdolabı & Taze Ürünler (SKT ve Tazelik Radarı)',
    category: 'dolap',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    objective: 'Bozulmaya yakın taze ürünlerde kırmızı alarmı ve otomatik stok düşümünü doğrula.',
    steps: [
      {
        id: 'p2-1',
        text: 'Dolaptaki yumurta, kaşar, yoğurt, domates gibi ürünleri ekle.',
        actionHint: 'Kamerayla buzdolabı rafının fotoğrafını yükle veya ses kaydıyla gir.',
      },
      {
        id: 'p2-2',
        text: 'Bozulmaya yakın bir ürüne 2 gün SKT ver; "Tazelik Radarı" kırmızı alarmını test et.',
        actionHint: 'Üstteki Tazelik Radarı çubuğunda "🚨 2 Gün Kaldı" uyarısının parıldadığını gör.',
      },
      {
        id: 'p2-3',
        text: '"Bu Malzemeyi Kurtaracak Menü Üret" butonuna basarak israf kurtarma motorunu dene.',
        actionHint: 'Kurtarılan her gram malzemenin CO₂ ve TL tasarrufuna yansıdığını doğrula.',
      },
      {
        id: 'p2-4',
        text: 'Yemeği yapınca "Pişirdim (Stoktan Düş)" butonuna tıkla.',
        actionHint: 'Stok miktarının eksildiğini ve tükenenlerin "Pazarım" alışveriş listesine aktarıldığını gözlemle.',
      },
    ],
  },
  {
    id: 'test-phase-3',
    dayRange: 'GÜN 8 - 11',
    title: 'Artıkları Dönüştür & Metabolik Biyo-Beslenme',
    category: 'artik',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    objective: 'Kalan yemekleri gurme menüye çevirme ve bilimsel sağlık ipuçlarını test et.',
    steps: [
      {
        id: 'p3-1',
        text: 'Akşamdan kalan pilav, haşlanmış tavuk veya bayat ekmeği "Artıkları Dönüştür" modunda dene.',
        actionHint: 'Gereksiz çöpe gitmeyi önleyen özel dönüşüm tarifleri listelensin.',
      },
      {
        id: 'p3-2',
        text: '"Yüksek Protein" ve "İnsülin Dengesi" metabolik filtrelerini seçip biyo-hapları incele.',
        actionHint: 'Her tarifin altındaki glisemik ve hücresel sağlık açıklamalarını oku.',
      },
      {
        id: 'p3-3',
        text: 'Pişirme sırasında "⏱️ Sesli Alarm Kur" sayacını çalıştır.',
        actionHint: 'Arka planda sayan akıllı mutfak kronometresini test et.',
      },
    ],
  },
  {
    id: 'test-phase-4',
    dayRange: 'GÜN 12 - 15',
    title: 'Günlük Notlar & Admin Paneli Yönetimi',
    category: 'admin',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    objective: 'Kişisel serbest not defterini doldur ve Admin Paneli ile sistem parametrelerini yönet.',
    steps: [
      {
        id: 'p4-1',
        text: '"Mutfak Günlüğüm" alanına dışarıda yediklerini ve yarının alışveriş planını yaz.',
        actionHint: 'Serbest notlar, günün öğün özetleri ve yapılacaklar listesini kaydet.',
      },
      {
        id: 'p4-2',
        text: 'Admin Paneline girip kullanıcı sayısını 150 yap; "Topluluk" kilidinin açıldığını doğrula.',
        actionHint: 'Kademeli kilit açma simülasyonunu farklı faz eşiklerinde deneyimle.',
      },
      {
        id: 'p4-3',
        text: 'Tüm test kütüğünü ve dolap verilerini tek tıkla JSON/Metin olarak dışa aktar.',
        actionHint: 'Geliştirme notlarını panoya kopyalayıp kayıt altına al.',
      },
    ],
  },
];
