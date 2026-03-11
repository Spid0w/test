"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ObserverPage() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-red-500 font-mono overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-screen" style={{
        backgroundImage: 'radial-gradient(circle at center, transparent 0%, #000 100%)'
      }} />
      
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="text-6xl font-black tracking-tighter"
        >
          OBSERVER_MODE
        </motion.div>

        <div className="text-2xl opacity-80 flex flex-col items-center gap-2 border border-red-500/30 p-8 rounded-sm bg-red-950/20">
          <p>TARGET ACQUIRED</p>
          <div className="font-bold tracking-widest mt-4">
            X_{coords.x.toString().padStart(4, '0')} : Y_{coords.y.toString().padStart(4, '0')}
          </div>
        </div>

        <motion.div 
            className="absolute -z-10 w-[400px] h-[400px] border border-red-500/20 rounded-full"
            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
        />
      </div>
    </main>
  );
}
