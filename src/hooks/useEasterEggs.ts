"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useEasterEggs() {
  const router = useRouter();
  const [keySequence, setKeySequence] = useState<string>("");

  useEffect(() => {
    // Hidden console message
    console.log(
      "%cWHAT ARE YOU LOOKING AT?",
      "color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 0 #000, -2px -2px 0 #fff;"
    );
    console.log("%cMaybe you should stop digging.", "font-size: 16px; color: gray;");
    
    // Keyboard sequence watcher
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeySequence((prev) => {
        const next = (prev + e.key.toLowerCase()).slice(-8); // keep last 8 chars
        
        if (next === "observer") {
          console.log("You found me.");
          router.push("/observer");
          return "";
        }
        
        if (next.endsWith("glitch")) {
          router.push("/glitch");
          return "";
        }

        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
