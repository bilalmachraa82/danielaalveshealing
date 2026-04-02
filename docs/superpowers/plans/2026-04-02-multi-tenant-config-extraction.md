# Multi-Tenant Config Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract all hardcoded client-specific values from 22 files into a centralized config system, enabling per-client customization by editing a single file.

**Architecture:** A `TherapistConfig` type with a `DEFAULT_CONFIG` constant holds all values. A React context (`useTherapist()`) distributes config to components. A server helper (`getServerConfig()`) provides the same values to API handlers. Service-related lookups (`getServiceLabel`, `getServicePrice`) replace scattered `SERVICE_LABELS`/`SERVICE_COLORS` duplicates.

**Tech Stack:** React context, TypeScript, Vitest.

---

## File Map

- Create: `src/lib/config/therapist.ts` — TherapistConfig type + DEFAULT_CONFIG
- Create: `src/lib/config/therapist-context.tsx` — React context provider + useTherapist hook
- Create: `src/lib/config/services.ts` — service helper functions
- Create: `src/lib/config/services.test.ts` — service helper tests
- Create: `api/_config.ts` — server-side config
- Modify: `src/App.tsx` — wrap with TherapistProvider
- Modify: `src/components/Navigation.tsx` — use config for WA_LINK, logo
- Modify: `src/components/Footer.tsx` — use config for all contact/social
- Modify: `src/components/Hero.tsx` — use config for quote
- Modify: `src/components/LoadingScreen.tsx` — use config for name/tagline
- Modify: `src/components/CTABanner.tsx` — use config for WA_LINK
- Modify: `src/components/WhatsAppFloat.tsx` — use config for WA_LINK
- Modify: `src/components/GiftVoucher.tsx` — use config for WA_LINK
- Modify: `src/components/About.tsx` — use config for brand color
- Modify: `src/components/Services.tsx` — use config for services/prices
- Modify: `src/pages/admin/Dashboard.tsx` — use service helpers, config colors
- Modify: `src/pages/admin/Settings.tsx` — use config colors
- Modify: `src/pages/admin/SessionDetail.tsx` — use service helpers
- Modify: `src/components/admin/QuickBooking.tsx` — use service helpers + config colors
- Modify: `src/contexts/AuthContext.tsx` — use config for localStorage key
- Modify: `src/pages/public/PreparePage.tsx` — use config for address/quotes
- Modify: `src/pages/public/PrivacyPolicy.tsx` — use config for legal name/address
- Modify: `src/pages/public/HomeHarmonyPage.tsx` — use config for WA_LINK
- Modify: `api/_email.ts` — use server config for FROM
- Modify: `api/_calendar.ts` — use server config for labels/colors/location
- Modify: `api/cron/index.ts` — use server config where needed

---

## Task 1: Core Config — Types, Defaults, Context

**Files:**
- Create: `src/lib/config/therapist.ts`
- Create: `src/lib/config/therapist-context.tsx`
- Create: `src/lib/config/services.ts`
- Create: `src/lib/config/services.test.ts`
- Create: `api/_config.ts`

- [ ] **Step 1.1: Create TherapistConfig type and DEFAULT_CONFIG**

Create `src/lib/config/therapist.ts`:

