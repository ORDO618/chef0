'use client';

import React, { useState } from 'react';
import { Leaf, Flame, Sparkles, Key, Check, ShieldCheck, RefreshCw, Volume2, VolumeX, Droplets, Share2, Cloud } from 'lucide-react';
import { ZeroWasteStats } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { FuturisticLogo } from './FuturisticLogo';

interface HeaderProps {
  stats: ZeroWasteStats;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  onOpenKeyModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetPantry: () => void;
  onOpenEcoStory?: () => void;
  onOpenAdminModal?: () => void;
  onNavigateToDiary?: () => void;
  onOpenTourGuide?: () => void;
  onOpenAuthSync?: () => void;
  isCloudActive?: boolean;
  activeTab?: string;
}

export function Header({
  stats,
  customApiKey,
  onSaveApiKey,
  onOpenKeyModal,
  soundEnabled,
  onToggleSound,
  onResetPantry,
  onOpenEcoStory,
  onOpenAdminModal,
  onNavigateToDiary,
  onOpenTourGuide,
  onOpenAuthSync,
  isCloudActive,
  activeTab,
}: HeaderProps) {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(customApiKey);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(tempKey.trim());
    setIsEditingKey(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Slogan */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <FuturisticLogo size="md" showSubtitle={true} />

          {/* Mobile Quick Sound / Preset */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onToggleSound}
              className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg text-xs"
              title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Center: Zero Waste Impact Metrics */}
        <div className="flex items-center flex-wrap gap-2 lg:gap-3 justify-center text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">{stats.ingredientsSaved}</span>
            <span className="text-slate-400">Gıda Kurtarıldı</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold text-teal-300">{stats.co2SavedKg} kg</span>
            <span className="text-slate-400">CO₂</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-cyan-300" suppressHydrationWarning>
              {formatNumber(stats.waterSavedLiters || 4850)} L
            </span>
            <span className="text-slate-400">Su</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-400">{stats.streakDays} Gün</span>
            <span className="text-amber-200/80">Seri</span>
          </div>

          {onOpenEcoStory && (
            <button
              type="button"
              onClick={onOpenEcoStory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Kişisel Ekolojik Etki ve ESG Kartını Görüntüle / Paylaş"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Etki Kartım</span>
            </button>
          )}
        </div>

        {/* Right: API Key Input & Tools */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Header API Key inline form / quick widget */}
          <div className="relative">
            {isEditingKey ? (
              <form onSubmit={handleKeySubmit} className="flex items-center gap-1">
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Gemini API Key..."
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-emerald-500/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none w-36 lg:w-44 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
                  title="Kaydet"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setTempKey(customApiKey);
                    setIsEditingKey(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    customApiKey
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                  title="Gemini API Anahtarı"
                >
                  <Key className={`w-3.5 h-3.5 ${customApiKey ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate max-w-[90px] lg:max-w-[120px]">
                    {customApiKey ? 'Özel Key Aktif' : 'Gemini AI Aktif'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>

                <button
                  onClick={onOpenKeyModal}
                  className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800 rounded-lg text-xs"
                  title="API Ayarları"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            )}
          </div>

          {/* Cloud Sync & Login Button */}
          {onOpenAuthSync && (
            <button
              type="button"
              onClick={onOpenAuthSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isCloudActive
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              title="Çoklu Cihaz (MacBook & iPhone) Bulut Senkronizasyonu & Hesap"
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Bulut Sync</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isCloudActive ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`} />
            </button>
          )}

          {/* Quick Tour Guide Button */}
          {onOpenTourGuide && (
            <button
              type="button"
              onClick={onOpenTourGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="İnteraktif Hızlı Tur & Kullanım Rehberi (30 Saniye)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hızlı Tur ✨</span>
            </button>
          )}

          {/* Kürşad Profili / Günlüğüm Button */}
          {onNavigateToDiary && (
            <button
              type="button"
              onClick={onNavigateToDiary}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activeTab === 'diary'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300'
              }`}
              title="Kürşad'ın Mutfak Günlüğü ve 15 Günlük Test Protokolü"
            >
              <span>👨‍🍳</span>
              <span className="hidden sm:inline">Kürşad Günlüğü</span>
            </button>
          )}

          {/* Admin Control Tower Button */}
          {onOpenAdminModal && (
            <button
              type="button"
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm"
              title="Süper Yönetici Kontrol Kulesi"
            >
              <span>🎛️</span>
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Sound Toggle (Desktop) */}
          <button
            onClick={onToggleSound}
            className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-emerald-400 bg-slate-900/90 border border-slate-800 rounded-xl text-xs transition-colors"
            title={soundEnabled ? 'Mutfak Ses Efektleri: Açık' : 'Mutfak Ses Efektleri: Kapalı'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset Demo / Reload */}
          <button
            onClick={onResetPantry}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/90 border border-slate-800 rounded-xl text-xs transition-colors"
            title="Örnek Dolabı Sıfırla / Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
