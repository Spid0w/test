"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { ArrowRight, Coins, RotateCcw, Trophy, Zap, Truck, Car } from "lucide-react";

const TOTAL_STEPS = 10;
const DIFFICULTIES = [
  { id: "easy", name: "Easy", risk: 0.1, multiplier: 1.1 },
  { id: "medium", name: "Medium", risk: 0.2, multiplier: 1.3 },
  { id: "hard", name: "Hard", risk: 0.35, multiplier: 1.6 },
  { id: "extreme", name: "Extreme", risk: 0.5, multiplier: 2.2 },
];

export function ChickenCrossing() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [currentStep, setCurrentStep] = useState(-1);
  const [gameState, setGameState] = useState<"betting" | "playing" | "won" | "lost">("betting");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [multiplier, setMultiplier] = useState(1);

  const startGame = () => {
    if (balance === null || balance < bet) return;
    updateBalance(-bet);
    setCurrentStep(0);
    setGameState("playing");
    setMultiplier(1.0);
  };

  const nextStep = () => {
    if (gameState !== "playing") return;

    if (Math.random() < difficulty.risk) {
      setGameState("lost");
      return;
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    
    const newMult = Math.pow(difficulty.multiplier, next + 1);
    setMultiplier(newMult);

    if (next === TOTAL_STEPS - 1) {
      handleWin(newMult);
    }
  };

  const handleWin = (finalMult: number) => {
    setGameState("won");
    updateBalance(bet * finalMult);
  };

  const cashOut = () => {
    if (gameState === "playing" && currentStep >= 0) {
      handleWin(multiplier);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Game Area */}
      <div className="relative h-[400px] bg-[#2a2a2a] rounded-3xl border-4 border-[#1a1a1a] overflow-hidden shadow-2xl">
        {/* Road Background */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: TOTAL_STEPS + 1 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-white/10 relative">
               {/* Road stripes */}
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1 h-8 bg-white/20" />
               <div className="absolute top-2/4 left-1/2 -translate-x-1/2 w-1 h-8 bg-white/20" />
               <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-1 h-8 bg-white/20" />
               
               {/* Manholes (Multipliers) */}
               {i > 0 && i <= TOTAL_STEPS && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1a1a1a] border-4 border-[#333] flex items-center justify-center">
                    <span className="text-[10px] font-black text-zinc-500">{Math.pow(difficulty.multiplier, i).toFixed(2)}x</span>
                 </div>
               )}
            </div>
          ))}
        </div>

        {/* Moving Vehicles (Visual Only) */}
        <div className="absolute inset-0 pointer-events-none">
           <motion.div 
             animate={{ y: ["-100%", "500%"] }}
             transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
             className="absolute left-[25%] opacity-40"
           >
              <Truck size={60} className="text-zinc-600 rotate-180" />
           </motion.div>
           <motion.div 
             animate={{ y: ["500%", "-100%"] }}
             transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 1 }}
             className="absolute left-[65%] opacity-40"
           >
              <Car size={40} className="text-zinc-600" />
           </motion.div>
        </div>

        {/* Chicken / Player */}
        <AnimatePresence>
          {gameState !== "betting" && (
            <motion.div 
              initial={{ x: 0 }}
              animate={{ x: `${(currentStep + 1) * (100 / (TOTAL_STEPS + 1))}%` }}
              className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              style={{ width: `${100 / (TOTAL_STEPS + 1)}%` }}
            >
               <div className="relative">
                  <motion.div 
                    animate={gameState === "playing" ? { y: [0, -10, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-4xl"
                  >
                    🐣
                  </motion.div>
                  {gameState === "playing" && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                       {multiplier.toFixed(2)}x
                    </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay States */}
        <AnimatePresence>
          {gameState === "lost" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-950/60 backdrop-blur-md z-50 flex items-center justify-center"
            >
               <div className="text-center p-8 bg-black rounded-3xl border-4 border-red-500 shadow-2xl">
                  <Truck className="w-20 h-20 text-red-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-5xl font-black italic uppercase text-white tracking-tighter">SQUASHED!</h3>
                  <button onClick={() => setGameState("betting")} className="mt-6 px-8 py-3 bg-white text-black font-black uppercase text-sm rounded-xl">Try Again</button>
               </div>
            </motion.div>
          )}
          {gameState === "won" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-950/60 backdrop-blur-md z-50 flex items-center justify-center"
            >
               <div className="text-center p-8 bg-black rounded-3xl border-4 border-[#d4af37] shadow-2xl">
                  <Trophy className="w-20 h-20 text-[#d4af37] mx-auto mb-4 animate-pulse" />
                  <h3 className="text-5xl font-black italic uppercase text-white tracking-tighter">WINNER!</h3>
                  <div className="text-3xl font-black text-[#d4af37] mt-4">+{(bet * multiplier).toFixed(2)}$</div>
                  <button onClick={() => setGameState("betting")} className="mt-6 px-8 py-3 bg-[#d4af37] text-black font-black uppercase text-sm rounded-xl">Play More</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar (Similar to Image 1) */}
      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex gap-4 items-center">
           <div className="space-y-1">
             <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stake</label>
             <div className="flex bg-black rounded-xl p-1 border border-white/5">
                <input 
                  type="number" value={bet} 
                  onChange={(e) => setBet(Number(e.target.value))}
                  disabled={gameState !== "betting"}
                  className="bg-transparent w-24 px-3 text-white font-black focus:outline-none"
                />
                <div className="flex gap-1">
                   {[10, 50, 100].map(v => (
                     <button key={v} onClick={() => setBet(v)} disabled={gameState !== "betting"} className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold hover:bg-zinc-700 transition-colors">{v}</button>
                   ))}
                </div>
             </div>
           </div>

           <div className="space-y-1">
             <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Difficulty</label>
             <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setDifficulty(d)}
                    disabled={gameState !== "betting"}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${difficulty.id === d.id ? "bg-white text-black" : "bg-zinc-800 text-zinc-500 hover:text-white"}`}
                  >
                    {d.name}
                  </button>
                ))}
             </div>
           </div>
        </div>

        <div className="flex gap-4">
           {gameState === "playing" ? (
             <>
               <button 
                 onClick={cashOut}
                 className="px-10 py-4 bg-zinc-800 text-[#d4af37] border-2 border-[#d4af37]/20 font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-700 transition-all flex flex-col items-center leading-none"
               >
                 <span className="text-[10px] mb-1 opacity-60">Cash Out</span>
                 <span>{(bet * multiplier).toFixed(2)}$</span>
               </button>
               <button 
                 onClick={nextStep}
                 className="px-12 py-4 bg-[#22c55e] text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
               >
                 GO
               </button>
             </>
           ) : (
             <button 
               onClick={startGame}
               className="px-16 py-4 bg-[#22c55e] text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/10"
             >
               Start Game
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
