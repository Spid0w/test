// Roulette Farm Background Worker
let isRunning = false;
let accounts = [];
let totalSpinsTarget = 0;
let currentSpins = 0;
let plateau1Bets = {};
let plateau2Bets = {};
let delay = 2000; // Default 2 seconds per spin

function calculateWinLogic(result, bets) {
  const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
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
  if (result === 0 && totalWin < (totalBet * 35)) {
    const refund = (totalBet - (bets["0"] || 0)) * 0.5;
    if (refund > 0) finalWin += refund;
  }

  return finalWin;
}

function runSpin() {
  if (!isRunning || currentSpins >= totalSpinsTarget) {
    isRunning = false;
    self.postMessage({ action: "finished", accounts });
    return;
  }

  currentSpins++;
  
  accounts.forEach(acc => {
    if (acc.isBankrupt) return;

    const bets = acc.plateauType === 1 ? plateau1Bets : plateau2Bets;
    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

    if (acc.balance < totalBet) {
      acc.isBankrupt = true;
      acc.bankruptcySpin = currentSpins - 1;
      return;
    }

    acc.balance -= totalBet;
    const result = Math.floor(Math.random() * 37);
    const win = calculateWinLogic(result, bets);
    acc.balance += win;
    acc.lastResult = result;
    acc.lastWin = win;

    if (acc.balance > acc.maxBalance) acc.maxBalance = acc.balance;
    if (acc.balance < acc.minBalance) acc.minBalance = acc.balance;
    
    if (acc.balance <= 0) {
       acc.isBankrupt = true;
       acc.bankruptcySpin = currentSpins;
    }
  });

  self.postMessage({ 
    action: "update", 
    accounts, 
    progress: (currentSpins / totalSpinsTarget) * 100,
    currentSpins
  });

  setTimeout(runSpin, delay);
}

self.onmessage = function(e) {
  const { action, payload } = e.data;

  if (action === "start") {
    isRunning = true;
    accounts = payload.accounts; // Array of { id, balance, plateauType, maxBalance, minBalance, isBankrupt, etc }
    totalSpinsTarget = payload.totalSpins;
    plateau1Bets = payload.plateau1Bets;
    plateau2Bets = payload.plateau2Bets;
    delay = payload.delay || 2000;
    currentSpins = 0;
    runSpin();
  }

  if (action === "stop") {
    isRunning = false;
  }
};
