"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface RouletteBoardProps {
  onPlaceBet: (type: string, id: string, amount: number) => void;
  activeBets: Record<string, number>;
  currentChip: number;
  isEraserMode?: boolean;
}

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export function RouletteBoard({ onPlaceBet, activeBets, currentChip, isEraserMode = false }: RouletteBoardProps) {
  const isRed = (num: number) => REDS.includes(num);

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-green-700 hover:bg-green-600";
    return isRed(num) ? "bg-red-800 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800";
  };

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
    <div className={`w-full bg-[#0a1a0a] p-4 rounded-xl border-4 border-[#3f2b1d] shadow-2xl relative select-none transition-all ${isEraserMode ? "cursor-crosshair ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(255,0,0,0.1)]" : "cursor-default"}`}>
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-1">
        
        {/* Main Grid Area */}
        <div className="flex h-[240px] md:h-[300px]">
          
          {/* Zero */}
          <div className="relative w-12 md:w-16 h-full mr-1">
             <button
               onClick={() => onPlaceBet("single", "0", currentChip)}
               className={`w-full h-full rounded-l-lg border border-gold/30 ${getNumberColor(0)} flex items-center justify-center font-bold text-lg relative group`}
             >
               0
               {renderChip("0")}
               <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
             </button>
          </div>

          {/* Numbers Grid */}
          <div className="flex-1 grid grid-cols-12 gap-1 relative h-full">
             {numberCols.map((col, colIdx) => (
               <div key={colIdx} className="flex flex-col gap-1">
                 {col.map((num, rowIdx) => (
                   <div key={num} className="relative flex-1">
                     <button
                       onClick={() => onPlaceBet("single", num.toString(), currentChip)}
                       className={`w-full h-full border border-gold/10 ${getNumberColor(num)} flex items-center justify-center font-bold text-sm md:text-base relative group`}
                     >
                       {num}
                       {renderChip(num.toString())}
                       <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
                     </button>

                     {/* Hitboxes for Duo / Carré */}
                     {colIdx < 11 && (
                       <button
                         onClick={(e) => { e.stopPropagation(); onPlaceBet("split", `split_${num}_${num+3}`, currentChip); }}
                         className={`absolute top-1/4 bottom-1/4 -right-1.5 w-3 z-30 flex items-center justify-center transition-all ${activeBets[`split_${num}_${num+3}`] ? "opacity-100" : (isEraserMode ? "" : "opacity-0 hover:opacity-100 hover:bg-gold/20")}`}
                       >
                         {renderChip(`split_${num}_${num+3}`)}
                         {isEraserMode && activeBets[`split_${num}_${num+3}`] && <div className="absolute inset-0 bg-red-500/20" />}
                       </button>
                     )}

                     {rowIdx < 2 && (
                       <button
                         onClick={(e) => { e.stopPropagation(); onPlaceBet("split", `split_${num}_${num-1}`, currentChip); }}
                         className={`absolute -bottom-1.5 left-1/4 right-1/4 h-3 z-30 flex items-center justify-center transition-all ${activeBets[`split_${num}_${num-1}`] ? "opacity-100" : (isEraserMode ? "" : "opacity-0 hover:opacity-100 hover:bg-gold/20")}`}
                       >
                         {renderChip(`split_${num}_${num-1}`)}
                         {isEraserMode && activeBets[`split_${num}_${num-1}`] && <div className="absolute inset-0 bg-red-500/20" />}
                       </button>
                     )}

                     {colIdx < 11 && rowIdx < 2 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPlaceBet("corner", `corner_${num}_${num-1}_${num+3}_${num+2}`, currentChip); }}
                          className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full z-40 flex items-center justify-center transition-all ${activeBets[`corner_${num}_${num-1}_${num+3}_${num+2}`] ? "opacity-100" : (isEraserMode ? "" : "opacity-0 hover:opacity-100 hover:bg-gold/40")}`}
                        >
                           {renderChip(`corner_${num}_${num-1}_${num+3}_${num+2}`)}
                           {isEraserMode && activeBets[`corner_${num}_${num-1}_${num+3}_${num+2}`] && <div className="absolute inset-0 bg-red-500/20 rounded-full" />}
                        </button>
                     )}
                   </div>
                 ))}
               </div>
             ))}
          </div>

          {/* Columns */}
          <div className="flex flex-col gap-1 w-10 md:w-16 ml-1">
             {["col3", "col2", "col1"].map((id, i) => (
               <button key={id} onClick={() => onPlaceBet("column", id, currentChip)} className={`flex-1 border border-gold/20 bg-zinc-800/60 text-[10px] md:text-xs font-black hover:bg-zinc-700 relative flex items-center justify-center group ${i === 0 ? "rounded-tr-lg" : i === 2 ? "rounded-br-lg" : ""}`}>
                 2:1 {renderChip(id)}
                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
               </button>
             ))}
          </div>
        </div>

        {/* Dozens */}
        <div className="flex gap-1 h-10 md:h-12 ml-14 md:ml-20">
           {["doz1", "doz2", "doz3"].map((id, i) => (
             <button key={id} onClick={() => onPlaceBet("dozen", id, currentChip)} className="flex-1 bg-zinc-900/40 border border-gold/20 text-xs font-bold hover:bg-zinc-800 relative flex items-center justify-center group">
                {i+1}ère 12 {renderChip(id)}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
             </button>
           ))}
           <div className="w-10 md:w-16" />
        </div>

        {/* Outside Bets */}
        <div className="flex gap-1 h-12 md:h-14 ml-14 md:ml-20 font-bold text-xs uppercase">
           <button onClick={() => onPlaceBet("half", "low", currentChip)} className="flex-1 bg-zinc-900/80 rounded-bl-lg border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center group">
             1-18 {renderChip("low")}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
           </button>
           <button onClick={() => onPlaceBet("half", "even", currentChip)} className="flex-1 bg-zinc-900/80 border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center group">
             Pair {renderChip("even")}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
           </button>
           <button onClick={() => onPlaceBet("half", "red", currentChip)} className="flex-1 bg-red-900/40 border border-gold/10 text-red-500 hover:bg-red-900/60 relative flex items-center justify-center group">
             Rouge {renderChip("red")}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/10"}`} />
           </button>
           <button onClick={() => onPlaceBet("half", "black", currentChip)} className="flex-1 bg-black/60 border border-gold/10 text-zinc-400 hover:bg-black relative flex items-center justify-center group">
             Noir {renderChip("black")}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
           </button>
           <button onClick={() => onPlaceBet("half", "odd", currentChip)} className="flex-1 bg-zinc-900/80 border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center group">
             Impair {renderChip("odd")}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
           </button>
           <button onClick={() => onPlaceBet("half", "high", currentChip)} className="flex-1 bg-zinc-900/80 rounded-br-lg border border-gold/10 hover:bg-zinc-800 relative flex items-center justify-center group">
             19-36 {renderChip("high")}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isEraserMode ? "bg-red-500/20" : "bg-white/5"}`} />
           </button>
           <div className="w-10 md:w-16" />
        </div>
      </div>
    </div>
  );
}
