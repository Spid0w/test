"use client";

import { useEffect, useState } from "react";
import { randomEngine } from "@/utils/randomEngine";
import { motion, AnimatePresence } from "framer-motion";

const SCARY_IMAGES = [
  "https://images.unsplash.com/photo-1542451313056-b7c8e626645f?q=80&w=1600&auto=format&fit=crop", // Distorted abstract
  "https://images.unsplash.com/photo-1574516629986-74fcce02967f?q=80&w=1600&auto=format&fit=crop", // Creepy silhouette
  "https://images.unsplash.com/photo-1620358178822-4a0050cd3194?q=80&w=1600&auto=format&fit=crop", // Glitch portrait
  "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=1600&auto=format&fit=crop", // Static noise
];

export function SubliminalFlash() {
  const [active, setActive] = useState(false);
  const [image, setImage] = useState("");

  useEffect(() => {
    const unsubscribe = randomEngine.subscribe((event) => {
      if (event.type === "FLASH_IMAGE" || event.type === "JUMPSCARE") {
        setImage(SCARY_IMAGES[Math.floor(Math.random() * SCARY_IMAGES.length)]);
        setActive(true);
        
        // Flash duration 30ms to 80ms
        const duration = event.type === "JUMPSCARE" ? 200 : Math.random() * 50 + 30;
        
        setTimeout(() => {
          setActive(false);
        }, duration);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.random() > 0.5 ? 0.3 : 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
          className="fixed inset-0 z-[9999] pointer-events-none mix-blend-difference"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={image} 
            alt="" 
            className="w-full h-full object-cover 
              saturate-[50] contrast-[200] brightness-50"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