```typescript
export interface ServiceConfig {
  id: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  priceCents: number;
  priceDisplay: string;
  durationMinutes: number;
  calendarColorId: string;
  whatsappMessagePt: string;
  whatsappMessageEn: string;
}

export interface TherapistConfig {
  name: string;
  tagline: string;
  fullBusinessName: string;
  email: string;
  phone: string;
  phoneFormatted: string;
  whatsappBase: string;
  address: {
    street: string;
    city: string;
    postal: string;
    country: string;
    full: string;
    mapsUrl: string;
  };
  parking: { pt: string; en: string };
  entryInstructions: { pt: string; en: string };
  preparationTips: { pt: string; en: string };
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: {
    src: string;
    alt: string;
  };
  quotes: {
    main: { pt: string; en: string };
    author: string;
  };
  socialLinks: {
    instagram?: string;
    youtube?: string;
    googleReview?: string;
  };
  services: ServiceConfig[];
  localStoragePrefix: string;
}

export const DEFAULT_CONFIG: TherapistConfig = {
  name: "Daniela Alves",
  tagline: "Healing & Wellness",
  fullBusinessName: "Daniela Alves Healing & Wellness",
  email: "daniela@danielaalveshealing.com",
  phone: "351914173445",
  phoneFormatted: "+351 914 173 445",
  whatsappBase: "https://wa.me/351914173445",
  address: {
    street: "R. do Regueiro do Tanque 3",
    city: "Fontanelas, São João das Lampas",
    postal: "2705-415 Sintra",
    country: "Portugal",
    full: "R. do Regueiro do Tanque 3, Fontanelas, São João das Lampas, 2705-415 Sintra",
    mapsUrl: "https://maps.google.com/?q=R.+do+Regueiro+do+Tanque+3,+Fontanelas,+S%C3%A3o+Jo%C3%A3o+das+Lampas,+2705-415+Sintra",
  },
  parking: {
    pt: "Parque da Aguda (indicado na chegada).",
    en: "Parque da Aguda (signposted on arrival).",
  },
  entryInstructions: {
    pt: "Entre pelo portão, não toque na campainha. Siga o caminho até à casa de madeira.",
    en: "Enter through the gate, no need to ring the doorbell. Follow the path to the wooden house.",
  },
  preparationTips: {
    pt: "Sem perfume no dia da sessão. Refeição leve nas 24h anteriores. Mantenha-se hidratada e evite estimulantes (café, álcool). Não há chuveiro disponível.",
    en: "No perfume on the day of the session. Light meals in the 24 hours before. Stay hydrated and avoid stimulants (coffee, alcohol). No shower available.",
  },
  colors: {
    primary: "#985F97",
    primaryHover: "#7d4e7c",
    secondary: "#D9AA4F",
    background: "#FAF7F5",
  },
  fonts: {
    heading: "Cormorant Garamond",
    body: "DM Sans",
  },
  logo: {
    src: "/images/logo.webp",
    alt: "Daniela Alves - Terapeuta Holística em Sintra",
  },
  quotes: {
    main: {
      pt: "Quando o corpo relaxa e harmoniza, o Ser cria condições para regressar à sua mais genuína Expressão.",
      en: "When the body relaxes and harmonises, the Being creates the conditions to return to its most genuine Expression.",
    },
    author: "Daniela Alves",
  },
  socialLinks: {
    instagram: "https://www.instagram.com/danielaalves_healing/",
    youtube: "https://www.youtube.com/@danielaalves-healingwellness",
    googleReview: "https://g.page/r/danielaalveshealing/review",
  },
  services: [
    {
      id: "healing_wellness",
      namePt: "Healing Touch",
      nameEn: "Healing Touch",
      descriptionPt: "Sessão terapêutica holística",
      descriptionEn: "Holistic therapeutic session",
      priceCents: 15000,
      priceDisplay: "150€",
      durationMinutes: 120,
      calendarColorId: "3",
      whatsappMessagePt: "Olá Daniela, gostaria de agendar uma sessão de Healing Touch.",
      whatsappMessageEn: "Hello Daniela, I would like to book a Healing Touch session.",
    },
    {
      id: "pura_radiancia",
      namePt: "Imersão Pura Radiância",
      nameEn: "Pure Radiance Immersion",
      descriptionPt: "Experiência imersiva de bem-estar",
      descriptionEn: "Immersive wellness experience",
      priceCents: 45000,
      priceDisplay: "450€",
      durationMinutes: 360,
      calendarColorId: "5",
      whatsappMessagePt: "Olá Daniela, gostaria de agendar uma Imersão Pura Radiância.",
      whatsappMessageEn: "Hello Daniela, I would like to book a Pure Radiance Immersion.",
    },
    {
      id: "pure_earth_love",
      namePt: "Pure Earth Love",
      nameEn: "Pure Earth Love",
      descriptionPt: "Conexão com a natureza",
      descriptionEn: "Nature connection",
      priceCents: 8000,
      priceDisplay: "80€",
      durationMinutes: 90,
      calendarColorId: "10",
      whatsappMessagePt: "Olá Daniela, gostaria de agendar uma sessão Pure Earth Love.",
      whatsappMessageEn: "Hello Daniela, I would like to book a Pure Earth Love session.",
    },
    {
      id: "home_harmony",
      namePt: "Home Harmony",
      nameEn: "Home Harmony",
      descriptionPt: "Organização holística de espaços",
      descriptionEn: "Holistic space organization",
      priceCents: 0,
      priceDisplay: "Sob consulta",
      durationMinutes: 180,
      calendarColorId: "7",
      whatsappMessagePt: "Olá Daniela, gostaria de saber mais sobre Home Harmony.",
      whatsappMessageEn: "Hello Daniela, I would like to know more about Home Harmony.",
    },
    {
      id: "other",
      namePt: "Sessão",
      nameEn: "Session",
      descriptionPt: "Sessão personalizada",
      descriptionEn: "Custom session",
      priceCents: 0,
      priceDisplay: "",
      durationMinutes: 120,
      calendarColorId: "8",
      whatsappMessagePt: "Olá Daniela, gostaria de agendar uma sessão.",
      whatsappMessageEn: "Hello Daniela, I would like to book a session.",
    },
  ],
  localStoragePrefix: "daniela-crm",
};
```

