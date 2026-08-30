'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Flame,
  Users,
  CheckCircle2,
  ChefHat,
  Wind,
  Zap,
  HeartPulse,
  BookOpen,
  Info,
  RefreshCw,
  Utensils,
  ChevronDown,
  ChevronUp,
  Award,
  Maximize2,
  Timer,
  Play,
  Square,
  RotateCcw,
  ShieldCheck,
  Moon,
  Activity,
  Wheat,
  Share2,
  Layers,
  Leaf,
  Heart,
  Star,
  Volume2,
} from 'lucide-react';
import { Recipe, Ingredient, MealCategory, MetabolicGoal } from '@/lib/types';
import confetti from 'canvas-confetti';
import { playKitchenSound } from '@/lib/sound';
import { getRecipeCulinaryVisual } from '@/lib/recipeVisuals';
import { RecipeDetailModal } from './RecipeDetailModal';
import { CookedChecklistModal } from './CookedChecklistModal';
import { ttsEngine, TTSState } from '@/lib/tts';

interface MealsTabProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onGenerateRecipes: (
    category: MealCategory,
    servings: number,
    customPrompt: string,
    metabolicGoal?: MetabolicGoal,
    isLeftoverMode?: boolean,
    leftoverItems?: string[],
    emergencyRescue?: boolean
  ) => Promise<void>;
  onCookRecipe: (recipe: Recipe) => void;
  onOpenTimer: (minutes: number, label: string) => void;
  onShareToCommunity?: (recipe: Recipe) => void;
  onToggleFavoriteRecipe?: (recipeId: string) => void;
  isGenerating: boolean;
  soundEnabled: boolean;
}

const MEAL_FILTERS: { id: MealCategory; label: string; icon: string; desc: string }[] = [
  { id: 'kahvalti', label: 'Kahvaltılık', icon: '🍳', desc: 'Enerjik & proteinli sabahlar' },
  { id: 'hizli_yemek', label: 'Hızlı & Pratik (<15 dk)', icon: '⚡', desc: 'Acil durum kurtarıcıları' },
  { id: 'ana_yemek', label: 'Ana Yemek', icon: '🍲', desc: 'Doyurucu akşam öğünleri' },
  { id: 'fit_hafif', label: 'Fit & Düşük Kalori', icon: '🥗', desc: 'Yüksek protein, hafif sindirim' },
  { id: 'tatli', label: 'Şekersiz Tatlı & Atıştırmalık', icon: '🧁', desc: 'Meyve bazlı masum tatlar' },
  { id: 'icecek', label: 'İçecek & Smoothie', icon: '🥤', desc: 'Vitamin & elektrolit deposu' },
  { id: 'dunya_mutfagi', label: 'Dünya Mutfağı & Gurme', icon: '🌍', desc: 'İtalyan, Asya, Meksika dokunuşu' },
];

const METABOLIC_FILTERS: {
  id: MetabolicGoal;
  label: string;
  badge: string;
  icon: any;
  color: string;
  tagline: string;
}[] = [
  {
    id: 'tum',
    label: 'Tümü & Dengeli',
    badge: 'Dengeli',
    icon: Sparkles,
    color: 'emerald',
    tagline: 'Genel sıfır israf besin dengesi',
  },
  {
    id: 'high_protein',
    label: 'Yüksek Protein & Kas',
    badge: 'Kas Onarımı',
    icon: Zap,
    color: 'rose',
    tagline: 'Leucin & amino asitlerce zengin',
  },
  {
    id: 'low_glycemic',
    label: 'İnsülin Dengesi & Düşük Glisemik',
    badge: 'Sabit Şeker',
    icon: Activity,
    color: 'teal',
    tagline: 'Kan şekerini dalgalandırmayan lif & yağ',
  },
  {
    id: 'microbiome',
    label: 'Mikrobiyota & Lif Deposu',
    badge: 'Bağırsak Dostu',
    icon: ShieldCheck,
    color: 'amber',
    tagline: 'Prebiyotik lifler & sindirim enzimleri',
  },
  {
    id: 'circadian',
    label: 'Sirkadiyen Akşam Yemeği',
    badge: 'Derin Uyku',
    icon: Moon,
    color: 'indigo',
    tagline: 'Melatonin sentezi & hafif sindirim',
  },
  {
    id: 'leftover_transform',
    label: 'Artıkları Dönüştür',
    badge: 'Gıda Restorasyonu',
    icon: RotateCcw,
    color: 'orange',
    tagline: 'Dünden kalanları gurme lezzete çevir',
  },
];

