"use client";

import { motion } from "framer-motion";
import { DownloadCloud, X } from "lucide-react";

export function FakeDownload({ onClose }: { onClose: () => void }) {
  const top = Math.random() * 70 + 10 + "%";
  const left = Math.random() * 70 + 10 + "%";

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed z-50 bg-zinc-900 border border-zinc-700 shadow-2xl w-[300px] text-zinc-100 font-sans rounded-xl overflow-hidden p-4"
      style={{ top, left }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <DownloadCloud size={24} />
          </div>
          <div>
            <h3 className="font-medium text-sm">payload_xyz.pkg</h3>
            <p className="text-xs text-zinc-400">Downloading... 3.2 GB / 4.4 TB</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
        </button>
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
        <div className="bg-blue-500 h-full w-[2%] shadow-[0_0_10px_#3b82f6]"></div>
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
        <span>0.1 MB/s</span>
        <span>457,892 days left</span>
      </div>
    </motion.div>
  );
}
