"use client";

import { motion } from "framer-motion";

interface RouletteBoardProps {
  onPlaceBet: (type: string, value: number | string, amount: number) => void;
  activeBets: Record<string, number>;
  currentChip: number;
}

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export function RouletteBoard({ onPlaceBet, activeBets, currentChip }: RouletteBoardProps) {
  const isRed = (num: number) => REDS.includes(num);

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-green-700 hover:bg-green-600";
    return isRed(num) ? "bg-red-800 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800";
  };

  const renderCell = (label: string | number, id: string, className: string, colorClass: string, type: string = "single") => {
    const betAmount = activeBets[id] || 0;
    return (
      <button
        key={id}
        onClick={() => onPlaceBet(type, id, currentChip)}
        className={`${className} ${colorClass} border border-gold/20 relative flex items-center justify-center transition-all group select-none`}
        style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}
      >
        <span className="z-10 text-white font-bold text-sm md:text-base">{label}</span>
        
        {betAmount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-20 w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#d4af37] border-2 border-dashed border-white flex items-center justify-center shadow-lg"
          >
            <span className="text-[9px] md:text-[10px] text-black font-black">{betAmount}</span>
          </motion.div>
        )}

        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  };

  return (
    <div className="w-full bg-[#0a1a0a] p-2 md:p-4 rounded-xl border-4 border-[#3f2b1d] shadow-2xl relative overflow-hidden">
      {/* Felt Texture Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-[auto_repeat(12,1fr)_auto] grid-rows-[repeat(3,1fr)_40px_50px] gap-1 md:h-[350px]">
        
        {/* Zéro */}
        <div className="row-span-3 col-start-1">
          {renderCell(0, "0", "h-full w-10 md:w-14 rounded-l-lg", getNumberColor(0))}
        </div>

        {/* Numbers 1-36 grid */}
        {Array.from({ length: 12 }).map((_, col) => (
          Array.from({ length: 3 }).map((_, row) => {
            // Standard Casino layout: 3, 6, 9... top row. 1, 4, 7... bottom row.
            const num = (col * 3) + (3 - row);
            return renderCell(num, num.toString(), "h-full min-h-[40px]", getNumberColor(num));
          })
        ))}

        {/* 2 to 1 (Columns) */}
        <div className="flex flex-col gap-1 h-full">
           {renderCell("2:1", "col3", "flex-1 w-10 md:w-16 rounded-tr-lg", "bg-zinc-800/40 text-[10px] md:text-xs", "column")}
           {renderCell("2:1", "col2", "flex-1 w-10 md:w-16", "bg-zinc-800/40 text-[10px] md:text-xs", "column")}
           {renderCell("2:1", "col1", "flex-1 w-10 md:w-16 rounded-br-lg", "bg-zinc-800/40 text-[10px] md:text-xs", "column")}
        </div>

        {/* Dozens (Douzaines) */}
        <div className="col-start-2 col-span-4 row-start-4">
           {renderCell("1ère 12", "doz1", "h-full w-full", "bg-zinc-900/60 text-xs", "dozen")}
        </div>
        <div className="col-start-6 col-span-4 row-start-4">
           {renderCell("2ème 12", "doz2", "h-full w-full", "bg-zinc-900/60 text-xs", "dozen")}
        </div>
        <div className="col-start-10 col-span-4 row-start-4">
           {renderCell("3ème 12", "doz3", "h-full w-full", "bg-zinc-900/60 text-xs", "dozen")}
        </div>

        {/* Outside Bets (Demis/Chances simples) */}
        <div className="col-start-2 col-span-2 row-start-5">
           {renderCell("1-18", "low", "h-full w-full rounded-bl-lg", "bg-zinc-900/80 text-xs", "half")}
        </div>
        <div className="col-start-4 col-span-2 row-start-5">
           {renderCell("PAIR", "even", "h-full w-full", "bg-zinc-900/80 text-xs", "half")}
        </div>
        <div className="col-start-6 col-span-2 row-start-5">
           {renderCell("ROUGE", "red", "h-full w-full", "bg-red-900/40 text-red-500 font-black text-xs", "half")}
        </div>
        <div className="col-start-8 col-span-2 row-start-5">
           {renderCell("NOIR", "black", "h-full w-full", "bg-black/60 text-zinc-400 font-black text-xs", "half")}
        </div>
        <div className="col-start-10 col-span-2 row-start-5">
           {renderCell("IMPAIR", "odd", "h-full w-full", "bg-zinc-900/80 text-xs", "half")}
        </div>
        <div className="col-start-12 col-span-2 row-start-5">
           {renderCell("19-36", "high", "h-full w-full rounded-br-lg", "bg-zinc-900/80 text-xs", "half")}
        </div>
      </div>
    </div>
  );
}
