'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Sliders,
  Users,
  Lock,
  Unlock,
  ShoppingBag,
  HeartPulse,
  Cpu,
  FileCode,
  Sparkles,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  Copy,
  Download,
  AlertTriangle,
  Zap,
  ExternalLink,
  Layers,
  Settings2,
  Cloud,
  Database,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { AdminSettings, AdminMarketLink, AdminMetabolicTag, Ingredient, ChefDiaryEntry, ZeroWasteStats } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';
import { BacktestRunner } from './BacktestRunner';
import {
  getSupabaseCredentials,
  isSupabaseConfigured,
  getStoredCloudProfile,
  getDeviceInfo,
  broadcastSyncEvent,
} from '@/lib/supabaseClient';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettings;
  onUpdateSettings: (updated: Partial<AdminSettings>) => void;
  ingredients: Ingredient[];
  diaryEntries: ChefDiaryEntry[];
  stats: ZeroWasteStats;
  soundEnabled: boolean;
  onToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export function AdminModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  ingredients,
  diaryEntries,
  stats,
  soundEnabled,
  onToast,
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<'simulation' | 'backtest' | 'affiliate' | 'metabolic' | 'model' | 'cloud' | 'logs'>('simulation');
  const [newTagLabel, setNewTagLabel] = useState<string>('');
  const [newTagDesc, setNewTagDesc] = useState<string>('');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const cloudProfile = getStoredCloudProfile();
  const deviceInfo = getDeviceInfo();
  const supabaseConfigured = isSupabaseConfigured();
  const supabaseCreds = getSupabaseCredentials();

  if (!isOpen) return null;

  // Toggle Affiliate Link Enabled
  const handleToggleMarket = (id: string) => {
    const updated = settings.marketLinks.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    onUpdateSettings({ marketLinks: updated });
    playKitchenSound('pop', soundEnabled);
    onToast('Pazar entegrasyon durumu güncellendi.', 'info');
  };

  // Update Commission Rate
  const handleCommissionChange = (id: string, newRate: number) => {
    const updated = settings.marketLinks.map((m) =>
      m.id === id ? { ...m, commissionPercent: newRate } : m
    );
    onUpdateSettings({ marketLinks: updated });
  };

  // Update Base URL
  const handleUrlChange = (id: string, newUrl: string) => {
    const updated = settings.marketLinks.map((m) =>
      m.id === id ? { ...m, baseUrl: newUrl } : m
    );
    onUpdateSettings({ marketLinks: updated });
  };

  // Toggle Metabolic Tag
  const handleToggleMetabolicTag = (id: string) => {
    const updated = settings.metabolicTags.map((t) =>
      t.id === id ? { ...t, active: !t.active } : t
    );
    onUpdateSettings({ metabolicTags: updated });
    playKitchenSound('pop', soundEnabled);
  };

  // Add Custom Metabolic Tag
  const handleAddMetabolicTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagLabel.trim()) return;

    const newTag: AdminMetabolicTag = {
      id: `tag-${Date.now()}`,
      label: newTagLabel.trim(),
      active: true,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
      description: newTagDesc.trim() || 'Özel tanımlanmış metabolik hedef.',
    };

    onUpdateSettings({
      metabolicTags: [...settings.metabolicTags, newTag],
    });
    setNewTagLabel('');
    setNewTagDesc('');
    playKitchenSound('like', soundEnabled);
    onToast(`"${newTag.label}" metabolik filtresi eklendi.`, 'success');
  };

  // Export Complete System State JSON
  const handleExportSystemJson = () => {
    const data = {
      app: 'ŞefSıfır / ChefZero',
      exportedAt: new Date().toISOString(),
      activeUserSimulation: settings.simulatedUserCount,
      developerUnlockAll: settings.developerUnlockAll,
      geminiModel: settings.geminiModel,
      pantry: ingredients,
      diaryEntries,
      stats,
      marketLinks: settings.marketLinks,
      metabolicTags: settings.metabolicTags,
    };

    const jsonStr = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    playKitchenSound('like', soundEnabled);
    onToast('Tüm sistem verileri ve loglar JSON formatında panoya kopyalandı.', 'success');
    setTimeout(() => setCopiedJson(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950 border border-amber-500/40 text-amber-300">
                  Süper Yönetici Paneli
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  v2.4 Control Tower
                </span>
              </div>
              <h2 className="text-base font-black text-white">
                ŞefSıfır / ChefZero Yönetim & Denetim Merkezi 🎛️
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-slate-950 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kullanıcı & Kilit Simülasyonu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backtest')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'backtest'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-amber-300'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>🚀 2x Otonom Backtest</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('affiliate')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'affiliate'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pazar & Affiliate Yönetimi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metabolic')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'metabolic'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Metabolik Diyet Filtreleri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('model')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'model'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Gemini Modeli & Ayarlar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>☁️ Bulut & Supabase Realtime</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Sistem Logları & JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: USER & FEATURE GATING SIMULATION */}
          {/* ========================================================================= */}
          {activeTab === 'simulation' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Master Developer Bypass */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Full Developer Bypass Modu</span>
                    {settings.developerUnlockAll && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-slate-950">
                        AKTİF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Aktif edildiğinde üye sayısı eşiklerine bakılmaksızın tüm sekmelerin kilidi anında açılır.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !settings.developerUnlockAll;
                    onUpdateSettings({ developerUnlockAll: next });
                    playKitchenSound(next ? 'badge_unlock' : 'pop', soundEnabled);
                    onToast(next ? '👑 Admin: Tüm kilitler açıldı (Bypass Modu).' : '🔒 Admin: Kademeli kilitler devreye alındı.', 'success');
                  }}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-md shrink-0 ${
                    settings.developerUnlockAll
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {settings.developerUnlockAll ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>KİLİTLER AÇIK</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>KİLİTLERİ AÇ (BYPASS)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Slider & Presets */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Aktif Kullanıcı Sayısı Simülasyonu</h4>
                      <p className="text-xs text-slate-400">Gerçek zamanlı büyüme eşiklerini test edin.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-950 text-sm font-mono font-bold text-amber-400 border border-slate-700">
                    {settings.simulatedUserCount} Aktif Şef
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="10"
                  value={settings.simulatedUserCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value, 10);
                    onUpdateSettings({ simulatedUserCount: count });
                  }}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2.5"
                />

                {/* Phased Threshold Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ simulatedUserCount: 45 });
                      playKitchenSound('pop', soundEnabled);
                      onToast('Admin: Faz 1 (0-100 Şef) seviyesine geçildi.', 'info');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.simulatedUserCount < 100
                        ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Faz 1: Çekirdek (45 Şef)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Topluluk & Sahne Kilitli</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ simulatedUserCount: 150 });
                      playKitchenSound('pop', soundEnabled);
                      onToast('Admin: Faz 2 (100+ Şef - Topluluk Açık) seviyesine geçildi.', 'success');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.simulatedUserCount >= 100 && settings.simulatedUserCount < 500
                        ? 'bg-amber-950/50 border-amber-500/60 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Faz 2: Topluluk (150 Şef)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Topluluk Açık, Sahne Kilitli</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ simulatedUserCount: 650 });
                      playKitchenSound('pop', soundEnabled);
                      onToast('Admin: Faz 3 (500+ Şef - Şef Sahnesi Açık) seviyesine geçildi.', 'success');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.simulatedUserCount >= 500
                        ? 'bg-rose-950/50 border-rose-500/60 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Faz 3: Sahne (650 Şef)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Topluluk + Sahne Tam Açık</div>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: DOUBLE CYCLE AUTONOMOUS BACKTEST */}
          {/* ========================================================================= */}
          {activeTab === 'backtest' && (
            <div className="space-y-6 animate-fade-in">
              <BacktestRunner
                soundEnabled={soundEnabled}
                onToast={onToast}
                onRunSimulation={async () => {}}
                ingredients={ingredients}
                recipes={[]}
                settings={settings}
                stats={stats}
                diaryEntries={diaryEntries}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MARKET & AFFILIATE MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'affiliate' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Market & Hızlı Teslimat Entegrasyonları</h3>
                  <p className="text-xs text-slate-400">Missing-1 eksik malzemelerde affiliate yönlendirme URL&apos;leri ve komisyon oranları.</p>
                </div>
              </div>

              <div className="space-y-4">
                {settings.marketLinks.map((market) => (
                  <div
                    key={market.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${market.color}`} />
                        <span className="text-sm font-bold text-white">{market.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({market.id})</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleMarket(market.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          market.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {market.enabled ? 'Aktif' : 'Devre Dışı'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Arama & Affiliate URL Şablonu</label>
                        <input
                          type="text"
                          value={market.baseUrl}
                          onChange={(e) => handleUrlChange(market.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Komisyon Oranı (%)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={market.commissionPercent}
                            onChange={(e) => handleCommissionChange(market.id, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: METABOLIC DIET TAGS */}
          {/* ========================================================================= */}
          {activeTab === 'metabolic' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white">Metabolik Sağlık & Biyo-Beslenme Filtreleri</h3>
                <p className="text-xs text-slate-400">Öğünler sekmesinde kullanıcılara sunulan biyo-hedef rozetlerini yönetin.</p>
              </div>

              {/* Tag List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.metabolicTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tag.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleMetabolicTag(tag.id)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                          tag.active
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {tag.active ? 'Açık' : 'Kapalı'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">{tag.description}</p>
                  </div>
                ))}
              </div>

              {/* Add New Tag Form */}
              <form onSubmit={handleAddMetabolicTag} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 block">Yeni Metabolik Filtre Ekle</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    placeholder="Etiket Adı (Örn: Anti-Enflamatuar)..."
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newTagDesc}
                    onChange={(e) => setNewTagDesc(e.target.value)}
                    placeholder="Kısa Biyo-Açıklama..."
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Filtreyi Ekle</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MODEL & KITCHEN ALGORITHM SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === 'model' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white">Yapay Zeka Modeli & Akıllı Mutfak Parametreleri</h3>
                <p className="text-xs text-slate-400">Gemini model varyantı ve otomatik kiler operasyonları.</p>
              </div>

              <div className="space-y-4">
                {/* Model Selector */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">Gemini Modeli Seçimi</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'En yüksek hız & multimodal vizyon' },
                      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', desc: 'Ultra hafif & hızlı yanıt' },
                      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Derin biyokimyasal analiz & gurme tarif' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ geminiModel: m.id as any });
                          playKitchenSound('like', soundEnabled);
                          onToast(`AI Modeli: ${m.name} olarak güncellendi.`, 'success');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          settings.geminiModel === m.id
                            ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Deduct Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">Otomatik Stok Düşümü (Pişirdim)</h4>
                    <p className="text-[11px] text-slate-400">Yemek pişirildiğinde kullanılan gramajların kilerden otomatik düşülmesi.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ autoDeductOnCook: !settings.autoDeductOnCook });
                      playKitchenSound('pop', soundEnabled);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      settings.autoDeductOnCook
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settings.autoDeductOnCook ? 'AÇIK' : 'KAPALI'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: CLOUD ARCHITECTURE & SUPABASE REALTIME HEALTH */}
          {/* ========================================================================= */}
          {activeTab === 'cloud' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    <span>Supabase PostgreSQL & Realtime Bulut Sağlığı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    MacBook, iPhone Safari ve mobil uygulamalar arası çift yönlü senkronizasyon tablosu.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      supabaseConfigured
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{supabaseConfigured ? 'Supabase Bulut Aktif' : 'Hibrit Realtime Modu'}</span>
                  </span>
                </div>
              </div>

              {/* Status Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Bağlı Cihaz Sayısı</span>
                  <div className="text-base font-black text-cyan-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>{cloudProfile.connectedDevices.length} Aktif Cihaz</span>
                  </div>
                  <span className="text-[9px] text-slate-500">MacBook Pro & iPhone 15</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Son Eşitleme</span>
                  <div className="text-base font-black text-emerald-300">
                    {new Date(cloudProfile.lastSyncAt).toLocaleTimeString('tr-TR')}
                  </div>
                  <span className="text-[9px] text-slate-500">Milisaniyelik Optimistic</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Realtime Gecikme</span>
                  <div className="text-base font-black text-amber-300">
                    &lt; 15 ms
                  </div>
                  <span className="text-[9px] text-slate-500">BroadcastChannel + Pulse</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Kullanıcı UUID</span>
                  <div className="text-xs font-mono font-bold text-purple-300 truncate">
                    {cloudProfile.id}
                  </div>
                  <span className="text-[9px] text-slate-500">{cloudProfile.email}</span>
                </div>
              </div>

              {/* PostgreSQL Schema Overview (sefsifir_cloud_architecture.md) */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>PostgreSQL Tablo Şeması & Kayıt İstatistikleri</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold">pantry_items</span>
                      <span className="text-[10px] text-slate-400 block">Kiler malzemeleri & son kullanma</span>
                    </div>
                    <span className="font-black text-slate-200 font-mono">{ingredients.length} kayıt</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold">shopping_items</span>
                      <span className="text-[10px] text-slate-400 block">Pazarım alışveriş listesi</span>
                    </div>
                    <span className="font-black text-slate-200 font-mono">Aktif Listede</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold">chef_diaries</span>
                      <span className="text-[10px] text-slate-400 block">Kürşad Mutfak Günlüğü notları</span>
                    </div>
                    <span className="font-black text-slate-200 font-mono">{diaryEntries.length} kayıt</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-purple-400 font-bold">zero_waste_stats</span>
                      <span className="text-[10px] text-slate-400 block">CO₂, kurtarılan gıda, su tasarrufu</span>
                    </div>
                    <span className="font-black text-emerald-400 font-mono">{stats.ingredientsSaved} Gıda</span>
                  </div>
                </div>
              </div>

              {/* Instant Realtime Pulse Trigger Test */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Realtime Yayın Testi (Broadcast Test Pulse)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Açık olan diğer tüm sekmelere ve iPhone ekranına anında senkronizasyon sinyali gönderir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    broadcastSyncEvent({
                      type: 'FULL_MERGE',
                      data: { ingredients, diaryEntries, stats },
                    });
                    playKitchenSound('cook_success', soundEnabled);
                    onToast('⚡ Realtime senkronizasyon sinyali tüm bağlı cihazlara yayınlandı!', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/20 shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Canlı Sinyal Gönder</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SYSTEM LOGS & JSON EXPORT */}
          {/* ========================================================================= */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Sistem Logları & JSON Dışa Aktarma</h3>
                  <p className="text-xs text-slate-400">Dolap durumu, günlük kayıtları ve sistem yapılandırmasını dışa aktarın.</p>
                </div>

                <button
                  type="button"
                  onClick={handleExportSystemJson}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
                >
                  {copiedJson ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedJson ? 'Kopyalandı!' : 'JSON Kopyala'}</span>
                </button>
              </div>

              {/* Logs Console Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-60 overflow-y-auto">
                <div className="text-slate-500">--- SİSTEM AKTİF LOGLARI ---</div>
                <div>[INFO] Model: {settings.geminiModel} | Simüle Üye: {settings.simulatedUserCount}</div>
                <div>[STATUS] Kiler Malzeme Adedi: {ingredients.length} | Günlük Notu: {diaryEntries.length}</div>
                <div>[METRICS] Kurtarılan Gıda: {stats.ingredientsSaved} adet | CO₂: {stats.co2SavedKg} kg</div>
                <div>[AUTH] Kürşad Baş Şef Profili Aktif</div>
                {settings.systemLogs?.map((log) => (
                  <div key={log.id} className="text-slate-300">
                    [{log.timestamp}] {log.event} - {log.details}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Tüm değişiklikler anında kaydedilir & reaktiftir.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
