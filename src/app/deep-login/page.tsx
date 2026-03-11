"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlitchText } from "@/components/glitch/GlitchText";
import { randomEngine } from "@/utils/randomEngine";

export default function DeepLoginPage() {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [locked, setLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Auto focus on input
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    if (password.toLowerCase() === "observer") {
      router.push("/you-found-me");
    } else {
      setErrorMsg("INVALID KERNEL HANDSHAKE.");
      setLocked(true);
      randomEngine.triggerEvent("POPUP_IPLOCATOR");
      
      setTimeout(() => {
        setLocked(false);
        setPassword("");
        setErrorMsg("");
        inputRef.current?.focus();
      }, 5000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-red-700 font-mono p-4">
      <div className="w-full max-w-lg p-8 border border-red-950 bg-[#050000] shadow-[0_0_50px_rgba(255,0,0,0.05)] relative overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(red 1px, transparent 1px), linear-gradient(90deg, red 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
             <div className="w-4 h-4 bg-red-600 animate-pulse" />
             <GlitchText className="tracking-widest">RESTRICTED_ACCESS</GlitchText>
          </h1>
          <p className="text-xs text-red-900 mb-10 border-b border-red-950 pb-4">
             NODE: 0x8F9B2C // ENCRYPTION: SECP256K1
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-red-800 mb-2 uppercase tracking-wider">Passphrase</label>
              <input 
                ref={inputRef}
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={locked}
                className="w-full bg-black border border-red-900 text-red-500 px-4 py-3 focus:outline-none focus:border-red-500 disabled:opacity-50 tracking-[0.3em]"
                spellCheck="false"
              />
            </div>
            
            <div className="h-4 text-xs font-bold text-red-500 text-center">
               {errorMsg && <span className="animate-pulse">{errorMsg}</span>}
               {locked && <span className="text-red-900 block mt-1">INITIATING TRACE...</span>}
            </div>

            <button 
                type="submit" 
                disabled={locked || !password}
                className="w-full bg-red-950 text-red-500 border border-red-900 py-3 uppercase text-xs font-bold tracking-widest hover:bg-red-900 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                [ Authenticate ]
            </button>
          </form>

          <div className="mt-8 text-[10px] text-red-950 text-center uppercase">
             Unauthorized attempts will be logged and traced.
          </div>
        </div>
      </div>
    </main>
  );
}
