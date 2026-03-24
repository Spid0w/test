"use client";
import { useEffect } from "react";

const ZALGO_CHARS = ["\u030d", "\u030e", "\u0304", "\u0305", "\u033f", "\u0311", "\u0306", "\u0310", "\u0352", "\u0357", "\u0351", "\u030b", "\u0300", "\u0301", "\u030a", "\u0346", "\u0316", "\u0317", "\u0318", "\u0319", "\u031c", "\u031d", "\u0320", "\u0324", "\u0325", "\u0326", "\u0329", "\u032a", "\u032b"];

function zalgo(text: string) {
  return text.split('').map(char => {
    let z = char;
    if (char.match(/[a-zA-Z0-9]/)) {
      for (let i = 0; i < 3; i++) {
          z += ZALGO_CHARS[Math.floor(Math.random() * ZALGO_CHARS.length)];
      }
    }
    return z;
  }).join('');
}

export function useCursedCopy() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || !selection.toString()) return;
      
      const cursedText = zalgo("h e l p  m e  " + selection.toString() + "  h e l p  m e");
      
      e.clipboardData?.setData("text/plain", cursedText);
      e.preventDefault();

      // Temporarily change selection visual if possible (doesn't always work robustly, 
      // but we can try to corrupt the dom slightly or just let the copy be corrupted)
    };

    const handleSelect = () => {
      const selection = window.getSelection();
      if (!selection || !selection.toString()) return;
      // We could corrupt text on selection change, but it's very destructive to the DOM.
      // So sticking to just copy interception.
    };

    window.addEventListener("copy", handleCopy);
    document.addEventListener("selectionchange", handleSelect);
    
    return () => {
      window.removeEventListener("copy", handleCopy);
      document.removeEventListener("selectionchange", handleSelect);
    };
  }, []);
}
