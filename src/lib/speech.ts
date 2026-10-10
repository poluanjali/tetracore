// Web Speech API wrapper for speech recognition and synthesis

export interface SpeechRecognitionHookResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Global speech synthesis manager
class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  public isSpeaking: boolean = false;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public subscribe(cb: (speaking: boolean) => void) {
    this.onStateChange = cb;
  }

  public speak(text: string, voiceGender: 'female' | 'male' = 'female', rate: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stop();

      // Clean markdown characters from spoken text
      const cleanText = text
        .replace(/`{1,3}[^`]*`{1,3}/g, 'code snippet')
        .replace(/[*_#\[\]\(\)]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = voiceGender === 'female' ? 1.05 : 0.95;

      // Try selecting a suitable English voice
      const availableVoices = this.voices.filter((v) => v.lang.startsWith('en'));
      if (availableVoices.length > 0) {
        if (voiceGender === 'female') {
          const female = availableVoices.find(
            (v) =>
              v.name.includes('Female') ||
              v.name.includes('Samantha') ||
              v.name.includes('Zira') ||
              v.name.includes('Google UK English Female') ||
              v.name.includes('Karen') ||
              v.name.includes('Victoria')
          );
          if (female) utterance.voice = female;
          else utterance.voice = availableVoices[0];
        } else {
          const male = availableVoices.find(
            (v) =>
              v.name.includes('Male') ||
              v.name.includes('David') ||
              v.name.includes('Google UK English Male') ||
              v.name.includes('Daniel') ||
              v.name.includes('Alex')
          );
          if (male) utterance.voice = male;
          else utterance.voice = availableVoices[0];
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.onStateChange?.(true);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.onStateChange?.(false);
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }
}

export const speechManager = new SpeechManager();

// Continuous Web Speech Recognition manager that keeps listening without stopping on pauses
export class ContinuousSpeechRecognizer {
  private recognition: any = null;
  public isRunning: boolean = false;
  public isListening: boolean = false;
  private onTranscript: (text: string, isFinal: boolean) => void;
  private onActivity?: (active: boolean) => void;
  private baseHistory: string = '';
  private lastSessionFinal: string = '';
  private lastSessionInterim: string = '';

  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  constructor(
    onTranscript: (text: string, isFinal: boolean) => void,
    onActivity?: (active: boolean) => void
  ) {
    this.onTranscript = onTranscript;
    this.onActivity = onActivity;

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.lang =
          (typeof navigator !== 'undefined'
            ? navigator.languages?.[0] || navigator.language
            : 'en-US') || 'en-US';

        rec.onstart = () => {
          this.isListening = true;
          this.onActivity?.(true);
        };

        rec.onspeechstart = () => {
          this.onActivity?.(true);
        };

        rec.onspeechend = () => {
          this.onActivity?.(false);
        };

        rec.onresult = (event: any) => {
          if (!this.isRunning) return;
          this.onActivity?.(true);

          let finalChunk = '';
          let interimChunk = '';

          for (let r = 0; r < event.results.length; ++r) {
            const item = event.results[r];
            if (!item || !item[0]?.transcript) continue;
            const piece = item[0].transcript.trim();
            if (piece) {
              if (item.isFinal) {
                finalChunk = finalChunk ? `${finalChunk} ${piece}` : piece;
              } else {
                interimChunk = interimChunk ? `${interimChunk} ${piece}` : piece;
              }
            }
          }

          this.lastSessionFinal = finalChunk;
          this.lastSessionInterim = interimChunk;

          const combined = [this.baseHistory, finalChunk, interimChunk]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (combined && this.isRunning) {
            this.onTranscript(combined, !!finalChunk);
          }
        };

        rec.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('Speech recognition notice:', event.error);
          }
        };

        rec.onend = () => {
          this.isListening = false;
          if (!this.isRunning) {
            this.baseHistory = '';
            this.lastSessionFinal = '';
            this.lastSessionInterim = '';
            return;
          }

          const pending = [this.lastSessionFinal, this.lastSessionInterim]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (pending) {
            this.baseHistory = this.baseHistory ? `${this.baseHistory} ${pending}` : pending;
            this.lastSessionFinal = '';
            this.lastSessionInterim = '';
          }

          // Auto-restart if user wants it running (handles browser silence timeouts)
          if (this.isRunning) {
            const restart = () => {
              if (this.isRunning && !this.isListening) {
                try {
                  rec.start();
                  this.isListening = true;
                } catch {
                  setTimeout(restart, 150);
                }
              }
            };
            restart();
          }
        };

        this.recognition = rec;
      }
    }
  }

  public syncManualText(text: string) {
    this.baseHistory = text.trim();
    this.lastSessionFinal = '';
    this.lastSessionInterim = '';
  }

  public clear() {
    this.baseHistory = '';
    this.lastSessionFinal = '';
    this.lastSessionInterim = '';
  }

  public start(existingText: string = '') {
    this.isRunning = true;
    this.baseHistory = existingText.trim();
    this.lastSessionFinal = '';
    this.lastSessionInterim = '';

    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.warn('Recognition start caught:', e);
      }
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.onActivity?.(false);
  }
}
