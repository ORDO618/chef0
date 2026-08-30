'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  Flame,
  Users,
  CheckCircle2,
  ChefHat,
  Wind,
  Zap,
  HeartPulse,
  BookOpen,
  Share2,
  Play,
  Utensils,
  Sparkles,
  Timer,
  Check,
  Heart,
  Star,
} from 'lucide-react';
import { Recipe, Ingredient } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';
import { triggerConfetti } from '@/lib/confetti';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onCookRecipe: (recipe: Recipe) => void;
  onOpenTimer: (minutes: number, label: string) => void;
  onShareToCommunity?: (recipe: Recipe) => void;
  onToggleFavorite?: (recipeId: string) => void;
  ingredients: Ingredient[];
  soundEnabled: boolean;
}

export function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onCookRecipe,
  onOpenTimer,
  onShareToCommunity,
  onToggleFavorite,
  ingredients,
  soundEnabled,
}: RecipeDetailModalProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [servingsScale, setServingsScale] = useState<number>(recipe?.servings || 2);

  if (!isOpen || !recipe) return null;

  const scaleRatio = servingsScale / (recipe.servings || 2);

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
    playKitchenSound('click', soundEnabled);
  };

  const handleCook = () => {
    triggerConfetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
    playKitchenSound('cook_success', soundEnabled);
    onCookRecipe(recipe);
  };

  // Check which ingredients exist in current pantry
  const getIngredientStockStatus = (name: string) => {
    const found = ingredients.find(
      (i) => i.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(i.name.toLowerCase())
    );
    return found ? { inStock: true, stockAmount: `${found.amount} ${found.unit}` } : { inStock: false, stockAmount: 'Stokta yok' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Modal Top Header Bar */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 text-[11px] font-extrabold uppercase rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {recipe.difficulty}
              </span>
              <span className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 text-slate-300">
                {recipe.category.toUpperCase()}
              </span>
              {recipe.isCooked && (
                <span className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-400 text-slate-950 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pişirildi & Stoktan Düştü
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {recipe.title}
            </h2>
            {recipe.subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">{recipe.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => {
                  onToggleFavorite(recipe.id);
                  playKitchenSound(recipe.isFavorite ? 'pop' : 'badge_unlock', soundEnabled);
                }}
                className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                  recipe.isFavorite
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-400/40'
                }`}
                title={recipe.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-slate-950 text-slate-950' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{recipe.isFavorite ? 'Favorilerimde ⭐' : 'Favorilere Ekle'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shrink-0"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Toplam Süre</div>
                <div className="text-sm font-bold text-slate-200">
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes} dk
                </div>
                <div className="text-[10px] text-slate-400">{recipe.prepTimeMinutes}m haz. / {recipe.cookTimeMinutes}m piş.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Kalori / Porsiyon</div>
                <div className="text-sm font-bold text-amber-400">
                  {Math.round(recipe.macros.calories)} kcal
                </div>
                <div className="text-[10px] text-slate-400">{recipe.macros.proteinGrams}g Protein</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Tavsiye Ekipman</div>
                <div className="text-sm font-bold text-cyan-300">
                  {recipe.airfryerVsOven.airfryer.equipment}
                </div>
                <div className="text-[10px] text-slate-400">{recipe.airfryerVsOven.airfryer.temperature || '185°C'}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Tasarruf Oranı</div>
                <div className="text-sm font-bold text-teal-400">%70 Enerji & Sıfır Atık</div>
                <div className="text-[10px] text-slate-400">Tüm malzemeler evden</div>
              </div>
            </div>
          </div>

          {/* Portion Scaler & Scaled Ingredients List */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Gerekli Malzemeler & Dolap Durumu</h3>
              </div>

              {/* Servings Button Group */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Porsiyon:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setServingsScale(num);
                        playKitchenSound('pop', soundEnabled);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        servingsScale === num
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, idx) => {
                const scaledAmount = ing.amount ? Math.round(ing.amount * scaleRatio * 10) / 10 : '';
                const stockStatus = getIngredientStockStatus(ing.name);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{ing.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Tarif İhtiyacı: <strong className="text-slate-200">{scaledAmount} {ing.unit}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          stockStatus.inStock
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {stockStatus.inStock ? `Dolapta Var (${stockStatus.stockAmount})` : 'Dolapta Az'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Cooking Guide (Step-by-Step with timers) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Adım Adım Pişirme Rehberi</h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenTimer(recipe.cookTimeMinutes, `${recipe.title} (Pişirme)`)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>{recipe.cookTimeMinutes} dk Sayacı Başlat</span>
              </button>
            </div>

            <div className="space-y-3">
              {recipe.steps.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                // Extract step minutes if any (e.g. 6 dakika)
                const minuteMatch = step.match(/(\d+)\s*(?:dakika|dk)/i);
                const stepMinutes = minuteMatch ? parseInt(minuteMatch[1], 10) : null;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStepCompleted(idx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          isDone
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 border border-slate-700'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                      </button>

                      <div className="flex-1 space-y-2">
                        <p className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {step}
                        </p>

                        {stepMinutes && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => onOpenTimer(stepMinutes, `Adım ${idx + 1}: ${recipe.title}`)}
                              className="px-2.5 py-1 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Bu Adım İçin {stepMinutes} dk Sayacı Başlat</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Equipment Comparison: Airfryer vs. Oven vs. Stovetop */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Ekipman & Enerji Analiz Raporu</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Airfryer */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 flex items-center gap-1.5 text-xs">
                    <Zap className="w-4 h-4" />
                    {recipe.airfryerVsOven.airfryer.equipment} ({recipe.airfryerVsOven.airfryer.temperature || '185°C'})
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    {recipe.airfryerVsOven.airfryer.timeMinutes} Dakika
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {recipe.airfryerVsOven.airfryer.healthBenefits}
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-emerald-500/20">
                  ⚡ {recipe.airfryerVsOven.airfryer.energySavingNote}
                </div>
              </div>

              {/* Oven */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Flame className="w-4 h-4 text-amber-400" />
                    {recipe.airfryerVsOven.oven.equipment} ({recipe.airfryerVsOven.oven.temperature || '200°C'})
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {recipe.airfryerVsOven.oven.timeMinutes} Dakika
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {recipe.airfryerVsOven.oven.healthBenefits}
                </p>
                <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-800">
                  💡 Tavsiye: {recipe.airfryerVsOven.recommendation}
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Bio-Tip Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 flex items-start gap-3">
            <HeartPulse className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <span>Bilimsel Besin Sinerjisi: {recipe.scientificBioTip.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {recipe.scientificBioTip.macroFocus}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {recipe.scientificBioTip.fact}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onShareToCommunity && (
              <button
                type="button"
                onClick={() => {
                  playKitchenSound('like', soundEnabled);
                  onShareToCommunity(recipe);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Toplulukta Paylaş</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenTimer(recipe.cookTimeMinutes, recipe.title)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Sayacı Aç ({recipe.cookTimeMinutes} dk)</span>
            </button>

            <button
              type="button"
              onClick={handleCook}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                recipe.isCooked
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{recipe.isCooked ? 'Tekrar Stoktan Düş' : 'Pişirdim (Stoktan Düş)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
