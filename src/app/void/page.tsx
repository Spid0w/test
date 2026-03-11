import { GlitchText } from "@/components/glitch/GlitchText";
import { StrangeLink } from "@/components/StrangeLink";

export default function VoidPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white font-mono p-4">
      <div className="text-center opacity-70 hover:opacity-100 transition-opacity duration-1000">
        <h1 className="text-sm tracking-[0.5em] uppercase mb-8 opacity-50">
           you stayed too long
        </h1>
        
        <div className="my-24 opacity-20 hover:opacity-80 transition-opacity">
            <GlitchText className="text-xs">nothing remains.</GlitchText>
        </div>

        <div className="fixed bottom-10 right-10 opacity-10 hover:opacity-100">
          <StrangeLink href="/" className="text-[10px] tracking-widest text-red-500/50 hover:text-red-500">
            [return_to_surface]
          </StrangeLink>
        </div>
      </div>
    </main>
  );
}
