"use client";

import { useEffect, useState } from "react";
import { GlitchText } from "@/components/glitch/GlitchText";
import { StrangeLink } from "@/components/StrangeLink";

export default function GlitchPage() {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBroken(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={`flex min-h-screen flex-col p-8 ${broken ? 'bg-white text-black invert' : 'bg-black text-blue-500'}`}>
      <h1 className="text-4xl font-mono border-b-4 border-current pb-4">
         SYSTEM // CORRUPTED
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 font-mono text-xs uppercase">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`p-4 border ${Math.random() > 0.5 ? 'border-red-500' : 'border-blue-500'} bg-black/50`}>
               <GlitchText>{Math.random().toString(36).substring(2, 10)}</GlitchText>
               <div className="h-2 w-full bg-current mt-2 opacity-50 mix-blend-exclusion"></div>
            </div>
          ))}
      </div>

      <div className="mt-12 text-center text-4xl">
        <StrangeLink href="/">
          <GlitchText>ESCAPE</GlitchText>
        </StrangeLink>
      </div>
    </main>
  );
}
