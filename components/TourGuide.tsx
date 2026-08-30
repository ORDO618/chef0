'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Camera,
  Mic,
  Zap,
  Flame,
  ShoppingBag,
  CheckCircle2,
  Leaf,
  Timer,
  ChevronRight,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import { playKitchenSound } from '@/lib/sound';

export interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'pantry' | 'meals' | 'market') => void;
  soundEnabled: boolean;
}

interface VisualTourSlide {
  id: string;
  tab: 'pantry' | 'meals' | 'market';
  badge: string;
  badgeEmoji: string;
  headline: string;
  subtext: string;
  gradient: string;
  borderGlow: string;
  pillColor: string;
  visualScene: 'camera_mic' | 'cook_airfryer' | 'missing_market';
  keyStats: { label: string; value: string }[];
}

const TOUR_SLIDES: VisualTourSlide[] = [
  {
    id: 'slide-scan',
    tab: 'pantry',
    badge: '1 SANİYEDE TARA & DİZ',
    badgeEmoji: '📸 🎙️',
    headline: 'Fotoğraf Çek veya Sesle Söyle',
    subtext: 'Buzdolabının fotoğrafını yükle ya da sesli söyle; tüm kiler saniyeler içinde dijitalleşsin, tazelik alarmları kurulsun.',
    gradient: 'from-emerald-500/20 via-teal-900/30 to-slate-900',
    borderGlow: 'border-emerald-500/50 shadow-emerald-500/20',
    pillColor: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    visualScene: 'camera_mic',
    keyStats: [
      { label: 'Girdi Hızı', value: '< 2 Saniye' },
      { label: 'Algılama', value: 'Kamera + Ses + Yazı' },
      { label: 'Tazelik Radarı', value: 'Biyolojik SKT' },
    ],
  },
  {
    id: 'slide-cook',
    tab: 'meals',
    badge: 'TEK TIKLA KURTAR & PİŞİR',
    badgeEmoji: '🍳 ⚡',
    headline: 'Bozulmaya Yakın Ürünleri Gurme Yemeğe Dönüştür',
    subtext: '15 dakikalık acil kurtarma menüleriyle sıfır gıda israfı! "Pişirdim"e bastığında kullanılan gramajlar dolaptan otomatik düşer.',
    gradient: 'from-amber-500/20 via-orange-900/30 to-slate-900',
    borderGlow: 'border-amber-500/50 shadow-amber-500/20',
    pillColor: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    visualScene: 'cook_airfryer',
    keyStats: [
      { label: 'Airfryer vs. Fırın', value: '-%70 Enerji & Yağ' },
      { label: 'Stok Yönetimi', value: 'Otomatik Eksiltme' },
      { label: 'Biyo-Hap Bilgi', value: 'Makro & Mikrobiyom' },
    ],
  },
  {
    id: 'slide-market',
    tab: 'market',
    badge: '1-EKSİKLE GURME OL',
    badgeEmoji: '🛒 ✨',
    headline: 'Sadece 1 Eksik Malzemeyle Yeni Dünyalar Aç',
    subtext: 'Missing-1 motoru dolabındaki malzemeleri en çok zenginleştirecek 1 kritik ürünü bulur ve Getir/Migros sepetine tek tıkla aktarır.',
    gradient: 'from-cyan-500/20 via-blue-900/30 to-slate-900',
    borderGlow: 'border-cyan-500/50 shadow-cyan-500/20',
    pillColor: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
    visualScene: 'missing_market',
    keyStats: [
      { label: 'Yatırım Getirisi', value: '1 Ürün = +5 Yeni Tarif' },
      { label: 'Pazarım', value: 'Getir & Migros Entegre' },
      { label: 'Akıllı Sepet', value: 'Otomatik Liste' },
    ],
  },
];

