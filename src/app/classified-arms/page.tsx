"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { GlitchText } from "@/components/glitch/GlitchText";
import { ShieldAlert, Terminal as TerminalIcon, Radio, Activity } from "lucide-react";

const WEAPONS = [
  { id: "W1", name: "Glock 19 Gen5 - Ghost Spec", category: "FIREARM", price: "0.15 ₿TC", stock: 12, desc: "Serial numbers physically removed and acid-etched. Polymer frame matches zero databases.", locked: false },
  { id: "W2", name: "C4 Plastic Explosive (1kg)", category: "EXPLOSIVE", price: "0.4 ₿TC", stock: 3, desc: "Military grade. Detonators sold separately. Stable between -50°C and 70°C.", locked: false },
  { id: "W3", name: "Neuro-Disruptor (Illegal Prototype)", category: "EXPERIMENTAL", price: "2.5 ₿TC", stock: 1, desc: "Non-lethal high-frequency pulse. Permanent cognitive damage possible. Use with caution.", locked: false },
  { id: "W4", name: "H&K MP5 Submachine Gun", category: "FIREARM", price: "0.8 ₿TC", stock: 5, desc: "Suppressed. Includes 3 loaded magazines. Cold-drop delivery only.", locked: false },
  { id: "W5", name: "VX Nerve Agent (Small Dose)", category: "CHEMICAL", price: "4.8 ₿TC", stock: 1, desc: "Colorless, odorless, tasteless. One drop is fatal. Handling gear mandatory.", locked: false },
  { id: "W6", name: "Experimental Bio-Hacking Kit", category: "GENETIC", price: "1.2 ₿TC", stock: 4, desc: "CRISPR-based DNA modification tools. No safety protocols included.", locked: false },
  { id: "W7", name: "Unregistered AR-15 (Full Auto)", category: "FIREARM", price: "0.3 ₿TC", stock: 8, desc: "Modified sear for continuous fire. 30-round mag included.", locked: false },
  { id: "W8", name: "Human Heart (Cryo-Preserved)", category: "ORGAN", price: "12.0 ₿TC", stock: 1, desc: "Type O-. Freshly harvested. 48h remaining on the cooling unit.", locked: false },
];

