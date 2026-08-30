'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  X,
  MessageSquarePlus,
  Copy,
  Check,
  Star,
  Trash2,
  Download,
  Sparkles,
  Bug,
  Lightbulb,
  ChefHat,
  Eye,
  CheckCircle2,
  Share2,
  Lock,
  Unlock,
  ShieldCheck,
  Sliders,
  Users,
  Zap,
} from 'lucide-react';
import { playKitchenSound } from '@/lib/sound';
import { BacktestRunner } from './BacktestRunner';
import { Ingredient, Recipe, AdminSettings, ZeroWasteStats, ChefDiaryEntry } from '@/lib/types';

export interface AlphaFeedbackItem {
  id: string;
  category: 'bug' | 'feature' | 'recipe_accuracy' | 'ui_ux';
  rating: number;
  note: string;
  timestamp: string;
  resolved?: boolean;
}

interface AlphaFeedbackModalProps {
  soundEnabled: boolean;
  developerUnlockAll?: boolean;
  onToggleDeveloperUnlock?: (unlocked: boolean) => void;
  simulatedUserCount?: number;
  onUpdateSimulatedUserCount?: (count: number) => void;
  ingredients?: Ingredient[];
  recipes?: Recipe[];
  settings?: AdminSettings;
  stats?: ZeroWasteStats;
  diaryEntries?: ChefDiaryEntry[];
  onToast?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

const CATEGORY_MAP = {
  bug: { label: 'Hata / Bug', icon: Bug, color: 'text-rose-400 border-rose-500/30 bg-rose-950/40' },
  recipe_accuracy: { label: 'Tarif & Mutfak İsabeti', icon: ChefHat, color: 'text-amber-400 border-amber-500/30 bg-amber-950/40' },
  feature: { label: 'Yeni Özellik Fikri', icon: Lightbulb, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' },
  ui_ux: { label: 'Görsel / UX Deneyimi', icon: Eye, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' },
};

const TESTING_CHECKLIST = [
  { id: '1', task: 'Kamera / Fotoğraf ile buzdolabı taraması yapıldı mı?' },
  { id: '2', task: 'Mikrofonla Türkçe sesli malzeme girişi ("2 bağ roka, 1 kilo domates") denendi mi?' },
  { id: '3', task: '"Pişirdim" butonuna basılıp stoktan miktar düşümü doğrulandı mı?' },
  { id: '4', task: 'Airfryer vs. Fırın enerji/süre karşılaştırması incelendi mi?' },
  { id: '5', task: '1-Eksik malzeme (Missing-1) önerisi test edildi mi?' },
  { id: '6', task: 'Sosyal Tarif Paylaşımı & Atıksız Topluluk akışı denendi mi?' },
];

export function AlphaFeedbackModal({
  soundEnabled,
  developerUnlockAll = false,
  onToggleDeveloperUnlock,
  simulatedUserCount = 61,
  onUpdateSimulatedUserCount,
  ingredients = [],
  recipes = [],
  settings,
  stats,
  diaryEntries = [],
  onToast,
}: AlphaFeedbackModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'new_note' | 'notes_list' | 'checklist' | 'backtest' | 'developer'>('new_note');
  const [feedbackList, setFeedbackList] = useState<AlphaFeedbackItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kitchzero_alpha_feedback');
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [selectedCategory, setSelectedCategory] = useState<'bug' | 'feature' | 'recipe_accuracy' | 'ui_ux'>('recipe_accuracy');
  const [rating, setRating] = useState<number>(5);
  const [noteText, setNoteText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTasks = localStorage.getItem('kitchzero_alpha_tasks');
        if (storedTasks) return JSON.parse(storedTasks);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const saveFeedbackList = (newList: AlphaFeedbackItem[]) => {
    setFeedbackList(newList);
    try {
      localStorage.setItem('kitchzero_alpha_feedback', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    playKitchenSound('badge_unlock', soundEnabled);

    const newItem: AlphaFeedbackItem = {
      id: `fb-${Date.now()}`,
      category: selectedCategory,
      rating,
      note: noteText.trim(),
      timestamp: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
      resolved: false,
    };

    const updated = [newItem, ...feedbackList];
    saveFeedbackList(updated);
    setNoteText('');
    setActiveSubTab('notes_list');
  };

  const handleDeleteItem = (id: string) => {
    playKitchenSound('pop', soundEnabled);
    const updated = feedbackList.filter((f) => f.id !== id);
    saveFeedbackList(updated);
  };

  const toggleTask = (taskId: string) => {
    playKitchenSound('pop', soundEnabled);
    const updated = completedTasks.includes(taskId)
      ? completedTasks.filter((t) => t !== taskId)
      : [...completedTasks, taskId];
    setCompletedTasks(updated);
    try {
      localStorage.setItem('kitchzero_alpha_tasks', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const copyAllReport = () => {
    playKitchenSound('like', soundEnabled);
    const report = `🧪 ŞefSıfır / ChefZero - Alfa Test Günlüğü & Geri Bildirim Raporu
Tarih: ${new Date().toLocaleDateString('tr-TR')}
Tamamlanan Test Adımları: ${completedTasks.length}/${TESTING_CHECKLIST.length}

=== KAYDEDİLEN TEST NOTLARI (${feedbackList.length}) ===
${
  feedbackList.length === 0
    ? 'Henüz test notu eklenmedi.'
    : feedbackList
        .map(
          (f, idx) =>
            `${idx + 1}. [${CATEGORY_MAP[f.category].label}] (Puan: ${f.rating}/5) [${f.timestamp}]\n   Not: ${f.note}`
        )
        .join('\n\n')
}
`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => {
            playKitchenSound('pop', soundEnabled);
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 border border-emerald-500/50 hover:border-amber-400/80 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)] transition-all duration-300 backdrop-blur-xl active:scale-95"
          title="Alfa Test Notları & Geri Bildirim"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
          </span>

          <FlaskConical className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          
          <span className="text-xs font-bold tracking-tight">
            🧪 Alfa Test <span className="hidden sm:inline">Modu</span>
          </span>

          {feedbackList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
              {feedbackList.length}
            </span>
          )}
        </button>
      </div>

      {/* Test & Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Alfa Test & Geliştirici Günlüğü</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 border border-amber-500/40 text-amber-300">
                      v2.5 Lab
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kişisel test ve 3-4 kişilik alfa geri bildirim konsolu
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-5 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('new_note')}
                className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeSubTab === 'new_note'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Yeni Not / Tespit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('notes_list')}
                className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeSubTab === 'notes_list'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Kayıtlı Notlar</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  {feedbackList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('checklist')}
                className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeSubTab === 'checklist'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Test Kontrol Listesi ({completedTasks.length}/{TESTING_CHECKLIST.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('backtest')}
                className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeSubTab === 'backtest'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-amber-300'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>🚀 2x Backtest</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('developer')}
                className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeSubTab === 'developer'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-amber-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="flex items-center gap-1">
                  <span>Kademeli Kilitler</span>
                  {developerUnlockAll ? (
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-500 text-slate-950 font-black">
                      AÇIK
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-950 border border-amber-500/40 text-amber-300">
                      AKTİF
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: NEW NOTE */}
              {activeSubTab === 'new_note' && (
                <form onSubmit={handleAddFeedback} className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Kategori Seçin:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(CATEGORY_MAP) as Array<keyof typeof CATEGORY_MAP>).map((cat) => {
                        const item = CATEGORY_MAP[cat];
                        const Icon = item.icon;
                        const isSelected = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold ${
                              isSelected
                                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Memnuniyet / İsabet Puanı:
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 w-fit">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-300 ml-2">
                        {rating} / 5 Yıldız
                      </span>
                    </div>
                  </div>

                  {/* Feedback Text Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Gözleminiz veya Geliştirme Notunuz:
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Örn: 'Mikrodalga seçeneği de Airfryer yanına eklense harika olur.' veya 'Domates 2 gün kaldığında acil kurtarma menüsü çok iyi çalıştı.'"
                      rows={4}
                      className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!noteText.trim()}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>Notu Kaydet</span>
                  </button>
                </form>
              )}

              {/* TAB 2: NOTES LIST */}
              {activeSubTab === 'notes_list' && (
                <div className="space-y-3">
                  {feedbackList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                      <MessageSquarePlus className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs font-bold">Henüz kaydedilmiş test notu yok</p>
                      <p className="text-[11px] text-slate-500">
                        Uygulamayı denerken aklınıza gelen fikir veya hataları kaydedin.
                      </p>
                    </div>
                  ) : (
                    feedbackList.map((item) => {
                      const catInfo = CATEGORY_MAP[item.category];
                      const Icon = catInfo.icon;
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${catInfo.color}`}>
                                <Icon className="w-3 h-3" />
                                {catInfo.label}
                              </span>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: item.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.timestamp}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                                title="Notu Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {item.note}
                          </p>
                        </div>
                      );
                    })
                  )}

                  {feedbackList.length > 0 && (
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={copyAllReport}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Panoya Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Tüm Notları Kopyala (Rapor)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Tüm test notları silinsin mi?')) {
                            saveFeedbackList([]);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        Tümünü Temizle
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CHECKLIST */}
              {activeSubTab === 'checklist' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                    💡 <strong>15-30 Günlük Alfa Test Protokolü:</strong> Aşağıdaki senaryoları gerçek yemek pişirirken bizzat deneyin.
                  </div>

                  <div className="space-y-2">
                    {TESTING_CHECKLIST.map((task) => {
                      const isDone = completedTasks.includes(task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                            isDone
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-xs ${isDone ? 'line-through text-slate-400' : 'font-medium'}`}>
                            {task.task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: BACKTEST RUNNER */}
              {activeSubTab === 'backtest' && (
                <div className="space-y-4 animate-fade-in">
                  <BacktestRunner
                    soundEnabled={soundEnabled}
                    onToast={onToast || (() => {})}
                    onRunSimulation={async () => {}}
                    ingredients={ingredients}
                    recipes={recipes}
                    settings={settings || ({
                      simulatedUserCount,
                      developerUnlockAll,
                      geminiModel: 'gemini-3.7-flash',
                      autoDeductOnCook: true,
                      marketLinks: [],
                      metabolicTags: [],
                    } as any)}
                    stats={stats || ({ ingredientsSaved: 15, co2SavedKg: 4.8, waterSavedLiters: 4850, streakDays: 3 } as any)}
                    diaryEntries={diaryEntries}
                  />
                </div>
              )}

              {/* TAB 4: DEVELOPER & FEATURE GATING CONTROL */}
              {activeSubTab === 'developer' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Master Developer Bypass Toggle */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            Tüm Kilitleri Aç (Bypass Test Modu)
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Geliştirici ve testçi olarak üye sayısına takılmadan tüm sekmelere anında erişin.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const next = !developerUnlockAll;
                          if (onToggleDeveloperUnlock) onToggleDeveloperUnlock(next);
                          playKitchenSound(next ? 'badge_unlock' : 'pop', soundEnabled);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                          developerUnlockAll
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {developerUnlockAll ? (
                          <>
                            <Unlock className="w-4 h-4 text-slate-950" />
                            <span>KİLİTLER AÇIK</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span>KİLİTLERİ AÇ</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {developerUnlockAll
                          ? '🌟 Şu an Geliştirici Modu aktif: Topluluk & Şef Sahnesi tam erişilebilir durumda.'
                          : '🔒 Kademeli Büyüme aktif: Kullanıcılar kilitli sekmelerde tanıtım & erken erişim kartı görür.'}
                      </span>
                    </div>
                  </div>

                  {/* Simulated Active Members Control */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-slate-200">
                          Aktif Şef Sayısı Simülasyonu
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs font-mono font-bold text-amber-400 border border-slate-700">
                        {simulatedUserCount} Aktif Şef
                      </span>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="5"
                      value={simulatedUserCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (onUpdateSimulatedUserCount) onUpdateSimulatedUserCount(val);
                      }}
                      className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                    />

                    {/* Fast Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Hızlı Faz Test Önayarları:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateSimulatedUserCount) onUpdateSimulatedUserCount(25);
                            playKitchenSound('pop', soundEnabled);
                          }}
                          className={`p-2 rounded-xl text-left border text-[11px] transition-all ${
                            simulatedUserCount < 100
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold">Faz 1 (25 Şef)</div>
                          <div className="text-[9px] text-slate-500">Tüm Kilitler Aktif</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateSimulatedUserCount) onUpdateSimulatedUserCount(120);
                            playKitchenSound('pop', soundEnabled);
                          }}
                          className={`p-2 rounded-xl text-left border text-[11px] transition-all ${
                            simulatedUserCount >= 100 && simulatedUserCount < 500
                              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold">Faz 2 (120 Şef)</div>
                          <div className="text-[9px] text-slate-500">Topluluk Açık</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateSimulatedUserCount) onUpdateSimulatedUserCount(550);
                            playKitchenSound('pop', soundEnabled);
                          }}
                          className={`p-2 rounded-xl text-left border text-[11px] transition-all ${
                            simulatedUserCount >= 500
                              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold">Faz 3 (550 Şef)</div>
                          <div className="text-[9px] text-slate-500">Şef Sahnesi Açık</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleDeveloperUnlock) onToggleDeveloperUnlock(true);
                            playKitchenSound('badge_unlock', soundEnabled);
                          }}
                          className="p-2 rounded-xl text-left border text-[11px] bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition-all"
                        >
                          <div className="font-bold text-white">Full Bypass</div>
                          <div className="text-[9px] text-emerald-400">100% Tam Erişim</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature Unlocking Matrix Summary */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-300">
                      📊 Kademeli Büyüme Matrisi:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-emerald-400 font-bold">1. Faz: Çekirdek</div>
                        <div className="text-slate-400">0 - 100 Şef (Açık)</div>
                        <div className="text-slate-500 text-[10px]">Mutfak + Öğün + Pazar</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-amber-400 font-bold">2. Faz: Topluluk</div>
                        <div className="text-slate-400">100+ Şef Eşiği</div>
                        <div className="text-slate-500 text-[10px]">Tabak Paylaşımı & Trend</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="text-rose-400 font-bold">3. Faz: Sahne</div>
                        <div className="text-slate-400">500+ Şef Eşiği</div>
                        <div className="text-slate-500 text-[10px]">Canlı Masterclass & Video</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
