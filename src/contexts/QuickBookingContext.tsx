import { createContext, useContext } from "react";
import type { QuickBookingInitialData } from "@/lib/dashboard/calendar-inbox";

interface QuickBookingContextType {
  openQuickBooking: (initialData?: QuickBookingInitialData) => void;
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
