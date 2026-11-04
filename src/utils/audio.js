// Authentic Traditional Christmas Carols Synthesizer
// Songs: "Jingle Bells" (Festive Holiday Bells) + "We Wish You A Merry Christmas" + "Joy To The World"
// Multi-layered handbells, celesta, and sleigh bells for warm authentic Christmas music!

class TraditionalChristmasAudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.55;
    this.masterGain = null;
    this.carolGain = null;
    this.sfxGain = null;
    this.currentTrack = 0;
    this.loopTimer = null;
    this.activeNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.carolGain = this.ctx.createGain();
      this.carolGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.carolGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Frequency mapping for authentic notes
  getFreq(note) {
    const table = {
      'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51,
      'REST': 0
    };
    return table[note] || 0;
  }

  // Play rich, authentic Christmas Handbell / Celesta note
  playHandbell(freq, time, duration = 0.4) {
    if (!this.ctx || freq <= 0) return;

    // Harmonic layers to simulate bronze Christmas handbell
    const fundamental = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const chime = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(freq, time);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.76, time); // Handbell distinct harmonic

    chime.type = 'triangle';
    chime.frequency.setValueAtTime(freq * 5.4, time);

    // Warm bell envelope: immediate bell strike, singing decay
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(0.24, time + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    fundamental.connect(noteGain);
    overtone.connect(noteGain);
    chime.connect(noteGain);
    noteGain.connect(this.carolGain);

    fundamental.start(time);
    overtone.start(time);
    chime.start(time);

    fundamental.stop(time + duration);
    overtone.stop(time + duration);
    chime.stop(time + duration);

    this.activeNodes.push(fundamental, overtone, chime);
  }

  // Gentle Christmas sleigh bells
  playSleighBells(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2600 + Math.random() * 400, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);

    osc.connect(gain);
    gain.connect(this.carolGain);

    osc.start(time);
    osc.stop(time + 0.07);
  }

  // Warm acoustic bass accompaniment
  playWarmBass(freq, time, duration = 0.3) {
    if (!this.ctx || freq <= 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq / 2, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.carolGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // CAROL 1: "JINGLE BELLS" (Authentic Festive Handbells & Sleigh Bells)
  playJingleBells(startTime) {
    const tempo = 0.24;
    let t = startTime;

    const melody = [
      // Jingle bells, jingle bells, jingle all the way
      ['E5', 1], ['E5', 1], ['E5', 2],
      ['E5', 1], ['E5', 1], ['E5', 2],
      ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],

      // Oh what fun it is to ride in a one-horse open sleigh, hey!
      ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5],
      ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5],
      ['E5', 1], ['D5', 1], ['D5', 1], ['E5', 1],
      ['D5', 2], ['G5', 2],

      // Repeat chorus
      ['E5', 1], ['E5', 1], ['E5', 2],
      ['E5', 1], ['E5', 1], ['E5', 2],
      ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
      ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5],
      ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5],
      ['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1],
      ['C5', 4]
    ];

    melody.forEach(([note, beats], idx) => {
      const dur = beats * tempo;
      this.playHandbell(this.getFreq(note), t, dur * 1.2);
      
      // Sleigh bells rhythm
      this.playSleighBells(t);
      if (idx % 2 === 0) {
        this.playWarmBass(this.getFreq('C4'), t, dur * 0.8);
      }

      t += dur;
    });

    return t - startTime;
  }

  // CAROL 2: "WE WISH YOU A MERRY CHRISTMAS" (Warm Traditional Christmas Carol)
  playWeWishYouAMerryChristmas(startTime) {
    const tempo = 0.28;
    let t = startTime;

    const melody = [
      // We wish you a merry Christmas
      ['D5', 1],
      ['G5', 1], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['F#5', 0.5],
      ['E5', 1], ['E5', 1], ['E5', 1],
      // We wish you a merry Christmas
      ['A5', 1], ['A5', 0.5], ['B5', 0.5], ['A5', 0.5], ['G5', 0.5],
      ['F#5', 1], ['D5', 1], ['D5', 1],
      // We wish you a merry Christmas and a Happy New Year!
      ['B5', 1], ['B5', 0.5], ['C6', 0.5], ['B5', 0.5], ['A5', 0.5],
      ['G5', 1], ['E5', 1], ['D5', 0.5], ['D5', 0.5],
      ['E5', 1], ['A5', 1], ['F#5', 1],
      ['G5', 3]
    ];

    melody.forEach(([note, beats], idx) => {
      const dur = beats * tempo;
      this.playHandbell(this.getFreq(note), t, dur * 1.3);

      if (idx % 3 === 0) {
        this.playSleighBells(t);
        this.playWarmBass(this.getFreq('G3'), t, dur * 0.9);
      }

      t += dur;
    });

    return t - startTime;
  }

  // CAROL 3: "JOY TO THE WORLD" (Festive Holiday Chimes)
  playJoyToTheWorld(startTime) {
    const tempo = 0.26;
    let t = startTime;

    const melody = [
      // Joy to the world! The Lord is come
      ['C6', 1.5], ['B5', 0.5], ['A5', 1.5], ['G5', 0.5],
      ['F5', 1], ['E5', 1], ['D5', 1.5], ['C5', 0.5],
      ['G5', 1.5], ['A5', 0.5], ['A5', 1.5], ['B5', 0.5],
      ['B5', 1.5], ['C6', 1]
    ];

    melody.forEach(([note, beats]) => {
      const dur = beats * tempo;
      this.playHandbell(this.getFreq(note), t, dur * 1.25);
      this.playSleighBells(t);
      t += dur;
    });

    return t - startTime;
  }

  // Continuous music loop
  scheduleCarol() {
    if (!this.isPlaying || !this.ctx) return;

    const now = this.ctx.currentTime + 0.05;
    let duration = 0;

    if (this.currentTrack % 3 === 0) {
      duration = this.playJingleBells(now);
    } else if (this.currentTrack % 3 === 1) {
      duration = this.playWeWishYouAMerryChristmas(now);
    } else {
      duration = this.playJoyToTheWorld(now);
    }

    this.currentTrack++;

    this.loopTimer = setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleCarol();
      }
    }, (duration + 0.8) * 1000);
  }

  startMusic() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleCarol();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    this.activeNodes = [];
  }

  toggleMusic() {
    this.init();
    if (this.isPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  setVolume(val) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // --- Festive Sound Effects ---

  playPop() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playHandbell(880, now, 0.15);
  }

  playJingleChime() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
      this.playHandbell(freq, now + idx * 0.08, 0.45);
    });
  }

  // Exciting drumroll before reveal
  playDrumRoll(duration = 2.4) {
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

      const intensity = 0.08 + (i / steps) * 0.2;
      gain.gain.setValueAtTime(intensity, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.045);
    }
  }

  // Royal Christmas Fanfare with sparkling handbells
  playFanfare() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const fanfareNotes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.3, d: 0.18 },
      { f: 1046.50, t: 0.48, d: 0.8 },
      { f: 1318.51, t: 0.58, d: 0.9 },
    ];

    fanfareNotes.forEach(({ f, t, d }) => {
      this.playHandbell(f, now + t, d);
    });

    setTimeout(() => {
      if (this.ctx) {
        [1567.98, 1760.00, 2093.00, 2637.02].forEach((freq, idx) => {
          this.playHandbell(freq, this.ctx.currentTime + idx * 0.08, 0.6);
        });
      }
    }, 450);
  }
}

export const audioManager = new TraditionalChristmasAudioManager();
