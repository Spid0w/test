"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface BalanceContextType {
  balance: number | null;
  setBalance: (amount: number) => void;
  updateBalance: (delta: number) => void;
  hasInitialBalance: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalanceState] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("casino_balance");
    if (saved !== null) {
      setBalanceState(parseFloat(saved));
    }
  }, []);

  const setBalance = (amount: number) => {
    setBalanceState(amount);
    localStorage.setItem("casino_balance", amount.toString());
  };

  const updateBalance = (delta: number) => {
    setBalanceState((prev) => {
      const next = (prev ?? 0) + delta;
      localStorage.setItem("casino_balance", next.toString());
      return next;
    });
  };

  return (
    <BalanceContext.Provider
      value={{
        balance,
        setBalance,
        updateBalance,
        hasInitialBalance: balance !== null,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}
