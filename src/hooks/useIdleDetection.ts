"use client";

import { useEffect, useRef } from "react";
import { randomEngine } from "@/utils/randomEngine";

export function useIdleDetection() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // If user is idle for 15 seconds, trigger a troll event
      timeoutRef.current = setTimeout(() => {
        randomEngine.triggerEvent();
      }, 15000);
    };

    // Listeners for activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);
}
