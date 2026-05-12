"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  status?: "active" | "soon" | "new";
  color?: string;
}

export function GameCard({ title, description, image, href, status = "active", color = "#d4af37" }: GameCardProps) {
  const isSoon = status === "soon";

  const content = (
    <motion.div
      whileHover={!isSoon ? { scale: 1.02, y: -5 } : {}}
      className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm aspect-[4/5] md:aspect-[3/4] flex flex-col ${isSoon ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Status Badge */}
      {status !== "active" && (
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === "soon" ? "bg-zinc-800 text-zinc-400" : "bg-red-600 text-white animate-pulse"}`}>
            {status}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="mt-auto p-6 relative z-10 space-y-2">
        <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 font-medium line-clamp-2">
          {description}
        </p>

        <div className="pt-4 flex items-center justify-between">
          {!isSoon ? (
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-[var(--hover-color)] transition-colors" style={{ "--hover-color": color } as any}>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white transition-colors">
                <Play className="w-4 h-4 fill-current text-white group-hover:text-black" />
              </div>
              PLAY NOW
            </div>
          ) : (
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              COMING SOON
            </div>
          )}
        </div>
      </div>

      {/* Hover Glow */}
      {!isSoon && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 100px ${color}` }}
        />
      )}
    </motion.div>
  );

  if (isSoon) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