- [ ] **Step 1.2: Create service helper functions**

Create `src/lib/config/services.ts`:

```typescript
import { DEFAULT_CONFIG, type ServiceConfig } from "./therapist";

export function getService(id: string): ServiceConfig | undefined {
  return DEFAULT_CONFIG.services.find((s) => s.id === id);
}

export function getServiceLabel(id: string, lang: "pt" | "en" = "pt"): string {
  const service = getService(id);
  if (!service) return id;
  return lang === "en" ? service.nameEn : service.namePt;
}

export function getServicePrice(id: string): number {
  return getService(id)?.priceCents ?? 0;
}

export function getServicePriceDisplay(id: string): string {
  return getService(id)?.priceDisplay ?? "";
}

export function getServiceDuration(id: string): number {
  return getService(id)?.durationMinutes ?? 120;
}

export function getServiceCalendarColor(id: string): string {
  return getService(id)?.calendarColorId ?? "8";
}

export function getServiceLabelsRecord(lang: "pt" | "en" = "pt"): Record<string, string> {
  const record: Record<string, string> = {};
  for (const service of DEFAULT_CONFIG.services) {
    record[service.id] = lang === "en" ? service.nameEn : service.namePt;
  }
  return record;
}

export function getServiceColorsRecord(): Record<string, string> {
  const record: Record<string, string> = {};
  for (const service of DEFAULT_CONFIG.services) {
    record[service.id] = service.calendarColorId;
  }
  return record;
}
```

- [ ] **Step 1.3: Write tests for service helpers**

