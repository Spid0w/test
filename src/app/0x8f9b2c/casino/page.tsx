"use client";

import { useBalance } from "@/context/BalanceContext";
import { BalanceModal } from "@/components/casino/BalanceModal";
import { motion } from "framer-motion";
import { GameCard } from "@/components/casino/GameCard";
import { ArrowLeft, Coins, Trophy, User } from "lucide-react";
import Link from "next/link";

export default function CasinoHub() {
  const { balance } = useBalance();

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-gold-500 selection:text-black">
      <BalanceModal />
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
              <button className="ml-2 w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center hover:scale-110 transition-transform">
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
                Welcome to the <br /> <span className="text-[#d4af37]">High Roller</span> Club
              </h2>
              <p className="text-zinc-400 text-lg font-medium mb-8">
                Experience the most advanced casino games with unprecedented realism and stakes.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-lg hover:scale-105 transition-transform">
                  Claim Bonus
                </button>
                <div className="flex items-center gap-3 px-6 py-3 border border-white/10 rounded-lg text-zinc-400">
                   <Trophy className="w-5 h-5 text-[#d4af37]" />
                   <span className="text-xs font-bold uppercase tracking-widest">Global Rank: #142</span>
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
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Featured Games</h3>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">All Games</button>
              <button className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">Originals</button>
              <button className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">Live Casino</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GameCard 
              title="European Roulette"
              description="The classic high-stakes experience. Bet on your lucky numbers and win big."
              image="/casino/roulette.png"
              href="/0x8f9b2c/roulette"
              status="active"
              color="#d4af37"
            />
            <GameCard 
              title="Chicken Road"
              description="Help the chicken cross the lanes to multiply your bet. Avoid the traffic!"
              image="/casino/chicken.png"
              href="/0x8f9b2c/casino/chicken"
              status="active"
              color="#ff4d4d"
            />
            <GameCard 
              title="Rocket Crash"
              description="How high can you go? Cash out before the rocket explodes in this intense game."
              image="/casino/crash.png"
              href="/0x8f9b2c/casino/crash"
              status="active"
              color="#4dff4d"
            />
            <GameCard 
              title="Diamond Mines"
              description="Select your tiles first, then launch to find diamonds. Features Auto-Farm mode."
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
    </main>
  );
}
