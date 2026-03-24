"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const DOOR_STYLES = [
  { id: 1, type: "realistic", label: "OAK_ENTRY_01", color: "#1a0f0a", width: "w-full", height: "h-96" },
  { id: 2, type: "drawn", label: "SKETCH_GATE", color: "#111", width: "w-1/2", height: "h-80" },
  { id: 3, type: "futuristic", label: "HYDRAULIC_HATCH", color: "#1a1a1a", width: "w-1/2", height: "h-80" },
  { id: 4, type: "abandoned", label: "RUST_BARRIER", color: "#2a1a0a", width: "w-full", height: "h-[500px]" },
  { id: 5, type: "glass", label: "REFLECTIVE_VOID", color: "#000", width: "w-1/4", height: "h-72" },
  { id: 6, type: "cyber", label: "GLITCH_PORTAL", color: "#300", width: "w-1/4", height: "h-72" },
  { id: 7, type: "ancient", label: "STONE_BLOCK", color: "#222", width: "w-1/4", height: "h-72" },
  { id: 8, type: "minimal", label: "WHITE_SLIT", color: "#050505", width: "w-1/4", height: "h-72" },
  { id: 9, type: "flesh", label: "ORGANIC_VALVE", color: "#200", width: "w-1/2", height: "h-[450px]" },
  { id: 10, type: "shadow", label: "DARKNESS", color: "#000", width: "w-1/2", height: "h-[450px]" },
  { id: 11, type: "kids", label: "ENVY_KID", color: "#1a1a1a", width: "w-full", height: "h-96" },
  { id: 12, type: "gothic", label: "CATHEDRAL_NOIR", color: "#0a0a0a", width: "w-1/2", height: "h-[600px]" },
  { id: 13, type: "prison", label: "CELL_BLOCK_A", color: "#111", width: "w-1/2", height: "h-[600px]" },
];

export default function DoorsPage() {
  const [doorRows, setDoorRows] = useState<any[][]>([]);

  // Generate randomized rows of doors
  const generateRows = () => {
    const rows = [];
    let currentPool = [...DOOR_STYLES].sort(() => Math.random() - 0.5);
    
    while (currentPool.length > 0) {
      const rowSize = [1, 2, 4][Math.floor(Math.random() * 3)];
      const row = currentPool.splice(0, Math.min(rowSize, currentPool.length));
      rows.push(row);
    }
    return rows;
  };

  useEffect(() => {
    setDoorRows(generateRows());
    
    const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
            setDoorRows(prev => [...prev, ...generateRows()]);
        }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#020202] text-zinc-800 font-mono flex flex-col items-center">
      <div className="fixed top-0 left-0 w-full p-4 bg-black/95 backdrop-blur-xl z-50 border-b border-red-950/30 flex justify-between items-center shadow-[0_0_30px_rgba(0,0,0,1)]">
        <span className="text-[10px] tracking-[0.5em] uppercase text-red-900 animate-pulse">Infinite_Labyrinth // 0x3E1D90</span>
        <Link href="/" className="text-[10px] hover:text-red-600 transition-colors uppercase font-bold">[ Escape ]</Link>
      </div>

      <div className="w-full max-w-7xl pt-24 px-4 space-y-4">
        {doorRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-4 items-stretch">
            {row.map((door, doorIndex) => (
              <DoorFrame 
                key={`${rowIndex}-${doorIndex}-${door.id}`} 
                door={door} 
                flexBasis={row.length === 1 ? '100%' : row.length === 2 ? 'calc(50% - 8px)' : 'calc(25% - 12px)'}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="py-40 text-[10px] opacity-10 uppercase tracking-[1em]">
        The corridor never ends.
      </div>
    </main>
  );
}

function DoorFrame({ door, flexBasis }: { door: any; flexBasis: string }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (typeof window !== "undefined") {
        const audio = new Audio("https://actions.google.com/sounds/v1/science_fiction/glitch_short.ogg");
        audio.volume = 0.05;
        audio.play().catch(() => {});
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative cursor-crosshair overflow-hidden border border-zinc-900/50 hover:border-red-900/50 transition-colors duration-700 bg-zinc-950/20"
      style={{ flex: `1 1 ${flexBasis}`, minHeight: door.height.split('-')[1].includes('[') ? door.height.split('[')[1].split(']')[0] : '300px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Style Specific Wrapper */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        
        {/* Door Title (Vertical/Subtle) */}
        <div className="absolute top-4 left-4 text-[7px] rotate-90 origin-left opacity-20 group-hover:opacity-100 transition-opacity">
            {door.label}
        </div>

        {/* Visual Door Representation */}
        <div 
            className="w-full h-full relative border-2 border-zinc-900/80 group-hover:border-red-900/40 transition-all duration-1000 shadow-inner"
            style={{ backgroundColor: door.color }}
        >
            {/* Inner details based on type */}
            {door.type === "realistic" && (
                <div className="absolute inset-4 border-l-2 border-zinc-800/50 flex items-center justify-center">
                    <div className="w-1.5 h-12 bg-zinc-800 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                </div>
            )}
            
            {door.type === "futuristic" && (
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 w-full h-[1px] bg-zinc-800" />
                    <div className="absolute bottom-1/4 w-full h-[1px] bg-zinc-800" />
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-[1px] bg-zinc-800" />
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-900/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            )}

            {door.type === "kids" && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 grayscale group-hover:grayscale-0 transition-all">
                    <div className="border border-red-900 p-4 rotate-3 scale-75">
                         <div className="text-[10px] text-red-900 line-through">PORTES D&apos;ENFANT</div>
                         <div className="w-20 h-20 border-2 border-dashed border-red-900 mt-2 flex items-center justify-center">
                            💀
                         </div>
                    </div>
                </div>
            )}

            {door.type === "prison" && (
                <div className="absolute inset-0 flex">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-zinc-900/80" />
                    ))}
                    <div className="absolute inset-y-1/3 w-full border-y border-zinc-900/80 bg-zinc-900/10" />
                </div>
            )}

            {door.type === "ancient" && (
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="absolute inset-10 border border-zinc-700/30 rounded-t-full" />
                </div>
            )}

            {door.type === "cyber" && (
                <motion.div 
                    className="absolute inset-0"
                    animate={{ 
                        backgroundColor: ["rgba(40,0,0,0.2)", "rgba(10,0,0,0.4)", "rgba(40,0,0,0.2)"],
                        boxShadow: ["inset 0 0 20px rgba(255,0,0,0.1)", "inset 0 0 50px rgba(255,0,0,0.3)", "inset 0 0 20px rgba(255,0,0,0.1)"] 
                    }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                />
            )}

            {/* Reflection/Shadow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Hover Information */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 right-2 text-[6px] text-red-900 uppercase font-bold"
          >
            Access_Blocked_0x{door.id.toString(16).toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
