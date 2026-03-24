"use client";

import { motion } from "framer-motion";

const REDACTED_TEXT = [
  { text: "CLASSIFIED REPORT // SUBJECT: UNPOCOLOCO_INSTANCE", redacted: false },
  { text: "DATE: 2026-03-24 // LEVEL 5 CLEARANCE REQUIRED", redacted: false },
  { text: "---", redacted: false },
  { text: "Initial observations indicate a significant breach in the ", redacted: false, suffix: " system." },
  { text: "DATA_LAYER_7_B_PRIME", redacted: true },
  { text: "The target has been monitored for ", redacted: false, suffix: " weeks." },
  { text: "TWELVE_THOUSAND_FOUR_HUNDRED", redacted: true },
  { text: "Unauthorized personnel (ID: ", redacted: false, suffix: ") were found in the server room." },
  { text: "SPID0W_ADMIN_OVERRIDE", redacted: true },
  { text: "The following coordinates have been blacklisted: ", redacted: false },
  { text: "48.8584° N, 2.2945° E // 51.5007° N, 0.1246° W", redacted: true },
  { text: "PROCEED WITH CAUTION. DO NOT TRUST THE INTERFACE.", redacted: false },
  { text: "END OF LOG.", redacted: false },
];

export default function RedactedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-[#f0f0f0] text-[#333] font-serif p-8 md:p-24 overflow-auto cursor-default">
      <div className="w-full max-w-2xl bg-white p-12 md:p-20 shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-gray-300 min-h-[1000px] relative">
        
        {/* "TOP SECRET" Stamp */}
        <div className="absolute top-10 right-10 border-4 border-red-800 text-red-800 font-bold px-4 py-2 rotate-12 opacity-80 uppercase text-xl">
           Top Secret
        </div>

        <div className="space-y-6 leading-relaxed text-sm md:text-base">
          {REDACTED_TEXT.map((item, i) => (
            <p key={i}>
              {!item.redacted ? (
                <>
                  {item.text}
                  {item.suffix && <span>{item.suffix}</span>}
                </>
              ) : (
                <span className="relative inline-block hover:text-black group">
                  <motion.span 
                    className="absolute inset-0 bg-black group-hover:opacity-0 transition-opacity duration-300" 
                    initial={{ opacity: 1 }}
                  />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono italic text-sm">
                    {item.text}
                  </span>
                  <span className="invisible group-hover:visible">{item.suffix}</span>
                </span>
              )}
            </p>
          ))}
        </div>

        <div className="mt-32 pt-12 border-t-2 border-gray-200">
          <div className="flex justify-between items-center opacity-30 text-[10px] uppercase font-bold tracking-widest italic">
            <span>UNPOCOLOCO_INTERNAL_USE_ONLY</span>
            <span>Ref: 0xDEADBEEF</span>
          </div>
        </div>
      </div>
      
      {/* Background overlay to keep the dark theme mood slightly visible */}
      <div className="fixed inset-0 pointer-events-none bg-black/5 mix-blend-multiply" />
    </main>
  );
}
