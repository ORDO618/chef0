'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Leaf,
  Droplets,
  Coins,
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  Utensils,
  Camera,
} from 'lucide-react';
import { ZeroWasteStats, UserBadge } from '@/lib/types';
import { triggerConfetti } from '@/lib/confetti';
import { playKitchenSound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';

interface EcoImpactStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ZeroWasteStats;
  badges: UserBadge[];
  soundEnabled: boolean;
  onToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}

export function EcoImpactStoryModal({
  isOpen,
  onClose,
  stats,
  badges,
  soundEnabled,
  onToast,
}: EcoImpactStoryModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const waterSaved = stats.waterSavedLiters || 4850;
  const foodSavedKg = stats.rescuedKg || 5.8;

  const handleShare = () => {
    triggerConfetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    playKitchenSound('pop', soundEnabled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const shareText = `🌍 ŞefSıfır ile Mutfakta Sıfır İsraf Etkim:\n🍎 ${stats.ingredientsSaved} Malzeme (${foodSavedKg} kg) Kurtarıldı\n☁️ ${stats.co2SavedKg} kg CO₂ Salımı Engellendi\n💧 ${formatNumber(waterSaved)} Litre Sanal Su Tasarruf Edildi\n💰 ${stats.approxMoneySavedTl} ₺ Hane Bütçesi Korundu\n🔥 ${stats.streakDays} Gün Kesintisiz Sıfır İsraf!\n\nSen de mutfağındaki israfı önle -> KitchZero`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      onToast('Instagram Story metni panoya kopyalandı!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">Kişisel Ekolojik Etki & ESG Kartı</h3>
              <p className="text-[11px] text-slate-400">Instagram Story & Sosyal Medya Formatı</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Story Preview Area */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center">
          
          {/* 9:16 Aspect Ratio Instagram Story Card */}
          <div className="w-full max-w-[320px] aspect-[9/16] rounded-3xl p-5 bg-gradient-to-br from-slate-950 via-emerald-950/90 to-slate-950 border-2 border-emerald-500/40 shadow-2xl relative flex flex-col justify-between overflow-hidden text-slate-100 select-none">
            
            {/* Ambient background glow & grid elements */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Story Top: Brand & User Identity */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Leaf className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight text-white">ŞefSıfır / KitchZero</div>
                    <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Ekolojik Etki Raporu</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{stats.streakDays} Gün Seri</span>
                </span>
              </div>

              {/* Headline */}
              <div className="text-center pt-2">
                <h4 className="text-sm font-black text-white leading-tight">
                  Ev Mutfağımda Sıfır İsraf Devrimi 🌿
                </h4>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Gezegenimi ve hane bütçemi koruyorum
                </p>
              </div>
            </div>

            {/* Story Middle: 4 Key ESG Impact Metrics */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5 py-2">
              
              {/* Metric 1: Food Rescued */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-inner flex flex-col items-center text-center">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 mb-1">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-emerald-400 tracking-tight">
                  {stats.ingredientsSaved}
                  <span className="text-[10px] text-emerald-300 font-semibold ml-0.5">Adet</span>
                </div>
                <div className="text-[9px] text-slate-300 font-medium">
                  {foodSavedKg} kg Gıda Kurtarıldı
                </div>
              </div>

              {/* Metric 2: CO2 Prevented */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-teal-500/30 shadow-inner flex flex-col items-center text-center">
                <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 mb-1">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-teal-300 tracking-tight">
                  {stats.co2SavedKg}
                  <span className="text-[10px] text-teal-200 font-semibold ml-0.5">kg</span>
                </div>
                <div className="text-[9px] text-slate-300 font-medium">
                  CO₂ Salımı Engellendi
                </div>
              </div>

              {/* Metric 3: Virtual Water Saved */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-inner flex flex-col items-center text-center">
                <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 mb-1">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-cyan-300 tracking-tight" suppressHydrationWarning>
                  {formatNumber(waterSaved)}
                  <span className="text-[10px] text-cyan-200 font-semibold ml-0.5">L</span>
                </div>
                <div className="text-[9px] text-slate-300 font-medium">
                  Sanal Su Tasarrufu
                </div>
              </div>

              {/* Metric 4: Budget Protected */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-inner flex flex-col items-center text-center">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 mb-1">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-amber-400 tracking-tight">
                  {stats.approxMoneySavedTl}
                  <span className="text-[10px] text-amber-200 font-semibold ml-0.5">₺</span>
                </div>
                <div className="text-[9px] text-slate-300 font-medium">
                  Hane Bütçesi Korundu
                </div>
              </div>
            </div>

            {/* Story Bottom: Badges & Verified Seal */}
            <div className="relative z-10 space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kazanılan Rozetler</span>
                </span>
                <span className="font-black text-amber-400">{unlockedCount} / {badges.length} Rozet</span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>ESG Doğrulanmış Sıfır İsraf</span>
                </span>
                <span>@kitchzero.app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span>Etki Kartımı Paylaş (Story Formatı)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
