"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlitchText } from "@/components/glitch/GlitchText";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

// Keyword → redirect map
const KEYWORD_REDIRECTS: Record<string, string> = {
  observer: "/you-found-me",
  casino: "https://snatchcasino.com",
  void: "/void",
  glitch: "/glitch",
  unknown: "/unknown",
};

interface GeoData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
  org: string;
}

export default function DeepLoginPage() {
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [locked, setLocked] = useState(false);
  const [geoLines, setGeoLines] = useState<string[]>([]);
  const [showGeotrack, setShowGeotrack] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runGeotrackSequence = async (redirectTo: string) => {
    setShowGeotrack(true);
    setGeoLines([]);

    let geoData: GeoData | null = null;

    // Try to fetch real IP data
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        geoData = await res.json();
      }
    } catch {
      // silently fail — fallback to fake data below
    }

    const ip = geoData?.ip ?? `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const lat = geoData ? geoData.latitude.toFixed(4) : (Math.random() * 180 - 90).toFixed(4);
    const lng = geoData ? geoData.longitude.toFixed(4) : (Math.random() * 360 - 180).toFixed(4);
    const location = geoData
      ? `${geoData.city}, ${geoData.region}, ${geoData.country_name}`
      : "UNKNOWN";
    const isp = geoData?.org ?? "UNRESOLVED";

    const sequence = [
      "INITIALIZING TRACE...",
      "BYPASSING PROXY LAYERS...",
      `TARGET IP ACQUIRED: ${ip}`,
      "RESOLVING GEOLOCATION...",
      `LAT: ${lat} // LNG: ${lng}`,
      `LOCATION: ${location}`,
      `ISP: ${isp}`,
      "MATCHING HARDWARE FINGERPRINT...",
      "SUCCESS.",
      "They know you are here.",
    ];

    // Print lines one by one
    for (let i = 0; i < sequence.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setGeoLines((prev) => [...prev, sequence[i]]);
    }

    // Pause a moment then redirect
    await new Promise((r) => setTimeout(r, 1200));

    if (redirectTo.startsWith("http")) {
      window.location.href = redirectTo;
    } else {
      router.push(redirectTo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    const key = password.toLowerCase().trim();
    const redirectTo = KEYWORD_REDIRECTS[key];

    setLocked(true);

    if (redirectTo) {
      // Show the geotrack terminal then redirect
      setErrorMsg("");
      await runGeotrackSequence(redirectTo);
    } else {
      setErrorMsg("INVALID KERNEL HANDSHAKE.");
      // Show geotrack as punishment for wrong password
      await runGeotrackSequence("/deep-login");
      setShowGeotrack(false);
      setGeoLines([]);
      setLocked(false);
      setPassword("");
      setErrorMsg("");
      inputRef.current?.focus();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-red-700 font-mono p-4">
      <div className="w-full max-w-lg p-8 border border-red-950 bg-[#050000] shadow-[0_0_50px_rgba(255,0,0,0.05)] relative overflow-hidden">

        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(red 1px, transparent 1px), linear-gradient(90deg, red 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
            <div className="w-4 h-4 bg-red-600 animate-pulse" />
            <GlitchText className="tracking-widest">RESTRICTED_ACCESS</GlitchText>
          </h1>
          <p className="text-xs text-red-900 mb-10 border-b border-red-950 pb-4">
            NODE: 0x8F9B2C // ENCRYPTION: SECP256K1
          </p>

          {/* Inline geotrack terminal */}
          <AnimatePresence>
            {showGeotrack && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-black border border-green-500/40 rounded shadow-[0_0_12px_rgba(0,255,0,0.08)]"
              >
                <div className="bg-green-950/30 px-3 py-1.5 flex items-center gap-2 border-b border-green-900 text-green-500 text-xs">
                  <Terminal size={12} />
                  <span>geotrack.exe</span>
                </div>
                <div className="p-4 space-y-1.5 h-[200px] overflow-auto">
                  {geoLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-green-400 text-xs font-mono"
                    >
                      <span className="text-zinc-600 mr-2">{">"}</span>
                      {line}
                    </motion.div>
                  ))}
                  {geoLines.length < 10 && (
                    <motion.div
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="w-2 h-3 bg-green-500 inline-block align-middle ml-4"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-red-800 mb-2 uppercase tracking-wider">
                Passphrase
              </label>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={locked}
                className="w-full bg-black border border-red-900 text-red-500 px-4 py-3 focus:outline-none focus:border-red-500 disabled:opacity-50 tracking-[0.3em]"
                spellCheck="false"
              />
            </div>

            <div className="h-4 text-xs font-bold text-red-500 text-center">
              {errorMsg && <span className="animate-pulse">{errorMsg}</span>}
              {locked && !showGeotrack && (
                <span className="text-red-900 block mt-1">INITIATING TRACE...</span>
              )}
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
