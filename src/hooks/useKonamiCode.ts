"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

export function useKonamiCode() {
  const [input, setInput] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const newInput = [...input, key].slice(-KONAMI_CODE.length);
      
      setInput(newInput);

      if (JSON.stringify(newInput) === JSON.stringify(KONAMI_CODE)) {
        router.push("/classified");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [input, router]);
}
