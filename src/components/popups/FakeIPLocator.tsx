"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

export function FakeIPLocator({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const top = Math.random() * 50 + 10 + "%";
  const left = Math.random() * 50 + 10 + "%";

  useEffect(() => {
    // Generate some fake scary numbers
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const lat = (Math.random() * 180 - 90).toFixed(4);
    const lng = (Math.random() * 360 - 180).toFixed(4);

    const sequence = [
      "INITIALIZING TRACE...",
      "BYPASSING PROXY LAYERS...",
      `TARGET IP ACQUIRED: ${ip}`,
      `RESOLVING GEOLOCATION...`,
      `LAT: ${lat} // LNG: ${lng}`,
      "MATCHING HARDWARE FINGERPRINT...",
      "SUCCESS.",
      "They know you are here."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setLines(prev => [...prev, sequence[current]]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[60] bg-black border border-green-500/50 shadow-[0_0_15px_rgba(0,255,0,0.1)] w-[400px] text-green-500 font-mono text-xs rounded pointer-events-auto"
      style={{ top, left }}
    >
      <div className="bg-green-950/30 p-2 flex justify-between items-center border-b border-green-900">
        <div className="flex items-center gap-2">
           <Terminal size={14} />
           <span>geotrack.exe</span>
        </div>
        <button onClick={onClose} className="hover:text-white px-2">X</button>
      </div>

      <div className="p-4 space-y-2 h-[200px] overflow-auto">
        {lines.map((line, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-zinc-500 mr-2">{'>'}</span>{line}
          </motion.div>
        ))}
        {lines.length < 8 && (
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-2 h-3 bg-green-500 inline-block align-middle ml-2"
          />
        )}
      </div>
    </motion.div>
  );
}
