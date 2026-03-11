"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Fake404Page() {
  const router = useRouter();
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    setClicks(c => c + 1);
    if (clicks > 4) {
      router.push("/you-found-me");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-gray-300 font-sans p-4">
      <motion.div 
        className="text-center select-none"
        animate={{ x: clicks > 2 ? [0, -2, 2, 0] : 0 }}
        transition={{ repeat: Infinity, duration: 0.1 }}
      >
        <h1 className="text-8xl font-black mb-4 tracking-tighter">404</h1>
        <p className="text-xl font-light">Page not found.</p>
        
        <button 
            onClick={handleClick}
            className={`mt-12 text-sm text-gray-600 hover:text-gray-400 focus:outline-none transition-opacity ${clicks > 4 ? 'opacity-0' : 'opacity-100'}`}
        >
            {clicks === 0 && "Go back home"}
            {clicks === 1 && "I said, go back home."}
            {clicks === 2 && "There's nothing here."}
            {clicks === 3 && "Stop clicking."}
            {clicks === 4 && "..."}
        </button>
      </motion.div>
    </main>
  );
}
