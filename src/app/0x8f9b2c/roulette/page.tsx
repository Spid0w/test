"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RouletteWheel } from "@/components/casino/RouletteWheel";
import { RouletteBoard } from "@/components/casino/RouletteBoard";
import { Coins, Trophy, History, ArrowLeft, RefreshCw, Eraser, TrendingUp, RotateCcw, Play, Square, ListOrdered, Lock, Wallet, ShieldAlert, Plus, Minus, Power, PowerOff } from "lucide-react";
import Link from "next/link";

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const CHIP_VALUES = [0.5, 1, 5, 10, 20];

interface SessionRound {
  id: number;
  result: number;
  color: string;
  totalBet: number;
  totalWin: number;
  net: number;
}

export default function RoulettePage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [vaultBalance, setVaultBalance] = useState(0);
  
  // Refined safety state
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossValue, setStopLossValue] = useState(0);
  const [stopWinEnabled, setStopWinEnabled] = useState(false);
  const [stopWinValue, setStopWinValue] = useState(100);

  const [initialBalanceSet, setInitialBalanceSet] = useState(false);
  const [activeBets, setActiveBets] = useState<Record<string, number>>({});
  const [lastBets, setLastBets] = useState<Record<string, number>>({});
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("BIENVENUE AU SALOON");
  const [history, setHistory] = useState<number[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionRound[]>([]);
  const [currentChip, setCurrentChip] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [maxBalance, setMaxBalance] = useState<number>(0);
  const [minBalance, setMinBalance] = useState<number>(0);

  const workerRef = useRef<Worker | null>(null);
  
  const stateRef = useRef({
    isSpinning: false,
    targetNumber: null as number | null,
    isAutoMode: false,
    activeBets: {} as Record<string, number>,
    lastBets: {} as Record<string, number>,
    balance: 0 as number | null,
    // Refined safety
    stopLossEnabled: false,
    stopLossValue: 0,
    stopWinEnabled: false,
    stopWinValue: 0,
    initialBalanceSet: false
  });

  useEffect(() => {
    stateRef.current = {
      isSpinning,
      targetNumber,
      isAutoMode,
      activeBets,
      lastBets,
      balance,
      stopLossEnabled,
      stopLossValue,
      stopWinEnabled,
      stopWinValue,
      initialBalanceSet
    };
  }, [isSpinning, targetNumber, isAutoMode, activeBets, lastBets, balance, stopLossEnabled, stopLossValue, stopWinEnabled, stopWinValue, initialBalanceSet]);

  const repeatLastBetsRaw = useCallback((silent = false) => {
    const s = stateRef.current;
    if (s.isSpinning || s.balance === null || Object.keys(s.lastBets).length === 0) return false;
    const totalToRepeat = Object.values(s.lastBets).reduce((a, b) => a + b, 0);
    if (totalToRepeat > s.balance) {
      if (!silent) setMessage("PAS ASSEZ D'OR");
      return false;
    }
    const currentOnBoard = Object.values(s.activeBets).reduce((a, b) => a + b, 0);
    setBalance(prev => (prev !== null ? prev + currentOnBoard - totalToRepeat : prev));
    setActiveBets({ ...s.lastBets });
    if (!silent) setMessage("DERNIÈRE MISE RESTAURÉE");
    return true;
  }, []);

  const startSpinRaw = useCallback(() => {
    const s = stateRef.current;
    if (s.isSpinning || (Object.keys(s.activeBets).length === 0 && Object.keys(s.lastBets).length === 0)) return;
    
    // Check if we can afford the bets (if board empty)
    if (Object.keys(s.activeBets).length === 0) {
       const repeated = repeatLastBetsRaw(true);
       if (!repeated) {
          setIsAutoMode(false);
          setMessage("AUTO-MODE ARRÊTÉ");
          return;
       }
    }

    const result = Math.floor(Math.random() * 37);
    setTargetNumber(result);
    setIsSpinning(true);
    setIsEraserMode(false);
    setMessage(s.isAutoMode ? "[AUTO] LA BILLE ROULE..." : "LA BILLE ROULE...");
    workerRef.current?.postMessage({ action: "startTimer", delay: 6500 });
  }, [repeatLastBetsRaw]);

  const resolveBetsRaw = useCallback((result: number) => {
    let totalWin = 0;
    const currentBets = stateRef.current.activeBets;
    const totalBet = Object.values(currentBets).reduce((a, b) => a + b, 0);
    const isResultRed = REDS.includes(result);
    const isResultEven = result !== 0 && result % 2 === 0;

    Object.entries(currentBets).forEach(([betId, amount]) => {
      if (!isNaN(parseInt(betId))) { if (parseInt(betId) === result) totalWin += amount * 36; }
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

    let finalWin = totalWin;
    let isPartage = false;
    if (result === 0 && totalWin < (totalBet * 35)) {
      const refund = (totalBet - (currentBets["0"] || 0)) * 0.5;
      if (refund > 0) { finalWin += refund; isPartage = true; }
    }

    const nextBalance = (stateRef.current.balance || 0) + finalWin;
    setBalance(nextBalance);
    if (nextBalance > maxBalance) setMaxBalance(nextBalance);
    if (nextBalance < minBalance) setMinBalance(nextBalance);
    
    setHistory((prev) => [result, ...prev].slice(0, 10));
    setSessionHistory(prev => [
      { id: prev.length + 1, result, color: result === 0 ? "VERT" : isResultRed ? "ROUGE" : "NOIR", totalBet, totalWin: finalWin, net: finalWin - totalBet },
      ...prev
    ]);
    setIsSpinning(false);
    setLastBets({ ...currentBets });
    setActiveBets({});

    if (totalWin > 0) {
      setMessage(`${stateRef.current.isAutoMode ? "[AUTO] " : ""}GAGNÉ : ${result} (${finalWin.toFixed(2)}€)`);
    } else if (isPartage) {
      setMessage(`${stateRef.current.isAutoMode ? "[AUTO] " : ""}ZÉRO ! PARTAGE : ${(finalWin).toFixed(2)}€ RENDUS`);
    } else {
      setMessage(`${stateRef.current.isAutoMode ? "[AUTO] " : ""}RÉSULTAT : ${result} - LA BANQUE GAGNE`);
    }

    // SAFETY CHECKS (MOVE TO END OF ROUND)
    if (stateRef.current.isAutoMode) {
       const s = stateRef.current;
       if (s.stopLossEnabled && nextBalance <= s.stopLossValue) {
          setIsAutoMode(false);
          setMessage("STOP LOSS ATTEINT");
       } else if (s.stopWinEnabled && nextBalance >= s.stopWinValue) {
          setIsAutoMode(false);
          setMessage("STOP WIN ATTEINT !");
       } else {
          workerRef.current?.postMessage({ action: "startTimer", delay: 2000 });
       }
    }
  }, [maxBalance, minBalance]);

  useEffect(() => {
    const saved = localStorage.getItem("roulette_highscore");
    if (saved) setHighScore(parseFloat(saved));
    workerRef.current = new Worker("/roulette-worker.js");
    workerRef.current.onmessage = (e) => {
      if (e.data.action === "timerExpired") {
        const s = stateRef.current;
        if (s.isSpinning) { resolveBetsRaw(s.targetNumber!); } 
        else if (s.isAutoMode) { startSpinRaw(); }
      }
    };
    return () => workerRef.current?.terminate();
  }, [resolveBetsRaw, startSpinRaw]);

  const handleInitialBalance = (amount: number) => { 
    setBalance(amount); 
    setMaxBalance(amount);
    setMinBalance(amount);
    setInitialBalanceSet(true); 
  };

  const moveToVault = (amount: number) => {
    if (balance === null || balance < amount) { setMessage("PAS ASSEZ D'OR"); return; }
    setBalance(prev => (prev !== null ? prev - amount : 0));
    setVaultBalance(prev => prev + amount);
    setMessage(`${amount}€ SÉCURISÉS AU COFFRE`);
  };

  const recoverFromVault = () => {
    if (vaultBalance === 0) return;
    setBalance(prev => (prev !== null ? prev + vaultBalance : vaultBalance));
    setVaultBalance(0);
    setMessage("OR RÉCUPÉRÉ DU COFFRE");
  };

  const placeBet = (type: string, id: string | number, amount: number) => {
    if (isSpinning || balance === null) return;
    if (isAutoMode) { setIsAutoMode(false); setMessage("AUTO-MODE DÉSACTIVÉ"); }
    const betId = id.toString();
    if (isEraserMode) {
      const existingAmount = activeBets[betId] || 0;
      if (existingAmount > 0) {
        setBalance((prev) => (prev !== null ? prev + existingAmount : prev));
        setActiveBets((prev) => { const next = { ...prev }; delete next[betId]; return next; });
      }
      return;
    }
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    if (totalCurrentBets + amount > 50 || amount > balance) return;
    setActiveBets((prev) => ({ ...prev, [betId]: (prev[betId] || 0) + amount }));
    setBalance((prev) => (prev !== null ? prev - amount : 0));
  };

  const doubleCurrentBets = () => {
    if (isSpinning || balance === null || Object.keys(activeBets).length === 0) return;
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    if (totalCurrentBets > balance || (totalCurrentBets * 2) > 50) return;
    const nextBets = { ...activeBets };
    Object.keys(nextBets).forEach(id => { nextBets[id] *= 2; });
    setActiveBets(nextBets);
    setBalance(prev => (prev !== null ? prev - totalCurrentBets : prev));
  };

  const resetCurrentBets = () => {
    if (isSpinning) return;
    const totalCurrentBets = Object.values(activeBets).reduce((a, b) => a + b, 0);
    setBalance((prev) => (prev !== null ? prev + totalCurrentBets : prev));
    setActiveBets({});
    setIsAutoMode(false);
  };

  const sessionProfit = sessionHistory.reduce((acc, r) => acc + r.net, 0);

  return (
    <main className="min-h-screen bg-[#0a0502] text-[#e5c299] font-serif p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
      <div className="fixed inset-0 pointer-events-none z-50 crt opacity-20" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6 border-b-2 border-[#3f2b1d] pb-4">
          <div className="flex items-center gap-4">
             <Link href="/0x8f9b2c" className="hover:text-[#d4af37] transition-colors"><ArrowLeft size={24} /></Link>
             <h1 className="text-2xl md:text-5xl font-black tracking-tighter italic text-[#d4af37]">EL POCO <span className="text-white">LOCO</span> CASINO</h1>
          </div>
          <div className="flex gap-4 items-center">
             <div className="hidden sm:flex items-center gap-2 bg-[#1b110a] border border-[#3f2b1d] p-1.5 rounded-lg">
                <div className="flex flex-col items-center">
                   <div className="text-[8px] uppercase text-[#8b4513] font-bold px-2">Coffre-Fort</div>
                   <div className="flex items-center gap-2 text-white font-black px-2">
                      <Lock size={12} className="text-[#d4af37]" />
                      {vaultBalance.toFixed(2)}€
                   </div>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => moveToVault(5)} className="bg-[#3f2b1d] hover:bg-[#d4af37] hover:text-black w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold transition-colors">+5</button>
                   <button onClick={() => moveToVault(10)} className="bg-[#3f2b1d] hover:bg-[#d4af37] hover:text-black w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold transition-colors">+10</button>
                   <button onClick={recoverFromVault} className="bg-zinc-900 border border-[#3f2b1d] hover:border-[#d4af37] w-8 h-8 rounded flex items-center justify-center transition-colors"><RefreshCw size={12} /></button>
                </div>
             </div>
             <div className="flex gap-2">
                <button onClick={() => { setShowHistory(!showHistory); setShowLeaderboard(false); }} className="flex items-center gap-2 bg-[#1b110a] px-3 py-1.5 rounded border border-[#d4af37]/30 hover:bg-[#3f2b1d] text-xs md:text-sm"><History size={16} className="text-[#d4af37]" /><span className="hidden sm:inline">HISTORIQUE</span></button>
                <button onClick={() => { setShowLeaderboard(!showLeaderboard); setShowHistory(false); }} className="flex items-center gap-2 bg-[#1b110a] px-3 py-1.5 rounded border border-[#d4af37]/30 hover:bg-[#3f2b1d] text-xs md:text-sm"><Trophy size={16} className="text-[#d4af37]" /><span className="hidden sm:inline">CLASSEMENT</span></button>
                <div className="bg-black/50 border-2 border-[#d4af37] px-4 py-1.5 rounded-full flex items-center gap-2"><Coins size={18} className="text-[#d4af37]" /><span className="text-lg md:text-2xl font-black text-white">{balance !== null ? balance.toFixed(2) : "0.00"}€</span></div>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full relative py-2">
               <RouletteWheel isSpinning={isSpinning} targetNumber={targetNumber} onSpinEnd={() => {}} />
               <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex gap-1.5">{history.map((num, i) => (<div key={i} className={`w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-[10px] font-bold shadow-xl ${num === 0 ? "bg-green-700" : REDS.includes(num) ? "bg-red-800" : "bg-zinc-900"}`} style={{ opacity: 1 - i * 0.1 }}>{num}</div>))}</div>
            </div>

            <div className="w-full bg-[#1b110a] border-4 border-[#3f2b1d] p-4 rounded-lg text-center shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
               <div className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] mb-1 font-mono">Terminal de Jeu</div>
               <div className="flex flex-col items-center justify-center min-h-[5em]">
                  <AnimatePresence mode="wait">
                    <motion.div key={message} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="flex flex-col items-center gap-2">
                      {targetNumber !== null && !isSpinning && (<div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2 border-white/20 shadow-lg ${targetNumber === 0 ? "bg-green-700" : REDS.includes(targetNumber) ? "bg-red-800" : "bg-black"}`}>{targetNumber}</div>)}
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#e5c299] font-mono">{message}</span>
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>

            <div className="flex w-full gap-3 flex-col sm:flex-row">
               <div className="flex-1 flex flex-col gap-2">
                  <button onClick={() => { 
                    const nextVal = !isAutoMode;
                    setIsAutoMode(nextVal);
                    if (nextVal) setTimeout(() => startSpinRaw(), 50);
                    else { workerRef.current?.postMessage({ action: "stopTimer" }); setMessage("AUTO-MODE ARRÊTÉ"); }
                  }} className={`w-full py-5 rounded-xl border-4 font-black text-xl uppercase transition-all flex items-center justify-center gap-3 ${isAutoMode ? "bg-red-950 border-red-500 text-red-500 animate-pulse" : "bg-[#1b110a] border-[#3f2b1d] text-[#d4af37] hover:border-[#d4af37]"}`}>
                      {isAutoMode ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                      {isAutoMode ? "Stop Auto" : "Auto"}
                  </button>
                   <div className="flex flex-col gap-2 bg-black/40 rounded-lg p-3 border border-[#3f2b1d]">
                      <div className="flex items-center gap-2 border-b border-[#3f2b1d] pb-2 mb-1">
                         <ShieldAlert size={14} className="text-[#8b4513]" />
                         <span className="text-[10px] uppercase font-bold text-[#8b4513]">Sécurité Automatique</span>
                      </div>
                      
                      {/* STOP LOSS ROW */}
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <button onClick={() => setStopLossEnabled(!stopLossEnabled)} className={`p-1 rounded transition-colors ${stopLossEnabled ? "text-red-500 bg-red-500/10" : "text-zinc-600"}`}>
                               {stopLossEnabled ? <Power size={14}/> : <PowerOff size={14}/>}
                            </button>
                            <span className={`text-[9px] uppercase font-bold ${stopLossEnabled ? "text-white" : "text-zinc-600"}`}>Stop Loss</span>
                         </div>
                         <div className={`flex items-center gap-1.5 ${!stopLossEnabled && "opacity-20 pointer-events-none"}`}>
                            <button onClick={() => setStopLossValue(Math.max(0, stopLossValue - 10))} className="hover:text-white text-[10px] font-bold">-10</button>
                            <button onClick={() => setStopLossValue(Math.max(0, stopLossValue - 1))} className="hover:text-white"><Minus size={12}/></button>
                            <span className="text-xs font-black text-white w-10 text-center">{stopLossValue}€</span>
                            <button onClick={() => setStopLossValue(stopLossValue + 1)} className="hover:text-white"><Plus size={12}/></button>
                            <button onClick={() => setStopLossValue(stopLossValue + 10)} className="hover:text-white text-[10px] font-bold">+10</button>
                         </div>
                      </div>

                      {/* STOP WIN ROW */}
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <button onClick={() => setStopWinEnabled(!stopWinEnabled)} className={`p-1 rounded transition-colors ${stopWinEnabled ? "text-[#d4af37] bg-[#d4af37]/10" : "text-zinc-600"}`}>
                               {stopWinEnabled ? <Power size={14}/> : <PowerOff size={14}/>}
                            </button>
                            <span className={`text-[9px] uppercase font-bold ${stopWinEnabled ? "text-[#d4af37]" : "text-zinc-600"}`}>Stop Win</span>
                         </div>
                         <div className={`flex items-center gap-1.5 ${!stopWinEnabled && "opacity-20 pointer-events-none"}`}>
                            <button onClick={() => setStopWinValue(Math.max(0, stopWinValue - 10))} className="hover:text-[#d4af37] text-[10px] font-bold">-10</button>
                            <button onClick={() => setStopWinValue(Math.max(0, stopWinValue - 1))} className="hover:text-[#d4af37]"><Minus size={12}/></button>
                            <span className="text-xs font-black text-[#d4af37] w-10 text-center">{stopWinValue}€</span>
                            <button onClick={() => setStopWinValue(stopWinValue + 1)} className="hover:text-[#d4af37]"><Plus size={12}/></button>
                            <button onClick={() => setStopWinValue(stopWinValue + 10)} className="hover:text-[#d4af37] text-[10px] font-bold">+10</button>
                         </div>
                      </div>
                   </div>
               </div>
               <button onClick={startSpinRaw} disabled={isSpinning || (Object.keys(activeBets).length === 0 && Object.keys(lastBets).length === 0)} className="flex-[2] py-5 bg-gradient-to-tr from-[#8b4513] to-[#d4af37] text-black font-black text-2xl rounded-xl shadow-[0_8px_0_#3f2b1d] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 disabled:grayscale uppercase">Lancer la bille</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <RouletteBoard onPlaceBet={placeBet} activeBets={activeBets} currentChip={currentChip} isEraserMode={isEraserMode} />
            <div className="grid grid-cols-3 gap-2">
               <button onClick={() => { setIsEraserMode(!isEraserMode); setIsAutoMode(false); }} className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all font-black text-xs uppercase ${isEraserMode ? "bg-red-900 border-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.3)] animate-pulse" : "bg-zinc-900 border-[#3f2b1d] text-[#8b4513] hover:border-[#d4af37]"}`}><Eraser size={16} /> Gomme</button>
               <button onClick={doubleCurrentBets} disabled={isSpinning || Object.keys(activeBets).length === 0} className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 bg-zinc-900 border-[#3f2b1d] text-[#e5c299] font-black text-xs uppercase hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-50"><TrendingUp size={16} /> Doubler (x2)</button>
               <button onClick={() => repeatLastBetsRaw()} disabled={isSpinning || Object.keys(lastBets).length === 0} className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 bg-zinc-900 border-[#3f2b1d] text-[#e5c299] font-black text-xs uppercase hover:border-[#d4af37] hover:text-[#d4af37] disabled:opacity-50"><RotateCcw size={16} /> Répéter</button>
            </div>
            
            <div className="sm:hidden flex items-center justify-between bg-black/40 p-4 rounded-xl border border-[#3f2b1d]">
               <div className="flex items-center gap-2">
                  <Lock size={16} className="text-[#d4af37]" />
                  <div className="text-xl font-black text-white">{vaultBalance.toFixed(2)}€</div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => moveToVault(5)} className="px-4 py-2 bg-[#3f2b1d] rounded font-bold">+5€</button>
                  <button onClick={recoverFromVault} className="px-4 py-2 bg-zinc-800 rounded font-bold"><RefreshCw size={16}/></button>
               </div>
            </div>

            <div className="bg-black/40 p-5 rounded-xl border border-[#3f2b1d]"><div className="flex justify-between items-center mb-4"><span className="text-[10px] uppercase tracking-widest text-[#d4af37]">Choisir vos jetons</span><button onClick={resetCurrentBets} className="flex items-center gap-2 text-[10px] hover:text-white transition-colors"><RefreshCw size={12} /> ANNULER TOUT</button></div><div className="flex justify-between gap-1.5">{CHIP_VALUES.map((val) => (<button key={val} onClick={() => { setCurrentChip(val); setIsEraserMode(false); }} className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-dashed flex items-center justify-center font-black transition-all text-xs md:text-sm ${currentChip === val && !isEraserMode ? "scale-110 border-white shadow-[0_0_15px_white] z-10" : "border-[#3f2b1d] opacity-60 hover:opacity-100 hover:scale-105"} ${val < 1 ? "bg-zinc-500 text-black" : val < 10 ? "bg-blue-800 text-white" : val < 20 ? "bg-red-800 text-white" : "bg-black text-[#d4af37] border-[#d4af37]"}`}>{val}€</button>))}</div></div>
            <div className="flex items-center gap-3 text-xs text-[#8b4513] italic px-2"><History size={14} /> Mise totale ce tour : {Object.values(activeBets).reduce((a, b) => a + b, 0).toFixed(2)}€ / 50€</div>
          </div>
        </div>
      </div>

      <AnimatePresence>{!initialBalanceSet && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.8, rotateX: 20 }} animate={{ scale: 1, rotateX: 0 }} className="bg-[#1a110a] border-4 border-[#d4af37] p-8 max-w-sm w-full rounded-2xl shadow-[0_0_120px_rgba(212,175,55,0.3)] text-center"><Trophy className="mx-auto text-[#d4af37] mb-4" size={42} /><h2 className="text-2xl font-black mb-1 text-white uppercase italic">Bienvenue, Étranger</h2><p className="text-[#8b4513] mb-8 text-sm italic">Combien d'or as-tu dans ton sac ? (1€ - 50€)</p><div className="grid grid-cols-2 gap-3 mb-6">{[10, 20, 30, 50].map((num) => (<button key={num} onClick={() => handleInitialBalance(num)} className="py-3 bg-[#3f2b1d] border border-[#d4af37]/30 rounded-lg font-bold hover:bg-[#d4af37] hover:text-black transition-all">{num}€</button>))}</div><div className="text-[9px] text-[#3f2b1d] uppercase tracking-widest mt-4">La fortune sourit aux audacieux... ou les ruine.</div></motion.div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{showLeaderboard && (<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 w-full max-w-xs z-[60] bg-[#1a110a] border-l-4 border-[#d4af37]/40 p-8 shadow-2xl shadow-black"><button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-[#d4af37] hover:rotate-90 transition-transform"><RefreshCw size={24} className="rotate-45" /></button><h3 className="text-xl font-black mb-8 italic border-b border-[#3f2b1d] pb-2 text-[#d4af37]">VOS RECORDS</h3><div className="space-y-6"><div className="bg-black/40 p-4 rounded border border-[#d4af37]/20"><div className="text-[10px] uppercase text-[#8b4513] mb-1 font-black">Record de gain en un tour</div><div className="text-3xl font-black text-white">{highScore.toFixed(2)}€</div></div><div className="text-[10px] text-[#5c4033] leading-relaxed italic border-t border-[#3f2b1d] pt-4">Note : Vos records sont sauvegardés localement. Pour un classement mondial, une base de données serait requise.</div></div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{showHistory && (<motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-full max-w-sm z-[60] bg-[#1a110a] border-r-4 border-[#d4af37]/40 p-6 shadow-2xl shadow-black overflow-hidden flex flex-col"><div className="flex justify-between items-center mb-8 border-b border-[#3f2b1d] pb-2"><h3 className="text-xl font-black italic text-[#d4af37]">JOURNAL DE BORD</h3><button onClick={() => setShowHistory(false)} className="text-[#8b4513] hover:text-[#d4af37]"><ArrowLeft size={24} /></button></div><div className="bg-black/60 p-4 rounded border border-[#d4af37]/20 mb-6 flex flex-col gap-3"><div className="flex justify-between items-center"><div><div className="text-[10px] uppercase text-[#8b4513] font-black">Profit Session</div><div className={`text-2xl font-black ${sessionProfit >= 0 ? "text-green-500" : "text-red-500"}`}>{sessionProfit >= 0 ? "+" : ""}{sessionProfit.toFixed(2)}€</div></div><ListOrdered size={32} className="opacity-20 text-[#d4af37]" /></div><div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#3f2b1d]"><div><div className="text-[8px] uppercase text-[#5c4033] font-black">Sommet (Max)</div><div className="text-xs font-bold text-[#d4af37]">{maxBalance.toFixed(2)}€</div></div><div className="text-right"><div className="text-[8px] uppercase text-[#5c4033] font-black">Abysse (Min)</div><div className="text-xs font-bold text-white">{minBalance.toFixed(2)}€</div></div></div></div><div className="flex-1 overflow-auto pr-2 space-y-2 custom-scrollbar">{sessionHistory.length === 0 ? (<div className="text-center py-10 text-[#3f2b1d] italic text-sm">Aucune manche enregistrée...</div>) : (sessionHistory.map((round) => (<div key={round.id} className="bg-black/40 border border-[#3f2b1d] p-3 rounded flex justify-between items-center group hover:border-[#d4af37]/40 transition-colors"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border border-white/10 ${round.result === 0 ? "bg-green-700" : round.color === "ROUGE" ? "bg-red-800" : "bg-zinc-900"}`}>{round.result}</div><div><div className="text-[9px] text-[#5c4033] uppercase">Manche #{round.id}</div><div className="text-[10px] text-[#8b4513]">Mise: {round.totalBet}€ | Gain: {round.totalWin}€</div></div></div><div className={`text-sm font-black ${round.net >= 0 ? "text-green-500" : "text-red-500"}`}>{round.net >= 0 ? "+" : ""}{round.net.toFixed(2)}€</div></div>)))}</div><div className="mt-6 pt-4 border-t border-[#3f2b1d] text-[9px] text-[#3f2b1d] text-center uppercase">Historique temporaire (Reset au rafraîchissement)</div></motion.div>)}</AnimatePresence>
    </main>
  );
}
