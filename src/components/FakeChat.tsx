"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FakeChat() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Show up randomly 1 to 2 minutes after load
    const timeout = setTimeout(() => {
      setVisible(true);
      
      setTimeout(() => setMessages(["Nouvelle connexion."]), 1000);
      
      setTimeout(() => {
        const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        setMessages((prev: string[]) => [...prev, `Adresse IP détectée : ${fakeIp}`]);
      }, 4000);
      
      setTimeout(() => setMessages((prev: string[]) => [...prev, "Je le vois."]), 8000);
      
      setTimeout(() => setVisible(false), 11000);
    }, Math.random() * 60000 + 30000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 right-4 z-[9000] w-64 bg-black/90 border border-red-900/50 p-4 font-mono text-[10px] shadow-[0_0_20px_rgba(255,0,0,0.1)] backdrop-blur-sm"
        >
          <div className="flex justify-between items-center border-b border-red-900/30 pb-2 mb-2 text-zinc-500">
            <span>TERMINAL_OBSERVE</span>
            <span className="animate-pulse w-2 h-2 bg-red-800 rounded-full"></span>
          </div>
          <div className="space-y-2 min-h-[60px] flex flex-col justify-end">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-700 drop-shadow-[0_0_2px_rgba(255,0,0,0.5)]"
              >
                {"> "}{msg}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-3 bg-red-900"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
