// All of Gobble Run's sound, made from plain WebAudio oscillators — no audio
// files, no network, nothing to load. A gobble is a fast wobble of low notes;
// a corn pickup is a bright blip; getting caught is a falling sting.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  /** Create the audio context on the first user gesture (browsers demand one). */
  unlock() {
    if (this.context === null) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.context = new AudioContext();
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(frequency, duration, type, volume, when = 0, slideTo = null) {
    if (this.context === null || this.muted) return;
    const start = this.context.currentTime + when;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slideTo !== null) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  gobble() {
    // Three quick low clucks, the turkey's own voice.
    this.tone(320, 0.07, 'square', 0.08, 0, 240);
    this.tone(300, 0.07, 'square', 0.08, 0.09, 220);
    this.tone(360, 0.1, 'square', 0.09, 0.18, 260);
  }

  jump() {
    this.tone(300, 0.16, 'sine', 0.1, 0, 620);
  }

  corn() {
    this.tone(880, 0.09, 'sine', 0.1, 0);
    this.tone(1320, 0.12, 'sine', 0.08, 0.07);
  }

  goldenCorn() {
    this.tone(660, 0.09, 'sine', 0.1, 0);
    this.tone(880, 0.09, 'sine', 0.1, 0.08);
    this.tone(1320, 0.16, 'sine', 0.09, 0.16);
  }

  thud() {
    this.tone(140, 0.2, 'sawtooth', 0.14, 0, 60);
  }

  caught() {
    this.tone(392, 0.22, 'sawtooth', 0.12, 0, 370);
    this.tone(311, 0.22, 'sawtooth', 0.12, 0.2, 294);
    this.tone(233, 0.5, 'sawtooth', 0.12, 0.4, 110);
  }

  escaped() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((frequency, index) => {
      this.tone(frequency, 0.22, 'triangle', 0.11, index * 0.13);
    });
  }
}
