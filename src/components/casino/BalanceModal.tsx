"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { Coins, Trophy } from "lucide-react";

export function BalanceModal() {
  const { balance, setBalance } = useBalance();
  const [customAmount, setCustomAmount] = useState("");

  if (balance !== null) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a110a] border-4 border-[#d4af37] p-8 max-w-md w-full rounded-[2rem] shadow-[0_0_150px_rgba(212,175,55,0.4)] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="relative z-10">
          <Trophy className="mx-auto text-[#d4af37] mb-6" size={48} />
          <h2 className="text-3xl font-black mb-2 text-white italic uppercase tracking-tighter">
            CASINO CREDITS
          </h2>
          <p className="text-[#8b4513] mb-8 text-sm italic font-black uppercase tracking-widest opacity-60">
            Choose your starting balance
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[100, 500, 1000, 5000].map((num) => (
              <button 
                key={num} 
                onClick={() => setBalance(num)}
                className="py-4 bg-gradient-to-b from-[#3f2b1d] to-[#1b110a] border-2 border-[#d4af37]/30 rounded-xl font-black text-white hover:border-[#d4af37] hover:scale-105 transition-all shadow-xl"
              >
                {num}$
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <input 
              type="number"
              placeholder="Custom amount..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-black/50 border-2 border-[#3f2b1d] rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#d4af37] transition-colors"
            />
            {customAmount && (
              <button 
                onClick={() => setBalance(parseFloat(customAmount))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-black text-xs"
              >
                GO
              </button>
            )}
          </div>

          <div className="text-[10px] text-[#3f2b1d] uppercase tracking-[0.3em] font-black mt-4">
            Luck favors the bold.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
