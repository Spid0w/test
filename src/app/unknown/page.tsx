"use client";

import { useEffect, useState } from "react";
import { GlitchText } from "@/components/glitch/GlitchText";
import { StrangeLink } from "@/components/StrangeLink";
import { motion } from "framer-motion";

const PHRASES = [
  "Why did you click that?",
  "You're not supposed to be here.",
  "Look closer.",
  "Everything is a test.",
  "Wake up.",
  "Don't trust the interface.",
  "They are logging your keystrokes.",
];

export default function UnknownPage() {
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#888] font-serif p-4">
      <motion.div 
        key={phrase}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 2 }}
        className="text-2xl md:text-5xl text-center italic"
      >
        "{phrase}"
      </motion.div>

      <div className="fixed top-4 left-4 text-[10px] font-mono opacity-20">
        /dev/null
      </div>

      <div className="fixed bottom-10">
        <StrangeLink href="/404-but-not" className="text-xs font-mono opacity-30 hover:opacity-100">
           Continue
        </StrangeLink>
      </div>
    </main>
  );
}