export default function BlackMarketPage() {
  const [glitchId, setGlitchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const statusMsgs = [
      "ESTABLISHING SECURE P2P TUNNEL...",
      "BYPASSING INTERPOL WATCHLISTS...",
      "NODE CONNECTED: TOR_RELAY_0x4F1",
      "ENCRYPTION: AES-256-GCM ACTIVE",
      "IDENTITY MASKED // LOCATION OBFUSCATED",
      "ESCROW SERVICE: ENABLED",
      "WELCOME TO THE DEEP SYNDICATE."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < statusMsgs.length) {
        setMessages(prev => [...prev, statusMsgs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleBuy = (id: string) => {
    setGlitchId(id);
    setTimeout(() => setGlitchId(null), 1500);
  };

  return (
    <main className="min-h-screen bg-black text-red-700 font-mono flex flex-col items-center overflow-x-hidden relative">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Flickering Red Glow */}
      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05, 0.1, 0.05] }}
        transition={{ repeat: Infinity, duration: 0.2 }}
        className="fixed inset-0 bg-red-900 pointer-events-none mix-blend-color-dodge z-0"
      />

      {/* Cyber Noise */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0 contrast-150 brightness-150" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      <div className="w-full max-w-6xl px-4 py-12 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar: Status & Info */}
        <div className="w-full md:w-64 space-y-6">
          <div className="border border-red-900 bg-black/80 p-4 space-y-4">
            <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold border-b border-red-950 pb-2">
              <TerminalIcon size={14} />
              <span>TERMINAL STATUS</span>
            </div>
            <div ref={scrollRef} className="h-48 overflow-y-auto space-y-1 text-[9px] text-red-900 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                  <span>{m}</span>
                </div>
              ))}
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="inline-block w-1.5 h-3 bg-red-700 ml-1 translate-y-0.5" />
            </div>
          </div>

          <div className="border border-red-900 bg-black/80 p-4 space-y-3">
             <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold border-b border-red-950 pb-2 uppercase">
              <Activity size={14} />
              <span>Network Health</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px]">
                <span className="text-red-950">LATENCY</span>
                <span className="text-green-900">42ms</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-red-950">NODES</span>
                <span className="text-red-700">6 ACTIVE</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-red-950">THREAT LVR</span>
                <span className="text-yellow-700 animate-pulse">LOW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: The Market */}
        <div className="flex-1">
          <header className="mb-12 border-b border-red-900/40 pb-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-red-600 tracking-tighter filter drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
              <GlitchText>THE DEEP SYNDICATE</GlitchText>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-[9px] text-red-900 uppercase tracking-widest">
              <span className="flex items-center gap-1"><ShieldAlert size={10} /> TOR_NODE: 184.22.1.92</span>
              <span className="flex items-center gap-1"><Radio size={10} className="animate-ping" /> SIGNAL: STRONG</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WEAPONS.map((item) => (
              <motion.div 
                key={item.id} 
                whileHover={{ scale: 1.01 }}
                className={`border border-red-900/30 bg-[#070000] p-5 relative overflow-hidden group transition-all duration-300 ${item.id === "W8" ? "border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]" : "hover:border-red-700/60"}`}
              >
                <div className="absolute top-0 right-0 p-1.5 text-[7px] bg-red-900/20 text-red-500 font-bold border-b border-l border-red-900/40 uppercase">
                  {item.category}
                </div>
                
                <h3 className="text-sm font-bold text-red-500 mb-1 flex items-center gap-2">
                  {glitchId === item.id ? <GlitchText>ACCESS_DENIED</GlitchText> : item.name}
                  {item.id === "W3" && <span className="text-[8px] bg-red-900 text-black px-1 animate-pulse">PROTOTYPE</span>}
                </h3>
                
                <p className="text-[9px] text-red-950 mb-6 h-8 overflow-hidden leading-tight">
                  {item.desc}
                </p>
                
                <div className="flex justify-between items-end border-t border-red-900/20 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-red-600">{item.price}</span>
                    <span className="text-[8px] text-red-950 uppercase">{item.stock > 0 ? `${item.stock} available` : 'OUT OF STOCK'}</span>
                  </div>
                  
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={item.stock === 0 || item.locked}
                    className="px-4 py-1.5 border border-red-900 text-[9px] uppercase font-bold text-red-600 hover:bg-red-900 hover:text-black transition-all disabled:opacity-20 disabled:grayscale"
                  >
                    {glitchId === item.id ? "ERROR" : "[ ACQUIRE ]"}
                  </button>
                </div>

                {/* Decorative corner */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-900/10 rotate-45 transform pointer-events-none" />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 hover:opacity-100 transition-opacity duration-700">
            <div className="text-[7px] text-red-950 uppercase tracking-tighter max-w-xs text-center md:text-left">
              WARNING: YOUR PGP KEY HAS BEEN RECORDED. DISCONNECTING WITHOUT PROPER CLEARANCE MAY RESULT IN DATA LEAKAGE TO THIRD PARTY ENTITIES.
            </div>
            <Link href="/" className="text-[10px] text-red-900 hover:text-red-100 transition-colors uppercase tracking-[0.4em] border border-red-900/50 px-10 py-3 bg-red-950/10 hover:bg-black">
               [ SHUTDOWN & EXIT ]
            </Link>
          </div>
        </div>
      </div>

      {/* Footer watermark */}
      <div className="fixed bottom-2 right-2 text-[8px] text-red-950/20 pointer-events-none tracking-widest">
        SYNDICATE_ENCRYPTION_v4.2.0 // NO_LOGS_POLICY
      </div>
    </main>
  );
}
