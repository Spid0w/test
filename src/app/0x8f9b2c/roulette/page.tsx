"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RouletteWheel } from "@/components/casino/RouletteWheel";
import { RouletteBoard } from "@/components/casino/RouletteBoard";
import { Coins, Trophy, History, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { GlitchText } from "@/components/glitch/GlitchText";

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const CHIP_VALUES = [0.5, 1, 5, 10, 20];

export default function RoulettePage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [initialBalanceSet, setInitialBalanceSet] = useState(false);
  const [activeBets, setActiveBets] = useState<Record<string, number>>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("BENVENUTO AL SALOON");
  const [history, setHistory] = useState<number[]>([]);
  const [currentChip, setCurrentChip] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("roulette_highscore");
    if (saved) setHighScore(parseFloat(saved));
  }, []);

  const handleInitialBalance = (amount: number) => {
    setBalance(amount);
    setInitialBalanceSet(true);
  };

  const placeBet = (type: string, id: string | number, amount: number) => {
    if (isSpinning || balance === null || amount > balance) return;
    
    // Check if total bets for this turn exceed 50€
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    if (totalCurrentBets + amount > 50) {
      setMessage("LIMITE DI SCOMMESSA: 50€");
      return;
    }

    setActiveBets((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + amount,
    }));
    setBalance((prev) => (prev !== null ? prev - amount : 0));
  };

  const startSpin = () => {
    if (isSpinning || Object.keys(activeBets).length === 0) return;
    
    const result = Math.floor(Math.random() * 37);
    setTargetNumber(result);
    setIsSpinning(true);
    setMessage("LA ROULETTE GIRA...");
  };

  const resolveBets = (result: number) => {
    let totalWin = 0;
    const isResultRed = REDS.includes(result);
    const isResultEven = result !== 0 && result % 2 === 0;

    Object.entries(activeBets).forEach(([betId, amount]) => {
      // Straight Up (Number)
      if (!isNaN(parseInt(betId))) {
        if (parseInt(betId) === result) totalWin += amount * 36;
      }
      // Colors
      else if (betId === "red" && isResultRed) totalWin += amount * 2;
      else if (betId === "black" && !isResultRed && result !== 0) totalWin += amount * 2;
      // Parity
      else if (betId === "even" && isResultEven) totalWin += amount * 2;
      else if (betId === "odd" && !isResultEven && result !== 0) totalWin += amount * 2;
      // High/Low
      else if (betId === "low" && result >= 1 && result <= 18) totalWin += amount * 2;
      else if (betId === "high" && result >= 19 && result <= 36) totalWin += amount * 2;
    });

    setBalance((prev) => (prev !== null ? prev + totalWin : 0));
    setHistory((prev) => [result, ...prev].slice(0, 10));
    setIsSpinning(false);
    setActiveBets({});

    if (totalWin > 0) {
      setMessage(`GUADAGNO: ${totalWin.toFixed(2)}€ !`);
      if (totalWin > highScore) {
        setHighScore(totalWin);
        localStorage.setItem("roulette_highscore", totalWin.toString());
      }
    } else {
      setMessage(`RISULTATO: ${result} - BANCO VINCE`);
    }
  };

  const resetBets = () => {
    if (isSpinning) return;
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    setBalance((prev) => (prev !== null ? prev + totalCurrentBets : 0));
    setActiveBets({});
    setMessage("SCOMMESSE RESETTATE");
  };

  return (
    <main className="min-h-screen bg-[#0a0502] text-[#e5c299] font-serif p-4 md:p-8 relative overflow-hidden">
      {/* Western Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
      
      {/* CRT / Glitch Overlay for consistency with site index */}
      <div className="fixed inset-0 pointer-events-none z-50 crt opacity-20" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b-2 border-[#3f2b1d] pb-4">
          <div className="flex items-center gap-4">
             <Link href="/0x8f9b2c" className="hover:text-[#d4af37] transition-colors">
               <ArrowLeft size={24} />
             </Link>
             <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic text-[#d4af37]">
                EL POCO <span className="text-white">LOCO</span> CASINO
             </h1>
          </div>
          
          <div className="flex gap-4">
             <button 
               onClick={() => setShowLeaderboard(!showLeaderboard)}
               className="flex items-center gap-2 bg-[#3f2b1d] px-4 py-2 rounded border border-[#d4af37]/30 hover:bg-[#5c4033]"
             >
                <Trophy size={18} className="text-[#d4af37]" />
                <span className="hidden sm:inline">RECORDS</span>
             </button>
             <div className="bg-black/50 border-2 border-[#d4af37] px-6 py-2 rounded-full flex items-center gap-3">
                <Coins className="text-[#d4af37]" />
                <span className="text-2xl font-black text-white">
                  {balance !== null ? balance.toFixed(2) : "0.00"}€
                </span>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Wheel and Message */}
          <div className="flex flex-col items-center gap-8">
            <div className="w-full relative">
               <RouletteWheel 
                 isSpinning={isSpinning} 
                 targetNumber={targetNumber} 
                 onSpinEnd={resolveBets} 
               />
               
               {/* Last Numbers */}
               <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex gap-2">
                 {history.map((num, i) => (
                   <div 
                     key={i} 
                     className={`w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center text-xs font-bold shadow-lg
                       ${num === 0 ? "bg-green-700" : REDS.includes(num) ? "bg-red-800" : "bg-zinc-900"}
                     `}
                     style={{ opacity: 1 - i * 0.1 }}
                   >
                     {num}
                   </div>
                 ))}
               </div>
            </div>

            <div className="w-full bg-[#1b110a] border-4 border-[#3f2b1d] p-6 rounded-lg text-center shadow-inner">
               <div className="text-[#d4af37] text-xs uppercase tracking-[0.3em] mb-2 font-mono">Status Terminal</div>
               <div className="text-2xl font-bold uppercase tracking-widest min-h-[1.5em] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={message}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {message}
                    </motion.span>
                  </AnimatePresence>
               </div>
            </div>

            <button
               onClick={startSpin}
               disabled={isSpinning || Object.keys(activeBets).length === 0}
               className="w-full py-6 bg-gradient-to-tr from-[#8b4513] to-[#d4af37] text-black font-black text-3xl rounded-xl shadow-[0_10px_0_#3f2b1d] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 disabled:grayscale"
            >
               GIOCA ORA
            </button>
          </div>

          {/* Right Column: Board and Betting UI */}
          <div className="flex flex-col gap-6">
            <RouletteBoard 
              onPlaceBet={placeBet} 
              activeBets={activeBets} 
              currentChip={currentChip} 
            />

            <div className="bg-black/40 p-6 rounded-xl border border-[#3f2b1d]">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-widest text-[#d4af37]">Scegli Fiches</span>
                  <button 
                    onClick={resetBets}
                    className="flex items-center gap-2 text-xs hover:text-white transition-colors"
                  >
                    <RefreshCw size={14} /> ANNULLA TUTTO
                  </button>
               </div>
               <div className="flex justify-between gap-2">
                 {CHIP_VALUES.map((val) => (
                   <button
                     key={val}
                     onClick={() => setCurrentChip(val)}
                     className={`
                       relative w-16 h-16 rounded-full border-4 border-dashed flex items-center justify-center font-black transition-all
                       ${currentChip === val ? "scale-110 border-white shadow-[0_0_20px_white] z-10" : "border-[#3f2b1d] opacity-60 hover:opacity-100 hover:scale-105"}
                       ${val < 1 ? "bg-zinc-500 text-black" : val < 10 ? "bg-blue-800 text-white" : val < 20 ? "bg-red-800 text-white" : "bg-black text-[#d4af37] border-[#d4af37]"}
                     `}
                   >
                     {val}€
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-[#8b4513] italic">
               <History size={16} />
               Scommessa totale in questo giro: {Object.values(activeBets).reduce((a, b) => a + b, 0).toFixed(2)}€ / 50€
            </div>
          </div>

        </div>
      </div>

      {/* Initial Balance Modal */}
      <AnimatePresence>
        {!initialBalanceSet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1a110a] border-4 border-[#d4af37] p-8 max-w-md w-full rounded-2xl shadow-[0_0_100px_rgba(212,175,55,0.2)] text-center"
            >
              <Trophy className="mx-auto text-[#d4af37] mb-4" size={48} />
              <h2 className="text-3xl font-black mb-2 text-white">BENVENUTO, STRANIERO</h2>
              <p className="text-[#8b4513] mb-8 font-serif">Quanto oro porti nel tuo sacco? (1€ - 50€)</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 {[10, 20, 30, 50].map((num) => (
                   <button
                     key={num}
                     onClick={() => handleInitialBalance(num)}
                     className="py-4 bg-[#3f2b1d] border border-[#d4af37]/30 rounded-lg font-bold hover:bg-[#d4af37] hover:text-black transition-all"
                   >
                     {num}€
                   </button>
                 ))}
              </div>
              
              <div className="text-[10px] text-[#3f2b1d] uppercase tracking-widest mt-4">
                La fortuna aiuta gli audaci... o li rovina.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Overlay */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-full max-w-xs z-[60] bg-[#1a110a] border-l-4 border-[#3f2b1d] p-8 shadow-2xl"
          >
            <button 
               onClick={() => setShowLeaderboard(false)}
               className="absolute top-4 right-4 text-[#d4af37]"
            >
               <RefreshCw size={24} className="rotate-45" />
            </button>
            <h3 className="text-2xl font-black mb-8 italic border-b border-[#3f2b1d] pb-2 text-[#d4af37]">I TUOI RECORD</h3>
            
            <div className="space-y-6">
               <div className="bg-black/40 p-4 rounded border border-[#d4af37]/20">
                  <div className="text-xs uppercase text-[#8b4513] mb-1">MIGLIOR GUADAGNO</div>
                  <div className="text-3xl font-black text-white">{highScore.toFixed(2)}€</div>
               </div>
               
               <p className="text-xs text-[#5c4033] leading-relaxed">
                  Nota: I tuoi record sono salvati localmente nel tuo browser. Per una classifica globale, il proprietario del saloon dovrebbe installare una base di dati.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
