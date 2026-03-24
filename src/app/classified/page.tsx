"use client";

import { useEffect, useState, useRef } from "react";
import { GlitchText } from "@/components/glitch/GlitchText";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ClassifiedPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 40, 25);
    
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const pupil = calculatePupilPos();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020000] text-red-950 font-mono p-4 overflow-hidden relative">
      {/* Background glitch effect - more intense */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-red-900 h-[1px] w-full"
            initial={{ top: Math.random() * 100 + "%", opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0], top: Math.random() * 100 + "%" }}
            transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity }}
          />
        ))}
        {/* Subtle red pulses */}
        <motion.div 
            className="absolute inset-0 bg-red-900/5"
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="z-10 flex flex-col items-center gap-12 text-center w-full max-w-4xl">
        
        {/* MASSIVE EYE */}
        <div className="relative group">
            <motion.div 
                className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
            <svg 
                width="300" 
                height="200" 
                viewBox="0 0 300 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="relative drop-shadow-[0_0_50px_rgba(255,0,0,0.4)]"
            >
                {/* Eye Lid / Socket */}
                <path 
                    d="M10 100C10 100 60 20 150 20C240 20 290 100 290 100C290 100 240 180 150 180C60 180 10 100 10 100Z" 
                    stroke="#1a0000" 
                    strokeWidth="4" 
                    fill="#050000"
                />
                
                {/* Inner Eye / Sclera */}
                <path 
                    d="M30 100C30 100 70 40 150 40C230 40 270 100 270 100C270 100 230 160 150 160C70 160 30 100 30 100Z" 
                    fill="#0a0000"
                    stroke="#2a0000"
                    strokeWidth="1"
                />

                {/* Iris */}
                <circle cx="150" cy="100" r="40" fill="#150000" stroke="#3a0000" strokeWidth="2" />
                
                {/* Pupil that follows cursor */}
                <motion.circle 
                    cx={150 + pupil.x} 
                    cy={100 + pupil.y} 
                    r="15" 
                    fill="red" 
                    className="blur-[2px]"
                />
                <circle 
                    cx={150 + pupil.x} 
                    cy={100 + pupil.y} 
                    r="8" 
                    fill="black"
                />

                {/* Veins */}
                <path d="M50 100L20 90" stroke="#5a0000" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
                <path d="M250 100L280 110" stroke="#5a0000" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
            </svg>
        </div>

        <div className="space-y-4">
            <h1 className="text-4xl font-black italic tracking-[0.2em] text-red-900 group-hover:text-red-600 transition-colors duration-1000">
                <GlitchText>YOU_WERE_NOT_INVITED</GlitchText>
            </h1>
            
            <div className="max-w-md mx-auto space-y-4 text-xs uppercase tracking-widest opacity-40">
                <p>Votre présence a été enregistrée.</p>
                <p>Le protocole de surveillance est maintenant permanent.</p>
                <p className="text-red-600 font-bold">Ne fermez pas les yeux.</p>
            </div>
        </div>

        <Link 
          href="/"
          className="mt-8 px-12 py-4 border border-red-950 text-red-950 hover:border-red-600 hover:text-red-600 hover:bg-red-600/5 transition-all duration-700 font-bold uppercase tracking-[0.5em] text-[10px]"
        >
          [ BACK_TO_SAFETY ]
        </Link>
      </div>

      {/* Decorative text corners */}
      <div className="absolute top-10 left-10 text-[8px] text-red-950/20 uppercase vertical-text">
        Watcher nodes active // 0xAF42
      </div>
      <div className="absolute bottom-10 right-10 text-[8px] text-red-950/20 uppercase">
        Secure Handshake Failed
      </div>
    </main>
  );
}
