'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  Tag,
  Smile,
  Utensils,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  FileText,
  AlertTriangle,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { ChefDiaryEntry, Ingredient, ShoppingItem } from '@/lib/types';
import { FIFTEEN_DAY_TEST_PROTOCOL, TestingProtocolItem } from '@/lib/diaryAndAdminDefaults';
import { playKitchenSound } from '@/lib/sound';

interface ChefDiaryTabProps {
  entries: ChefDiaryEntry[];
  onAddEntry: (entry: Omit<ChefDiaryEntry, 'id' | 'createdAt'>) => void;
  onUpdateEntry: (id: string, updated: Partial<ChefDiaryEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onResetPantryToClean: () => void;
  onResetPantryToDemo: () => void;
  onAddShoppingItem: (name: string) => void;
  soundEnabled: boolean;
  onToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  ingredientsCount: number;
}

const MOOD_MAP: Record<ChefDiaryEntry['mood'], { label: string; icon: string; color: string }> = {
  harika: { label: 'Harika / Başarılı', icon: '🌟', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
  dengeli: { label: 'Dengeli / Standart', icon: '🥗', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
  kurtarma: { label: 'İsraf Kurtarma', icon: '🌿', color: 'text-teal-400 border-teal-500/40 bg-teal-950/30' },
  deneme: { label: 'Yeni Tarif Denemesi', icon: '🧪', color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
  disarida: { label: 'Dışarıda Yedim', icon: '☕', color: 'text-blue-400 border-blue-500/40 bg-blue-950/30' },
};

export function ChefDiaryTab({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onResetPantryToClean,
  onResetPantryToDemo,
  onAddShoppingItem,
  soundEnabled,
  onToast,
  ingredientsCount,
}: ChefDiaryTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'diary' | 'guide' | 'profile'>('diary');
  
  // New Note Form State
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<ChefDiaryEntry['mood']>('dengeli');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['Kişisel Not']);
  
  // Meal and shopping breakdowns
  const [breakfast, setBreakfast] = useState<string>('');
  const [lunch, setLunch] = useState<string>('');
  const [dinner, setDinner] = useState<string>('');
  const [snacks, setSnacks] = useState<string>('');
  const [todoInput, setTodoInput] = useState<string>('');
  const [shoppingTodos, setShoppingTodos] = useState<string[]>([]);

  // 15-Day Test Protocol Check State (persisted in localStorage)
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kitchzero_test_protocol_completed');
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return ['p1-1', 'p1-2'];
  });

  const [expandedPhaseId, setExpandedPhaseId] = useState<string>('test-phase-1');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toggle Test Step
  const handleToggleStep = (stepId: string) => {
    let next: string[];
    if (completedSteps.includes(stepId)) {
      next = completedSteps.filter((id) => id !== stepId);
      playKitchenSound('pop', soundEnabled);
    } else {
      next = [...completedSteps, stepId];
      playKitchenSound('cook_success', soundEnabled);
    }
    setCompletedSteps(next);
    try {
      localStorage.setItem('kitchzero_test_protocol_completed', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const totalProtocolStepsCount = FIFTEEN_DAY_TEST_PROTOCOL.reduce((acc, p) => acc + p.steps.length, 0);
  const protocolProgressPercent = Math.round((completedSteps.length / totalProtocolStepsCount) * 100);

  // Add Tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Add Shopping Todo
  const handleAddTodo = () => {
    if (!todoInput.trim()) return;
    setShoppingTodos([...shoppingTodos, todoInput.trim()]);
    setTodoInput('');
  };

  // Remove Shopping Todo
  const handleRemoveTodo = (index: number) => {
    setShoppingTodos(shoppingTodos.filter((_, i) => i !== index));
  };

  // Save Note Form
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      onToast('Lütfen başlık ve not içeriğini doldurun.', 'warning');
      return;
    }

    if (editingId) {
      onUpdateEntry(editingId, {
        title: title.trim(),
        content: content.trim(),
        date,
        mood,
        tags,
        meals: {
          breakfast: breakfast.trim() || undefined,
          lunch: lunch.trim() || undefined,
          dinner: dinner.trim() || undefined,
          snacks: snacks.trim() || undefined,
        },
        shoppingTodos,
      });
      onToast('Günlük notu başarıyla güncellendi.', 'success');
      playKitchenSound('like', soundEnabled);
    } else {
      onAddEntry({
        title: title.trim(),
        content: content.trim(),
        date,
        mood,
        tags,
        meals: {
          breakfast: breakfast.trim() || undefined,
          lunch: lunch.trim() || undefined,
          dinner: dinner.trim() || undefined,
          snacks: snacks.trim() || undefined,
        },
        shoppingTodos,
      });
      onToast('Yeni günlük notu kaydedildi.', 'success');
      playKitchenSound('badge_unlock', soundEnabled);
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setMood('dengeli');
    setTags(['Kişisel Not']);
    setBreakfast('');
    setLunch('');
    setDinner('');
    setSnacks('');
    setShoppingTodos([]);
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleStartEdit = (entry: ChefDiaryEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setDate(entry.date);
    setMood(entry.mood);
    setTags(entry.tags || []);
    setBreakfast(entry.meals?.breakfast || '');
    setLunch(entry.meals?.lunch || '');
    setDinner(entry.meals?.dinner || '');
    setSnacks(entry.meals?.snacks || '');
    setShoppingTodos(entry.shoppingTodos || []);
    setIsAddingNew(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Push todo directly to Shopping List tab
  const handlePushToShoppingList = (itemText: string) => {
    onAddShoppingItem(itemText);
    playKitchenSound('like', soundEnabled);
    onToast(`🛒 "${itemText}" Pazarım alışveriş listesine aktarıldı.`, 'success');
  };

  // Smartly extract missing items or shopping items from a note entry and push to Shopping List
  const handleTransferNoteToShoppingList = (entry: ChefDiaryEntry) => {
    const itemsToPush = new Set<string>();

    // 1. Add all direct shoppingTodos
    if (entry.shoppingTodos && entry.shoppingTodos.length > 0) {
      entry.shoppingTodos.forEach((t) => {
        const clean = t.trim();
        if (clean) itemsToPush.add(clean);
      });
    }

    // 2. Scan content & title for ingredients & shopping keywords
    const textPool = `${entry.title} ${entry.content} ${entry.meals?.breakfast || ''} ${entry.meals?.lunch || ''} ${entry.meals?.dinner || ''} ${entry.meals?.snacks || ''}`;
    
    // Common pantry/market ingredient patterns in Turkish
    const knownKeywords = [
      'domates', 'salatalık', 'biber', 'kapya', 'patates', 'soğan', 'sarımsak',
      'havuç', 'kabak', 'patlıcan', 'roka', 'nane', 'maydanoz', 'marul', 'ıspanak',
      'kıyma', 'tavuk', 'kuşbaşı', 'balık', 'somon', 'yumurta', 'süt', 'yoğurt',
      'kaşar', 'beyaz peynir', 'lor', 'tereyağı', 'zeytinyağı', 'zeytin', 'ekmek',
      'un', 'pirinç', 'bulgur', 'makarna', 'nohut', 'mercimek', 'fasulye',
      'limon', 'elma', 'muz', 'ceviz', 'fındık', 'badem', 'yulaf', 'krema'
    ];

    const lowerText = textPool.toLowerCase();
    
    // Check for buy/need signals in sentences
    const sentences = lowerText.split(/[.,\n;!?]+/);
    sentences.forEach((sentence) => {
      if (
        sentence.includes('al') ||
        sentence.includes('lazım') ||
        sentence.includes('eksik') ||
        sentence.includes('bitti') ||
        sentence.includes('alınacak') ||
        sentence.includes('plan')
      ) {
        knownKeywords.forEach((kw) => {
          if (sentence.includes(kw)) {
            itemsToPush.add(kw.charAt(0).toUpperCase() + kw.slice(1));
          }
        });
      }
    });

    // Also look for keywords in tags
    entry.tags?.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      knownKeywords.forEach((kw) => {
        if (lowerTag.includes(kw)) {
          itemsToPush.add(kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      });
    });

    // Fallback: If no specific keywords matched, add clean title keywords or prompt
    if (itemsToPush.size === 0) {
      if (entry.title.trim()) {
        itemsToPush.add(entry.title.trim());
      } else {
        itemsToPush.add('Eksik Mutfak İhtiyaçları');
      }
    }

    // Push each item to shopping list
    itemsToPush.forEach((item) => {
      onAddShoppingItem(item);
    });

    playKitchenSound('badge_unlock', soundEnabled);
    onToast(`🛒 [${Array.from(itemsToPush).join(', ')}] Pazarım listesine aktarıldı!`, 'success');
  };

  // Copy Full Diary & Test Log
  const handleCopyFullLog = () => {
    const text = `👨‍🍳 ŞefSıfır — Kürşad Mutfak Günlüğü ve Test Kaydı
Tarih: ${new Date().toLocaleDateString('tr-TR')}
Kilerdeki Malzeme Sayısı: ${ingredientsCount}
Tamamlanan 15 Günlük Test Adımı: ${completedSteps.length}/${totalProtocolStepsCount} (%${protocolProgressPercent})

=== GÜNLÜK NOTLARI (${entries.length} Adet) ===
${entries
  .map(
    (e, idx) => `
[Not ${idx + 1}] Tarih: ${e.date} | Ruh Hali: ${MOOD_MAP[e.mood]?.label || e.mood}
Başlık: ${e.title}
İçerik: ${e.content}
${e.meals?.breakfast ? `• Sabah: ${e.meals.breakfast}\n` : ''}${e.meals?.lunch ? `• Öğle: ${e.meals.lunch}\n` : ''}${e.meals?.dinner ? `• Akşam: ${e.meals.dinner}\n` : ''}${e.meals?.snacks ? `• Ara Öğün: ${e.meals.snacks}\n` : ''}${e.shoppingTodos?.length ? `• Alışveriş Planı: ${e.shoppingTodos.join(', ')}\n` : ''}Etiketler: ${e.tags.join(', ')}
-------------------------------------------`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    playKitchenSound('like', soundEnabled);
    onToast('Tüm günlük ve test kayıtları panoya kopyalandı.', 'success');
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      entry.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner: Kürşad's Profile Badge & Diary Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/50 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-2xl">
                👨‍🍳
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  Kurucu & Baş Şef Profili
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Şef Kürşad
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                Kürşad’ın Mutfak Günlüğü & Test Odası 📝
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Günlük dışarıda yediklerini, yarının alışveriş planını ve kuru gıdadan buzluğa tüm mutfak denemelerini serbestçe kaydet.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleCopyFullLog}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Tüm Günlüğü Panoya Kopyala"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedAll ? 'Kopyalandı!' : 'Raporu Kopyala'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAddingNew(true);
                setEditingId(null);
                playKitchenSound('click', soundEnabled);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Yeni Günlük Notu Yaz</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="relative z-10 flex items-center gap-2 border-t border-slate-800/80 pt-4 mt-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('diary');
              playKitchenSound('click', soundEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'diary'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mutfak Notlarım ({entries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('guide');
              playKitchenSound('click', soundEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>15 Günlük Test Kılavuzu</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeSubTab === 'guide' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'
            }`}>
              %{protocolProgressPercent}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('profile');
              playKitchenSound('click', soundEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-purple-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Profil & Kiler Sıfırlama</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: DIARY NOTES & FORM */}
      {/* ========================================================================= */}
      {activeSubTab === 'diary' && (
        <div className="space-y-6">

          {/* New / Edit Note Card Form */}
          {isAddingNew && (
            <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    {editingId ? 'Günlük Notunu Düzenle' : 'Yeni Mutfak & Günlük Notu'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  İptal Et
                </button>
              </div>

              <form onSubmit={handleSubmitEntry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Not Başlığı
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Kahvaltıyı dışarıda yaptık, akşam Airfryer denemesi..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Tarih
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Mood / Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Günün Mutfak Ruh Hali
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.keys(MOOD_MAP) as Array<ChefDiaryEntry['mood']>).map((mKey) => {
                      const item = MOOD_MAP[mKey];
                      const isSelected = mood === mKey;
                      return (
                        <button
                          key={mKey}
                          type="button"
                          onClick={() => setMood(mKey)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span className="truncate">{item.label.split('/')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Serbest Content */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Serbest Not Alanı (Detaylar, Pişirme Deneyimleri, Dolap Durumu)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bugün mutfakta neler oldu? Hangi malzemeler kurtarıldı? Neler tüketildi? Yarın için planlar..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                {/* Optional: Öğün Notları Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    <span>Öğün Detayları (İsteğe Bağlı)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <input
                      type="text"
                      value={breakfast}
                      onChange={(e) => setBreakfast(e.target.value)}
                      placeholder="🍳 Kahvaltı: Dışarıda serpme veya evde yumurta..."
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={lunch}
                      onChange={(e) => setLunch(e.target.value)}
                      placeholder="🥗 Öğle: Hafif salata veya iş yeri menüsü..."
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={dinner}
                      onChange={(e) => setDinner(e.target.value)}
                      placeholder="🍲 Akşam: Airfryer sebze + mercimek çorbası..."
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={snacks}
                      onChange={(e) => setSnacks(e.target.value)}
                      placeholder="☕ Ara Öğün: Badem, yeşil çay, meyve..."
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Shopping Todos for Tomorrow */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>Yarının Alışveriş & Eksik Planı</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={todoInput}
                      onChange={(e) => setTodoInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTodo())}
                      placeholder="Örn: 2 kg Çanakkale domatesi, taze nane, zeytinyağı..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTodo}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                    >
                      Ekle
                    </button>
                  </div>

                  {shoppingTodos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {shoppingTodos.map((todo, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5"
                        >
                          <span>{todo}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTodo(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Etiketler
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Etiket yazıp enter'a basın (örn: KuruGıda, Airfryer, Dışarıda)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold shrink-0"
                    >
                      Etiket Ekle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{editingId ? 'Değişiklikleri Kaydet' : 'Günlüğe Ekle'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Günlük notlarında ara..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Toplam <strong>{filteredEntries.length}</strong> günlük notu gösteriliyor
            </div>
          </div>

          {/* Diary Entries List */}
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Henüz Günlük Notu Bulunamadı</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bugün dışarıda yediklerini veya dolapta planladığın akşam yemeğini yukarıdaki butona tıklayarak kaydet.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all"
              >
                İlk Notu Yaz ✍️
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredEntries.map((entry) => {
                const moodConfig = MOOD_MAP[entry.mood] || MOOD_MAP.dengeli;
                return (
                  <div
                    key={entry.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 group shadow-md"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${moodConfig.color}`}>
                          <span>{moodConfig.icon}</span>
                          <span>{moodConfig.label}</span>
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                          title="Notu Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Bu günlük notunu silmek istediğinizden emin misiniz?')) {
                              onDeleteEntry(entry.id);
                              playKitchenSound('pop', soundEnabled);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-all text-xs"
                          title="Notu Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Body */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white">
                        {entry.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>

                    {/* Meal Breakdowns if any */}
                    {entry.meals && (entry.meals.breakfast || entry.meals.lunch || entry.meals.dinner || entry.meals.snacks) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
                        {entry.meals.breakfast && (
                          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">🍳 Kahvaltı</span>
                            <span className="text-slate-300 font-medium">{entry.meals.breakfast}</span>
                          </div>
                        )}
                        {entry.meals.lunch && (
                          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">🥗 Öğle</span>
                            <span className="text-slate-300 font-medium">{entry.meals.lunch}</span>
                          </div>
                        )}
                        {entry.meals.dinner && (
                          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">🍲 Akşam</span>
                            <span className="text-slate-300 font-medium">{entry.meals.dinner}</span>
                          </div>
                        )}
                        {entry.meals.snacks && (
                          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">☕ Ara Öğün</span>
                            <span className="text-slate-300 font-medium">{entry.meals.snacks}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Shopping Todos for Next Day */}
                    {entry.shoppingTodos && entry.shoppingTodos.length > 0 && (
                      <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          <span>Alışveriş & Malzeme Planı</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {entry.shoppingTodos.map((todo, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2"
                            >
                              <span>{todo}</span>
                              <button
                                type="button"
                                onClick={() => handlePushToShoppingList(todo)}
                                className="px-1.5 py-0.2 rounded bg-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold text-amber-300 transition-colors"
                                title="Pazarım Listesine Aktar"
                              >
                                + Listeme Ekle
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags & Smart Market Transfer Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {entry.tags && entry.tags.length > 0 ? (
                          entry.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-medium text-emerald-400 border border-slate-800"
                            >
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">#KürşadMutfakGünlüğü</span>
                        )}
                      </div>

                      {/* 🛒 Smart Transfer Button to Pazarım */}
                      <button
                        type="button"
                        onClick={() => handleTransferNoteToShoppingList(entry)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
                        title="Notun içindeki eksik ürünleri ve alışveriş planını Pazarım sekmesine aktar"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>🛒 Notu Alışveriş Listesine Aktar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: 15-DAY TEST PROTOCOL & GUIDE */}
      {/* ========================================================================= */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950 border border-amber-500/40 text-amber-300">
                  Bireysel Test Protokolü
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  15 Günlük Bireysel Test ve Kullanım Kılavuzu 🧭
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Kuru gıdalardan başlayıp buzdolabına, artıklardan admin paneline adım adım test rehberi.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center sm:text-right shrink-0">
                <span className="text-xs text-slate-400 font-bold block">İlerleme Durumu</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {completedSteps.length} / {totalProtocolStepsCount}
                </span>
                <span className="text-[10px] text-slate-500 block">Adım Tamamlandı</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${protocolProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Phases Accordion */}
          <div className="space-y-4">
            {FIFTEEN_DAY_TEST_PROTOCOL.map((phase) => {
              const isExpanded = expandedPhaseId === phase.id;
              const phaseCompletedCount = phase.steps.filter((s) => completedSteps.includes(s.id)).length;
              const isPhaseDone = phaseCompletedCount === phase.steps.length;

              return (
                <div
                  key={phase.id}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-slate-900/90 border-slate-700 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedPhaseId(isExpanded ? '' : phase.id);
                      playKitchenSound('click', soundEnabled);
                    }}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-black text-white shrink-0">
                        {isPhaseDone ? '✅' : phase.dayRange.split(' ')[1]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${phase.badgeColor}`}>
                            {phase.dayRange}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {phaseCompletedCount}/{phase.steps.length} Tamamlandı
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          {phase.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Body Steps */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                      <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        🎯 <strong>Amaç:</strong> {phase.objective}
                      </p>

                      <div className="space-y-2.5">
                        {phase.steps.map((step) => {
                          const isDone = completedSteps.includes(step.id);
                          return (
                            <div
                              key={step.id}
                              onClick={() => handleToggleStep(step.id)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                isDone
                                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <div className="mt-0.5 text-emerald-400 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 fill-emerald-400 text-slate-950" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-600" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className={`text-xs sm:text-sm font-bold ${isDone ? 'line-through opacity-80 text-emerald-200' : 'text-slate-100'}`}>
                                  {step.text}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded-md inline-block">
                                  {step.actionHint}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: PROFILE & PANTRY RESET CONTROLS */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">
                Profil & Kiler Veri Yönetimi ⚙️
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kendi mutfağını sıfırdan kurmak veya tek tıkla zengin demo kilerini geri yüklemek için aşağıdaki araçları kullanabilirsin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Clean Profile Setup */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Dolabımı Tamamen Sıfırla (Temiz Başlangıç)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kilerdeki tüm örnek malzemeleri temizler ve sana bomboş bir mutfak açar. Böylece evindeki gerçek kuru gıda ve taze ürünleri sıfırdan girebilirsin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kilerdeki tüm malzemeleri silip sıfırdan temiz bir mutfak başlatmak istediğinizden emin misiniz?')) {
                      onResetPantryToClean();
                      playKitchenSound('pop', soundEnabled);
                      onToast('Kiler sıfırlandı. Temiz mutfak hazır!', 'success');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all w-full flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Kileri Sıfırla (Temiz Profil)</span>
                </button>
              </div>

              {/* Demo Pantry Restore */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Örnek Demo Dolabını Yeniden Yükle
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tüm özellikleri hızlıca test etmek için yumurta, tavuk, mercimek, bayat ekmek gibi hazır kiler verilerini geri yükler.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onResetPantryToDemo();
                    playKitchenSound('badge_unlock', soundEnabled);
                    onToast('Örnek demo dolabı başarıyla yüklendi.', 'success');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all w-full flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Örnek Demo Kilerini Yükle</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
