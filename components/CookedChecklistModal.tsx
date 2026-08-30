'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Droplets,
  Flame,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { Recipe, Ingredient, UsedIngredient } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';
import { fireConfetti } from '@/lib/confetti';

interface CookedChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  pantryIngredients: Ingredient[];
  onConfirmCook: (
    recipe: Recipe,
    selectedIngredients: { name: string; amount: number; unit: string }[]
  ) => void;
  soundEnabled: boolean;
}

export function CookedChecklistModal({
  isOpen,
  onClose,
  recipe,
  pantryIngredients,
  onConfirmCook,
  soundEnabled,
}: CookedChecklistModalProps) {
  // State: Record of ingredientName -> overrides { isSelected?: boolean, amountToDeduct?: number }
  const [overrides, setOverrides] = useState<
    Record<string, { isSelected?: boolean; amountToDeduct?: number }>
  >({});

  if (!isOpen || !recipe) return null;

  // Build items by merging recipe ingredients with pantry matching and overrides
  const items = recipe.ingredients.map((used) => {
    const match = pantryIngredients.find(
      (i) =>
        i.name.toLowerCase() === used.name.toLowerCase() ||
        i.name.toLowerCase().includes(used.name.toLowerCase()) ||
        used.name.toLowerCase().includes(i.name.toLowerCase())
    );

    const override = overrides[used.name];
    const isSelected = override?.isSelected !== undefined ? override.isSelected : true;
    const amountToDeduct = override?.amountToDeduct !== undefined ? override.amountToDeduct : (used.amount || 1);
    const unit = used.unit || match?.unit || 'adet';
    const inStock = !!match;
    const stockAmount = match ? match.amount : 0;

    return {
      name: used.name,
      isSelected,
      amountToDeduct,
      unit,
      inStock,
      stockAmount,
    };
  });

  const toggleItem = (name: string) => {
    const current = items.find((i) => i.name === name);
    const currentSelected = current ? current.isSelected : true;
    setOverrides((prev) => ({
      ...prev,
      [name]: { ...prev[name], isSelected: !currentSelected },
    }));
    playKitchenSound('click', soundEnabled);
  };

  const updateAmount = (name: string, delta: number) => {
    const current = items.find((i) => i.name === name);
    const currentAmount = current ? current.amountToDeduct : 1;
    const nextAmount = Math.max(0.5, Number((currentAmount + delta).toFixed(1)));
    setOverrides((prev) => ({
      ...prev,
      [name]: { ...prev[name], amountToDeduct: nextAmount },
    }));
    playKitchenSound('pop', soundEnabled);
  };

  const handleConfirm = () => {
    const toDeduct = items
      .filter((item) => item.isSelected && item.amountToDeduct > 0)
      .map((item) => ({
        name: item.name,
        amount: item.amountToDeduct,
        unit: item.unit,
      }));

    fireConfetti();
    playKitchenSound('cook_success', soundEnabled);
    onConfirmCook(recipe, toDeduct);
    onClose();
  };

  const selectedCount = items.filter((item) => item.isSelected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-t-[32px] sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in zoom-in-95 duration-200">
        
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Stok Otomatik Düşümü
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {recipe.category.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
              {recipe.title} — Pişirme Onayı
            </h2>
            <p className="text-xs text-slate-400">
              Bu tarifte kullandığınız malzemeleri onaylayın, dolabınızdan otomatik düşelim.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Checklist */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Kullanılan Malzemeler ({selectedCount} Seçili)</span>
            <span className="text-emerald-400 text-[11px]">Seçilmeyenler dolapta kalır</span>
          </div>

          <div className="space-y-2.5">
            {items.map((item) => {
              return (
                <div
                  key={item.name}
                  onClick={() => toggleItem(item.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    item.isSelected
                      ? 'bg-slate-950/80 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                        item.isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        {item.inStock ? (
                          <span className="text-emerald-400">
                            Dolaptaki Stok: {item.stockAmount} {item.unit}
                          </span>
                        ) : (
                          <span className="text-amber-400/90">
                            Dolapta kayıtlı değil (yine de düşülebilir)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper (stops click propagation) */}
                  <div
                    className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={!item.isSelected}
                      onClick={() => updateAmount(item.name, -0.5)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      title="Miktarı azalt"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-mono font-bold text-emerald-300 px-1.5 min-w-[45px] text-center">
                      {item.amountToDeduct} {item.unit}
                    </span>

                    <button
                      type="button"
                      disabled={!item.isSelected}
                      onClick={() => updateAmount(item.name, 0.5)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      title="Miktarı artır"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Eco Impact Gain Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">
                Kazanılacak Ekolojik Etki:
              </span>
            </div>
            <div className="flex items-center gap-3 font-bold text-emerald-300">
              <span>+1.4 kg CO₂</span>
              <span>+125 ₺ Bütçe</span>
              <span>+650 L Su</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-all min-h-[48px]"
          >
            İptal
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="flex-1 px-6 py-3 rounded-xl text-xs font-black bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Onayla ve Dolaptan Düş ({selectedCount} Malzeme)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
