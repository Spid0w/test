"use client";

// We'll use synth sounds generated via Web Audio API so we don't need external assets immediately.
// This is perfect for weird, mysterious, and troll-like sounds.

class SoundSystem {
  context: AudioContext | null = null;
  isEnabled: boolean = false;

  init() {
    if (typeof window === "undefined") return;
    if (this.context) return;
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isEnabled = true;
    } catch (e) {
      console.error("Audio engine failed to initialize", e);
    }
  }

  // A subtle low hum
  playHum() {
    if (!this.context || !this.isEnabled) return;
    this.resume();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(45, this.context.currentTime); // very low freq
    
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.context.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 3);

    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 3);
  }

  // Windows Error-like beep
  playErrorBeep() {
    if (!this.context || !this.isEnabled) return;
    this.resume();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.setValueAtTime(600, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }

  // Glitch static noise
  playGlitch() {
    if (!this.context || !this.isEnabled) return;
    this.resume();
    const bufferSize = this.context.sampleRate * 0.2; // 200ms
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // white noise
    }
    
    const noiseSource = this.context.createBufferSource();
    noiseSource.buffer = buffer;
    
    const bandpass = this.context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1000 + Math.random() * 2000;
    
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);

    noiseSource.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.context.destination);
    
    noiseSource.start();
  }

  // Creepy jumpscare sound
  playJumpscare() {
    if (!this.context || !this.isEnabled) return;
    this.resume();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.4);
  }

  // Creepy backwards whisper simulation
  playWhisper() {
    if (!this.context || !this.isEnabled) return;
    this.resume();
    
    // Create a 1-second buffer of noise
    const bufferSize = this.context.sampleRate * 1.5;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with modulated noise to simulate speech
    for (let i = 0; i < bufferSize; i++) {
        // base noise
        const n = Math.random() * 2 - 1;
        // amplitude modulate it with a slow sine wave to make it sound like syllables
        const mod = Math.sin(i / this.context.sampleRate * 20) * 0.5 + 0.5;
        data[i] = n * mod * 0.5;
    }
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    // Play it backwards for creepiness
    source.playbackRate.value = -0.8;
    
    // Filter to make it sound muffled and human-like voice range
    const filter = this.context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 1.2;
    
    // Very quiet
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, this.context.currentTime + 0.5); // extremely quiet
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1.5);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    
    source.start(0, buffer.duration);
  }

  private resume() {
    if (this.context?.state === "suspended") {
      this.context.resume();
    }
  }
}

export const soundSystem = new SoundSystem();
