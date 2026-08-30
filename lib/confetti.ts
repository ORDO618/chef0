'use client';

export async function triggerConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { y?: number; x?: number };
  colors?: string[];
}) {
  if (typeof window === 'undefined') return;
  try {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default || confettiModule;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      ...options,
    });
  } catch (err) {
    console.warn('Confetti could not be loaded:', err);
  }
}
