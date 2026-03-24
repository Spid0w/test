"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GlitchText } from "@/components/glitch/GlitchText";

export default function NotFound() {
  const [timeLeft, setTimeLeft] = useState<number>(80 * 365.25 * 24 * 60 * 60 * 1000); // ~80 years

  useEffect(() => {
    // Determine a random, massive starting time for this user, around 80 years in ms
    // We store it in session storage so it counts down consistently during the session
    let startTime = Number(sessionStorage.getItem("void_sim_time"));
    let prevNow = Date.now();

    if (!startTime) {
      startTime = 80 * 365.25 * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 10000000);
      sessionStorage.setItem("void_sim_time", startTime.toString());
    }

    setTimeLeft(startTime);

    const interval = setInterval(() => {
      const currentNow = Date.now();
      const diff = currentNow - prevNow;
      startTime -= diff;
      sessionStorage.setItem("void_sim_time", startTime.toString());
      setTimeLeft(startTime);
      prevNow = currentNow;
    }, 11); // Update fast for milliseconds effect

    return () => clearInterval(interval);
  }, []);

  // Format ms to YY:MM:DD:HH:MM:SS:ms
  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00:00:00:00:000";
    
    const years = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
    ms -= years * (365.25 * 24 * 60 * 60 * 1000);
    const months = Math.floor(ms / (30.44 * 24 * 60 * 60 * 1000));
    ms -= months * (30.44 * 24 * 60 * 60 * 1000);
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    ms -= days * (24 * 60 * 60 * 1000);
    const hours = Math.floor(ms / (60 * 60 * 1000));
    ms -= hours * (60 * 60 * 1000);
    const minutes = Math.floor(ms / (60 * 1000));
    ms -= minutes * (60 * 1000);
    const seconds = Math.floor(ms / 1000);
    ms -= seconds * 1000;

    const pad = (n: number, z = 2) => String(n).padStart(z, '0');

    return `${pad(years)} YRS : ${pad(months)} MTH : ${pad(days)} DYS : ${pad(hours)} HR : ${pad(minutes)} MIN : ${pad(seconds)} SEC : ${pad(Math.floor(ms), 3)}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020000] text-red-950 font-mono p-4 overflow-hidden relative select-none">
      
      {/* Background scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <div className="z-10 flex flex-col items-center gap-12 text-center w-full max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-black uppercase text-red-900 tracking-[0.5em] mb-8">
            <GlitchText>COORDONNÉES INTROUVABLES</GlitchText>
          </h1>
          
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-600 mb-2">
            Votre simulation se terminera dans :
          </div>
          
          <div className="text-2xl md:text-5xl font-bold tracking-tighter text-red-600 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            {formatTime(timeLeft)}
          </div>
        </div>

        <Link 
          href="/"
          className="mt-16 px-8 py-3 border border-red-950/50 text-red-900 hover:border-red-600 hover:text-red-600 hover:bg-red-600/5 transition-all duration-700 font-bold uppercase tracking-[0.3em] text-[9px]"
        >
          [ RELANCER LA SÉQUENCE ]
        </Link>
      </div>

      {/* Decorative text corners */}
      <div className="absolute top-10 left-10 text-[8px] text-red-950/40 uppercase vertical-text">
        OUT_OF_BOUNDS // ERROR 404
      </div>
      <div className="absolute bottom-10 right-10 text-[8px] text-red-950/40 uppercase animate-pulse">
        Waiting for termination...
      </div>
    </main>
  );
}
