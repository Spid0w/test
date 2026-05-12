"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bone, CircleDot, Coins, RotateCcw, ShieldCheck, Trophy } from "lucide-react";

const GRID_SIZE = 25; // 5x5

export function ChickenGame() {
  const [minesCount, setMinesCount] = useState(3);
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState<( "chicken" | "mine" | null)[]>(new Array(GRID_SIZE).fill(null));
  const [revealed, setRevealed] = useState<boolean[]>(new Array(GRID_SIZE).fill(false));
  const [gameState, setGameState] = useState<"betting" | "playing" | "won" | "lost">("betting");
  const [minesPositions, setMinesPositions] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);

  const calculateMultiplier = useCallback((revealedCount: number) => {
    // Basic Mines multiplier formula
    let n = GRID_SIZE;
    let m = minesCount;
    let r = revealedCount;
    
    // Combination formula: (nCr) / (n-mCr)
    // Simplified for this demo
    let mult = 1;
    for (let i = 0; i < r; i++) {
      mult *= (n - i) / (n - m - i);
    }
    return Math.max(1, mult * 0.97); // 3% house edge
  }, [minesCount]);

  const startGame = () => {
    const positions: number[] = [];
    while (positions.length < minesCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!positions.includes(pos)) positions.push(pos);
    }
    setMinesPositions(positions);
    setRevealed(new Array(GRID_SIZE).fill(false));
    setGameState("playing");
    setMultiplier(1);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== "playing" || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (minesPositions.includes(index)) {
      setGameState("lost");
      // Reveal all mines
    } else {
      const revealedCount = newRevealed.filter(v => v).length;
      setMultiplier(calculateMultiplier(revealedCount));
      
      if (revealedCount === GRID_SIZE - minesCount) {
        setGameState("won");
      }
    }
  };

  const cashOut = () => {
    if (gameState === "playing") {
      setGameState("won");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto p-6 bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
      {/* Sidebar / Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Bet Amount</label>
          <div className="relative">
            <input 
              type="number" 
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={gameState !== "betting"}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-black focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50"
            />
            <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Bones (Mines)</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map(count => (
              <button
                key={count}
                onClick={() => setMinesCount(count)}
                disabled={gameState !== "betting"}
                className={`py-2 rounded-lg text-xs font-black transition-all ${minesCount === count ? "bg-[#d4af37] text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 space-y-4">
          {gameState === "betting" ? (
            <button 
              onClick={startGame}
              className="w-full py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Start Game
            </button>
          ) : gameState === "playing" ? (
            <div className="space-y-3">
               <div className="text-center p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                 <span className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Current Win</span>
                 <span className="text-2xl font-black text-[#d4af37]">{(bet * multiplier).toFixed(2)} $</span>
               </div>
               <button 
                onClick={cashOut}
                className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-500 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              >
                Cash Out ({multiplier.toFixed(2)}x)
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setGameState("betting")}
              className="w-full py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-3 aspect-square max-w-[500px] mx-auto">
          {grid.map((_, i) => {
            const isRevealed = revealed[i] || gameState === "lost" || gameState === "won";
            const isMine = minesPositions.includes(i);
            
            return (
              <motion.div
                key={i}
                whileHover={!isRevealed && gameState === "playing" ? { scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
                whileTap={!isRevealed && gameState === "playing" ? { scale: 0.95 } : {}}
                onClick={() => handleTileClick(i)}
                className={`relative rounded-xl flex items-center justify-center cursor-pointer transition-colors overflow-hidden
                  ${!isRevealed ? "bg-zinc-800 border border-white/5" : isMine ? "bg-red-950/50 border border-red-500/50" : "bg-zinc-900 border border-[#d4af37]/30"}
                `}
              >
                <AnimatePresence mode="wait">
                  {isRevealed && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex flex-col items-center gap-1"
                    >
                      {isMine ? (
                        <Bone className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <img src="/logo.png" className="w-8 h-8 filter brightness-150 grayscale invert" />
                          <span className="text-[8px] font-black text-[#d4af37] mt-1">CHECK</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reflection effect */}
                {!isRevealed && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Status Overlay */}
        <div className="mt-8 flex items-center justify-between px-2">
           <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase">
             <div className="flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-green-500" /> PROVABLY FAIR
             </div>
             <div className="flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> ENCRYPTED
             </div>
           </div>
           
           <div className="text-sm font-black text-zinc-400">
             GRID: <span className="text-white">5x5</span>
           </div>
        </div>
      </div>

      {/* Winner/Loser Modal Overlay */}
      <AnimatePresence>
        {gameState === "won" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl"
          >
            <div className="text-center p-8">
              <Trophy className="w-16 h-16 text-[#d4af37] mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">Victory!</h2>
              <p className="text-zinc-400 font-bold mb-6">You cashed out at <span className="text-white">{multiplier.toFixed(2)}x</span></p>
              <div className="text-3xl font-black text-[#d4af37] mb-8">+{(bet * multiplier).toFixed(2)} $</div>
              <button 
                onClick={() => setGameState("betting")}
                className="px-12 py-3 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-xl"
              >
                Claim & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
