// Simple sound effect system using Web Audio API
// These are placeholder beep sounds - can be replaced with actual audio files

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Success sound - happy ascending tones
  playSuccess() {
    this.playTone(523.25, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.15), 200); // G5
  }

  // Error sound - descending tones
  playError() {
    this.playTone(392, 0.1); // G4
    setTimeout(() => this.playTone(329.63, 0.15), 100); // E4
  }

  // Meeting scheduled - satisfying click
  playMeetingScheduled() {
    this.playTone(800, 0.05, 'square');
    setTimeout(() => this.playTone(1000, 0.05, 'square'), 50);
  }

  // Level complete - fanfare
  playLevelComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2), i * 100);
    });
  }

  // Warning - urgent beep
  playWarning() {
    this.playTone(440, 0.1);
    setTimeout(() => this.playTone(440, 0.1), 150);
  }

  // Achievement unlocked - triumphant
  playAchievement() {
    this.playTone(659.25, 0.1);
    setTimeout(() => this.playTone(783.99, 0.1), 100);
    setTimeout(() => this.playTone(1046.50, 0.2), 200);
  }

  // Hover - subtle tick
  playHover() {
    this.playTone(1200, 0.02, 'square');
  }
}

export const soundEngine = new SoundEngine();
