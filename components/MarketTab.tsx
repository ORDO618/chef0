'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Share2,
  Copy,
  Check,
  Store,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  PackageCheck,
  Send,
  Zap,
  BarChart3,
  DollarSign,
  PieChart as PieIcon,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { ShoppingItem, Missing1Suggestion, IngredientCategory, MonthlySavingsPoint } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';

interface MarketTabProps {
  shoppingList: ShoppingItem[];
  missingSuggestions: Missing1Suggestion[];
  monthlySavings: MonthlySavingsPoint[];
  onToggleShoppingItem: (id: string) => void;
  onRemoveShoppingItem: (id: string) => void;
  onAddShoppingItem: (name: string, category: IngredientCategory, amount?: number, unit?: string, price?: number) => void;
  onRestockCheckedItems: () => void;
  onAddMissingToShoppingList: (suggestion: Missing1Suggestion) => void;
  onRefreshMissingSuggestions: () => Promise<void>;
  isRefreshingMissing: boolean;
  soundEnabled: boolean;
}

export function MarketTab({
  shoppingList,
  missingSuggestions,
  monthlySavings,
  onToggleShoppingItem,
  onRemoveShoppingItem,
  onAddShoppingItem,
  onRestockCheckedItems,
  onAddMissingToShoppingList,
  onRefreshMissingSuggestions,
  isRefreshingMissing,
  soundEnabled,
}: MarketTabProps) {
  const [newItemName, setNewItemName] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory>('sebze_meyve');
  const [selectedMarketModal, setSelectedMarketModal] = useState<{
    name: string;
    utmLink: string;
    eta: string;
  } | null>(null);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddShoppingItem(newItemName.trim(), selectedCategory, 1, 'adet', 25);
    playKitchenSound('pop', soundEnabled);
    setNewItemName('');
  };

  // WhatsApp Share Formatter
  const handleWhatsAppShare = () => {
    playKitchenSound('click', soundEnabled);
    const activeItems = shoppingList.filter((i) => !i.checked);
    if (activeItems.length === 0) {
      alert('Alışveriş listenizde henüz alınacak ürün bulunmuyor.');
      return;
    }

    const text = `🛒 *ŞefSıfır / KitchZero Alışveriş Listem:*\n\n` +
      activeItems.map((item, idx) => `${idx + 1}. ${item.name} (${item.amount || 1} ${item.unit || 'adet'})`).join('\n') +
      `\n\n🌱 _Sıfır israf mutfak için akıllıca planlandı!_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Copy to Clipboard
  const handleCopy = () => {
    playKitchenSound('click', soundEnabled);
    const activeItems = shoppingList.filter((i) => !i.checked);
    const text = `ŞefSıfır Alışveriş Listesi:\n` +
      activeItems.map((item) => `- ${item.name} (${item.amount || 1} ${item.unit || 'adet'})`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Handle Affiliate / UTM Transfer Modal
  const handleOpenMarketCart = (marketName: string, eta: string) => {
    playKitchenSound('pop', soundEnabled);
    const activeItems = shoppingList.filter((i) => !i.checked);
    const itemQuery = encodeURIComponent(activeItems.map((i) => i.name).join(','));
    const utmLink = `https://${marketName.toLowerCase().replace(/\s+/g, '')}.com/cart?utm_source=kitchzero&utm_medium=smart_cart&utm_campaign=zero_waste&items=${itemQuery}`;
    setSelectedMarketModal({ name: marketName, utmLink, eta });
  };

  const checkedCount = shoppingList.filter((i) => i.checked).length;
  const activeItems = shoppingList.filter((i) => !i.checked);
  const totalPrice = activeItems.reduce((acc, item) => acc + (item.estimatedPrice || 25), 0);

  // Category breakdown for chart
  const CATEGORY_DISTRIBUTION = [
    { name: 'Sebze & Meyve', value: 38, color: '#10b981' },
    { name: 'Süt & Kahvaltılık', value: 26, color: '#f59e0b' },
    { name: 'Et & Protein', value: 22, color: '#ef4444' },
    { name: 'Kuru Gıda & Yağ', value: 14, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: "1 Eksik Malzeme ile Neler Yapabilirsin?" (Missing-1 Magic) */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-amber-950/20 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">
                  1 Eksik Malzeme ile Neler Yapabilirsin?
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-400 text-slate-950">
                  Missing-1 Magic
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dolabınıza sadece tek bir stratejik malzeme ekleyerek açabileceğiniz gurme tarifler
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isRefreshingMissing}
            onClick={() => {
              playKitchenSound('click', soundEnabled);
              onRefreshMissingSuggestions();
            }}
            className="px-3.5 py-2 bg-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMissing ? 'animate-spin' : ''}`} />
            <span>Yeni Öneriler Tara</span>
          </button>
        </div>

        {/* 3 Missing-1 Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {missingSuggestions.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    + {item.missingIngredientName}
                  </span>
                  {item.estimatedPriceTl && (
                    <span className="text-xs font-bold text-amber-400">
                      ~{item.estimatedPriceTl}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mt-2">
                  {item.unlocksRecipeTitle}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.recipeDescription}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.whyThisItem}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-semibold">
                  +{item.additionalRecipesCount || 3} alternatif tarif
                </span>

                <button
                  type="button"
                  onClick={() => {
                    playKitchenSound('pop', soundEnabled);
                    onAddMissingToShoppingList(item);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Listeme Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Shopping List Manager + Quick Market Affiliate Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (7 cols): Shopping List Manager */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span>Dinamik Alışveriş Listem</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
                  {shoppingList.length} Ürün
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pişirdikçe tükenenler ve 1-Eksik öneriler burada toplanır.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="WhatsApp ile Paylaş"
              >
                <Send className="w-3.5 h-3.5" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Panoya Kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          {/* Fast Add Shopping Item Form */}
          <form onSubmit={handleManualAdd} className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Alınacak ürün ekle (Örn: Krema, Süt, Zeytinyağı)..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as IngredientCategory)}
              className="px-2.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
            >
              <option value="sebze_meyve">Sebze & Meyve</option>
              <option value="sut_kahvaltilik">Süt & Kahvaltılık</option>
              <option value="et_tavuk_balik">Et & Protein</option>
              <option value="kuru_gida">Kuru Gıda</option>
              <option value="baharat_sos">Baharat & Yağ</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </button>
          </form>

          {/* List of Shopping Items */}
          {shoppingList.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-50" />
              <p className="text-sm font-medium text-slate-400">Alışveriş listeniz şu an boş.</p>
              <p className="text-xs text-slate-500 mt-1">
                Yemek pişirdikçe eksilen malzemeler veya 1-Eksik öneriler buraya eklenecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    item.checked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => {
                      playKitchenSound('click', soundEnabled);
                      onToggleShoppingItem(item.id);
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <button type="button" className="text-emerald-400 shrink-0">
                      {item.checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-600" />}
                    </button>
                    <div>
                      <span className={`text-xs font-semibold ${item.checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {item.source === 'auto_deducted' && (
                          <span className="text-amber-400 font-medium">⚡ Pişirmeden Eksildi</span>
                        )}
                        {item.source === 'missing_1' && (
                          <span className="text-emerald-400 font-medium">✨ 1-Eksik Önerisi</span>
                        )}
                        {item.estimatedPrice && <span className="text-slate-400 font-medium">~{item.estimatedPrice} ₺</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveShoppingItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Total Price & Restock Action */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              <span>Tahmini Sepet Tutarı: </span>
              <strong className="text-amber-400 text-sm font-black">{totalPrice} ₺</strong>
            </div>

            {checkedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  playKitchenSound('cook_success', soundEnabled);
                  onRestockCheckedItems();
                }}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                <span>{checkedCount} Ürünü Mutfağa Geri Yükle</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Col (5 cols): Direct Cart UTM/Affiliate Integrations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Tek Tıkla Market Sepetine Aktar</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Listenizdeki <strong>{activeItems.length} adet</strong> ürünü anlaşmalı online marketlere aktararak gereksiz fazla alımdan kaçının:
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Getir Market', eta: '10-15 dk', color: 'hover:border-purple-500/50 hover:bg-purple-950/20', tag: 'Hızlı Kurye' },
                { name: 'Yemeksepeti Market', eta: '15-25 dk', color: 'hover:border-rose-500/50 hover:bg-rose-950/20', tag: 'Süper İndirim' },
                { name: 'Migros Sanal Market', eta: 'Planlı Teslimat', color: 'hover:border-orange-500/50 hover:bg-orange-950/20', tag: 'Geniş Stok' },
                { name: 'Trendyol Go', eta: '20-30 dk', color: 'hover:border-amber-500/50 hover:bg-amber-950/20', tag: 'Mahalle Esnafı' },
              ].map((market, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenMarketCart(market.name, market.eta)}
                  className={`cursor-pointer p-3 rounded-2xl bg-slate-950 border border-slate-800 ${market.color} flex items-center justify-between text-xs transition-all hover:scale-[1.02]`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{market.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 font-medium">{market.tag}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{market.eta}</span>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg flex items-center gap-1 text-[11px]"
                  >
                    <span>Sepete Aktar</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sıfır İsraf Bütçe Sırrı</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Sadece eksik malzemeleri net gramajıyla satın alarak ayda ortalama <strong>~2.400 ₺</strong> bütçe tasarrufu sağlarsınız.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Savings and Budget Analysis Interactive Charts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Aylık Tasarruf ve Bütçe Analiz Grafiği</h3>
              <p className="text-xs text-slate-400">
                Evdeki malzemeleri pişirerek kurtardığınız reel maddi ve ekolojik getiri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              Yıllık Projeksiyon: ~14.880 ₺
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Area Chart (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="text-slate-300 font-semibold">Aylık Parasal Tasarruf Trendi (TL)</span>
              <span className="text-emerald-400 font-bold">Son 5 Ay Gelişimi</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySavings} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} ₺`, 'Kurtarılan Tutar']}
                  />
                  <Area
                    type="monotone"
                    dataKey="savedTl"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#savedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Bar (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Kurtarılan Gıda Kategori Dağılımı
              </div>

              <div className="space-y-2.5">
                {CATEGORY_DISTRIBUTION.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{cat.name}</span>
                      <strong className="text-slate-100">%{cat.value}</strong>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
              💡 <strong>En Çok Kurtarılan:</strong> Sebze ve meyveler çabuk bozulduğu için en yüksek tasarruf potansiyelini oluşturur.
            </div>
          </div>
        </div>
      </div>

      {/* Market Cart UTM / Affiliate Simulator Modal */}
      {selectedMarketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">{selectedMarketModal.name} Sepet Entegrasyonu</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMarketModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Aşağıdaki <strong>{activeItems.length} ürün</strong> otomatik olarak {selectedMarketModal.name} sepetinize aktarılmak üzere hazırlandı:
              </p>

              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {activeItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 py-0.5">
                    <span>• {item.name}</span>
                    <span className="text-slate-500">~{item.estimatedPrice || 25} ₺</span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono break-all">
                UTM Link: {selectedMarketModal.utmLink.slice(0, 70)}...
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedMarketModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  playKitchenSound('click', soundEnabled);
                  alert(`${selectedMarketModal.name} uygulamasına güvenli yönlendirme yapıldı!`);
                  setSelectedMarketModal(null);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Markete Git ve Sepeti Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