Create `src/lib/config/services.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  getServiceLabel,
  getServicePrice,
  getServicePriceDisplay,
  getServiceDuration,
  getServiceCalendarColor,
  getServiceLabelsRecord,
  getServiceColorsRecord,
} from "./services";

describe("getServiceLabel", () => {
  it("returns PT label by default", () => {
    expect(getServiceLabel("healing_wellness")).toBe("Healing Touch");
  });

  it("returns EN label when requested", () => {
    expect(getServiceLabel("pura_radiancia", "en")).toBe("Pure Radiance Immersion");
  });

  it("returns id for unknown service", () => {
    expect(getServiceLabel("unknown")).toBe("unknown");
  });
});

describe("getServicePrice", () => {
  it("returns price in cents", () => {
    expect(getServicePrice("healing_wellness")).toBe(15000);
  });

  it("returns 0 for unknown service", () => {
    expect(getServicePrice("unknown")).toBe(0);
  });
});

describe("getServicePriceDisplay", () => {
  it("returns formatted price string", () => {
    expect(getServicePriceDisplay("healing_wellness")).toBe("150€");
  });
});

describe("getServiceDuration", () => {
  it("returns duration in minutes", () => {
    expect(getServiceDuration("pura_radiancia")).toBe(360);
  });

  it("returns 120 default for unknown", () => {
    expect(getServiceDuration("unknown")).toBe(120);
  });
});

describe("getServiceCalendarColor", () => {
  it("returns calendar color ID", () => {
    expect(getServiceCalendarColor("healing_wellness")).toBe("3");
  });

  it("returns '8' default for unknown", () => {
    expect(getServiceCalendarColor("unknown")).toBe("8");
  });
});

describe("getServiceLabelsRecord", () => {
  it("returns record with all services", () => {
    const labels = getServiceLabelsRecord();
    expect(labels.healing_wellness).toBe("Healing Touch");
    expect(labels.pura_radiancia).toBe("Imersão Pura Radiância");
    expect(labels.home_harmony).toBe("Home Harmony");
  });
});

describe("getServiceColorsRecord", () => {
  it("returns record with calendar color IDs", () => {
    const colors = getServiceColorsRecord();
    expect(colors.healing_wellness).toBe("3");
    expect(colors.pura_radiancia).toBe("5");
  });
});
```

- [ ] **Step 1.4: Create React context provider**

Create `src/lib/config/therapist-context.tsx`:

```typescript
import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONFIG, type TherapistConfig } from "./therapist";

const TherapistContext = createContext<TherapistConfig>(DEFAULT_CONFIG);

export function TherapistProvider({
  config = DEFAULT_CONFIG,
  children,
}: {
  config?: TherapistConfig;
  children: ReactNode;
}) {
  return (
    <TherapistContext.Provider value={config}>
      {children}
    </TherapistContext.Provider>
  );
}

export function useTherapist(): TherapistConfig {
  return useContext(TherapistContext);
}
```

- [ ] **Step 1.5: Create server-side config**

Create `api/_config.ts`:

```typescript
import { DEFAULT_CONFIG } from "../src/lib/config/therapist.ts";

export function getServerConfig() {
  return {
    ...DEFAULT_CONFIG,
    fromEmail: process.env.FROM_EMAIL ?? `Daniela Alves <${DEFAULT_CONFIG.email}>`,
    appUrl: process.env.PUBLIC_URL ?? "https://danielaalveshealing.com",
  };
}

export { getServiceLabel, getServiceCalendarColor, getServiceLabelsRecord, getServiceColorsRecord } from "../src/lib/config/services.ts";
```

- [ ] **Step 1.6: Wrap App with TherapistProvider**

In `src/App.tsx`, add the provider at the outermost level:

```typescript
import { TherapistProvider } from "@/lib/config/therapist-context";
```

Wrap the existing JSX tree with `<TherapistProvider>...</TherapistProvider>`.

- [ ] **Step 1.7: Run tests**

```bash
npx vitest run
```

All existing tests + new service tests must pass.

- [ ] **Step 1.8: Commit**

```bash
git add src/lib/config/ api/_config.ts src/App.tsx
git commit -m "feat: add centralized therapist config with service helpers"
```

---

## Task 2: Refactor Landing Page Components (10 files)

