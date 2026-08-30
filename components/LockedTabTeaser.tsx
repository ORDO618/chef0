'use client';

import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  Users,
  Radio,
  Camera,
  Award,
  Flame,
  Video,
  Gift,
  HeartHandshake,
  BellRing,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { FeatureGateConfig } from '@/lib/featureGating';
import { playKitchenSound } from '@/lib/sound';

interface LockedTabTeaserProps {
  config: FeatureGateConfig;
  userSimulatedCount?: number;
  soundEnabled: boolean;
  onBypassUnlock?: () => void;
  onToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

const ICON_MAP = {
  camera: Camera,
  award: Award,
  flame: Flame,
  video: Video,
  sparkles: Sparkles,
  gift: Gift,
  heartHandshake: HeartHandshake,
};

export function LockedTabTeaser({
  config,
  userSimulatedCount,
  soundEnabled,
  onBypassUnlock,
  onToast,
}: LockedTabTeaserProps) {
  const [hasSubscribed, setHasSubscribed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(`kitchzero_early_access_${config.id}`) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [emailInput, setEmailInput] = useState<string>('');
  const [showEmailField, setShowEmailField] = useState<boolean>(false);

  const activeCount = userSimulatedCount !== undefined ? userSimulatedCount : config.currentCount;
  const progressPercent = Math.min(100, Math.round((activeCount / config.targetCount) * 100));
  const remainingCount = Math.max(0, config.targetCount - activeCount);

  const handleSubscribe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playKitchenSound('like', soundEnabled);
    setHasSubscribed(true);
    try {
      localStorage.setItem(`kitchzero_early_access_${config.id}`, 'true');
    } catch {
      // ignore
    }

    if (onToast) {
      onToast(
        `🎉 Harika! ${config.title} açıldığında ilk öncelikli VIP bildirim size gönderilecek.`,
        'success'
      );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
      
      {/* Background Cyber-Eco Glow Orbits */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header & Phase Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-950/80 border border-amber-500/40 text-amber-300">
                Faz {config.phaseNumber} • Kademeli Kilit
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activeCount}/{config.targetCount} Şef
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {config.title}
            </h2>
          </div>
        </div>

        {/* Developer / Alpha Direct Unlock Button */}
        {onBypassUnlock && (
          <button
            type="button"
            onClick={onBypassUnlock}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Geliştirici veya testçi olarak bu sekmenin kilidini anında aç"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>🧪 Alfa Test Modunda Kilidi Aç</span>
          </button>
        )}
      </div>

      {/* Progress Showcase Card */}
      <div className="relative z-10 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Hedefe Kalan Şef Sayısı: <strong className="text-amber-400">{remainingCount} Kişi</strong></span>
          </span>
          <span className="text-emerald-400 font-mono">%{progressPercent} Tamamlandı</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* 3 Value Pillars (Highlights) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.highlights.map((item, idx) => {
          const Icon = ICON_MAP[item.iconName] || Sparkles;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Early Access CTA Action Box */}
      <div className="relative z-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-amber-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Erken Erişim & VIP Lansman Bildirimi</span>
          </h4>
          <p className="text-xs text-slate-400">
            {config.shortTitle} açıldığında ilk bildirim alan öncü grupta yer alın.
          </p>
        </div>

        {hasSubscribed ? (
          <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Erken Erişim Listesine Eklendiniz!</span>
          </div>
        ) : showEmailField ? (
          <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="eposta@ornek.com"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1"
            >
              <span>Kaydet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => handleSubscribe()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <BellRing className="w-4 h-4 stroke-[2.5]" />
            <span>Lansmanda İlk Bildirimi Al</span>
          </button>
        )}
      </div>

    </div>
  );
}
