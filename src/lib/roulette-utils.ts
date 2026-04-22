export const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export interface WinResult {
  totalWin: number;
  isPartage: boolean;
  finalWin: number;
}

/**
 * Calculates the win for a given result and set of bets.
 */
export function calculateWin(result: number, bets: Record<string, number>): WinResult {
  let totalWin = 0;
  const isResultRed = REDS.includes(result);
  const isResultEven = result !== 0 && result % 2 === 0;
  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  Object.entries(bets).forEach(([betId, amount]) => {
    if (!isNaN(parseInt(betId))) {
      if (parseInt(betId) === result) totalWin += amount * 36;
    } else if (betId.startsWith("split_")) {
      const nums = betId.split("_").slice(1).map(Number);
      if (nums.includes(result)) totalWin += amount * 18;
    } else if (betId.startsWith("corner_")) {
      const nums = betId.split("_").slice(1).map(Number);
      if (nums.includes(result)) totalWin += amount * 9;
    } else if (betId === "doz1" && result >= 1 && result <= 12) totalWin += amount * 3;
    else if (betId === "doz2" && result >= 13 && result <= 24) totalWin += amount * 3;
    else if (betId === "doz3" && result >= 25 && result <= 36) totalWin += amount * 3;
    else if (betId === "col1" && result !== 0 && (result - 1) % 3 === 0) totalWin += amount * 3;
    else if (betId === "col2" && result !== 0 && (result - 2) % 3 === 0) totalWin += amount * 3;
    else if (betId === "col3" && result !== 0 && result % 3 === 0) totalWin += amount * 3;
    else if (betId === "red" && isResultRed) totalWin += amount * 2;
    else if (betId === "black" && !isResultRed && result !== 0) totalWin += amount * 2;
    else if (betId === "even" && isResultEven) totalWin += amount * 2;
    else if (betId === "odd" && !isResultEven && result !== 0) totalWin += amount * 2;
    else if (betId === "low" && result >= 1 && result <= 18) totalWin += amount * 2;
    else if (betId === "high" && result >= 19 && result <= 36) totalWin += amount * 2;
  });

  let finalWin = totalWin;
  let isPartage = false;

  // Rule: If 0 hits and no direct win, return 50% of 1:1 bets
  if (result === 0 && totalWin < (totalBet * 35)) {
    const refund = (totalBet - (bets["0"] || 0)) * 0.5;
    if (refund > 0) {
      finalWin += refund;
      isPartage = true;
    }
  }

  return { totalWin, isPartage, finalWin };
}

export function generateResult(): number {
  return Math.floor(Math.random() * 37);
}
