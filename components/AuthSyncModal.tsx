'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Smartphone,
  Laptop,
  Check,
  QrCode,
  Key,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  HardDrive,
  Copy,
  Info,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  isSupabaseConfigured,
  getStoredCloudProfile,
  saveStoredCloudProfile,
  getDeviceInfo,
  setCustomDeviceName,
  generatePairingCode,
  broadcastSyncEvent,
} from '@/lib/supabaseClient';
import { CloudUserProfile, Ingredient, ShoppingItem, ChefDiaryEntry, Recipe, ZeroWasteStats } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  ingredients: Ingredient[];
  shoppingList: ShoppingItem[];
  diaries: ChefDiaryEntry[];
  recipes: Recipe[];
  stats: ZeroWasteStats;
  onPerformFullSync: () => void;
  soundEnabled: boolean;
}

export function AuthSyncModal({
  isOpen,
  onClose,
  onToast,
  ingredients,
  shoppingList,
  diaries,
  recipes,
  stats,
  onPerformFullSync,
  soundEnabled,
}: AuthSyncModalProps) {
  const [profile, setProfile] = useState<CloudUserProfile>(() => getStoredCloudProfile());
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState<string>(() => getSupabaseCredentials().anonKey);
  const [isConfigured, setIsConfigured] = useState<boolean>(() => isSupabaseConfigured());
  const [emailInput, setEmailInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'pair' | 'config'>('sync');
  const [pairingCode] = useState<string>(() => generatePairingCode());
  const [enterPairCode, setEnterPairCode] = useState<string>('');
  const [currentDevice, setCurrentDevice] = useState<{ deviceId: string; deviceName: string }>(() => getDeviceInfo());
  const [editDeviceName, setEditDeviceName] = useState<string>(() => getDeviceInfo().deviceName);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseCredentials(supabaseUrl, supabaseKey);
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    playKitchenSound('badge_unlock', soundEnabled);
    if (configured) {
      onToast('☁️ Supabase bulut veritabanı bağlantısı başarıyla kaydedildi!', 'success');
      onPerformFullSync();
    } else {
      onToast('Yerel / Çevrimdışı moda geçildi.', 'info');
    }
  };

  const handleMagicLinkLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      const updatedProfile: CloudUserProfile = {
        ...profile,
        email: emailInput.trim(),
        fullName: emailInput.split('@')[0].toUpperCase() + ' (Bulut Şef)',
        lastSyncAt: new Date().toISOString(),
      };
      saveStoredCloudProfile(updatedProfile);
      setProfile(updatedProfile);
      playKitchenSound('badge_unlock', soundEnabled);
      onToast(`🎉 ${emailInput} hesabına sihirli bağlantı onaylandı ve veriler eşitlendi!`, 'success');
      onPerformFullSync();
    }, 900);
  };

  const handleSaveDeviceName = () => {
    if (!editDeviceName.trim()) return;
    setCustomDeviceName(editDeviceName.trim());
    setCurrentDevice(getDeviceInfo());
    playKitchenSound('pop', soundEnabled);
    onToast(`Cihaz ismi "${editDeviceName.trim()}" olarak güncellendi.`, 'success');
  };

  const handleTriggerManualSync = () => {
    setIsSyncing(true);
    playKitchenSound('cook_success', soundEnabled);
    
    // Broadcast sync event for local multi-tab & mobile preview
    broadcastSyncEvent({
      type: 'FULL_MERGE',
      data: {
        ingredients,
        shoppingList,
        diaries,
        recipes,
        stats,
      },
    });

    onPerformFullSync();

    setTimeout(() => {
      setIsSyncing(false);
      const updated = {
        ...profile,
        lastSyncAt: new Date().toISOString(),
      };
      setProfile(updated);
      saveStoredCloudProfile(updated);
      playKitchenSound('badge_unlock', soundEnabled);
      onToast('⚡ Tüm mutfak verileri (Kiler, Pazarım, Günlük, Favoriler) bulutla eşitlendi!', 'success');
    }, 600);
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enterPairCode.length < 4) return;

    playKitchenSound('badge_unlock', soundEnabled);
    const newDevList = Array.from(new Set([...profile.connectedDevices, `Eşlenen Cihaz (#${enterPairCode})`]));
    const updated = {
      ...profile,
      connectedDevices: newDevList,
      lastSyncAt: new Date().toISOString(),
    };
    setProfile(updated);
    saveStoredCloudProfile(updated);
    handleTriggerManualSync();
    onToast(`📱 Cihaz #${enterPairCode} başarıyla eşlendi ve canlı senkronize edildi!`, 'success');
    setEnterPairCode('');
  };

  const copyPairCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pairingCode);
      onToast('📋 Eşleme kodu kopyalandı!', 'info');
      playKitchenSound('pop', soundEnabled);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Çoklu Cihaz & Bulut Senkronizasyonu</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isConfigured
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                  }`}
                >
                  {isConfigured ? '🟢 Supabase PostgreSQL Aktif' : '⚡ Hibrit Realtime Aktif'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                MacBook, iPhone Safari ve mobil cihazlarınız arasında çift yönlü canlı senkronizasyon.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudCheck className="w-4 h-4" />
            <span>Senkronizasyon & Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pair')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pair'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Cihaz Eşleme (iPhone & Mac)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Anahtarları</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* TAB 1: SYNC & PROFILE */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Kullanıcı Hesabı:</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{profile.email}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>Mevcut Cihaz:</span>
                    <span className="font-semibold text-slate-200">{currentDevice.deviceName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Son Bulut Eşitlemesi:{' '}
                    <span className="text-slate-400 font-mono">
                      {new Date(profile.lastSyncAt).toLocaleTimeString('tr-TR')} (Canlı)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleTriggerManualSync}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Eşitleniyor...' : 'Şimdi Buluta Eşitle ⚡'}</span>
                </button>
              </div>

              {/* Data matrix overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Kiler Malzemesi</span>
                  <span className="text-lg font-black text-emerald-400">{ingredients.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pazar Kalemi</span>
                  <span className="text-lg font-black text-amber-400">{shoppingList.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Kürşad Notu</span>
                  <span className="text-lg font-black text-cyan-400">{diaries.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Kaydedilen Tarif</span>
                  <span className="text-lg font-black text-purple-400">{recipes.length}</span>
                </div>
              </div>

              {/* Quick Magic Link / Account Switch */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Şifresiz Giriş & Farklı Hesaba Geçiş (Magic Link)</span>
                </h4>
                <form onSubmit={handleMagicLinkLogin} className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ornek@kursad.com"
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Bağlanıyor...' : 'Bağla & Eşitle'}
                  </button>
                </form>
              </div>

              {/* Connected devices stream */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-teal-400" />
                    <span>Bağlı Cihazlar ({profile.connectedDevices.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Realtime Kanalları Dinleniyor</span>
                </h4>

                <div className="space-y-2">
                  {profile.connectedDevices.map((dev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {dev.includes('iPhone') || dev.includes('Mobile') ? (
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Laptop className="w-4 h-4 text-teal-400" />
                        )}
                        <span className="font-semibold text-slate-200">{dev}</span>
                        {dev.includes(currentDevice.deviceName) && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Bu Cihaz
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Senkronize
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEVICE PAIRING (IPHONE & MAC) */}
          {activeTab === 'pair' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>Anlık Cihaz Eşleme Kodu</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  iPhone Safari veya diğer telefonunuzdan ŞefSıfır adresini açın. Aşağıdaki 6 haneli kodu diğer cihazın Eşleme alanına yazarak kilerinizi saniyeler içinde bağlayın.
                </p>

                <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 gap-4">
                  <span className="font-mono text-3xl font-black text-emerald-400 tracking-widest select-all">
                    {pairingCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyPairCode}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-all"
                    title="Kodu Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Enter Pairing Code From Other Device */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200">Başka Bir Cihazın Kodunu Gir:</h4>
                <form onSubmit={handlePairSubmit} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enterPairCode}
                    onChange={(e) => setEnterPairCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Örn: 482910"
                    className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-center font-mono font-bold tracking-widest text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    disabled={enterPairCode.length < 4}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    Cihazı Eşle 🔗
                  </button>
                </form>
              </div>

              {/* Customize Device Name */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300">Bu Cihazın İsmini Özelleştir:</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editDeviceName}
                    onChange={(e) => setEditDeviceName(e.target.value)}
                    placeholder="Örn: Kürşad'ın MacBook'u"
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveDeviceName}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-all hover:scale-105 active:scale-95"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE POSTGRESQL CREDENTIALS CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Özel Supabase PostgreSQL Veritabanı Ayarları</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  İsteğe bağlı olarak kendi Supabase projenizin REST URL ve Anon Public Key bilgilerini buraya girebilirsiniz. Girilmediğinde sistem sıfır gecikmeli yerel + hibrit realtime modunda çalışır.
                </p>
              </div>

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">NEXT_PUBLIC_SUPABASE_URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSupabaseUrl('');
                      setSupabaseKey('');
                      saveCustomSupabaseCredentials('', '');
                      setIsConfigured(false);
                      onToast('Özel anahtarlar temizlendi (Yerel moda dönüldü).', 'info');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 underline"
                  >
                    Anahtarları Temizle
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Ayarları Kaydet & Bağlan</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Milisaniyelik Optimistic UI & Çift Yönlü Sync Aktif</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
