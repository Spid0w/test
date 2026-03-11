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

  private resume() {
    if (this.context?.state === "suspended") {
      this.context.resume();
    }
  }
}

export const soundSystem = new SoundSystem();
