"use client";

import { GlitchText } from "@/components/glitch/GlitchText";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ClassifiedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-red-600 font-mono p-4 overflow-hidden relative">
      {/* Background glitch effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-red-600 h-[1px] w-full"
            initial={{ top: Math.random() * 100 + "%", opacity: 0 }}
            animate={{ opacity: [0, 1, 0], top: Math.random() * 100 + "%" }}
            transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="z-10 text-center max-w-2xl border-2 border-red-900/50 p-12 bg-black/80 backdrop-blur-sm shadow-[0_0_100px_rgba(255,0,0,0.1)]">
        <h1 className="text-5xl font-black mb-8 italic tracking-tighter">
          <GlitchText>ACCESS_DENIED</GlitchText>
        </h1>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed opacity-80">
          <p className="text-red-500 font-bold uppercase tracking-widest">
            Vous n'auriez pas dû.
          </p>
          <p>
            Votre signature numérique a été isolée. 
            Ce nœud n'existe pas dans le registre public. 
            Chaque seconde passée ici réduit votre anonymat de 14.2%.
          </p>
          <div className="pt-8 border-t border-red-900/30">
            <p className="text-[10px] text-red-950 uppercase">
              Fingerprint: {Math.random().toString(36).substring(2, 15).toUpperCase()}
            </p>
            <p className="text-[10px] text-red-950 uppercase">
              Status: COMPROMISED
            </p>
          </div>
        </div>

        <Link 
          href="/"
          className="mt-12 inline-block px-10 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-black transition-all duration-300 font-bold uppercase tracking-widest text-xs"
        >
          [ ESCAPE ]
        </Link>
      </div>
    </main>
  );
}
