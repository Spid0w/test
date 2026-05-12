"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { ArrowRight, Coins, RotateCcw, Trophy, Zap, Truck, Car } from "lucide-react";

const TOTAL_DISTANCE = 100; // in percentage
const STEP_SIZE = 2; // Advance by 2% each click (millimiters effect)
const DIFFICULTIES = [
  { id: "easy", name: "Facile", risk: 0.02, multiplier: 1.02 },
  { id: "medium", name: "Moyen", risk: 0.05, multiplier: 1.05 },
  { id: "hard", name: "Difficile", risk: 0.08, multiplier: 1.12 },
  { id: "extreme", name: "Extrême", risk: 0.15, multiplier: 1.25 },
];

export function ChickenCrossing() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [progress, setProgress] = useState(0); // 0 to 100
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

    // Risk check
    if (Math.random() < difficulty.risk) {
      setGameState("lost");
      return;
    }

    const next = progress + STEP_SIZE;
    setProgress(next);
    
    // Multiplier increases based on progress
    const newMult = Math.pow(difficulty.multiplier, next / STEP_SIZE);
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Zone de Jeu */}
      <div className="relative h-[450px] bg-[#1a1a1a] rounded-[40px] border-8 border-[#262626] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {/* Route (Lignes horizontales pour les voies) */}
        <div className="absolute inset-0 flex flex-col">
           {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="flex-1 border-b border-white/5 relative">
                {/* Lignes de route réalistes */}
                <div className="absolute top-1/2 inset-x-0 h-1 border-t-2 border-dashed border-white/10" />
                
                {/* Véhicules Réalistes Animés */}
                {i > 0 && i < 5 && (
                  <motion.div 
                    animate={{ x: i % 2 === 0 ? ["-20%", "120%"] : ["120%", "-20%"] }}
                    transition={{ repeat: Infinity, duration: 4 + i, ease: "linear", delay: i * 0.5 }}
                    className="absolute top-1/2 -translate-y-1/2 opacity-80"
                  >
                     {i % 2 === 0 ? (
                       <div className="relative group">
                          <Truck size={70} className="text-zinc-400 drop-shadow-2xl" />
                          <div className="absolute top-2 left-4 w-4 h-2 bg-yellow-500/20 rounded-full blur-sm" />
                       </div>
                     ) : (
                       <div className="relative group">
                          <Car size={50} className="text-blue-900 scale-x-[-1] drop-shadow-2xl" />
                          <div className="absolute top-2 right-4 w-3 h-2 bg-red-500/20 rounded-full blur-sm" />
                       </div>
                     )}
                  </motion.div>
                )}
             </div>
           ))}
        </div>

        {/* Multiplicateurs en fond (Plaques d'égout) */}
        <div className="absolute inset-0 flex items-center justify-around px-12 pointer-events-none opacity-20">
           {[2.0, 5.0, 10.0, 50.0].map(m => (
             <div key={m} className="w-32 h-32 rounded-full border-8 border-black/40 flex flex-col items-center justify-center bg-zinc-900/50">
                <span className="text-2xl font-black">{m}x</span>
                <span className="text-[10px] uppercase font-bold text-zinc-600">Objectif</span>
             </div>
           ))}
        </div>

        {/* Le Poussin (Joueur) */}
        <AnimatePresence>
          {gameState !== "betting" && (
            <motion.div 
              initial={{ x: "5%" }}
              animate={{ x: `${5 + (progress * 0.9)}%` }}
              className="absolute top-1/2 -translate-y-1/2 z-20"
            >
               <div className="relative group">
                  <motion.div 
                    animate={gameState === "playing" ? { y: [0, -5, 0], rotate: [-2, 2, -2] } : {}}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    className="text-6xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  >
                    🐣
                  </motion.div>
                  {gameState === "playing" && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-xs font-black px-3 py-1 rounded-full shadow-2xl border-2 border-black whitespace-nowrap"
                    >
                       {multiplier.toFixed(2)}x
                    </motion.div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Écran d'Information central */}
        {gameState === "betting" && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center opacity-10 scale-150">
                 <h1 className="text-9xl font-black italic">CHICKEN</h1>
                 <h1 className="text-9xl font-black italic">ROAD</h1>
              </div>
           </div>
        )}

        {/* Overlays de fin */}
        <AnimatePresence>
          {gameState === "lost" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-950/80 backdrop-blur-xl z-50 flex items-center justify-center"
            >
               <div className="text-center p-12 bg-black rounded-[40px] border-8 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.5)]">
                  <div className="text-8xl mb-6">💥</div>
                  <h3 className="text-6xl font-black italic uppercase text-white tracking-tighter">ÉCRASÉ !</h3>
                  <p className="text-red-500 font-bold mt-4 uppercase text-sm tracking-[0.3em]">Le poussin n'a pas survécu...</p>
                  <button onClick={() => setGameState("betting")} className="mt-10 px-12 py-4 bg-white text-black font-black uppercase text-lg rounded-2xl hover:scale-105 transition-transform shadow-2xl">RÉESSAYER</button>
               </div>
            </motion.div>
          )}
          {gameState === "won" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-950/80 backdrop-blur-xl z-50 flex items-center justify-center"
            >
               <div className="text-center p-12 bg-black rounded-[40px] border-8 border-[#d4af37] shadow-[0_0_100px_rgba(212,175,55,0.5)]">
                  <Trophy className="w-24 h-24 text-[#d4af37] mx-auto mb-6 animate-pulse" />
                  <h3 className="text-6xl font-black italic uppercase text-white tracking-tighter">VICTOIRE !</h3>
                  <div className="text-5xl font-black text-[#d4af37] mt-6">+{ (bet * multiplier).toFixed(2) } $</div>
                  <button onClick={() => setGameState("betting")} className="mt-10 px-12 py-4 bg-[#d4af37] text-black font-black uppercase text-lg rounded-2xl hover:scale-105 transition-transform shadow-2xl">CONTINUER</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barre de Contrôle (Version Image 1) */}
      <div className="bg-[#161616] p-8 rounded-[35px] border border-white/5 flex flex-wrap items-center justify-between gap-8 shadow-2xl">
        <div className="flex gap-10 items-center">
           <div className="space-y-2">
             <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Mise</label>
             <div className="flex bg-black rounded-2xl p-2 border border-white/5 shadow-inner">
                <input 
                  type="number" value={bet} 
                  onChange={(e) => setBet(Number(e.target.value))}
                  disabled={gameState !== "betting"}
                  className="bg-transparent w-28 px-4 text-white font-black text-xl focus:outline-none"
                />
                <div className="flex gap-2">
                   {[10, 50, 100].map(v => (
                     <button key={v} onClick={() => setBet(v)} disabled={gameState !== "betting"} className="px-3 py-1.5 bg-zinc-900 rounded-xl text-xs font-black hover:bg-[#d4af37] hover:text-black transition-all">{v}</button>
                   ))}
                </div>
             </div>
           </div>

           <div className="space-y-2">
             <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Difficulté</label>
             <div className="flex gap-2 bg-black p-2 rounded-2xl border border-white/5">
                {DIFFICULTIES.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setDifficulty(d)}
                    disabled={gameState !== "betting"}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${difficulty.id === d.id ? "bg-white text-black shadow-xl scale-105" : "text-zinc-600 hover:text-zinc-400"}`}
                  >
                    {d.name}
                  </button>
                ))}
             </div>
           </div>
        </div>

        <div className="flex gap-6">
           {gameState === "playing" ? (
             <>
               <button 
                 onClick={cashOut}
                 className="px-12 py-5 bg-[#1a1a1a] text-[#d4af37] border-2 border-[#d4af37]/40 font-black uppercase tracking-widest rounded-[25px] hover:bg-zinc-800 transition-all flex flex-col items-center leading-none"
               >
                 <span className="text-[10px] mb-1 opacity-50">Encaisser</span>
                 <span className="text-xl">{(bet * multiplier).toFixed(2)}$</span>
               </button>
               <button 
                 onClick={nextStep}
                 className="px-16 py-5 bg-[#22c55e] text-white font-black uppercase tracking-[0.2em] rounded-[25px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] border-b-4 border-green-800"
               >
                 AVANCER
               </button>
             </>
           ) : (
             <button 
               onClick={startGame}
               className="px-20 py-6 bg-[#22c55e] text-white font-black uppercase tracking-[0.3em] rounded-[25px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(34,197,94,0.2)] border-b-8 border-green-800"
             >
               JOUER
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
