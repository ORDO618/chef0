import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-custom-gemini-key') || undefined;
    const body = await req.json();
    const { action } = body;

    const ai = getGeminiClient(customApiKey);

    if (action === 'analyze_image') {
      const { imageBase64, mimeType = 'image/jpeg' } = body;
      if (!imageBase64) {
        return NextResponse.json({ error: 'Görsel verisi bulunamadı.' }, { status: 400 });
      }

      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `Sen "ŞefSıfır / KitchZero" adlı sıfır israf mutfak asistanının yapay zeka vizyon modülüsün.
Kullanıcının yüklediği buzdolabı, kiler veya mutfak tezgahı fotoğrafındaki tüm yiyecekleri, sebzeleri, meyveleri, içecekleri, süt ürünlerini, etleri ve baharatları tespit et.

Her tespit edilen malzeme için:
- "name": Türkçe anlaşılır ürün adı (Örn: "Domates", "Yumurta", "Kaşar Peyniri", "Yoğurt", "Yeşil Biber")
- "category": Bunlardan biri olmalı -> "sebze_meyve" | "et_tavuk_balik" | "sut_kahvaltilik" | "kuru_gida" | "baharat_sos" | "icecek" | "diger"
- "amount": Tahmini sayı veya miktar (örn: 3, 500, 1)
- "unit": "adet" | "gram" | "kg" | "ml" | "litre" | "paket"
- "daysUntilExpiry": Bozulma riski tahmini gün sayısı (Örn: açılmış domates 2 gün, yumurta 14 gün, yeşillik 3 gün)
- "isPriority": Eğer 3 gün veya daha az süresi kaldıysa true (israfı önlemek için acil tüketilmeli)
- "notes": Kısa durum notu (Örn: "Olgunlaşmış", "Taze")

Lütfen JSON formatında geçerli bir liste döndür.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    daysUntilExpiry: { type: Type.NUMBER },
                    isPriority: { type: Type.BOOLEAN },
                    notes: { type: Type.STRING },
                  },
                  required: ['name', 'category', 'amount', 'unit'],
                },
              },
              summaryMessage: { type: Type.STRING },
            },
            required: ['detectedIngredients'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return NextResponse.json(parsed);
    }

    if (action === 'generate_recipes') {
      const {
        ingredients,
        category = 'hepsi',
        servings = 2,
        customPrompt = '',
        metabolicGoal = 'tum',
        isLeftoverMode = false,
        leftoverItems = [],
        emergencyRescue = false,
      } = body;

      const pantryListStr = Array.isArray(ingredients)
        ? ingredients.map((i: any) => `- ${i.name} (${i.amount} ${i.unit || 'adet'}) [Öncelik/SKT: ${i.daysUntilExpiry ? i.daysUntilExpiry + ' gün kaldı' : (i.isPriority ? 'Acil Tüketilmeli' : 'Normal')}]`).join('\n')
        : 'Mutfakta temel malzemeler mevcut.';

      let metabolicInstruction = '';
      if (metabolicGoal === 'high_protein') {
        metabolicInstruction = 'ÖZEL HEDEF: Yüksek Protein & Kas Yapılanması. Leucin ve esansiyel amino asitlerce zengin, tok tutan, kas onarımını hızlandıran kombinasyonlar oluştur.';
      } else if (metabolicGoal === 'low_glycemic') {
        metabolicInstruction = 'ÖZEL HEDEF: İnsülin Dengesi & Düşük Glisemik Yük. Kan şekerini fırlatmayan, sağlıklı yağ ve lif içeren, glisemik indeksi düşük kombinasyonlar oluştur.';
      } else if (metabolicGoal === 'microbiome') {
        metabolicInstruction = 'ÖZEL HEDEF: Mikrobiyota & Bağırsak Sağlığı & Lif Deposu. Prebiyotik lifler (beta-glukan, inülin, rezistan nişasta) ve sindirim enzimlerini destekleyen zengin içerikler kullan.';
      } else if (metabolicGoal === 'circadian') {
        metabolicInstruction = 'ÖZEL HEDEF: Sirkadiyen Akşam Yemeği & Derin Uyku. Sindirimi yormayan, triptofan/magnezyum/B6 açısından zengin, melatonin sentezini artıran hafif akşam öğünleri oluştur.';
      } else if (metabolicGoal === 'leftover_transform' || isLeftoverMode) {
        metabolicInstruction = `ÖZEL HEDEF: ARTIKLARI DÖNÜŞTÜR (Leftover Transformer). Kullanıcının dünden kalan veya bayatlayan malzemelerini (Örn: ${leftoverItems.length > 0 ? leftoverItems.join(', ') : 'Bayat ekmek, haşlanmış pilav/makarna, dünden kalan tavuk/sebze'}) gurme, sıfır israf bir restorasyon lezzetine çevir.`;
      }

      const emergencyInstruction = emergencyRescue
        ? '🚨 ACİL İSRAF KURTARMA MODU AKTİF: Bozulma riski olan en acil malzemeleri kullanarak 15 dakikayı aşmayan ultra hızlı ve pratik bir kurtarma menüsü üret.'
        : '';

      const systemPrompt = `Sen "ŞefSıfır / KitchZero" profesyonel baş aşçısı ve moleküler beslenme biyoloğusun.
Amacın: Kullanıcının mutfağında mevcut olan malzemeleri MAKSİMUM verimle kullanarak, HİÇBİR ŞEYİ ÇÖPE ATTIRMADAN sıfır israf tarifler üretmek.

Kullanıcının Seçtiği Kategori: ${category}
Kişi Sayısı: ${servings}
Metabolik Hedef: ${metabolicGoal}
${metabolicInstruction}
${emergencyInstruction}
Özel İstek/Not: ${customPrompt || 'Yok'}

Kullanıcının Dolabındaki Malzemeler:
${pantryListStr}

Kurallar:
1. Özellikle "Acil Tüketilmeli / Öncelikli" veya SKT'si az kalmış malzemeleri ana malzeme olarak kullanarak israfı engelle.
2. Sadece mutfakta bulunan malzemeleri veya her evde bulunan su/tuz gibi temel öğeleri kullan.
3. Her tarif için Airfryer vs. Fırın vs. Ocak karşılaştırması hazırla (süre, enerji tasarrufu ve sağlık/yağ farkı).
4. Her tarif için bilimsel olarak kanıtlanmış bir "Biyo-Hap Bilgi" (Scientific Bio-Tip) ekle (Örn: likopenin yağla emilimi, sindirim enzimleri, mikrobiyota, protein biyoyararlanımı, sirkadiyen triptofan dönüşümü).
5. Kullanılan malzemelerin miktarını tam olarak belirt ki "Pişirdim" tıklandığında stoktan düşürülebilsin.
6. 2 adet harika ve birbirinden farklı tarif üret.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    category: { type: Type.STRING },
                    prepTimeMinutes: { type: Type.NUMBER },
                    cookTimeMinutes: { type: Type.NUMBER },
                    servings: { type: Type.NUMBER },
                    difficulty: { type: Type.STRING },
                    ingredients: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          amount: { type: Type.NUMBER },
                          unit: { type: Type.STRING },
                          inStock: { type: Type.BOOLEAN },
                        },
                        required: ['name', 'amount', 'unit', 'inStock'],
                      },
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    airfryerVsOven: {
                      type: Type.OBJECT,
                      properties: {
                        airfryer: {
                          type: Type.OBJECT,
                          properties: {
                            equipment: { type: Type.STRING },
                            timeMinutes: { type: Type.NUMBER },
                            temperature: { type: Type.STRING },
                            healthBenefits: { type: Type.STRING },
                            oilUsagePercent: { type: Type.NUMBER },
                            energySavingNote: { type: Type.STRING },
                          },
                          required: ['equipment', 'timeMinutes', 'healthBenefits', 'oilUsagePercent', 'energySavingNote'],
                        },
                        oven: {
                          type: Type.OBJECT,
                          properties: {
                            equipment: { type: Type.STRING },
                            timeMinutes: { type: Type.NUMBER },
                            temperature: { type: Type.STRING },
                            healthBenefits: { type: Type.STRING },
                            oilUsagePercent: { type: Type.NUMBER },
                            energySavingNote: { type: Type.STRING },
                          },
                          required: ['equipment', 'timeMinutes', 'healthBenefits', 'oilUsagePercent', 'energySavingNote'],
                        },
                        recommendation: { type: Type.STRING },
                      },
                      required: ['airfryer', 'oven', 'recommendation'],
                    },
                    scientificBioTip: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        fact: { type: Type.STRING },
                        macroFocus: { type: Type.STRING },
                      },
                      required: ['title', 'fact', 'macroFocus'],
                    },
                    macros: {
                      type: Type.OBJECT,
                      properties: {
                        calories: { type: Type.NUMBER },
                        proteinGrams: { type: Type.NUMBER },
                        carbsGrams: { type: Type.NUMBER },
                        fatGrams: { type: Type.NUMBER },
                        fiberGrams: { type: Type.NUMBER },
                      },
                      required: ['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
                    },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    metabolicFocus: { type: Type.STRING },
                    isLeftoverRecipe: { type: Type.BOOLEAN },
                    leftoverBase: { type: Type.STRING },
                  },
                  required: ['title', 'prepTimeMinutes', 'cookTimeMinutes', 'ingredients', 'steps', 'airfryerVsOven', 'scientificBioTip', 'macros'],
                },
              },
            },
            required: ['recipes'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return NextResponse.json(parsed);
    }

    if (action === 'analyze_missing_1') {
      const { ingredients } = body;
      const pantryListStr = Array.isArray(ingredients)
        ? ingredients.map((i: any) => `- ${i.name} (${i.amount} ${i.unit || 'adet'})`).join('\n')
        : 'Temel malzemeler mevcut.';

      const prompt = `Sen "ŞefSıfır" akıllı mutfak ve pazar asistanısın.
Kullanıcının mevcut mutfak envanterini analiz et:
${pantryListStr}

"Missing-1 Ingredient" (Sadece 1 Eksik Malzeme ile Neler Yapabilirsin?) stratejisini uygula.
Kullanıcının dolabına sadece TEK BİR yeni malzeme eklendiğinde açılabilecek en çarpıcı, lezzetli ve çok sayıda yeni tarifin kilidini açan 3 farklı eksik malzeme önerisi üret.

Her öneri için:
- missingIngredientName: Örn: "Krema (200ml)", "Limon", "Mantar (300g)", "Kuru Soğan"
- missingIngredientCategory: "sebze_meyve" | "et_tavuk_balik" | "sut_kahvaltilik" | "kuru_gida" | "baharat_sos"
- unlocksRecipeTitle: Bu malzeme gelince yapılabilecek ana yıldız yemeğin adı
- prepTimeMinutes: Hazırlık süresi
- recipeDescription: Yemeğin ve sinerjinin çekici açıklaması
- whyThisItem: Neden bu malzeme seçildi (mevcut malzemelerle nasıl eşleşiyor)
- estimatedPriceTl: Tahmini yaklaşık market fiyatı (örn: "35 ₺")
- additionalRecipesCount: Bu malzemeyle açılabilecek toplam tarif sayısı (örn: 5)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    missingIngredientName: { type: Type.STRING },
                    missingIngredientCategory: { type: Type.STRING },
                    unlocksRecipeTitle: { type: Type.STRING },
                    prepTimeMinutes: { type: Type.NUMBER },
                    recipeDescription: { type: Type.STRING },
                    whyThisItem: { type: Type.STRING },
                    estimatedPriceTl: { type: Type.STRING },
                    additionalRecipesCount: { type: Type.NUMBER },
                  },
                  required: ['missingIngredientName', 'unlocksRecipeTitle', 'recipeDescription', 'whyThisItem'],
                },
              },
            },
            required: ['suggestions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return NextResponse.json(parsed);
    }

    if (action === 'voice_parse') {
      const { transcript } = body;
      if (!transcript) {
        return NextResponse.json({ error: 'Metin bulunamadı.' }, { status: 400 });
      }

      const prompt = `Kullanıcı mutfağındaki malzemeleri sesli olarak şöyle anlattı:
"${transcript}"

Bu cümleden tüm malzeme isimlerini, miktarlarını, birimlerini, kategorilerini ve tahmini tazelik gün sayılarını ayıkla.
Türkçe sözlü ifadelere dikkat et:
- "yarım kilo" -> amount: 500, unit: "gram"
- "çeyrek kilo" -> amount: 250, unit: "gram"
- "1 kilo" -> amount: 1000, unit: "gram" veya 1 kg
- "3 tane / 3 adet" -> amount: 3, unit: "adet"
- "2 bağ / demet" -> amount: 2, unit: "adet"
- "1 koli yumurta" -> amount: 30, unit: "adet"
- "1 paket makarna" -> amount: 1, unit: "paket"
- "bir şişe süt" -> amount: 1, unit: "litre"

Kategori şunlardan biri olmalı: "sebze_meyve" | "et_tavuk_balik" | "sut_kahvaltilik" | "kuru_gida" | "baharat_sos" | "icecek" | "diger"
Tazelik (daysUntilExpiry): Et/balık/kıyma için 2-3 gün, yeşillik/domates için 3-5 gün, süt/yoğurt için 7-10 gün, bakliyat/baharat için 90-180 gün.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              parsedIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    daysUntilExpiry: { type: Type.NUMBER },
                  },
                  required: ['name', 'category', 'amount', 'unit'],
                },
              },
            },
            required: ['parsedIngredients'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Geçersiz eylem' }, { status: 400 });
  } catch (error: any) {
    console.error('Kitchen API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Yapay zeka asistanına bağlanırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
