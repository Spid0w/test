"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SubliminalText() {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    // Show randomly every ~4 mins
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        setText(Math.random() > 0.5 ? "RÉVEILLE-TOI" : "IL TE REGARDE");
        setActive(true);
        setTimeout(() => setActive(false), 100);
      }
    }, 4 * 60 * 1000);

    // Show on fast scroll
    let lastScroll = window.scrollY;
    let lastTime = Date.now();
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      const currentScroll = window.scrollY;
      const currentTime = Date.now();
      const speed = Math.abs(currentScroll - lastScroll) / Math.max(1, currentTime - lastTime);
      
      if (speed > 5 && !active) {
        setText(Math.random() > 0.5 ? "RÉVEILLE-TOI" : "FUIS");
        setActive(true);
        setTimeout(() => setActive(false), 100);
      }
      
      scrollTimeout = setTimeout(() => {
        lastScroll = window.scrollY;
        lastTime = Date.now();
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearInterval(interval);
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
          className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black/50"
        >
          <h1 className="text-[15vw] font-black text-red-700 uppercase tracking-tighter mix-blend-difference drop-shadow-[0_0_30px_rgba(255,0,0,1)] text-center leading-none">
            {text}
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
