"use client";

import { motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

export function FakeAntivirus({ onClose }: { onClose: () => void }) {
  const top = Math.random() * 50 + 20 + "%";
  const left = Math.random() * 50 + 20 + "%";

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed z-50 bg-white border border-red-500 shadow-2xl w-[350px] text-black font-sans rounded-lg overflow-hidden flex flex-col"
      style={{ top, left }}
    >
      <div className="bg-red-600 p-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
            <ShieldAlert size={20} />
            <span className="font-bold">THREAT DETECTED</span>
        </div>
        <button onClick={Math.random() > 0.8 ? () => {} : onClose}>
            <X size={18} className="hover:text-gray-300" />
        </button>
      </div>
      
      <div className="p-4 bg-gray-50 flex-1">
        <p className="text-sm font-semibold text-red-600 mb-1">Win32:Trojan-gen</p>
        <p className="text-xs text-gray-700 mb-4">Location: C:\Windows\System32\observer.sys</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-red-500 h-2 rounded-full w-full animate-pulse"></div>
        </div>
        <p className="text-xs text-gray-500 text-center">Attempting to quarantine...</p>
      </div>

      <div className="bg-gray-100 p-3 flex justify-end gap-2">
        {/* These buttons do nothing randomly */}
        <button onClick={Math.random() > 0.5 ? () => {} : onClose} className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-200">
            Ignore
        </button>
        <button onClick={onClose} className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 shadow shadow-red-500/50">
            Remove Threat
        </button>
      </div>
    </motion.div>
  );
}
