import { cn } from "@/utils/cn";

export function GlitchText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("glitch-text font-bold", className)} data-text={children}>
      {children}
    </span>
  );
}
