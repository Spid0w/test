"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "@/components/glitch/GlitchText";
import { StrangeLink } from "@/components/StrangeLink";

export default function Home() {
  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    // Sequence of unsettling intro steps
    const timers = [
      setTimeout(() => setIntroStep(1), 1500), // Show connection
      setTimeout(() => setIntroStep(2), 3500), // Show warning
      setTimeout(() => setIntroStep(3), 6000), // Load actual homepage
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        
        {/* Step 0: Blank */}
        {introStep === 0 && (
          <motion.div key="step0" className="w-full h-full absolute inset-0 bg-black" />
        )}

        {/* Step 1: Terminal booting up */}
        {introStep === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-green-500 font-mono text-sm absolute top-10 left-10"
          >
             <p>{'>'} Boot sequence initiated...</p>
             <p>{'>'} Bypass standard protocol [OK]</p>
             <p className="animate-pulse">{'>'} Awaiting handshake...</p>
          </motion.div>
        )}

        {/* Step 2: Red Warning flash */}
        {introStep === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="flex flex-col items-center text-center max-w-lg z-10"
          >
             <h1 className="text-red-600 font-bold text-4xl mb-4 uppercase tracking-widest"><GlitchText>DO NOT PROCEED</GlitchText></h1>
             <p className="text-red-900 text-sm font-mono">
               This unpocoloco instanc&x00e is corrupted.
               Leave now. Turn back.
             </p>
          </motion.div>
        )}

        {/* Step 3: Actual Homepage */}
        {introStep >= 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 2 }}
            className="w-full max-w-5xl z-10 flex flex-col items-center gap-16 relative"
          >
            {/* The "Normal" sounding header */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between font-mono text-sm border border-zinc-900/50 p-8 rounded bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
              <p className="flex items-center gap-2 text-zinc-400">
                Welcome back to&nbsp;
                <code className="font-bold text-zinc-200 bg-zinc-900 px-2 py-1 rounded">unpocoloco</code>
              </p>
              
              {/* Harmless looking link that is actually strange */}
              <div className="mt-8 md:mt-0 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                  <StrangeLink href="/deep-login">
                     [ user portal ]
                  </StrangeLink>
              </div>
            </div>

            {/* Creepy cryptic center element */}
            <div className="flex flex-col items-center mt-20 opacity-10 hover:opacity-100 transition-opacity duration-300">
               <span className="text-xs text-white uppercase tracking-[1em] mb-4">Nothing to see here</span>
               <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent" />
            </div>

            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-900 blur-[150px] opacity-10 pointer-events-none mix-blend-screen" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
