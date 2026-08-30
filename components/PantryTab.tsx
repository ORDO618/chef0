'use client';

import React, { useState, useMemo } from 'react';
import {
  Camera,
  Mic,
  Plus,
  Zap,
  ShoppingBag,
  Search,
  Trash2,
  Minus,
  Sparkles,
  Apple,
  Drumstick,
  Milk,
  Wheat,
  Flame,
  Coffee,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { Ingredient, IngredientCategory, Missing1Suggestion, ShoppingItem } from '@/lib/types';
import { PANTRY_PRESETS } from '@/lib/sampleData';
import { playKitchenSound } from '@/lib/sound';
import { FreshnessRadar } from './FreshnessRadar';
import { QuickPantryModal } from './QuickPantryModal';
import { QuickMissingModal } from './QuickMissingModal';

interface PantryTabProps {
  ingredients: Ingredient[];
  onAddIngredient: (item: Omit<Ingredient, 'id' | 'addedAt'>) => void;
  onAddMultipleIngredients: (items: Omit<Ingredient, 'id' | 'addedAt'>[]) => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateAmount: (id: string, delta: number) => void;
  onLoadPreset: (items: any[]) => void;
  onGenerateRescueMenu?: (expiringIngredients: Ingredient[]) => void;
  customApiKey: string;
  soundEnabled: boolean;
  missingSuggestions?: Missing1Suggestion[];
  shoppingList?: ShoppingItem[];
  onAddMissingToShoppingList?: (suggestion: Missing1Suggestion) => void;
  onToggleCheckShoppingItem?: (id: string) => void;
  onNavigateToMarket?: () => void;
  onToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const CATEGORY_MAP: Record<IngredientCategory, { label: string; icon: any; color: string; dot: string }> = {
  sebze_meyve: { label: 'Sebze & Meyve', icon: Apple, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30', dot: 'bg-emerald-400' },
  et_tavuk_balik: { label: 'Et & Balık', icon: Drumstick, color: 'text-rose-400 bg-rose-950/40 border-rose-500/30', dot: 'bg-rose-400' },
  sut_kahvaltilik: { label: 'Süt & Kahvaltılık', icon: Milk, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30', dot: 'bg-amber-400' },
  kuru_gida: { label: 'Kuru Gıda', icon: Wheat, color: 'text-yellow-500 bg-yellow-950/40 border-yellow-500/30', dot: 'bg-yellow-500' },
  baharat_sos: { label: 'Baharat & Sos', icon: Flame, color: 'text-orange-400 bg-orange-950/40 border-orange-500/30', dot: 'bg-orange-400' },
  icecek: { label: 'İçecekler', icon: Coffee, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30', dot: 'bg-cyan-400' },
  diger: { label: 'Diğer', icon: HelpCircle, color: 'text-slate-400 bg-slate-900 border-slate-700', dot: 'bg-slate-400' },
};

export function PantryTab({
  ingredients,
  onAddIngredient,
  onAddMultipleIngredients,
  onRemoveIngredient,
  onUpdateAmount,
  onLoadPreset,
  onGenerateRescueMenu,
  customApiKey,
  soundEnabled,
  missingSuggestions = [],
  shoppingList = [],
  onAddMissingToShoppingList,
  onToggleCheckShoppingItem,
  onNavigateToMarket,
  onToast = () => {},
}: PantryTabProps) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialTab, setAddModalInitialTab] = useState<'voice' | 'camera' | 'text'>('voice');
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Critical items calculation
  const { urgentItems, mostCriticalName } = useMemo(() => {
    const urgent = ingredients.filter((i) => (i.daysUntilExpiry !== undefined && i.daysUntilExpiry <= 3) || i.isPriority);
    return {
      urgentItems: urgent,
      mostCriticalName: urgent[0]?.name || '',
    };
  }, [ingredients]);

  const openAddModal = (tab: 'voice' | 'camera' | 'text') => {
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
    } else {
      onToast(`"${item.name}" miktarı: ${nextAmount} ${item.unit}`, 'info');
    }
  };

  const handleRescueTrigger = () => {
    playKitchenSound('click', soundEnabled);
    if (onGenerateRescueMenu) {
      onGenerateRescueMenu(urgentItems.length > 0 ? urgentItems : ingredients.slice(0, 3));
    }
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [ingredients, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HERO: 3 Big Glassmorphic Action Cards (Apple / Uber Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: [📸 Hızlı Tara & Sesle Ekle] */}
        <div
          onClick={() => openAddModal('voice')}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 hover:border-emerald-500/50 p-5 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Camera className="w-6 h-6" />
              </div>
              <div className="w-10 h-10 -ml-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-emerald-300 flex items-center justify-center shadow-md">
                <Mic className="w-5 h-5" />
              </div>
            </div>

            <span className="p-2 rounded-xl bg-slate-800/50 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-950/40 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-emerald-300 transition-colors tracking-tight">
                Hızlı Tara & Sesle Ekle
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              Fotoğraf çekin, sesle anlatın veya akıllı klavye ile saniyeler içinde dizin.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              🎙️ Kesintisiz Ses
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300">
              📸 AI Vision
            </span>
          </div>
        </div>

        {/* Card 2: [⚡ 15 Dk'da Kurtar] */}
        <div
          onClick={handleRescueTrigger}
          className={`group relative cursor-pointer overflow-hidden rounded-3xl backdrop-blur-2xl border p-5 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between ${
            urgentItems.length > 0
              ? 'bg-gradient-to-br from-rose-950/40 via-slate-900/70 to-slate-950/90 border-rose-500/40 hover:border-rose-500 hover:shadow-rose-500/10'
              : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-amber-500/50 hover:shadow-amber-500/10'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Zap className="w-6 h-6 fill-current" />
            </div>

            {urgentItems.length > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-slate-950 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                {urgentItems.length} Riskli Ürün
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Dolap Güvende
              </span>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors tracking-tight">
              15 Dk&apos;da Kurtar
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              {urgentItems.length > 0
                ? `${mostCriticalName} ve yaklaşan ürünler için tek tıkla kurtarma menüsü.`
                : 'Dolabınızdaki malzemelerle en hızlı, sıfır israf tarifleri anında üretin.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
              Menü Oluştur & Başla →
            </span>
            <span className="text-[10px] text-slate-500">Airfryer & Hızlı Pişirme</span>
          </div>
        </div>

        {/* Card 3: [🛒 Eksikleri Görüntüle] */}
        <div
          onClick={() => {
            setIsMissingModalOpen(true);
            playKitchenSound('click', soundEnabled);
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 hover:border-cyan-500/50 p-5 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-0.5 active:translate-y-0 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <span className="p-2 rounded-xl bg-slate-800/50 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/40 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-cyan-300 transition-colors tracking-tight">
              Eksikleri Görüntüle
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              1-Eksik tarif tamamlayıcıları ve dolabın akıllı ihtiyaç listesi.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                {shoppingList.length} Pazarda
              </span>
              {missingSuggestions.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium">
                  {missingSuggestions.length} 1-Eksik
                </span>
              )}
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">Listeyi Aç</span>
          </div>
        </div>
      </div>

      {/* 2. MINIMALIST FRESHNESS RADAR (Single-Line Progress & Status) */}
      <FreshnessRadar
        ingredients={ingredients}
        onGenerateRescueMenu={(urgent) => {
          if (onGenerateRescueMenu) {
            onGenerateRescueMenu(urgent);
          }
        }}
        soundEnabled={soundEnabled}
      />

      {/* 3. COMPACT DOLAP ENVANTERİ (Clean Chips & Responsive Grid) */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Controls Bar: Title, Count, Search, Quick Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
              Dolap Envanteri
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800/90 text-emerald-400 border border-slate-700/80">
              {ingredients.length} Ürün
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Malzeme ara..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={() => openAddModal('text')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Malzeme Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </button>
          </div>
        </div>

        {/* Minimalist Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              playKitchenSound('click', soundEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tümü ({ingredients.length})
          </button>

          {Object.entries(CATEGORY_MAP).map(([catKey, catMeta]) => {
            const count = ingredients.filter((i) => i.category === catKey).length;
            if (count === 0 && selectedCategory !== catKey) return null;
            const Icon = catMeta.icon;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => {
                  setSelectedCategory(catKey);
                  playKitchenSound('click', soundEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  selectedCategory === catKey
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{catMeta.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Compact Inventory Chips Grid */}
        {filteredIngredients.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 p-6 space-y-3">
            <Apple className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <div>
              <p className="text-sm font-bold text-slate-300">Bu kategoride malzeme bulunamadı</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesle, kamerayla veya hazır örnek profillerle hemen doldurabilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => openAddModal('voice')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Sesle Ekle</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadPreset(PANTRY_PRESETS[0].items);
                  playKitchenSound('pop', soundEnabled);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Örnek Dolap Yükle</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredIngredients.map((item) => {
              const catMeta = CATEGORY_MAP[item.category] || CATEGORY_MAP.diger;
              const Icon = catMeta.icon;
              const days = item.daysUntilExpiry ?? 7;
              const isUrgent = days <= 3 || item.isPriority;
              const isWarning = days > 3 && days <= 7;

              return (
                <div
                  key={item.id}
                  className={`group relative p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    isUrgent
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70 shadow-sm shadow-rose-950/20'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  {/* Left: Freshness Dot + Category Icon + Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${catMeta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Freshness indicator dot (Green / Yellow / Red) */}
                      <span
                        className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                          isUrgent
                            ? 'bg-rose-500 animate-pulse'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        title={`${days} gün kaldı`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate">{catMeta.label}</span>
                        <span>•</span>
                        <span className={isUrgent ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {days}g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Delete Action */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-1.5 py-1 text-xs shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleStepAmount(item, -1)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 active:scale-75 hover:scale-125 transition-all duration-150 flex items-center justify-center"
                        title="Azalt"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="font-mono font-bold text-emerald-400 text-xs px-1 min-w-[20px] text-center select-none">
                        {item.amount}
                      </span>
                      <span className="text-[10px] text-slate-500 pr-1 select-none">{item.unit}</span>

                      <button
                        type="button"
                        onClick={() => handleStepAmount(item, 1)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 active:scale-75 hover:scale-125 transition-all duration-150 flex items-center justify-center"
                        title="Arttır"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onRemoveIngredient(item.id);
                        playKitchenSound('click', soundEnabled);
                      }}
                      className="opacity-40 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-all active:scale-90"
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

      {/* MODAL 1: Quick Pantry Add (Voice, Camera Vision, Smart Prediction) */}
      <QuickPantryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddIngredient={onAddIngredient}
        onAddMultipleIngredients={onAddMultipleIngredients}
        onLoadPreset={onLoadPreset}
        customApiKey={customApiKey}
        soundEnabled={soundEnabled}
        initialTab={addModalInitialTab}
      />

      {/* MODAL 2: Quick Missing & Shopping Summary */}
      <QuickMissingModal
        isOpen={isMissingModalOpen}
        onClose={() => setIsMissingModalOpen(false)}
        missingSuggestions={missingSuggestions}
        shoppingList={shoppingList}
        onAddMissingToShoppingList={onAddMissingToShoppingList || (() => {})}
        onToggleCheckShoppingItem={onToggleCheckShoppingItem || (() => {})}
        onNavigateToMarket={onNavigateToMarket || (() => {})}
        soundEnabled={soundEnabled}
        onToast={onToast}
      />
    </div>
  );
}
