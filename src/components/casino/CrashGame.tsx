"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Coins, Rocket, RotateCcw, TrendingUp, Zap, History, User, ChevronDown } from "lucide-react";

export function CrashGame() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<"betting" | "launching" | "crashed">("betting");
  const [history, setHistory] = useState<number[]>([1.42, 5.23, 1.02, 12.45, 1.89, 2.45, 4.35, 11.20, 1.10, 194.75]);
  const [crashPoint, setCrashPoint] = useState(0);
  const [isCashedOut, setIsCashedOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startLaunch = () => {
    if (balance === null || balance < bet || bet === 0) return;
    updateBalance(-bet);

    const p = Math.max(1.01, 0.99 / (1 - Math.random()));
    setCrashPoint(p);
    setGameState("launching");
    setIsCashedOut(false);
    setMultiplier(1.0);
    startTimeRef.current = Date.now();
    
    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const currentMult = Math.pow(Math.E, 0.08 * elapsed);
      
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
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Trajectory: y = x^1.5 or similar curve
  const t = (multiplier - 1) / 10; // Normalized for 10x range
  const rocketX = 5 + t * 70;
  const rocketY = 85 - Math.pow(t, 0.5) * 60;

  return (
    <div className="flex h-[600px] w-full max-w-6xl mx-auto bg-[#0f111a] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Left: Chart Area (Match Screen 2) */}
      <div className="flex-1 flex flex-col relative bg-[#1a1c23] overflow-hidden">
         {/* Grid background */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "100px 100px" }}
         />
         
         <div className="absolute top-6 left-6 text-zinc-600 text-[10px] font-black flex items-center gap-2">
            <User size={14} /> History
         </div>

         {/* Multiplier in center */}
         <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <motion.div 
               key={gameState === "crashed" ? "c" : "m"}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={`text-8xl font-black italic tracking-tighter ${gameState === "crashed" ? "text-red-600" : "text-[#d4af37]"}`}
            >
               {multiplier.toFixed(2)}x
            </motion.div>
         </div>

         {/* Trajectory Line & Rocket */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <motion.path 
               d={`M 0 510 L ${rocketX * 11} ${rocketY * 6}`}
               stroke="#d4af37"
               strokeWidth="3"
               fill="none"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
            />
         </svg>

         <AnimatePresence>
            {(gameState === "launching" || gameState === "crashed") && (
               <motion.div
                  initial={{ x: "5%", y: "85%", rotate: 0 }}
                  animate={gameState === "launching" ? { 
                     x: `${rocketX}%`, 
                     y: `${rocketY}%`,
                     rotate: -25
                  } : {
                     y: "110%", rotate: 45, opacity: 0
                  }}
                  className="absolute z-20"
               >
                  <Rocket className="w-20 h-20 text-[#22c55e] rotate-90 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
               </motion.div>
            )}
         </AnimatePresence>

         {/* Axis Multipliers */}
         <div className="absolute right-4 inset-y-10 flex flex-col justify-between text-[10px] font-black text-zinc-700 pointer-events-none">
            <span>2.0x</span><span>1.8x</span><span>1.6x</span><span>1.4x</span><span>1.2x</span><span>1.0x</span>
         </div>
         <div className="absolute bottom-4 inset-x-10 flex justify-between text-[10px] font-black text-zinc-700 pointer-events-none">
            <span>0s</span><span>2s</span><span>4s</span><span>6s</span><span>8s</span><span>10s</span>
         </div>

         {/* Bottom History (Match Screen 2) */}
         <div className="absolute bottom-0 inset-x-0 h-10 bg-[#14151c] flex items-center gap-2 px-4 border-t border-white/5 overflow-x-auto">
            {history.map((h, i) => (
               <span key={i} className={`text-[10px] font-black px-3 py-1 rounded-full ${h >= 2 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {h.toFixed(2)}x
               </span>
            ))}
         </div>
      </div>

      {/* Right: Controls Area (Match Screen 2) */}
      <div className="w-[300px] bg-[#21232d] flex flex-col border-l border-white/5">
         <div className="flex bg-[#1a1c23] p-1 m-4 rounded-lg">
            <button onClick={() => setActiveTab("manual")} className={`flex-1 py-2 rounded text-xs font-black uppercase transition-all ${activeTab === "manual" ? "bg-[#333544] text-white" : "text-zinc-500"}`}>Manual</button>
            <button onClick={() => setActiveTab("auto")} className={`flex-1 py-2 rounded text-xs font-black uppercase transition-all ${activeTab === "auto" ? "bg-[#333544] text-white" : "text-zinc-500"}`}>Auto</button>
         </div>

         <div className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Bet Amount</label>
               <div className="bg-[#1a1c23] rounded-lg p-3 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 bg-[#d4af37] rounded flex items-center justify-center text-black font-black text-[9px]">C</div>
                     <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="bg-transparent font-black text-white outline-none w-20" />
                  </div>
                  <div className="flex gap-1 border-l border-white/10 pl-2">
                     <button onClick={() => setBet(b => Math.max(0, b/2))} className="px-2 py-0.5 bg-[#333544] rounded text-[10px] font-black text-white hover:bg-zinc-700 transition-colors">1/2</button>
                     <button onClick={() => setBet(b => b*2)} className="px-2 py-0.5 bg-[#333544] rounded text-[10px] font-black text-white hover:bg-zinc-700 transition-colors">2x</button>
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Auto Cashout</label>
               <div className="bg-[#1a1c23] rounded-lg p-3 border border-white/10 flex items-center justify-between">
                  <input type="number" defaultValue="2.00" className="bg-transparent font-black text-white outline-none w-full" />
                  <span className="text-zinc-500 font-black text-xs">x</span>
               </div>
            </div>

            {gameState === "betting" ? (
               <button 
                  onClick={startLaunch}
                  className="w-full py-5 bg-[#22c55e] text-black font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/10"
               >
                  Bet (next round)
               </button>
            ) : gameState === "launching" && !isCashedOut ? (
               <button 
                  onClick={cashOut}
                  className="w-full py-5 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/10"
               >
                  <div className="text-[10px] opacity-60">Cashout</div>
                  <div className="text-xl">{(bet * multiplier).toFixed(2)}$</div>
               </button>
            ) : (
               <button 
                  onClick={() => setGameState("betting")}
                  className="w-full py-5 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-lg"
               >
                  Waiting for round...
               </button>
            )}

            <div className="pt-6 border-t border-white/5 space-y-2">
               <div className="flex justify-between text-[10px] font-black">
                  <span className="text-zinc-600 uppercase">Players:</span>
                  <span className="text-white">1</span>
               </div>
               <div className="flex justify-between text-[10px] font-black">
                  <span className="text-zinc-600 uppercase">Total Amount:</span>
                  <span className="text-white flex items-center gap-1"><div className="w-3 h-3 bg-[#d4af37] rounded flex items-center justify-center text-black text-[7px]">C</div> {bet.toFixed(2)}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
