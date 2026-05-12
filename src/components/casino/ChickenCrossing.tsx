"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Info, Wallet, X, Minus, Plus, Settings2, HelpCircle } from "lucide-react";

const TOTAL_DISTANCE = 1000; // Large range for small steps
const STEP_SIZE = 10;
const DIFFICULTIES = [
  { id: "easy", name: "Facile", risk: 0.03, multiplier: 1.05 },
  { id: "medium", name: "Moyen", risk: 0.08, multiplier: 1.15 },
  { id: "hard", name: "Difficile", risk: 0.15, multiplier: 1.4 },
  { id: "extreme", name: "Extrême", risk: 0.3, multiplier: 2.2 },
];

export function ChickenCrossing() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState<"betting" | "playing" | "won" | "lost">("betting");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  const [multiplier, setMultiplier] = useState(1);

  const startGame = () => {
    if (balance === null || balance < bet) return;
    updateBalance(-bet);
    setProgress(0);
    setGameState("playing");
    setMultiplier(1.0);
  };

  const nextStep = () => {
    if (gameState !== "playing") return;

    if (Math.random() < difficulty.risk) {
      setGameState("lost");
      return;
    }

    const next = progress + STEP_SIZE;
    setProgress(next);
    const newMult = Math.pow(difficulty.multiplier, next / 100);
    setMultiplier(newMult);

    if (next >= TOTAL_DISTANCE) {
      handleWin(newMult);
    }
  };

  const handleWin = (finalMult: number) => {
    setGameState("won");
    updateBalance(bet * finalMult);
  };

  const cashOut = () => {
    if (gameState === "playing" && progress > 0) {
      handleWin(multiplier);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto bg-[#1a1b23] rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {/* Top Header Bar (Match Screen 1) */}
      <div className="h-14 bg-[#14151c] flex items-center justify-between px-4 border-b border-white/5">
         <div className="flex items-center gap-2">
            <span className="text-white font-black italic text-lg tracking-tighter">CHICKEN <span className="text-red-600">ROAD</span></span>
         </div>
         <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-zinc-400 text-xs font-bold bg-[#1f2029] px-3 py-1.5 rounded hover:text-white">
               <HelpCircle size={14} /> Comment jouer ?
            </button>
            <div className="flex items-center gap-3 bg-[#1f2029] pl-3 pr-1 py-1 rounded-lg">
               <span className="text-white font-black text-sm">{balance?.toFixed(2)}</span>
               <div className="w-6 h-6 bg-[#d4af37] rounded flex items-center justify-center text-black font-black text-[10px]">C</div>
            </div>
            <div className="flex gap-1">
               <div className="w-2 h-2 rounded-full bg-zinc-700" />
               <div className="w-2 h-2 rounded-full bg-zinc-700" />
            </div>
         </div>
      </div>

      {/* Stats area */}
      <div className="bg-[#14151c]/50 px-4 py-2 flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">
         <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live wins</div>
         <div>Online: 10,238</div>
      </div>

      {/* Main Game Scene */}
      <div className="relative h-[450px] bg-[#2a2b36] overflow-hidden">
        {/* Road Stripes */}
        <div className="absolute inset-0 flex">
           {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="flex-1 border-r border-dashed border-white/10 relative">
                {/* Milestone Manholes */}
                {(i > 0 && i % 2 === 0) && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#14151c] border-4 border-[#252631] shadow-inner flex items-center justify-center">
                      <span className="text-zinc-500 font-black text-sm">{(1.2 * i).toFixed(2)}x</span>
                   </div>
                )}
             </div>
           ))}
        </div>

        {/* Barriers (Match Screen 1) */}
        <div className="absolute left-[5%] top-[20%] flex gap-4">
           <div className="w-16 h-8 bg-[#d4af37] border-y-4 border-black flex flex-col justify-between">
              <div className="h-1 bg-black opacity-20" /><div className="h-1 bg-black opacity-20" />
           </div>
           <div className="w-16 h-8 bg-[#d4af37] border-y-4 border-black flex flex-col justify-between">
              <div className="h-1 bg-black opacity-20" /><div className="h-1 bg-black opacity-20" />
           </div>
        </div>

        {/* Moving Vehicles (Match Screen 1 style) */}
        <div className="absolute inset-0 pointer-events-none">
           {/* Yellow Truck */}
           <motion.div 
             animate={{ y: ["-100%", "500%"] }}
             transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
             className="absolute left-[50%] z-10"
           >
              <div className="w-16 h-32 bg-[#d4af37] rounded-lg border-2 border-black flex flex-col">
                 <div className="h-10 bg-[#14151c] rounded-t-lg border-b-2 border-black flex items-center justify-center">
                    <span className="text-[10px] text-white font-black italic">OUT</span>
                 </div>
                 <div className="flex-1 border-x-4 border-black/10" />
              </div>
           </motion.div>

           {/* White Car */}
           <motion.div 
             animate={{ y: ["500%", "-100%"] }}
             transition={{ repeat: Infinity, duration: 4, ease: "linear", delay: 2 }}
             className="absolute left-[25%] z-10"
           >
              <div className="w-14 h-24 bg-white rounded-xl border-2 border-black flex flex-col overflow-hidden">
                 <div className="h-6 bg-zinc-800 m-1 rounded" />
                 <div className="h-2 bg-green-500 mt-auto" />
              </div>
           </motion.div>
        </div>

        {/* Chicken & Multiplier Bubble */}
        <AnimatePresence>
          {gameState !== "betting" && (
            <motion.div 
              initial={{ x: "2%" }}
              animate={{ x: `${2 + (progress / TOTAL_DISTANCE) * 90}%` }}
              className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            >
               <div className="relative">
                  <motion.div animate={gameState === "playing" ? { y: [0, -5, 0] } : {}} transition={{ repeat: Infinity, duration: 0.3 }} className="text-6xl filter drop-shadow-lg">
                    🐣
                  </motion.div>
                  {gameState === "playing" && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#2d3a5a] text-white text-[11px] font-black px-3 py-1 rounded shadow-xl border border-blue-400/30 whitespace-nowrap"
                    >
                       {multiplier.toFixed(2)}x
                    </motion.div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays */}
        <AnimatePresence>
          {gameState === "lost" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/40 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="bg-black/90 p-10 rounded-3xl border-4 border-red-600 shadow-2xl text-center">
                  <span className="text-8xl mb-4 block">💥</span>
                  <h3 className="text-4xl font-black text-white italic uppercase">ÉCRASÉ !</h3>
                  <button onClick={() => setGameState("betting")} className="mt-8 px-10 py-4 bg-white text-black font-black rounded-xl">RETOURNER AU DÉBUT</button>
               </div>
            </motion.div>
          )}
          {gameState === "won" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-950/40 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="bg-black/90 p-10 rounded-3xl border-4 border-[#d4af37] shadow-2xl text-center">
                  <span className="text-8xl mb-4 block">🏆</span>
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">VICTOIRE !</h3>
                  <div className="text-3xl font-black text-[#d4af37] mt-4">+{(bet * multiplier).toFixed(2)} $</div>
                  <button onClick={() => setGameState("betting")} className="mt-8 px-10 py-4 bg-[#d4af37] text-black font-black rounded-xl uppercase">CONTINUER</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar (Match Screen 1) */}
      <div className="bg-[#14151c] p-6 flex flex-wrap items-center gap-8">
        <div className="flex-1 flex gap-8 items-center">
           {/* Bet selector */}
           <div className="space-y-2">
             <div className="flex bg-[#1f2029] rounded-lg p-1 border border-white/5">
                {[0.1, 1, 10, 100].map(v => (
                  <button key={v} onClick={() => setBet(v)} disabled={gameState !== "betting"} className={`px-4 py-1 rounded text-[10px] font-black transition-all ${bet === v ? "bg-[#333544] text-white" : "text-zinc-500"}`}>{v}</button>
                ))}
             </div>
           </div>

           {/* Difficulty */}
           <div className="flex-1">
             <div className="flex bg-[#1f2029] rounded-lg p-1 border border-white/5 gap-1">
                {DIFFICULTIES.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setDifficulty(d)}
                    disabled={gameState !== "betting"}
                    className={`flex-1 py-2 rounded text-[10px] font-black uppercase transition-all ${difficulty.id === d.id ? "bg-[#333544] text-white" : "text-zinc-500 hover:text-zinc-400"}`}
                  >
                    {d.name}
                  </button>
                ))}
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
           <button 
             onClick={cashOut}
             disabled={gameState !== "playing" || progress === 0}
             className="px-12 py-4 bg-[#d4af37] text-black font-black uppercase rounded-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center leading-none disabled:opacity-30"
           >
              <span className="text-[10px] mb-1 opacity-60">CASH OUT</span>
              <span className="text-lg">{(bet * multiplier).toFixed(2)} USD</span>
           </button>
           <button 
             onClick={gameState === "playing" ? nextStep : startGame}
             className="px-16 py-4 bg-[#22c55e] text-white font-black uppercase rounded-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/10"
           >
              {gameState === "playing" ? "GO" : "JOUER"}
           </button>
        </div>
      </div>
    </div>
  );
}
