"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface RouletteWheelProps {
  onSpinEnd: (result: number) => void;
  isSpinning: boolean;
  targetNumber: number | null;
}

// European Roulette Numbers in order on the wheel
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const COLORS = {
  red: "#991b1b",
  black: "#18181b",
  green: "#166534",
  gold: "#d4af37",
  wood: "#3f2b1d",
};

export function RouletteWheel({ onSpinEnd, isSpinning, targetNumber }: RouletteWheelProps) {
  const controls = useAnimation();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && targetNumber !== null) {
      const startSpin = async () => {
        const targetIndex = WHEEL_NUMBERS.indexOf(targetNumber);
        const sectionAngle = 360 / WHEEL_NUMBERS.length;
        
        // Random number of full spins (5-8)
        const fullSpins = 5 + Math.random() * 3;
        const currentRotationNormalized = rotation % 360;
        
        // Calculate target rotation
        // We want the ball to land on the top. The number offset is negative of the index * sectionAngle
        const targetAngle = targetIndex * sectionAngle;
        const finalRotation = 360 * fullSpins + (360 - targetAngle);

        await controls.start({
          rotate: finalRotation,
          transition: {
            duration: 6,
            ease: [0.15, 0, 0.15, 1], // Custom cubic-bezier for a natural wheel feel
          },
        });

        setRotation(finalRotation);
        onSpinEnd(targetNumber);
      };

      startSpin();
    }
  }, [isSpinning, targetNumber, controls, onSpinEnd]);

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center">
      {/* Outer Wood Frame */}
      <div className="absolute inset-0 rounded-full border-[12px] border-[#2b1d12] shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] bg-[#1a110a]" />
      
      {/* Gold Rim */}
      <div className="absolute inset-3 rounded-full border-4 border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.2)]" />

      {/* Spinning Wheel */}
      <motion.div
        animate={controls}
        initial={{ rotate: 0 }}
        className="relative w-[85%] h-[85%] rounded-full overflow-hidden shadow-2xl"
        style={{ transformOrigin: "center center" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-9.7deg]">
          {WHEEL_NUMBERS.map((number, i) => {
            const angle = (360 / WHEEL_NUMBERS.length);
            const rotation = i * angle;
            const color = number === 0 ? COLORS.green : (
              [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number) 
              ? COLORS.red 
              : COLORS.black
            );

            return (
              <g key={i} transform={`rotate(${rotation} 50 50)`}>
                <path
                  d={`M 50 50 L 50 0 A 50 50 0 0 1 ${50 + 50 * Math.sin(angle * (Math.PI / 180))} ${50 - 50 * Math.cos(angle * (Math.PI / 180))} Z`}
                  fill={color}
                  stroke={COLORS.gold}
                  strokeWidth="0.1"
                />
                <text
                  x="50"
                  y="12"
                  fill="white"
                  fontSize="4"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(${(angle / 2)} 50 12)`}
                  style={{ userSelect: "none" }}
                >
                  {number}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Inner Hub (Static relative to wheel but spins with it) */}
        <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-[#d4af37] via-[#b8860b] to-[#8b4513] shadow-inner border-2 border-[#5c4033]">
           <div className="absolute inset-[15%] rounded-full border border-black/20 bg-[#2b1d12]/20" />
        </div>
      </motion.div>

      {/* Static Pin (Indicator) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
        <div className="w-4 h-8 bg-gradient-to-b from-[#d4af37] to-[#8b4513] rounded-b-full shadow-lg border border-black/30" />
      </div>

      {/* Center Cap (Stationary) */}
      <div className="absolute inset-[40%] rounded-full bg-gradient-to-tr from-[#2b1d12] to-[#5c4033] border-2 border-[#d4af37] shadow-lg z-10 flex items-center justify-center">
         <div className="w-4 h-4 rounded-full bg-[#d4af37] animate-pulse" />
      </div>
    </div>
  );
}
