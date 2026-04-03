

## Splash Screen + Logo no Header — Melhorias

### O que é a "página antes do site"
Chama-se **Splash Screen** (ou Loading Screen). Está em `src/components/LoadingScreen.tsx`. Actualmente mostra apenas texto ("Daniela Alves" + "Healing & Harmony") — não mostra o logo/imagem.

### Problema no header com fundo branco
O `logo-dark` (versão escura para fundo branco) foi gerado como preto puro, o que fica duro. A best practice moderna é usar a cor primária da marca (lilás `#6B50A3`) em vez de preto — fica elegante e on-brand.

---

### Plano de Implementação

#### 1. Splash Screen — Mostrar o logo completo
- Substituir o `<h1>` de texto por uma `<img>` que carrega `/images/logo.webp` (o logo dourado completo)
- O logo dourado sobre o fundo aubergine escuro ficará premium
- Manter a tagline "Healing & Harmony" em texto abaixo
- Manter as animações existentes (fade-in reveal + gold line)

#### 2. Header scrolled — Logo lilás em vez de preto
Em vez de um logo-dark preto, a best practice actual para sites premium é:
- **Opção adoptada:** Aplicar um filtro CSS ao logo dourado original para o colorir na cor primária lilás quando o header tem fundo branco — sem precisar de ficheiro separado
- Usar CSS `filter` + `mix-blend-mode` ou simplesmente um `brightness(0.3)` controlado para escurecer o logo dourado o suficiente para ler no branco, mantendo warmth
- Alternativa mais limpa: gerar `logo-dark` na cor lilás (#6B50A3) em vez de preto

**Abordagem escolhida:** Regenerar `logo-dark.png` e `logo-dark.webp` com tom lilás da marca em vez de preto puro. Isto é mais fiável cross-browser que filtros CSS.

### Ficheiros a modificar

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 1 | `src/components/LoadingScreen.tsx` | Mostrar imagem do logo + manter tagline |
| 2 | `public/images/logo-dark.png` | Regenerar com tom lilás (#6B50A3) |
| 3 | `public/images/logo-dark.webp` | Regenerar com tom lilás (#6B50A3) |

