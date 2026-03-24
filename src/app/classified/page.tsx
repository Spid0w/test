"use client";

import { useEffect, useState, useRef } from "react";
import { GlitchText } from "@/components/glitch/GlitchText";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ClassifiedPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [blackout, setBlackout] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Rare blink
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 120000); // 2 mins
    
    // Some random blinks too
    const randomBlink = () => {
        if(Math.random() > 0.95) {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }
    };
    const rInterval = setInterval(randomBlink, 15000);

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        clearInterval(interval);
        clearInterval(rInterval);
    };
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

  const handleIrisClick = () => {
      setBlackout(true);
      setTimeout(() => setBlackout(false), 5000);
  };

  if (blackout) {
      return (
          <div className="fixed inset-0 bg-black z-[99999] cursor-none flex items-center justify-center">
             <div className="w-1 h-1 bg-red-900 rounded-full animate-ping opacity-20"></div>
          </div>
      );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#010000] text-red-950 font-mono p-4 overflow-hidden relative">
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
        
        {/* MASSIVE REALISTIC EYE */}
        <div className="relative group">
            <motion.div 
                className="absolute inset-0 bg-red-600/10 blur-[100px] rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <svg 
                width="400" 
                height="260" 
                viewBox="0 0 400 260" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="relative drop-shadow-[0_0_80px_rgba(150,0,0,0.15)]"
            >
                <defs>
                    <radialGradient id="irisGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#000000" />
                        <stop offset="30%" stopColor="#1a0000" />
                        <stop offset="70%" stopColor="#4a0000" />
                        <stop offset="100%" stopColor="#2a0000" />
                    </radialGradient>
                    <radialGradient id="scleraGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="60%" stopColor="#0d0000" />
                        <stop offset="100%" stopColor="#2a0202" />
                    </radialGradient>
                    <filter id="blurVeins">
                        <feGaussianBlur stdDeviation="1" />
                    </filter>
                </defs>

                {/* Sclera / Whites of the eye (very red/dark) */}
                <path 
                    d="M20 130 C 80 40, 320 40, 380 130 C 320 220, 80 220, 20 130 Z" 
                    fill="url(#scleraGradient)"
                    stroke="#1a0000"
                    strokeWidth="2"
                />

                {/* Blood vessels */}
                <g filter="url(#blurVeins)" opacity="0.6">
                    <path d="M20 130 Q 60 110 100 120 T 140 100" stroke="#4a0000" strokeWidth="1.5" fill="none" />
                    <path d="M40 140 Q 80 160 120 150 T 160 170" stroke="#3a0000" strokeWidth="1" fill="none" />
                    <path d="M380 130 Q 340 110 320 100 T 260 110" stroke="#5a0000" strokeWidth="2" fill="none" />
                    <path d="M360 150 Q 320 170 280 160 T 240 140" stroke="#4a0000" strokeWidth="1" fill="none" />
                    <path d="M340 120 Q 300 90 270 110" stroke="#3a0000" strokeWidth="1" fill="none" />
                </g>

                {/* Iris & Pupil grouped to move together */}
                <g transform={`translate(${pupil.x}, ${pupil.y})`}>
                    {/* Iris */}
                    <circle cx="200" cy="130" r="55" fill="url(#irisGradient)" />
                    
                    {/* Iris details/fibers */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <line 
                            key={i}
                            x1="200" 
                            y1="130" 
                            x2={200 + Math.cos(i * 12 * Math.PI / 180) * 50} 
                            y2={130 + Math.sin(i * 12 * Math.PI / 180) * 50} 
                            stroke="#8a0000" 
                            strokeWidth="0.5" 
                            opacity="0.3"
                        />
                    ))}

                    <circle cx="200" cy="130" r="55" fill="none" stroke="#000" strokeWidth="3" opacity="0.8" />
                    
                    {/* Clickable transparent overlay over Iris */}
                    <circle 
                        cx="200" cy="130" r="55" fill="transparent" 
                        className="cursor-pointer" 
                        onClick={handleIrisClick}
                    />

                    {/* Pupil */}
                    <circle cx="200" cy="130" r="18" fill="#000" />
                    {/* Reflection */}
                    <circle cx="185" cy="115" r="4" fill="#fff" opacity="0.1" />
                </g>

                {/* Flesh/Eyelids overlay context */}
                <path 
                    d="M0 0 L 400 0 L 400 260 L 0 260 Z M 20 130 C 80 40, 320 40, 380 130 C 320 220, 80 220, 20 130 Z" 
                    fill="#010000" 
                    fillRule="evenodd"
                />

                {/* Eyelid outlines / wrinkles */}
                <path d="M30 115 C 100 20, 300 20, 370 115" stroke="#110000" strokeWidth="3" fill="none" />
                <path d="M40 150 C 100 240, 300 240, 360 150" stroke="#0a0000" strokeWidth="2" fill="none" />
                
                {/* Tear duct */}
                <path d="M20 130 Q 30 135 40 130 Q 35 125 20 130" fill="#2a0000" />

                {/* Blink Animation (Eyelid shutting) */}
                <AnimatePresence>
                    {blink && (
                        <motion.path 
                            initial={{ d: "M20 130 C 80 40, 320 40, 380 130 C 320 40, 80 40, 20 130 Z" }}
                            animate={{ d: "M20 130 C 80 130, 320 130, 380 130 C 320 130, 80 130, 20 130 Z" }}
                            exit={{ d: "M20 130 C 80 40, 320 40, 380 130 C 320 40, 80 40, 20 130 Z" }}
                            transition={{ duration: 0.05 }}
                            fill="#010000"
                        />
                    )}
                </AnimatePresence>
            </svg>
        </div>

        <div className="space-y-4">
            <h1 className="text-4xl font-black italic tracking-[0.2em] text-red-900 group-hover:text-red-700 transition-colors duration-1000">
                <GlitchText>YOU_WERE_NOT_INVITED</GlitchText>
            </h1>
            
            <div className="max-w-md mx-auto space-y-4 text-xs uppercase tracking-widest opacity-40">
                <p>Votre présence a été enregistrée.</p>
                <p>Le protocole de surveillance est maintenant permanent.</p>
                <p className="text-red-600 font-bold">Ne clignez pas des yeux.</p>
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
