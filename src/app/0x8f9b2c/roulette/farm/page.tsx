"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Square, Settings2, Layout, Database, TrendingUp, History, Coins, BarChart3, AlertTriangle, Crosshair, Users, RotateCcw } from "lucide-react";
import Link from "next/link";
import { RouletteBoard } from "@/components/casino/RouletteBoard";
import { REDS, calculateWin } from "@/lib/roulette-utils";

interface Account {
  id: number;
  balance: number;
  plateauType: 1 | 2;
  maxBalance: number;
  minBalance: number;
  isBankrupt: boolean;
  bankruptcySpin?: number;
  lastResult?: number;
  lastWin?: number;
}

export default function RouletteFarmPage() {
  const [accountCount, setAccountCount] = useState(10);
  const [startingBalance, setStartingBalance] = useState(20);
  const [totalSpinsTarget, setTotalSpinsTarget] = useState(100);
  const [simSpeed, setSimSpeed] = useState(1000); // ms between spins
  
  const [plateau1Bets, setPlateau1Bets] = useState<Record<string, number>>({});
  const [plateau2Bets, setPlateau2Bets] = useState<Record<string, number>>({});
  const [activePlateau, setActivePlateau] = useState<1 | 2>(1);
  const [currentChip, setCurrentChip] = useState(1);

  const [isRunning, setIsRunning] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentSpinIdx, setCurrentSpinIdx] = useState(0);
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker("/farm-worker.js");
    workerRef.current.onmessage = (e) => {
      if (e.data.action === "update") {
        setAccounts(e.data.accounts);
        setProgress(e.data.progress);
        setCurrentSpinIdx(e.data.currentSpins);
      } else if (e.data.action === "finished") {
        setIsRunning(false);
        setAccounts(e.data.accounts);
        setProgress(100);
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  const handlePlaceBet = (type: string, id: string, amount: number) => {
    const setter = activePlateau === 1 ? setPlateau1Bets : setPlateau2Bets;
    setter(prev => {
      const next = { ...prev };
      if (next[id]) {
        next[id] += amount;
      } else {
        next[id] = amount;
      }
      return next;
    });
  };

  const startFarm = () => {
    if (isRunning) return;

    // Reset accounts
    const initialAccounts: Account[] = Array.from({ length: accountCount }, (_, i) => ({
      id: i + 1,
      balance: startingBalance,
      plateauType: (i % 2 === 0 ? 1 : 2) as 1 | 2,
      maxBalance: startingBalance,
      minBalance: startingBalance,
      isBankrupt: false
    }));

    setAccounts(initialAccounts);
    setProgress(0);
    setCurrentSpinIdx(0);
    setIsRunning(true);

    workerRef.current?.postMessage({
      action: "start",
      payload: {
        accounts: initialAccounts,
        totalSpins: totalSpinsTarget,
        plateau1Bets,
        plateau2Bets,
        delay: simSpeed
      }
    });
  };

  const stopFarm = () => {
    workerRef.current?.postMessage({ action: "stop" });
    setIsRunning(false);
  };

  const clearBets = () => {
    if (activePlateau === 1) setPlateau1Bets({});
    else setPlateau2Bets({});
  };

  const stats = accounts.reduce((acc, curr) => {
    acc.totalBalance += curr.balance;
    if (curr.isBankrupt) acc.bankruptCount++;
    if (curr.bankruptcySpin !== undefined) acc.totalBankruptcySpins += curr.bankruptcySpin;
    return acc;
  }, { totalBalance: 0, bankruptCount: 0, totalBankruptcySpins: 0 });

  const avgBankruptcySpin = stats.bankruptCount > 0 ? (stats.totalBankruptcySpins / stats.bankruptCount).toFixed(1) : "N/A";

  const plateau1Count = accounts.filter(a => a.plateauType === 1).length;
  const plateau2Count = accounts.filter(a => a.plateauType === 2).length;
  const plateau1Profit = accounts.filter(a => a.plateauType === 1).reduce((sum, a) => sum + (a.balance - startingBalance), 0);
  const plateau2Profit = accounts.filter(a => a.plateauType === 2).reduce((sum, a) => sum + (a.balance - startingBalance), 0);

  return (
    <main className="min-h-screen bg-[#0a0502] text-[#e5c299] font-serif p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-8 border-b-2 border-[#3f2b1d] pb-6">
          <div className="flex items-center gap-6">
            <Link href="/0x8f9b2c/roulette" className="bg-[#1b110a] p-3 rounded-full border border-[#d4af37]/30 hover:border-[#d4af37] transition-all">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-black italic text-[#d4af37] tracking-tighter">SIMULATEUR DE <span className="text-white">FARM</span></h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Département de Recherche & Probabilités</p>
            </div>
          </div>
          <div className="flex gap-4">
             {isRunning ? (
               <button onClick={stopFarm} className="flex items-center gap-2 bg-red-950 border-2 border-red-500 px-6 py-3 rounded-xl font-black text-red-500 hover:bg-red-900 transition-all shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                 <Square fill="currentColor" size={16} /> ARRÊTER LE FARM
               </button>
             ) : (
               <button onClick={startFarm} className="flex items-center gap-2 bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                 <Play fill="currentColor" size={16} /> LANCER LE FARM
               </button>
             )}
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Config/Sim Area */}
          <div className="space-y-8">
            {/* Simulation Settings */}
            <section className="bg-[#1b110a] border-4 border-[#3f2b1d] p-6 rounded-3xl shadow-2xl overflow-hidden relative">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#3f2b1d] p-2 rounded-lg"><Settings2 size={20} className="text-[#d4af37]" /></div>
                  <h2 className="text-xl font-black italic uppercase tracking-widest text-[#d4af37]">Configuration Générale</h2>
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Nombre de Comptes</label>
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                       <Users size={18} className="text-[#8b4513]" />
                       <input type="number" min="1" max="50" value={accountCount} onChange={e => setAccountCount(parseInt(e.target.value))} className="bg-transparent border-none text-white font-black w-full focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Mise de Départ (€)</label>
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                       <Coins size={18} className="text-[#8b4513]" />
                       <input type="number" min="1" value={startingBalance} onChange={e => setStartingBalance(parseInt(e.target.value))} className="bg-transparent border-none text-white font-black w-full focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Objectif (Tours)</label>
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                       <RotateCcw size={18} className="text-[#8b4513]" />
                       <input type="number" min="1" value={totalSpinsTarget} onChange={e => setTotalSpinsTarget(parseInt(e.target.value))} className="bg-transparent border-none text-white font-black w-full focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Vitesse (Sim-rate)</label>
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                       <Database size={18} className="text-[#8b4513]" />
                       <select value={simSpeed} onChange={e => setSimSpeed(parseInt(e.target.value))} className="bg-transparent border-none text-white font-black w-full focus:outline-none appearance-none">
                          <option value={2000}>Lent (2s)</option>
                          <option value={1000}>Standard (1s)</option>
                          <option value={500}>Rapide (0.5s)</option>
                          <option value={100}>Turbo (0.1s)</option>
                       </select>
                    </div>
                  </div>
               </div>
            </section>

            {/* Plateau Strategy Configuration */}
            <section className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setActivePlateau(1)} className={`px-8 py-3 rounded-t-2xl font-black italic transition-all border-x-4 border-t-4 ${activePlateau === 1 ? "bg-[#3f2b1d] border-[#3f2b1d] text-[#d4af37] scale-105" : "bg-[#1b110a] border-transparent opacity-40"}`}>PLATEAU #1</button>
                <button onClick={() => setActivePlateau(2)} className={`px-8 py-3 rounded-t-2xl font-black italic transition-all border-x-4 border-t-4 ${activePlateau === 2 ? "bg-[#3f2b1d] border-[#3f2b1d] text-[#d4af37] scale-105" : "bg-[#1b110a] border-transparent opacity-40"}`}>PLATEAU #2 (50/50)</button>
              </div>
              <div className="bg-[#1b110a] border-4 border-[#3f2b1d] p-6 rounded-3xl rounded-tl-none shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] uppercase font-black tracking-widest text-[#8b4513]">Définir la disposition pour ce plateau</div>
                    <button onClick={clearBets} className="text-[10px] font-black text-rose-900 hover:text-rose-500 transition-colors uppercase italic flex items-center gap-2">
                       <Layout size={12} /> Effacer les jetons
                    </button>
                  </div>
                  <RouletteBoard onPlaceBet={handlePlaceBet} activeBets={activePlateau === 1 ? plateau1Bets : plateau2Bets} currentChip={currentChip} isEraserMode={false} />
                  <div className="mt-8 flex justify-center gap-4">
                    {[0.5, 1, 5, 10, 20].map(val => (
                      <button key={val} onClick={() => setCurrentChip(val)} className={`w-14 h-14 rounded-full border-4 border-dashed flex items-center justify-center font-black transition-all ${currentChip === val ? "scale-110 border-white bg-black z-10" : "border-[#3f2b1d] opacity-40"}`}>{val}€</button>
                    ))}
                  </div>

                  <div className="mt-10 border-t-2 border-[#3f2b1d] pt-8">
                    <h3 className="text-sm font-black text-[#8b4513] uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                       <Database size={16} /> Setups Préfait (Pro)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {[
                         { name: "Romanovsky", proba: "86.5%", desc: "Couverture massive", action: () => {
                           const bets = { "doz1": 1.5, "doz2": 1.5, "corner_25_26_28_29": 0.5, "corner_32_33_35_36": 0.5 };
                           activePlateau === 1 ? setPlateau1Bets(bets) : setPlateau2Bets(bets);
                         }},
                         { name: "James Bond", proba: "67.6%", desc: "Mixte 0/Ligne/Passe", action: () => {
                           const bets = { "high": 7.5, "nums_13_14_15_16_17_18": 2.5, "0": 0.5 }; 
                           activePlateau === 1 ? setPlateau1Bets(bets) : setPlateau2Bets(bets);
                         }},
                         { name: "666 Strategy", proba: "89.2%", desc: "Presque toute la table", action: () => {
                           const bets: Record<string, number> = { "red": 18, "split_0_2": 2, "split_8_11": 2, "split_10_13": 2, "split_17_20": 2, "split_26_29": 2, "split_28_31": 2, "4": 1, "6": 1, "15": 1, "22": 1, "24": 1, "33": 1, "35": 1 };
                           activePlateau === 1 ? setPlateau1Bets(bets) : setPlateau2Bets(bets);
                         }},
                         { name: "Red Warrior", proba: "48.6%", desc: "Focus Rouge pur", action: () => {
                           const bets = { "red": 5 };
                           activePlateau === 1 ? setPlateau1Bets(bets) : setPlateau2Bets(bets);
                         }}
                       ].map(preset => (
                         <button key={preset.name} onClick={preset.action} className="bg-black/40 border-2 border-[#3f2b1d] p-4 rounded-2xl hover:border-[#d4af37] transition-all text-left flex flex-col gap-1 group">
                             <div className="flex justify-between items-center text-[#d4af37] font-black text-xs italic group-hover:scale-105 transition-transform">
                                <span>{preset.name}</span>
                                <span className="bg-[#d4af37] text-black px-1.5 py-0.5 rounded text-[8px] not-italic">{preset.proba}</span>
                             </div>
                             <div className="text-[10px] text-[#5c4033] font-bold uppercase truncate">{preset.desc}</div>
                         </button>
                       ))}
                    </div>
                  </div>
              </div>
            </section>

            {/* Simulation Dashboard */}
            {accounts.length > 0 && (
              <section className="bg-[#1b110a] border-4 border-[#3f2b1d] p-8 rounded-3xl shadow- inner relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                     <div className="bg-black/60 p-4 rounded-2xl border-2 border-[#d4af37]/20 flex flex-col items-center min-w-[80px]">
                        <span className="text-[8px] uppercase font-black opacity-40">Tour Actuel</span>
                        <span className="text-3xl font-black text-white">{currentSpinIdx}</span>
                     </div>
                     <div className="h-10 w-48 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                        <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-[#8b4513] to-[#d4af37]" />
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <div className="text-[10px] uppercase font-black text-emerald-500 opacity-60">Solde Total</div>
                        <div className="text-2xl font-black text-white">{stats.totalBalance.toFixed(2)}€</div>
                     </div>
                     <div className="text-right border-l-2 border-[#3f2b1d] pl-6">
                        <div className="text-[10px] uppercase font-black text-rose-500 opacity-60">Faillites</div>
                        <div className="text-2xl font-black text-white">{stats.bankruptCount}</div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {accounts.map(acc => (
                     <motion.div key={acc.id} className={`p-4 rounded-2xl border-2 transition-all ${acc.isBankrupt ? "bg-red-950/20 border-red-950 opacity-40 grayscale" : "bg-black/40 border-[#3f2b1d]"}`}>
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[8px] font-black uppercase text-[#8b4513]">ID #{acc.id} <span className="opacity-40">| B{acc.plateauType}</span></span>
                           {acc.isBankrupt && <AlertTriangle size={12} className="text-red-500" />}
                        </div>
                        <div className="text-lg font-black text-white mb-2">{acc.balance.toFixed(2)}€</div>
                        <div className="flex justify-between text-[8px] font-black uppercase opacity-60">
                           <span>Max: {acc.maxBalance.toFixed(0)}€</span>
                           <span>{acc.lastResult !== undefined ? `Res: ${acc.lastResult}` : ""}</span>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Global Stats */}
          <aside className="space-y-6">
             <div className="bg-[#f4e4bc] p-8 rounded-[2rem] border-[6px] border-[#3f2b1d] shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none mix-blend-multiply" />
                
                <div className="relative z-10 space-y-10">
                   <div className="border-b-2 border-[#3f2b1d]/20 pb-4">
                      <h3 className="text-2xl font-black italic text-[#3f2b1d] flex items-center gap-3"><History /> LIVRET DE BORD</h3>
                   </div>

                   <section className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#3f2b1d]/60 mb-4 divider">Statistiques de Simulation</h4>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl border border-[#3f2b1d]/10">
                            <span className="text-[10px] font-black uppercase text-[#8b4513]">Survie Moyenne</span>
                            <span className="text-xl font-black text-[#3f2b1d]">{avgBankruptcySpin} tours</span>
                         </div>
                         <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl border border-[#3f2b1d]/10">
                            <span className="text-[10px] font-black uppercase text-[#8b4513]">Profit Plateau #1</span>
                            <span className={`text-xl font-black ${plateau1Profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                               {plateau1Profit >= 0 ? "+" : ""}{plateau1Profit.toFixed(2)}€
                            </span>
                         </div>
                         <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl border border-[#3f2b1d]/10">
                            <span className="text-[10px] font-black uppercase text-[#8b4513]">Profit Plateau #2</span>
                            <span className={`text-xl font-black ${plateau2Profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                               {plateau2Profit >= 0 ? "+" : ""}{plateau2Profit.toFixed(2)}€
                            </span>
                         </div>
                      </div>
                   </section>

                   <section className="bg-red-800/5 p-6 rounded-2xl border-2 border-dashed border-red-800/10 mt-auto flex-1 flex flex-col min-h-0">
                      <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Crosshair size={14} /> Journal des Pertes
                      </h4>
                      <div className="space-y-2 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
                        {accounts.filter(a => a.isBankrupt).length === 0 ? (
                          <div className="text-[9px] text-[#3f2b1d]/40 italic">Aucun compte n'est tombé... pour l'instant.</div>
                        ) : (
                          accounts.filter(a => a.isBankrupt)
                            .sort((a, b) => (b.bankruptcySpin || 0) - (a.bankruptcySpin || 0))
                            .map(a => (
                              <div key={a.id} className="flex justify-between items-center bg-white/30 p-2 rounded border border-red-800/5">
                                <span className="text-[9px] font-black text-[#3f2b1d]">Compte #{a.id} <span className="opacity-40">({a.plateauType === 1 ? "P1" : "P2"})</span></span>
                                <span className="text-[9px] font-black text-rose-900">Spin {a.bankruptcySpin}</span>
                              </div>
                            ))
                        )}
                      </div>
                   </section>
                </div>

                <div className="mt-12 text-center">
                   <div className="inline-block px-4 py-1.5 bg-[#3f2b1d] text-[#f4e4bc] text-[9px] font-black uppercase tracking-widest rounded-full">
                      Saloon Intelligence v1.0
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
