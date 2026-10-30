import { createContext, useContext, type ReactNode } from 'react';
import { useBanking } from './useBanking';

type BankingState = ReturnType<typeof useBanking>;
const BankingContext = createContext<BankingState | null>(null);
/** Keeps session and operation identity mounted above all routed pages. */
export function BankingProvider({ children }: { children: ReactNode }) {
  const banking = useBanking();
  return <BankingContext.Provider value={banking}>{children}</BankingContext.Provider>;
}
/** Reads the shared coordinator; page changes never instantiate another banking session. */
export function useBankContext() {
  const value = useContext(BankingContext);
  if (!value) throw new Error('BankingProvider is required');
  return value;
}
