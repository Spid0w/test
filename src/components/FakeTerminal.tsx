"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  "ACCESSING USER MEMORY...",
  "BYPASSING FIREWALL...",
  "EXTRACTING BROWSING HISTORY...",
  "UPLOADING TO /VOID...",
  "ERROR 403: ENTITY DETECTED",
  "TERMINATING CONNECTION...",
];

export function FakeTerminal({ 
  onComplete, 
  active 
}: { 
  onComplete?: () => void;
  active: boolean;
}) {
  const [currentLines, setCurrentLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurrentLines([]);
      return;
    }

    let currentLineIndex = 0;
    
    const interval = setInterval(() => {
      if (currentLineIndex < lines.length) {
        setCurrentLines((prev) => [...prev, lines[currentLineIndex]]);
        currentLineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 font-mono text-green-500 text-sm md:text-lg pointer-events-none"
        >
          <div className="w-full max-w-2xl text-left space-y-2">
            {currentLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                &gt; {line}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-3 h-5 bg-green-500 mt-2"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
