'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Ingredient } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';

interface FreshnessRadarProps {
  ingredients: Ingredient[];
  onGenerateRescueMenu: (expiringIngredients: Ingredient[]) => void;
  soundEnabled: boolean;
}

export function FreshnessRadar({
  ingredients,
  onGenerateRescueMenu,
  soundEnabled,
}: FreshnessRadarProps) {
  const { urgentItems, warningItems, safeItems, freshnessScore } = useMemo(() => {
    if (ingredients.length === 0) {
      return { urgentItems: [], warningItems: [], safeItems: [], freshnessScore: 100 };
    }

    const urgent: Ingredient[] = [];
    const warning: Ingredient[] = [];
    const safe: Ingredient[] = [];

    ingredients.forEach((item) => {
      const days = item.daysUntilExpiry ?? 7;
      if (item.isPriority || days <= 3) {
        urgent.push(item);
      } else if (days <= 7) {
        warning.push(item);
      } else {
        safe.push(item);
      }
    });

    const totalWeight = ingredients.length;
    const weightedSum = safe.length * 100 + warning.length * 60 + urgent.length * 15;
    const score = Math.max(10, Math.min(100, Math.round(weightedSum / totalWeight)));

    return {
      urgentItems: urgent,
      warningItems: warning,
      safeItems: safe,
      freshnessScore: score,
    };
  }, [ingredients]);

  const handleRescueClick = () => {
    playKitchenSound('click', soundEnabled);
    onGenerateRescueMenu(urgentItems.length > 0 ? urgentItems : ingredients.slice(0, 3));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreTrackGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-500';
  };

  const mostCritical = urgentItems[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 px-4 py-3 shadow-lg transition-all hover:border-slate-700/80">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Score & Minimalist Meter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Tazelik
            </span>
            <span className={`text-sm font-black tracking-tight ${getScoreColor(freshnessScore)}`}>
              %{freshnessScore}
            </span>
          </div>

          {/* Minimalist Smooth Progress Bar */}
          <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800/90 overflow-hidden relative">
            <div
              className={`h-full bg-gradient-to-r ${getScoreTrackGradient(freshnessScore)} transition-all duration-700 ease-out`}
              style={{ width: `${freshnessScore}%` }}
            />
          </div>
        </div>

        {/* Center / Right: Critical Status Pill or Safe Message */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {urgentItems.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>
                  {urgentItems.length} Ürün Kritik • <strong className="text-rose-200">{mostCritical?.name}</strong>
                  {urgentItems.length > 1 ? ` (+${urgentItems.length - 1})` : ''}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRescueClick}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Kurtar</span>
              </button>
            </div>
          ) : warningItems.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{warningItems.length} ürün orta vadede (4-7 gün)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tüm malzemeler taze & güvenli</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
