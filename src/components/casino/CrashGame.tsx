import { useBalance } from "@/context/BalanceContext";

export function CrashGame() {
  const { balance, updateBalance } = useBalance();
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<"betting" | "launching" | "crashed" | "won">("betting");
  const [history, setHistory] = useState<number[]>([]);
  const [crashPoint, setCrashPoint] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startLaunch = () => {
    if (balance === null || balance < bet) return;
    updateBalance(-bet);

    const p = 0.99 / (1 - Math.random());
    setCrashPoint(p);
    setGameState("launching");
    setMultiplier(1.0);
    startTimeRef.current = Date.now();
    
    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const currentMult = Math.pow(Math.E, 0.08 * elapsed);
      
      if (currentMult >= p) {
        setGameState("crashed");
        setHistory(prev => [p, ...prev].slice(0, 10));
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setMultiplier(currentMult);
      }
    };

    timerRef.current = setInterval(tick, 50);
  };

  const cashOut = () => {
    if (gameState === "launching") {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState("won");
      updateBalance(bet * multiplier);
    }
  };

  const reset = () => {
    setGameState("betting");
    setMultiplier(1.0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Curve calculation: Parabolic path
  // x increases linearly with time (or log of multiplier)
  // y decreases (goes up) with a curve
  const t = Math.min((multiplier - 1) / 10, 1); // 0 to 1 over 10x
  const rocketX = 10 + t * 70;
  const rocketY = 80 - Math.pow(t, 0.6) * 60;

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-6 bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
      {/* Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Bet Amount</label>
          <div className="relative">
            <input 
              type="number" 
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={gameState !== "betting"}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-black focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50"
            />
            <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => setBet(b => Math.max(1, b/2))} disabled={gameState !== "betting"} className="py-2 bg-zinc-800 rounded-lg text-[10px] font-black uppercase hover:bg-zinc-700 transition-colors">1/2</button>
             <button onClick={() => setBet(b => b*2)} disabled={gameState !== "betting"} className="py-2 bg-zinc-800 rounded-lg text-[10px] font-black uppercase hover:bg-zinc-700 transition-colors">2x</button>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          {gameState === "betting" ? (
            <button 
              onClick={startLaunch}
              className="w-full py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Launch Rocket
            </button>
          ) : gameState === "launching" ? (
            <button 
              onClick={cashOut}
              className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-500 transition-all flex flex-col items-center leading-none"
            >
              <span className="text-xs mb-1 opacity-70">Cash Out</span>
              <span className="text-xl">{(bet * multiplier).toFixed(2)} $</span>
            </button>
          ) : (
            <button 
              onClick={reset}
              className="w-full py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Next Round
            </button>
          )}
        </div>

        {/* History */}
        <div className="mt-4">
           <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Recent History</label>
           <div className="flex flex-wrap gap-2">
             {history.map((h, i) => (
               <span key={i} className={`px-2 py-1 rounded text-[10px] font-black ${h >= 2 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                 {h.toFixed(2)}x
               </span>
             ))}
           </div>
        </div>
      </div>

      {/* Animation Area */}
      <div className="flex-1 relative h-[400px] lg:h-auto min-h-[400px] bg-black rounded-2xl border border-white/5 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }} 
        />
        
        {/* Curve Line Drawing */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
           <motion.path 
             d={`M 10 80 Q 40 80, 80 20`}
             stroke="#d4af37"
             strokeWidth="2"
             fill="none"
             pathLength="1"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: t }}
           />
        </svg>

        {/* Multiplier Display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
           <motion.div 
             key={gameState === "crashed" ? "crashed" : "active"}
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className={`text-7xl lg:text-9xl font-black italic tracking-tighter ${gameState === "crashed" ? "text-red-600" : "text-white"}`}
           >
             {multiplier.toFixed(2)}<span className="text-4xl lg:text-6xl text-zinc-600">x</span>
           </motion.div>
        </div>

        {/* Rocket Animation */}
        <AnimatePresence>
          {(gameState === "launching" || gameState === "won") && (
            <motion.div
              initial={{ x: "10%", y: "80%" }}
              animate={{ 
                x: `${rocketX}%`, 
                y: `${rocketY}%` 
              }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute z-20"
            >
              <div className="relative">
                <Rocket className="w-12 h-12 text-[#d4af37] rotate-45 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                {/* Flame */}
                <motion.div 
                  animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="absolute -bottom-4 -left-1 w-2 h-8 bg-gradient-to-t from-red-600 via-orange-500 to-transparent blur-sm rotate-45 origin-top" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crash / Win Overlays */}
        <AnimatePresence>
          {gameState === "crashed" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] z-30 flex items-center justify-center"
            >
              <div className="text-center bg-black/80 p-8 rounded-2xl border border-red-500/50">
                 <Zap className="w-12 h-12 text-red-500 mx-auto mb-4" />
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">Crashed!</h3>
                 <p className="text-red-500 font-bold uppercase text-xs tracking-widest">Multiplier stopped at {crashPoint.toFixed(2)}x</p>
              </div>
            </motion.div>
          )}
          {gameState === "won" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-950/20 backdrop-blur-[2px] z-30 flex items-center justify-center"
            >
              <div className="text-center bg-black/80 p-8 rounded-2xl border border-green-500/50">
                 <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">Success!</h3>
                 <p className="text-green-500 font-bold uppercase text-xs tracking-widest">Cashed out at {multiplier.toFixed(2)}x</p>
                 <div className="text-2xl font-black text-white mt-4">+{(bet * multiplier).toFixed(2)} $</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Digital Stats */}
        <div className="absolute top-6 left-6 flex gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] z-10">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> NETWORK OK
           </div>
           <div>TICK: {Math.floor(Date.now() / 1000) % 1000}</div>
        </div>
      </div>
    </div>
  );
}
