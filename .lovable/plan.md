

## Melhorar Legibilidade do Logo no Header

### Problema
O logo actual tem `h-10` (40px) — demasiado pequeno para um logo com ícone + nome + tagline. Os detalhes da mão com ramo e o texto "Healing & Harmony" ficam ilegíveis, especialmente no estado scrolled (fundo branco com versão lilás).

### Best practices (luxury/wellness sites)
1. **Tamanho mínimo**: logos com detalhe devem ter 44-56px de altura num header
2. **Dois tamanhos**: logo maior no hero (sem scroll), ligeiramente menor quando scrolled — transição suave
3. **Contraste reforçado**: no fundo branco, o lilás precisa de estar mais saturado/escuro para WCAG AA
4. **Drop shadow subtil**: uma sombra muito leve no estado hero ajuda a separar do vídeo de fundo

### Plano

#### 1. Aumentar o logo e criar transição de tamanho
- **Hero (sem scroll):** `h-14` (56px) — logo dourado grande e impactante
- **Scrolled (fundo branco):** `h-11` (44px) — ligeiramente mais compacto mas ainda legível
- A transição já está preparada com `transition-all duration-300`

#### 2. Melhorar contraste da versão lilás (scrolled)
- Regenerar `logo-dark.png`/`.webp` com lilás mais escuro/saturado: `#5A3D8F` em vez de `#6B50A3`
- Isto garante melhor contraste sobre fundo branco (ratio > 4.5:1 para WCAG AA)

#### 3. Sombra subtil no hero
- Adicionar `drop-shadow` ao logo quando sobre o vídeo para melhor separação visual
- `drop-shadow(0 1px 3px rgba(0,0,0,0.3))` — apenas no estado não-scrolled

### Ficheiros a modificar

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 1 | `src/components/Navigation.tsx` | Ajustar classes de tamanho (h-14/h-11), adicionar drop-shadow condicional |
| 2 | `public/images/logo-dark.png` | Regenerar com lilás mais escuro (#5A3D8F) |
| 3 | `public/images/logo-dark.webp` | Regenerar com lilás mais escuro (#5A3D8F) |

