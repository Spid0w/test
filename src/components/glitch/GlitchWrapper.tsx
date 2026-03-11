"use client";

import { useEffect, useState } from "react";
import { randomEngine } from "@/utils/randomEngine";

export function GlitchWrapper() {
  const [isGlitching, setIsGlitching] = useState(false);
  const [type, setType] = useState<"shake" | "invert" | "split" | null>(null);

  useEffect(() => {
    const unsubscribe = randomEngine.subscribe((event) => {
      if (event.type === "GLITCH_SCREEN" || event.type === "JUMPSCARE") {
        setIsGlitching(true);
        
        const types: ("shake" | "invert" | "split")[] = ["shake", "invert", "split"];
        setType(types[Math.floor(Math.random() * types.length)]);
        
        // Glitch effect lasts 200ms to 800ms
        const duration = Math.random() * 600 + 200;
        
        setTimeout(() => {
          setIsGlitching(false);
          setType(null);
        }, duration);
      }
    });

    return unsubscribe;
  }, []);

  if (!isGlitching) return null;

  return (
    <div className="fixed inset-0 z-[9000] pointer-events-none">
      {type === "invert" && (
        <div className="absolute inset-0 backdrop-invert" />
      )}
      {type === "shake" && (
        <div className="absolute inset-0 bg-white/10 animate-shake mix-blend-exclusion" />
      )}
      {type === "split" && (
        <>
          <div className="absolute inset-0 bg-red-500/20 translate-x-2 mix-blend-screen" />
          <div className="absolute inset-0 bg-blue-500/20 -translate-x-2 mix-blend-screen" />
        </>
      )}
    </div>
  );
}
