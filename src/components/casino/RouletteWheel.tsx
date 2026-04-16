"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface RouletteWheelProps {
  onSpinEnd: (result: number) => void;
  isSpinning: boolean;
  targetNumber: number | null;
}

// European Roulette Numbers in order on the wheel (Clockwise)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const COLORS = {
  red: "#991b1b",
  black: "#18181b",
  green: "#166534",
  gold: "#d4af37",
};

export function RouletteWheel({ onSpinEnd, isSpinning, targetNumber }: RouletteWheelProps) {
  const controls = useAnimation();
  const [currentRotation, setCurrentRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && targetNumber !== null) {
      const spin = async () => {
        const sectionAngle = 360 / 37;
        const targetIndex = WHEEL_NUMBERS.indexOf(targetNumber);
        
        // 1. Calculate the rotation needed to bring targetIndex to the top.
        // The numbers are in WHEEL_NUMBERS clockwise.
        // To bring index `i` to top, we must rotate current rotation to `-(i * sectionAngle)`
        // plus several full rotations for effect.
        
        const fullSpins = 5 + Math.floor(Math.random() * 3);
        const extraRotation = targetIndex * sectionAngle;
        
        // We subtract extraRotation because the wheel rotates clockwise, 
        // while the numbers are defined clockwise. If we rotate 10 deg, 
        // the index at 0 deg moves to 10 deg. So to get index 2 to top, 
        // we rotate by -(index 2's start angle).
        
        const targetRotation = currentRotation + (360 * fullSpins) - (currentRotation % 360) + (360 - extraRotation);

        await controls.start({
          rotate: targetRotation,
          transition: {
            duration: 6,
            ease: [0.2, 0, 0.1, 1], // Very slow ending
          },
        });

        setCurrentRotation(targetRotation);
        onSpinEnd(targetNumber);
      };

      spin();
    }
  }, [isSpinning, targetNumber, controls, onSpinEnd]);

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center">
      {/* Outer Wood Frame */}
      <div className="absolute inset-0 rounded-full border-[14px] border-[#2b1d12] shadow-[0_0_60px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,0,0,0.6)] bg-[#1a110a] animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Gold Rim */}
      <div className="absolute inset-4 rounded-full border-4 border-[#d4af37]/40" />

      {/* Spinning Wheel Container */}
      <motion.div
        animate={controls}
        initial={{ rotate: 0 }}
        className="relative w-[82%] h-[82%] rounded-full overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]"
        style={{ 
          transformOrigin: "center center",
          // To center segment 0 at top when rotation is 0:
          // SVG segments start at i*angle. Segment 0 is from 0 to angle.
          // Center is at angle/2. So rotate whole thing by -angle/2.
          marginTop: '0px'
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ transform: `rotate(${-360 / 37 / 2}deg)` }} // Calibration: center segment 0 at top
        >
          {WHEEL_NUMBERS.map((number, i) => {
            const angle = 360 / 37;
            const rotation = i * angle;
            
            // European standard colors
            const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number);
            const color = number === 0 ? COLORS.green : isRed ? COLORS.red : COLORS.black;

            return (
              <g key={i} transform={`rotate(${rotation} 50 50)`}>
                <path
                  d={`M 50 50 L 50 0 A 50 50 0 0 1 ${50 + 50 * Math.sin(angle * (Math.PI / 180))} ${50 - 50 * Math.cos(angle * (Math.PI / 180))} Z`}
                  fill={color}
                  stroke={COLORS.gold}
                  strokeWidth="0.15"
                />
                <text
                  x="50"
                  y="10"
                  fill="white"
                  fontSize="3.8"
                  fontWeight="900"
                  textAnchor="middle"
                  transform={`rotate(${(angle / 2)} 50 50)`}
                  className="font-serif"
                  style={{ userSelect: "none" }}
                >
                  {number}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interior texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]" />
        
        {/* Hub */}
        <div className="absolute inset-[32%] rounded-full bg-gradient-to-br from-[#d4af37] via-[#8b4513] to-[#2b1d12] shadow-2xl border-4 border-[#5c4033]" />
      </motion.div>

      {/* Static Indicator (Yellow Pin) */}
      <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-30">
        <div className="w-6 h-10 bg-gradient-to-b from-[#d4af37] to-[#b8860b] rounded-b-full shadow-2xl border-2 border-[#1a110a] relative">
           <div className="absolute top-1 left-1.5 w-3 h-3 rounded-full bg-white/30 blur-[1px]" />
        </div>
      </div>

      {/* Stationary Center */}
      <div className="absolute inset-[42%] rounded-full bg-[#1a110a] border-4 border-[#d4af37] shadow-lg z-20 flex items-center justify-center">
         <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#d4af37] to-white animate-spin" style={{ animationDuration: '3s' }} />
      </div>

    </div>
  );
}
