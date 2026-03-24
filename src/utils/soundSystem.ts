"use client";

// We'll use synth sounds generated via Web Audio API so we don't need external assets immediately.
// This is perfect for weird, mysterious, and troll-like sounds.

class SoundSystem {
  context: AudioContext | null = null;
  isEnabled: boolean = false;

  init() { return; }
  playHum() { return; }
  playErrorBeep() { return; }
  playGlitch() { return; }
  playJumpscare() { return; }
  playWhisper() { return; }
  private resume() { return; }
}

export const soundSystem = new SoundSystem();
