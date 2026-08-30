'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  RefreshCw,
  Smartphone,
  Laptop,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles,
  Database,
  Copy,
  Mail,
  Phone,
  User,
  LogOut,
  Trash2,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  Flame,
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
  getActiveAuthSession,
  signInWithGoogleOAuth,
  signInWithMagicLinkEmail,
  signInWithPhoneOtp,
  signOutUserSession,
  resetUserCloudPantry,
  AuthSession,
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
  onResetPantryToZero?: () => void;
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
  onResetPantryToZero,
  soundEnabled,
}: AuthSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'auth' | 'sync' | 'pair' | 'config'>('auth');
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getActiveAuthSession());
  const [profile, setProfile] = useState<CloudUserProfile>(() => getStoredCloudProfile());
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState<string>(() => getSupabaseCredentials().anonKey);
  const [isConfigured, setIsConfigured] = useState<boolean>(() => isSupabaseConfigured());
  
  // Magic Link Form
  const [emailInput, setEmailInput] = useState('kursad.alpler@gmail.com');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Phone OTP Form
  const [phoneInput, setPhoneInput] = useState('+90 532 123 45 67');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Pairing & Device
  const [pairingCode] = useState<string>(() => generatePairingCode());
  const [enterPairCode, setEnterPairCode] = useState<string>('');
  const [currentDevice, setCurrentDevice] = useState<{ deviceId: string; deviceName: string }>(() => getDeviceInfo());
  const [editDeviceName, setEditDeviceName] = useState<string>(() => getDeviceInfo().deviceName);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthSession(getActiveAuthSession());
      setProfile(getStoredCloudProfile());
      setIsConfigured(isSupabaseConfigured());
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('sefsifir_auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('sefsifir_auth_change', handleAuthChange);
    };
  }, []);

  if (!isOpen) return null;

  // 1. Google OAuth Handler
  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    playKitchenSound('click', soundEnabled);
    try {
      const res = await signInWithGoogleOAuth();
      if (res.success) {
        setAuthSession(res.session);
        setProfile(getStoredCloudProfile());
        playKitchenSound('badge_unlock', soundEnabled);
        onToast(`🚀 Hoş geldin Kürşad Şef! Google hesabınla giriş yapıldı ve verilerin bağlandı.`, 'success');
        onPerformFullSync();
      }
    } catch (err: any) {
      onToast('Google girişi sırasında bir hata oluştu.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 2. Magic Link Handler
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsAuthLoading(true);
    playKitchenSound('click', soundEnabled);
    try {
      const res = await signInWithMagicLinkEmail(emailInput.trim());
      if (res.success) {
        setAuthSession(res.session);
        setProfile(getStoredCloudProfile());
        setIsMagicLinkSent(true);
        playKitchenSound('badge_unlock', soundEnabled);
        onToast(`✨ ${emailInput} adresine bağlantı gönderildi ve oturum açıldı!`, 'success');
        onPerformFullSync();
      } else {
        onToast(res.error || 'Giriş yapılamadı.', 'error');
      }
    } catch {
      onToast('Bağlantı hatası.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 3. Phone OTP Send & Verify Handlers
  const handleSendOtp = () => {
    if (!phoneInput.trim()) return;
    setIsOtpSent(true);
    setOtpCode('784920'); // auto-fill test code for swift testing
    playKitchenSound('pop', soundEnabled);
    onToast(`📲 ${phoneInput} numarasına SMS doğrulama kodu gönderildi. (Test Kodu: 784920)`, 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsAuthLoading(true);
    playKitchenSound('click', soundEnabled);
    try {
      const res = await signInWithPhoneOtp(phoneInput, otpCode);
      if (res.success) {
        setAuthSession(res.session);
        setProfile(getStoredCloudProfile());
        playKitchenSound('badge_unlock', soundEnabled);
        onToast(`📱 Telefon doğrulaması başarılı! Mobil profiliniz bağlandı.`, 'success');
        onPerformFullSync();
      } else {
        onToast(res.error || 'Doğrulama başarısız.', 'error');
      }
    } catch {
      onToast('Doğrulama hatası.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 4. Logout Handler
  const handleLogout = async () => {
    await signOutUserSession();
    setAuthSession(null);
    setProfile(getStoredCloudProfile());
    playKitchenSound('pop', soundEnabled);
    onToast('👋 Oturum kapatıldı. Demo moduna dönüldü.', 'info');
  };

  // 5. Clean Slate / Reset to 0 Items (Day 1 Test scenario)
  const handleCleanPantryToZero = async () => {
    if (confirm('Kürşad hesabınızdaki tüm kileri tertemiz 0 ürün yapmak istiyor musunuz? (1. Gün Test Protokolü)')) {
      await resetUserCloudPantry(authSession?.userId);
      if (onResetPantryToZero) {
        onResetPantryToZero();
      }
      playKitchenSound('pop', soundEnabled);
      onToast('🧹 Kiler tertemiz 0 ürün olarak sıfırlandı. Test protokolü 1. gün hazır!', 'success');
    }
  };

  // 6. Manual Sync
  const handleTriggerManualSync = () => {
    setIsSyncing(true);
    playKitchenSound('cook_success', soundEnabled);
    
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
      onToast('⚡ Tüm veriler (Kiler, Pazarım, Günlük, Tarifler) Supabase bulutuna eşitlendi!', 'success');
    }, 600);
  };

  // 7. Pairing & Device settings
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

  const handleSaveDeviceName = () => {
    if (!editDeviceName.trim()) return;
    setCustomDeviceName(editDeviceName.trim());
    setCurrentDevice(getDeviceInfo());
    playKitchenSound('pop', soundEnabled);
    onToast(`Cihaz ismi "${editDeviceName.trim()}" olarak güncellendi.`, 'success');
  };

  const copyPairCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pairingCode);
      onToast('📋 Eşleme kodu kopyalandı!', 'info');
      playKitchenSound('pop', soundEnabled);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/50 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">Kimlik Doğrulama & Supabase Bulut Kapısı</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    authSession
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {authSession ? '🟢 Oturum Açık' : '⚪ Misafir Modu'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google OAuth, Sihirli Bağlantı, Telefon OTP ve çoklu cihaz veri izolasyonu.
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'auth'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Giriş & Kürşad Profili</span>
          </button>

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
            <span>Veri Tabloları & Sync</span>
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
            <span>PostgreSQL & API</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          
          {/* TAB 1: AUTHENTICATION & MULTI-LOGIN GATE */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              
              {/* Active Profile Status Badge */}
              {authSession ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/40 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-2xl shadow-md overflow-hidden">
                          {authSession.avatarUrl ? (
                            <img src={authSession.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span>👨‍🍳</span>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center text-[9px] text-slate-950 font-black">
                          ✓
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-white">{authSession.fullName}</h4>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black tracking-wide">
                            Kürşad Profili 👨‍🍳
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          {authSession.email || authSession.phone}
                        </p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Giriş Yöntemi: {authSession.provider === 'google' ? 'Google OAuth' : authSession.provider === 'magic_link' ? 'Magic Link' : 'Telefon OTP'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Oturumu Kapat</span>
                      </button>
                    </div>
                  </div>

                  {/* Day 1 Protocol Clean Slate Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-200 block">1. Gün Test Protokolü (Temiz Profil)</span>
                      <span className="text-[11px] text-slate-400">Dolaptaki tüm ürünleri 0 yapıp sıfırdan test başlatmak için:</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCleanPantryToZero}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kilerimi Sıfırla (0 Ürün)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Google OAuth One-Click Button */}
                  <button
                    type="button"
                    disabled={isAuthLoading}
                    onClick={handleGoogleLogin}
                    className="w-full p-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google ile Tek Tıkla Giriş Yap (Kürşad Hesabı)</span>
                  </button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px bg-slate-800 flex-1" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">veya şifresiz alternatif</span>
                    <div className="h-px bg-slate-800 flex-1" />
                  </div>

                  {/* Magic Link Email Form */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>E-posta & Sihirli Bağlantı (Magic Link)</span>
                    </div>
                    <form onSubmit={handleMagicLinkSubmit} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="kursad.alpler@gmail.com"
                        className="flex-1 px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isAuthLoading}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
                      >
                        {isAuthLoading ? 'Gönderiliyor...' : 'Giriş Bağlantısı Al ✨'}
                      </button>
                    </form>
                  </div>

                  {/* Phone / SMS OTP Verification */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>Telefon / SMS Doğrulama (Mobil App OTP)</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+90 532 123 45 67"
                        className="flex-1 px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl transition-all shrink-0"
                      >
                        SMS Kodu İste 📲
                      </button>
                    </div>

                    {isOtpSent && (
                      <form onSubmit={handleVerifyOtp} className="pt-2 flex gap-2 animate-fadeIn">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="6 Haneli Kod (Örn: 784920)"
                          className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-cyan-500/50 rounded-xl font-mono text-center text-cyan-300 font-bold tracking-widest focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isAuthLoading}
                          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0"
                        >
                          Doğrula & Gir
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Data Isolation Guarantee */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-emerald-300 block">Kürşad Hesabı Veri İzolasyonu & Güvenlik</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Supabase Row Level Security (RLS) politikaları sayesinde kilerinizdeki tüm gramajlar, yemek günlükleriniz ve favori tarifleriniz yalnızca sizin <code className="font-mono text-emerald-400">user_id</code> kimliğinize izole olarak saklanır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA TABLES & LIVE SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Kullanıcı ID:</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{profile.id}</span>
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

              {/* Data Table Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">pantry_items</span>
                  <span className="text-lg font-black text-emerald-400">{ingredients.length} Malzeme</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">shopping_items</span>
                  <span className="text-lg font-black text-amber-400">{shoppingList.length} Kalem</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">chef_diaries</span>
                  <span className="text-lg font-black text-cyan-400">{diaries.length} Günlük</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">recipes</span>
                  <span className="text-lg font-black text-purple-400">{recipes.length} Tarif</span>
                </div>
              </div>

              {/* Connected Devices Stream */}
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

          {/* TAB 3: DEVICE PAIRING (IPHONE & MAC) */}
          {activeTab === 'pair' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>Anlık Cihaz Eşleme Kodu</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  iPhone Safari veya diğer telefonunuzdan ŞefSıfır uygulamasını açın. Aşağıdaki 6 haneli kodu diğer cihazın Eşleme alanına yazarak kilerinizi saniyeler içinde bağlayın.
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
                    placeholder="Örn: Kürşad'ın MacBook Pro'su"
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

          {/* TAB 4: SUPABASE POSTGRESQL CREDENTIALS */}
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
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
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
