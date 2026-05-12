"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Coins, Rocket, RotateCcw, TrendingUp, Zap, History, User } from "lucide-react";

export function CrashGame() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<"betting" | "launching" | "crashed">("betting");
  const [history, setHistory] = useState<number[]>([1.42, 5.23, 1.02, 12.45, 1.89, 2.45, 4.35, 11.20, 1.10]);
  const [crashPoint, setCrashPoint] = useState(0);
  const [isCashedOut, setIsCashedOut] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startLaunch = () => {
    if (balance === null || balance < bet || bet === 0) return;
    updateBalance(-bet);

    // Provably fair-ish logic
    const p = Math.max(1.01, 0.99 / (1 - Math.random()));
    setCrashPoint(p);
    setGameState("launching");
    setIsCashedOut(false);
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

  const cashOut = () => {
    if (gameState === "launching" && !isCashedOut) {
      updateBalance(bet * multiplier);
      setIsCashedOut(true);
      // We don't stop the rocket, it continues until crash
    }
  };

  const reset = () => {
    setGameState("betting");
    setMultiplier(1.0);
    setIsCashedOut(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Visual positioning
  // Rocket starts at bottom-left and goes up-right
  const rocketX = Math.min(10 + (multiplier - 1) * 15, 80);
  const rocketY = Math.max(85 - (multiplier - 1) * 15, 15);

  return (
    <div className="flex flex-col h-[750px] max-w-7xl mx-auto bg-[#0a0c14] rounded-[40px] border-4 border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#11141f]">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-black text-sm italic shadow-[0_0_20px_rgba(234,179,8,0.3)]">JetX</div>
            <span className="text-white font-black italic tracking-widest text-lg">PRO <span className="text-yellow-500">CRASH</span></span>
         </div>
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-zinc-500 text-xs font-bold bg-black/40 px-4 py-2 rounded-full border border-white/5">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> user_ethan
            </div>
            <div className="flex items-center gap-3 text-yellow-500 text-lg font-black bg-yellow-500/10 px-6 py-2 rounded-xl border border-yellow-500/20">
               {balance !== null ? balance.toFixed(2) : "0.00"} $
            </div>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left History Sidebar */}
        <div className="w-24 border-r border-white/5 bg-[#080a10] overflow-y-auto p-3 space-y-3 custom-scrollbar shadow-inner">
           <div className="text-[10px] font-black text-zinc-600 uppercase text-center mb-2 tracking-widest">Historique</div>
           {history.map((h, i) => (
             <div key={i} className={`text-xs font-black text-center py-2 rounded-xl border-2 transition-all ${h >= 2 ? "text-green-500 border-green-500/10 bg-green-500/5" : "text-red-500 border-red-500/10 bg-red-500/5 hover:bg-red-500/10"}`}>
                {h.toFixed(2)}x
             </div>
           ))}
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col relative bg-[#131621] overflow-hidden">
           {/* Scene background with sky and grid */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#1c1e2b] to-[#2d3045] pointer-events-none" />
           <div className="absolute inset-0 opacity-5 pointer-events-none" 
              style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "100px 100px" }} 
           />
           
           {/* Multiplier in center */}
           <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div 
                key={gameState === "crashed" ? "crash" : "mult"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-[12rem] font-black italic tracking-tighter ${gameState === "crashed" ? "text-red-600 drop-shadow-[0_0_50px_rgba(220,38,38,0.5)]" : "text-green-500 drop-shadow-[0_0_50px_rgba(34,197,94,0.3)]"}`}
              >
                {multiplier.toFixed(2)}<span className="text-4xl opacity-50">x</span>
              </motion.div>
           </div>

           {/* Rocket Animation - Starts bottom left, goes up right */}
           <AnimatePresence>
             {(gameState === "launching" || gameState === "crashed") && (
               <motion.div
                 initial={{ x: "5%", y: "90%", rotate: 0 }}
                 animate={gameState === "launching" ? { 
                   x: `${rocketX}%`, 
                   y: `${rocketY}%`,
                   rotate: -20
                 } : {
                   y: "120%", rotate: 90, opacity: 0
                 }}
                 transition={gameState === "launching" ? { type: "spring", stiffness: 50, damping: 20 } : { duration: 0.5 }}
                 className="absolute z-20"
               >
                 <div className="relative group">
                    <Rocket className="w-24 h-24 text-yellow-500 rotate-90 drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]" />
                    {gameState === "launching" && (
                      <>
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ repeat: Infinity, duration: 0.1 }}
                          className="absolute top-1/2 -left-16 -translate-y-1/2 w-20 h-6 bg-gradient-to-r from-orange-600 to-transparent blur-xl"
                        />
                        <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-40 h-1 bg-white/20 blur-sm" />
                      </>
                    )}
                    {gameState === "crashed" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 2 }} className="absolute top-0 left-0 text-6xl">💥</motion.div>
                    )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Bottom Betting Panels */}
           <div className="mt-auto h-48 bg-[#0a0c14] border-t-4 border-white/5 p-6 flex gap-6 z-30">
              <div className="flex-1 bg-[#161a29] rounded-[30px] border-2 border-white/5 p-6 flex items-center justify-between gap-10 shadow-2xl">
                 <div className="flex flex-col gap-4 flex-1">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Montant Mise</label>
                       <div className="bg-black/60 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                          <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} disabled={gameState === "launching"} className="bg-transparent w-full font-black text-2xl text-white outline-none" />
                          <Coins className="text-yellow-500" size={24} />
                       </div>
                    </div>
                    <div className="flex gap-2">
                       {[5, 10, 50, 100].map(v => (
                         <button key={v} onClick={() => setBet(v)} disabled={gameState === "launching"} className="flex-1 bg-[#0a0c14] text-[10px] font-black py-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-zinc-400">{v}</button>
                       ))}
                    </div>
                 </div>

                 {gameState === "betting" ? (
                    <button 
                      onClick={startLaunch}
                      className="h-full px-16 bg-yellow-500 text-black font-black uppercase text-xl rounded-[25px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,179,8,0.2)] border-b-8 border-yellow-700"
                    >
                      MISE
                    </button>
                 ) : gameState === "launching" && !isCashedOut ? (
                    <button 
                      onClick={cashOut}
                      className="h-full px-16 bg-green-500 text-white font-black uppercase rounded-[25px] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] border-b-8 border-green-800 flex flex-col items-center justify-center"
                    >
                       <div className="text-xs opacity-60">ENCAISSER</div>
                       <div className="text-2xl">{(bet * multiplier).toFixed(2)}$</div>
                    </button>
                 ) : gameState === "launching" && isCashedOut ? (
                    <div className="h-full px-16 bg-zinc-800 text-zinc-500 font-black uppercase rounded-[25px] flex flex-col items-center justify-center border-b-8 border-zinc-900 opacity-60">
                       <span className="text-xs">ENCAISSÉ</span>
                       <span className="text-lg text-white">{(bet * multiplier).toFixed(2)}$</span>
                    </div>
                 ) : (
                    <button 
                      onClick={reset}
                      className="h-full px-16 bg-zinc-800 text-white font-black uppercase text-xl rounded-[25px] hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 border-b-8 border-zinc-900"
                    >
                       <RotateCcw size={24} /> RESET
                    </button>
                 )}
              </div>
           </div>
        </div>

        {/* Right Sidebar - Social & Live Stats */}
        <div className="w-72 border-l border-white/5 bg-[#080a10] hidden xl:flex flex-col shadow-2xl">
           <div className="h-14 border-b border-white/5 flex items-center justify-around px-4 text-[10px] font-black text-zinc-600 uppercase">
              <span className="text-white border-b-2 border-yellow-500 py-4">MISES</span>
              <span className="hover:text-white transition-colors cursor-pointer">CHAT</span>
              <span className="hover:text-white transition-colors cursor-pointer">STATS</span>
           </div>
           <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> 
                      <span className="text-zinc-400">joueur_{Math.floor(Math.random()*9999)}</span>
                   </div>
                   <div className="font-black text-white">{(10 + Math.random()*200).toFixed(2)} $</div>
                </div>
              ))}
           </div>
           <div className="p-6 border-t border-white/5 bg-black/20 flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-black uppercase">
                 <span className="text-zinc-600">Joueurs:</span>
                 <span className="text-white">1,402</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                 <div className="h-full w-2/3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
