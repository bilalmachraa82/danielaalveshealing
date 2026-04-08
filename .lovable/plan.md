

## Plano: Rebrand completo alinhado com o Brandbook

### Resumo

Implementar todas as alterações do brandbook que podem ser feitas agora (cores, tagline "Beyond the Body", splash screen, vídeo), e preparar a tipografia para receber Quincy + Museo quando enviares os ficheiros.

### Brandbook — Referência visual confirmada

```text
Paleta cromática oficial:
  Roxo profundo:  #3B2635  (foreground, backgrounds escuros)
  Off-white:      #F6F5EE  (background claro)
  Dourado escuro: #B48D53  (gold principal)
  Lilás rosado:   #96568A  (accent, primary)
  Dourado suave:  #CDAE7C  (gold-light)
  Verde suave:    #A9BFA5  (nova cor de accent)

Tagline: "Beyond the Body"
Tipografia: Quincy (títulos) + Museo (textos) — aguarda ficheiros
```

---

### Fase 1 — Tagline "Beyond the Body" (6 ficheiros)

| Ficheiro | Alteração |
|----------|-----------|
| `src/lib/config/therapist.ts` | `tagline: "Beyond the Body"`, `fullBusinessName: "Daniela Alves — Beyond the Body"` |
| `index.html` | Substituir todas as ~38 ocorrências de "Healing & Harmony" por "Beyond the Body" nos titles, meta, JSON-LD, SEO |
| `src/components/Footer.tsx` | Linha 35: actualizar texto EN de "Healing and wellness" para "Healing and harmony" |
| `docs/guia-sistema.html` | "Healing & Wellness" → "Beyond the Body" (4 ocorrências) |
| `docs/jornada-app-daniela.html` | "Healing & Wellness" → "Beyond the Body" (1 ocorrência) |
| `api/_config.ts` | `appUrl` já está correcto, sem alteração necessária |

### Fase 2 — Paleta cromática do brandbook (2 ficheiros)

**`src/index.css`** — Actualizar CSS variables light mode:

| Variável | Antes (HSL) | Depois (convertido de HEX) |
|----------|-------------|---------------------------|
| `--background` | `300 100% 100%` (branco) | `47 26% 95%` (#F6F5EE off-white) |
| `--foreground` | `276 8% 17%` | `320 22% 21%` (#3B2635 roxo profundo) |
| `--primary` | `270 28% 50%` | `311 26% 44%` (#96568A lilás rosado) |
| `--primary-light` | `270 32% 62%` | `311 20% 55%` (lilás rosado mais claro) |
| `--gold` | `38 52% 52%` | `36 39% 52%` (#B48D53 dourado escuro) |
| `--gold-light` | `38 58% 68%` | `37 42% 65%` (#CDAE7C dourado suave) |
| `--gold-dark` | `38 46% 40%` | `36 39% 42%` (dourado mais escuro) |
| `--card` | `0 0% 100%` | `47 26% 95%` (off-white) |
| `--cream` | `40 60% 98%` | `47 26% 95%` (off-white) |

Adicionar nova variável: `--verde-suave: 148 15% 70%` (#A9BFA5)

Actualizar dark mode com o roxo profundo #3B2635 como base.

**`src/lib/config/therapist.ts`** — Actualizar `colors`:
- `primary: "#96568A"`, `secondary: "#B48D53"`, `background: "#F6F5EE"`

**`tailwind.config.ts`** — Adicionar cor `verde-suave`

### Fase 3 — Splash screen e backgrounds (3 ficheiros)

**`src/components/LoadingScreen.tsx`**:
- Actualizar background gradient para usar roxo profundo `#3B2635` em vez de hsl hardcoded
- Actualizar glow radial para usar lilás rosado
- Adicionar `loading="eager"` à imagem do logo para garantir carregamento
- Ajustar gold shimmer para usar o novo dourado `#B48D53`

**`src/components/Hero.tsx`**:
- Actualizar gradient bottom fade para usar roxo profundo `#3B2635`
- O botão de unmute está correcto no código (z-20, acima do overlay). Verificar se o overlay (z-10) não bloqueia — está OK, o botão está fora do `ref={ref}` div

**`src/components/Footer.tsx`**:
- Actualizar background gradient inline para usar roxo profundo `#3B2635`
- Actualizar texto EN (linha 35)

### Fase 4 — Preparar tipografia (2 ficheiros)

Enquanto aguardamos os ficheiros Quincy/Museo, manter Cormorant Garamond + DM Sans como fallback. Actualizar `therapist.ts` fonts config para indicar as novas fontes pretendidas.

**`src/lib/config/therapist.ts`**: `fonts.heading: "Quincy"`, `fonts.body: "Museo"`
**`src/index.css`** e **`tailwind.config.ts`**: Adicionar Quincy e Museo ao font stack com fallback para as fontes actuais

### Fase 5 — Restantes ocorrências "Wellness" (1 ficheiro)

**`src/components/Footer.tsx`**: linha 35 — texto EN "Healing and wellness sessions" → "Healing and harmony sessions" (ou "Beyond the Body" aligned)

---

### Ficheiros que NÃO mudam
- Logo images (`/images/logo.webp`, `/images/logo-dark.webp`) — o logo actual já mostra "Healing & Harmony" na imagem. A Daniela precisará fornecer novos logos com "Beyond the Body" (como no brandbook). Por agora, mantemos os actuais.
- Hero video — o código de unmute está correcto. O vídeo inicia muted (obrigatório pelo browser), o botão funciona.

### Nota importante
Os novos logos do brandbook (com "Beyond the Body") precisam ser fornecidos como ficheiros de imagem. Quando os tiveres, substituímos `logo.webp`, `logo.png`, `logo-dark.webp`, `logo-dark.png`.

