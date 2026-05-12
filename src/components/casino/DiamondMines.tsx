"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Bomb, Coins, Diamond, Play, RotateCcw, Settings, Zap } from "lucide-react";

const GRID_SIZE = 25;

export function DiamondMines() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [bombsCount, setBombsCount] = useState(3);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [gameState, setGameState] = useState<"betting" | "revealing" | "result">("betting");
  const [results, setResults] = useState<{ index: number; type: "diamond" | "bomb" }[]>([]);
  const [isAuto, setIsAuto] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(1000);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTile = (index: number) => {
    if (gameState !== "betting" || isAuto) return;
    setSelectedTiles(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const calculateMultiplier = (revealedCount: number) => {
    let n = GRID_SIZE;
    let m = bombsCount;
    let r = revealedCount;
    let mult = 1;
    for (let i = 0; i < r; i++) {
      mult *= (n - i) / (n - m - i);
    }
    return Math.max(1, mult * 0.95); // 5% house edge
  };

  const playRound = useCallback(() => {
    if (selectedTiles.length === 0) return;
    if (balance === null || balance < bet) {
      setIsAuto(false);
      return;
    }

    updateBalance(-bet);
    setGameState("revealing");

    // Generate bomb positions
    const bombPositions: number[] = [];
    while (bombPositions.length < bombsCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!bombPositions.includes(pos)) bombPositions.push(pos);
    }

    const roundResults: { index: number; type: "diamond" | "bomb" }[] = [];
    let hitBomb = false;

    selectedTiles.forEach(idx => {
      if (bombPositions.includes(idx)) {
        roundResults.push({ index: idx, type: "bomb" });
        hitBomb = true;
      } else {
        roundResults.push({ index: idx, type: "diamond" });
      }
    });

    setResults(roundResults);

    setTimeout(() => {
      setGameState("result");
      if (!hitBomb) {
        const mult = calculateMultiplier(selectedTiles.length);
        updateBalance(bet * mult);
      }
      
      if (isAuto) {
        autoTimerRef.current = setTimeout(playRound, autoSpeed);
      }
    }, 800);
  }, [selectedTiles, balance, bet, bombsCount, isAuto, autoSpeed, updateBalance]);

  const startAuto = () => {
    if (selectedTiles.length === 0) return;
    setIsAuto(true);
  };

  const stopAuto = () => {
    setIsAuto(false);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  };

  useEffect(() => {
    if (isAuto && gameState === "betting") {
      playRound();
    }
  }, [isAuto, gameState, playRound]);

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto p-10 bg-zinc-900/50 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl relative">
      {/* Auto Settings Floating Panel */}
      <div className="absolute top-6 right-10 flex gap-4">
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
           <Settings className="w-4 h-4 text-zinc-500" />
           <select 
             value={autoSpeed} 
             onChange={(e) => setAutoSpeed(Number(e.target.value))}
             className="bg-transparent text-[10px] font-black text-zinc-400 focus:outline-none"
           >
             <option value={2000}>Slow</option>
             <option value={1000}>Normal</option>
             <option value={500}>Fast</option>
             <option value={200}>Turbo</option>
           </select>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-72 flex flex-col gap-8">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Stake</label>
          <div className="relative">
            <input 
              type="number" 
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={isAuto || gameState !== "betting"}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-[#d4af37]"
            />
            <Coins className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Bomb Count</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map(count => (
              <button
                key={count}
                onClick={() => setBombsCount(count)}
                disabled={isAuto || gameState !== "betting"}
                className={`py-3 rounded-xl text-xs font-black transition-all ${bombsCount === count ? "bg-[#d4af37] text-black" : "bg-zinc-800 text-zinc-400"}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          {!isAuto ? (
            <>
              <button 
                onClick={playRound}
                disabled={selectedTiles.length === 0 || gameState !== "betting"}
                className="w-full py-6 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                Launch Round
              </button>
              <button 
                onClick={startAuto}
                disabled={selectedTiles.length === 0}
                className="w-full py-4 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Auto Mode
              </button>
            </>
          ) : (
            <button 
              onClick={stopAuto}
              className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            >
              Stop Farming
            </button>
          )}

          {gameState === "result" && !isAuto && (
            <button 
              onClick={() => { setGameState("betting"); setResults([]); }}
              className="w-full py-4 bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest rounded-2xl"
            >
              Clear Board
            </button>
          )}
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-3 aspect-square max-w-[500px] mx-auto">
          {Array.from({ length: GRID_SIZE }).map((_, i) => {
            const isSelected = selectedTiles.includes(i);
            const result = results.find(r => r.index === i);
            
            return (
              <motion.div
                key={i}
                whileHover={gameState === "betting" && !isAuto ? { scale: 1.05 } : {}}
                whileTap={gameState === "betting" && !isAuto ? { scale: 0.95 } : {}}
                onClick={() => toggleTile(i)}
                className={`relative rounded-2xl flex items-center justify-center cursor-pointer transition-all border-2
                  ${isSelected ? "border-[#d4af37] bg-[#d4af37]/10" : "border-white/5 bg-zinc-800"}
                  ${result?.type === "bomb" ? "bg-red-950 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : ""}
                  ${result?.type === "diamond" ? "bg-green-950 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : ""}
                `}
              >
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      {result.type === "bomb" ? (
                        <Bomb className="w-10 h-10 text-red-500" />
                      ) : (
                        <Diamond className="w-10 h-10 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      )}
                    </motion.div>
                  ) : isSelected && (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-3 h-3 bg-[#d4af37] rounded-full"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Multiplier / Potential Win */}
        <div className="mt-12 flex items-center justify-between px-4">
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Potential Multiplier</span>
             <span className="text-3xl font-black text-white italic">
               {selectedTiles.length > 0 ? calculateMultiplier(selectedTiles.length).toFixed(2) : "1.00"}x
             </span>
           </div>
           
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Potential Win</span>
             <span className="text-3xl font-black text-[#d4af37] italic">
               {selectedTiles.length > 0 ? (bet * calculateMultiplier(selectedTiles.length)).toFixed(2) : "0.00"}$
             </span>
           </div>
        </div>
      </div>
    </div>
  );
}
