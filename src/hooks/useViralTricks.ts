"use client";

import { useEffect } from "react";
import { randomEngine } from "./randomEngine";

const TITLES = [
  "unpocoloco",
  "are you lost?",
  "turn back",
  "i see you",
  "Error: 0x00000000",
  "you stayed too long",
  "don't look behind you",
  "downloading payload...",
];

export function useViralTricks() {
  useEffect(() => {
    // 1. Changing titles randomly
    const titleInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        document.title = TITLES[Math.floor(Math.random() * TITLES.length)];
      } else {
        document.title = "unpocoloco";
      }
    }, 5000);

    // 2. Clipboard manipulation - occasionally append mystery text
    const onCopy = (e: ClipboardEvent) => {
      if (Math.random() < 0.3) {
        const selection = window.getSelection()?.toString() || "";
        e.clipboardData?.setData('text/plain', selection + "\n\n-- you are being watched.");
        e.preventDefault();
        
        // Maybe trigger an event for copying
        randomEngine.triggerEvent("POPUP_ERROR");
      }
    };

    // 3. Fake browser notification request (never actually requests, just triggers popup visually)
    const notificationInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        randomEngine.triggerEvent("POPUP_ANTIVIRUS");
      }
    }, 30000);

    window.addEventListener("copy", onCopy);

    return () => {
      clearInterval(titleInterval);
      clearInterval(notificationInterval);
      window.removeEventListener("copy", onCopy);
      document.title = "unpocoloco";
    };
  }, []);
}
