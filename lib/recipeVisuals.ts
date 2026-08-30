/**
 * Dynamic Culinary Image Matching & AI Visual Engine for KitchZero / ŞefSıfır
 * Provides appetizing, high-resolution food photography URLs matched with high precision
 * based on recipe title, ingredients, category, and cooking method.
 */

export interface FoodImagePreset {
  keywords: string[];
  url: string;
  presentationTag: string;
}

const CULINARY_VISUAL_REGISTRY: FoodImagePreset[] = [
  {
    keywords: ['panzanella', 'ekmek', 'bruschetta', 'kruton', 'tost', 'sandviç', 'bread'],
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Çıtır Fırın Sunumu',
  },
  {
    keywords: ['makarna', 'pasta', 'spagetti', 'penne', 'noodle', 'lazanya', 'fettuccine'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281242?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Al Dente Şef Tabağı',
  },
  {
    keywords: ['pilav', 'arancini', 'pirinç', 'risotto', 'fried rice', 'bulgur'],
    url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Aromatik Tane Tane',
  },
  {
    keywords: ['omlet', 'frittata', 'yumurta', 'menemen', 'egg', 'scramble', 'çılbır'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Altın Sarısı Kahvaltı',
  },
  {
    keywords: ['tavuk', 'chicken', 'kanat', 'but', 'göğüs', 'şinitzel', 'fajita'],
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Mühürlü & Sulu Doku',
  },
  {
    keywords: ['köfte', 'kıyma', 'meatball', 'burger', 'dana', 'kuzu', 'biftek', 'steak'],
    url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Közde Karamelize',
  },
  {
    keywords: ['balık', 'somon', 'fish', 'levrek', 'çipura', 'ton', 'karides', 'seafood'],
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Taze Otlu Izgara',
  },
  {
    keywords: ['çorba', 'soup', 'bulyon', 'kremalı', 'mercimek', 'broth'],
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'İpeksi Şifa Kasesi',
  },
  {
    keywords: ['salata', 'salad', 'yeşillik', 'roka', 'kinoa', 'bowl', 'avokado', 'fit'],
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Canlı & Taze Kase',
  },
  {
    keywords: ['mücver', 'sebze', 'fırın sebze', 'kabak', 'patlıcan', 'karnabahar', 'brokoli', 'biber'],
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Çıtır Çiftlik Harmanı',
  },
  {
    keywords: ['tatlı', 'kek', 'muffin', 'pancake', 'meyve', 'parfe', 'yoğurt tatlısı', 'dessert'],
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Rafine Şekersiz Şef Tatlısı',
  },
  {
    keywords: ['smoothie', 'içecek', 'detox', 'juice', 'shake', 'yeşil içecek'],
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Buzlu Bio-Detoks',
  },
  {
    keywords: ['airfryer', 'patates', 'cips', 'çıtır', 'roast', 'baking'],
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&auto=format&fit=crop&q=85',
    presentationTag: 'Hava Sirkülasyonlu Çıtır',
  },
];

const FALLBACK_CULINARY_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&auto=format&fit=crop&q=85',
];

/**
 * Deterministically matches or generates the best culinary visual for a recipe
 */
export function getRecipeCulinaryVisual(title: string, ingredients: string[] = [], category?: string): {
  imageUrl: string;
  presentationTag: string;
} {
  const queryStr = `${title} ${ingredients.join(' ')} ${category || ''}`.toLowerCase();

  for (const preset of CULINARY_VISUAL_REGISTRY) {
    if (preset.keywords.some((kw) => queryStr.includes(kw.toLowerCase()))) {
      return {
        imageUrl: preset.url,
        presentationTag: preset.presentationTag,
      };
    }
  }

  // Fallback hash
  let hash = 0;
  for (let i = 0; i < queryStr.length; i++) {
    hash = (hash << 5) - hash + queryStr.charCodeAt(i);
    hash |= 0;
  }
  const fallbackIndex = Math.abs(hash) % FALLBACK_CULINARY_IMAGES.length;

  return {
    imageUrl: FALLBACK_CULINARY_IMAGES[fallbackIndex],
    presentationTag: 'Şefin Özel Sunumu',
  };
}
