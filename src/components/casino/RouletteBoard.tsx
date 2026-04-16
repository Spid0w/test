"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface RouletteBoardProps {
  onPlaceBet: (type: string, value: number | string, amount: number) => void;
  activeBets: Record<string, number>;
  currentChip: number;
}

const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export function RouletteBoard({ onPlaceBet, activeBets, currentChip }: RouletteBoardProps) {
  const isRed = (num: number) => REDS.includes(num);

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-green-700 hover:bg-green-600";
    return isRed(num) ? "bg-red-800 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800";
  };

  // Helper to render a "cell" with chip count helper
  const renderCell = (label: string | number, id: string, className: string, colorClass: string) => {
    const betAmount = activeBets[id] || 0;
    return (
      <button
        key={id}
        onClick={() => onPlaceBet("single", id, currentChip)}
        className={`${className} ${colorClass} border border-gold/30 relative flex items-center justify-center transition-all group overflow-hidden`}
        style={{ borderColor: "rgba(212, 175, 55, 0.3)" }}
      >
        <span className="z-10 text-white font-bold">{label}</span>
        
        {/* Wood Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] pointer-events-none" />

        {/* Chip visual if bet exists */}
        {betAmount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-20 w-8 h-8 rounded-full bg-gold border-2 border-dashed border-white flex items-center justify-center shadow-lg"
          >
            <span className="text-[10px] text-black font-black">{betAmount}</span>
          </motion.div>
        )}

        {/* Hover highlight */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  };

  return (
    <div className="w-full bg-[#1b2b1b] p-4 rounded-xl border-4 border-[#3f2b1d] shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-2 ring-[#d4af37]/40">
      <div className="grid grid-cols-[auto_repeat(12,1fr)] grid-rows-3 gap-1 h-[250px]">
        {/* Zero */}
        <div className="row-span-3 col-start-1">
          {renderCell(0, "0", "h-full w-12 rounded-l-lg", getNumberColor(0))}
        </div>

        {/* Numbers 1-36 */}
        {Array.from({ length: 12 }).map((_, col) => (
          Array.from({ length: 3 }).map((_, row) => {
            const num = (col * 3) + (3 - row); // Logic to mirror standard board layout
            return renderCell(num, num.toString(), "h-full", getNumberColor(num));
          })
        ))}
      </div>

      {/* Outside Bets */}
      <div className="grid grid-cols-6 gap-1 mt-4 h-16">
        {renderCell("1-18", "low", "rounded-bl-lg col-span-1", "bg-zinc-800/80")}
        {renderCell("EVEN", "even", "col-span-1", "bg-zinc-800/80")}
        {renderCell("RED", "red", "col-span-1", "bg-red-900/40 text-red-500 font-black")}
        {renderCell("BLACK", "black", "col-span-1", "bg-black/60 text-zinc-400 font-black")}
        {renderCell("ODD", "odd", "col-span-1", "bg-zinc-800/80")}
        {renderCell("19-36", "high", "rounded-br-lg col-span-1", "bg-zinc-800/80")}
      </div>
      
      {/* 2 to 1 and Dozens could be added for extra detail */}
    </div>
  );
}
