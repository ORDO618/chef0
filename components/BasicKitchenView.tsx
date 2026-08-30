'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Camera,
  Mic,
  Plus,
  Trash2,
  Minus,
  ChefHat,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  Search,
  CheckCircle2,
  Apple,
  Drumstick,
  Milk,
  Wheat,
  Flame,
  Coffee,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { Ingredient, Recipe, MealCategory, IngredientCategory } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';
import { ttsEngine, TTSState } from '@/lib/tts';
import { QuickPantryModal } from './QuickPantryModal';
import { RecipeDetailModal } from './RecipeDetailModal';
import { CookedChecklistModal } from './CookedChecklistModal';
import { getRecipeCulinaryVisual } from '@/lib/recipeVisuals';

interface BasicKitchenViewProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onAddIngredient: (item: Omit<Ingredient, 'id' | 'addedAt'>) => void;
  onAddMultipleIngredients: (items: Omit<Ingredient, 'id' | 'addedAt'>[]) => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateAmount: (id: string, delta: number) => void;
  onLoadPreset: (items: any[]) => void;
  onGenerateRecipes: (category: MealCategory, servings: number, prompt: string) => Promise<void>;
  onCookRecipeWithChecklist: (recipe: Recipe, selectedIngredients: { name: string; amount: number; unit: string }[]) => void;
  onToggleFavoriteRecipe?: (recipeId: string) => void;
  onOpenTimer: (minutes: number, label: string) => void;
  isGenerating: boolean;
  customApiKey: string;
  soundEnabled: boolean;
  onToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const CATEGORY_ICONS: Record<IngredientCategory, { label: string; icon: any; color: string }> = {
  sebze_meyve: { label: 'Sebze', icon: Apple, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
  et_tavuk_balik: { label: 'Et/Balık', icon: Drumstick, color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' },
  sut_kahvaltilik: { label: 'Kahvaltılık', icon: Milk, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
  kuru_gida: { label: 'Kuru Gıda', icon: Wheat, color: 'text-yellow-500 bg-yellow-950/40 border-yellow-500/30' },
  baharat_sos: { label: 'Baharat', icon: Flame, color: 'text-orange-400 bg-orange-950/40 border-orange-500/30' },
  icecek: { label: 'İçecek', icon: Coffee, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
  diger: { label: 'Diğer', icon: HelpCircle, color: 'text-slate-400 bg-slate-900 border-slate-700' },
};

const BASIC_MEAL_TYPES: { id: MealCategory; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'kahvalti', label: 'Kahvaltılık', icon: '🍳', desc: 'Hızlı & Enerjik', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300' },
  { id: 'ana_yemek', label: 'Pratik Ana Yemek', icon: '🍲', desc: 'Doyurucu & Sıfır İsraf', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300' },
  { id: 'fit_hafif', label: 'Aperatif / Hafif', icon: '🥗', desc: 'Fit & Düşük Kalori', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300' },
];

export function BasicKitchenView({
  ingredients,
  recipes,
  onAddIngredient,
  onAddMultipleIngredients,
  onRemoveIngredient,
  onUpdateAmount,
  onLoadPreset,
  onGenerateRecipes,
  onCookRecipeWithChecklist,
  onToggleFavoriteRecipe,
  onOpenTimer,
  isGenerating,
  customApiKey,
  soundEnabled,
  onToast,
}: BasicKitchenViewProps) {
  // Input Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialTab, setAddModalInitialTab] = useState<'voice' | 'camera' | 'text'>('voice');

  // Selected Recipe Modals
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [selectedRecipeForCook, setSelectedRecipeForCook] = useState<Recipe | null>(null);

  // Active meal filter / tab
  const [activeMealCategory, setActiveMealCategory] = useState<MealCategory>('ana_yemek');
  const [searchQuery, setSearchQuery] = useState('');

  // TTS State
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentStepIndex: -1,
    totalSteps: 0,
    currentText: '',
  });
  const [activeVoiceRecipeId, setActiveVoiceRecipeId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ttsEngine.subscribe((state) => {
      setTtsState(state);
      if (!state.isPlaying) {
        setActiveVoiceRecipeId(null);
      }
    });
    return () => {
      unsub();
      ttsEngine.stop();
    };
  }, []);

  const openInputModal = (tab: 'voice' | 'camera' | 'text') => {
    setAddModalInitialTab(tab);
    setIsAddModalOpen(true);
    playKitchenSound('click', soundEnabled);
  };

  const handleStepAmount = (item: Ingredient, delta: number) => {
    onUpdateAmount(item.id, delta);
    playKitchenSound(delta > 0 ? 'pop' : 'click', soundEnabled);
    const nextAmount = Math.max(0, item.amount + delta);
    if (nextAmount === 0) {
      onToast(`"${item.name}" tükendi ve kilerden kaldırıldı.`, 'info');
    }
  };

  const handleQuickMealClick = async (cat: MealCategory) => {
    setActiveMealCategory(cat);
    playKitchenSound('click', soundEnabled);
    if (ingredients.length === 0) {
      onToast('Dolabınızda henüz malzeme yok! Lütfen yukarıdaki butonlardan malzeme ekleyin.', 'info');
      return;
    }
    await onGenerateRecipes(cat, 2, '');
  };

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
      onToast(`🔊 "${recipe.title}" sesli okunuyor...`, 'info');
    }
  };

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return ingredients;
    return ingredients.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [ingredients, searchQuery]);

  // Filtered recipes matching selected category
  const categoryRecipes = useMemo(() => {
    const matched = recipes.filter((r) => {
      if (activeMealCategory === 'kahvalti') return r.category === 'kahvalti';
      if (activeMealCategory === 'fit_hafif') return r.category === 'fit_hafif' || r.category === 'hizli_yemek';
      return r.category === 'ana_yemek' || r.category === 'dunya_mutfagi';
    });
    return matched.length > 0 ? matched : recipes;
  }, [recipes, activeMealCategory]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* 1. TOP BAR: 3 Large 48px+ Thumb-Friendly Action Buttons */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-extrabold text-slate-200 tracking-tight">
              Hızlı Mutfak Girişi (Tek Dokunuş)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
            Basic Mod
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Button 1: Fotoğraf Çek */}
          <button
            type="button"
            onClick={() => openInputModal('camera')}
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-500/15 to-emerald-950/40 hover:from-emerald-500/25 hover:to-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-md group min-h-[72px]"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-black text-slate-100">Fotoğraf Çek</span>
            <span className="text-[10px] text-emerald-400/80 hidden sm:inline">AI ile Tara</span>
          </button>

          {/* Button 2: Sesle Söyle */}
          <button
            type="button"
            onClick={() => openInputModal('voice')}
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-teal-500/15 to-teal-950/40 hover:from-teal-500/25 hover:to-teal-950/60 border border-teal-500/40 hover:border-teal-400 text-teal-300 transition-all hover:scale-105 active:scale-95 shadow-md group min-h-[72px]"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-xs font-black text-slate-100">Sesle Söyle</span>
            <span className="text-[10px] text-teal-400/80 hidden sm:inline">Türkçe Tanıma</span>
          </button>

          {/* Button 3: Hızlı Ekle */}
          <button
            type="button"
            onClick={() => openInputModal('text')}
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 hover:from-slate-700/90 hover:to-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-md group min-h-[72px]"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-xs font-black text-slate-100">Hızlı Ekle</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Akıllı Klavye</span>
          </button>
        </div>
      </div>

      {/* 2. MIDDLE: Compact Pantry Inventory (Zero-Clutter) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Title & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-100 tracking-tight">
              Dolap Envanteri
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-400">
              {ingredients.length} Malzeme
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Malzeme ara..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Empty or Single Item Guidance */}
        {ingredients.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Dolabınız Henüz Boş</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Yukarıdaki butonlardan buzdolabınızın fotoğrafını çekin, sesle malzemelerinizi sayın veya örnek dolabı yükleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onLoadPreset(require('@/lib/sampleData').PANTRY_PRESETS[0]?.items || [])}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all"
            >
              Örnek Temel Dolabı Yükle ✨
            </button>
          </div>
        ) : ingredients.length <= 2 ? (
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Şef İpucu:</span> Dolabınızda az malzeme var. [
              {ingredients.map((i) => i.name).join(', ')}] yanına temel birkaç sebze veya yumurta ekleyerek lezzetli menüler oluşturabilirsiniz!
            </div>
          </div>
        ) : null}

        {/* Compact List Grid */}
        {filteredIngredients.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredIngredients.map((item) => {
              const catInfo = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.diger;
              const IconComp = catInfo.icon;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${catInfo.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {catInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Delete Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleStepAmount(item, -1)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="1 azalt"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-emerald-400 px-1 min-w-[32px] text-center">
                        {item.amount} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStepAmount(item, 1)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="1 artır"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveIngredient(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. BOTTOM: 3 Quick Meal Picks [🍳 Kahvaltılık] | [🍲 Pratik Ana Yemek] | [🥗 Aperatif/Hafif] */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-slate-100 tracking-tight">
              Öğün Seçimi & Akıllı Tarifler
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isGenerating ? 'Yapay zeka tarifleri üretiyor...' : `${categoryRecipes.length} Tarif Hazır`}
          </span>
        </div>

        {/* 3 Meal Selector Tabs */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {BASIC_MEAL_TYPES.map((meal) => {
            const isSelected = activeMealCategory === meal.id;

            return (
              <button
                key={meal.id}
                type="button"
                onClick={() => handleQuickMealClick(meal.id)}
                disabled={isGenerating}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all min-h-[64px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xl sm:text-2xl">{meal.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {meal.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                    {meal.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recipes Display Cards */}
        {categoryRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryRecipes.map((recipe) => {
              const isVoicePlaying = activeVoiceRecipeId === recipe.id && ttsState.isPlaying;
              const visual = getRecipeCulinaryVisual(recipe.title, (recipe.ingredients || []).map((i) => i.name), recipe.category);

              return (
                <div
                  key={recipe.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
                >
                  {/* Top: Image, Tags & Times */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {recipe.difficulty}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} dk
                          </span>
                          {recipe.isCooked && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pişirildi
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-black text-slate-100 tracking-tight truncate">
                          {recipe.title}
                        </h4>
                        {recipe.subtitle && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {recipe.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Small Food Visual */}
                      <img
                        src={recipe.imageUrl || visual.imageUrl}
                        alt={recipe.title}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0 shadow-md"
                        loading="lazy"
                      />
                    </div>

                    {/* Ingredients summary pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 text-[11px] font-medium border border-slate-800"
                        >
                          {ing.amount} {ing.unit} {ing.name}
                        </span>
                      ))}
                      {recipe.ingredients.length > 4 && (
                        <span className="text-[10px] text-slate-500 font-bold">
                          +{recipe.ingredients.length - 4} daha
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar: Voice Read (TTS), Detail & Cook */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    
                    {/* TTS Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleTTS(recipe)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[44px] ${
                        isVoicePlaying
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                          : 'bg-slate-950 text-amber-300 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40'
                      }`}
                      title={isVoicePlaying ? 'Sesli okumayı durdur' : 'Tarifi sesli dinle'}
                    >
                      {isVoicePlaying ? <Square className="w-3.5 h-3.5 fill-slate-950" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                      <span>{isVoicePlaying ? 'Durdur' : 'Sesli Dinle 🔊'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecipeForDetail(recipe);
                          playKitchenSound('click', soundEnabled);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all min-h-[44px]"
                      >
                        Adımlar & Detay
                      </button>

                      {/* Pişirdim (Opens Checklist) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecipeForCook(recipe);
                          playKitchenSound('pop', soundEnabled);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all min-h-[44px] ${
                          recipe.isCooked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Pişirdim</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Quick Input Modal (Voice, Camera, Text) */}
      <QuickPantryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddIngredient={onAddIngredient}
        onAddMultipleIngredients={onAddMultipleIngredients}
        onLoadPreset={onLoadPreset}
        customApiKey={customApiKey}
        soundEnabled={soundEnabled}
        initialTab={addModalInitialTab}
        onToast={onToast}
      />

      {/* Recipe Detail Modal */}
      {selectedRecipeForDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeForDetail}
          isOpen={!!selectedRecipeForDetail}
          onClose={() => setSelectedRecipeForDetail(null)}
          onCookRecipe={(rec) => {
            setSelectedRecipeForDetail(null);
            setSelectedRecipeForCook(rec);
          }}
          onOpenTimer={onOpenTimer}
          onToggleFavorite={onToggleFavoriteRecipe}
          ingredients={ingredients}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Interactive Cook Checklist Modal */}
      {selectedRecipeForCook && (
        <CookedChecklistModal
          isOpen={!!selectedRecipeForCook}
          onClose={() => setSelectedRecipeForCook(null)}
          recipe={selectedRecipeForCook}
          pantryIngredients={ingredients}
          onConfirmCook={(rec, selected) => {
            onCookRecipeWithChecklist(rec, selected);
            setSelectedRecipeForCook(null);
          }}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}
