"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/glitch/GlitchText";
import Link from "next/link";
import { Key, Database, Globe, ShieldCheck } from "lucide-react";

const PASSWORDS = [
  { key: "casino", redirect: "https://snatchcasino.com", type: "EXTERNAL" },
  { key: "zevann", redirect: "https://mega-hub-seven.vercel.app/dashboard", type: "EXTERNAL" },
  { key: "observer", redirect: "/you-found-me", type: "INTERNAL" },
  { key: "void", redirect: "/void", type: "INTERNAL" },
  { key: "glitch", redirect: "/glitch", type: "INTERNAL" },
  { key: "unknown", redirect: "/unknown", type: "INTERNAL" },
  { key: "weapons / darknet", redirect: "/0x2d7f1a", type: "INTERNAL (BLACK MARKET)" },
  { key: "boulbix", redirect: "/0x0d1f2e", type: "ADMIN (CURRENT)" },
];

export default function AdminPortalPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-zinc-500 font-mono flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-3xl space-y-12">
        <header className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-300 tracking-[0.3em] mb-2 uppercase">
              <GlitchText>CENTRAL_INDEX</GlitchText>
            </h1>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest flex items-center gap-2">
              <Database size={12} /> System Master Directory // Read-Only
            </p>
          </div>
          <div className="text-[9px] text-zinc-800 bg-zinc-900/30 px-3 py-1 border border-zinc-900/50">
             ROOT@VOID_SERVER_01
          </div>
        </header>

        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] text-zinc-800 uppercase tracking-widest border-b border-zinc-900/30">
            <div className="col-span-4">Passphrase</div>
            <div className="col-span-5">Destination</div>
            <div className="col-span-3 text-right">Access Type</div>
          </div>
          
          {PASSWORDS.map((p, i) => (
            <motion.div 
              key={p.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="grid grid-cols-12 px-4 py-4 text-xs border border-zinc-900/40 bg-zinc-950/20 hover:bg-zinc-900/20 hover:border-zinc-800 transition-all group"
            >
              <div className="col-span-4 flex items-center gap-3">
                <Key size={14} className="text-zinc-800 group-hover:text-amber-900 transition-colors" />
                <span className="text-zinc-400 font-bold tracking-widest">{p.key}</span>
              </div>
              <div className="col-span-5 flex items-center gap-2 text-zinc-600 truncate">
                <Globe size={12} className="opacity-30" />
                <span className="truncate">{p.redirect}</span>
              </div>
              <div className="col-span-3 text-right">
                <span className={`text-[8px] px-2 py-0.5 border ${
                  p.type.includes("EXTERNAL") ? "border-blue-900/30 text-blue-900" : 
                  p.type.includes("ADMIN") ? "border-amber-900/30 text-amber-900" :
                  "border-zinc-800 text-zinc-700"
                }`}>
                  {p.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-12 border-t border-zinc-900/30 flex flex-col items-center gap-6">
          <div className="flex gap-8 text-[9px] text-zinc-800 uppercase tracking-widest">
             <span className="flex items-center gap-1"><ShieldCheck size={12} /> Encrypted Stream</span>
             <span>Audit Log: [DELETED]</span>
          </div>
          <Link href="/" className="text-[10px] text-zinc-600 hover:text-white transition-all uppercase tracking-widest border border-zinc-900 px-8 py-3 bg-zinc-950">
             [ Logout ]
          </Link>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),_transparent)]" />
        <div className="grid grid-cols-12 h-full w-full">
           {Array.from({ length: 48 }).map((_, i) => (
             <div key={i} className="border-r border-zinc-900 h-full w-full" />
           ))}
        </div>
      </div>
    </main>
  );
}
