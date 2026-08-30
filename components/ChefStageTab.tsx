'use client';

import React, { useState } from 'react';
import {
  ChefHat,
  Radio,
  Clock,
  Calendar,
  Users,
  Bell,
  CheckCircle2,
  Sparkles,
  Zap,
  Lightbulb,
  Heart,
  Bookmark,
  ExternalLink,
  Tag,
  Gift,
  Copy,
  Check,
  Video,
  Play,
  ArrowRight,
} from 'lucide-react';
import { ChefMasterclass, KitchenHack, SponsoredDeal } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';

interface ChefStageTabProps {
  masterclasses: ChefMasterclass[];
  hacks: KitchenHack[];
  deals: SponsoredDeal[];
  onToggleRegister: (id: string) => void;
  onLikeHack: (id: string) => void;
  onToggleFavoriteHack: (id: string) => void;
  soundEnabled: boolean;
}

export function ChefStageTab({
  masterclasses,
  hacks,
  deals,
  onToggleRegister,
  onLikeHack,
  onToggleFavoriteHack,
  soundEnabled,
}: ChefStageTabProps) {
  const [selectedHackCategory, setSelectedHackCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeHackModal, setActiveHackModal] = useState<KitchenHack | null>(null);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    playKitchenSound('pop', soundEnabled);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredHacks = selectedHackCategory === 'all'
    ? hacks
    : hacks.filter((h) => h.category === selectedHackCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner: Live Chef Stage Masterclasses */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">Şef Sahnesi & Canlı Masterclass</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-extrabold uppercase flex items-center gap-1.5 animate-pulse">
                  <Radio className="w-3 h-3" /> Canlı Takvim
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Michelin yıldızlı şefler ve uzman diyetisyenlerle sıfır atık gastronomi atölyeleri
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Toplam <strong>1.940+ Şef</strong> Kayıtlı</span>
          </div>
        </div>

        {/* Masterclass Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {masterclasses.map((cls) => (
            <div
              key={cls.id}
              className={`group bg-slate-950 border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between ${
                cls.isRegistered
                  ? 'border-emerald-500/40 bg-emerald-950/10 ring-1 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div>
                {/* Chef Avatar & Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={cls.chefAvatar}
                      alt={cls.chefName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{cls.chefName}</h4>
                      <span className="text-[10px] text-amber-400 block">{cls.chefTitle}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-300">
                    {cls.chefBadge || 'Usta Şef'}
                  </span>
                </div>

                {/* Event Title & Description */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-2">
                  {cls.eventTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {cls.description}
                </p>

                {/* Key Topic Chips */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {cls.keyTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      • {topic}
                    </span>
                  ))}
                </div>

                {/* Sponsored badge if any */}
                {cls.sponsoredBy && (
                  <div className="mt-3 p-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[10px] text-amber-300 flex items-center justify-between">
                    <span>✨ {cls.sponsoredBy.brandName} Özel Hediyesi</span>
                    <strong className="text-emerald-400">%{cls.sponsoredBy.discountCode ? '20 İndirim' : ''}</strong>
                  </div>
                )}
              </div>

              {/* Action Button & Date */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{cls.dateStr}, {cls.timeStr}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playKitchenSound('click', soundEnabled);
                    onToggleRegister(cls.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    cls.isRegistered
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-105'
                  }`}
                >
                  {cls.isRegistered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kayıtlısınız</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Hatırlatıcı Kur</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Hap Mutfak İpuçları" (Video / Reel style Quick Hack Cards) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">Hap Mutfak İpuçları & Bilimsel Tüyolar</h3>
            </div>
            <p className="text-xs text-slate-400">
              Gıda israfını önleyen, pratikliği 3 katına çıkaran bilimsel mutfak sırları
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'canlandirma', label: '🥬 Canlandırma' },
              { id: 'saklama', label: '🧊 Saklama' },
              { id: 'temizlik', label: '🍋 Doğal Temizlik' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedHackCategory(cat.id);
                  playKitchenSound('pop', soundEnabled);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedHackCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hack Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredHacks.map((hack) => (
            <div
              key={hack.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl">{hack.icon}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        playKitchenSound('like', soundEnabled);
                        onLikeHack(hack.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Beğen"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playKitchenSound('pop', soundEnabled);
                        onToggleFavoriteHack(hack.id);
                      }}
                      className={`p-1.5 rounded-lg bg-slate-950 transition-colors ${
                        hack.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                      }`}
                      title="Kaydet"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${hack.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  {hack.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {hack.summary}
                </p>

                {/* Steps preview */}
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                  {hack.steps.slice(0, 2).map((s, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="line-clamp-1">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">{hack.readTime}</span>

                <button
                  type="button"
                  onClick={() => {
                    playKitchenSound('click', soundEnabled);
                    setActiveHackModal(hack);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Adımları Gör</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsorlu İçerik & Ekipman Vitrini (Sponsored Deals & Discounts) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Sponsorlu Ekipman & Sıfır Atık Fırsatları</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">Özel Anlaşmalı Kodlar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 transition-all"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                <img src={deal.imageUrl} alt={deal.productName} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-500/20 text-amber-300">
                    {deal.brand}
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    %{deal.discountPercent} İndirim
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100">{deal.productName}</h4>
                <p className="text-[10px] text-emerald-300 font-medium">🌱 {deal.ecoFeature}</p>

                {/* Price and Coupon Code Box */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs font-black text-slate-100" suppressHydrationWarning>{formatNumber(deal.discountedPrice)} ₺</span>
                    <span className="text-[10px] text-slate-500 line-through ml-1.5" suppressHydrationWarning>
                      {formatNumber(deal.originalPrice)} ₺
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(deal.couponCode)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg flex items-center gap-1 shadow-sm transition-all"
                  >
                    {copiedCode === deal.couponCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === deal.couponCode ? 'Kopyalandı' : deal.couponCode}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hack Detail Modal */}
      {activeHackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeHackModal.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{activeHackModal.title}</h3>
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                    {activeHackModal.category} • {activeHackModal.readTime}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveHackModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300">Uygulama Adımları:</div>
              <ol className="space-y-2">
                {activeHackModal.steps.map((step, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {/* Scientific reason */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Bilimsel Açıklama</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activeHackModal.scientificReason}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveHackModal(null)}
                className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Anladım, Teşekkürler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
