'use client';

import React from 'react';
import { Sparkles, Leaf, ArrowRight, ShieldCheck, Flame, Cpu } from 'lucide-react';

interface BrandHeroAccentProps {
  onQuickAddClick?: () => void;
  activeTab?: string;
}

export function BrandHeroAccent({ onQuickAddClick, activeTab = 'pantry' }: BrandHeroAccentProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-950/80 to-slate-900/90 border border-emerald-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl p-4 sm:p-5">
      {/* Background Cyber-Eco Glow Orbs */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Slogan & Value Proposition */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide uppercase text-[10px] font-bold">KitchZero v2.5 AI Core</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium">Biyo-Döngüsel Mutfak</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Dolabındaki Lezzet,</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                  Sıfır İsraf.
                </span>
              </span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
            Eldeki malzemeleri akıllı analizle dönüştürün; karbon ayak izinizi küçültürken hane bütçenizi koruyun.
          </p>
        </div>

        {/* Action / Guarantee Badges */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-medium leading-none">Multimodal</p>
              <p className="text-xs font-bold text-slate-200 leading-tight">Gemini 3.7 Vision</p>
            </div>
          </div>

          {onQuickAddClick && (
            <button
              type="button"
              onClick={onQuickAddClick}
              className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Hızlı Malzeme Tara</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
