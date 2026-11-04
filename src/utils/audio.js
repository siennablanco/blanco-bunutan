// Christmas Sound Effects (SFX) Only - Pure Web Audio API
// Background music removed as requested! Only suspense drumroll, fanfare, and cute pop effects.

class ChristmasSFXManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  // Cute, friendly button click / pop
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Cheerful bell chime
  playJingleChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // Suspenseful, exciting drum roll when "BUNOT NA!" is pressed
  playDrumRoll(duration = 2.4) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const step = 0.055;
    const steps = Math.floor(duration / step);

    for (let i = 0; i < steps; i++) {
      const t = now + i * step;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80 + (i / steps) * 60, t);

      const intensity = 0.08 + (i / steps) * 0.22;
      gain.gain.setValueAtTime(intensity, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.045);
    }
  }

  // Triumphant victory fanfare when the name is revealed!
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fanfareNotes = [
      { f: 523.25, t: 0, d: 0.14 },    // C5
      { f: 659.25, t: 0.14, d: 0.14 }, // E5
      { f: 783.99, t: 0.28, d: 0.18 }, // G5
      { f: 1046.50, t: 0.46, d: 0.7 }, // C6
      { f: 1318.51, t: 0.58, d: 0.9 }, // E6
    ];

    fanfareNotes.forEach(({ f, t, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.linearRampToValueAtTime(0.25, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + t);
      osc.stop(now + t + d);
    });

    // Sparkle chimes after fanfare
    setTimeout(() => {
      if (this.ctx && !this.isMuted) {
        [1567.98, 1760.00, 2093.00, 2637.02].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = this.ctx.currentTime + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(t);
          osc.stop(t + 0.4);
        });
      }
    }, 450);
  }

  // Compatibility stubs so existing calls don't break
  startMusic() {}
  stopMusic() {}
  toggleMusic() { return false; }
}

export const audioManager = new ChristmasSFXManager();
