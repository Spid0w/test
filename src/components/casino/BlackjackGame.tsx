"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { RotateCcw, Plus, Minus, Play } from "lucide-react";

// --- Types ---
type Suit = "spades" | "hearts" | "diamonds" | "clubs";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

interface Card { suit: Suit; rank: Rank; value: number; }

interface HandData {
  cards: Card[];
  bet: number;
  doubled: boolean;
  doubleHidden: boolean; // true = double card is face down
  status: "playing" | "standing" | "busted" | "blackjack";
  result: "" | "win" | "lose" | "push" | "blackjack";
}

type Phase = "betting" | "dealing" | "player" | "dealer" | "settled";

// --- Utilities ---
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const buildShoe = (numDecks = 6): Card[] => {
  const shoe: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        let value = parseInt(rank);
        if (["J", "Q", "K"].includes(rank)) value = 10;
        if (rank === "A") value = 11;
        shoe.push({ suit, rank, value });
      });
    });
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
};

const handValue = (cards: Card[]): number => {
  let v = cards.reduce((a, c) => a + c.value, 0);
  let aces = cards.filter(c => c.rank === "A").length;
  while (v > 21 && aces > 0) { v -= 10; aces--; }
  return v;
};

const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards) === 21;

// --- Card Component ---
const PlayingCard = ({ card, hidden = false, delay = 0 }: { card: Card; hidden?: boolean; delay?: number }) => {
  const symbols: Record<Suit, string> = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };
  const red = card.suit === "hearts" || card.suit === "diamonds";

  return (
    <motion.div
      initial={{ y: -120, opacity: 0, rotateY: 180 }}
      animate={{ y: 0, opacity: 1, rotateY: 0 }}
      transition={{ delay, type: "spring", stiffness: 120, damping: 14 }}
      className="relative flex-shrink-0"
      style={{ width: 72, height: 104 }}
    >
      <div className={`w-full h-full rounded-lg border shadow-xl overflow-hidden ${hidden ? "bg-gradient-to-br from-[#1a1a2e] to-[#0a0a15] border-[#d4af37]/40" : "bg-gradient-to-br from-white to-gray-100 border-gray-300"}`}>
        {hidden ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-14 rounded border border-[#d4af37]/20 flex items-center justify-center">
              <span className="text-[#d4af37]/30 text-lg font-black">♠</span>
            </div>
          </div>
        ) : (
          <div className="p-1.5 h-full flex flex-col justify-between">
            <div className="leading-none">
              <div className={`text-sm font-black ${red ? "text-red-600" : "text-zinc-900"}`}>{card.rank}</div>
              <div className={`text-xs ${red ? "text-red-600" : "text-zinc-900"}`}>{symbols[card.suit]}</div>
            </div>
            <div className={`text-2xl self-center ${red ? "text-red-600" : "text-zinc-900"}`}>{symbols[card.suit]}</div>
            <div className="leading-none self-end rotate-180">
              <div className={`text-sm font-black ${red ? "text-red-600" : "text-zinc-900"}`}>{card.rank}</div>
              <div className={`text-xs ${red ? "text-red-600" : "text-zinc-900"}`}>{symbols[card.suit]}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Hand Display ---
const HandDisplay = ({ hand, isActive, phase }: { hand: HandData; isActive: boolean; phase: Phase }) => {
  const fullVal = handValue(hand.cards);
  const visibleVal = hand.doubleHidden ? handValue(hand.cards.slice(0, -1)) : fullVal;
  const showBust = hand.status === "busted" && !hand.doubleHidden;
  const resultColors: Record<string, string> = {
    win: "text-emerald-400", lose: "text-red-500", push: "text-yellow-400", blackjack: "text-[#d4af37]", "": "text-white"
  };
  const resultLabels: Record<string, string> = {
    win: "GAGNÉ", lose: "PERDU", push: "ÉGALITÉ", blackjack: "BLACKJACK!", "": ""
  };

  return (
    <div className={`flex flex-col items-center gap-3 p-3 rounded-xl transition-all duration-300 min-w-[140px] ${isActive ? "bg-white/[0.04] ring-1 ring-[#d4af37]/30 scale-105" : ""}`}>
      {/* Cards fan */}
      <div className="flex items-end" style={{ minHeight: 110 }}>
        {hand.cards.map((card, i) => (
          <div key={i} style={{ marginLeft: i > 0 ? -28 : 0, zIndex: i }}>
            <PlayingCard
              card={card}
              hidden={hand.doubleHidden && i === hand.cards.length - 1}
              delay={i * 0.15}
            />
          </div>
        ))}
      </div>

      {/* Score badge */}
      {hand.cards.length > 0 && (
        <div className={`px-3 py-1 rounded-full text-xs font-black ${
          showBust ? "bg-red-500/20 text-red-400" :
          hand.status === "blackjack" ? "bg-[#d4af37]/20 text-[#d4af37]" :
          isActive ? "bg-[#d4af37] text-black" : "bg-zinc-800 text-zinc-300"
        }`}>
          {showBust ? `BUST (${fullVal})` : hand.status === "blackjack" ? "BJ 21" : hand.doubleHidden ? `${visibleVal} + ?` : fullVal}
        </div>
      )}

      {/* Bet chip */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] border-2 border-[#e8c84a] flex items-center justify-center shadow-lg">
          <span className="text-[8px] font-black text-black">${hand.bet}</span>
        </div>
        {hand.doubled && <span className="text-[9px] font-bold text-[#d4af37] uppercase">×2</span>}
      </div>

      {/* Result */}
      {phase === "settled" && hand.result && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-xs font-black uppercase ${resultColors[hand.result]}`}>
          {resultLabels[hand.result]}
        </motion.div>
      )}
    </div>
  );
};

// --- Main Component ---
export function BlackjackGame() {
  const { balance, updateBalance } = useBalance();
  const [phase, setPhase] = useState<Phase>("betting");
  const [shoe, setShoe] = useState<Card[]>(() => buildShoe());
  const [dealer, setDealer] = useState<Card[]>([]);
  const [hands, setHands] = useState<HandData[]>([
    { cards: [], bet: 10, doubled: false, doubleHidden: false, status: "playing", result: "" }
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [message, setMessage] = useState("Placez vos paris");
  const [lastWin, setLastWin] = useState(0);
  const shoeRef = useRef(shoe);
  shoeRef.current = shoe;

  const drawCard = (): Card => {
    const s = [...shoeRef.current];
    if (s.length < 20) {
      const fresh = buildShoe();
      s.push(...fresh);
    }
    const card = s.pop()!;
    shoeRef.current = s;
    setShoe(s);
    return card;
  };

  // --- DEAL ---
  const startGame = () => {
    const totalBet = hands.reduce((a, h) => a + h.bet, 0);
    if (balance === null || balance < totalBet) { setMessage("Solde insuffisant"); return; }

    updateBalance(-totalBet);
    setLastWin(0);
    setMessage("Distribution...");

    const newHands: HandData[] = hands.map(h => ({
      ...h, cards: [] as Card[], doubled: false, doubleHidden: false, status: "playing" as HandData["status"], result: "" as HandData["result"]
    }));

    // Deal: player card, dealer card, player card (European = 1 dealer card)
    newHands.forEach(h => h.cards.push(drawCard()));
    const dealerCards = [drawCard()];
    newHands.forEach(h => h.cards.push(drawCard()));

    // Check natural blackjacks
    newHands.forEach(h => { if (isBlackjack(h.cards)) h.status = "blackjack"; });

    setDealer(dealerCards);
    setHands(newHands);
    setActiveIdx(0);
    setPhase("player");

    // If all hands are blackjack, skip to dealer
    if (newHands.every(h => h.status === "blackjack")) {
      setTimeout(() => runDealer(newHands, dealerCards), 800);
    } else {
      setMessage("Votre tour");
      // Find first playable hand
      const firstPlayable = newHands.findIndex(h => h.status === "playing");
      if (firstPlayable >= 0) setActiveIdx(firstPlayable);
    }
  };

  // --- PLAYER ACTIONS ---
  const handleHit = () => {
    if (phase !== "player") return;
    const newHands = hands.map(h => ({ ...h, cards: [...h.cards] }));
    const h = newHands[activeIdx];
    h.cards.push(drawCard());
    const v = handValue(h.cards);
    if (v > 21) h.status = "busted";
    else if (v === 21) h.status = "standing";
    setHands(newHands);
    if (h.status !== "playing") advanceHand(newHands, activeIdx);
  };

  const handleStand = () => {
    if (phase !== "player") return;
    const newHands = hands.map(h => ({ ...h, cards: [...h.cards] }));
    newHands[activeIdx].status = "standing";
    setHands(newHands);
    advanceHand(newHands, activeIdx);
  };

  const handleDouble = (faceDown: boolean) => {
    if (phase !== "player") return;
    const h = hands[activeIdx];
    if (h.cards.length !== 2) return; // Can only double on first 2 cards
    if (balance === null || balance < h.bet) return;

    updateBalance(-h.bet);
    const newHands = hands.map(hh => ({ ...hh, cards: [...hh.cards] }));
    const target = newHands[activeIdx];
    target.cards.push(drawCard());
    target.bet *= 2;
    target.doubled = true;
    target.doubleHidden = faceDown;

    if (faceDown) {
      // Face down: don't reveal bust, always stand — will check on dealer reveal
      target.status = "standing";
    } else {
      const v = handValue(target.cards);
      if (v > 21) target.status = "busted";
      else target.status = "standing";
    }

    setHands(newHands);
    advanceHand(newHands, activeIdx);
  };

  const advanceHand = (currentHands: HandData[], fromIdx: number) => {
    const next = currentHands.findIndex((h, i) => i > fromIdx && h.status === "playing");
    if (next >= 0) {
      setActiveIdx(next);
    } else {
      // All hands done -> dealer turn
      setTimeout(() => runDealer(currentHands, dealer), 600);
    }
  };

  // --- DEALER ---
  const runDealer = (finalHands: HandData[], currentDealer: Card[]) => {
    setPhase("dealer");
    setMessage("Le croupier joue...");

    // Reveal all hidden double cards and check for busts
    const revealed = finalHands.map(h => {
      const newH = { ...h, doubleHidden: false, cards: [...h.cards] };
      if (h.doubleHidden && h.doubled) {
        const v = handValue(newH.cards);
        if (v > 21) newH.status = "busted";
      }
      return newH;
    });
    setHands(revealed);

    // Check if all player hands are busted
    const allBusted = revealed.every(h => h.status === "busted");
    if (allBusted) {
      setTimeout(() => settle(revealed, currentDealer), 500);
      return;
    }

    // Dealer draws
    let dealerCards = [...currentDealer];
    const dealNext = () => {
      const v = handValue(dealerCards);
      if (v < 17) {
        dealerCards = [...dealerCards, drawCard()];
        setDealer([...dealerCards]);
        setTimeout(dealNext, 700);
      } else {
        setTimeout(() => settle(revealed, dealerCards), 500);
      }
    };
    setTimeout(dealNext, 600);
  };

  // --- SETTLE ---
  const settle = (finalHands: HandData[], finalDealer: Card[]) => {
    const dv = handValue(finalDealer);
    const dBJ = isBlackjack(finalDealer);
    let totalWin = 0;

    const settled = finalHands.map(h => {
      const pv = handValue(h.cards);
      const pBJ = isBlackjack(h.cards);
      let win = 0;
      let result: HandData["result"] = "lose";

      if (pBJ) {
        if (dBJ) { win = h.bet; result = "push"; }
        else { win = h.bet * 2.5; result = "blackjack"; }
      } else if (pv > 21) {
        win = 0; result = "lose";
      } else if (dv > 21) {
        win = h.bet * 2; result = "win";
      } else if (pv > dv) {
        win = h.bet * 2; result = "win";
      } else if (pv === dv) {
        win = h.bet; result = "push";
      } else {
        win = 0; result = "lose";
      }

      totalWin += win;
      return { ...h, result };
    });

    if (totalWin > 0) updateBalance(totalWin);
    setLastWin(totalWin);
    setHands(settled);

    const totalBet = settled.reduce((a, h) => a + h.bet, 0);
    if (totalWin > totalBet) setMessage(`Victoire ! +${(totalWin - totalBet).toFixed(0)}$`);
    else if (totalWin === totalBet) setMessage("Égalité");
    else if (totalWin > 0) setMessage("Perte partielle");
    else setMessage("Le croupier gagne");

    setPhase("settled");
  };

  // --- BETTING CONTROLS ---
  const addHand = () => {
    if (hands.length < 3 && phase === "betting") {
      setHands([...hands, { cards: [], bet: 10, doubled: false, doubleHidden: false, status: "playing", result: "" }]);
    }
  };

  const removeHand = (idx: number) => {
    if (hands.length > 1 && phase === "betting") {
      setHands(hands.filter((_, i) => i !== idx));
    }
  };

  const setBet = (idx: number, delta: number) => {
    if (phase !== "betting") return;
    setHands(prev => prev.map((h, i) => i === idx ? { ...h, bet: Math.max(5, Math.min(1000, h.bet + delta)) } : h));
  };

  const newRound = () => {
    setPhase("betting");
    setDealer([]);
    setHands(prev => prev.map(h => ({ ...h, cards: [], doubled: false, doubleHidden: false, status: "playing" as const, result: "" as const })));
    setMessage("Placez vos paris");
    setActiveIdx(0);
  };

  const canDouble = phase === "player" && hands[activeIdx]?.cards.length === 2 && hands[activeIdx]?.status === "playing";
  const dealerVal = handValue(dealer);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)]" style={{ minHeight: 680 }}>
      {/* Green felt background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d3320] via-[#0a2a1a] to-[#061a10]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
      {/* Gold rail */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

      <div className="relative z-10 flex flex-col" style={{ minHeight: 680 }}>
        {/* Dealer Section */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="flex items-center gap-2 mb-4 px-4 py-1.5 bg-black/50 rounded-full border border-[#d4af37]/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37]">Croupier</span>
            {dealer.length > 0 && (
              <span className="text-sm font-black text-white ml-2">
                {phase === "dealer" || phase === "settled" ? dealerVal : handValue([dealer[0]])}
              </span>
            )}
          </div>

          <div className="flex items-end justify-center" style={{ minHeight: 110 }}>
            <AnimatePresence>
              {dealer.map((card, i) => (
                <div key={`d-${i}`} style={{ marginLeft: i > 0 ? -28 : 0, zIndex: i }}>
                  <PlayingCard card={card} delay={i * 0.2} />
                </div>
              ))}
              {phase === "player" && dealer.length === 1 && (
                <div style={{ marginLeft: -28, zIndex: 1 }}>
                  <PlayingCard card={{} as Card} hidden delay={0.3} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center message */}
        <div className="flex flex-col items-center py-4">
          <motion.div key={message} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black italic uppercase text-white/90 tracking-tight drop-shadow-lg">
            {message}
          </motion.div>
          {phase === "betting" && (
            <div className="text-[9px] font-bold text-[#d4af37]/50 uppercase tracking-[0.3em] mt-1">
              Blackjack Européen • Sans Bonus
            </div>
          )}
        </div>

        {/* Player Hands */}
        <div className="flex-1 flex items-center justify-center gap-6 px-4 pb-4">
          {hands.map((hand, idx) => (
            <div key={idx}>
              {phase === "betting" ? (
                /* Betting UI */
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Main {idx + 1}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setBet(idx, -5)} className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all active:scale-90">
                      <Minus size={14} />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#a08520] border-4 border-[#e8c84a] flex items-center justify-center shadow-xl shadow-[#d4af37]/20">
                      <span className="text-sm font-black text-black">${hand.bet}</span>
                    </div>
                    <button onClick={() => setBet(idx, 5)} className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all active:scale-90">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {[10, 25, 50, 100].map(v => (
                      <button key={v} onClick={() => setHands(prev => prev.map((h, i) => i === idx ? { ...h, bet: v } : h))} className={`px-2 py-1 rounded text-[9px] font-black transition-all ${hand.bet === v ? "bg-[#d4af37] text-black" : "bg-black/30 text-zinc-500 hover:text-white"}`}>
                        ${v}
                      </button>
                    ))}
                  </div>
                  {hands.length > 1 && (
                    <button onClick={() => removeHand(idx)} className="text-[9px] text-red-500/60 hover:text-red-400 font-bold uppercase transition-colors">Retirer</button>
                  )}
                </div>
              ) : (
                <HandDisplay hand={hand} isActive={activeIdx === idx && phase === "player"} phase={phase} />
              )}
            </div>
          ))}

          {phase === "betting" && hands.length < 3 && (
            <button onClick={addHand} className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-600 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all group">
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            </button>
          )}
        </div>

        {/* Action Bar */}
        <div className="bg-black/60 backdrop-blur-md border-t border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Total Mise</span>
              <span className="text-base font-black text-white">${hands.reduce((a, h) => a + h.bet, 0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Dernier Gain</span>
              <span className={`text-base font-black ${lastWin > 0 ? "text-emerald-400" : "text-zinc-500"}`}>${lastWin.toFixed(2)}</span>
            </div>
          </div>

          {/* Center actions */}
          <div className="flex items-center gap-2">
            {phase === "betting" && (
              <button onClick={startGame} className="px-10 py-3 bg-[#d4af37] text-black font-black uppercase text-sm tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#d4af37]/20 flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Distribuer
              </button>
            )}

            {phase === "player" && hands[activeIdx]?.status === "playing" && (
              <>
                <button onClick={handleHit} className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all">
                  Tirer
                </button>
                <button onClick={handleStand} className="px-6 py-3 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all">
                  Rester
                </button>
                {canDouble && (
                  <>
                    <button onClick={() => handleDouble(false)} disabled={balance === null || balance < hands[activeIdx].bet} className="px-4 py-3 bg-[#d4af37]/90 text-black font-black uppercase text-[10px] tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      Double ↑
                    </button>
                    <button onClick={() => handleDouble(true)} disabled={balance === null || balance < hands[activeIdx].bet} className="px-4 py-3 bg-zinc-700 text-white font-black uppercase text-[10px] tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      Double ↓
                    </button>
                  </>
                )}
              </>
            )}

            {phase === "settled" && (
              <button onClick={newRound} className="px-10 py-3 bg-zinc-800 text-white font-black uppercase text-sm tracking-widest rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Nouveau Tour
              </button>
            )}
          </div>

          {/* Right info */}
          <div className="text-right">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Solde</span>
            <div className="text-base font-black text-[#d4af37]">${balance?.toFixed(2) ?? "0.00"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
