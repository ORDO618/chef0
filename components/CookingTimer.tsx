'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  X,
  Bell,
  CheckCircle,
  Flame,
  Zap,
} from 'lucide-react';
import { playKitchenSound } from '@/lib/sound';

interface CookingTimerProps {
  initialMinutes?: number;
  label?: string;
  isOpen?: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export function CookingTimer({
  initialMinutes = 10,
  label = 'Pişirme Sayacı',
  isOpen = true,
  onClose,
  soundEnabled,
}: CookingTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [timerLabel, setTimerLabel] = useState(label);
  const [prevProps, setPrevProps] = useState({ initialMinutes, label, isOpen });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when props change during render (standard React pattern)
  if (
    prevProps.initialMinutes !== initialMinutes ||
    prevProps.label !== label ||
    prevProps.isOpen !== isOpen
  ) {
    setPrevProps({ initialMinutes, label, isOpen });
    setTotalSeconds(initialMinutes * 60);
    setRemainingSeconds(initialMinutes * 60);
    setTimerLabel(label);
    setIsRunning(true);
    setIsFinished(false);
  }

  // Timer Tick Loop
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playKitchenSound('timer_alarm', soundEnabled);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingSeconds, soundEnabled]);

  // Quick preset adder
  const setPresetMinutes = (mins: number, presetName?: string) => {
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsRunning(true);
    setIsFinished(false);
    if (presetName) setTimerLabel(presetName);
    playKitchenSound('click', soundEnabled);
  };

  const addExtraMinutes = (extraMins: number) => {
    const extraSecs = extraMins * 60;
    setTotalSeconds((prev) => prev + extraSecs);
    setRemainingSeconds((prev) => prev + extraSecs);
    setIsFinished(false);
    playKitchenSound('pop', soundEnabled);
  };

  const togglePlay = () => {
    if (isFinished) {
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
    playKitchenSound('click', soundEnabled);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
    playKitchenSound('click', soundEnabled);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`w-full sm:w-96 rounded-2xl border shadow-2xl backdrop-blur-xl p-4 sm:p-5 transition-all ${
          isFinished
            ? 'bg-rose-950/95 border-rose-500 ring-4 ring-rose-500/40 animate-pulse'
            : isRunning
            ? 'bg-slate-950/95 border-amber-500/50 shadow-amber-500/10'
            : 'bg-slate-950/95 border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isFinished
                  ? 'bg-rose-500/20 text-rose-400'
                  : isRunning
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Clock className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 truncate max-w-[170px]">{timerLabel}</h4>
              <span className="text-[10px] text-slate-400">
                {isFinished ? 'Süre Doldu! 🔥' : isRunning ? 'Pişirme Devam Ediyor' : 'Duraklatıldı'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Digital Clock Display with Circular Bar */}
        <div className="py-5 flex flex-col items-center justify-center relative">
          {/* Circular/Linear Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-4 border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${
                isFinished
                  ? 'bg-rose-500'
                  : progressPercent > 75
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className={`font-mono text-4xl sm:text-5xl font-black tracking-wider ${
              isFinished
                ? 'text-rose-400 animate-bounce'
                : isRunning
                ? 'text-amber-400'
                : 'text-slate-200'
            }`}
          >
            {formattedTime}
          </div>

          {isFinished && (
            <div className="mt-2 text-xs font-bold text-rose-300 flex items-center gap-1.5 animate-pulse">
              <Bell className="w-4 h-4" />
              <span>Yemeğin pişti! Yanmadan hemen kontrol et.</span>
            </div>
          )}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isFinished
                ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20'
                : isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Duraklat</span>
              </>
            ) : isFinished ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Başlat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Başlat</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => addExtraMinutes(1)}
            className="px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-colors"
            title="+1 Dakika Ekle"
          >
            +1 dk
          </button>
          <button
            type="button"
            onClick={() => addExtraMinutes(5)}
            className="px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-colors"
            title="+5 Dakika Ekle"
          >
            +5 dk
          </button>
        </div>

        {/* Quick Presets */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center justify-between">
            <span>Hızlı Mutfak Sayaçları</span>
            <span className="text-emerald-400 font-semibold">⚡ Airfryer & Fırın</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '3 dk', mins: 3, name: 'Hızlı Sote / Yumurta' },
              { label: '5 dk', mins: 5, name: 'Sebze Buharı' },
              { label: '10 dk', mins: 10, name: 'Airfryer Menemen' },
              { label: '16 dk', mins: 16, name: 'Tavuk & Kabak Sandal' },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPresetMinutes(preset.mins, preset.name)}
                className="px-2 py-1.5 bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 rounded-lg text-[11px] font-semibold text-center transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
