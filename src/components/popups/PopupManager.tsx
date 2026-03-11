"use client";

import { useEffect, useState } from "react";
import { randomEngine, TrollEvent } from "@/utils/randomEngine";
import { AnimatePresence } from "framer-motion";

// Import all popups
import { FakeWindowsError } from "./FakeWindowsError";
import { FakeAntivirus } from "./FakeAntivirus";
import { FakeSystemUpdate } from "./FakeSystemUpdate";
import { FakeDownload } from "./FakeDownload";
import { EmojiExplosion } from "./EmojiExplosion";
import { FakeDarknetMarket } from "./FakeDarknetMarket";
import { FakeIPLocator } from "./FakeIPLocator";

export function PopupManager() {
  const [activeEvents, setActiveEvents] = useState<TrollEvent[]>([]);

  useEffect(() => {
    const unsubscribe = randomEngine.subscribe((event) => {
      // Only handle popup events here
      if (event.type.startsWith("POPUP")) {
        setActiveEvents((prev) => [...prev, event]);
      }
    });

    return unsubscribe;
  }, []);

  const closeEvent = (id: string) => {
    setActiveEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <>
      <AnimatePresence>
        {activeEvents.map((event) => {
          switch (event.type) {
            case "POPUP_ERROR":
              return <FakeWindowsError key={event.id} onClose={() => closeEvent(event.id)} />;
            case "POPUP_ANTIVIRUS":
              return <FakeAntivirus key={event.id} onClose={() => closeEvent(event.id)} />;
            case "POPUP_UPDATE":
              return <FakeSystemUpdate key={event.id} onClose={() => closeEvent(event.id)} />;
            case "POPUP_DOWNLOAD":
              return <FakeDownload key={event.id} onClose={() => closeEvent(event.id)} />;
            case "POPUP_EMOJI":
              return <EmojiExplosion key={event.id} onClose={() => closeEvent(event.id)} />;
            case "POPUP_DARKNET":
              return <FakeDarknetMarket key={event.id} onClose={() => closeEvent(event.id)} />;
            case "POPUP_IPLOCATOR":
              return <FakeIPLocator key={event.id} onClose={() => closeEvent(event.id)} />;
            default:
              return null;
          }
        })}
      </AnimatePresence>
    </>
  );
}
