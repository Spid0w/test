"use client";

import { useEffect } from "react";

const FAVICONS = [
  "/logo.png", "💀", "👁️", "‼️", "❌", "🚫", "👺", "👽", "👾", "🕸️", "⚰️", "🩸"
];

export function useDynamicFavicon() {
  useEffect(() => {
    const changeFavicon = () => {
      const icon = FAVICONS[Math.floor(Math.random() * FAVICONS.length)];
      
      const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
      (link as HTMLLinkElement).rel = "icon";

      if (icon.startsWith("/")) {
        (link as HTMLLinkElement).href = icon;
      } else {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.font = "60px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(icon, 32, 36);
          (link as HTMLLinkElement).href = canvas.toDataURL();
        }
      }
      
      document.getElementsByTagName("head")[0].appendChild(link);
    };

    // Change immediately and then randomly
    changeFavicon();
    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        changeFavicon();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);
}
