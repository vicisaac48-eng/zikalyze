import { createContext, useContext, ReactNode, useMemo } from "react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import type { CryptoPrice } from "@/hooks/useCryptoPrices";

interface PriceDataContextValue {
  prices: CryptoPrice[];
  loading: boolean;
  isLive: boolean;
  getPriceBySymbol: (symbol: string) => CryptoPrice | undefined;
  getPriceById: (id: string) => CryptoPrice | undefined;
  refetch: () => Promise<void>;
}

const PriceDataContext = createContext<PriceDataContextValue | null>(null);

/**
 * Global PriceDataProvider - Creates a single instance of useCryptoPrices
 * at the app level to share WebSocket connections across all pages/components.
 * 
 * This prevents duplicate WebSocket connections on page navigation and
 * keeps connections alive when switching between pages.
 */
export function PriceDataProvider({ children }: { children: ReactNode }) {
  // Single source of truth for all crypto price data
  const priceData = useCryptoPrices();
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => priceData, [
    priceData.prices,
    priceData.loading,
    priceData.isLive,
    priceData.getPriceBySymbol,
    priceData.getPriceById,
    priceData.refetch
  ]);
  
  return (
    <PriceDataContext.Provider value={value}>
      {children}
    </PriceDataContext.Provider>
  );
}

/**
 * Hook to access shared price data from anywhere in the app.
 * This replaces direct useCryptoPrices() calls in components.
 */
export function usePriceData() {
  const context = useContext(PriceDataContext);
  
  if (!context) {
    throw new Error("usePriceData must be used within a PriceDataProvider");
  }
  
  return context;
}
