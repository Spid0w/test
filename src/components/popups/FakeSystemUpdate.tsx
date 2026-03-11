"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function FakeSystemUpdate({ onClose }: { onClose: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 99) {
          // Never quite finishes, just hangs at 99% or randomizes
          return Math.random() > 0.8 ? 85 : 99;
        }
        return p + Math.random() * 5;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#005A9E] flex flex-col items-center justify-center text-white font-sans cursor-wait"
      // User can't click to close easily, it's a full screen fake update!
      onClick={Math.random() > 0.9 ? onClose : () => {}} 
    >
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-8"></div>
      <h1 className="text-3xl font-light mb-4">Working on updates</h1>
      <p className="text-xl mb-2">{Math.floor(progress)}% complete</p>
      <p className="text-lg text-blue-200">Don't turn off your PC. This will take a while.</p>
    </motion.div>
  );
}
