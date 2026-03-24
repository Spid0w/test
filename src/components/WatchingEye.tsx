"use client";

import { useEffect, useState, useRef } from "react";

export function WatchingEye() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPos = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    const rect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;
    
    const dx = mousePos.x - eyeCenterX;
    const dy = mousePos.y - eyeCenterY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 20, 6);
    
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const pupil = calculatePupilPos();

  return (
    <div className="fixed bottom-4 right-4 z-[100] opacity-20 hover:opacity-100 transition-opacity duration-1000 pointer-events-none drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]">
      <svg 
        ref={eyeRef}
        width="60" 
        height="40" 
        viewBox="0 0 60 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]"
      >
        {/* Eye Outline */}
        <path 
          d="M2 20C2 20 12 4 30 4C48 4 58 20 58 20C58 20 48 36 30 36C12 36 2 20 2 20Z" 
          stroke="white" 
          strokeWidth="1.5" 
        />
        {/* Iris */}
        <circle cx="30" cy="20" r="10" stroke="white" strokeWidth="1" />
        {/* Pupil */}
        <circle 
          cx={30 + pupil.x} 
          cy={20 + pupil.y} 
          r="4" 
          fill="red" 
          className="blur-[1px]"
        />
        {/* Veins */}
        <path d="M10 20L5 18" stroke="red" strokeWidth="0.5" opacity="0.5" />
        <path d="M50 20L55 22" stroke="red" strokeWidth="0.5" opacity="0.5" />
      </svg>
    </div>
  );
}
