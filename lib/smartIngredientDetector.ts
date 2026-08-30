import { IngredientCategory, Ingredient } from './types';

export interface IngredientPrediction {
  category: IngredientCategory;
  unit: Ingredient['unit'];
  amount: number;
  daysUntilExpiry: number;
  isPriority: boolean;
  confidence: number;
  matchedName?: string;
}

interface ItemRule {
  keywords: string[];
  category: IngredientCategory;
  unit: Ingredient['unit'];
  defaultAmount: number;
  daysUntilExpiry: number;
  isPriority?: boolean;
}

const INGREDIENT_RULES: ItemRule[] = [
  // Et, Tavuk, Balık & Protein
  {
    keywords: ['tavuk', 'tavuk göğsü', 'tavuk but', 'tavuk pirzola', 'kanat', 'baget', 'bütün tavuk'],
    category: 'et_tavuk_balik',
    unit: 'gram',
    defaultAmount: 500,
    daysUntilExpiry: 3,
    isPriority: true,
  },
  {
    keywords: ['kıyma', 'dana kıyma', 'kuzu kıyma', 'kuşbaşı', 'biftek', 'antrikot', 'bonfile', 'dana eti', 'kuzu eti', 'köfte'],
    category: 'et_tavuk_balik',
    unit: 'gram',
    defaultAmount: 400,
    daysUntilExpiry: 3,
    isPriority: true,
  },
  {
    keywords: ['somon', 'levrek', 'çipura', 'hamsi', 'ton balığı', 'karides', 'balık', 'mezgit', 'alabalık'],
    category: 'et_tavuk_balik',
    unit: 'adet',
    defaultAmount: 2,
    daysUntilExpiry: 2,
    isPriority: true,
  },
  {
    keywords: ['sucuk', 'sosis', 'salam', 'pastırma', 'füme et', 'jambon'],
    category: 'et_tavuk_balik',
    unit: 'gram',
    defaultAmount: 200,
    daysUntilExpiry: 14,
  },
  {
    keywords: ['tofu', 'soya kıyması', 'seitan'],
    category: 'et_tavuk_balik',
    unit: 'gram',
    defaultAmount: 250,
    daysUntilExpiry: 7,
  },

  // Süt, Peynir & Kahvaltılık
  {
    keywords: ['yumurta', 'köy yumurtası', 'gezen tavuk yumurtası'],
    category: 'sut_kahvaltilik',
    unit: 'adet',
    defaultAmount: 6,
    daysUntilExpiry: 15,
  },
  {
    keywords: ['süt', 'tam yağlı süt', 'yarım yağlı süt', 'laktozsuz süt', 'badem sütü', 'yulaf sütü', 'soya sütü'],
    category: 'sut_kahvaltilik',
    unit: 'litre',
    defaultAmount: 1,
    daysUntilExpiry: 5,
  },
  {
    keywords: ['yoğurt', 'süzme yoğurt', 'organik yoğurt', 'kefir'],
    category: 'sut_kahvaltilik',
    unit: 'gram',
    defaultAmount: 500,
    daysUntilExpiry: 10,
  },
  {
    keywords: ['kaşar', 'kaşar peyniri', 'taze kaşar', 'eski kaşar', 'rendelenmiş kaşar', 'mozzarella', 'parmesan', 'çedar', 'cheddar'],
    category: 'sut_kahvaltilik',
    unit: 'gram',
    defaultAmount: 250,
    daysUntilExpiry: 14,
  },
  {
    keywords: ['beyaz peynir', 'süzme peynir', 'tulum peyniri', 'lor', 'lor peyniri', 'labne', 'krem peynir', 'hellim'],
    category: 'sut_kahvaltilik',
    unit: 'gram',
    defaultAmount: 300,
    daysUntilExpiry: 12,
  },
  {
    keywords: ['tereyağı', 'kaymak', 'margarin'],
    category: 'sut_kahvaltilik',
    unit: 'gram',
    defaultAmount: 250,
    daysUntilExpiry: 30,
  },
  {
    keywords: ['krema', 'sıvı krema', 'yemek kreması'],
    category: 'sut_kahvaltilik',
    unit: 'ml',
    defaultAmount: 200,
    daysUntilExpiry: 6,
  },
  {
    keywords: ['zeytin', 'siyah zeytin', 'yeşil zeytin', 'kırma zeytin'],
    category: 'sut_kahvaltilik',
    unit: 'gram',
    defaultAmount: 300,
    daysUntilExpiry: 45,
  },
  {
    keywords: ['bal', 'reçel', 'pekmez', 'tahin', 'fıstık ezmesi', 'fındık ezmesi', 'helva'],
    category: 'sut_kahvaltilik',
    unit: 'gram',
    defaultAmount: 350,
    daysUntilExpiry: 90,
  },

  // Sebze & Meyve
  {
    keywords: ['domates', 'çeri domates', 'salkım domates', 'pembe domates'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 4,
    daysUntilExpiry: 5,
  },
  {
    keywords: ['salatalık', 'hıyar', 'çengelköy salatalık'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 3,
    daysUntilExpiry: 6,
  },
  {
    keywords: ['biber', 'kırmızı biber', 'kapya biber', 'yeşil biber', 'sivri biber', 'çarliston biber', 'dolmalık biber', 'jalapeno'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 4,
    daysUntilExpiry: 6,
  },
  {
    keywords: ['soğan', 'kuru soğan', 'kırmızı soğan', 'arpacık soğan'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 3,
    daysUntilExpiry: 20,
  },
  {
    keywords: ['taze soğan', 'yeşil soğan', 'pırasa'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 1, // demet/adet
    daysUntilExpiry: 5,
  },
  {
    keywords: ['sarımsak'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 1, // baş
    daysUntilExpiry: 30,
  },
  {
    keywords: ['patates', 'tatlı patates', 'taze patates'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 4,
    daysUntilExpiry: 25,
  },
  {
    keywords: ['havuç', 'turp', 'şalgam', 'pancar'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 3,
    daysUntilExpiry: 12,
  },
  {
    keywords: ['kabak', 'bal kabağı', 'sakız kabağı', 'patlıcan'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 2,
    daysUntilExpiry: 5,
  },
  {
    keywords: ['ıspanak', 'pazı', 'roka', 'maydanoz', 'dereotu', 'nane', 'taze nane', 'marul', 'kıvırcık', 'göbek marul', 'fesleğen', 'taze kekik', 'semizotu', 'tere'],
    category: 'sebze_meyve',
    unit: 'adet', // demet
    defaultAmount: 1,
    daysUntilExpiry: 4,
    isPriority: true,
  },
  {
    keywords: ['brokoli', 'karnabahar', 'lahana', 'kırmızı lahana', 'brüksel lahanası', 'kuşkonmaz', 'enginar', 'kereviz'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 1,
    daysUntilExpiry: 6,
  },
  {
    keywords: ['mantar', 'kültür mantarı', 'kestane mantarı', 'istiridye mantarı', 'şitaki'],
    category: 'sebze_meyve',
    unit: 'gram',
    defaultAmount: 300,
    daysUntilExpiry: 3,
    isPriority: true,
  },
  {
    keywords: ['limon', 'misket limonu', 'lime'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 3,
    daysUntilExpiry: 14,
  },
  {
    keywords: ['elma', 'armut', 'muz', 'portakal', 'mandalina', 'greyfurt', 'kivi', 'şeftali', 'kayısı', 'erik', 'kiraz', 'vişne', 'çilek', 'üzüm', 'kavun', 'karpuz', 'avokado', 'nar'],
    category: 'sebze_meyve',
    unit: 'adet',
    defaultAmount: 4,
    daysUntilExpiry: 5,
  },

  // Kuru Gıda, Bakliyat & Tahıl
  {
    keywords: ['makarna', 'spagetti', 'penne', 'burgu makarna', 'erişte', 'fiyonk makarna'],
    category: 'kuru_gida',
    unit: 'paket',
    defaultAmount: 1,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['pirinç', 'baldo pirinç', 'basmati pirinç', 'yasemin pirinç', 'esmer pirinç'],
    category: 'kuru_gida',
    unit: 'gram',
    defaultAmount: 1000,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['bulgur', 'pilavlık bulgur', 'köftelik bulgur', 'kinoa', 'karabuğday', 'kuskus'],
    category: 'kuru_gida',
    unit: 'gram',
    defaultAmount: 1000,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['kırmızı mercimek', 'yeşil mercimek', 'sarı mercimek', 'nohut', 'kuru fasulye', 'barbunya', 'börülce', 'maş fasulyesi'],
    category: 'kuru_gida',
    unit: 'gram',
    defaultAmount: 1000,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['un', 'buğday unu', 'tam buğday unu', 'yulaf unu', 'mısır unu', 'badem unu', 'galeta unu'],
    category: 'kuru_gida',
    unit: 'gram',
    defaultAmount: 1000,
    daysUntilExpiry: 120,
  },
  {
    keywords: ['yulaf', 'yulaf ezmesi', 'müsli', 'granola', 'mısır gevreği'],
    category: 'kuru_gida',
    unit: 'gram',
    defaultAmount: 500,
    daysUntilExpiry: 90,
  },
  {
    keywords: ['ekmek', 'tost ekmeği', 'tam buğday ekmeği', 'baget ekmek', 'lavaş', 'tortilla', 'pita', 'yufka', 'simit'],
    category: 'kuru_gida',
    unit: 'adet',
    defaultAmount: 1,
    daysUntilExpiry: 4,
    isPriority: true,
  },
  {
    keywords: ['ceviz', 'fındık', 'badem', 'kaju', 'fıstık', 'çam fıstığı', 'kabak çekirdeği', 'ay çekirdeği', 'chia tohumu', 'keten tohumu', 'susam', 'kuru üzüm', 'kuru incir', 'kuru kayısı', 'hurma'],
    category: 'kuru_gida',
    unit: 'gram',
    defaultAmount: 200,
    daysUntilExpiry: 90,
  },

  // Baharat, Yağ & Sos
  {
    keywords: ['zeytinyağı', 'sızma zeytinyağı', 'riviera'],
    category: 'baharat_sos',
    unit: 'ml',
    defaultAmount: 500,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['ayçiçek yağı', 'mısırözü yağı', 'kanola yağı', 'hindistancevizi yağı', 'susam yağı'],
    category: 'baharat_sos',
    unit: 'ml',
    defaultAmount: 1000,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['tuz', 'kaya tuzu', 'deniz tuzu', 'himalaya tuzu'],
    category: 'baharat_sos',
    unit: 'gram',
    defaultAmount: 500,
    daysUntilExpiry: 365,
  },
  {
    keywords: ['karabiber', 'pul biber', 'kırmızı toz biber', 'kekik', 'kuru nane', 'kimyon', 'sumak', 'zerdeçal', 'zencefil', 'köri', 'tarçın', 'biberiye', 'kakule', 'muskat', 'defne yaprağı', 'isot', 'fesleğen'],
    category: 'baharat_sos',
    unit: 'yemek_kasigi',
    defaultAmount: 2,
    daysUntilExpiry: 180,
  },
  {
    keywords: ['domates salçası', 'biber salçası', 'tatlı biber salçası', 'acı biber salçası', 'domates püresi'],
    category: 'baharat_sos',
    unit: 'gram',
    defaultAmount: 400,
    daysUntilExpiry: 45,
  },
  {
    keywords: ['soya sosu', 'nar ekşisi', 'sirke', 'elma sirkesi', 'üzüm sirkesi', 'balsamik sirke', 'hardal', 'mayonez', 'ketçap', 'acuka', 'pesto', 'pesto sos', 'sriracha', 'hot sauce', 'tahini'],
    category: 'baharat_sos',
    unit: 'ml',
    defaultAmount: 250,
    daysUntilExpiry: 90,
  },

  // İçecekler
  {
    keywords: ['kahve', 'filtre kahve', 'türk kahvesi', 'espresso', 'çekirdek kahve', 'çay', 'yeşil çay', 'bitki çayı', 'ıhlamur', 'adaçayı'],
    category: 'icecek',
    unit: 'gram',
    defaultAmount: 250,
    daysUntilExpiry: 120,
  },
  {
    keywords: ['maden suyu', 'soda', 'meyve suyu', 'portakal suyu', 'limonata', 'şalgam', 'kombucha', 'soğuk çay'],
    category: 'icecek',
    unit: 'adet',
    defaultAmount: 2,
    daysUntilExpiry: 30,
  },
];

/**
 * Predicts category, unit, amount, and expiry days from raw ingredient name string in Turkish.
 */
export function predictIngredientAttributes(rawName: string): IngredientPrediction {
  const normalized = rawName
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');

  if (!normalized) {
    return {
      category: 'sebze_meyve',
      unit: 'adet',
      amount: 1,
      daysUntilExpiry: 5,
      isPriority: false,
      confidence: 0,
    };
  }

  // 1. Direct or partial keyword matching
  for (const rule of INGREDIENT_RULES) {
    for (const kw of rule.keywords) {
      if (
        normalized === kw ||
        normalized.startsWith(kw + ' ') ||
        normalized.endsWith(' ' + kw) ||
        normalized.includes(' ' + kw + ' ') ||
        (kw.length > 3 && normalized.includes(kw))
      ) {
        return {
          category: rule.category,
          unit: rule.unit,
          amount: rule.defaultAmount,
          daysUntilExpiry: rule.daysUntilExpiry,
          isPriority: rule.isPriority || rule.daysUntilExpiry <= 3,
          confidence: 0.95,
          matchedName: kw,
        };
      }
    }
  }

  // 2. Heuristics based on sub-patterns
  if (/et|köfte|tavuk|hindi|balık|but|biftek|kıyma|sosis|sucuk/i.test(normalized)) {
    return {
      category: 'et_tavuk_balik',
      unit: 'gram',
      amount: 400,
      daysUntilExpiry: 3,
      isPriority: true,
      confidence: 0.8,
    };
  }

  if (/peynir|kaşar|lor|yoğurt|süt|krema|kaymak|tereyağ/i.test(normalized)) {
    return {
      category: 'sut_kahvaltilik',
      unit: 'gram',
      amount: 250,
      daysUntilExpiry: 10,
      isPriority: false,
      confidence: 0.8,
    };
  }

  if (/yağ|zeytinyağı|sos|salça|baharat|biber|tuz|sirke|ekşi/i.test(normalized)) {
    return {
      category: 'baharat_sos',
      unit: 'ml',
      amount: 250,
      daysUntilExpiry: 90,
      isPriority: false,
      confidence: 0.75,
    };
  }

  if (/un|makarna|pirinç|bulgur|mercimek|nohut|fasulye|tahıl|yulaf/i.test(normalized)) {
    return {
      category: 'kuru_gida',
      unit: 'gram',
      amount: 500,
      daysUntilExpiry: 120,
      isPriority: false,
      confidence: 0.8,
    };
  }

  if (/su|soda|içecek|çay|kahve|meyve suyu/i.test(normalized)) {
    return {
      category: 'icecek',
      unit: 'adet',
      amount: 1,
      daysUntilExpiry: 30,
      isPriority: false,
      confidence: 0.75,
    };
  }

  // Default fallback
  return {
    category: 'sebze_meyve',
    unit: 'adet',
    amount: 2,
    daysUntilExpiry: 5,
    isPriority: false,
    confidence: 0.4,
  };
}

export interface QuickSuggestionItem {
  name: string;
  emoji: string;
  category: IngredientCategory;
  unit: Ingredient['unit'];
  amount: number;
  days: number;
}

/**
 * Common quick-add item chips for 1-tap addition
 */
export const QUICK_SMART_SUGGESTIONS: QuickSuggestionItem[] = [
  { name: 'Domates', emoji: '🍅', category: 'sebze_meyve', unit: 'adet', amount: 4, days: 5 },
  { name: 'Tavuk Göğsü', emoji: '🍗', category: 'et_tavuk_balik', unit: 'gram', amount: 500, days: 3 },
  { name: 'Kıyma', emoji: '🥩', category: 'et_tavuk_balik', unit: 'gram', amount: 400, days: 3 },
  { name: 'Yumurta', emoji: '🥚', category: 'sut_kahvaltilik', unit: 'adet', amount: 6, days: 15 },
  { name: 'Kaşar Peyniri', emoji: '🧀', category: 'sut_kahvaltilik', unit: 'gram', amount: 250, days: 14 },
  { name: 'Süt', emoji: '🥛', category: 'sut_kahvaltilik', unit: 'litre', amount: 1, days: 5 },
  { name: 'Zeytinyağı', emoji: '🫒', category: 'baharat_sos', unit: 'ml', amount: 500, days: 180 },
  { name: 'Kuru Soğan', emoji: '🧅', category: 'sebze_meyve', unit: 'adet', amount: 3, days: 20 },
  { name: 'Sarımsak', emoji: '🧄', category: 'sebze_meyve', unit: 'adet', amount: 1, days: 30 },
  { name: 'Patates', emoji: '🥔', category: 'sebze_meyve', unit: 'adet', amount: 4, days: 25 },
  { name: 'Makarna', emoji: '🍝', category: 'kuru_gida', unit: 'paket', amount: 1, days: 180 },
  { name: 'Pirinç', emoji: '🍚', category: 'kuru_gida', unit: 'gram', amount: 1000, days: 180 },
  { name: 'Kırmızı Mercimek', emoji: '🥣', category: 'kuru_gida', unit: 'gram', amount: 1000, days: 180 },
  { name: 'Mantar', emoji: '🍄', category: 'sebze_meyve', unit: 'gram', amount: 300, days: 3 },
  { name: 'Limon', emoji: '🍋', category: 'sebze_meyve', unit: 'adet', amount: 3, days: 14 },
];
