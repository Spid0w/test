"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RouletteWheel } from "@/components/casino/RouletteWheel";
import { RouletteBoard } from "@/components/casino/RouletteBoard";
import { Coins, Trophy, History, ArrowLeft, RefreshCw, Eraser, TrendingUp, RotateCcw, Play, Square } from "lucide-react";
import Link from "next/link";

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const CHIP_VALUES = [0.5, 1, 5, 10, 20];

export default function RoulettePage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [initialBalanceSet, setInitialBalanceSet] = useState(false);
  const [activeBets, setActiveBets] = useState<Record<string, number>>({});
  const [lastBets, setLastBets] = useState<Record<string, number>>({});
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("BIENVENUE AU SALOON");
  const [history, setHistory] = useState<number[]>([]);
  const [currentChip, setCurrentChip] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (isSpinning || balance === null) return;
    
    // Manual intervention stops auto mode
    if (isAutoMode) {
      setIsAutoMode(false);
      setMessage("AUTO-MODE DÉSACTIVÉ");
    }

    const betId = id.toString();

    // MODE GOMME
    if (isEraserMode) {
      const existingAmount = activeBets[betId] || 0;
      if (existingAmount > 0) {
        setBalance((prev) => (prev !== null ? prev + existingAmount : prev));
        setActiveBets((prev) => {
           const next = { ...prev };
           delete next[betId];
           return next;
        });
        setMessage("MISE EFFACÉE");
      }
      return;
    }

    // MODE NORMAL
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    if (totalCurrentBets + amount > 50) {
      setMessage("LIMITE DE MISE : 50€ PAR TOUR");
      return;
    }

    if (amount > balance) {
      setMessage("BALANCE INSUFFISANTE");
      return;
    }

    setActiveBets((prev) => ({
      ...prev,
      [betId]: (prev[betId] || 0) + amount,
    }));
    setBalance((prev) => (prev !== null ? prev - amount : 0));
  };

  const doubleCurrentBets = () => {
    if (isSpinning || balance === null || Object.keys(activeBets).length === 0) return;
    
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    if (totalCurrentBets > balance) {
       setMessage("BALANCE INSUFFISANTE POUR DOUBLER");
       return;
    }

    if (totalCurrentBets * 2 > 50) {
       setMessage("LIMITE DE 50€ DÉPASSÉE");
       return;
    }

    const nextBets = { ...activeBets };
    Object.keys(nextBets).forEach(id => {
       nextBets[id] *= 2;
    });

    setActiveBets(nextBets);
    setBalance(prev => (prev !== null ? prev - totalCurrentBets : prev));
    setMessage("MISES DOUBLÉES !");
  };

  const repeatLastBets = useCallback((silent = false) => {
    if (isSpinning || balance === null || Object.keys(lastBets).length === 0) return false;
    
    const totalToRepeat = Object.values(lastBets).reduce((a, b) => a + b, 0);
    if (totalToRepeat > balance) {
      if (!silent) setMessage("BALANCE INSUFFISANTE POUR RÉPÉTER");
      return false;
    }

    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    setBalance(prev => (prev !== null ? prev + totalCurrentBets - totalToRepeat : prev));
    setActiveBets({ ...lastBets });
    if (!silent) setMessage("DERNIÈRE MISE RESTAURÉE");
    return true;
  }, [isSpinning, balance, lastBets, activeBets]);

  const startSpin = useCallback(() => {
    if (isSpinning || Object.keys(activeBets).length === 0) return;
    
    setLastBets({ ...activeBets });
    const result = Math.floor(Math.random() * 37);
    setTargetNumber(result);
    setIsSpinning(true);
    setIsEraserMode(false);
    setMessage(isAutoMode ? "[AUTO] LES JEUX SONT FAITS..." : "LES JEUX SONT FAITS...");
  }, [isSpinning, activeBets, isAutoMode]);

  const resolveBets = (result: number) => {
    let totalWin = 0;
    const isResultRed = REDS.includes(result);
    const isResultEven = result !== 0 && result % 2 === 0;

    Object.entries(activeBets).forEach(([betId, amount]) => {
      if (!isNaN(parseInt(betId))) {
        if (parseInt(betId) === result) totalWin += amount * 36;
      }
      else if (betId.startsWith("split_")) {
        const nums = betId.split("_").slice(1).map(Number);
        if (nums.includes(result)) totalWin += amount * 18;
      }
      else if (betId.startsWith("corner_")) {
        const nums = betId.split("_").slice(1).map(Number);
        if (nums.includes(result)) totalWin += amount * 9;
      }
      else if (betId === "doz1" && result >= 1 && result <= 12) totalWin += amount * 3;
      else if (betId === "doz2" && result >= 13 && result <= 24) totalWin += amount * 3;
      else if (betId === "doz3" && result >= 25 && result <= 36) totalWin += amount * 3;
      else if (betId === "col1" && result !== 0 && (result - 1) % 3 === 0) totalWin += amount * 3;
      else if (betId === "col2" && result !== 0 && (result - 2) % 3 === 0) totalWin += amount * 3;
      else if (betId === "col3" && result !== 0 && result % 3 === 0) totalWin += amount * 3;
      else if (betId === "red" && isResultRed) totalWin += amount * 2;
      else if (betId === "black" && !isResultRed && result !== 0) totalWin += amount * 2;
      else if (betId === "even" && isResultEven) totalWin += amount * 2;
      else if (betId === "odd" && !isResultEven && result !== 0) totalWin += amount * 2;
      else if (betId === "low" && result >= 1 && result <= 18) totalWin += amount * 2;
      else if (betId === "high" && result >= 19 && result <= 36) totalWin += amount * 2;
    });

    setBalance((prev) => (prev !== null ? prev + totalWin : 0));
    setHistory((prev) => [result, ...prev].slice(0, 10));
    setIsSpinning(false);
    setActiveBets({});

    if (totalWin > 0) {
      setMessage(`${isAutoMode ? "[AUTO] " : ""}GAGNÉ : ${result} ${isResultRed ? "ROUGE" : result === 0 ? "VERT" : "NOIR"} (${totalWin.toFixed(2)}€)`);
      if (totalWin > highScore) {
        setHighScore(totalWin);
        localStorage.setItem("roulette_highscore", totalWin.toString());
      }
    } else {
      setMessage(`${isAutoMode ? "[AUTO] " : ""}RÉSULTAT : ${result} ${isResultRed ? "ROUGE" : result === 0 ? "VERT" : "NOIR"} - LA BANQUE GAGNE`);
    }

    // AUTO-MODE NEXT ROUND TRIGGER
    if (isAutoMode) {
      autoTimerRef.current = setTimeout(() => {
         // Auto restart will be handled by useEffect to wait for state updates
      }, 2000);
    }
  };

  // Auto-Mode Loop Effect
  useEffect(() => {
    if (isAutoMode && !isSpinning && initialBalanceSet) {
       const timer = setTimeout(() => {
          let ready = Object.keys(activeBets).length > 0;
          if (!ready) {
             ready = repeatLastBets(true);
          }
          if (ready) {
            startSpin();
          } else {
            setIsAutoMode(false);
            setMessage("AUTO-MODE ARRÊTÉ : BALANCE INSUFFISANTE");
          }
       }, 2000);
       return () => clearTimeout(timer);
    }
  }, [isAutoMode, isSpinning, initialBalanceSet, activeBets, repeatLastBets, startSpin]);

  const resetCurrentBets = () => {
    if (isSpinning) return;
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    setBalance((prev) => (prev !== null ? prev + totalCurrentBets : prev));
    setActiveBets({});
    setMessage("MISES RÉINITIALISÉES");
    setIsAutoMode(false);
  };

  return (
    <main className="min-h-screen bg-[#0a0502] text-[#e5c299] font-serif p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
      <div className="fixed inset-0 pointer-events-none z-50 crt opacity-20" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-[#3f2b1d] pb-4">
          <div className="flex items-center gap-4">
             <Link href="/0x8f9b2c" className="hover:text-[#d4af37] transition-colors">
               <ArrowLeft size={24} />
             </Link>
             <h1 className="text-2xl md:text-5xl font-black tracking-tighter italic text-[#d4af37]">
                EL POCO <span className="text-white">LOCO</span> CASINO
             </h1>
          </div>
          
          <div className="flex gap-4">
             <button 
               onClick={() => setShowLeaderboard(!showLeaderboard)}
               className="flex items-center gap-2 bg-[#3f2b1d] px-3 py-1.5 rounded border border-[#d4af37]/30 hover:bg-[#5c4033] text-xs md:text-sm"
             >
                <Trophy size={16} className="text-[#d4af37]" />
                <span className="hidden sm:inline">CLASSEMENT</span>
             </button>
             <div className="bg-black/50 border-2 border-[#d4af37] px-4 py-1.5 rounded-full flex items-center gap-2">
                <Coins size={18} className="text-[#d4af37]" />
                <span className="text-lg md:text-2xl font-black text-white">
                  {balance !== null ? balance.toFixed(2) : "0.00"}€
                </span>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">
          
          {/* Section Roue */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full relative py-2">
               <RouletteWheel 
                 isSpinning={isSpinning} 
                 targetNumber={targetNumber} 
                 onSpinEnd={resolveBets} 
               />
               
               {/* Historique */}
               <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex gap-1.5">
                 {history.map((num, i) => (
                   <div 
                     key={i} 
                     className={`w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-[10px] font-bold shadow-xl
                       ${num === 0 ? "bg-green-700" : REDS.includes(num) ? "bg-red-800" : "bg-zinc-900"}
                     `}
                     style={{ opacity: 1 - i * 0.1 }}
                   >
                     {num}
                   </div>
                 ))}
               </div>
            </div>

            <div className="w-full bg-[#1b110a] border-4 border-[#3f2b1d] p-4 rounded-lg text-center shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
               <div className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] mb-1 font-mono">Terminal de Jeu</div>
               
               <div className="flex flex-col items-center justify-center min-h-[5em]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={message}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="flex flex-col items-center gap-2"
                    >
                      {targetNumber !== null && !isSpinning && (
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2 border-white/20 shadow-lg
                          ${targetNumber === 0 ? "bg-green-700" : REDS.includes(targetNumber) ? "bg-red-800" : "bg-black"}
                        `}>
                          {targetNumber}
                        </div>
                      )}
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#e5c299]">
                        {message}
                      </span>
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>

            <div className="flex w-full gap-3">
               <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`flex-1 py-5 rounded-xl border-4 font-black text-xl uppercase transition-all flex items-center justify-center gap-3
                    ${isAutoMode 
                      ? "bg-red-950 border-red-500 text-red-500 animate-pulse" 
                      : "bg-[#1b110a] border-[#3f2b1d] text-[#d4af37] hover:border-[#d4af37]"}
                  `}
               >
                  {isAutoMode ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                  {isAutoMode ? "Stop Auto" : "Auto"}
               </button>
               
               <button
                  onClick={startSpin}
                  disabled={isSpinning || Object.keys(activeBets).length === 0}
                  className="flex-[2] py-5 bg-gradient-to-tr from-[#8b4513] to-[#d4af37] text-black font-black text-2xl rounded-xl shadow-[0_8px_0_#3f2b1d] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 disabled:grayscale uppercase"
               >
                  Lancer la bille
               </button>
            </div>
          </div>

          {/* Section Mise */}
          <div className="flex flex-col gap-4">
            <RouletteBoard 
              onPlaceBet={placeBet} 
              activeBets={activeBets} 
              currentChip={currentChip}
              isEraserMode={isEraserMode}
            />

            {/* Outils de mise */}
            <div className="grid grid-cols-3 gap-2">
               <button 
                 onClick={() => { setIsEraserMode(!isEraserMode); setIsAutoMode(false); }}
                 className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all font-black text-xs uppercase
                    ${isEraserMode ? "bg-red-900 border-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.3)] animate-pulse" : "bg-zinc-900 border-[#3f2b1d] text-[#8b4513] hover:border-[#d4af37]"}
                 `}
               >
                  <Eraser size={16} /> Gomme
               </button>
               <button 
                 onClick={doubleCurrentBets}
                 disabled={isSpinning || Object.keys(activeBets).length === 0}
                 className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 bg-zinc-900 border-[#3f2b1d] text-[#e5c299] font-black text-xs uppercase hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-50"
               >
                  <TrendingUp size={16} /> Doubler (x2)
               </button>
               <button 
                 onClick={() => repeatLastBets()}
                 disabled={isSpinning || Object.keys(lastBets).length === 0}
                 className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 bg-zinc-900 border-[#3f2b1d] text-[#e5c299] font-black text-xs uppercase hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-50"
               >
                  <RotateCcw size={16} /> Répéter
               </button>
            </div>

            <div className="bg-black/40 p-5 rounded-xl border border-[#3f2b1d]">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#d4af37]">Choisir vos jetons</span>
                  <button 
                    onClick={resetCurrentBets}
                    className="flex items-center gap-2 text-[10px] hover:text-white transition-colors"
                  >
                    <RefreshCw size={12} /> ANNULER TOUT
                  </button>
               </div>
               <div className="flex justify-between gap-1.5">
                 {CHIP_VALUES.map((val) => (
                   <button
                     key={val}
                     onClick={() => { setCurrentChip(val); setIsEraserMode(false); }}
                     className={`
                       relative w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-dashed flex items-center justify-center font-black transition-all text-xs md:text-sm
                       ${currentChip === val && !isEraserMode ? "scale-110 border-white shadow-[0_0_15px_white] z-10" : "border-[#3f2b1d] opacity-60 hover:opacity-100 hover:scale-105"}
                       ${val < 1 ? "bg-zinc-500 text-black" : val < 10 ? "bg-blue-800 text-white" : val < 20 ? "bg-red-800 text-white" : "bg-black text-[#d4af37] border-[#d4af37]"}
                     `}
                   >
                     {val}€
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-[#8b4513] italic px-2">
               <History size={14} />
               Mise totale ce tour : {Object.values(activeBets).reduce((a, b) => a + b, 0).toFixed(2)}€ / 50€
            </div>
          </div>

        </div>
      </div>

      {/* Modal Initial */}
      <AnimatePresence>
        {!initialBalanceSet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, rotateX: 20 }}
              animate={{ scale: 1, rotateX: 0 }}
              className="bg-[#1a110a] border-4 border-[#d4af37] p-8 max-w-sm w-full rounded-2xl shadow-[0_0_120px_rgba(212,175,55,0.3)] text-center"
            >
              <Trophy className="mx-auto text-[#d4af37] mb-4" size={42} />
              <h2 className="text-2xl font-black mb-1 text-white uppercase italic">Bienvenue, Étranger</h2>
              <p className="text-[#8b4513] mb-8 text-sm italic">Combien d'or as-tu dans ton sac ? (1€ - 50€)</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                 {[10, 20, 30, 50].map((num) => (
                   <button
                     key={num}
                     onClick={() => handleInitialBalance(num)}
                     className="py-3 bg-[#3f2b1d] border border-[#d4af37]/30 rounded-lg font-bold hover:bg-[#d4af37] hover:text-black transition-all"
                   >
                     {num}€
                   </button>
                 ))}
              </div>
              
              <div className="text-[9px] text-[#3f2b1d] uppercase tracking-widest mt-4">
                La fortune sourit aux audacieux... ou les ruine.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classement Overlay */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-full max-w-xs z-[60] bg-[#1a110a] border-l-4 border-[#d4af37]/40 p-8 shadow-2xl shadow-black"
          >
            <button 
               onClick={() => setShowLeaderboard(false)}
               className="absolute top-4 right-4 text-[#d4af37] hover:rotate-90 transition-transform"
            >
               <RefreshCw size={24} className="rotate-45" />
            </button>
            <h3 className="text-xl font-black mb-8 italic border-b border-[#3f2b1d] pb-2 text-[#d4af37]">VOS RECORDS</h3>
            
            <div className="space-y-6">
               <div className="bg-black/40 p-4 rounded border border-[#d4af37]/20">
                  <div className="text-[10px] uppercase text-[#8b4513] mb-1 font-black">Record de gain en un tour</div>
                  <div className="text-3xl font-black text-white">{highScore.toFixed(2)}€</div>
               </div>
               
               <div className="text-[10px] text-[#5c4033] leading-relaxed italic border-t border-[#3f2b1d] pt-4">
                  Note : Vos records sont sauvegardés localement. Pour un classement mondial, une base de données serait requise.
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
