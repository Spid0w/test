"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RouletteWheel } from "@/components/casino/RouletteWheel";
import { RouletteBoard } from "@/components/casino/RouletteBoard";
import { Coins, Trophy, History, ArrowLeft, RefreshCw, Eraser, TrendingUp, RotateCcw, Play, Square, ListOrdered, Lock, Wallet, ShieldAlert, Plus, Minus, Power, PowerOff, Flame, Snowflake, BarChart3 } from "lucide-react";
import Link from "next/link";

import { REDS, calculateWin } from "@/lib/roulette-utils";

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
  
  // Safety state
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
  const [numberFrequency, setNumberFrequency] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    for (let i = 0; i <= 36; i++) init[i] = 0;
    return init;
  });

  const workerRef = useRef<Worker | null>(null);
  
  // STATE REF SYNC
  const stateRef = useRef({
    isSpinning: false,
    targetNumber: null as number | null,
    isAutoMode: false,
    activeBets: {} as Record<string, number>,
    lastBets: {} as Record<string, number>,
    balance: 0 as number | null,
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
    if (s.isSpinning) return;
    
    if (s.isAutoMode && Object.keys(s.activeBets).length === 0) {
       repeatLastBetsRaw(true);
    }

    const result = Math.floor(Math.random() * 37);
    setTargetNumber(result);
    setIsSpinning(true);
    setIsEraserMode(false);
    setMessage(s.isAutoMode ? "[AUTO] LA BILLE ROULE..." : "LA BILLE ROULE...");
    workerRef.current?.postMessage({ action: "startTimer", delay: 6500 });
  }, [repeatLastBetsRaw]);

  // WRAP FUNCTIONS IN STABLE REF FOR WORKER
  const functionsRef = useRef({ resolveBetsRaw: (r: number) => {}, startSpinRaw: () => {} });

  const resolveBetsRaw = useCallback((result: number) => {
    const currentBets = stateRef.current.activeBets;
    const totalBet = Object.values(currentBets).reduce((a, b) => a + b, 0);
    const { totalWin, isPartage, finalWin } = calculateWin(result, currentBets);

    const nextBalance = (stateRef.current.balance || 0) + finalWin;
    setBalance(nextBalance);
    setHistory((prev) => [result, ...prev].slice(0, 10));
    setSessionHistory(prev => [
      { id: prev.length + 1, result, color: result === 0 ? "VERT" : isResultRed ? "ROUGE" : "NOIR", totalBet, totalWin: finalWin, net: finalWin - totalBet },
      ...prev
    ]);
    setIsSpinning(false);
    setLastBets({ ...currentBets });
    setActiveBets({});
    setNumberFrequency(prev => ({ ...prev, [result]: (prev[result] || 0) + 1 }));

    if (finalWin > 0) {
      setMessage(`${stateRef.current.isAutoMode ? "[AUTO] " : ""}GAGNÉ : ${result} (${finalWin.toFixed(2)}€)`);
    } else if (isPartage) {
      setMessage(`${stateRef.current.isAutoMode ? "[AUTO] " : ""}ZÉRO ! PARTAGE : ${(finalWin).toFixed(2)}€ RENDUS`);
    } else {
      setMessage(`${stateRef.current.isAutoMode ? "[AUTO] " : ""}RÉSULTAT : ${result} - LA BANQUE GAGNE`);
    }

    setMaxBalance(prev => nextBalance > prev ? nextBalance : prev);
    setMinBalance(prev => nextBalance < prev ? nextBalance : prev);

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
  }, []);

  // Update functionsRef every time they change
  useEffect(() => {
    functionsRef.current = { resolveBetsRaw, startSpinRaw };
  }, [resolveBetsRaw, startSpinRaw]);

  // SINGLETON WORKER INITIALIZATION
  useEffect(() => {
    workerRef.current = new Worker("/roulette-worker.js");
    workerRef.current.onmessage = (e) => {
      if (e.data.action === "timerExpired") {
        const s = stateRef.current;
        if (s.isSpinning) { functionsRef.current.resolveBetsRaw(s.targetNumber!); } 
        else if (s.isAutoMode) { functionsRef.current.startSpinRaw(); }
      }
    };
    return () => workerRef.current?.terminate();
  }, []); // NO DEPENDENCIES - Created once per session

  const handleInitialBalance = (amount: number) => { 
    setBalance(amount); 
    setMaxBalance(amount);
    setMinBalance(amount);
    setInitialBalanceSet(true); 
    localStorage.setItem("roulette_highscore", "0"); // Reset local session HighScore visual
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
    if (isAutoMode) { setIsAutoMode(false); setMessage("AUTOPILOTE DÉSACTIVÉ"); }
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

  const statsData = (() => {
    const total = Object.values(numberFrequency).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(numberFrequency).sort(([,a], [,b]) => b - a);
    const hot = sorted.slice(0, 5);
    const cold = [...sorted].sort(([,a], [,b]) => a - b).slice(0, 5);
    const red = Object.entries(numberFrequency).filter(([n]) => REDS.includes(Number(n))).reduce((a, [,b]) => a + b, 0);
    const green = numberFrequency[0] || 0;
    const black = total - red - green;
    return { total, hot, cold, red, black, green };
  })();

  return (
    <main className="min-h-screen bg-[#0a0502] text-[#e5c299] font-serif p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
      <div className="fixed inset-0 pointer-events-none z-50 crt opacity-20" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6 border-b-2 border-[#3f2b1d] pb-4">
          <div className="flex items-center gap-4">
             <Link href="/0x8f9b2c" className="hover:text-[#d4af37] transition-colors"><ArrowLeft size={24} /></Link>
             <h1 className="text-2xl md:text-5xl font-black tracking-tighter italic text-[#d4af37]">EL POCO <span className="text-white">LOCO</span> CASINO</h1>
          </div>
          <div className="flex gap-4 items-center">
             <div className="hidden sm:flex items-center gap-2 bg-[#1b110a] border border-[#3f2b1d] p-1.5 rounded-lg shadow-2xl">
                <div className="flex flex-col items-center">
                   <div className="text-[8px] uppercase text-[#8b4513] font-black px-2 tracking-widest">Coffre-Fort</div>
                   <div className="flex items-center gap-2 text-white font-black px-2">
                      <Lock size={12} className="text-[#d4af37]" />
                      {vaultBalance.toFixed(2)}€
                   </div>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => moveToVault(5)} className="bg-[#3f2b1d] hover:bg-[#d4af37] hover:text-black w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold transition-colors shadow-sm">+5</button>
                   <button onClick={() => moveToVault(10)} className="bg-[#3f2b1d] hover:bg-[#d4af37] hover:text-black w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold transition-colors shadow-sm">+10</button>
                   <button onClick={recoverFromVault} className="bg-zinc-900 border border-[#3f2b1d] hover:border-[#d4af37] w-8 h-8 rounded flex items-center justify-center transition-colors shadow-sm"><RefreshCw size={12} /></button>
                </div>
             </div>
             <div className="flex gap-2">
                <Link href="/0x8f9b2c/roulette/farm" className="flex items-center gap-2 bg-[#1b110a] px-3 py-1.5 rounded border border-[#d4af37]/30 hover:bg-[#3f2b1d] text-xs md:text-sm shadow-md transition-all hover:scale-105">
                   <Database size={16} className="text-[#d4af37]" />
                   <span className="hidden sm:inline italic">FARM</span>
                </Link>
                <button onClick={() => { setShowHistory(!showHistory); setShowLeaderboard(false); }} className="flex items-center gap-2 bg-[#1b110a] px-3 py-1.5 rounded border border-[#d4af37]/30 hover:bg-[#3f2b1d] text-xs md:text-sm shadow-md"><History size={16} className="text-[#d4af37]" /><span className="hidden sm:inline italic">LOGS</span></button>
                <button onClick={() => { setShowLeaderboard(!showLeaderboard); setShowHistory(false); }} className="flex items-center gap-2 bg-[#1b110a] px-3 py-1.5 rounded border border-[#d4af37]/30 hover:bg-[#3f2b1d] text-xs md:text-sm shadow-md"><Trophy size={16} className="text-[#d4af37]" /><span className="hidden sm:inline italic">RECORDS</span></button>
                <div className="bg-black border-2 border-[#d4af37] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.15)]"><Coins size={18} className="text-[#d4af37]" /><span className="text-lg md:text-2xl font-black text-white">{balance !== null ? balance.toFixed(2) : "0.00"}€</span></div>
             </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1fr_1.3fr_0.6fr] gap-8 items-start">
          {/* WHEEL & TERMINAL */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full relative py-2 mb-4">
               <RouletteWheel isSpinning={isSpinning} targetNumber={targetNumber} onSpinEnd={() => {}} />
               <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#0a0502]/90 p-2 rounded-full border-2 border-[#d4af37]/20 backdrop-blur-md shadow-2xl">{history.map((num, i) => (<div key={i} className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black shadow-lg transition-transform hover:scale-110 ${num === 0 ? "bg-green-700" : REDS.includes(num) ? "bg-red-800" : "bg-black"}`} style={{ opacity: 1 - i * 0.08 }}>{num}</div>))}</div>
            </div>

            <div className="w-full bg-gradient-to-b from-[#1b110a] to-[#0a0502] border-4 border-[#3f2b1d] p-5 rounded-2xl text-center shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
               <div className="text-[#d4af37] text-[10px] uppercase font-black tracking-[0.5em] mb-3 opacity-40 italic">Système de Bord</div>
               <div className="flex flex-col items-center justify-center min-h-[6.5em]">
                  <AnimatePresence mode="wait">
                    <motion.div key={message} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-3">
                      {targetNumber !== null && !isSpinning && (<motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${targetNumber === 0 ? "bg-green-700" : REDS.includes(targetNumber) ? "bg-red-800" : "bg-black"}`}>{targetNumber}</motion.div>)}
                      <span className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#e5c299] font-mono italic brightness-125">{message}</span>
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>

            <div className="flex w-full gap-4 flex-col sm:flex-row">
               <div className="flex-1 flex flex-col gap-2">
                  <button onClick={() => { 
                    const nextVal = !isAutoMode;
                    setIsAutoMode(nextVal);
                    if (nextVal) setTimeout(() => startSpinRaw(), 50);
                    else setMessage("AUTO-MODE ARRÊTÉ"); // DON'T kill timer, let spin finish
                  }} className={`w-full py-5 rounded-2xl border-4 font-black text-xl uppercase transition-all flex items-center justify-center gap-3 shadow-2xl ${isAutoMode ? "bg-red-950/80 border-red-500 text-red-500 shadow-[0_0_30px_rgba(255,0,0,0.2)] animate-pulse" : "bg-gradient-to-b from-[#1b110a] to-black border-[#3f2b1d] text-[#d4af37] hover:border-[#d4af37] active:scale-95"}`}>
                      {isAutoMode ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                      {isAutoMode ? "Stop Auto" : "Auto Mode"}
                  </button>
                   <div className="flex flex-col gap-3 bg-black/70 rounded-2xl p-4 border-2 border-[#3f2b1d] shadow-inner">
                      <div className="flex items-center gap-2 border-b border-[#3f2b1d]/40 pb-2">
                         <ShieldAlert size={14} className="text-[#8b4513]" />
                         <span className="text-[10px] uppercase font-black text-[#8b4513] tracking-widest">Contrôles de Sécurité</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <button onClick={() => setStopLossEnabled(!stopLossEnabled)} className={`p-2 rounded-lg transition-all ${stopLossEnabled ? "text-red-500 bg-red-500/20 shadow-lg" : "text-zinc-700 hover:text-zinc-500"}`}>{stopLossEnabled ? <Power size={14}/> : <PowerOff size={14}/>}</button>
                            <span className={`text-[9px] uppercase font-black tracking-widest ${stopLossEnabled ? "text-white" : "text-zinc-800"}`}>Stop Loss</span>
                         </div>
                         <div className={`flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5 ${!stopLossEnabled && "opacity-20 grayscale pointer-events-none"}`}>
                            <button onClick={() => setStopLossValue(Math.max(0, stopLossValue - 10))} className="hover:text-white px-1 text-[10px] font-black text-[#8b4513]">-10</button>
                            <button onClick={() => setStopLossValue(Math.max(0, stopLossValue - 1))} className="hover:text-white"><Minus size={14} className="text-[#8b4513]"/></button>
                            <span className="text-sm font-black text-white w-12 text-center font-mono">{stopLossValue}€</span>
                            <button onClick={() => setStopLossValue(stopLossValue + 1)} className="hover:text-white"><Plus size={14} className="text-[#8b4513]"/></button>
                            <button onClick={() => setStopLossValue(stopLossValue + 10)} className="hover:text-white px-1 text-[10px] font-black text-[#8b4513]">+10</button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <button onClick={() => setStopWinEnabled(!stopWinEnabled)} className={`p-2 rounded-lg transition-all ${stopWinEnabled ? "text-[#d4af37] bg-[#d4af37]/20 shadow-lg" : "text-zinc-700 hover:text-zinc-500"}`}>{stopWinEnabled ? <Power size={14}/> : <PowerOff size={14}/>}</button>
                            <span className={`text-[9px] uppercase font-black tracking-widest ${stopWinEnabled ? "text-[#d4af37]" : "text-zinc-800"}`}>Stop Win</span>
                         </div>
                         <div className={`flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5 ${!stopWinEnabled && "opacity-20 grayscale pointer-events-none"}`}>
                            <button onClick={() => setStopWinValue(Math.max(0, stopWinValue - 10))} className="hover:text-[#d4af37] px-1 text-[10px] font-black">-10</button>
                            <button onClick={() => setStopWinValue(Math.max(0, stopWinValue - 1))} className="hover:text-[#d4af37]"><Minus size={14}/></button>
                            <span className="text-sm font-black text-[#d4af37] w-12 text-center font-mono">{stopWinValue}€</span>
                            <button onClick={() => setStopWinValue(stopWinValue + 1)} className="hover:text-[#d4af37]"><Plus size={14}/></button>
                            <button onClick={() => setStopWinValue(stopWinValue + 10)} className="hover:text-[#d4af37] px-1 text-[10px] font-black">+10</button>
                         </div>
                      </div>
                   </div>
               </div>
               <button onClick={startSpinRaw} disabled={isSpinning} className="flex-[2] py-5 bg-gradient-to-tr from-[#8b4513] to-[#d4af37] text-black font-black text-3xl rounded-2xl shadow-[0_12px_0_#3f2b1d] active:shadow-none active:translate-y-2 transition-all disabled:opacity-40 disabled:grayscale uppercase italic tracking-tighter shadow-2xl">Lancer la Bille</button>
            </div>
          </div>

          {/* GAME BOARD */}
          <div className="flex flex-col gap-6">
            <RouletteBoard onPlaceBet={placeBet} activeBets={activeBets} currentChip={currentChip} isEraserMode={isEraserMode} />
            <div className="grid grid-cols-3 gap-4">
               <button onClick={() => { setIsEraserMode(!isEraserMode); setIsAutoMode(false); }} className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-4 transition-all font-black text-sm uppercase italic shadow-xl ${isEraserMode ? "bg-red-950 border-red-500 text-white shadow-[0_0_25px_rgba(255,0,0,0.5)] animate-pulse" : "bg-black/80 border-[#3f2b1d] text-[#8b4513] hover:border-[#d4af37]"}`}><Eraser size={20} /> Gomme</button>
               <button onClick={doubleCurrentBets} disabled={isSpinning || Object.keys(activeBets).length === 0} className="flex items-center justify-center gap-3 py-5 rounded-2xl border-4 bg-black/80 border-[#3f2b1d] text-[#e5c299] font-black text-sm uppercase italic hover:border-[#d4af37] hover:text-[#d4af37] shadow-xl disabled:opacity-20"><TrendingUp size={20} /> Doubler x2</button>
               <button onClick={() => repeatLastBetsRaw()} disabled={isSpinning || Object.keys(lastBets).length === 0} className="flex items-center justify-center gap-3 py-5 rounded-2xl border-4 bg-black/80 border-[#3f2b1d] text-[#e5c299] font-black text-sm uppercase italic hover:border-[#d4af37] hover:text-[#d4af37] shadow-xl disabled:opacity-20"><RotateCcw size={20} /> Répéter</button>
            </div>
            
            <div className="bg-gradient-to-b from-[#1b110a] to-black p-6 rounded-3xl border-2 border-[#3f2b1d] shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12"><Coins size={120} /></div>
               <div className="flex justify-between items-center mb-6 relative z-10"><span className="text-xs uppercase font-black tracking-[0.4em] text-[#d4af37] italic opacity-60">Sélecteur de Coffres</span><button onClick={resetCurrentBets} className="flex items-center gap-2 text-[10px] font-black text-[#5c4033] hover:text-white transition-all tracking-widest uppercase italic opacity-60"><RefreshCw size={12} /> Réinitialiser</button></div>
               <div className="flex justify-between gap-2 relative z-10">{CHIP_VALUES.map((val) => (<button key={val} onClick={() => { setCurrentChip(val); setIsEraserMode(false); }} className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-dashed flex items-center justify-center font-black transition-all text-sm md:text-lg shadow-2xl ${currentChip === val && !isEraserMode ? "scale-110 border-white shadow-[0_0_40px_rgba(255,255,255,0.4)] z-10 -translate-y-3" : "border-[#3f2b1d] opacity-40 hover:opacity-100 hover:scale-105"} ${val < 1 ? "bg-zinc-700 text-black border-zinc-400" : val < 10 ? "bg-blue-900 text-white border-blue-400" : val < 20 ? "bg-red-900 text-white border-red-400" : "bg-black text-[#d4af37] border-[#d4af37]"}`}>{val}€</button>))}</div>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#8b4513] font-black italic px-4 bg-black/60 py-3 rounded-xl border-2 border-[#3f2b1d]/40 backdrop-blur-sm"><History size={18} /> Mise actuelle : <span className="text-white text-xl ml-2">{Object.values(activeBets).reduce((a, b) => a + b, 0).toFixed(2)}€</span> <span className="opacity-20 font-bold ml-auto uppercase text-[10px]">Limite: 50€</span></div>
          </div>

          {/* PERSISTENT STATS DASHBOARD */}
          <div className="hidden xl:flex flex-col gap-6">
            <div className="bg-[#f4e4bc] p-6 rounded-[2rem] border-[6px] border-[#3f2b1d] shadow-[0_30px_100px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col min-h-[750px]">
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
              <div className="absolute inset-0 opacity-5 pointer-events-none border-[16px] border-[#3f2b1d] m-3 rounded-[1.5rem]" />
              
              <div className="relative z-10 flex flex-col h-full px-2">
                <div className="flex items-center gap-3 mb-8 border-b-2 border-[#3f2b1d]/30 pb-5">
                  <div className="bg-[#3f2b1d] p-1.5 rounded-lg shadow-lg"><BarChart3 size={20} className="text-[#f4e4bc]" /></div>
                  <h3 className="text-2xl font-black italic text-[#3f2b1d] tracking-[0.1em] uppercase">LE LIVRE D'OR</h3>
                </div>

                <div className="space-y-12 flex-1">
                  {/* HOT SECTION */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-red-800 drop-shadow-sm">
                        <Flame size={20} fill="currentColor" />
                        <h4 className="text-[12px] font-black uppercase tracking-widest">TENDANCES CHAUDES</h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-red-800/10 flex items-center justify-center border border-red-800/20"><TrendingUp size={14} className="text-red-800" /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {statsData.hot.map(([num, count]) => (
                         <div key={num} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border-b-4 border-[#3f2b1d]/10 shadow-lg group hover:translate-x-2 transition-all">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-4 border-white shadow-xl ${num === "0" ? "bg-green-700" : REDS.includes(Number(num)) ? "bg-red-800" : "bg-black"}`}>{num}</div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] uppercase font-black text-[#5c4033] tracking-tighter">Probabilité</span>
                                  <div className="h-2 w-28 bg-[#3f2b1d]/10 rounded-full overflow-hidden mt-1"><motion.div initial={{ width: 0 }} animate={{ width: `${(count/statsData.total)*300}%` }} className="h-full bg-red-600 shadow-[2px_0_5px_rgba(0,0,0,0.3)]" /></div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-xl font-black text-red-950">{count}x</div>
                               <div className="text-[8px] uppercase font-bold text-red-900/40 tracking-[0.2em]">Coups</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </section>

                  {/* COLD SECTION */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-blue-900 opacity-70">
                        <Snowflake size={20} />
                        <h4 className="text-[12px] font-black uppercase tracking-widest">EN ATTENTE (COLD)</h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-900/10 flex items-center justify-center border border-blue-900/10"><BarChart3 size={14} className="text-blue-900/40" /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {statsData.cold.map(([num, count]) => (
                         <div key={num} className="flex items-center justify-between bg-white/10 p-3 rounded-xl border-b-4 border-blue-950/5 shadow-inner opacity-50 grayscale hover:grayscale-0 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-4 border-white/50 ${num === "0" ? "bg-green-700" : REDS.includes(Number(num)) ? "bg-red-800" : "bg-black"}`}>{num}</div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] uppercase font-black text-[#5c4033]/40">Retard</span>
                                  <div className="h-2 w-28 bg-[#3f2b1d]/5 rounded-full overflow-hidden mt-1"><motion.div initial={{ width: 0 }} animate={{ width: `${(count/statsData.total)*300}%` }} className="h-full bg-blue-400 opacity-60" /></div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-xl font-black text-blue-950 opacity-40 group-hover:opacity-100 transition-opacity">{count}x</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </section>

                  {/* COLOR TRENDS */}
                  <section className="bg-[#3f2b1d]/5 p-5 rounded-2xl border-4 border-white shadow-xl mt-auto">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#3f2b1d] mb-6 flex items-center justify-center gap-2 italic">
                         <BarChart3 size={16} /> Équilibre de la Table
                      </h4>
                      <div className="space-y-6">
                        <div className="h-6 w-full bg-[#3f2b1d]/10 rounded-full overflow-hidden flex border-4 border-white shadow-inner scale-y-110">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(statsData.red/statsData.total)*100}%` }} className="h-full bg-red-800 shadow-[inset_-5px_0_10px_rgba(0,0,0,0.3)]" />
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(statsData.black/statsData.total)*100}%` }} className="h-full bg-black shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" />
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(statsData.green/statsData.total)*100}%` }} className="h-full bg-green-700" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-black italic tracking-widest uppercase text-center">
                           <div className="flex flex-col gap-1.5"><span className="text-red-900 opacity-60">Roux</span><span className="bg-red-800 text-white py-1.5 rounded-lg shadow-md">{Math.round((statsData.red/statsData.total)*100)}%</span></div>
                           <div className="flex flex-col gap-1.5"><span className="text-black opacity-60">Noirs</span><span className="bg-black text-white py-1.5 rounded-lg shadow-md">{Math.round((statsData.black/statsData.total)*100)}%</span></div>
                           <div className="flex flex-col gap-1.5"><span className="text-green-900 opacity-60">Bar</span><span className="bg-green-700 text-white py-1.5 rounded-lg shadow-md">{Math.round((statsData.green/statsData.total)*100)}%</span></div>
                        </div>
                      </div>
                  </section>
                </div>
                
                <div className="mt-8 text-[10px] text-[#8b4513] text-center italic border-t-2 border-[#3f2b1d]/10 pt-5 uppercase leading-relaxed tracking-[0.2em] font-black">
                   Archives du Saloon<br/>
                   <span className="opacity-40 text-[8px] uppercase">Reset au rafraîchissement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>{!initialBalanceSet && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-[#1a110a] border-4 border-[#d4af37] p-8 max-w-sm w-full rounded-[2rem] shadow-[0_0_150px_rgba(212,175,55,0.4)] text-center relative overflow-hidden"><div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" /><div className="relative z-10"><Trophy className="mx-auto text-[#d4af37] mb-6" size={48} /><h2 className="text-3xl font-black mb-2 text-white italic uppercase tracking-tighter">Bienvenue, Cowboy</h2><p className="text-[#8b4513] mb-8 text-sm italic font-black uppercase tracking-widest opacity-60">Combien d'or apportez-vous ?</p><div className="grid grid-cols-2 gap-4 mb-8">{[10, 20, 30, 50].map((num) => (<button key={num} onClick={() => handleInitialBalance(num)} className="py-4 bg-gradient-to-b from-[#3f2b1d] to-[#1b110a] border-2 border-[#d4af37]/30 rounded-xl font-black text-white hover:border-[#d4af37] hover:scale-105 transition-all shadow-xl">{num}€</button>))}</div><div className="text-[10px] text-[#3f2b1d] uppercase tracking-[0.3em] font-black mt-4">La chance tourne comme la bille.</div></div></motion.div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{showLeaderboard && (<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 w-full max-w-xs z-[60] bg-[#1a110a] border-l-4 border-[#d4af37]/40 p-8 shadow-[0_0_80px_rgba(0,0,0,1)]"><div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" /><button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-[#d4af37] hover:rotate-90 transition-transform"><RefreshCw size={24} className="rotate-45" /></button><h3 className="text-2xl font-black mb-8 italic border-b-2 border-[#3f2b1d] pb-2 text-[#d4af37] tracking-tighter">VOS RECORDS</h3><div className="space-y-6"><div className="bg-black/80 p-5 rounded-2xl border-2 border-[#d4af37]/20 shadow-xl"><div className="text-[10px] uppercase text-[#8b4513] mb-2 font-black tracking-widest italic opacity-60">Meilleur Coup</div><div className="text-4xl font-black text-white italic">{highScore.toFixed(2)}€</div></div><div className="text-[10px] text-[#5c4033] leading-relaxed italic border-t-2 border-[#3f2b1d] pt-6 font-black uppercase tracking-widest opacity-40">Vos exploits sont sauvegardés localement sur votre machine.</div></div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{showHistory && (<motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-full max-w-sm z-[60] bg-[#1a110a] border-r-4 border-[#d4af37]/40 p-6 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden flex flex-col"><div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" /><div className="relative z-10 flex flex-col h-full"><div className="flex justify-between items-center mb-8 border-b-2 border-[#3f2b1d] pb-4"><h3 className="text-2xl font-black italic text-[#d4af37] tracking-tighter">JOURNAL DE BORD</h3><button onClick={() => setShowHistory(false)} className="text-[#8b4513] hover:text-[#d4af37] transition-all"><ArrowLeft size={28} /></button></div><div className="bg-gradient-to-br from-black to-[#1a110a] p-5 rounded-2xl border-2 border-[#d4af37]/20 mb-8 flex flex-col gap-4 shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-5"><ListOrdered size={60} /></div><div className="relative z-10 flex justify-between items-center"><div><div className="text-[10px] uppercase text-[#8b4513] font-black tracking-[0.2em] mb-1">Profit Session</div><div className={`text-3xl font-black italic ${sessionProfit >= 0 ? "text-green-500" : "text-red-500"}`}>{sessionProfit >= 0 ? "+" : ""}{sessionProfit.toFixed(2)}€</div></div></div><div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-[#3f2b1d]/40"><div><div className="text-[9px] uppercase text-[#5c4033] font-black tracking-widest">Sommet</div><div className="text-sm font-black text-[#d4af37] italic">{maxBalance.toFixed(2)}€</div></div><div className="text-right"><div className="text-[9px] uppercase text-[#5c4033] font-black tracking-widest">Abysse</div><div className="text-sm font-black text-white italic">{minBalance.toFixed(2)}€</div></div></div></div><div className="flex-1 overflow-auto pr-2 space-y-3 custom-scrollbar">{sessionHistory.length === 0 ? (<div className="text-center py-20 text-[#3f2b1d] italic text-sm font-black uppercase tracking-[0.3em]">Aucune archive...</div>) : (sessionHistory.map((round) => (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={round.id} className="bg-black/40 border-2 border-[#3f2b1d]/40 p-4 rounded-xl flex justify-between items-center group hover:border-[#d4af37]/60 transition-all shadow-md"><div className="flex items-center gap-4"><div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black border-2 border-white/10 group-hover:scale-110 transition-transform ${round.result === 0 ? "bg-green-700" : round.color === "ROUGE" ? "bg-red-800" : "bg-black"}`}>{round.result}</div><div><div className="text-[10px] text-[#5c4033] font-black tracking-tighter uppercase">Vol #{round.id}</div><div className="text-[9px] text-[#8b4513] font-bold">Mise: {round.totalBet}€ | Gain: {round.totalWin}€</div></div></div><div className={`text-md font-black italic ${round.net >= 0 ? "text-green-500" : "text-red-500"}`}>{round.net >= 100 ? "JACKPOT!" : (round.net >= 0 ? "+" : "") + round.net.toFixed(2) + "€"}</div></motion.div>)))}</div><div className="mt-8 pt-5 border-t-2 border-[#3f2b1d] text-[10px] text-[#3f2b1d] text-center font-black uppercase tracking-[0.3em] italic opacity-40">Archives temporaires (Reset session)</div></div></motion.div>)}</AnimatePresence>
    </main>
  );
}
