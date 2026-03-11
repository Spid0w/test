"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Lock, Skull } from "lucide-react";

export function FakeDarknetMarket({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const top = Math.random() * 40 + 10 + "%";
  const left = Math.random() * 40 + 10 + "%";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="fixed z-50 bg-[#0a0a0c] border border-red-900 shadow-[0_0_30px_rgba(255,0,0,0.15)] w-[500px] text-gray-300 font-mono rounded-md overflow-hidden"
      style={{ top, left }}
    >
      <div className="bg-[#111] p-2 flex justify-between items-center border-b border-red-900/50">
        <div className="flex items-center gap-2 text-xs text-red-700">
           <Lock size={12} />
           <span>Tor :: Establishing secure connection...</span>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xs">
          [disconnect]
        </button>
      </div>

      <div className="p-6 h-[300px] flex flex-col items-center justify-center relative">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-8 h-8 rounded-full border-2 border-red-900 border-t-red-500 animate-spin" />
             <p className="text-xs text-red-800 animate-pulse">Decrypting onion node...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col"
          >
             <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
                <Skull color="red" size={24} />
                <h2 className="text-red-500 font-black tracking-widest text-lg">SILK_ROAD_V4</h2>
             </div>
             
             <div className="flex-1 overflow-auto text-xs space-y-3">
               <div className="flex justify-between p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-red-900">
                  <span>[Data Breach] 1.2M User Records</span>
                  <span className="text-green-500">0.05 BTC</span>
               </div>
               <div className="flex justify-between p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-red-900">
                  <span>Zero-day Exploit (Windows 11)</span>
                  <span className="text-green-500">2.4 BTC</span>
               </div>
               <div className="flex justify-between p-2 bg-red-950/20 rounded border border-red-900/50 hover:bg-red-900/20">
                  <span className="text-red-400">Target Hit // Unpocoloco Visitor</span>
                  <span className="text-green-500">PENDING ESCROW</span>
               </div>
             </div>

             <div className="mt-4 pt-4 border-t border-zinc-800 text-[10px] text-center text-zinc-600">
                You are not anonymous here.
             </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
