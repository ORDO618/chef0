import { Ingredient, IngredientCategory } from './types';
import { predictIngredientAttributes } from './smartIngredientDetector';

export interface ParsedVoiceItem {
  name: string;
  category: IngredientCategory;
  amount: number;
  unit: Ingredient['unit'];
  daysUntilExpiry: number;
  isPriority: boolean;
}

/**
 * Intelligent client-side fallback parser for Turkish voice recognition sentences.
 * Correctly detects numbers, turkish quantity phrases ("yarım kilo", "3 bağ", "250 gram", "1 demet"),
 * separates comma/ve/ile joined items, and normalizes food names.
 */
export function parseTurkishVoiceTranscript(transcript: string): ParsedVoiceItem[] {
  if (!transcript || !transcript.trim()) return [];

  const normalized = transcript
    .toLowerCase()
    .replace(/[.,;!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split by common speech conjunctions: " ve ", " ile ", " ayrıca ", " bir de ", " virgülden sonra "
  const rawSegments = normalized
    .split(/\s+(?:ve|ile|ayrıca|bir de|sonra|daha sonra|ek olarak)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const results: ParsedVoiceItem[] = [];

  for (const segment of rawSegments) {
    let text = segment;
    let amount = 1;
    let unit: Ingredient['unit'] = 'adet';

    // 1. Check for compound fractions
    if (text.includes('yarım kilo') || text.includes('yarım kg')) {
      amount = 500;
      unit = 'gram';
      text = text.replace(/yarım\s+(?:kilo|kg)/g, '').trim();
    } else if (text.includes('çeyrek kilo') || text.includes('çeyrek kg')) {
      amount = 250;
      unit = 'gram';
      text = text.replace(/çeyrek\s+(?:kilo|kg)/g, '').trim();
    } else if (text.includes('yarım litre') || text.includes('yarım lt')) {
      amount = 500;
      unit = 'ml';
      text = text.replace(/yarım\s+(?:litre|lt)/g, '').trim();
    } else if (text.includes('yarım paket')) {
      amount = 0.5;
      unit = 'paket';
      text = text.replace(/yarım\s+paket/g, '').trim();
    } else if (text.startsWith('yarım ')) {
      amount = 0.5;
      unit = 'adet';
      text = text.replace(/^yarım\s+/, '').trim();
    } else if (text.startsWith('bir buçuk ') || text.startsWith('1.5 ') || text.startsWith('1,5 ')) {
      amount = 1.5;
      text = text.replace(/^(?:bir buçuk|1[.,]5)\s+/, '').trim();
    } else if (text.startsWith('iki buçuk ') || text.startsWith('2.5 ') || text.startsWith('2,5 ')) {
      amount = 2.5;
      text = text.replace(/^(?:iki buçuk|2[.,]5)\s+/, '').trim();
    }

    // 2. Check for numeric and unit matches
    // e.g. "500 gram kıyma", "2 kilo domates", "3 adet yumurta", "1 demet maydanoz", "2 paket makarna", "1 litre süt"
    const unitRegex = /^(\d+(?:[.,]\d+)?|\b(?:bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)\b)\s*(kilo|kg|gram|gr|g|litre|lt|l|ml|militre|adet|tane|paket|pkt|demet|bağ|koli|dilim|kaşık|bardak|kase)?\s*(.*)$/i;
    const match = text.match(unitRegex);

    if (match) {
      const numRaw = match[1];
      const unitRaw = match[2]?.toLowerCase();
      const rest = match[3]?.trim();

      if (rest) {
        text = rest;

        // Parse number
        const wordNumberMap: Record<string, number> = {
          bir: 1,
          iki: 2,
          üç: 3,
          dört: 4,
          beş: 5,
          altı: 6,
          yedi: 7,
          sekiz: 8,
          dokuz: 9,
          on: 10,
        };

        if (wordNumberMap[numRaw.toLowerCase()]) {
          amount = wordNumberMap[numRaw.toLowerCase()];
        } else {
          const parsedNum = parseFloat(numRaw.replace(',', '.'));
          if (!isNaN(parsedNum) && parsedNum > 0) {
            amount = parsedNum;
          }
        }

        // Parse unit
        if (unitRaw) {
          if (['kilo', 'kg'].includes(unitRaw)) {
            if (amount < 5) {
              unit = 'kg';
            } else {
              amount = amount * 1000;
              unit = 'gram';
            }
          } else if (['gram', 'gr', 'g'].includes(unitRaw)) {
            unit = 'gram';
          } else if (['litre', 'lt', 'l'].includes(unitRaw)) {
            unit = 'litre';
          } else if (['ml', 'militre'].includes(unitRaw)) {
            unit = 'ml';
          } else if (['paket', 'pkt'].includes(unitRaw)) {
            unit = 'paket';
          } else if (['demet', 'bağ'].includes(unitRaw)) {
            unit = 'adet';
          } else if (['koli'].includes(unitRaw)) {
            amount = amount * 30; // 1 koli yumurta
            unit = 'adet';
          } else {
            unit = 'adet';
          }
        }
      }
    }

    // Clean leading filler words
    text = text.replace(/^(?:biraz|taze|organik|ev yapımı|kalan|bayat)\s+/i, '').trim();
    if (!text) continue;

    // Use smart prediction for category and shelf life
    const pred = predictIngredientAttributes(text);

    // Capitalize first letter
    const capitalizedName = text.charAt(0).toUpperCase() + text.slice(1);

    results.push({
      name: capitalizedName,
      category: pred.category,
      amount: amount || pred.amount || 1,
      unit: unit || pred.unit || 'adet',
      daysUntilExpiry: pred.daysUntilExpiry || 5,
      isPriority: pred.isPriority || (pred.daysUntilExpiry || 5) <= 3,
    });
  }

  // If no structured parts could be segmented, fallback to single item prediction
  if (results.length === 0 && transcript.trim()) {
    const clean = transcript.trim();
    const pred = predictIngredientAttributes(clean);
    results.push({
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      category: pred.category,
      amount: pred.amount || 1,
      unit: pred.unit || 'adet',
      daysUntilExpiry: pred.daysUntilExpiry || 5,
      isPriority: pred.isPriority,
    });
  }

  return results;
}
