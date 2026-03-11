"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

const EMOJIS = ["👁️", "💀", "⚠️", "❌", "🚫", "👺", "👽", "👾"];

export function EmojiExplosion({ onClose }: { onClose: () => void }) {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const emojis = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    x: Math.random() * 100 - 50 + "vw", // Relative to center
    y: Math.random() * 100 - 50 + "vh",
    scale: Math.random() * 3 + 1,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
      {emojis.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ 
            opacity: [1, 1, 0], 
            scale: item.scale, 
            x: item.x, 
            y: item.y,
            rotate: item.rotation
          }}
          transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
          className="absolute text-4xl"
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}
