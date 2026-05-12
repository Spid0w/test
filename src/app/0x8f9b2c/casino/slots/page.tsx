"use client";

import { SlotMachine } from "@/components/casino/SlotMachine";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function SlotsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#d4af37] selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a10,transparent)] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/0x8f9b2c/casino" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-bold tracking-widest uppercase">Lobby</span>
            </Link>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase">
              Crystal <span className="text-[#d4af37]">Slots</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">Balance</div>
                <div className="text-sm font-black text-[#d4af37]">1,250.00 $</div>
             </div>
             <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-zinc-900">
                <User className="w-5 h-5 text-zinc-500" />
             </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
           <SlotMachine />
        </div>
      </section>

      {/* Info Section */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900/30 rounded-2xl p-8 border border-white/5">
           <h2 className="text-lg font-black uppercase italic tracking-tighter mb-4 text-[#d4af37]">Pure Luck</h2>
           <p className="text-zinc-400 text-sm leading-relaxed mb-4">
             Experience the classic thrill of the slots with our premium Crystal Machine. 
             Line up three matching symbols to trigger massive payouts. 
             Each symbol has its own value, with the Golden Crystal being the ultimate prize. 
             Our slot machine uses a cryptographically secure random number generator to ensure every spin is 100% fair.
           </p>
           <div className="flex gap-8 mt-8">
              <div>
                 <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Jackpot</div>
                 <div className="text-sm font-black">100x</div>
              </div>
              <div>
                 <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Type</div>
                 <div className="text-sm font-black">3-Reel Classic</div>
              </div>
           </div>
        </div>
      </section>
    </main>
  );
}
