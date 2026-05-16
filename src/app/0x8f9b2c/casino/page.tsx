"use client";

import { useState } from "react";
import { useBalance } from "@/context/BalanceContext";
import { BalanceModal } from "@/components/casino/BalanceModal";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard } from "@/components/casino/GameCard";
import { ArrowLeft, Coins, Trophy, User, Lock, X } from "lucide-react";
import Link from "next/link";

export default function CasinoHub() {
  const { balance, setBalance } = useBalance();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<"password" | "amount">("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [resetAmount, setResetAmount] = useState("");

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-gold-500 selection:text-black">
      {/* Premium Gradient Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1a1a1a,transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/0x8f9b2c" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-bold tracking-widest uppercase">Portal</span>
            </Link>
            
            <h1 className="text-2xl font-black tracking-tighter italic">
              POCO <span className="text-[#d4af37]">LOCO</span> <span className="text-zinc-600">CASINO</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-900/80 border border-white/5 px-4 py-2 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase leading-none">Balance</span>
                <span className="text-sm font-black text-[#d4af37]">{balance !== null ? balance.toFixed(2) : "0.00"} <span className="text-[10px]">$</span></span>
              </div>
              <button onClick={() => { setShowResetModal(true); setResetStep("password"); setPassword(""); setPasswordError(false); setResetAmount(""); }} className="ml-2 w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center hover:scale-110 transition-transform">
                <Coins className="w-4 h-4" />
              </button>
            </div>

            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-zinc-900 overflow-hidden">
               <User className="w-5 h-5 text-zinc-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Promo Section */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[300px] rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-zinc-900 to-black p-12 flex flex-col justify-center"
          >
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#d4af37]/10 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#d4af37]/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              <span className="inline-block px-3 py-1 bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded">
                Special Offer
              </span>
              <h2 className="text-5xl font-black italic tracking-tighter mb-4 leading-none uppercase">
                Bienvenue au <br /> <span className="text-[#d4af37]">High Roller</span> Club
              </h2>
              <p className="text-zinc-400 text-lg font-medium mb-8">
                Découvrez les jeux de casino les plus avancés avec un réalisme et des enjeux sans précédent.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-lg hover:scale-105 transition-transform">
                  Réclamer le Bonus
                </button>
                <div className="flex items-center gap-3 px-6 py-3 border border-white/10 rounded-lg text-zinc-400">
                   <Trophy className="w-5 h-5 text-[#d4af37]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Rang Global: #142</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Game Grid */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-[#d4af37]" />
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Jeux à l'Affiche</h3>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">Tous les Jeux</button>
              <button className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">Originaux</button>
              <button className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">Casino Live</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GameCard 
              title="Roulette Européenne"
              description="L'expérience classique à enjeux élevés. Pariez sur vos numéros chanceux."
              image="/casino/roulette.png"
              href="/0x8f9b2c/roulette"
              status="active"
              color="#d4af37"
            />
            <GameCard 
              title="Blackjack"
              description="Le jeu de table classique. Battez le croupier et atteignez 21."
              image="/casino/blackjack.png"
              href="/0x8f9b2c/casino/blackjack"
              status="new"
              color="#d4af37"
            />
            <GameCard 
              title="Chicken Road"
              description="Aidez le poussin à traverser les voies pour multiplier votre mise. Évitez le trafic !"
              image="/casino/chicken.png"
              href="/0x8f9b2c/casino/chicken"
              status="active"
              color="#ff4d4d"
            />
            <GameCard 
              title="Rocket Crash"
              description="Jusqu'où pouvez-vous aller ? Encaissez avant que la fusée n'explose."
              image="/casino/crash.png"
              href="/0x8f9b2c/casino/crash"
              status="active"
              color="#4dff4d"
            />
            <GameCard 
              title="Diamond Mines"
              description="Sélectionnez vos cases, puis lancez pour trouver des diamants."
              image="/casino/slots.png"
              href="/0x8f9b2c/casino/slots"
              status="active"
              color="#4da6ff"
            />
          </div>
        </div>
      </section>

      {/* Footer / Stats */}
      <footer className="relative z-10 border-t border-white/5 bg-black/80 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col gap-2">
             <div className="text-2xl font-black italic tracking-tighter">
                POCO <span className="text-[#d4af37]">LOCO</span>
             </div>
             <p className="text-[10px] text-zinc-600 uppercase tracking-widest">© 2026 UNPOCOLOCO NETWORK. All rights reserved.</p>
           </div>

           <div className="flex gap-12">
             <div className="flex flex-col gap-1">
               <span className="text-sm font-black text-white">1.4M+</span>
               <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Total Players</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-sm font-black text-white">$42.8M</span>
               <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Total Payouts</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-sm font-black text-white">24/7</span>
               <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Live Support</span>
             </div>
           </div>
        </div>
      </footer>

      {/* Reset Balance Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowResetModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full relative shadow-2xl"
            >
              <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>

              {resetStep === "password" ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-[#d4af37]" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Accès Restreint</h3>
                    <p className="text-xs text-zinc-500 mt-1">Entrez le mot de passe administrateur</p>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        if (password === "boulbix") setResetStep("amount");
                        else setPasswordError(true);
                      }
                    }}
                    placeholder="Mot de passe..."
                    className={`w-full bg-black/50 border-2 ${passwordError ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white font-bold text-center focus:outline-none focus:border-[#d4af37] transition-colors`}
                    autoFocus
                  />
                  {passwordError && <p className="text-red-500 text-xs font-bold">Mot de passe incorrect</p>}
                  <button
                    onClick={() => {
                      if (password === "boulbix") setResetStep("amount");
                      else setPasswordError(true);
                    }}
                    className="w-full py-3 bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Valider
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Coins className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Modifier la Balance</h3>
                    <p className="text-xs text-zinc-500 mt-1">Solde actuel : <span className="text-[#d4af37] font-black">{balance?.toFixed(2) ?? "0.00"}$</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {[100, 500, 1000, 5000].map(v => (
                      <button key={v} onClick={() => { setBalance(v); setShowResetModal(false); }} className="py-3 bg-black/40 border border-white/10 rounded-xl font-black text-white hover:border-[#d4af37] hover:scale-105 transition-all">
                        {v}$
                      </button>
                    ))}
                  </div>
                  <div className="flex w-full gap-2">
                    <input
                      type="number"
                      value={resetAmount}
                      onChange={e => setResetAmount(e.target.value)}
                      placeholder="Montant custom..."
                      className="flex-1 bg-black/50 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#d4af37] transition-colors"
                    />
                    {resetAmount && (
                      <button onClick={() => { setBalance(parseFloat(resetAmount)); setShowResetModal(false); }} className="px-6 py-3 bg-[#d4af37] text-black font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all">
                        OK
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
