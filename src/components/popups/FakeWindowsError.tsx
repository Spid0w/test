"use client";

import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

export function FakeWindowsError({ onClose }: { onClose: () => void }) {
  // Random position
  const top = Math.random() * 60 + 10 + "%";
  const left = Math.random() * 60 + 10 + "%";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed z-50 bg-[#f0f0f0] border-2 border-[#0000aa] shadow-[4px_4px_0px_#000] w-[400px] text-black font-sans select-none"
      style={{ top, left }}
      onClick={(e) => {
        // sometimes jumping away when clicked!
        if (Math.random() > 0.7) {
            e.currentTarget.style.top = Math.random() * 60 + 10 + "%";
            e.currentTarget.style.left = Math.random() * 60 + 10 + "%";
        }
      }}
    >
      {/* Title Bar */}
      <div className="bg-[#0000aa] text-white px-2 py-1 flex justify-between items-center text-sm font-bold">
        <span>System Error (0x00000000)</span>
        <button onClick={Math.random() > 0.5 ? () => {} : onClose} className="bg-red-500 hover:bg-red-600 px-2 font-bold focus:outline-none focus:ring-2 focus:ring-white">
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex gap-4">
        <AlertTriangle color="red" size={32} />
        <div className="text-sm space-y-2">
          <p>A fatal error occurred at <br/> memory location 0x{Math.random().toString(16).substring(2, 10).toUpperCase()}.</p>
          <p>The application will be terminated.</p>
        </div>
      </div>

      <div className="flex justify-end p-2 border-t border-gray-300">
        <button 
            onClick={Math.random() > 0.5 ? () => {} : onClose}
            className="border-2 border-gray-400 bg-gray-200 px-6 py-1 hover:bg-gray-300 shadow-[2px_2px_0px_#000] outline-none hover:border-black active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
        >
          OK
        </button>
      </div>
    </motion.div>
  );
}
