'use client';

export async function fireConfetti(options?: any) {
  if (typeof window === 'undefined') return;
  try {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default || confettiModule;
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#3b82f6'],
      ...options,
    });
  } catch (err) {
    console.warn('Confetti could not be fired:', err);
  }
}

export const triggerConfetti = fireConfetti;
