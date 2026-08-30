'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mic,
  Camera,
  Plus,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  AudioLines,
  Square,
  Wand2,
  PackagePlus,
  ArrowRight,
  UploadCloud,
  ImageIcon,
  Trash2,
  Scan,
} from 'lucide-react';
import { Ingredient, IngredientCategory } from '@/lib/types';
import { PANTRY_PRESETS } from '@/lib/sampleData';
import { playKitchenSound } from '@/lib/sound';
import {
  predictIngredientAttributes,
  QUICK_SMART_SUGGESTIONS,
  IngredientPrediction,
} from '@/lib/smartIngredientDetector';
import { compressImage } from '@/lib/imageCompressor';
import { fetchWithRetry, ApiError } from '@/lib/apiRetry';
import { parseTurkishVoiceTranscript } from '@/lib/turkishVoiceParser';

interface QuickPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredient: (item: Omit<Ingredient, 'id' | 'addedAt'>) => void;
  onAddMultipleIngredients: (items: Omit<Ingredient, 'id' | 'addedAt'>[]) => void;
  onLoadPreset: (items: any[]) => void;
  customApiKey: string;
  soundEnabled: boolean;
  initialTab?: 'voice' | 'camera' | 'text';
  onToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function QuickPantryModal({
  isOpen,
  onClose,
  onAddIngredient,
  onAddMultipleIngredients,
  onLoadPreset,
  customApiKey,
  soundEnabled,
  initialTab = 'voice',
}: QuickPantryModalProps) {
  const [activeTab, setActiveTab] = useState<'voice' | 'camera' | 'text'>(initialTab);

  // Manual input state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('sebze_meyve');
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState<Ingredient['unit']>('adet');
  const [daysLeft, setDaysLeft] = useState<number>(5);
  const [autoPrediction, setAutoPrediction] = useState<IngredientPrediction | null>(null);

  // Voice state
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'paused'>('idle');
  const [transcript, setTranscript] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isVoiceActiveRef = useRef<boolean>(false);
  const voiceStatusRef = useRef<'idle' | 'listening' | 'paused'>('idle');

  // Camera / Image state
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<string | null>(null);
  const [detectedFromImage, setDetectedFromImage] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle voice status ref synchronization
  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  useEffect(() => {
    return () => {
      isVoiceActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { /* empty */ }
      }
    };
  }, []);

  if (!isOpen) return null;

  // Smart Name change
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!newName.trim()) {
      setAutoPrediction(null);
      return;
    }
    const prediction = predictIngredientAttributes(newName);
    setAutoPrediction(prediction);
    if (prediction.confidence > 0.3) {
      setCategory(prediction.category);
      setUnit(prediction.unit);
      setAmount(prediction.amount);
      setDaysLeft(prediction.daysUntilExpiry);
    }
  };

  const handleSelectQuickChip = (chip: typeof QUICK_SMART_SUGGESTIONS[0]) => {
    setName(chip.name);
    setCategory(chip.category);
    setUnit(chip.unit);
    setAmount(chip.amount);
    setDaysLeft(chip.days);
    setAutoPrediction({
      category: chip.category,
      unit: chip.unit,
      amount: chip.amount,
      daysUntilExpiry: chip.days,
      isPriority: chip.days <= 3,
      confidence: 1,
      matchedName: chip.name,
    });
    playKitchenSound('pop', soundEnabled);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddIngredient({
      name: name.trim(),
      category,
      amount: Number(amount) || 1,
      unit,
      daysUntilExpiry: Number(daysLeft) || 5,
      isPriority: Number(daysLeft) <= 3,
    });

    playKitchenSound('pop', soundEnabled);
    setName('');
    setAutoPrediction(null);
    setAmount(1);
    setDaysLeft(5);
  };

  // Web Speech API
  const initRecognition = () => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tarayıcınız Web Speech API ses tanımayı desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.');
      return null;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'tr-TR';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setVoiceStatus('listening');
      };

      rec.onresult = (event: any) => {
        let full = '';
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript + ' ';
        }
        setTranscript(full.trim());
      };

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isVoiceActiveRef.current = false;
          setVoiceStatus('idle');
          alert('Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından onaylayın.');
        }
      };

      rec.onend = () => {
        if (isVoiceActiveRef.current && voiceStatusRef.current === 'listening') {
          try {
            rec.start();
          } catch {
            setTimeout(() => {
              if (isVoiceActiveRef.current && voiceStatusRef.current === 'listening') {
                try {
                  rec.start();
                } catch { /* empty */ }
              }
            }, 250);
          }
        } else if (voiceStatusRef.current !== 'paused') {
          setVoiceStatus('idle');
        }
      };

      return rec;
    } catch (err) {
      console.error('Speech rec init error:', err);
      return null;
    }
  };

  const startVoice = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (!recognitionRef.current) return;

    isVoiceActiveRef.current = true;
    setVoiceStatus('listening');
    playKitchenSound('voice_start', soundEnabled);
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 150);
      } catch { /* empty */ }
    }
  };

  const pauseVoice = () => {
    setVoiceStatus('paused');
    voiceStatusRef.current = 'paused';
    playKitchenSound('click', soundEnabled);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* empty */ }
    }
  };

  const resumeVoice = () => {
    isVoiceActiveRef.current = true;
    setVoiceStatus('listening');
    voiceStatusRef.current = 'listening';
    playKitchenSound('voice_start', soundEnabled);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch { /* empty */ }
    }
  };

  const stopVoice = (autoParse: boolean = false) => {
    isVoiceActiveRef.current = false;
    setVoiceStatus('idle');
    voiceStatusRef.current = 'idle';
    playKitchenSound('voice_stop', soundEnabled);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* empty */ }
    }
    if (autoParse && transcript.trim()) {
      handleParseVoiceTranscript(transcript);
    }
  };

  const handleParseVoiceTranscript = async (textToParse?: string) => {
    const text = (typeof textToParse === 'string' ? textToParse : transcript).trim();
    if (!text) return;

    isVoiceActiveRef.current = false;
    setVoiceStatus('idle');
    voiceStatusRef.current = 'idle';
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* empty */ }
    }

    setIsParsingVoice(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['x-custom-gemini-key'] = customApiKey;

      const res = await fetchWithRetry('/api/gemini/kitchen', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'voice_parse',
          transcript: text,
        }),
        maxRetries: 2,
        timeoutMs: 15000,
      });

      const data = await res.json();
      if (data.parsedIngredients && data.parsedIngredients.length > 0) {
        const itemsToAdd = data.parsedIngredients.map((item: any) => ({
          name: item.name || 'Malzeme',
          category: (item.category as IngredientCategory) || 'diger',
          amount: Number(item.amount) > 0 ? Number(item.amount) : 1,
          unit: item.unit || 'adet',
          daysUntilExpiry: Number(item.daysUntilExpiry) || 5,
          isPriority: Number(item.daysUntilExpiry) <= 3,
        }));
        onAddMultipleIngredients(itemsToAdd);
        playKitchenSound('cook_success', soundEnabled);
        setTranscript('');
        onClose();
        return;
      }
    } catch (err: any) {
      console.warn('Voice parse AI network fallback:', err?.message || err);
    }

    // High-precision client-side rule-based fallback for Turkish voice transcripts
    const fallbackParsed = parseTurkishVoiceTranscript(text);
    if (fallbackParsed.length > 0) {
      onAddMultipleIngredients(fallbackParsed);
      playKitchenSound('cook_success', soundEnabled);
      setTranscript('');
      onClose();
    } else {
      const pred = predictIngredientAttributes(text);
      onAddIngredient({
        name: text,
        category: pred.category,
        amount: pred.amount,
        unit: pred.unit,
        daysUntilExpiry: pred.daysUntilExpiry,
        isPriority: pred.isPriority,
      });
      playKitchenSound('pop', soundEnabled);
      setTranscript('');
      onClose();
    }
    setIsParsingVoice(false);
  };

  // Image Vision with In-Browser Canvas Compression
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image to max 1200px and 82% quality to speed up upload & inference
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      setImagePreview(compressed.base64);

      const savedPercent = Math.round(
        (1 - compressed.compressedSize / Math.max(1, compressed.originalSize)) * 100
      );
      if (savedPercent > 10) {
        setCompressionRatio(`%${savedPercent} Sıkıştırıldı (${Math.round(compressed.compressedSize / 1024)} KB)`);
      } else {
        setCompressionRatio(`${Math.round(compressed.compressedSize / 1024)} KB`);
      }

      analyzeKitchenImage(compressed.base64, compressed.mimeType);
    } catch (err) {
      console.error('Image compression error, falling back to direct load:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        analyzeKitchenImage(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeKitchenImage = async (base64Data: string, mimeType: string) => {
    setIsAnalyzingImage(true);
    setDetectedFromImage([]);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['x-custom-gemini-key'] = customApiKey;

      const res = await fetchWithRetry('/api/gemini/kitchen', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'analyze_image',
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
        }),
        maxRetries: 2,
        timeoutMs: 30000,
      });

      const data = await res.json();
      if (data.detectedIngredients && data.detectedIngredients.length > 0) {
        setDetectedFromImage(data.detectedIngredients);
        playKitchenSound('pop', soundEnabled);
      }
    } catch (err: any) {
      console.error('Image analysis error:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const addAllDetectedIngredients = () => {
    if (detectedFromImage.length === 0) return;
    const mapped = detectedFromImage.map((i) => ({
      name: i.name,
      category: i.category || 'diger',
      amount: Number(i.amount) || 1,
      unit: i.unit || 'adet',
      daysUntilExpiry: Number(i.daysUntilExpiry) || 4,
      isPriority: Boolean(i.isPriority) || Number(i.daysUntilExpiry) <= 3,
      notes: i.notes,
    }));
    onAddMultipleIngredients(mapped);
    playKitchenSound('pop', soundEnabled);
    setDetectedFromImage([]);
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-t-[32px] sm:rounded-3xl bg-slate-900/95 border-t sm:border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Hızlı Malzeme Ekle</h2>
              <p className="text-xs text-slate-400">Ses, kamera veya akıllı klavye ile envantere dizin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-950 border border-slate-800 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('voice');
                playKitchenSound('click', soundEnabled);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'voice'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Sesle Anlat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                playKitchenSound('click', soundEnabled);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'camera'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Fotoğraf Çek</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('text');
                playKitchenSound('click', soundEnabled);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'text'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Manuel Yaz</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
          
          {/* 1. Voice Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border text-center transition-all ${
                voiceStatus === 'listening'
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : voiceStatus === 'paused'
                  ? 'border-amber-500/60 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-950/60'
              }`}>
                <div className="flex justify-center mb-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform ${
                    voiceStatus === 'listening'
                      ? 'bg-emerald-500 text-slate-950 scale-110 animate-pulse shadow-lg shadow-emerald-500/30'
                      : voiceStatus === 'paused'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-emerald-400'
                  }`}>
                    <Mic className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1">
                  {voiceStatus === 'listening'
                    ? 'Dinleniyor... İstediğiniz gibi konuşun'
                    : voiceStatus === 'paused'
                    ? 'Duraklatıldı'
                    : 'Tüm malzemelerinizi tek nefeste anlatın'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Örn: &quot;3 yumurta, yarım kilo kıyma, 2 domates ve biraz kaşar peyniri var&quot;
                </p>

                {/* Voice Controls */}
                <div className="flex items-center justify-center gap-2">
                  {voiceStatus === 'idle' ? (
                    <button
                      type="button"
                      onClick={startVoice}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform hover:scale-105"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Konuşmayı Başlat</span>
                    </button>
                  ) : (
                    <>
                      {voiceStatus === 'listening' ? (
                        <button
                          type="button"
                          onClick={pauseVoice}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Duraklat</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resumeVoice}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Devam Et</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => stopVoice(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bitir & Ayrıştır</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => stopVoice(false)}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Transcript Textbox */}
              {(voiceStatus !== 'idle' || transcript) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-200">
                      <AudioLines className="w-4 h-4 text-emerald-400" />
                      Algılanan Konuşma
                    </span>
                    {transcript && (
                      <button
                        type="button"
                        onClick={() => setTranscript('')}
                        className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Temizle</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={3}
                    placeholder="Konuşmanız buraya aktarılıyor..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <button
                    type="button"
                    disabled={isParsingVoice || !transcript.trim()}
                    onClick={() => handleParseVoiceTranscript()}
                    className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isParsingVoice ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gemini AI Dolaba Diziyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Malzemeleri Otomatik Ayıkla & Ekle</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Camera Tab */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
              />

              {!imagePreview ? (
                /* Empty Upload / Capture Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer p-8 sm:p-10 rounded-3xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/80 bg-gradient-to-b from-slate-950/80 to-slate-900/60 hover:from-slate-950 hover:to-slate-900 transition-all flex flex-col items-center justify-center text-center gap-4 group shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <Camera className="w-8 h-8 stroke-[2]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-400 text-slate-950 shadow-md">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-center gap-1.5">
                      <span>Hızlı Fotoğraf Çek / Dosya Seç</span>
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Buzdolabınızın veya tezgahınızın fotoğrafını yükleyin; Gemini 3.7 Vision ile malzemeler anında otomatik listelensin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300">
                      📸 Kamera veya Galeri
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                      ⚡ Anında Otomatik Tanıma
                    </span>
                  </div>
                </div>
              ) : (
                /* High-Res Image Preview Card */
                <div className="space-y-3">
                  <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-xl max-h-56 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Buzdolabı Önizleme"
                      className="w-full h-full object-cover max-h-56 filter brightness-95"
                    />

                    {/* Scanning Laser Overlay when analyzing */}
                    {isAnalyzingImage && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-pulse" />
                        <div className="px-4 py-2 rounded-2xl bg-slate-950/90 border border-emerald-500/60 flex items-center gap-2 shadow-2xl">
                          <Scan className="w-4 h-4 text-emerald-400 animate-spin" />
                          <span className="text-xs font-bold text-emerald-300">Gemini 3.7 Vision Taraması Devam Ediyor...</span>
                        </div>
                      </div>
                    )}

                    {/* Top-Right Quick Actions */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {compressionRatio && (
                        <span className="px-2 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold shadow-md">
                          ⚡ {compressionRatio}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium backdrop-blur-md shadow-md flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Değiştir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setCompressionRatio(null);
                          setDetectedFromImage([]);
                        }}
                        className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/90 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 backdrop-blur-md shadow-md transition-colors"
                        title="Fotoğrafı Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzingImage && !imagePreview && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Fotoğraf taranıyor...</p>
                    <p className="text-slate-400">Yiyecekler ve tazelik durumları ayrıştırılıyor.</p>
                  </div>
                </div>
              )}

              {detectedFromImage.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      {detectedFromImage.length} Malzeme Bulundu
                    </span>
                    <button
                      type="button"
                      onClick={addAllDetectedIngredients}
                      className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <PackagePlus className="w-3.5 h-3.5 stroke-[2.5]" />
                      Tümünü Ekle
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {detectedFromImage.map((det, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-emerald-500/20 text-slate-200 flex items-center gap-1.5"
                      >
                        <span className="font-medium text-emerald-300">{det.name}</span>
                        <span className="text-slate-400 text-[10px]">
                          ({det.amount} {det.unit})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Text Tab */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Quick Preset Chips */}
              <div>
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Hızlı Seçim
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {QUICK_SMART_SUGGESTIONS.slice(0, 10).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickChip(chip)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>{chip.emoji}</span>
                      <span>{chip.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Malzeme Adı</label>
                    {autoPrediction?.matchedName && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Wand2 className="w-3 h-3" />
                        {autoPrediction.matchedName}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Örn: Domates, Tavuk Göğsü, Zeytinyağı..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="sebze_meyve">🥦 Sebze & Meyve</option>
                      <option value="et_tavuk_balik">🍗 Et & Tavuk & Balık</option>
                      <option value="sut_kahvaltilik">🧀 Süt & Kahvaltılık</option>
                      <option value="kuru_gida">🌾 Kuru Gıda & Bakliyat</option>
                      <option value="baharat_sos">🌶️ Baharat & Sos</option>
                      <option value="icecek">🥤 İçecekler</option>
                      <option value="diger">📦 Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kalan Gün</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={daysLeft}
                      onChange={(e) => setDaysLeft(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Miktar</label>
                    <input
                      type="number"
                      min={0.1}
                      step={unit === 'gram' || unit === 'ml' ? 50 : 0.5}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Birim</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="adet">Adet</option>
                      <option value="gram">Gram (g)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="ml">Mililitre (ml)</option>
                      <option value="litre">Litre (L)</option>
                      <option value="paket">Paket</option>
                      <option value="yemek_kasigi">Yemek Kaşığı</option>
                      <option value="tutam">Tutam</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Envantere Ekle</span>
                </button>
              </form>
            </div>
          )}

          {/* Quick Preset Profiles Section at bottom */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Hazır Örnek Dolap Profili Yükle
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PANTRY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onLoadPreset(preset.items);
                    playKitchenSound('pop', soundEnabled);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
