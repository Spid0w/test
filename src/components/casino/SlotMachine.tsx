"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Diamond, Gem, RotateCcw, Star, Trophy, Zap } from "lucide-react";

const SYMBOLS = [
  { icon: Gem, color: "#d4af37", value: 10, label: "CRISTAL" },
  { icon: Star, color: "#ff4da6", value: 5, label: "STAR" },
  { icon: Diamond, color: "#4da6ff", value: 2, label: "DIAMOND" },
  { icon: Zap, color: "#4dff4d", value: 1, label: "ENERGY" },
];

export function SlotMachine() {
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(null);

    // Simulate spin delay for each reel
    setTimeout(() => {
      const newReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];

      setReels(newReels);
      setSpinning(false);

      // Check win
      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        const symbol = SYMBOLS[newReels[0]];
        const winAmount = bet * symbol.value;
        setWin(winAmount);
        setHistory(prev => [`3x ${symbol.label} (+${winAmount}$)`, ...prev].slice(0, 5));
      } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2] || newReels[0] === newReels[2]) {
         // Partial win?
         setHistory(prev => ["Small Match", ...prev].slice(0, 5));
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto p-10 bg-zinc-900/50 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d4af37]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <div className="w-full lg:w-64 flex flex-col gap-8">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Bet Settings</label>
          <div className="relative">
            <input 
              type="number" 
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={spinning}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-[#d4af37] transition-all disabled:opacity-50"
            />
            <Coins className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
           <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Payouts</label>
           <div className="space-y-3">
             {SYMBOLS.map((s, i) => (
               <div key={i} className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <s.icon className="w-4 h-4" style={{ color: s.color }} />
                   <span className="text-[10px] font-bold text-zinc-400">{s.label}</span>
                 </div>
                 <span className="text-xs font-black text-white">{s.value}x</span>
               </div>
             ))}
           </div>
        </div>

        <div className="mt-auto">
           <button 
             onClick={spin}
             disabled={spinning}
             className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all shadow-xl
               ${spinning ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-gradient-to-r from-[#d4af37] to-[#f0d78c] text-black hover:scale-[1.02] active:scale-95"}
             `}
           >
             {spinning ? "SPINNING..." : "PULL LEVER"}
           </button>
        </div>
      </div>

      {/* Reels Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex gap-4 mb-12">
          {reels.map((symbolIndex, reelIndex) => (
            <div key={reelIndex} className="w-32 h-48 lg:w-48 lg:h-64 bg-black border-4 border-zinc-800 rounded-3xl overflow-hidden relative shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={spinning ? "spinning" : symbolIndex}
                  initial={{ y: spinning ? -1000 : 0, opacity: spinning ? 0 : 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: spinning ? 0.1 : 0.5, 
                    repeat: spinning ? Infinity : 0,
                    ease: spinning ? "linear" : "easeOut",
                    delay: reelIndex * 0.2
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {spinning ? (
                    <div className="flex flex-col gap-8 opacity-20">
                      {SYMBOLS.map((S, i) => <S.icon key={i} className="w-16 h-16" />)}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      {(() => {
                        const S = SYMBOLS[symbolIndex];
                        return (
                          <>
                            <S.icon className="w-20 h-20 lg:w-28 lg:h-28 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{ color: S.color }} />
                            <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">{S.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Win Message */}
        <div className="h-20 flex items-center justify-center w-full">
           <AnimatePresence>
             {win && (
               <motion.div
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="flex flex-col items-center"
               >
                 <div className="flex items-center gap-3 text-3xl font-black italic tracking-tighter text-[#d4af37] uppercase">
                   <Trophy className="w-8 h-8" /> BIG WIN +{win}$ <Trophy className="w-8 h-8" />
                 </div>
                 <div className="w-full h-1 bg-[#d4af37] mt-2 animate-pulse" />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* History / Log */}
        <div className="w-full max-w-md mt-8 pt-8 border-t border-white/5">
           <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Recent Activity</span>
             <RotateCcw className="w-3 h-3 text-zinc-600 cursor-pointer hover:text-white transition-colors" />
           </div>
           <div className="space-y-2">
             {history.length === 0 && <div className="text-center py-4 text-[10px] text-zinc-700 font-bold uppercase italic">No games played yet</div>}
             {history.map((h, i) => (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={i} 
                 className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-[10px] font-bold"
               >
                 <span className="text-zinc-400">SESSION_LOG_{i+1024}</span>
                 <span className="text-[#d4af37] uppercase">{h}</span>
               </motion.div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
