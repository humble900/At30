/**
 * CanopyAudio: Synthesized Web Audio Soundscape for Touch Grass: Canopy Run
 * High-performance, zero external audio asset dependency, zero load lag.
 */

class CanopyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isAmbianceRunning: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public startAmbiance() {
    if (this.isAmbianceRunning) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isAmbianceRunning = true;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    // Wind buffer generator
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // Gentle LFO wind modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();

    this.scheduleBirdChirps();
  }

  private scheduleBirdChirps() {
    if (!this.isAmbianceRunning) return;
    const nextChirp = 3000 + Math.random() * 6000;
    setTimeout(() => {
      if (this.isAmbianceRunning && !this.isMuted) {
        this.playBirdChirp();
      }
      this.scheduleBirdChirps();
    }, nextChirp);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 600;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.14);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(g);
    g.connect(this.ambientGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playFootstep(surface: 'dirt' | 'wood' | 'stone' | 'grass' = 'dirt') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (surface === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 30, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    } else if (surface === 'stone') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 + Math.random() * 60, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    } else {
      // Natural dirt / grass crunch
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110 + Math.random() * 40, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.07);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.14);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playLanding() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playClimb() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.12);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playCheckpoint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = t + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.38);
    });
  }

  public playWaterSplash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.32);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  public playCliffFall() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  public playBellRing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Resonant rich tubular brass bell harmonics: fundamental (440Hz), octave, 3rd harmonic
    const harmonics = [
      { f: 440, gain: 0.45, decay: 2.8 },
      { f: 880, gain: 0.32, decay: 2.2 },
      { f: 1320, gain: 0.22, decay: 1.6 },
      { f: 1760, gain: 0.15, decay: 1.1 },
      { f: 2200, gain: 0.08, decay: 0.8 }
    ];

    harmonics.forEach(({ f, gain: peakGain, decay }) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(peakGain, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + decay + 0.1);
    });
  }

  public playCountdown(isGo: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(isGo ? 0.35 : 0.22, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isGo ? 0.45 : 0.2));

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + (isGo ? 0.5 : 0.25));
  }
}

export const canopyAudio = new CanopyAudioEngine();
