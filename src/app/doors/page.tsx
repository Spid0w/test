"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

const DOOR_STYLES = [
  { id: 1, type: "realistic", label: "OAK_ENTRY_01", color: "#4a3728" },
  { id: 2, type: "drawn", label: "SKETCH_GATE", color: "#111" },
  { id: 3, type: "futuristic", label: "HYDRAULIC_HATCH", color: "#222" },
  { id: 4, type: "abandoned", label: "RUST_BARRIER", color: "#3a3a3a" },
  { id: 5, type: "glass", label: "REFLECTIVE_VOID", color: "#0a0a0a" },
  { id: 6, type: "cyber", label: "GLITCH_PORTAL", color: "#ff0000" },
  { id: 7, type: "ancient", label: "STONE_BLOCK", color: "#2a2a2a" },
  { id: 8, type: "minimal", label: "WHITE_SLIT", color: "#fff" },
  { id: 9, type: "flesh", label: "ORGANIC_VALVE", color: "#500" },
  { id: 10, type: "shadow", label: "DARKNESS", color: "#000" },
];

export default function DoorsPage() {
  const [doors, setDoors] = useState(DOOR_STYLES);

  // Extend doors to make it feel almost infinite
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setDoors(prev => [...prev, ...DOOR_STYLES.map(d => ({ ...d, id: Math.random() }))]);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-600 font-mono flex flex-col items-center py-20">
      <div className="fixed top-0 left-0 w-full p-4 bg-black/80 backdrop-blur-md z-50 border-b border-zinc-900 flex justify-between items-center">
        <span className="text-[10px] tracking-[0.5em] uppercase">Infinite Corridor // Node: 0x99AA</span>
        <Link href="/" className="text-[10px] hover:text-white transition-colors">[ BACK ]</Link>
      </div>

      <div className="space-y-40 w-full max-w-lg flex flex-col items-center">
        {doors.map((door, i) => (
          <DoorFrame key={door.id} door={door} index={i} />
        ))}
      </div>

      <div className="mt-40 text-[10px] opacity-20 italic">Keep walking.</div>
    </main>
  );
}

function DoorFrame({ door, index }: { door: any; index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="flex flex-col items-center group cursor-pointer"
      onClick={() => {
        // Trigger a glitch sound or effect
        if (typeof window !== "undefined") {
            const audio = new Audio("https://actions.google.com/sounds/v1/science_fiction/glitch_short.ogg");
            audio.volume = 0.1;
            audio.play().catch(() => {});
        }
      }}
    >
      <div className="text-[8px] mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
        {door.label} // SECTOR_{Math.floor(index / 10)}
      </div>

      <div 
        className="w-48 h-72 border-4 border-zinc-900 group-hover:border-zinc-500 transition-all duration-500 relative overflow-hidden"
        style={{ backgroundColor: door.color + "22" }}
      >
        {/* Door specifics based on type */}
        {door.type === "realistic" && (
            <div className="absolute inset-4 border-2 border-zinc-800 flex items-center justify-end pr-4">
                <div className="w-4 h-4 rounded-full bg-yellow-900/50" />
            </div>
        )}
        {door.type === "futuristic" && (
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 border-b border-zinc-800" />
                <div className="flex-1" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-900/30 shadow-[0_0_10px_cyan]" />
            </div>
        )}
        {door.type === "drawn" && (
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #222 10px, #222 11px)' }} />
        )}
        {door.type === "cyber" && (
            <motion.div 
                className="absolute inset-0 bg-red-600/10"
                animate={{ opacity: [0.1, 0.5, 0.1] }}
                transition={{ duration: 0.1, repeat: Infinity }}
            />
        )}
        
        {/* Shadow for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40" />
      </div>

      <div className="mt-8 w-32 h-[1px] bg-zinc-900 group-hover:w-48 transition-all" />
    </motion.div>
  );
}
