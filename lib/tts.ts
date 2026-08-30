'use client';

/**
 * Text-to-Speech (TTS) Voice Engine for ŞefSıfır
 * Uses browser-native window.speechSynthesis with Turkish voice prioritization.
 */

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentText: string;
}

type TTSCallback = (state: TTSState) => void;

class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private subscribers: Set<TTSCallback> = new Set();
  private state: TTSState = {
    isPlaying: false,
    isPaused: false,
    currentStepIndex: -1,
    totalSteps: 0,
    currentText: '',
  };
  private queue: { text: string; stepIndex: number }[] = [];
  private currentQueueIndex = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(cb: TTSCallback) {
    this.subscribers.add(cb);
    cb(this.state);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.state));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  private findBestTurkishVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    // Prioritize tr-TR, then tr, then any natural voice
    const trVoice = voices.find((v) => v.lang === 'tr-TR' || v.lang === 'tr_TR') ||
                    voices.find((v) => v.lang.toLowerCase().startsWith('tr'));
    return trVoice || voices[0] || null;
  }

  public speakRecipe(recipeTitle: string, steps: string[], ingredientsText?: string) {
    this.stop();

    if (!this.synth || typeof window === 'undefined') return;

    this.queue = [];

    // Title intro
    this.queue.push({
      text: `Şef Sıfır tarif sesli rehberi: ${recipeTitle}.`,
      stepIndex: -1,
    });

    // Optional ingredients list
    if (ingredientsText) {
      this.queue.push({
        text: `Kullanılan malzemeler: ${ingredientsText}.`,
        stepIndex: -1,
      });
    }

    // Add each step
    steps.forEach((step, idx) => {
      this.queue.push({
        text: `Adım ${idx + 1}: ${step}`,
        stepIndex: idx,
      });
    });

    this.state = {
      isPlaying: true,
      isPaused: false,
      currentStepIndex: -1,
      totalSteps: steps.length,
      currentText: this.queue[0]?.text || '',
    };
    this.currentQueueIndex = 0;
    this.notify();

    this.playNextQueueItem();
  }

  private playNextQueueItem() {
    if (!this.synth || this.currentQueueIndex >= this.queue.length) {
      this.stop();
      return;
    }

    const item = this.queue[this.currentQueueIndex];
    this.state = {
      ...this.state,
      isPlaying: true,
      isPaused: false,
      currentStepIndex: item.stepIndex,
      currentText: item.text,
    };
    this.notify();

    const utterance = new SpeechSynthesisUtterance(item.text);
    const voice = this.findBestTurkishVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'tr-TR';
    }

    utterance.rate = 0.95; // slightly relaxed reading pace for cooking
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentQueueIndex++;
      if (this.state.isPlaying) {
        this.playNextQueueItem();
      }
    };

    utterance.onerror = (e) => {
      console.warn('TTS utterance error:', e);
      this.currentQueueIndex++;
      if (this.state.isPlaying) {
        this.playNextQueueItem();
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public speakSingleText(text: string) {
    this.stop();
    if (!this.synth) return;

    this.state = {
      isPlaying: true,
      isPaused: false,
      currentStepIndex: 0,
      totalSteps: 1,
      currentText: text,
    };
    this.notify();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.findBestTurkishVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'tr-TR';
    }
    utterance.rate = 1.0;

    utterance.onend = () => {
      this.stop();
    };

    utterance.onerror = () => {
      this.stop();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.state.isPlaying && !this.state.isPaused) {
      this.synth.pause();
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.notify();
    }
  }

  public togglePauseResume() {
    if (this.state.isPaused) {
      this.resume();
    } else if (this.state.isPlaying) {
      this.pause();
    }
  }

  public goToStep(stepIndex: number) {
    const queueIdx = this.queue.findIndex((item) => item.stepIndex === stepIndex);
    if (queueIdx !== -1) {
      if (this.synth) {
        try {
          this.synth.cancel();
        } catch {
          // ignore
        }
      }
      this.currentQueueIndex = queueIdx;
      this.playNextQueueItem();
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
    this.queue = [];
    this.currentQueueIndex = 0;
    this.state = {
      isPlaying: false,
      isPaused: false,
      currentStepIndex: -1,
      totalSteps: 0,
      currentText: '',
    };
    this.notify();
  }
}

export const ttsEngine = new TTSEngine();
