import { GlitchText } from "@/components/glitch/GlitchText";
import Link from "next/link";

export default function YouFoundMePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-4">
      <div className="max-w-md w-full border-4 border-black p-12 text-center shadow-[12px_12px_0px_0px_rgba(255,0,0,1)]">
        <h1 className="text-4xl font-black uppercase mb-8">
           <GlitchText>Congratulations.</GlitchText>
        </h1>
        <p className="text-lg font-bold mb-4">
          You made it to the end of the maze.
        </p>
        <p className="mb-12 font-mono text-sm leading-loose">
          Very few people look this deep. 
          The interface is an illusion. 
          The glitches are by design.
        </p>
        <Link 
            href="/" 
            className="inline-block bg-black text-white font-bold px-8 py-3 uppercase hover:bg-red-600 transition-colors"
        >
            REBOOT SYSTEM
        </Link>
      </div>
    </main>
  );
}
