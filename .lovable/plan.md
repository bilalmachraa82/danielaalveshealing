

## Auditoria Completa + Plano de Correção Alinhado com o Brandbook

### Problemas Críticos Identificados

#### 1. VIDEO SEM SOM — Causa raiz confirmada
O ficheiro `hero-video.mp4` **não tem faixa de áudio**. O `ffprobe` confirma apenas 1 stream (video: h264). O botão de unmute existe e funciona no código, mas não há áudio no ficheiro. **O vídeo precisa ser substituído por uma versão com áudio.**

#### 2. LOGO NA SPLASH — Bug de height:0
No `LoadingScreen.tsx` linha 49: `height: stage >= 1 ? undefined : 0` — quando `height` é `undefined` e `maxHeight: '6rem'`, mas sem `height` definido, o `<img>` pode colapsar a 0 se o browser não tiver carregado a imagem a tempo do stage 1 (100ms). O `loading="eager"` ajuda mas 100ms é muito rápido.

**Correcção**: Definir `height: '6rem'` quando `stage >= 1` em vez de `undefined`, e aumentar o delay do stage 1 para 300ms para dar tempo ao browser.

#### 3. LOGO NO HEADER — Referência a ficheiros correcta
Os logos existem (`logo.webp`, `logo-dark.webp`). O problema pode ser timing — o browser troca entre `logo.webp` (fundo escuro) e `logo-dark.webp` (fundo claro com scroll). Ficheiros existem e são ~1MB cada.

#### 4. MAIN BACKGROUND — Cor hardcoded errada
`Index.tsx` linha 21: `bg-[hsl(295_22%_11%)]` — Este é um roxo-escuro genérico, não o roxo profundo do brandbook `#3B2635`. Deve usar o roxo do brandbook.

#### 5. SECTION FADES — Cores hardcoded desalinhadas
Várias `SectionFade` e backgrounds usam HSL hardcoded que não correspondem ao brandbook:
- `hsl(295 22% 11%)` e `hsl(300 20% 14%)` — devem ser `#3B2635` ou `#2E1D28`
- `hsl(276 30% 12%)` — idem
- TrustStrip: `hsl(300 20% 14%)` e `hsl(295 22% 11%)` — idem

#### 6. BOTÃO DO VÍDEO — z-index conflito potencial
O mute button está `z-20`, o overlay escuro não tem z-index explícito, e o content está `z-10`. O `noise-overlay::before` está `z-1`. Parece OK, mas o botão pode ser obscurecido pela splash screen `z-[9999]` durante os primeiros 2.8s.

---

### Plano de Implementação

#### Fase 1 — Video + Splash (bugs críticos)

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 1 | `src/components/Hero.tsx` | Esconder o botão de mute/unmute porque o vídeo não tem áudio. Adicionar comentário para reactivar quando o vídeo for substituído |
| 2 | `src/components/LoadingScreen.tsx` | Corrigir: `height: '6rem'` quando stage>=1; aumentar delay do stage 1 de 100ms para 300ms; garantir que o logo aparece de forma fiável |

#### Fase 2 — Cores hardcoded → Brandbook

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 3 | `src/pages/Index.tsx` | Substituir `bg-[hsl(295_22%_11%)]` por `bg-[#3B2635]`; actualizar todos os `SectionFade` `from`/`to` com cores do brandbook (`#3B2635`, `#2E1D28`) em vez de HSL genéricos |
| 4 | `src/components/TrustStrip.tsx` | Substituir `hsl(300 20% 14%)` e `hsl(295 22% 11%)` por `#3B2635` / `#2E1D28` |
| 5 | `src/components/SpaceHarmony.tsx` | Verificar e alinhar overlay `bg-foreground/80` — OK, usa CSS var |

#### Fase 3 — Polish premium restante

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 6 | `src/components/Hero.tsx` | O gradient bottom `from-[#3B2635]` já está correcto. Manter |
| 7 | `src/components/Footer.tsx` | Já usa `#3B2635`. OK |
| 8 | `src/components/LoadingScreen.tsx` | Já usa `#3B2635`. OK |

---

### Nota sobre o vídeo
O ficheiro `hero-video.mp4` (9MB) **não contém faixa de áudio** — apenas vídeo H.264. Para ter som, é necessário fornecer um novo ficheiro `.mp4` com áudio incluído. Enquanto isso, o botão de volume será escondido para não confundir o utilizador.

### Ficheiros a modificar: 4
1. `src/components/LoadingScreen.tsx` — fix splash logo
2. `src/components/Hero.tsx` — esconder botão mute (sem áudio)
3. `src/pages/Index.tsx` — cores brandbook nos backgrounds e fades
4. `src/components/TrustStrip.tsx` — cores brandbook

