"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Square, Settings2, Layout, Database, History, Coins, AlertTriangle, Crosshair, Users, RotateCcw, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { RouletteBoard } from "@/components/casino/RouletteBoard";

interface Account {
  id: number;
  balance: number;
  plateauIdx: number;
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
  const [simSpeed, setSimSpeed] = useState(1000); 
  
  const [plateaus, setPlateaus] = useState<Record<string, number>[]>([{}]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentChip, setCurrentChip] = useState(1);

  const [isRunning, setIsRunning] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentSpinIdx, setCurrentSpinIdx] = useState(0);

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
    setPlateaus(prev => {
      const next = [...prev];
      const currentBets = { ...next[activeIndex] };
      if (currentBets[id]) currentBets[id] += amount;
      else currentBets[id] = amount;
      next[activeIndex] = currentBets;
      return next;
    });
  };

  const addPlateau = () => {
    if (plateaus.length >= 10) return;
    setPlateaus(prev => [...prev, {}]);
    setActiveIndex(plateaus.length);
  };

  const removePlateau = (idx: number) => {
    if (plateaus.length <= 1) return;
    setPlateaus(prev => prev.filter((_, i) => i !== idx));
    if (activeIndex >= idx && activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const startFarm = () => {
    if (isRunning) return;

    const initialAccounts: Account[] = Array.from({ length: accountCount }, (_, i) => ({
      id: i + 1,
      balance: startingBalance,
      plateauIdx: i % plateaus.length,
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
        plateaus,
        delay: simSpeed
      }
    });
  };

  const stopFarm = () => {
    workerRef.current?.postMessage({ action: "stop" });
    setIsRunning(false);
  };

  const clearBets = () => {
    setPlateaus(prev => {
      const next = [...prev];
      next[activeIndex] = {};
      return next;
    });
  };

  const stats = accounts.reduce((acc, curr) => {
    acc.totalBalance += curr.balance;
    if (curr.isBankrupt) acc.bankruptCount++;
    if (curr.bankruptcySpin !== undefined) acc.totalBankruptcySpins += curr.bankruptcySpin;
    return acc;
  }, { totalBalance: 0, bankruptCount: 0, totalBankruptcySpins: 0 });

  const avgBankruptcySpin = stats.bankruptCount > 0 ? (stats.totalBankruptcySpins / stats.bankruptCount).toFixed(1) : "N/A";
  const winningCount = accounts.filter(a => a.balance > startingBalance).length;
  const losingCount = accounts.filter(a => a.balance < startingBalance).length;

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
               <button onClick={stopFarm} className="flex items-center gap-2 bg-red-950 border-2 border-red-500 px-6 py-3 rounded-xl font-black text-red-500 hover:bg-red-900 transition-all">
                 <Square fill="currentColor" size={16} /> ARRÊTER
               </button>
             ) : (
               <button onClick={startFarm} className="flex items-center gap-2 bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                 <Play fill="currentColor" size={16} /> LANCER LE FARM
               </button>
             )}
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            <section className="bg-[#1b110a] border-4 border-[#3f2b1d] p-6 rounded-3xl shadow-2xl relative">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#3f2b1d] p-2 rounded-lg"><Settings2 size={20} className="text-[#d4af37]" /></div>
                  <h2 className="text-xl font-black italic uppercase tracking-widest text-[#d4af37]">Configuration Générale</h2>
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Comptes</label>
                    <input type="number" value={accountCount} onChange={e => setAccountCount(parseInt(e.target.value))} className="bg-black/40 p-3 rounded-xl border border-white/5 text-white font-black w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Start (€)</label>
                    <input type="number" value={startingBalance} onChange={e => setStartingBalance(parseInt(e.target.value))} className="bg-black/40 p-3 rounded-xl border border-white/5 text-white font-black w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Tours</label>
                    <input type="number" value={totalSpinsTarget} onChange={e => setTotalSpinsTarget(parseInt(e.target.value))} className="bg-black/40 p-3 rounded-xl border border-white/5 text-white font-black w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Vitesse</label>
                    <select value={simSpeed} onChange={e => setSimSpeed(parseInt(e.target.value))} className="bg-black/40 p-3 rounded-xl border border-white/5 text-white font-black w-full outline-none">
                      <option value={2000}>Lent</option>
                      <option value={1000}>Standard</option>
                      <option value={500}>Rapide</option>
                      <option value={100}>Turbo</option>
                    </select>
                  </div>
               </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {plateaus.map((_, idx) => (
                  <div key={idx} className="flex items-center">
                    <button 
                      onClick={() => setActiveIndex(idx)} 
                      className={`px-6 py-3 rounded-t-2xl font-black italic transition-all border-x-4 border-t-4 ${activeIndex === idx ? "bg-[#3f2b1d] border-[#3f2b1d] text-[#d4af37]" : "bg-[#1b110a] border-transparent opacity-40"}`}
                    >
                      PLATEAU #{idx + 1}
                    </button>
                    {plateaus.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removePlateau(idx); }} className="bg-rose-950/40 p-2 rounded-full -ml-4 mb-2 z-20 hover:bg-rose-700 transition-colors text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addPlateau} className="px-4 py-3 rounded-t-2xl bg-[#1b110a] border-x-4 border-t-4 border-transparent hover:border-[#d4af37] text-[#d4af37] font-black italic flex items-center gap-2">
                  <Plus size={16} /> NOUVEAU
                </button>
              </div>
              
              <div className="bg-[#1b110a] border-4 border-[#3f2b1d] p-6 rounded-3xl rounded-tl-none shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] uppercase font-black tracking-widest text-[#8b4513]">Configuration Plateau #{activeIndex + 1}</div>
                    <button onClick={clearBets} className="text-[10px] font-black text-rose-900 hover:text-rose-500 uppercase italic flex items-center gap-2">
                       <Layout size={12} /> NETTOYER
                    </button>
                  </div>
                  
                  <RouletteBoard onPlaceBet={handlePlaceBet} activeBets={plateaus[activeIndex]} currentChip={currentChip} />
                  
                  <div className="mt-8 flex justify-center gap-4">
                    {[0.5, 1, 5, 10, 20].map(val => (
                      <button key={val} onClick={() => setCurrentChip(val)} className={`w-14 h-14 rounded-full border-4 border-dashed flex items-center justify-center font-black transition-all ${currentChip === val ? "scale-110 border-white bg-black" : "border-[#3f2b1d] opacity-40"}`}>{val}€</button>
                    ))}
                  </div>

                  <div className="mt-10 border-t-2 border-[#3f2b1d] pt-8">
                    <h3 className="text-sm font-black text-[#8b4513] uppercase mb-6 flex items-center gap-2 italic">
                       <Database size={16} /> Setups Préfait
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                         { name: "Romanovsky", proba: "86.5%", desc: "Couverture massive", action: () => {
                           const bets = { "doz1": 1.5, "doz2": 1.5, "corner_2_1_5_4": 0.5, "corner_33_32_36_35": 0.5 };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "James Bond", proba: "67.6%", desc: "Mixte 0/Ligne/Passe", action: () => {
                           const bets = { "high": 7.5, "nums_13_14_15_16_17_18": 2.5, "0": 0.5 }; 
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "666 Strategy", proba: "89.2%", desc: "Presque toute la table", action: () => {
                           const bets = { "red": 9, "split_0_2": 1, "split_8_11": 1, "split_10_13": 1, "split_17_20": 1, "split_26_29": 1, "split_28_31": 1, "4": 0.5, "6": 0.5, "15": 0.5, "22": 0.5, "24": 0.5, "33": 0.5, "35": 0.5 };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "Safety 32", proba: "86.5%", desc: "Le Grinder (+0.50€)", action: () => {
                           const bets = { "doz1": 1.5, "doz2": 1.5, "corner_26_25_29_28": 0.5, "corner_33_32_36_35": 0.5 };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "Snake Bet", proba: "32.4%", desc: "Le Serpent Rouge", action: () => {
                           const bets = { "1": 0.5, "5": 0.5, "9": 0.5, "12": 0.5, "14": 0.5, "16": 0.5, "19": 0.5, "23": 0.5, "27": 0.5, "30": 0.5, "32": 0.5, "34": 0.5 };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "Jackpot Cols", proba: "83.8%", desc: "Mises 1-3 + Pleins", action: () => {
                           const bets = { "col1": 4.5, "col3": 4.5, "0": 0.5, "5": 0.5, "11": 0.5, "17": 0.5, "23": 0.5, "29": 0.5, "35": 0.5 };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "Col Grinder", proba: "70.3%", desc: "Mixte Rouge/Col 2", action: () => {
                           const bets = { "red": 5, "col2": 5 };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }},
                         { name: "Setup Perso", proba: "81.1%", desc: "Le pattern d'Ethan", action: () => {
                           const bets = { 
                             "corner_2_1_5_4": 0.5, "corner_3_2_6_5": 0.5, 
                             "corner_8_7_11_10": 0.5, "corner_9_8_12_11": 0.5, 
                             "corner_14_13_17_16": 0.5, "corner_15_14_18_17": 0.5, 
                             "corner_26_25_29_28": 0.5, "corner_27_26_30_29": 0.5, 
                             "corner_33_32_36_35": 0.5, "col2": 0.5 
                           };
                           setPlateaus(p => { const n = [...p]; n[activeIndex] = bets; return n; });
                         }}
                       ].map(preset => (
                         <button key={preset.name} onClick={preset.action} className="bg-black/40 border-2 border-[#3f2b1d] p-3 rounded-xl hover:border-[#d4af37] transition-all text-left flex flex-col gap-1 group">
                             <div className="flex justify-between items-center text-[#d4af37] font-black text-[10px] italic group-hover:scale-105 transition-transform">
                                <span>{preset.name}</span>
                                <span className="bg-[#d4af37] text-black px-1.5 py-0.5 rounded text-[8px] not-italic">{preset.proba}</span>
                             </div>
                             <div className="text-[9px] text-[#5c4033] font-bold uppercase truncate">{preset.desc}</div>
                         </button>
                       ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-orange-950/40 to-red-950/40 border-2 border-red-900/30 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-150 transition-transform duration-1000"><Trophy size={80} /></div>
                       <div>
                          <h4 className="text-sm font-extrabold italic text-orange-500 uppercase tracking-tighter mb-1 flex items-center gap-2">
                             <Trophy size={16} /> CHALLENGE : PARCOURS DU COMBATTANT
                          </h4>
                          <p className="text-[9px] text-orange-900/60 font-bold uppercase tracking-widest leading-relaxed">
                             Progression auto (Rouge ➜ Doz 1/3 ➜ Col 1/3 ➜ Impair)<br/>
                             Objectif : Finir l'étape 4 pour un gain x7.
                          </p>
                       </div>
                       <button onClick={() => {
                         if (isRunning) return;
                         const initialAccounts: Account[] = Array.from({ length: accountCount }, (_, i) => ({
                           id: i + 1,
                           balance: startingBalance,
                           plateauIdx: 0,
                           maxBalance: startingBalance,
                           minBalance: startingBalance,
                           isBankrupt: false,
                           //@ts-ignore
                           strategyType: 'combattant',
                           currentStep: 1
                         }));
                         setAccounts(initialAccounts);
                         setIsRunning(true);
                         workerRef.current?.postMessage({
                           action: "start",
                           payload: { accounts: initialAccounts, totalSpins: totalSpinsTarget, plateaus: [{}], delay: simSpeed }
                         });
                       }} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:scale-105 transition-all uppercase italic">
                         Lancer Challenge
                       </button>
                    </div>
                  </div>
              </div>
            </section>

            {accounts.length > 0 && (
              <section className="bg-[#1b110a] border-4 border-[#3f2b1d] p-8 rounded-3xl relative">
                {/* ... */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {accounts.map(acc => (
                     <div key={acc.id} className={`p-4 rounded-2xl border-2 transition-all ${acc.isBankrupt ? "bg-red-950/20 border-red-950 opacity-40 grayscale" : "bg-black/40 border-[#3f2b1d]"}`}>
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[8px] font-black uppercase text-[#8b4513]">
                             #{acc.id} 
                             {/* @ts-ignore */}
                             {acc.strategyType === 'combattant' ? <span className="text-orange-500 ml-1">| ETAPE {acc.currentStep || 1}</span> : <span className="opacity-40 ml-1">| P{acc.plateauIdx + 1}</span>}
                           </span>
                        </div>
                        <div className="text-lg font-black text-white">{acc.balance.toFixed(2)}€</div>
                     </div>
                   ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
             <div className="bg-[#f4e4bc] p-8 rounded-[2rem] border-[6px] border-[#3f2b1d] shadow-2xl relative flex flex-col min-h-[600px]">
                <div className="relative z-10 space-y-10">
                   <h3 className="text-2xl font-black italic text-[#3f2b1d] flex items-center gap-3"><History /> LIVRET DE BORD</h3>
                   
                   <section className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#3f2b1d]/60 mb-2">Simulation</h4>
                      <div className="grid gap-3">
                         <div className="flex justify-between bg-white/40 p-4 rounded-xl border border-[#3f2b1d]/10">
                            <span className="text-[10px] font-black uppercase">Gagnants</span>
                            <span className="text-xl font-black text-emerald-700">{winningCount}</span>
                         </div>
                         <div className="flex justify-between bg-white/40 p-4 rounded-xl border border-[#3f2b1d]/10">
                            <span className="text-[10px] font-black uppercase">Perdants</span>
                            <span className="text-xl font-black text-rose-700">{losingCount}</span>
                         </div>
                         
                         {plateaus.map((_, idx) => {
                            const pAccounts = accounts.filter(a => a.plateauIdx === idx);
                            if (pAccounts.length === 0) return null;
                            const profit = pAccounts.reduce((sum, a) => sum + (a.balance - startingBalance), 0);
                            return (
                              <div key={idx} className="flex justify-between bg-[#3f2b1d]/5 p-3 rounded-lg border border-[#3f2b1d]/20">
                                <span className="text-[9px] font-black uppercase italic">Profit Plateau #{idx+1}</span>
                                <span className={`text-md font-black ${profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                  {profit >= 0 ? "+" : ""}{profit.toFixed(1)}€
                                </span>
                              </div>
                            );
                         })}
                      </div>
                   </section>

                   <section className="bg-red-800/5 p-6 rounded-2xl border-2 border-dashed border-red-800/10 flex-1 flex flex-col overflow-hidden">
                      <h4 className="text-[10px] font-black text-rose-900 uppercase mb-4 flex items-center gap-2"><Crosshair size={14} /> Journal des Pertes</h4>
                      <div className="space-y-1 overflow-y-auto pr-2 max-h-[250px] custom-scrollbar text-[9px] font-bold">
                        {accounts.filter(a => a.isBankrupt).sort((a,b) => (b.bankruptcySpin||0)-(a.bankruptcySpin||0)).map(a => (
                          <div key={a.id} className="flex justify-between p-2 hover:bg-red-900/10">
                            <span>#{a.id} (P{a.plateauIdx + 1})</span>
                            <span className="text-rose-800">Spin {a.bankruptcySpin}</span>
                          </div>
                        ))}
                      </div>
                   </section>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
