"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  age: number;
  color: string;
}

export function CursorTraces() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      // Add multiple points for a thicker, more "bleeding" effect
      for(let i=0; i<3; i++) {
        points.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          age: 0,
          color: Math.random() < 0.2 ? "#ff0000" : "#880000"
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.current = points.current.filter(p => p.age < 60);
      
      points.current.forEach(p => {
        p.age += 1;
        p.y += 0.5; // Gravity effect for blood
        
        const opacity = 1 - p.age / 60;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        
        const size = Math.max(0, 4 - p.age / 15);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Random glitch horizontal lines
        if (Math.random() < 0.01) {
          ctx.fillRect(p.x - 20, p.y, 40, 1);
        }
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-[90] pointer-events-none mix-blend-multiply opacity-40"
    />
  );
}
