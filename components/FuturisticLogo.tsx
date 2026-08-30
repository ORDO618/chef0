'use client';

import React from 'react';

interface FuturisticLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function FuturisticLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
}: FuturisticLogoProps) {
  const iconDimensions = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  }[size];

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Glassmorphic Emblem: Chef Toque + Infinity Loop + Bio Leaf */}
      <div
        className={`relative flex items-center justify-center ${iconDimensions} rounded-2xl bg-gradient-to-br from-slate-900/95 via-emerald-950/40 to-slate-950/95 border border-emerald-500/50 p-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:border-amber-400/60 transition-all duration-500 group cursor-pointer backdrop-blur-xl`}
      >
        {/* Animated Cyber-Eco Aura Layer */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-amber-500/20 blur-md group-hover:blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500" />

        {/* 3D Glass Inner Reflection */}
        <div className="absolute inset-0.5 rounded-[14px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* High-Performance Vector SVG: 3D Chef + Infinity + Leaf */}
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 w-full h-full drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] group-hover:scale-105 transition-transform duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Neon Gradient: Emerald to Amber */}
            <linearGradient id="cyberChefEcoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="45%" stopColor="#34D399" />
              <stop offset="80%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            {/* Glowing Accent Amber Gradient */}
            <linearGradient id="goldAura" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="toqueGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Infinity Loop (Zero-Waste Eco Orbit) */}
          <path
            d="M30 68 C14 68 12 36 32 36 C45 36 50 52 50 52 C50 52 55 68 68 68 C88 68 86 36 68 36 C55 36 50 52 50 52 C50 52 45 36 32 36"
            stroke="url(#cyberChefEcoGrad)"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Minimalist Chef Hat Top Arch & Folds hovering over the loop */}
          <path
            d="M36 28 C34 18 42 12 50 14 C58 12 66 18 64 28"
            stroke="url(#goldAura)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M44 14 C47 9 53 9 56 14"
            stroke="#34D399"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Bio Leaf Sprout merging with infinity center */}
          <path
            d="M50 52 C50 30 64 18 76 20 C78 32 68 46 50 52 Z"
            fill="url(#goldAura)"
            opacity="0.9"
          />

          {/* Leaf Central Vein line */}
          <path
            d="M52 48 C60 38 67 30 73 24"
            stroke="#022c22"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Core Zero Point Catalyst */}
          <circle cx="50" cy="52" r="3.5" fill="#34D399" className="animate-pulse" />
        </svg>

        {/* Live status pulsing beacon */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
        </span>
      </div>

      {/* Brand Typography & Micro Badges */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className={`${titleSizes} font-black tracking-tight text-white flex items-center gap-1.5`}>
            <span>ŞefSıfır</span>
            <span className="text-slate-500 font-light">/</span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
              ChefZero
            </span>
          </h1>

          {/* Micro Zero Waste AI Engine Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Zero Waste AI Engine
          </span>
        </div>

        {showSubtitle && (
          <p className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
            <span className="text-emerald-400 font-semibold">Sıfır İsraf</span>
            <span className="text-slate-600">•</span>
            <span>Akıllı Mutfak & Pişirme Ekosistemi</span>
          </p>
        )}
      </div>
    </div>
  );
}