const LEFTOVER_PRESETS = [
  { name: 'Bayat Ekmek', hint: 'Çıtır Panzanella, kruton, bruschetta veya fırın tatlısı' },
  { name: 'Haşlanmış Pilav', hint: 'Arancini pirinç topları, Asya sebzeli tava pilavı' },
  { name: 'Haşlanmış Makarna', hint: 'Fırın makarna, omlet frittata veya çıtır makarna cipsi' },
  { name: 'Kalan Tavuk / Et', hint: 'Quesadilla, tavuklu salata veya gurme çorba' },
  { name: 'Sebze Sapları & Kabuklar', hint: 'Sıfır israf sebze bulyonu veya nefis mücver' },
  { name: 'Kalan Peynir Parçaları', hint: 'Fırında çıtır peynir dip sosu veya börek harcı' },
];

export function MealsTab({
  recipes,
  ingredients,
  onGenerateRecipes,
  onCookRecipe,
  onOpenTimer,
  onShareToCommunity,
  onToggleFavoriteRecipe,
  isGenerating,
  soundEnabled,
}: MealsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('ana_yemek');
  const [selectedMetabolic, setSelectedMetabolic] = useState<MetabolicGoal>('tum');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [servings, setServings] = useState<number>(2);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [expandedEquipment, setExpandedEquipment] = useState<Record<string, boolean>>({});
  const [detailedModalRecipe, setDetailedModalRecipe] = useState<Recipe | null>(null);
  const [cookedChecklistRecipe, setCookedChecklistRecipe] = useState<Recipe | null>(null);

  // TTS State
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentStepIndex: -1,
    totalSteps: 0,
    currentText: '',
  });
  const [activeVoiceRecipeId, setActiveVoiceRecipeId] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = ttsEngine.subscribe((st) => {
      setTtsState(st);
      if (!st.isPlaying) {
        setActiveVoiceRecipeId(null);
      }
    });
    return () => {
      unsub();
      ttsEngine.stop();
    };
  }, []);

  const handleToggleTTS = (recipe: Recipe) => {
    if (activeVoiceRecipeId === recipe.id && ttsState.isPlaying) {
      ttsEngine.stop();
      setActiveVoiceRecipeId(null);
      playKitchenSound('click', soundEnabled);
    } else {
      setActiveVoiceRecipeId(recipe.id);
      playKitchenSound('pop', soundEnabled);
      const ingredientsText = recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`).join(', ');
      ttsEngine.speakRecipe(recipe.title, recipe.steps, ingredientsText);
    }
  };

  // Leftover mode custom selections
  const [selectedLeftovers, setSelectedLeftovers] = useState<string[]>([]);
  const [customLeftoverText, setCustomLeftoverText] = useState<string>('');

  const toggleLeftoverSelection = (name: string) => {
    playKitchenSound('pop', soundEnabled);
    setSelectedLeftovers((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  // Trigger Recipe Generation
  const handleGenerate = async (emergencyRescue = false) => {
    playKitchenSound('click', soundEnabled);
    const isLeftover = selectedMetabolic === 'leftover_transform' || selectedLeftovers.length > 0;
    const combinedLeftovers = [
      ...selectedLeftovers,
      ...(customLeftoverText.trim() ? [customLeftoverText.trim()] : []),
    ];

    await onGenerateRecipes(
      selectedCategory,
      servings,
      customPrompt,
      selectedMetabolic,
      isLeftover,
      combinedLeftovers,
      emergencyRescue
    );
  };

  // Cook Recipe and Deduct
  const handleCook = (recipe: Recipe) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#f59e0b', '#3b82f6'],
      });
    } catch { /* empty */ }

    playKitchenSound('cook_success', soundEnabled);
    onCookRecipe(recipe);
  };

  const toggleEquipment = (recipeId: string) => {
    setExpandedEquipment((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  const favoriteCount = recipes.filter((r) => r.isFavorite).length;

  // Filter recipes according to active metabolic & favorite filters
  const displayedRecipes = recipes.filter((r) => {
    if (showFavoritesOnly && !r.isFavorite) return false;
    if (selectedMetabolic === 'tum') return true;
    if (selectedMetabolic === 'leftover_transform') return r.isLeftoverRecipe || r.metabolicFocus === 'leftover_transform';
    return r.metabolicFocus === selectedMetabolic;
  });

  const priorityIngredients = ingredients.filter((i) => i.isPriority || (i.daysUntilExpiry && i.daysUntilExpiry <= 3));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Main Generator & Filter Deck */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Header Title and Urgent Ingredients Alert */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100">Sıfır İsraf Akıllı Tarif Stüdyosu</h2>
                <p className="text-xs text-slate-400">
                  Dolaptaki <span className="text-emerald-400 font-semibold">{ingredients.length} çeşit malzeme</span> taranarak bilimsel & metabolik uyumlu menüler üretilir.
                </p>
              </div>
            </div>
          </div>

          {priorityIngredients.length > 0 && (
            <div className="px-3.5 py-2 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping shrink-0" />
              <div>
                <span className="font-bold text-rose-300">Kurtarılacak: </span>
                <span className="text-rose-200">{priorityIngredients.map((p) => p.name).slice(0, 3).join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Scientific Metabolic & Health Goals Filter Bar */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Metabolik Sağlık & Hedef Filtresi</span>
            </label>
            <span className="text-[11px] text-slate-400">Moleküler beslenme odaklı</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {METABOLIC_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isSelected = selectedMetabolic === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setSelectedMetabolic(filter.id);
                    playKitchenSound('pop', soundEnabled);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-slate-100 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {filter.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{filter.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{filter.tagline}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Leftover Transformer Module (When Selected or Toggleable) */}
        {selectedMetabolic === 'leftover_transform' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-950 to-amber-950/40 border border-orange-500/30 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-black text-orange-300 uppercase tracking-wider">
                  Akıllı Tersine Menü: Hangi Artıkları Dönüştürmek İstersiniz?
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">1-Tıkla Gurme Restorasyon</span>
            </div>

            {/* Leftover Preset Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {LEFTOVER_PRESETS.map((preset) => {
                const isPicked = selectedLeftovers.includes(preset.name);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => toggleLeftoverSelection(preset.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between gap-1 ${
                      isPicked
                        ? 'bg-orange-500/20 border-orange-500 text-orange-200 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold">{preset.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{preset.hint}</span>
                  </button>
                );
              })}
            </div>

            {/* Additional Leftover Input */}
            <div className="pt-1">
              <input
                type="text"
                value={customLeftoverText}
                onChange={(e) => setCustomLeftoverText(e.target.value)}
                placeholder="Başka bir artık yemek var mı? (Örn: 'Kalan mercimek çorbası', 'Haşlama brokoli sapları')..."
                className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        )}

        {/* 4. Meal Category Filter Deck */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Öğün Türü Seçin
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {MEAL_FILTERS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    playKitchenSound('pop', soundEnabled);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-slate-100 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{cat.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Servings & Custom Prompt & Generation Trigger */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-800">
          
          {/* Servings counter */}
          <div className="md:col-span-4 flex items-center justify-between sm:justify-start gap-4 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Porsiyon:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setServings(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    servings === num
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Note input */}
          <div className="md:col-span-5">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Örn: 'Airfryer ile çıtır olsun', 'Acı baharatlı', 'Glutensiz'..."
              className="w-full h-full px-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Big Action Button */}
          <div className="md:col-span-3">
            <button
              type="button"
              disabled={isGenerating || ingredients.length === 0}
              onClick={() => handleGenerate(false)}
              className="w-full h-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tarif Tasarlanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedMetabolic === 'leftover_transform' ? 'Artıkları Gurme Yemeğe Dönüştür' : 'İsrafsız Tarif Üret'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Generated Recipes Stream */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Sıfır İsraf Tarifler</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-bold">
                {displayedRecipes.length} Seçenek
              </span>
            </h3>

            {/* ⭐ Favorilerim Filter Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowFavoritesOnly((prev) => !prev);
                playKitchenSound('pop', soundEnabled);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showFavoritesOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/40'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-slate-950 text-slate-950' : 'text-amber-400 fill-amber-400/30'}`} />
              <span>⭐ Favori Tariflerim ({favoriteCount})</span>
            </button>

            {selectedMetabolic !== 'tum' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold">
                Filtre: {METABOLIC_FILTERS.find((f) => f.id === selectedMetabolic)?.label}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            Pişirdiğinizde kullanılan malzemeler otomatik Mutfağım&apos;dan düşer.
          </span>
        </div>

        {displayedRecipes.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/80 mx-auto flex items-center justify-center text-slate-300 shadow-inner">
              <ChefHat className="w-7 h-7 text-emerald-400" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">
                {showFavoritesOnly
                  ? 'Henüz favori tarif eklenmedi ⭐'
                  : selectedMetabolic !== 'tum'
                  ? `"${METABOLIC_FILTERS.find((f) => f.id === selectedMetabolic)?.label}" İçin Henüz Tarif Yok`
                  : 'Bu kriterlere uygun tarif bulunamadı'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {showFavoritesOnly
                  ? 'Beğendiğiniz tariflerin sağ üst köşesindeki ⭐ yıldız ikonuna basarak favorilerinize ekleyebilirsiniz.'
                  : selectedMetabolic !== 'tum'
                  ? `Mutfaktaki malzemelerinizle doğrudan ${METABOLIC_FILTERS.find((f) => f.id === selectedMetabolic)?.label} hedefine optimize edilmiş özel bir menü tasarlayabiliriz.`
                  : 'Yukarıdaki "İsrafsız Tarif Üret" butonuna basarak mutfaktaki malzemelere uygun yeni tarifler üretebilirsiniz.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {showFavoritesOnly ? (
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Tüm Tariflere Dön
                </button>
              ) : selectedMetabolic !== 'tum' ? (
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate(false)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{METABOLIC_FILTERS.find((f) => f.id === selectedMetabolic)?.label} Menüsü Hazırlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>{METABOLIC_FILTERS.find((f) => f.id === selectedMetabolic)?.label} Hedefine Uygun Tarif Üret ⚡</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate(false)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Tarifler Üretiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Şimdi Yeni Tarif Üret</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedRecipes.map((recipe) => {
              const isCooked = recipe.isCooked;
              const isEquipmentOpen = expandedEquipment[recipe.id] ?? false;

              return (
                <div
                  key={recipe.id}
                  className={`group relative bg-slate-900/95 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                    isCooked
                      ? 'border-emerald-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20'
                      : 'border-slate-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5'
                  }`}
                >
                  <div>
                    {/* Visual Image Banner & Overlaid Tags */}
                    {(() => {
                      const visualInfo = getRecipeCulinaryVisual(
                        recipe.title,
                        recipe.ingredients.map((i) => i.name),
                        recipe.category
                      );
                      const displayImg = recipe.imageUrl || visualInfo.imageUrl;
                      const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
                      const isQuickMeal = totalTime <= 15;

                      return (
                        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
                          <img
                            src={displayImg}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                          {/* Top Badges & Interactive Favorite Button */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                            <div className="flex items-center gap-1.5 flex-wrap pointer-events-none">
                              <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-xl bg-slate-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-sm">
                                {recipe.difficulty}
                              </span>
                              
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                                👨‍🍳 {visualInfo.presentationTag}
                              </span>

                              {isQuickMeal && (
                                <span className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                                  <Zap className="w-3 h-3 text-emerald-400" /> 15 Dk Hızlı
                                </span>
                              )}

                              {recipe.isLeftoverRecipe && (
                                <span className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-orange-950/90 backdrop-blur-md text-orange-300 border border-orange-500/40 flex items-center gap-1 shadow-sm">
                                  <RotateCcw className="w-3 h-3 text-orange-400" /> Artık Dönüştürücü
                                </span>
                              )}

                              {recipe.metabolicFocus && recipe.metabolicFocus !== 'tum' && (
                                <span className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-teal-950/90 backdrop-blur-md text-teal-300 border border-teal-500/40 flex items-center gap-1 shadow-sm">
                                  <Activity className="w-3 h-3 text-teal-400" />
                                  {METABOLIC_FILTERS.find((f) => f.id === recipe.metabolicFocus)?.badge || 'Metabolik'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isCooked ? (
                                <span className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
                                  <CheckCircle2 className="w-3 h-3" /> Pişirildi
                                </span>
                              ) : (
                                <span className="hidden sm:flex px-2.5 py-1 text-[10px] font-bold rounded-xl bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 items-center gap-1 shadow-sm">
                                  <Leaf className="w-3 h-3 text-emerald-400" /> Sıfır İsraf
                                </span>
                              )}

                              {onToggleFavoriteRecipe && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavoriteRecipe(recipe.id);
                                    playKitchenSound(recipe.isFavorite ? 'pop' : 'badge_unlock', soundEnabled);
                                  }}
                                  className={`p-2 rounded-xl backdrop-blur-md border transition-all hover:scale-110 active:scale-95 shadow-md flex items-center justify-center ${
                                    recipe.isFavorite
                                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40'
                                      : 'bg-slate-950/85 text-slate-300 hover:text-amber-300 border-slate-700/80 hover:border-amber-400/50'
                                  }`}
                                  title={recipe.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${recipe.isFavorite ? 'fill-slate-950 text-slate-950' : 'text-slate-300'}`} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Bottom Title on Image */}
                          <div className="absolute bottom-3 left-4 right-4">
                            <h4 className="text-base sm:text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-emerald-300 transition-colors line-clamp-1">
                              {recipe.title}
                            </h4>
                            {recipe.subtitle && (
                              <p className="text-[11px] text-slate-200 drop-shadow line-clamp-1 mt-0.5">
                                {recipe.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Card Content Body */}
                    <div className="p-5 space-y-4">
                      
                      {/* Time & Macros Bar (Icon & Value Based, No Text Wall) */}
                      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                        <div className="py-1">
                          <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-emerald-400" /> Süre
                          </div>
                          <div className="text-xs font-black text-slate-200 mt-0.5">
                            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} dk
                          </div>
                        </div>
                        <div className="py-1 border-l border-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                            <Flame className="w-2.5 h-2.5 text-amber-400" /> Kalori
                          </div>
                          <div className="text-xs font-black text-amber-400 mt-0.5">
                            {recipe.macros.calories} kcal
                          </div>
                        </div>
                        <div className="py-1 border-l border-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Protein
                          </div>
                          <div className="text-xs font-black text-emerald-400 mt-0.5">
                            {recipe.macros.proteinGrams}g
                          </div>
                        </div>
                        <div className="py-1 border-l border-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                            <HeartPulse className="w-2.5 h-2.5 text-cyan-400" /> Karb
                          </div>
                          <div className="text-xs font-black text-cyan-400 mt-0.5">
                            {recipe.macros.carbsGrams}g
                          </div>
                        </div>
                      </div>

                      {/* Compact Ingredients Chips */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Kullanılan Stoklar:
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {recipe.ingredients.length} Malzeme
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.8 text-[11px] rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{ing.name}</span>
                              <span className="text-slate-500 text-[10px]">
                                ({ing.amount} {ing.unit})
                              </span>
                            </span>
                          ))}
                          {recipe.ingredients.length > 4 && (
                            <span className="px-2 py-0.8 text-[10px] rounded-lg bg-slate-800/60 text-slate-400 border border-slate-700">
                              +{recipe.ingredients.length - 4} diğer
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Accordion Quick Preview for Airfryer & Scientific Bio-Tip */}
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleEquipment(recipe.id)}
                          className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-slate-300 hover:text-emerald-300 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Airfryer vs. Fırın & Biyo-Hap Bilgi</span>
                          </div>
                          {isEquipmentOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        {isEquipmentOpen && (
                          <div className="p-3 border-t border-slate-800/60 space-y-2.5 text-xs animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Airfryer ({recipe.airfryerVsOven.airfryer.timeMinutes} dk)
                                </span>
                                <p className="text-[10px] text-slate-300 mt-1 leading-tight">
                                  {recipe.airfryerVsOven.airfryer.healthBenefits}
                                </p>
                              </div>

                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="font-bold text-amber-400 flex items-center gap-1">
                                  <Flame className="w-3 h-3" /> Fırın ({recipe.airfryerVsOven.oven.timeMinutes} dk)
                                </span>
                                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                                  {recipe.airfryerVsOven.oven.healthBenefits}
                                </p>
                              </div>
                            </div>

                            {/* Scientific Bio Tip Box */}
                            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2">
                              <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-[11px] font-bold text-emerald-300">
                                  {recipe.scientificBioTip.title}
                                </div>
                                <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                                  {recipe.scientificBioTip.fact}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons Bar */}
                  <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    
                    {/* Left: TTS Voice Reader & Quick Cooking Timer */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTTS(recipe)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                          activeVoiceRecipeId === recipe.id && ttsState.isPlaying
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300'
                        }`}
                        title={activeVoiceRecipeId === recipe.id && ttsState.isPlaying ? 'Sesli okumayı durdur' : 'Tarifi sesli dinle'}
                      >
                        {activeVoiceRecipeId === recipe.id && ttsState.isPlaying ? (
                          <Square className="w-3.5 h-3.5 fill-slate-950" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{activeVoiceRecipeId === recipe.id && ttsState.isPlaying ? 'Durdur' : 'Sesli Dinle 🔊'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenTimer(recipe.cookTimeMinutes, recipe.title)}
                        className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                        title="Pişirme Sayacını ve Alarmı Başlat"
                      >
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>⏱️ {recipe.cookTimeMinutes} dk Alarm</span>
                      </button>
                    </div>

                    {/* Right Actions: Detail & Cook */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playKitchenSound('click', soundEnabled);
                          setDetailedModalRecipe(recipe);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Detay & Adımlar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playKitchenSound('pop', soundEnabled);
                          setCookedChecklistRecipe(recipe);
                        }}
                        disabled={isCooked}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
                          isCooked
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:scale-105'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>{isCooked ? 'Pişirildi ✓' : 'Pişirdim (Stok Onayı)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step-by-Step Interactive Recipe Detail Modal */}
      {detailedModalRecipe && (
        <RecipeDetailModal
          recipe={detailedModalRecipe}
          isOpen={!!detailedModalRecipe}
          onClose={() => setDetailedModalRecipe(null)}
          onCookRecipe={(rec) => {
            setDetailedModalRecipe(null);
            setCookedChecklistRecipe(rec);
          }}
          onOpenTimer={onOpenTimer}
          onShareToCommunity={onShareToCommunity}
          onToggleFavorite={(recipeId) => {
            if (onToggleFavoriteRecipe) {
              onToggleFavoriteRecipe(recipeId);
              setDetailedModalRecipe((prev) => (prev && prev.id === recipeId ? { ...prev, isFavorite: !prev.isFavorite } : prev));
            }
          }}
          ingredients={ingredients}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Interactive Cook Checklist Modal */}
      {cookedChecklistRecipe && (
        <CookedChecklistModal
          isOpen={!!cookedChecklistRecipe}
          onClose={() => setCookedChecklistRecipe(null)}
          recipe={cookedChecklistRecipe}
          pantryIngredients={ingredients}
          onConfirmCook={(rec, selected) => {
            onCookRecipe(rec);
            setCookedChecklistRecipe(null);
          }}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}
