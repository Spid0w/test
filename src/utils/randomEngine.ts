"use client";

import { soundSystem } from "./soundSystem";

export type EventType = 
  | "POPUP_ERROR" 
  | "POPUP_ANTIVIRUS" 
  | "POPUP_UPDATE" 
  | "POPUP_DOWNLOAD" 
  | "POPUP_EMOJI"
  | "POPUP_CAPTCHA"
  | "FLASH_IMAGE" 
  | "GLITCH_SCREEN" 
  | "JUMPSCARE";

export interface TrollEvent {
  id: string;
  type: EventType;
  timestamp: number;
}

type EventListener = (event: TrollEvent) => void;

class RandomEngine {
  private listeners: EventListener[] = [];
  private isRunning = false;
  private timerInfo: NodeJS.Timeout | null = null;
  
  // Weights (higher = more likely)
  private weights: Record<EventType, number> = {
    // frequent
    FLASH_IMAGE: 40,
    GLITCH_SCREEN: 25,
    POPUP_ERROR: 15,
    
    // medium
    POPUP_DOWNLOAD: 10,
    POPUP_ANTIVIRUS: 8,
    POPUP_EMOJI: 7,
    
    // rare
    POPUP_UPDATE: 5,
    POPUP_CAPTCHA: 4,
    
    // very rare
    JUMPSCARE: 1,
  };

  private lastEventTime: number = 0;
  private minimumCooldownMs: number = 2000;

  start() {
    if (typeof window === "undefined" || this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextTick();
    
    // Interactions sometimes provoke events immediately (skipping cooldown if we want)
    window.addEventListener("click", this.handleUserInteraction);
    window.addEventListener("scroll", this.handleUserInteraction);
  }

  stop() {
    this.isRunning = false;
    if (this.timerInfo) clearTimeout(this.timerInfo);
    if (typeof window !== "undefined") {
      window.removeEventListener("click", this.handleUserInteraction);
      window.removeEventListener("scroll", this.handleUserInteraction);
    }
  }

  subscribe(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public triggerEvent(type?: EventType) {
    const now = Date.now();
    if (now - this.lastEventTime < this.minimumCooldownMs) {
      return; // prevent spam
    }
    
    this.lastEventTime = now;
    
    // Select type based on weight if not explicitly provided
    const selectedType = type || this.selectRandomEvent();
    
    const trollEvent: TrollEvent = {
      id: Math.random().toString(36).substring(2, 9),
      type: selectedType,
      timestamp: now,
    };
    
    // Play sounds if relevant
    if (selectedType.startsWith("POPUP")) {
      soundSystem.playErrorBeep();
    } else if (selectedType === "GLITCH_SCREEN" || selectedType === "FLASH_IMAGE") {
      soundSystem.playGlitch();
    } else if (selectedType === "JUMPSCARE") {
      soundSystem.playJumpscare();
    }
    
    this.listeners.forEach(listener => listener(trollEvent));
  }

  private handleUserInteraction = () => {
    // 5% chance on click/scroll to instantly trigger something
    if (Math.random() < 0.05) {
      this.triggerEvent();
    }
  };

  private scheduleNextTick() {
    if (!this.isRunning) return;
    
    // Next event between 5s to 25s
    const nextTickDelay = Math.random() * 20000 + 5000;
    
    this.timerInfo = setTimeout(() => {
      // 70% chance to trigger an event on tick
      if (Math.random() < 0.7) {
        this.triggerEvent();
      }
      this.scheduleNextTick();
    }, nextTickDelay);
  }

  private selectRandomEvent(): EventType {
    const entries = Object.entries(this.weights) as [EventType, number][];
    const totalWeight = entries.reduce((sum, [_, weight]) => sum + weight, 0);
    let randomVal = Math.random() * totalWeight;
    
    for (const [type, weight] of entries) {
      randomVal -= weight;
      if (randomVal <= 0) return type;
    }
    
    return "POPUP_ERROR";
  }
}

export const randomEngine = new RandomEngine();
