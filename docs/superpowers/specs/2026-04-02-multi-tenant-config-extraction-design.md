# Multi-Tenant Config Extraction — Design Spec

**Date:** 2026-04-02
**Goal:** Extract all 22 files' hardcoded values into a centralized config system, enabling per-client customization without code changes.

**Scope:** Phase 1 only — config extraction. No DB tenant_id, no routing, no onboarding UI.

---

## Architecture

Two config modules — one for frontend (React context), one for backend (API handlers):

```
src/lib/config/
├── therapist.ts         # TherapistConfig type + default (Daniela) values
├── therapist-context.tsx # React context provider + useTherapist() hook
└── services.ts          # Service-related helpers (labels, prices, colors)

api/
├── _config.ts           # Server-side config (email FROM, calendar labels, address)
```

### Frontend Config

`src/lib/config/therapist.ts` exports `TherapistConfig` interface and `DEFAULT_CONFIG`:

```typescript
export interface ServiceConfig {
  id: string;                    // "healing_wellness"
  namePt: string;                // "Healing Touch"
  nameEn: string;                // "Healing Touch"
  description: { pt: string; en: string };
  priceCents: number;            // 15000
  priceDisplay: string;          // "150€"
  durationMinutes: number;       // 120
  calendarColorId: string;       // "3"
  whatsappMessage: { pt: string; en: string };
}

export interface TherapistConfig {
  // Identity
  name: string;
  tagline: string;
  fullBusinessName: string;      // "Daniela Alves Healing & Wellness"
  
  // Contact
  email: string;
  phone: string;
  phoneFormatted: string;        // "+351 914 173 445"
  whatsappBase: string;          // "https://wa.me/351914173445"
  
  // Location
  address: {
    street: string;
    city: string;
    postal: string;
    country: string;
    full: string;                // Combined for display
    mapsUrl: string;
  };
  parking: { pt: string; en: string };
  entryInstructions: { pt: string; en: string };
  preparationTips: { pt: string; en: string };
  
  // Branding
  colors: {
    primary: string;             // "#985F97"
    primaryHover: string;        // "#7d4e7c"
    secondary: string;           // "#D9AA4F"
    background: string;          // "#FAF7F5"
  };
  fonts: {
    heading: string;             // "Cormorant Garamond"
    body: string;                // "DM Sans"
  };
  logo: {
    src: string;
    alt: string;
  };
  
  // Content
  quotes: {
    main: { pt: string; en: string };
    author: string;
  };
  socialLinks: {
    instagram?: string;
    youtube?: string;
    googleReview?: string;
  };
  
  // Services
  services: ServiceConfig[];
  
  // Internal
  localStoragePrefix: string;    // "daniela-crm"
}
```

`src/lib/config/therapist-context.tsx` provides:
- `TherapistProvider` — wraps the app, provides config via context
- `useTherapist()` — hook to read config from any component

### Backend Config

`api/_config.ts` exports `getServerConfig()`:
- Reads from env vars where sensitive (admin tokens, API keys)
- Reads from a shared config for non-sensitive values (name, address, service labels)
- Imports from `../src/lib/config/therapist.ts` for shared values

### Service Helpers

`src/lib/config/services.ts`:
- `getServiceLabel(id, lang)` — replaces all scattered `SERVICE_LABELS` records
- `getServicePrice(id)` — replaces hardcoded price lookups
- `getServiceDuration(id)` — replaces hardcoded durations
- `getServiceCalendarColor(id)` — replaces `SERVICE_COLORS` in calendar
- `getServiceWhatsAppMessage(id, lang)` — replaces hardcoded WhatsApp messages

---

## Files to Refactor (22 files)

### Frontend — Landing Page (10 files)

| File | Hardcoded Values | Config Fields Used |
|------|------------------|--------------------|
| `index.html` | Meta tags, structured data | name, tagline, address, phone |
| `src/components/Navigation.tsx` | Logo alt, WhatsApp URL | logo, whatsappBase, name |
| `src/components/Footer.tsx` | Name, email, phone, address, social links | name, email, phoneFormatted, address, socialLinks |
| `src/components/Hero.tsx` | Quote, author | quotes |
| `src/components/Services.tsx` | Service names, prices, descriptions, WhatsApp | services, whatsappBase |
| `src/components/About.tsx` | Brand color in SVG | colors.primary |
| `src/components/CTABanner.tsx` | WhatsApp link + message | whatsappBase |
| `src/components/WhatsAppFloat.tsx` | Phone number | whatsappBase |
| `src/components/GiftVoucher.tsx` | WhatsApp link | whatsappBase |
| `src/components/LoadingScreen.tsx` | Name, tagline | name, tagline |

### Frontend — Admin (4 files)

| File | Hardcoded Values | Config Fields Used |
|------|------------------|--------------------|
| `src/pages/admin/Dashboard.tsx` | Service labels, brand color | services (via helper), colors.primary |
| `src/pages/admin/Settings.tsx` | Brand color | colors.primary |
| `src/components/admin/QuickBooking.tsx` | Services, prices, colors, WhatsApp | services, colors, whatsappBase |
| `src/contexts/AuthContext.tsx` | localStorage key | localStoragePrefix |

### Frontend — Public Forms (3 files)

| File | Hardcoded Values | Config Fields Used |
|------|------------------|--------------------|
| `src/pages/public/PreparePage.tsx` | Address, maps URL, parking, entry, preparation, quotes | address, parking, entryInstructions, preparationTips, quotes |
| `src/pages/public/PrivacyPolicy.tsx` | Legal name, address | fullBusinessName, address |
| `src/pages/public/HomeHarmonyPage.tsx` | WhatsApp links | whatsappBase |

### Backend (3 files)

| File | Hardcoded Values | Config Fields Used |
|------|------------------|--------------------|
| `api/_email.ts` | FROM address | server config: fromEmail |
| `api/_calendar.ts` | SERVICE_COLORS, SERVICE_LABELS, location | services (via helper), address |
| `api/cron/index.ts` | Service labels in emails | server config via getServerConfig() |

### Config Files (2 files)

| File | Hardcoded Values | Config Fields Used |
|------|------------------|--------------------|
| `vite.config.ts` | PWA manifest (name, colors) | Reads from config at build time |
| `tailwind.config.ts` | Font families | Reads from config |

---

## Migration Strategy

**Zero functional changes.** Every refactored file must produce identical output. The only difference is WHERE the values come from.

Steps per file:
1. Import `useTherapist()` (components) or `getServerConfig()` (API)
2. Replace hardcoded strings with config values
3. Remove local `SERVICE_LABELS`, `SERVICE_COLORS`, etc. duplicates
4. Verify no visual or behavioral change

---

## Testing Strategy

- All 49 existing tests must continue to pass (config defaults = current values)
- Add 1 config test: verify `DEFAULT_CONFIG` has all required fields
- Add 1 service helpers test: verify `getServiceLabel`, `getServicePrice` return correct values
- Visual spot-check: landing page, admin dashboard, prepare form should look identical

---

## What This Enables

After Phase 1, a new therapist CRM can be created by:
1. Forking the repo
2. Editing ONE file (`src/lib/config/therapist.ts`) with their values
3. Setting env vars for API keys
4. Deploying to Vercel

Phase 2 (multi-tenant DB) builds on this by loading config from DB instead of static file.
