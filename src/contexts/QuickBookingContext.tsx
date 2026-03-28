import { createContext, useContext } from "react";

interface QuickBookingContextType {
  openQuickBooking: () => void;
}

export const QuickBookingContext = createContext<QuickBookingContextType | undefined>(
  undefined
);

export function useQuickBooking(): QuickBookingContextType {
  const context = useContext(QuickBookingContext);
  if (context === undefined) {
    throw new Error("useQuickBooking must be used within AdminLayout");
  }
  return context;
}
