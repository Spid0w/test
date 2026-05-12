"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Coins, Rocket, RotateCcw, TrendingUp, Zap, History, User } from "lucide-react";

export function CrashGame() {
  const { balance, updateBalance } = useBalance();
  const [bet1, setBet1] = useState(10);
  const [bet2, setBet2] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<"betting" | "launching" | "crashed">("betting");
  const [history, setHistory] = useState<number[]>([1.42, 5.23, 1.02, 12.45, 1.89, 2.45, 4.35, 11.20, 1.10]);
  const [crashPoint, setCrashPoint] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startLaunch = () => {
    const totalBet = bet1 + bet2;
    if (balance === null || balance < totalBet || totalBet === 0) return;
    updateBalance(-totalBet);

    // Provably fair-ish logic
    const p = Math.max(1.01, 0.99 / (1 - Math.random()));
    setCrashPoint(p);
    setGameState("launching");
    setMultiplier(1.0);
    startTimeRef.current = Date.now();
    
    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Exponential growth
      const currentMult = Math.pow(Math.E, 0.07 * elapsed);
      
      if (currentMult >= p) {
        setGameState("crashed");
        setHistory(prev => [p, ...prev].slice(0, 20));
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setMultiplier(currentMult);
      }
    };

    timerRef.current = setInterval(tick, 50);
  };

  const cashOut = (panel: 1 | 2) => {
    if (gameState === "launching") {
      const amount = panel === 1 ? bet1 : bet2;
      if (amount > 0) {
        updateBalance(amount * multiplier);
        if (panel === 1) setBet1(0);
        else setBet2(0);
        
        if (bet1 === 0 && bet2 === 0) {
          // If both cashed out, we could stop but let's let it run for visual
        }
      }
    }
  };

  const reset = () => {
    setGameState("betting");
    setMultiplier(1.0);
    setBet1(10);
    setBet2(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-[700px] max-w-7xl mx-auto bg-[#0f111a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#161925]">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-black text-black text-xs italic">JetX</div>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
               <User size={14} /> Demo153
            </div>
            <div className="flex items-center gap-2 text-yellow-500 text-sm font-black">
               Solde: {balance !== null ? balance.toFixed(2) : "0.00"} $
            </div>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left History Sidebar */}
        <div className="w-20 border-r border-white/5 bg-[#0a0c14] overflow-y-auto p-2 space-y-2 custom-scrollbar">
           {history.map((h, i) => (
             <div key={i} className={`text-[10px] font-black text-center py-1 rounded border border-white/5 ${h >= 2 ? "text-green-500" : "text-red-500"}`}>
                {h.toFixed(2)}x
             </div>
           ))}
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col relative bg-[#1c1e2b]">
           {/* Scene background */}
           <div className="absolute inset-0 bg-gradient-to-b from-[#4a3a5a] via-[#7d6a8b] to-[#1c1e2b] opacity-30 pointer-events-none" />
           <div className="absolute bottom-20 inset-x-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
           
           {/* Multiplier in center */}
           <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div 
                key={gameState}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-8xl font-black italic tracking-tighter ${gameState === "crashed" ? "text-red-600" : "text-green-500 shadow-green-500/20 shadow-2xl"}`}
              >
                {multiplier.toFixed(2)}x
              </motion.div>
           </div>

           {/* Jet Animation */}
           <AnimatePresence>
             {(gameState === "launching" || gameState === "crashed") && (
               <motion.div
                 initial={{ x: "10%", y: "80%", rotate: 0 }}
                 animate={gameState === "launching" ? { 
                   x: `${Math.min(10 + (multiplier - 1) * 20, 70)}%`, 
                   y: `${Math.max(80 - (multiplier - 1) * 20, 20)}%`,
                   rotate: -15
                 } : {
                   y: "110%", rotate: 45
                 }}
                 className="absolute z-20"
               >
                 <div className="relative">
                    <Rocket className="w-20 h-20 text-yellow-500 rotate-90 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                    {gameState === "launching" && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 0.1 }}
                        className="absolute top-1/2 -left-12 -translate-y-1/2 w-16 h-4 bg-gradient-to-r from-orange-600 to-transparent blur-md"
                      />
                    )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Landing strip decorative */}
           <div className="absolute bottom-0 inset-x-0 h-10 bg-[#0a0c14] border-t border-white/10" />

           {/* Bottom Betting Panels */}
           <div className="mt-auto h-40 bg-[#161925] border-t border-white/10 p-4 flex gap-4">
              {/* Panel 1 */}
              <div className="flex-1 bg-[#1c2130] rounded-xl border border-white/5 p-4 flex items-center justify-between gap-6">
                 <div className="space-y-4 flex-1">
                    <div className="flex gap-4">
                       <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mise</label>
                          <div className="flex bg-black/40 rounded-lg p-2 border border-white/5">
                             <input type="number" value={bet1} onChange={(e) => setBet1(Number(e.target.value))} className="bg-transparent w-full font-black text-white outline-none" />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                       {[5, 20, 50, 100].map(v => (
                         <button key={v} onClick={() => setBet1(v)} className="bg-zinc-800 text-[10px] font-bold py-1 rounded hover:bg-zinc-700">{v}</button>
                       ))}
                    </div>
                 </div>
                 {gameState === "launching" && bet1 > 0 ? (
                    <button onClick={() => cashOut(1)} className="h-full px-10 bg-yellow-500 text-black font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all">
                       <div className="text-[10px] opacity-60">Cash Out</div>
                       <div className="text-xl">{(bet1 * multiplier).toFixed(2)}$</div>
                    </button>
                 ) : gameState === "launching" && bet1 === 0 ? (
                    <div className="h-full px-10 bg-zinc-800 text-zinc-500 font-black uppercase rounded-xl flex items-center justify-center">Cashed Out</div>
                 ) : (
                    <button onClick={startLaunch} disabled={gameState !== "betting"} className="h-full px-10 bg-yellow-500 text-black font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">Mise</button>
                 )}
              </div>

              {/* Panel 2 */}
              <div className="flex-1 bg-[#1c2130] rounded-xl border border-white/5 p-4 flex items-center justify-between gap-6">
                 <div className="space-y-4 flex-1">
                    <div className="flex gap-4">
                       <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mise</label>
                          <div className="flex bg-black/40 rounded-lg p-2 border border-white/5">
                             <input type="number" value={bet2} onChange={(e) => setBet2(Number(e.target.value))} className="bg-transparent w-full font-black text-white outline-none" />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                       {[5, 20, 50, 100].map(v => (
                         <button key={v} onClick={() => setBet2(v)} className="bg-zinc-800 text-[10px] font-bold py-1 rounded hover:bg-zinc-700">{v}</button>
                       ))}
                    </div>
                 </div>
                 {gameState === "launching" && bet2 > 0 ? (
                    <button onClick={() => cashOut(2)} className="h-full px-10 bg-yellow-500 text-black font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all">
                       <div className="text-[10px] opacity-60">Cash Out</div>
                       <div className="text-xl">{(bet2 * multiplier).toFixed(2)}$</div>
                    </button>
                 ) : gameState === "launching" && bet2 === 0 ? (
                    <div className="h-full px-10 bg-zinc-800 text-zinc-500 font-black uppercase rounded-xl flex items-center justify-center">Cashed Out</div>
                 ) : gameState === "crashed" ? (
                    <button onClick={reset} className="h-full px-10 bg-zinc-800 text-white font-black uppercase rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"><RotateCcw size={16} /> Reset</button>
                 ) : (
                    <button onClick={startLaunch} disabled={gameState !== "betting"} className="h-full px-10 bg-yellow-500 text-black font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">Mise</button>
                 )}
              </div>
           </div>
        </div>

        {/* Right Stats Sidebar */}
        <div className="w-64 border-l border-white/5 bg-[#0a0c14] hidden xl:flex flex-col">
           <div className="h-10 border-b border-white/5 flex items-center justify-center gap-4 px-4 text-[10px] font-black text-zinc-500 uppercase">
              <span className="text-white border-b border-yellow-500 py-2">Mises Actuelles</span>
              <span>Mes Mises</span>
              <span>Stats</span>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] text-zinc-500">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-700" /> user_{Math.floor(Math.random()*1000)}</div>
                   <div className="font-black text-white">{(10 + Math.random()*100).toFixed(2)} $</div>
                </div>
              ))}
           </div>
           <div className="p-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black">
              <span className="text-zinc-600">En ligne: 1032</span>
              <span className="text-green-500">770 actifs</span>
           </div>
        </div>
      </div>
    </div>
  );
}
