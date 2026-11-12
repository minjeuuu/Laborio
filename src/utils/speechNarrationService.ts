/**
 * Super Mario Labor Law Speech Narration Service
 *
 * Provides a bulletproof, cross-browser text-to-speech engine for Verbatim Codal,
 * Statute Lookup, Citations, and Topic summaries.
 *
 * Solves:
 * 1. The Chromium 15-second speech synthesis cutoff bug by chunking text into <=150 char sentences.
 * 2. Utterance garbage collection bug by anchoring utterances to a window-level registry.
 * 3. The paused/frozen queue bug by performing a cancel + resume queue reset.
 * 4. Automatic voice loading and selection of clear English voices.
 * 5. Text sanitization for natural speech (expands legal abbreviations like Art., Sec., R.A., P.D., ₱, %).
 */

import { marioAudio } from './audio';

export interface SpeechProgressInfo {
  currentChunk: number;
  totalChunks: number;
  chunkText: string;
}

export type SpeechStateListener = (state: {
  isSpeaking: boolean;
  isPaused: boolean;
  progress?: SpeechProgressInfo;
}) => void;

class SpeechNarrationService {
  private activeChunks: string[] = [];
  private currentChunkIndex: number = 0;
  private currentRate: number = 1.0;
  private isSpeakingInternal: boolean = false;
  private isPausedInternal: boolean = false;
  private activeId: string | null = null;
  private listeners: Set<SpeechStateListener> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer natural sounding English voices, or en-PH, en-US, en-GB
      const preferred =
        voices.find((v) => /en[-_]ph/i.test(v.lang)) ||
        voices.find((v) => v.lang.startsWith('en') && /natural|google|microsoft|samantha|karen|daniel/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferred) {
        this.selectedVoice = preferred;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Sanitizes legal statute and codal text for natural human pronunciation.
   */
  public sanitizeStatuteText(text: string): string {
    if (!text) return '';

    let clean = text
      // Normalize line breaks & tabs
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      // Expand legal abbreviations
      .replace(/\bART\.?\s*(\d+)\b/gi, 'Article $1')
      .replace(/\bSEC\.?\s*(\d+)\b/gi, 'Section $1')
      .replace(/\bR\.?A\.?\s*(?:NO\.?)?\s*(\d+)\b/gi, 'Republic Act Number $1')
      .replace(/\bP\.?D\.?\s*(?:NO\.?)?\s*(\d+)\b/gi, 'Presidential Decree Number $1')
      .replace(/\bPAR\.?\s*(\d+)\b/gi, 'Paragraph $1')
      .replace(/\bNO\.\s*(\d+)\b/gi, 'Number $1')
      .replace(/\bDOLE\b/g, 'D-O-L-E')
      .replace(/\bNLRC\b/g, 'N-L-R-C')
      .replace(/\bBLR\b/g, 'Bureau of Labor Relations')
      .replace(/\bNCMB\b/g, 'National Conciliation and Mediation Board')
      .replace(/\bNWPC\b/g, 'National Wages and Productivity Commission')
      .replace(/\bRTWPB\b/g, 'Regional Tripartite Wages and Productivity Board')
      .replace(/\bCBA\b/g, 'Collective Bargaining Agreement')
      .replace(/\bOSH\b/g, 'Occupational Safety and Health')
      .replace(/\bSIL\b/g, 'Service Incentive Leave')
      .replace(/\bVAWC\b/g, 'Violence Against Women and Children')
      .replace(/\bw\/o\b/gi, 'without')
      .replace(/\bw\/\b/gi, 'with')
      // Currency & Percentage
      .replace(/₱\s*([\d,]+(?:\.\d+)?)/g, '$1 Philippine Pesos')
      .replace(/%/g, ' percent')
      // Hyphens and dashes to speech pauses
      .replace(/[—–]/g, ', ')
      // Section / paragraph symbols
      .replace(/[§¶]/g, 'Section ')
      // Markdown formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/[`#]/g, '')
      .trim();

    return clean;
  }

  /**
   * Splits text into short, natural speech chunks (100–160 chars) to prevent Chrome timeout.
   */
  public splitIntoChunks(text: string, maxLen = 150): string[] {
    if (!text) return [];

    // Split on sentence boundaries
    const rawSentences = text.match(/[^.?!;]+[.?!;]+(?:\s+|$)/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of rawSentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      if (trimmed.length > maxLen) {
        // If a single sentence is very long, split on commas or clauses
        if (current.trim()) {
          chunks.push(current.trim());
          current = '';
        }
        const clauses = trimmed.split(/,\s+/);
        let clauseAcc = '';
        for (const cl of clauses) {
          if ((clauseAcc + ', ' + cl).length <= maxLen) {
            clauseAcc = clauseAcc ? clauseAcc + ', ' + cl : cl;
          } else {
            if (clauseAcc) chunks.push(clauseAcc.trim() + ',');
            clauseAcc = cl;
          }
        }
        if (clauseAcc.trim()) {
          chunks.push(clauseAcc.trim());
        }
      } else if ((current + ' ' + trimmed).length <= maxLen) {
        current = current ? `${current} ${trimmed}` : trimmed;
      } else {
        if (current.trim()) chunks.push(current.trim());
        current = trimmed;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeakingInternal,
      isPaused: this.isPausedInternal,
      progress: this.getProgressInfo(),
    });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const progress = this.getProgressInfo();
    for (const listener of this.listeners) {
      try {
        listener({
          isSpeaking: this.isSpeakingInternal,
          isPaused: this.isPausedInternal,
          progress,
        });
      } catch {
        // ignore
      }
    }
  }

  private getProgressInfo(): SpeechProgressInfo | undefined {
    if (!this.isSpeakingInternal || this.activeChunks.length === 0) return undefined;
    return {
      currentChunk: this.currentChunkIndex + 1,
      totalChunks: this.activeChunks.length,
      chunkText: this.activeChunks[this.currentChunkIndex] || '',
    };
  }

  /**
   * Starts reading text aloud cleanly.
   */
  public speak(
    text: string,
    id: string = 'generic',
    rate: number = 1.0,
    prefix?: string
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    this.stop();

    const fullText = prefix ? `${prefix}. ${text}` : text;
    const sanitized = this.sanitizeStatuteText(fullText);
    const chunks = this.splitIntoChunks(sanitized);

    if (chunks.length === 0) return false;

    this.activeId = id;
    this.activeChunks = chunks;
    this.currentChunkIndex = 0;
    this.currentRate = Math.max(0.6, Math.min(2.0, rate));
    this.isSpeakingInternal = true;
    this.isPausedInternal = false;

    // Reset SpeechSynthesis queue state
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }

    // Play subtle audio cue and pause study ambience
    try {
      if (typeof marioAudio?.pauseStudyAmbience === 'function') {
        marioAudio.pauseStudyAmbience();
      } else if (typeof (marioAudio as any)?.stopAmbiance === 'function') {
        (marioAudio as any).stopAmbiance();
      }
    } catch {
      // fallback
    }
    marioAudio.playCoin();

    // Start heartbeat to keep Chrome background speech active
    this.startHeartbeat();

    this.notify();
    this.speakCurrentChunk();
    return true;
  }

