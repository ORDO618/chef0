'use client';

import React from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  ExternalLink,
  DollarSign,
  Layers,
} from 'lucide-react';
import { Missing1Suggestion, ShoppingItem } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';

interface QuickMissingModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingSuggestions: Missing1Suggestion[];
  shoppingList: ShoppingItem[];
  onAddMissingToShoppingList: (suggestion: Missing1Suggestion) => void;
  onToggleCheckShoppingItem: (id: string) => void;
  onNavigateToMarket: () => void;
  soundEnabled: boolean;
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function QuickMissingModal({
  isOpen,
  onClose,
  missingSuggestions,
  shoppingList,
  onAddMissingToShoppingList,
  onToggleCheckShoppingItem,
  onNavigateToMarket,
  soundEnabled,
  onToast,
}: QuickMissingModalProps) {
  if (!isOpen) return null;

  const totalShoppingItems = shoppingList.length;
  const pendingShoppingItems = shoppingList.filter((i) => !i.checked).length;
  const estimatedTotal = shoppingList.reduce((acc, i) => acc + (i.estimatedPrice || 35), 0);

  const handleCopyList = () => {
    if (shoppingList.length === 0 && missingSuggestions.length === 0) {
      onToast('Kopyalanacak malzeme bulunamadı.', 'info');
      return;
    }

    const lines: string[] = ['🛒 KitchZero / ŞefSıfır Alışveriş Listem:'];
    if (shoppingList.length > 0) {
      shoppingList.forEach((item) => {
        lines.push(`• ${item.name} (${item.amount || 1} ${item.unit || 'adet'}) ${item.checked ? '✓' : ''}`);
      });
    }
    if (missingSuggestions.length > 0) {
      lines.push('\n✨ 1-Eksik Önerileri:');
      missingSuggestions.forEach((m) => {
        lines.push(`• ${m.missingIngredientName} (${m.unlocksRecipeTitle} tarifini açar)`);
      });
    }

    navigator.clipboard.writeText(lines.join('\n'));
    playKitchenSound('click', soundEnabled);
    onToast('Alışveriş listeniz panoya kopyalandı!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-t-[32px] sm:rounded-3xl bg-slate-900/95 border-t sm:border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Eksikler & Alışveriş Özeti</h2>
              <p className="text-xs text-slate-400">
                {pendingShoppingItems} bekleyen ürün • Yaklaşık ₺{estimatedTotal}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyList}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              title="Listeyi Kopyala"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          
          {/* Section 1: 1-Missing Recipe Unlock Suggestions */}
          {missingSuggestions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Eksik Akıllı Tarif Tamamlayıcıları
                </span>
                <span className="text-[10px] text-slate-500">Sadece 1 malzeme ile yeni yemekler</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {missingSuggestions.slice(0, 3).map((sugg) => (
                  <div
                    key={sugg.id}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          + {sugg.missingIngredientName}
                        </span>
                        {sugg.estimatedPriceTl && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            ~{sugg.estimatedPriceTl}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Açılan Tarif: <strong className="text-slate-300">{sugg.unlocksRecipeTitle}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onAddMissingToShoppingList(sugg);
                        playKitchenSound('pop', soundEnabled);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Listeye Ekle</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Current Shopping List Summary */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                Alışveriş Listeniz ({shoppingList.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToMarket();
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>Pazarım Sekmesine Git</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {shoppingList.length === 0 ? (
              <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-slate-200">Alışveriş listeniz şu anda boş!</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Yemek pişirirken biten malzemeler veya 1-Eksik önerileri buraya otomatik eklenir.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {shoppingList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onToggleCheckShoppingItem(item.id);
                      playKitchenSound('click', soundEnabled);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      item.checked
                        ? 'bg-slate-950/30 border-slate-800/40 text-slate-500 line-through'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {item.checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold">{item.name}</span>
                      {item.amount && (
                        <span className="text-[10px] text-slate-500">
                          ({item.amount} {item.unit || 'adet'})
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      ₺{item.estimatedPrice || 35}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 px-6 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Toplam: <strong className="text-slate-100 font-mono text-sm">₺{estimatedTotal}</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToMarket();
            }}
            className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-transform hover:scale-105"
          >
            <span>Tüm Pazarı Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
