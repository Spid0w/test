"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CursorEffects() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [laggingPos, setLaggingPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);

  useEffect(() => {
    let lastTime = 0;
    
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') !== null ||
        target.closest('button') !== null
      );
    };

    const animate = (time: number) => {
      if (time - lastTime > 50) { // Throttle lagging pos update
        setLaggingPos((prev) => ({
          x: prev.x + (position.x - prev.x) * 0.15,
          y: prev.y + (position.y - prev.y) * 0.15,
        }));
        lastTime = time;
      }

      // Randomly enable glitch mode
      if (Math.random() < 0.005 && !glitchMode) {
        setGlitchMode(true);
        setTimeout(() => setGlitchMode(false), 2000);
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [position, glitchMode]);

  if (typeof window === "undefined" || window.innerWidth < 768) return null; // Don't run on mobile

  return (
    <>
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border border-red-500 pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ${
          isHovering ? "scale-150 bg-red-500/20" : "scale-100"
        }`}
        animate={{ x: laggingPos.x - 16, y: laggingPos.y - 16 }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />
      {glitchMode && (
        <>
          <motion.div
            className="fixed top-0 left-0 w-2 h-2 rounded-full bg-blue-500 pointer-events-none z-[9999] mix-blend-screen"
            animate={{ x: position.x + (Math.random() * 40 - 20), y: position.y + (Math.random() * 40 - 20) }}
            transition={{ type: "tween", duration: 0 }}
          />
          <motion.div
            className="fixed top-0 left-0 w-2 h-2 rounded-full bg-green-500 pointer-events-none z-[9999] mix-blend-screen"
            animate={{ x: position.x + (Math.random() * 40 - 20), y: position.y + (Math.random() * 40 - 20) }}
            transition={{ type: "tween", duration: 0 }}
          />
        </>
      )}
    </>
  );
}
