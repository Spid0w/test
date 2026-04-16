"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface RouletteBoardProps {
  onPlaceBet: (type: string, id: string, amount: number) => void;
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

  // Generate numbers grid: [ [3,2,1], [6,5,4], ... ]
  const numberCols = useMemo(() => {
    return Array.from({ length: 12 }, (_, col) => {
      return [ (col * 3) + 3, (col * 3) + 2, (col * 3) + 1 ];
    });
  }, []);

  const renderChip = (id: string) => {
    const amount = activeBets[id] || 0;
    if (amount === 0) return null;
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute z-50 w-6 h-6 rounded-full bg-[#d4af37] border-2 border-dashed border-white flex items-center justify-center shadow-lg pointer-events-none"
      >
        <span className="text-[9px] text-black font-black">{amount}</span>
      </motion.div>
    );
  };

  return (
    <div className="w-full bg-[#0a1a0a] p-4 rounded-xl border-4 border-[#3f2b1d] shadow-2xl relative select-none">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-1">
        
        {/* Main Grid Area (0 + Numbers + Columns) */}
        <div className="flex h-[240px] md:h-[300px]">
          
          {/* Zero (Zéro) */}
          <div className="relative w-12 md:w-16 h-full mr-1">
             <button
               onClick={() => onPlaceBet("single", "0", currentChip)}
               className={`w-full h-full rounded-l-lg border border-gold/30 ${getNumberColor(0)} flex items-center justify-center font-bold text-lg`}
             >
               0
               {renderChip("0")}
             </button>
          </div>

          {/* Numbers Grid */}
          <div className="flex-1 grid grid-cols-12 gap-1 relative h-full">
             {numberCols.map((col, colIdx) => (
               <div key={colIdx} className="flex flex-col gap-1">
                 {col.map((num, rowIdx) => (
                   <div key={num} className="relative flex-1">
                     {/* Number Cell */}
                     <button
                       onClick={() => onPlaceBet("single", num.toString(), currentChip)}
                       className={`w-full h-full border border-gold/10 ${getNumberColor(num)} flex items-center justify-center font-bold text-sm md:text-base relative group`}
                     >
                       {num}
                       {renderChip(num.toString())}
                       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>

                     {/* -- HITBOXES FOR DUO/CARRÉ -- */}
                     
                     {/* Split Horizontal */}
                     {colIdx < 11 && (
                       <button
                         onClick={(e) => { e.stopPropagation(); onPlaceBet("split", `split_${num}_${num+3}`, currentChip); }}
                         className={`absolute top-1/4 bottom-1/4 -right-1.5 w-3 z-30 flex items-center justify-center transition-all ${activeBets[`split_${num}_${num+3}`] ? "opacity-100" : "opacity-0 hover:opacity-100 hover:bg-gold/20"}`}
                         title={`Duo ${num}/${num+3}`}
                       >
                         {renderChip(`split_${num}_${num+3}`)}
                       </button>
                     )}

                     {/* Split Vertical */}
                     {rowIdx < 2 && (
                       <button
                         onClick={(e) => { e.stopPropagation(); onPlaceBet("split", `split_${num}_${num-1}`, currentChip); }}
                         className={`absolute -bottom-1.5 left-1/4 right-1/4 h-3 z-30 flex items-center justify-center transition-all ${activeBets[`split_${num}_${num-1}`] ? "opacity-100" : "opacity-0 hover:opacity-100 hover:bg-gold/20"}`}
                         title={`Duo ${num}/${num-1}`}
                       >
                         {renderChip(`split_${num}_${num-1}`)}
                       </button>
                     )}

                     {/* Corner (Carré) */}
                     {colIdx < 11 && rowIdx < 2 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPlaceBet("corner", `corner_${num}_${num-1}_${num+3}_${num+2}`, currentChip); }}
                          className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full z-40 flex items-center justify-center transition-all ${activeBets[`corner_${num}_${num-1}_${num+3}_${num+2}`] ? "opacity-100" : "opacity-0 hover:opacity-100 hover:bg-gold/40"}`}
                          title={`Carré ${num}/${num-1}/${num+2}/${num+3}`}
                        >
                           {renderChip(`corner_${num}_${num-1}_${num+3}_${num+2}`)}
                        </button>
                     )}
                   </div>
                 ))}
               </div>
             ))}
          </div>

          {/* Columns (2 to 1) */}
          <div className="flex flex-col gap-1 w-10 md:w-16 ml-1">
             <button onClick={() => onPlaceBet("column", "col3", currentChip)} className="flex-1 rounded-tr-lg border border-gold/20 bg-zinc-800/60 text-[10px] md:text-xs font-black hover:bg-zinc-700 relative flex items-center justify-center">
               2:1 {renderChip("col3")}
             </button>
             <button onClick={() => onPlaceBet("column", "col2", currentChip)} className="flex-1 border border-gold/20 bg-zinc-800/60 text-[10px] md:text-xs font-black hover:bg-zinc-700 relative flex items-center justify-center">
               2:1 {renderChip("col2")}
             </button>
             <button onClick={() => onPlaceBet("column", "col1", currentChip)} className="flex-1 rounded-br-lg border border-gold/20 bg-zinc-800/60 text-[10px] md:text-xs font-black hover:bg-zinc-700 relative flex items-center justify-center">
               2:1 {renderChip("col1")}
             </button>
          </div>
        </div>

        {/* Dozens (Douzaines) */}
        <div className="flex gap-1 h-10 md:h-12 ml-14 md:ml-20">
           {["doz1", "doz2", "doz3"].map((id, i) => (
             <button key={id} onClick={() => onPlaceBet("dozen", id, currentChip)} className="flex-1 bg-zinc-900/40 border border-gold/20 text-xs font-bold hover:bg-zinc-800 relative flex items-center justify-center">
                {i+1}ère 12 {renderChip(id)}
             </button>
           ))}
           <div className="w-10 md:w-16" /> {/* Spacer for columns column */}
        </div>

        {/* Outside Bets (Simple chances) */}
        <div className="flex gap-1 h-12 md:h-14 ml-14 md:ml-20 font-bold text-xs uppercase">
           <button onClick={() => onPlaceBet("half", "low", currentChip)} className="flex-1 bg-zinc-900/80 rounded-bl-lg border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center">
             1-18 {renderChip("low")}
           </button>
           <button onClick={() => onPlaceBet("half", "even", currentChip)} className="flex-1 bg-zinc-900/80 border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center">
             Pair {renderChip("even")}
           </button>
           <button onClick={() => onPlaceBet("half", "red", currentChip)} className="flex-1 bg-red-900/40 border border-gold/10 text-red-500 hover:bg-red-900/60 relative flex items-center justify-center">
             Rouge {renderChip("red")}
           </button>
           <button onClick={() => onPlaceBet("half", "black", currentChip)} className="flex-1 bg-black/60 border border-gold/10 text-zinc-400 hover:bg-black relative flex items-center justify-center">
             Noir {renderChip("black")}
           </button>
           <button onClick={() => onPlaceBet("half", "odd", currentChip)} className="flex-1 bg-zinc-900/80 border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center">
             Impair {renderChip("odd")}
           </button>
           <button onClick={() => onPlaceBet("half", "high", currentChip)} className="flex-1 bg-zinc-900/80 rounded-br-lg border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center">
             19-36 {renderChip("high")}
           </button>
           <div className="w-10 md:w-16" /> {/* Spacer */}
        </div>
      </div>
    </div>
  );
}
