/**
 * Kazakh Speech Engine & Viseme Audio Synchronizer
 * Plays MP3 audio file of the robot speech (with stub fallback)
 * and synchronizes 3D lip-sync / visemes and gestures in real time.
 * When muted / stopped: completely silent with zero clicks or residual noise.
 */

export interface VisemeState {
  mouthOpen: number;   // 0 to 1
  mouthWide: number;   // 0 to 1
  jawDrop: number;     // 0 to 1
  isSpeaking: boolean;
}

export class KazakhSpeechEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private isPlaying = false;
  private animationFrameId: number | null = null;
  private onVisemeUpdate?: (viseme: VisemeState) => void;
  private onEndCallback?: () => void;
  private onStartCallback?: () => void;
  private audioUrl: string = '/assets/robot_speech.mp3';

  public static readonly OFFICIAL_TEXT = 
    'Құрметті семинарға қатысушылар, бүгінгі облыстық семинарымызға қош келдіңіздер! Кітап оқу мәдениеті мен жасанды интеллектті ұштастыру жолындағы жұмыстарыңызға сәттілік тілейміз! Семинарымыз сәтті өтсін!';

  constructor(customAudioUrl?: string) {
    if (customAudioUrl) {
      this.audioUrl = customAudioUrl;
    }
  }

  public setAudioUrl(url: string) {
    this.audioUrl = url;
    if (this.audioElement) {
      this.audioElement.src = url;
    }
  }

  private initAudio() {
    if (!this.audioElement) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = this.audioUrl;
      audio.preload = 'auto';

      audio.onended = () => {
        this.stop();
      };

      audio.onerror = () => {
        // If file error, perform simulated speech viseme loop
        console.warn('[KazakhSpeechEngine] Audio element error or file missing, simulating visemes.');
      };

      this.audioElement = audio;

      // Connect to Web Audio Analyser if supported
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = 0.75;

          try {
            this.mediaSourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
            this.mediaSourceNode.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
          } catch {
            // Some browsers require direct output if already connected
          }
        }
      } catch (e) {
        console.warn('[KazakhSpeechEngine] Web Audio context not available:', e);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setCallbacks(options: {
    onViseme?: (viseme: VisemeState) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }) {
    this.onVisemeUpdate = options.onViseme;
    this.onStartCallback = options.onStart;
    this.onEndCallback = options.onEnd;
  }

  public play() {
    this.stop();
    this.initAudio();
    this.isPlaying = true;

    if (this.onStartCallback) {
      this.onStartCallback();
    }

    if (this.audioElement) {
      this.audioElement.currentTime = 0;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[KazakhSpeechEngine] HTML5 Audio autoplay restricted or error:', err);
        });
      }
    }

    this.startAnalysisLoop();
  }

  private startAnalysisLoop() {
    const startTime = performance.now();

    const tick = () => {
      if (!this.isPlaying) return;

      let open = 0;
      let wide = 0;
      let jaw = 0;

      if (this.analyser) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length; // 0 to 255
        const norm = Math.min(avg / 35, 1.0);

        if (norm > 0.04) {
          open = norm * 0.9;
          wide = 0.25 + norm * 0.45;
          jaw = norm * 0.85;
        }
      }

      // If audio is playing but analyser didn't return values (or for cadence rhythm)
      if (open === 0 && this.isPlaying) {
        const elapsed = (performance.now() - startTime) / 1000;
        // Rhythm cycle
        const syllable = Math.sin(elapsed * 12);
        if (syllable > 0.1) {
          open = syllable * 0.7;
          wide = 0.3 + syllable * 0.3;
          jaw = syllable * 0.65;
        }
      }

      if (this.onVisemeUpdate) {
        this.onVisemeUpdate({
          mouthOpen: Math.max(0, Math.min(1, open)),
          mouthWide: Math.max(0, Math.min(1, wide)),
          jawDrop: Math.max(0, Math.min(1, jaw)),
          isSpeaking: this.isPlaying
        });
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Stop / Mute: Instant, completely silent shutdown with ZERO noise, clicks, or buzzing.
   */
  public stop() {
    this.isPlaying = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
    }

    // Reset speech synthesis if active
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // Immediately notify zero visemes so robot mouth closes smoothly
    if (this.onVisemeUpdate) {
      this.onVisemeUpdate({
        mouthOpen: 0,
        mouthWide: 0,
        jawDrop: 0,
        isSpeaking: false
      });
    }

    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}