**Files:**
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/LoadingScreen.tsx`
- Modify: `src/components/CTABanner.tsx`
- Modify: `src/components/WhatsAppFloat.tsx`
- Modify: `src/components/GiftVoucher.tsx`
- Modify: `src/components/About.tsx`
- Modify: `src/components/Services.tsx`
- Modify: `src/pages/public/HomeHarmonyPage.tsx`

For each file the pattern is:
1. Import `useTherapist` from `@/lib/config/therapist-context`
2. Call `const config = useTherapist();` at the top of the component
3. Replace hardcoded values with `config.xxx`
4. Remove local constants that are now in config

- [ ] **Step 2.1: Refactor Navigation.tsx**

Replace `const WA_LINK = 'https://wa.me/351914173445?text=...'` with:
```typescript
const config = useTherapist();
const WA_LINK = `${config.whatsappBase}?text=${encodeURIComponent("Olá " + config.name + ", gostaria de saber mais sobre os seus serviços.")}`;
```
Replace logo alt text with `config.logo.alt`.

- [ ] **Step 2.2: Refactor Footer.tsx**

Replace all hardcoded contact info:
- Name → `config.name`, `config.fullBusinessName`
- Phone → `config.phoneFormatted`
- Email → `config.email`
- Address → `config.address.full`
- Social links → `config.socialLinks.instagram`, etc.
- Copyright → `config.fullBusinessName`

- [ ] **Step 2.3: Refactor Hero.tsx**

Replace quote text with `config.quotes.main` and author with `config.quotes.author`.

- [ ] **Step 2.4: Refactor LoadingScreen.tsx**

Replace `"Daniela Alves"` with `config.name` and `"Healing & Wellness"` with `config.tagline`.

Note: LoadingScreen renders before the provider mounts. Import `DEFAULT_CONFIG` directly instead of using the hook.

- [ ] **Step 2.5: Refactor CTABanner.tsx**

Replace `WA_LINK` with config-driven construction using `config.whatsappBase`.

- [ ] **Step 2.6: Refactor WhatsAppFloat.tsx**

Replace `WA_LINK` with config-driven construction. Since this is a simple component, use `DEFAULT_CONFIG` directly to avoid context overhead.

- [ ] **Step 2.7: Refactor GiftVoucher.tsx**

Replace `WA_LINK` with config-driven construction.

- [ ] **Step 2.8: Refactor About.tsx**

Replace hardcoded `#985F97` in SVG pattern with `config.colors.primary`. Use `encodeURIComponent` for the SVG data URI color.

- [ ] **Step 2.9: Refactor Services.tsx**

Replace hardcoded service names, prices, and WhatsApp links with `config.services` array. Map over `config.services` to generate service cards.

- [ ] **Step 2.10: Refactor HomeHarmonyPage.tsx**

Replace `WA_LINK` with config-driven construction.

- [ ] **Step 2.11: Run tests and verify**

```bash
npx vitest run && npx tsc --noEmit
```

- [ ] **Step 2.12: Commit**

```bash
git commit -m "refactor: extract hardcoded values from landing page components to config"
```

---

## Task 3: Refactor Admin Components (4 files)

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx`
- Modify: `src/pages/admin/Settings.tsx`
- Modify: `src/pages/admin/SessionDetail.tsx`
- Modify: `src/components/admin/QuickBooking.tsx`
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 3.1: Refactor Dashboard.tsx**

Remove the local `SERVICE_LABELS` record. Import `getServiceLabel` from `@/lib/config/services`.
Replace `SERVICE_LABELS[session.service_type]` with `getServiceLabel(session.service_type)`.
Replace all `#985F97` with `config.colors.primary` and `#7d4e7c` with `config.colors.primaryHover`.

- [ ] **Step 3.2: Refactor SessionDetail.tsx**

Remove the local `SERVICE_LABELS` record. Import `getServiceLabel` from `@/lib/config/services`.
Replace all usages.

- [ ] **Step 3.3: Refactor Settings.tsx**

Replace all `"#985F97"` with `config.colors.primary` via `useTherapist()`.

- [ ] **Step 3.4: Refactor QuickBooking.tsx**

Remove local `SERVICE_OPTIONS` array. Build it from `config.services`:
```typescript
const config = useTherapist();
const serviceOptions = config.services
  .filter((s) => s.id !== "other")
  .map((s) => ({ value: s.id, label: s.namePt, price: s.priceDisplay }));
```
Replace all `#985F97` / `#7d4e7c` with `config.colors.primary` / `config.colors.primaryHover`.
Replace WhatsApp message construction with config values.

- [ ] **Step 3.5: Refactor AuthContext.tsx**

Replace `"daniela-crm-auth"` with `config.localStoragePrefix + "-auth"`. Import `DEFAULT_CONFIG` directly (context not available at this level).

