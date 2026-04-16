"use client";

import { useEffect } from "react";
import { soundSystem } from "@/utils/soundSystem";
import { randomEngine } from "@/utils/randomEngine";
import { PopupManager } from "./popups/PopupManager";
import { SubliminalFlash } from "./SubliminalFlash";
import { SubliminalText } from "./SubliminalText";
import { FakeChat } from "./FakeChat";
import { GlitchWrapper } from "./glitch/GlitchWrapper";
import { CursorEffects } from "./CursorEffects";
import { useViralTricks } from "@/hooks/useViralTricks";
import { useEasterEggs } from "@/hooks/useEasterEggs";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { useCursedCopy } from "@/hooks/useCursedCopy";
import { WatchingEye } from "./WatchingEye";
import { CursorTraces } from "./CursorTraces";
import { usePathname } from "next/navigation";

export function GlobalEffects() {
  const pathname = usePathname();
  const isRoulettePage = pathname === "/0x8f9b2c/roulette";

  useViralTricks();
  useEasterEggs();
  useIdleDetection();
  useKonamiCode();
  useCursedCopy();

  useEffect(() => {
    // We init sound on first interaction
    const initSoundAndEngine = () => {
      soundSystem.init();
      randomEngine.start();
      window.removeEventListener("click", initSoundAndEngine);
      window.removeEventListener("keydown", initSoundAndEngine);
    };

    window.addEventListener("click", initSoundAndEngine);
    window.addEventListener("keydown", initSoundAndEngine);

    return () => {
      window.removeEventListener("click", initSoundAndEngine);
      window.removeEventListener("keydown", initSoundAndEngine);
      randomEngine.stop(); 
    };
  }, []);

  // DIABLE ALL HORROR/GLITCH EFFECTS ON THE ROULETTE PAGE
  if (isRoulettePage) return null;

  return (
    <>
      <CursorEffects />
      <PopupManager />
      <SubliminalFlash />
      <SubliminalText />
      <FakeChat />
      <GlitchWrapper />
      <WatchingEye />
      <CursorTraces />
    </>
  );
}