export function TourGuide({
  isOpen,
  onClose,
  onNavigateTab,
  soundEnabled,
}: TourGuideProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentSlide = TOUR_SLIDES[currentSlideIndex] || TOUR_SLIDES[0];
  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex === TOUR_SLIDES.length - 1;

  const handleClose = () => {
    setCurrentSlideIndex(0);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      playKitchenSound('cook_success', soundEnabled);
      handleClose();
    } else {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      onNavigateTab(TOUR_SLIDES[nextIdx].tab);
      playKitchenSound('pop', soundEnabled);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIdx);
      onNavigateTab(TOUR_SLIDES[prevIdx].tab);
      playKitchenSound('pop', soundEnabled);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      {/* Onboarding Dialog Box */}
      <div className="relative w-full max-w-lg rounded-t-[32px] sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-800 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Top Header Controls */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${currentSlide.pillColor}`}>
              <span>{currentSlide.badgeEmoji}</span>
              <span>{currentSlide.badge}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Turu Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Visual Scene Graphic Container (Pareto 80/20 Visual-First) */}
        <div className="p-5 space-y-4">
          
          <div className={`relative h-44 sm:h-48 rounded-2xl bg-gradient-to-b ${currentSlide.gradient} border ${currentSlide.borderGlow} p-4 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-500`}>
            
            {/* Background Ambient Glow Circles */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Scene 1: Camera & Voice Scanner */}
            {currentSlide.visualScene === 'camera_mic' && (
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    Multimodal AI Tarama
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300">CANLI 🟢</span>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950/90 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 shadow-lg animate-bounce">
                    <Camera className="w-7 h-7" />
                    <span className="text-[9px] font-bold mt-1 text-slate-300">Fotoğraf</span>
                  </div>

                  <div className="text-xl font-black text-slate-500">+</div>

                  <div className="w-16 h-16 rounded-2xl bg-slate-950/90 border border-teal-500/40 flex flex-col items-center justify-center text-teal-400 shadow-lg">
                    <Mic className="w-7 h-7" />
                    <span className="text-[9px] font-bold mt-1 text-slate-300">Sesli Dikte</span>
                  </div>

                  <div className="text-xl font-black text-slate-500">=</div>

                  <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex flex-col text-[10px] text-emerald-300 font-bold space-y-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Domates (2 Gün)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Kıyma (500g)</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-center font-bold text-slate-300 bg-slate-950/70 py-1 rounded-xl border border-slate-800">
                  ✨ Yapay zeka buzdolabındaki malzemeleri ve son kullanma tarihlerini anında çıkarır.
                </div>
              </div>
            )}

            {/* Scene 2: Airfryer & Zero Waste Cook */}
            {currentSlide.visualScene === 'cook_airfryer' && (
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    Sıfır İsraf & Metabolik Pişirme
                  </span>
                  <span className="text-[11px] font-mono text-amber-300">15 DK KURTARMA ⚡</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-300">Airfryer vs. Fırın</div>
                      <div className="text-[10px] text-slate-300">-%70 Yağ & 12 Dk Hız</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-300">Otomatik Stok Düşümü</div>
                      <div className="text-[10px] text-slate-300">&quot;Pişirdim&quot; = Kiler Güncel</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-center font-bold text-slate-300 bg-slate-950/70 py-1 rounded-xl border border-slate-800">
                  🌱 Biyolojik SKT radarı sayesinde tek bir domates bile çöpe gitmez!
                </div>
              </div>
            )}

            {/* Scene 3: Missing-1 Market Bridge */}
            {currentSlide.visualScene === 'missing_market' && (
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                    Missing-1 Akıllı Köprü
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300">+5 GURME TARİF 🚀</span>
                </div>

                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-center">
                    <div className="text-[10px] text-slate-400">1 Eksik Malzeme</div>
                    <div className="text-xs font-black text-cyan-300 mt-0.5">+ Krem Peynir</div>
                  </div>

                  <div className="text-lg font-black text-cyan-400 animate-pulse">➔</div>

                  <div className="p-2 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-center">
                    <div className="text-[10px] text-slate-400">Açılan Reçete</div>
                    <div className="text-xs font-black text-emerald-300 mt-0.5">Kremalı Fırın Makarna</div>
                  </div>

                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black rounded-xl shadow-md">
                    Getir / Migros Sepetine Ekle 🛒
                  </div>
                </div>

                <div className="text-[11px] text-center font-bold text-slate-300 bg-slate-950/70 py-1 rounded-xl border border-slate-800">
                  🛒 Eksik ürünleri tek tıkla sepetine atıp mutfağını gurme restorana çevir.
                </div>
              </div>
            )}

          </div>

          {/* Slide Text Content (Concise, High Contrast) */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {currentSlide.headline}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSlide.subtext}
            </p>
          </div>

          {/* Quick Key Highlights Grid */}
          <div className="grid grid-cols-3 gap-2">
            {currentSlide.keyStats.map((stat, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 truncate">{stat.label}</div>
                <div className="text-[11px] font-black text-emerald-400 truncate mt-0.5">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Slide Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {TOUR_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  onNavigateTab(slide.tab);
                  playKitchenSound('pop', soundEnabled);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-8 bg-emerald-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={slide.badge}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Atla
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 hover:scale-105"
            >
              {isLast ? (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Hadi Başla 🚀</span>
                </>
              ) : (
                <>
                  <span>İleri</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

