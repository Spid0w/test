"use client";

import { randomEngine } from "@/utils/randomEngine";
import Link from "next/link";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export function StrangeLink({ 
  href, 
  children,
  className = ""
}: { 
  href: string; 
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    const chance = Math.random();

    // 20% chance to just trigger a random event and NOT navigate
    if (chance < 0.2) {
      e.preventDefault();
      randomEngine.triggerEvent();
      return;
    }

    // 10% chance to duplicate popups before navigating
    if (chance > 0.9) {
      randomEngine.triggerEvent("POPUP_ERROR");
      setTimeout(() => randomEngine.triggerEvent("POPUP_ANTIVIRUS"), 200);
      setTimeout(() => randomEngine.triggerEvent("POPUP_ERROR"), 400);
    }
    
    // 5% chance to redirect to /void instead of intended
    if (chance > 0.45 && chance < 0.5) {
      e.preventDefault();
      router.push("/void");
    }
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`relative inline-block hover:text-red-500 transition-colors duration-300 ${className}`}
      onMouseEnter={() => {
        // very low chance to jumpscare on hover
        if (Math.random() < 0.05) {
          randomEngine.triggerEvent("JUMPSCARE");
        }
      }}
    >
      {children}
    </Link>
  );
}
