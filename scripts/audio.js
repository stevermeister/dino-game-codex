export class AudioController {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
  }

  ensureAudio() {
    if (this.masterGain && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return true;
    }

    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        return false;
      }
      this.audioContext = new AudioContextCtor();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.audioContext.destination);
      return true;
    } catch (error) {
      console.warn('Audio unavailable:', error);
      return false;
    }
  }

  playTone({
    frequency,
    duration,
    type = 'sine',
    volume = 0.3,
    attack = 0.01,
    release = 0.12,
    pitchEnd,
  }) {
    if (!this.ensureAudio() || !this.audioContext || !this.masterGain) {
      return;
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (typeof pitchEnd === 'number') {
      oscillator.frequency.linearRampToValueAtTime(pitchEnd, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

    oscillator.connect(gain);
    gain.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + release + 0.02);
  }

  playStartSound() {
    this.playTone({ frequency: 420, pitchEnd: 560, duration: 0.18, type: 'triangle', volume: 0.35 });
    this.playTone({ frequency: 640, pitchEnd: 720, duration: 0.16, type: 'square', volume: 0.22, attack: 0.015 });
  }

  playJumpSound() {
    this.playTone({ frequency: 740, pitchEnd: 920, duration: 0.22, type: 'square', volume: 0.28 });
  }

  playHitSound() {
    this.playTone({ frequency: 220, pitchEnd: 90, duration: 0.3, type: 'sawtooth', volume: 0.32, attack: 0.005 });
  }
}
