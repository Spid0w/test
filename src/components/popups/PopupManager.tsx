"use client";

import { useEffect, useState } from "react";
import { randomEngine, TrollEvent } from "@/utils/randomEngine";
import { AnimatePresence } from "framer-motion";

export function PopupManager() {
  const [activeEvents, setActiveEvents] = useState<TrollEvent[]>([]);

  useEffect(() => {
    const unsubscribe = randomEngine.subscribe((event) => {
      if (event.type.startsWith("POPUP")) {
        setActiveEvents((prev) => [...prev, event]);
      }
    });
    return unsubscribe;
  }, []);

  const closeEvent = (id: string) => {
    setActiveEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // No popup types remain in the engine — this manager is kept
  // as a shell for future popup additions.
  return (
    <AnimatePresence>
      {activeEvents.map(() => null)}
    </AnimatePresence>
  );
}
