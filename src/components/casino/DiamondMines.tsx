"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Bomb, Coins, Diamond, Play, RotateCcw, Settings, Zap, History, LayoutGrid, Info, Trash2 } from "lucide-react";

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

  const clearSelection = () => {
    if (gameState === "betting" && !isAuto) {
      setSelectedTiles([]);
    }
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
    setResults([]);
    setCurrentWin(null);

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

    // Reveal sequence
    for (let i = 0; i < roundResults.length; i++) {
       setResults(prev => [...prev, roundResults[i]]);
       await new Promise(r => setTimeout(r, 100));
       if (roundResults[i].type === "bomb") break; 
    }

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
    <div className="flex flex-col lg:flex-row gap-10 max-w-[1300px] mx-auto h-[800px] bg-[#0c0e17] rounded-[45px] border-8 border-white/5 overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.6)]">
      {/* Barre Latérale Gauche */}
      <div className="w-[380px] bg-[#141824] border-r border-white/5 p-8 flex flex-col gap-10 shadow-2xl z-10">
         <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="bg-blue-500/20 p-3 rounded-2xl shadow-inner"><LayoutGrid className="w-6 h-6 text-blue-500" /></div>
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">MINES</h2>
         </div>

         <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-3">
               <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">Montant de la mise</label>
               <div className="bg-black/40 border-2 border-white/5 rounded-[20px] p-4 flex items-center justify-between shadow-inner focus-within:border-blue-500/50 transition-all">
                  <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent font-black text-2xl text-white outline-none w-full" />
                  <Coins size={20} className="text-yellow-500" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setBet(b => Math.max(1, b/2))} className="bg-zinc-800/50 py-2.5 rounded-xl text-[10px] font-black hover:bg-zinc-700 transition-all uppercase tracking-widest">1/2</button>
                  <button onClick={() => setBet(b => b*2)} className="bg-zinc-800/50 py-2.5 rounded-xl text-[10px] font-black hover:bg-zinc-700 transition-all uppercase tracking-widest">2x</button>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">Nombre de mines</label>
                  <span className="bg-blue-500 text-black px-3 py-1 rounded-full text-xs font-black">{bombsCount}</span>
               </div>
               <input 
                 type="range" min="1" max="24" step="1" 
                 value={bombsCount} onChange={(e) => setBombsCount(Number(e.target.value))}
                 className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
               <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 24].map(v => (
                    <button key={v} onClick={() => setBombsCount(v)} className={`bg-zinc-800/50 py-2 rounded-xl text-[10px] font-black transition-all ${bombsCount === v ? "text-blue-400 border border-blue-500/30 bg-blue-500/5 shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}>{v}</button>
                  ))}
               </div>
            </div>

            {isAuto && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-6 pt-6 border-t border-white/5">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">Vitesse Auto</label>
                     <div className="grid grid-cols-2 gap-3 p-1 bg-black/40 rounded-2xl border border-white/5">
                        <button onClick={() => setAutoSpeed(1000)} className={`py-2.5 rounded-xl text-[10px] font-black transition-all uppercase ${autoSpeed === 1000 ? "bg-white text-black shadow-xl" : "text-zinc-600"}`}>Normal</button>
                        <button onClick={() => setAutoSpeed(200)} className={`py-2.5 rounded-xl text-[10px] font-black transition-all uppercase ${autoSpeed === 200 ? "bg-white text-black shadow-xl" : "text-zinc-600"}`}>Turbo</button>
                     </div>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pause si victoire</label>
                     <button onClick={() => setSlowOnWin(!slowOnWin)} className={`w-12 h-6 rounded-full transition-all relative ${slowOnWin ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-zinc-800"}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${slowOnWin ? "right-1" : "left-1"}`} />
                     </button>
                  </div>
               </motion.div>
            )}
         </div>

         <div className="space-y-4 pt-6 border-t border-white/5">
            <button onClick={clearSelection} disabled={gameState !== "betting" || isAuto || selectedTiles.length === 0} className="w-full py-4 bg-red-950/20 text-red-500 border border-red-500/10 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-red-950/40 transition-all flex items-center justify-center gap-3">
               <Trash2 size={14} /> Supprimer mise
            </button>
            {!isAuto ? (
               <>
                  <button 
                    onClick={playRound} 
                    disabled={selectedTiles.length === 0 || gameState !== "betting"}
                    className="w-full py-6 bg-blue-600 text-white font-black uppercase tracking-[0.4em] text-xl rounded-[25px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(37,99,235,0.3)] border-b-8 border-blue-800 disabled:opacity-30 disabled:grayscale disabled:scale-100"
                  >
                    PARIER
                  </button>
                  <button onClick={startAuto} className="w-full py-4 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 border border-white/5"><Play size={14} className="fill-current text-blue-500" /> MODE AUTOMATIQUE</button>
               </>
            ) : (
               <button onClick={stopAuto} className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.4em] text-xl rounded-[25px] animate-pulse shadow-[0_0_60px_rgba(220,38,38,0.3)] border-b-8 border-red-800">ARRÊTER AUTO</button>
            )}
         </div>
      </div>

      {/* Zone de Grille */}
      <div className="flex-1 p-16 flex flex-col items-center justify-center relative overflow-hidden">
         {/* Décoration en fond */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)] pointer-events-none opacity-20" />
         <div className="absolute top-10 flex gap-4 pointer-events-none opacity-40">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-3 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center min-w-[100px] backdrop-blur-md">
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Mines {bombsCount}</span>
                 <span className="text-sm font-black text-blue-400">{calculateMultiplier(i, bombsCount).toFixed(2)}x</span>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-5 gap-5 aspect-square w-full max-w-[600px] relative z-10">
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
               const isSelected = selectedTiles.includes(i);
               const result = results.find(r => r.index === i);
               
               return (
                  <motion.div
                    key={i}
                    whileHover={gameState === "betting" && !isAuto ? { scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)" } : {}}
                    whileTap={gameState === "betting" && !isAuto ? { scale: 0.95 } : {}}
                    onClick={() => toggleTile(i)}
                    className={`relative rounded-[22px] flex items-center justify-center cursor-pointer transition-all border-4
                      ${isSelected ? "border-blue-500/40 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.1)]" : "border-white/5 bg-[#1a1e2e] shadow-inner"}
                      ${result?.type === "bomb" ? "bg-red-950 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)] z-20" : ""}
                      ${result?.type === "diamond" ? "bg-blue-950 border-blue-600 shadow-[0_0_50px_rgba(59,130,246,0.5)] z-20" : ""}
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {result ? (
                        <motion.div key="result" initial={{ scale: 0, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                          {result.type === "bomb" ? (
                            <Bomb className="w-16 h-16 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]" />
                          ) : (
                            <Diamond className="w-16 h-16 text-blue-400 drop-shadow-[0_0_25px_rgba(96,165,250,0.8)]" />
                          )}
                        </motion.div>
                      ) : isSelected && (
                        <motion.div key="selected" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] border-2 border-white/20" />
                      )}
                    </AnimatePresence>
                  </motion.div>
               );
            })}
         </div>

         {/* Panneau de Résultats & Stats */}
         <div className="mt-16 w-full max-w-[600px] flex justify-between items-center bg-black/40 p-8 rounded-[30px] border border-white/5 backdrop-blur-md">
            <div className="space-y-1">
               <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Multiplicateur</div>
               <div className="text-5xl font-black italic text-white tracking-tighter">{calculateMultiplier(selectedTiles.length, bombsCount).toFixed(2)}<span className="text-xl opacity-40 ml-1">x</span></div>
            </div>
            
            <AnimatePresence>
               {currentWin && (
                  <motion.div initial={{ y: 30, opacity: 0, scale: 0.5 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -30, opacity: 0 }} className="absolute left-1/2 -translate-x-1/2 bg-blue-500 px-10 py-4 rounded-2xl text-black font-black text-3xl italic shadow-[0_0_80px_rgba(59,130,246,0.6)] border-b-4 border-blue-800">
                     +{currentWin.toFixed(2)} $
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="text-right space-y-1">
               <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Gain Potentiel</div>
               <div className="text-5xl font-black italic text-blue-500 tracking-tighter">{(bet * calculateMultiplier(selectedTiles.length, bombsCount)).toFixed(2)}<span className="text-xl opacity-40 ml-1">$</span></div>
            </div>
         </div>
      </div>
    </div>
  );
}
