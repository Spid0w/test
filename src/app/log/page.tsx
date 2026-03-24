"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOG_TEMPLATES = [
  "PROCESS 0x{ID} spawned... WATCHING",
  "Connection established to NODE_{NODE}",
  "ENCRYPTION LAYER {LAYER} ACTIVE",
  "Uplink saturated. Packet loss: {LOSS}%",
  "HANDSHAKE SUCCESSFUL: 0x{HEX}",
  "Warning: Integrity check failed in sector {SECTOR}",
  "Unauthorized access attempt from {IP}",
  "CLEANING TRACES...",
  "DECRYPTING PAYLOAD...",
  "STATUS: {STATUS}",
  "HEARTBEAT DETECTED",
  "THEY ARE LOOKING FOR YOU",
  "DON'T TURN OFF THE POWER",
];

const STATUSES = ["ONLINE", "STABLE", "COMPROMISED", "BUSY", "IDLE", "SHADOWED"];

export default function LogPage() {
  const [logs, setLogs] = useState<{ id: string; text: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addLog = () => {
      const id = Math.random().toString(36).substring(2, 6).toUpperCase();
      const node = Math.floor(Math.random() * 9999);
      const layer = Math.floor(Math.random() * 12) + 1;
      const loss = (Math.random() * 5).toFixed(2);
      const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
      const sector = Math.floor(Math.random() * 512);
      const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const text = template
        .replace("{ID}", id)
        .replace("{NODE}", node.toString())
        .replace("{LAYER}", layer.toString())
        .replace("{LOSS}", loss)
        .replace("{HEX}", hex)
        .replace("{SECTOR}", sector.toString())
        .replace("{IP}", ip)
        .replace("{STATUS}", status);

      const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
      
      setLogs(prev => [...prev, { id: Math.random().toString(), text, time }].slice(-50));
    };

    // Initial logs
    for(let i=0; i<15; i++) addLog();

    const interval = setInterval(addLog, 800 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-green-500 font-mono p-4 sm:p-8 overflow-hidden h-screen">
      <div className="border border-green-900/50 flex-1 flex flex-col bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden">
        {/* CRT Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="bg-green-950/20 px-4 py-2 border-b border-green-900/50 flex justify-between items-center text-xs">
          <span className="animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            SYSTEM_MONITOR_v4.0
          </span>
          <span className="opacity-50">STRICTLY_CONFIDENTIAL</span>
        </div>

        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto scrollbar-hide text-sm space-y-1">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4"
              >
                <span className="text-green-900 shrink-0">[{log.time}]</span>
                <span className="break-all">{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-4 bg-green-500 inline-block pointer-events-none"
          />
        </div>

        <div className="p-2 border-t border-green-900/50 text-[10px] text-green-900 text-center uppercase tracking-[0.5em]">
          No user interaction allowed in monitor mode
        </div>
      </div>
    </main>
  );
}
