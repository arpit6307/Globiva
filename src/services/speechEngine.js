/**
 * Web SpeechSynthesis Wrapper Service with Async Voice Loading & Rate Control
 */
class SpeechEngineService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isLoaded = false;
    this.currentUtterance = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices() || [];
    this.isLoaded = this.voices.length > 0;
    return this.voices;
  }

  getAvailableVoices() {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  speak(text, { voice = null, rate = 1.0, pitch = 1.0, onEnd = null, onError = null }) {
    if (!this.synth) {
      console.warn("SpeechSynthesis is not supported in this browser environment.");
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));

    const voices = this.getAvailableVoices();
    if (voice) {
      utterance.voice = voice;
    } else if (voices.length > 0) {
      // Pick an English voice if available
      const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira')));
      utterance.voice = englishVoice || voices[0];
    }

    utterance.onend = (event) => {
      this.currentUtterance = null;
      if (onEnd) onEnd(event);
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      this.currentUtterance = null;
      if (onError) onError(event);
      else if (onEnd) onEnd(); // Fallback so slideshow doesn't freeze on audio error
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechEngine = new SpeechEngineService();
