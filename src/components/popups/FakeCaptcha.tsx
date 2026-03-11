"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function FakeCaptcha({ onClose }: { onClose: () => void }) {
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const top = Math.random() * 60 + 20 + "%";
  const left = Math.random() * 60 + 20 + "%";

  const handleClick = () => {
    setLoading(true);
    // Unchecks itself after a delay, frustrating the user
    setTimeout(() => {
      setLoading(false);
      setIsChecked(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed z-50 bg-[#f9f9f9] border border-gray-300 shadow-md w-[300px] h-[74px] p-3 text-black font-sans rounded-sm flex items-center justify-between"
      style={{ top, left }}
    >
      <div className="flex items-center gap-3">
        <button 
          onClick={handleClick}
          className="w-7 h-7 bg-white border-2 border-[#c1c1c1] rounded-sm flex items-center justify-center hover:shadow-inner"
        >
          {loading && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />}
          {!loading && isChecked && <span className="text-green-600 font-bold text-lg">✓</span>}
        </button>
        <span className="text-sm text-[#555]">I am not a robot</span>
      </div>
      <div className="flex flex-col items-center">
        {/* Fake reCAPTCHA logo */}
        <div className="w-8 h-8 opacity-60 flex items-center justify-center text-[10px] bg-blue-100 text-blue-800 rounded-full font-bold">
            reC
        </div>
      </div>
    </motion.div>
  );
}
