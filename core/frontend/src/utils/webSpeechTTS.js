// Web Speech API TTS utility
// This is a fallback solution while we fix Piper TTS

export class WebSpeechTTS {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    
    // Try to find a British English voice (to match en_GB-alba)
    this.selectedVoice = this.voices.find(voice => 
      voice.lang.includes('en-GB') || voice.lang.includes('en_GB')
    ) || this.voices.find(voice => 
      voice.lang.includes('en-US') || voice.lang.includes('en_US')
    ) || this.voices[0];

    console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
    console.log('Selected voice:', this.selectedVoice?.name, this.selectedVoice?.lang);
  }

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Reload voices if empty (some browsers load them asynchronously)
      if (this.voices.length === 0) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      
      // Configure speech parameters
      utterance.rate = options.rate || 0.9; // Slightly slower for better lip sync
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Set up event handlers
      utterance.onstart = () => {
        console.log('Speech started');
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        console.log('Speech ended');
        resolve();
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
        if (options.onError) options.onError(event);
      };

      // Speak the text
      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

// Create a singleton instance
export const webSpeechTTS = new WebSpeechTTS();

// Reload voices when they become available
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    webSpeechTTS.loadVoices();
  };
}
