"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Bomb, Coins, Diamond, Play, RotateCcw, Settings, Zap, History, LayoutGrid, Info } from "lucide-react";

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
  const [slowOnWin, setSlowOnWin] = useState(true);
  const [currentWin, setCurrentWin] = useState<number | null>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTile = (index: number) => {
    if (gameState !== "betting" || isAuto) return;
    setSelectedTiles(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const calculateMultiplier = (revealedCount: number, bombs: number) => {
    let n = GRID_SIZE;
    let m = bombs;
    let r = revealedCount;
    if (r === 0) return 1;
    let mult = 1;
    for (let i = 0; i < r; i++) {
      mult *= (n - i) / (n - m - i);
    }
    return Math.max(1, mult * 0.97); // 3% house edge
  };

  const playRound = useCallback(async () => {
    if (selectedTiles.length === 0) return;
    if (balance === null || balance < bet) {
      setIsAuto(false);
      return;
    }

    updateBalance(-bet);
    setGameState("revealing");
    setCurrentWin(null);

    // Generate bomb positions for the whole grid
    const bombPositions: number[] = [];
    while (bombPositions.length < bombsCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!bombPositions.includes(pos)) bombPositions.push(pos);
    }

    // Determine results for selected tiles
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

    // Animate reveal one by one
    for (let i = 0; i < roundResults.length; i++) {
       setResults(prev => [...prev, roundResults[i]]);
       await new Promise(r => setTimeout(r, 100)); // Quick sequence
       if (roundResults[i].type === "bomb") break; 
    }

    // Show result
    setTimeout(() => {
      setGameState("result");
      let winAmount = 0;
      if (!hitBomb) {
        const mult = calculateMultiplier(selectedTiles.length, bombsCount);
        winAmount = bet * mult;
        updateBalance(winAmount);
        setCurrentWin(winAmount);
      }
      
      if (isAuto) {
        const delay = (winAmount > 0 && slowOnWin) ? autoSpeed * 2 : autoSpeed;
        autoTimerRef.current = setTimeout(() => {
           setResults([]);
           setGameState("betting");
           playRound();
        }, delay);
      }
    }, 500);
  }, [selectedTiles, balance, bet, bombsCount, isAuto, autoSpeed, slowOnWin, updateBalance]);

  const startAuto = () => {
    if (selectedTiles.length === 0) return;
    setIsAuto(true);
    playRound();
  };

  const stopAuto = () => {
    setIsAuto(false);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto h-[800px] bg-[#0f111a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Sidebar Controls */}
      <div className="w-80 bg-[#161925] border-r border-white/5 p-6 flex flex-col gap-8">
         <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-green-500/20 p-2 rounded-lg"><LayoutGrid className="w-5 h-5 text-green-500" /></div>
            <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">MINES</h2>
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Montant de la mise</label>
               <div className="bg-black border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent font-black text-white outline-none w-full" />
                  <Coins size={14} className="text-yellow-500" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setBet(b => Math.max(1, b/2))} className="bg-zinc-800 py-1.5 rounded-lg text-[10px] font-bold hover:bg-zinc-700">1/2</button>
                  <button onClick={() => setBet(b => b*2)} className="bg-zinc-800 py-1.5 rounded-lg text-[10px] font-bold hover:bg-zinc-700">2x</button>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">
                  Nombre de mines
                  <span className="text-white">{bombsCount}</span>
               </label>
               <input 
                 type="range" min="1" max="24" step="1" 
                 value={bombsCount} onChange={(e) => setBombsCount(Number(e.target.value))}
                 className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
               />
               <div className="grid grid-cols-4 gap-1">
                  {[1, 3, 5, 24].map(v => (
                    <button key={v} onClick={() => setBombsCount(v)} className={`bg-zinc-800 py-1 rounded text-[10px] font-bold ${bombsCount === v ? "text-green-500 border border-green-500/30" : "text-zinc-500"}`}>{v}</button>
                  ))}
               </div>
            </div>

            {isAuto && (
               <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Auto Speed</label>
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setAutoSpeed(1000)} className={`py-1.5 rounded-lg text-[10px] font-bold ${autoSpeed === 1000 ? "bg-green-600 text-white" : "bg-zinc-800"}`}>Normal</button>
                        <button onClick={() => setAutoSpeed(200)} className={`py-1.5 rounded-lg text-[10px] font-bold ${autoSpeed === 200 ? "bg-green-600 text-white" : "bg-zinc-800"}`}>Turbo</button>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Slow on win</label>
                     <button onClick={() => setSlowOnWin(!slowOnWin)} className={`w-10 h-5 rounded-full transition-all relative ${slowOnWin ? "bg-green-600" : "bg-zinc-800"}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${slowOnWin ? "right-1" : "left-1"}`} />
                     </button>
                  </div>
               </div>
            )}
         </div>

         <div className="mt-auto space-y-4">
            {!isAuto ? (
               <>
                  <button 
                    onClick={playRound} 
                    disabled={selectedTiles.length === 0 || gameState !== "betting"}
                    className="w-full py-5 bg-green-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-40"
                  >
                    PARIER
                  </button>
                  <button onClick={startAuto} className="w-full py-3 bg-zinc-800 text-white font-black uppercase text-xs rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"><Play size={14} className="fill-current" /> MODE AUTO</button>
               </>
            ) : (
               <button onClick={stopAuto} className="w-full py-5 bg-red-600 text-white font-black uppercase rounded-2xl animate-pulse shadow-lg shadow-red-500/20">ARRÊTER AUTO</button>
            )}
         </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
         <div className="absolute top-12 flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg flex flex-col items-center min-w-[80px]">
                 <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Mines {bombsCount}</span>
                 <span className="text-xs font-black text-green-500">{calculateMultiplier(i, bombsCount).toFixed(2)}x</span>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-5 gap-4 aspect-square w-full max-w-[550px]">
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
               const isSelected = selectedTiles.includes(i);
               const result = results.find(r => r.index === i);
               
               return (
                  <motion.div
                    key={i}
                    whileHover={gameState === "betting" && !isAuto ? { scale: 1.05 } : {}}
                    whileTap={gameState === "betting" && !isAuto ? { scale: 0.95 } : {}}
                    onClick={() => toggleTile(i)}
                    className={`relative rounded-xl flex items-center justify-center cursor-pointer transition-all border-2
                      ${isSelected ? "border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "border-white/5 bg-[#1c1e2b]"}
                      ${result?.type === "bomb" ? "bg-red-950 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]" : ""}
                      ${result?.type === "diamond" ? "bg-green-950 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]" : ""}
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {result ? (
                        <motion.div key="result" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
                          {result.type === "bomb" ? (
                            <Bomb className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                          ) : (
                            <Diamond className="w-12 h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                          )}
                        </motion.div>
                      ) : isSelected && (
                        <motion.div key="selected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      )}
                    </AnimatePresence>
                  </motion.div>
               );
            })}
         </div>

         {/* Stats Panel */}
         <div className="mt-12 w-full max-w-[550px] flex justify-between items-end">
            <div className="space-y-1">
               <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Multiplicateur Actuel</div>
               <div className="text-4xl font-black italic text-white">{calculateMultiplier(selectedTiles.length, bombsCount).toFixed(2)}x</div>
            </div>
            {currentWin && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-green-500 px-6 py-2 rounded-xl text-black font-black text-xl italic shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                  +{currentWin.toFixed(2)} $
               </motion.div>
            )}
            <div className="text-right space-y-1">
               <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Gain Potentiel</div>
               <div className="text-4xl font-black italic text-green-500">{(bet * calculateMultiplier(selectedTiles.length, bombsCount)).toFixed(2)} $</div>
            </div>
         </div>
      </div>
    </div>
  );
}
