

## Rebrand Completo — Healing & Harmony

### Resumo
Actualizar cores, tagline e referências de marca em todo o projecto para alinhar com o novo logo da Daniela. As fontes (Cormorant Garamond + DM Sans) mantêm-se — já estão alinhadas com o novo branding.

---

### 1. Actualizar paleta de cores (`src/index.css`)

Ajustar as CSS custom properties para o novo tom lilás mais suave e dourado mais quente:

| Variável | Valor actual | Novo valor |
|----------|-------------|------------|
| `--primary` | `301 23% 48%` | `275 22% 55%` |
| `--primary-light` | `301 28% 62%` | `275 28% 65%` |
| `--gold` | `37 45% 64%` | `37 48% 56%` |
| `--gold-dark` | `37 40% 48%` | `37 42% 44%` |
| `--gold-light` | `37 55% 78%` | `37 55% 72%` |
| `--ring` | `301 23% 48%` | `275 22% 55%` |

Dark mode: ajustar `--primary` e `--primary-light` proporcionalmente.

### 2. Actualizar config central (`src/lib/config/therapist.ts`)

- `tagline`: `"Healing & Wellness"` → `"Healing & Harmony"`
- `fullBusinessName`: `"Daniela Alves Healing & Harmony"`
- `colors.primary`: `"#985F97"` → `"#7B6B99"` (novo lilás)
- `colors.primaryHover`: `"#7d4e7c"` → `"#655880"`
- `colors.secondary`: `"#D9AA4F"` → `"#C4A265"` (novo dourado)

### 3. Actualizar PWA config (`vite.config.ts`)

- `description`: `"Healing & Harmony"` 
- `theme_color`: actualizar para novo hex primary
- `background_color`: mantém

### 4. Actualizar todas as referências "Healing & Wellness" (9 ficheiros)

Substituir por "Healing & Harmony" em:
- `index.html` — title, meta tags, JSON-LD (6 ocorrências)
- `src/components/admin/layout/AdminSidebar.tsx` — linha 78
- `src/pages/admin/Login.tsx` — linha 56
- `src/pages/public/ManageSessionPage.tsx` — linha 161
- `src/components/GiftVoucher.tsx` — alt text
- `src/lib/communications/templates.ts` — email templates (2 ocorrências)
- `api/_ocr.ts` — OCR prompts (2 ocorrências)

### 5. Actualizar PWA icons (`public/pwa-192x192.svg`, `public/pwa-512x512.svg`)

- Mudar o `fill` do coração de `#985F97` para o novo hex primary
- Actualizar `apple-touch-icon.svg` igualmente

### 6. Actualizar `LoadingScreen.tsx`

- Já usa `DEFAULT_CONFIG.name` e `DEFAULT_CONFIG.tagline` — apanha automaticamente a nova tagline
- Sem alterações necessárias

### 7. Footer e Navigation

- Footer já usa `config.tagline` — actualização automática via config
- Navigation sem alterações (logo image path mantém-se)

---

### Ficheiros modificados

| # | Ficheiro | Tipo de alteração |
|---|----------|-------------------|
| 1 | `src/index.css` | Cores CSS vars |
| 2 | `src/lib/config/therapist.ts` | Tagline, cores |
| 3 | `vite.config.ts` | PWA manifest |
| 4 | `index.html` | Meta tags, JSON-LD |
| 5 | `src/components/admin/layout/AdminSidebar.tsx` | Tagline CRM |
| 6 | `src/pages/admin/Login.tsx` | Tagline CRM |
| 7 | `src/pages/public/ManageSessionPage.tsx` | Brand name |
| 8 | `src/components/GiftVoucher.tsx` | Alt text |
| 9 | `src/lib/communications/templates.ts` | Email templates |
| 10 | `api/_ocr.ts` | OCR prompts |
| 11 | `public/pwa-192x192.svg` | Cor do icon |
| 12 | `public/pwa-512x512.svg` | Cor do icon |
| 13 | `public/apple-touch-icon.svg` | Cor do icon |

