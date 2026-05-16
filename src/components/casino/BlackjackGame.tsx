"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBalance } from "@/context/BalanceContext";
import { 
  Coins, 
  RotateCcw, 
  User, 
  ChevronDown, 
  Plus, 
  Minus,
  Play,
  Hand,
  Trophy,
  AlertCircle
} from "lucide-react";

// --- Types ---

type Suit = "spades" | "hearts" | "diamonds" | "clubs";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

interface HandData {
  cards: Card[];
  bet: number;
  status: "betting" | "active" | "standing" | "busted" | "blackjack" | "doubled";
  id: number;
}

type GameState = "betting" | "dealing" | "player-turn" | "dealer-turn" | "settled";

// --- Utilities ---

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      let value = parseInt(rank);
      if (["J", "Q", "K"].includes(rank)) value = 10;
      if (rank === "A") value = 11;
      deck.push({ suit, rank, value });
    });
  });
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const calculateHandValue = (cards: Card[]): number => {
  let value = cards.reduce((acc, card) => acc + card.value, 0);
  let aces = cards.filter(card => card.rank === "A").length;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  return value;
};

// --- Components ---

const CardComponent = ({ card, hidden = false, index = 0 }: { card: Card, hidden?: boolean, index?: number }) => {
  const suitSymbols: Record<Suit, string> = {
    spades: "♠",
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣"
  };

  const suitColor: Record<Suit, string> = {
    spades: "text-zinc-900",
    hearts: "text-red-600",
    diamonds: "text-red-600",
    clubs: "text-zinc-900"
  };

  return (
    <motion.div
      initial={{ y: -200, opacity: 0, rotate: 180 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      className={`relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 ${hidden ? "bg-zinc-800 border-[#d4af37]/50" : "bg-white border-white"} shadow-2xl overflow-hidden`}
    >
      {hidden ? (
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,#27272a,#09090b)] flex items-center justify-center">
          <div className="w-12 h-16 border-2 border-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <span className="text-[#d4af37] font-black italic opacity-20">PL</span>
          </div>
        </div>
      ) : (
        <div className="p-2 h-full flex flex-col justify-between text-black">
          <div className="flex flex-col items-start leading-none">
            <span className="text-lg font-black">{card.rank}</span>
            <span className={`text-sm ${suitColor[card.suit]}`}>{suitSymbols[card.suit]}</span>
          </div>
          <div className={`text-4xl self-center ${suitColor[card.suit]}`}>
            {suitSymbols[card.suit]}
          </div>
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className="text-lg font-black">{card.rank}</span>
            <span className={`text-sm ${suitColor[card.suit]}`}>{suitSymbols[card.suit]}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export function BlackjackGame() {
  const { balance, updateBalance } = useBalance();
  const [gameState, setGameState] = useState<GameState>("betting");
  const [deck, setDeck] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<HandData[]>([
    { cards: [], bet: 10, status: "betting", id: 0 }
  ]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [message, setMessage] = useState("Placez vos paris");
  const [showResult, setShowResult] = useState(false);

  // Sound effects would go here in a real app

  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setDealerHand([]);
    setPlayerHands(prev => prev.map(h => ({ ...h, cards: [], status: "active" })));
    setGameState("dealing");
    setMessage("Distribution...");
    setShowResult(false);
  };

  const dealInitialCards = useCallback(() => {
    if (gameState !== "dealing") return;

    let currentDeck = [...deck];
    const newDealerHand: Card[] = [];
    const newPlayerHands = [...playerHands];

    // Deal 2 cards to each player hand and 1 to dealer
    for (let i = 0; i < 2; i++) {
      newPlayerHands.forEach(hand => {
        const card = currentDeck.pop()!;
        hand.cards.push(card);
      });
      if (i === 0) {
        const card = currentDeck.pop()!;
        newDealerHand.push(card);
      }
    }

    setDeck(currentDeck);
    setDealerHand(newDealerHand);
    setPlayerHands(newPlayerHands);

    // Check for player blackjack immediately
    newPlayerHands.forEach(hand => {
      if (calculateHandValue(hand.cards) === 21) {
        hand.status = "blackjack";
      }
    });

    setGameState("player-turn");
    setActiveHandIndex(0);
    
    // If all hands are blackjack, go to dealer
    if (newPlayerHands.every(h => h.status === "blackjack")) {
      handleDealerTurn();
    }
  }, [gameState, deck, playerHands]);

  useEffect(() => {
    if (gameState === "dealing") {
      const timer = setTimeout(dealInitialCards, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, dealInitialCards]);

  const handleHit = () => {
    if (gameState !== "player-turn") return;

    const currentDeck = [...deck];
    const card = currentDeck.pop()!;
    const newHands = [...playerHands];
    const currentHand = newHands[activeHandIndex];

    currentHand.cards.push(card);
    const value = calculateHandValue(currentHand.cards);

    if (value > 21) {
      currentHand.status = "busted";
      moveToNextHand(newHands);
    } else if (value === 21) {
      currentHand.status = "standing";
      moveToNextHand(newHands);
    }

    setDeck(currentDeck);
    setPlayerHands(newHands);
  };

  const handleStand = () => {
    if (gameState !== "player-turn") return;
    const newHands = [...playerHands];
    newHands[activeHandIndex].status = "standing";
    moveToNextHand(newHands);
    setPlayerHands(newHands);
  };

  const handleDouble = () => {
    if (gameState !== "player-turn") return;
    const currentHand = playerHands[activeHandIndex];
    if (balance === null || balance < currentHand.bet) return;

    updateBalance(-currentHand.bet);
    
    const currentDeck = [...deck];
    const card = currentDeck.pop()!;
    const newHands = [...playerHands];
    const targetHand = newHands[activeHandIndex];

    targetHand.cards.push(card);
    targetHand.bet *= 2;
    targetHand.status = "doubled";

    const value = calculateHandValue(targetHand.cards);
    if (value > 21) targetHand.status = "busted";
    else targetHand.status = "standing";

    setDeck(currentDeck);
    setPlayerHands(newHands);
    moveToNextHand(newHands);
  };

  const moveToNextHand = (currentHands: HandData[]) => {
    const nextIndex = activeHandIndex + 1;
    if (nextIndex < currentHands.length) {
      setActiveHandIndex(nextIndex);
    } else {
      setGameState("dealer-turn");
      handleDealerTurn();
    }
  };

  const handleDealerTurn = () => {
    setGameState("dealer-turn");
    setMessage("Le croupier joue...");

    const dealCard = (currentDealerHand: Card[], currentDeck: Card[]) => {
      const value = calculateHandValue(currentDealerHand);
      if (value < 17) {
        setTimeout(() => {
          const card = currentDeck.pop()!;
          const newHand = [...currentDealerHand, card];
          setDealerHand(newHand);
          setDeck(currentDeck);
          dealCard(newHand, currentDeck);
        }, 800);
      } else {
        setTimeout(() => {
          settleGame(currentDealerHand);
        }, 500);
      }
    };

    dealCard([...dealerHand], [...deck]);
  };

  const settleGame = (finalDealerHand: Card[]) => {
    const dealerValue = calculateHandValue(finalDealerHand);
    const dealerBlackjack = finalDealerHand.length === 2 && dealerValue === 21;
    let totalWin = 0;

    const updatedHands = playerHands.map(hand => {
      const playerValue = calculateHandValue(hand.cards);
      const playerBlackjack = hand.cards.length === 2 && playerValue === 21;
      let winAmount = 0;

      if (playerBlackjack) {
        if (dealerBlackjack) {
          winAmount = hand.bet; // Push
        } else {
          winAmount = hand.bet * 2.5; // 3:2 payout
        }
      } else if (playerValue > 21) {
        winAmount = 0;
      } else if (dealerValue > 21) {
        winAmount = hand.bet * 2;
      } else if (playerValue > dealerValue) {
        winAmount = hand.bet * 2;
      } else if (playerValue === dealerValue) {
        winAmount = hand.bet;
      } else {
        winAmount = 0;
      }

      totalWin += winAmount;
      return hand;
    });

    if (totalWin > 0) {
      updateBalance(totalWin);
      const initialTotalBet = playerHands.reduce((a, b) => a + b.bet, 0);
      if (totalWin > initialTotalBet) setMessage("Victoire ! +" + (totalWin - initialTotalBet).toFixed(0) + "$");
      else if (totalWin === initialTotalBet) setMessage("Égalité");
      else setMessage("Perte partielle");
    } else {
      setMessage("Le croupier gagne");
    }

    setGameState("settled");
    setShowResult(true);
  };

  const addHand = () => {
    if (playerHands.length < 3 && gameState === "betting") {
      setPlayerHands([...playerHands, { cards: [], bet: 10, status: "betting", id: playerHands.length }]);
    }
  };

  const removeHand = (id: number) => {
    if (playerHands.length > 1 && gameState === "betting") {
      setPlayerHands(playerHands.filter(h => h.id !== id));
    }
  };

  const updateHandBet = (id: number, delta: number) => {
    if (gameState !== "betting") return;
    setPlayerHands(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, bet: Math.max(10, h.bet + delta) };
      }
      return h;
    }));
  };

  const startGame = () => {
    const totalBet = playerHands.reduce((acc, h) => acc + h.bet, 0);
    if (balance === null || balance < totalBet) {
      setMessage("Solde insuffisant");
      return;
    }
    updateBalance(-totalBet);
    initializeGame();
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto bg-[#0a0a0c] rounded-3xl overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] relative min-h-[700px]">
      {/* Table Surface */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a1c23_0%,#0a0a0c_100%)] opacity-80 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      
      {/* Dealer Area */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-24">
        <div className="flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-1 bg-black/60 rounded-full border border-[#d4af37]/20 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37]">Croupier</span>
              {dealerHand.length > 0 && (
                <span className="text-xs font-bold text-white ml-2">
                  {gameState === "dealer-turn" || gameState === "settled" ? calculateHandValue(dealerHand) : calculateHandValue([dealerHand[0]])}
                </span>
              )}
           </div>
           
           <div className="flex gap-2 h-36">
              <AnimatePresence>
                {dealerHand.map((card, i) => (
                  <CardComponent key={i} card={card} index={i} />
                ))}
                {gameState === "player-turn" && dealerHand.length === 1 && (
                  <CardComponent card={{} as any} hidden index={1} />
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Main Table Info */}
      <div className="relative z-10 flex flex-col items-center justify-center -mt-10 mb-20">
         <motion.div 
            key={message}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
         >
            {message}
         </motion.div>
         {gameState === "betting" && (
           <div className="text-[10px] font-bold text-[#d4af37] uppercase tracking-[0.3em] mt-2 opacity-50">
              European Blackjack • No Bonus
           </div>
         )}
      </div>

      {/* Player Area */}
      <div className="relative z-10 flex flex-1 items-end justify-center gap-4 px-6 pb-12">
        {playerHands.map((hand, idx) => (
          <div key={hand.id} className={`flex flex-col items-center gap-6 p-4 rounded-2xl transition-all duration-500 ${activeHandIndex === idx && gameState === "player-turn" ? "bg-white/5 ring-1 ring-white/10" : "opacity-80"}`}>
            
            {/* Cards */}
            <div className="relative h-40 w-32 flex justify-center items-center">
              <div className="absolute top-0 flex flex-wrap justify-center gap-2 w-full">
                <AnimatePresence>
                  {hand.cards.map((card, i) => (
                    <div key={i} className="first:ml-0 -ml-16 transition-all hover:-translate-y-2">
                       <CardComponent 
                          card={card} 
                          index={i} 
                          hidden={hand.status === "doubled" && i === hand.cards.length - 1 && gameState === "player-turn"} 
                       />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
              {hand.cards.length > 0 && (
                <div className="absolute -bottom-2 px-3 py-1 bg-[#d4af37] text-black text-[10px] font-black rounded-full shadow-lg z-30">
                  {calculateHandValue(hand.cards)}
                </div>
              )}
            </div>

            {/* Bet / Controls */}
            <div className="flex flex-col items-center gap-3">
               {gameState === "betting" ? (
                 <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
                    <button onClick={() => updateHandBet(hand.id, -10)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                      <Minus size={14} />
                    </button>
                    <div className="flex flex-col items-center min-w-[60px]">
                       <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Mise</span>
                       <span className="text-sm font-black text-white">${hand.bet}</span>
                    </div>
                    <button onClick={() => updateHandBet(hand.id, 10)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                      <Plus size={14} />
                    </button>
                    {playerHands.length > 1 && (
                      <button onClick={() => removeHand(hand.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors ml-2">
                        <RotateCcw size={14} />
                      </button>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                    <div className={`px-4 py-1 rounded-full border ${activeHandIndex === idx && gameState === "player-turn" ? "bg-[#d4af37] border-[#d4af37] text-black" : "bg-black/40 border-white/10 text-zinc-400"} text-[10px] font-black uppercase tracking-widest transition-all`}>
                      Mise: ${hand.bet}
                    </div>
                    {hand.status === "busted" && (
                      <span className="text-red-500 text-[10px] font-black uppercase mt-2 animate-bounce">Bust</span>
                    )}
                    {hand.status === "blackjack" && (
                      <span className="text-[#d4af37] text-[10px] font-black uppercase mt-2 animate-pulse">Blackjack</span>
                    )}
                 </div>
               )}
            </div>
          </div>
        ))}
        
        {gameState === "betting" && playerHands.length < 3 && (
          <button 
            onClick={addHand}
            className="self-center mb-24 w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/30 transition-all group"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="relative z-20 h-24 bg-black/60 backdrop-blur-xl border-t border-white/5 px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Mise</span>
               <span className="text-lg font-black text-white">${playerHands.reduce((acc, h) => acc + h.bet, 0)}</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            {gameState === "betting" ? (
              <button 
                onClick={startGame}
                className="px-12 py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#d4af37]/20 flex items-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                Démarrer
              </button>
            ) : gameState === "player-turn" ? (
              <div className="flex gap-3">
                 <button 
                    onClick={handleDouble}
                    disabled={balance === null || balance < playerHands[activeHandIndex].bet}
                    className="px-8 py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                    Double
                 </button>
                 <button 
                    onClick={handleHit}
                    className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                 >
                    Hit
                 </button>
                 <button 
                    onClick={handleStand}
                    className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                 >
                    Stand
                 </button>
              </div>
            ) : gameState === "settled" ? (
              <button 
                onClick={() => setGameState("betting")}
                className="px-12 py-4 bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all"
              >
                Nouveau Tour
              </button>
            ) : null}
         </div>

         <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dernier Gain</span>
               <span className="text-lg font-black text-[#d4af37]">$0.00</span>
            </div>
         </div>
      </div>

      {/* Modern Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-64 h-64 bg-[#d4af37]/5 blur-[100px] rounded-full" />
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37]/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