- [ ] **Step 3.6: Run tests and verify**

```bash
npx vitest run && npx tsc --noEmit
```

- [ ] **Step 3.7: Commit**

```bash
git commit -m "refactor: extract hardcoded values from admin components to config"
```

---

## Task 4: Refactor Public Forms (2 files)

**Files:**
- Modify: `src/pages/public/PreparePage.tsx`
- Modify: `src/pages/public/PrivacyPolicy.tsx`

- [ ] **Step 4.1: Refactor PreparePage.tsx**

Replace the local constants:
- `SESSION_ADDRESS` → `config.address.full`
- `GOOGLE_MAPS_URL` → `config.address.mapsUrl`
- Parking text → `config.parking`
- Entry instructions → `config.entryInstructions`
- Preparation tips → `config.preparationTips`
- Quote text → `config.quotes.main`
- Quote author → `config.quotes.author`

Use `useTherapist()` hook. Pass config values through to sub-components via props or by having them call the hook.

- [ ] **Step 4.2: Refactor PrivacyPolicy.tsx**

Replace `"Daniela Alves Healing & Wellness"` with `config.fullBusinessName`.
Replace address references with `config.address.full`.

- [ ] **Step 4.3: Run tests and verify**

```bash
npx vitest run && npx tsc --noEmit
```

- [ ] **Step 4.4: Commit**

```bash
git commit -m "refactor: extract hardcoded values from public forms to config"
```

---

## Task 5: Refactor Backend (3 files)

**Files:**
- Modify: `api/_email.ts`
- Modify: `api/_calendar.ts`
- Modify: `api/cron/index.ts`

- [ ] **Step 5.1: Refactor _calendar.ts**

Remove local `SERVICE_COLORS` and `SERVICE_LABELS` records.
Import from `api/_config.ts`:
```typescript
import { getServerConfig, getServiceLabel, getServiceCalendarColor } from "./_config.js";
```
Replace:
- `SERVICE_LABELS[params.serviceType]` → `getServiceLabel(params.serviceType)`
- `SERVICE_COLORS[params.serviceType]` → `getServiceCalendarColor(params.serviceType)`
- Hardcoded location string → `getServerConfig().address.full`

- [ ] **Step 5.2: Refactor _email.ts**

Import `getServerConfig` and use `getServerConfig().fromEmail` for the FROM address if there's a hardcoded FROM.

- [ ] **Step 5.3: Refactor cron/index.ts**

Replace any remaining hardcoded service labels or therapist name references with `getServerConfig()` values.

- [ ] **Step 5.4: Run tests and verify**

```bash
npx vitest run && npx tsc --noEmit
```

- [ ] **Step 5.5: Commit**

```bash
git commit -m "refactor: extract hardcoded values from API handlers to server config"
```

---

## Task 6: Final Verification

- [ ] **Step 6.1: Run full test suite**

```bash
npx vitest run
```

All tests must pass. Expected: 50+ tests (49 existing + new service helper tests).

- [ ] **Step 6.2: TypeScript check**

```bash
npx tsc --noEmit
```

Zero errors.

- [ ] **Step 6.3: Grep for remaining hardcoded values**

```bash
grep -rn "985F97\|7d4e7c\|351914173445\|danielaalveshealing\|Regueiro do Tanque" src/ api/ --include="*.ts" --include="*.tsx" | grep -v config/ | grep -v node_modules
```

Should return zero results (all references should now be in config files only).

- [ ] **Step 6.4: Visual verification checklist**

- Landing page looks identical
- Admin dashboard looks identical
- PreparePage address/instructions unchanged
- WhatsApp links work correctly
- Calendar events have correct labels and colors

---

## Dependency Graph

```
Task 1 (Core config) → Task 2 (Landing) ─┐
                      → Task 3 (Admin)  ──┼── Task 6 (Verification)
                      → Task 4 (Forms)  ──┤
                      → Task 5 (Backend) ──┘
```

**Parallelism:** Tasks 2, 3, 4, 5 are independent after Task 1 completes. All four can run in parallel.
