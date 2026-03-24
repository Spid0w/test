"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function SignalPage() {
  const [frequencies, setFrequencies] = useState<number[]>(Array(50).fill(20));
  const [morse, setMorse] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setFrequencies(prev => prev.map(() => 10 + Math.random() * 80));
      
      if (Math.random() < 0.1) {
        setMorse(prev => (prev + (Math.random() < 0.5 ? "." : "-")).slice(-20));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-zinc-500 font-mono p-4">
      <div className="w-full max-w-4xl p-12 border border-zinc-900 bg-zinc-950/20 backdrop-blur-md relative overflow-hidden">
        
        {/* Background static noise effect */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

        <div className="relative z-10 space-y-12">
          <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-widest text-zinc-100">STATION_ALPHA_7</h1>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase italic">Encrypted Broadcast // Node: 0x2A1F</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-zinc-100 tabular-nums">142.85 MHz</span>
              <p className="text-[10px] text-green-900 uppercase">Signal Strength: Optimal</p>
            </div>
          </div>

          {/* Waveform Visualizer */}
          <div className="h-40 flex items-end gap-1 px-4">
            {frequencies.map((height, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-zinc-700 min-h-[2px]"
                animate={{ height: `${height}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    backgroundColor: height > 70 ? "#fff" : "#444"
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs border-t border-zinc-900 pt-8">
            <div className="space-y-4">
              <p className="text-zinc-400 uppercase tracking-widest border-l-2 border-zinc-700 pl-4">Morse Decoder</p>
              <div className="bg-black/50 p-4 font-bold text-xl tracking-[0.5em] text-zinc-200 min-h-[60px] break-all">
                {morse}<span className="animate-pulse">_</span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-zinc-400 uppercase tracking-widest border-l-2 border-zinc-700 pl-4">System Status</p>
              <ul className="space-y-2 opacity-50">
                <li className="flex justify-between"><span>Oscillator:</span> <span className="text-green-900">LOCKED</span></li>
                <li className="flex justify-between"><span>Phase:</span> <span className="text-green-900">STABLE</span></li>
                <li className="flex justify-between"><span>Encryption:</span> <span className="text-red-900">ENABLED</span></li>
                <li className="flex justify-between"><span>Uplink:</span> <span className="text-green-900">ACTIVE</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-[10px] text-zinc-800 text-center uppercase tracking-[1em]">
            Listen carefully to the silence.
          </div>
        </div>
      </div>
    </main>
  );
}
