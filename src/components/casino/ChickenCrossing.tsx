"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { ArrowUp, Car, Coins, RotateCcw, Trophy, Zap } from "lucide-react";

const TOTAL_LANES = 10;
const LANES = Array.from({ length: TOTAL_LANES });

export function ChickenCrossing() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [currentLane, setCurrentLane] = useState(-1); // -1 = start
  const [gameState, setGameState] = useState<"betting" | "playing" | "won" | "lost">("betting");
  const [multiplier, setMultiplier] = useState(1);
  const [obstacles, setObstacles] = useState<number[][]>([]); // obstacle positions for each lane

  const startGame = () => {
    if (balance === null || balance < bet) return;
    updateBalance(-bet);
    setCurrentLane(0);
    setGameState("playing");
    setMultiplier(1.0);
    generateObstacles();
  };

  const generateObstacles = () => {
    // Each lane has a 30% to 50% chance of a "kill" zone for simplicity in this logic
    // but the user wants to "see" it.
    // For a real game, we'd have moving parts.
    // Let's do a logic where each step has a risk.
  };

  const nextStep = () => {
    if (gameState !== "playing") return;

    // Logic: 15% chance to get "hit" per step
    const risk = 0.15;
    if (Math.random() < risk) {
      setGameState("lost");
      return;
    }

    const nextLane = currentLane + 1;
    setCurrentLane(nextLane);
    
    // Multiplier increases exponentially
    const newMult = Math.pow(1.3, nextLane + 1);
    setMultiplier(newMult);

    if (nextLane === TOTAL_LANES - 1) {
      handleWin(newMult);
    }
  };

  const handleWin = (finalMult: number) => {
    setGameState("won");
    updateBalance(bet * finalMult);
  };

  const cashOut = () => {
    if (gameState === "playing" && currentLane >= 0) {
      handleWin(multiplier);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto p-10 bg-zinc-900/50 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />

      {/* Controls */}
      <div className="w-full lg:w-72 flex flex-col gap-8 relative z-10">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Stake</label>
          <div className="relative">
            <input 
              type="number" 
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={gameState !== "betting"}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-[#d4af37] transition-all"
            />
            <Coins className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
          </div>
        </div>

        <div className="mt-auto space-y-4">
          {gameState === "betting" ? (
            <button 
              onClick={startGame}
              className="w-full py-6 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              Start Journey
            </button>
          ) : gameState === "playing" ? (
            <div className="space-y-4">
              <button 
                onClick={nextStep}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ArrowUp className="w-5 h-5" /> Move Forward
              </button>
              <button 
                onClick={cashOut}
                className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-green-500 transition-all flex flex-col items-center"
              >
                <span className="text-[10px] opacity-70">Cash Out</span>
                <span className="text-lg">{(bet * multiplier).toFixed(2)}$</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setGameState("betting")}
              className="w-full py-6 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Try Again
            </button>
          )}
        </div>

        {/* Multiplier Info */}
        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
           <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">
             <span>Progress</span>
             <span>{Math.max(0, currentLane + 1)} / {TOTAL_LANES}</span>
           </div>
           <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
             <motion.div 
               animate={{ width: `${((currentLane + 1) / TOTAL_LANES) * 100}%` }}
               className="h-full bg-[#d4af37]" 
             />
           </div>
        </div>
      </div>

      {/* Game Visuals (The Road) */}
      <div className="flex-1 flex flex-col-reverse gap-2 bg-black/40 p-4 rounded-3xl border border-white/5 h-[600px] relative overflow-hidden">
        {/* Lanes */}
        {LANES.map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 relative rounded-lg border-y border-white/5 flex items-center justify-center transition-colors
              ${currentLane === i ? "bg-white/5" : "bg-transparent"}
            `}
          >
             {/* Lane divider */}
             <div className="absolute top-0 w-full border-t border-dashed border-white/10" />
             
             {/* Lane Label */}
             <span className="absolute left-4 text-[10px] font-black text-zinc-800 uppercase tracking-tighter">
               LVL {i + 1} • {Math.pow(1.3, i + 1).toFixed(2)}x
             </span>

             {/* Cars (Decorative/Animated) */}
             <motion.div 
               animate={{ x: i % 2 === 0 ? ["-100%", "200%"] : ["200%", "-100%"] }}
               transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, ease: "linear" }}
               className="absolute opacity-20"
             >
                <Car className={`w-8 h-8 text-zinc-600 ${i % 2 === 0 ? "" : "rotate-180"}`} />
             </motion.div>

             {/* Chicken position */}
             {currentLane === i && gameState !== "lost" && (
               <motion.div 
                 layoutId="chicken"
                 className="relative z-20 flex flex-col items-center"
               >
                  <img src="/logo.png" className="w-12 h-12 filter brightness-200 grayscale invert drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  <div className="absolute -bottom-8 bg-[#d4af37] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">YOU</div>
               </motion.div>
             )}
          </div>
        ))}

        {/* Start Line */}
        <div className={`h-12 border-t-4 border-dashed border-green-900/30 flex items-center justify-center ${currentLane === -1 ? "opacity-100" : "opacity-20"}`}>
           <span className="text-[10px] font-black text-green-900 uppercase tracking-[1em]">SAFE ZONE</span>
        </div>

        {/* Overlay States */}
        <AnimatePresence>
          {gameState === "lost" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-red-950/40 backdrop-blur-sm flex items-center justify-center"
            >
               <div className="text-center p-8 bg-black rounded-3xl border border-red-500 shadow-2xl">
                  <Car className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">CRASHED!</h3>
                  <p className="text-zinc-500 font-bold mt-2 uppercase text-xs tracking-widest">The chicken didn't make it.</p>
               </div>
            </motion.div>
          )}
          {gameState === "won" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-green-950/40 backdrop-blur-sm flex items-center justify-center"
            >
               <div className="text-center p-8 bg-black rounded-3xl border border-[#d4af37] shadow-2xl">
                  <Trophy className="w-16 h-16 text-[#d4af37] mx-auto mb-4 animate-pulse" />
                  <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">SURVIVED!</h3>
                  <div className="text-2xl font-black text-[#d4af37] mt-4">+{(bet * multiplier).toFixed(2)}$</div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
