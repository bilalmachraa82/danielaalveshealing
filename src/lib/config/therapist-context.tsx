import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONFIG, type TherapistConfig } from "./therapist";

const TherapistContext = createContext<TherapistConfig>(DEFAULT_CONFIG);

interface TherapistProviderProps {
  readonly config?: TherapistConfig;
  readonly children: ReactNode;
}

export function TherapistProvider({
  config = DEFAULT_CONFIG,
  children,
}: TherapistProviderProps) {
  return (
    <TherapistContext.Provider value={config}>
      {children}
    </TherapistContext.Provider>
  );
}

export function useTherapist(): TherapistConfig {
  return useContext(TherapistContext);
}
