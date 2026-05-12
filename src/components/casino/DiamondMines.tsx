"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Bomb, Coins, Diamond, Play, RotateCcw, Settings, Zap, History, LayoutGrid, Info, Trash2, HelpCircle, Volume2, Search, Home, ChevronRight, Menu, Plus, Minus } from "lucide-react";

const GRID_SIZE = 25;

export function DiamondMines() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [bombsCount, setBombsCount] = useState(1);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [gameState, setGameState] = useState<"betting" | "revealing" | "result">("betting");
  const [results, setResults] = useState<{ index: number; type: "diamond" | "bomb" }[]>([]);
  const [currentWin, setCurrentWin] = useState<number | null>(null);

  const toggleTile = (index: number) => {
    if (gameState !== "betting") return;
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
    return Math.max(1, mult * 0.97);
  };

  const playRound = async () => {
    if (selectedTiles.length === 0) return;
    if (balance === null || balance < bet) return;

    updateBalance(-bet);
    setGameState("revealing");
    setResults([]);
    setCurrentWin(null);

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

    for (let i = 0; i < roundResults.length; i++) {
       setResults(prev => [...prev, roundResults[i]]);
       await new Promise(r => setTimeout(r, 150));
       if (roundResults[i].type === "bomb") break; 
    }

    setTimeout(() => {
      setGameState("result");
      if (!hitBomb) {
        const mult = calculateMultiplier(selectedTiles.length, bombsCount);
        const win = bet * mult;
        updateBalance(win);
        setCurrentWin(win);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto bg-gradient-to-br from-[#4a104a] via-[#2d0a2d] to-[#1a061a] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(156,38,156,0.3)] p-8">
      {/* Game Content Wrapper */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Stats Panel (Match Screen 3) */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
           <div className="space-y-1">
              <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600 tracking-tighter leading-none">
                 DIAMOND<br />MINES
              </h1>
              <div className="flex items-center gap-2">
                 <Diamond className="w-4 h-4 text-blue-400" />
                 <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Original Game</span>
              </div>
           </div>

           <div className="space-y-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-purple-500/10 space-y-4">
                 <div className="flex justify-between items-center border-b border-purple-500/10 pb-4">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">MINES</span>
                    <span className="text-xl font-black text-white">{bombsCount}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-purple-500/10 pb-4">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">WIN MULTIPLIER</span>
                    <span className="text-xl font-black text-white">{calculateMultiplier(selectedTiles.length, bombsCount).toFixed(2)}x</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-purple-500/10 pb-4">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">NEXT GEM FOR</span>
                    <span className="text-xl font-black text-white">{calculateMultiplier(selectedTiles.length + 1, bombsCount).toFixed(2)}x</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">POTENTIAL WIN</span>
                    <span className="text-xl font-black text-white">{(bet * calculateMultiplier(selectedTiles.length, bombsCount)).toFixed(2)} €</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Grid Area (Match Screen 3) */}
        <div className="flex-1 flex flex-col items-center justify-center">
           <div className="grid grid-cols-5 gap-3 aspect-square w-full max-w-[500px]">
              {Array.from({ length: GRID_SIZE }).map((_, i) => {
                 const isSelected = selectedTiles.includes(i);
                 const result = results.find(r => r.index === i);
                 
                 return (
                    <motion.div
                      key={i}
                      whileHover={gameState === "betting" ? { scale: 1.05 } : {}}
                      whileTap={gameState === "betting" ? { scale: 0.95 } : {}}
                      onClick={() => toggleTile(i)}
                      className={`relative aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all border-b-8 border-r-4
                        ${result?.type === "bomb" ? "bg-red-950 border-red-900" : 
                          result?.type === "diamond" ? "bg-[#3b82f6]/20 border-[#2563eb]" : 
                          isSelected ? "bg-purple-600/40 border-purple-900" : "bg-purple-900/40 border-purple-950"}
                      `}
                    >
                      <AnimatePresence mode="wait">
                        {result ? (
                          <motion.div key="res" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                             {result.type === "bomb" ? <Bomb size={32} className="text-red-500" /> : <Diamond size={32} className="text-blue-400" />}
                          </motion.div>
                        ) : (
                          <motion.div key="hand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1 opacity-40">
                             <img src="https://img.icons8.com/ios-filled/50/ffffff/cursor.png" className="w-8 h-8 filter grayscale" alt="hand" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                 );
              })}
           </div>
        </div>
      </div>

      {/* Bottom Controls (Match Screen 3) */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-purple-500/10">
         <div className="flex items-center gap-6">
            <button className="text-purple-400 hover:text-white transition-colors"><Menu size={24} /></button>
            <button className="text-purple-400 hover:text-white transition-colors"><Volume2 size={24} /></button>
            <button className="text-purple-400 hover:text-white transition-colors"><RotateCcw size={24} /></button>
         </div>

         <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-full border border-purple-500/10">
            <HelpCircle size={20} className="text-purple-400" />
            <Info size={20} className="text-purple-400" />
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-black/40 px-6 py-4 rounded-full border border-purple-500/10">
               <button onClick={() => setBet(b => Math.max(1, b-10))} className="text-white font-black hover:scale-125 transition-all"><Minus size={20} /></button>
               <span className="text-2xl font-black text-white px-4">€{bet.toFixed(2)}</span>
               <button onClick={() => setBet(b => b+10)} className="text-white font-black hover:scale-125 transition-all"><Plus size={20} /></button>
            </div>
            
            <div className="flex items-center gap-2">
               <span className="text-zinc-600 font-bold text-xs">Mines:</span>
               <select 
                 value={bombsCount} 
                 onChange={(e) => setBombsCount(Number(e.target.value))}
                 className="bg-zinc-800 text-white font-black px-4 py-2 rounded-lg outline-none"
               >
                  {[1, 3, 5, 10, 15, 24].map(v => <option key={v} value={v}>{v}</option>)}
               </select>
            </div>

            {gameState === "betting" ? (
               <button 
                 onClick={playRound}
                 className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] group"
               >
                  <ChevronRight size={48} className="text-black group-hover:translate-x-1 transition-transform" />
               </button>
            ) : (
               <button 
                 onClick={() => { setGameState("betting"); setResults([]); setSelectedTiles([]); }}
                 className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl"
               >
                  <RotateCcw size={32} className="text-white" />
               </button>
            )}
         </div>
         
         <button className="text-purple-400 hover:text-white transition-colors"><Home size={24} /></button>
      </div>
    </div>
  );
}