  private speakCurrentChunk() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!this.isSpeakingInternal || this.currentChunkIndex >= this.activeChunks.length) {
      this.finish();
      return;
    }

    const chunkText = this.activeChunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.rate = this.currentRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onend = () => {
      if (!this.isSpeakingInternal) return;
      this.currentChunkIndex++;
      this.notify();
      this.speakCurrentChunk();
    };

    utterance.onerror = (e) => {
      // In case of error, advance to next chunk rather than crashing
      if (!this.isSpeakingInternal) return;
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      this.currentChunkIndex++;
      this.notify();
      this.speakCurrentChunk();
    };

    // Store in global window registry to protect against Chrome GC bug
    const win = window as unknown as { __mario_speech_utterances?: SpeechSynthesisUtterance[] };
    if (!win.__mario_speech_utterances) {
      win.__mario_speech_utterances = [];
    }
    win.__mario_speech_utterances.push(utterance);
    if (win.__mario_speech_utterances.length > 8) {
      win.__mario_speech_utterances.shift();
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      this.finish();
    }
  }

  public pause(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isSpeakingInternal && !this.isPausedInternal) {
      try {
        window.speechSynthesis.pause();
      } catch {}
      this.isPausedInternal = true;
      this.notify();
    }
  }

  public resume(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isSpeakingInternal && this.isPausedInternal) {
      try {
        window.speechSynthesis.resume();
      } catch {}
      this.isPausedInternal = false;
      this.notify();
    }
  }

  public togglePause(): void {
    if (this.isPausedInternal) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.stopHeartbeat();
    this.isSpeakingInternal = false;
    this.isPausedInternal = false;
    this.activeId = null;
    this.activeChunks = [];
    this.currentChunkIndex = 0;
    try {
      if (typeof marioAudio?.resumeStudyAmbience === 'function') {
        marioAudio.resumeStudyAmbience();
      } else if (typeof (marioAudio as any)?.syncStudyAmbience === 'function') {
        (marioAudio as any).syncStudyAmbience();
      }
    } catch {
      // fallback
    }
    this.notify();
  }

  private finish(): void {
    this.stop();
  }

  public setRate(rate: number): void {
    this.currentRate = Math.max(0.6, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.currentRate;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  public isPaused(): boolean {
    return this.isPausedInternal;
  }

  public getActiveId(): string | null {
    return this.activeId;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeakingInternal) {
        if (!this.isPausedInternal && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 6000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const speechService = new SpeechNarrationService();
