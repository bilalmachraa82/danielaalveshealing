

# Audit Crítico & Correções Visuais

## Problemas Identificados

### 1. Testimonials — Texto branco em fundo branco (CRÍTICO)
A secção usa `glass-card` (fundo branco/translúcido) com texto `text-foreground/75` — praticamente invisível contra o fundo `from-mist` (97% branco). O card precisa de contraste real.

### 2. Services "Cuidar de Ti" — Títulos pequenos demais
Os títulos dos cards usam `text-xl md:text-2xl` — demasiado pequeno para um layout editorial premium. Precisam de ser maiores e mais impactantes.

### 3. SpaceHarmony — Imagem de fundo errada
O background usa `cheque-oferta-pt.jpg` (imagem do cheque-oferta) — completamente errado para uma secção de harmonização de espaços. Precisa de uma imagem de interior sereno/natureza.

### 4. SectionDividers — Ondas desajustadas
As ondas SVG criam transições visuais estranhas com cores que não batem certo entre secções. As cores `fromColor`/`toColor` não correspondem aos fundos reais das secções adjacentes.

---

## Correções a Implementar

### A. Testimonials — Contraste e legibilidade
- Dar ao card um fundo sólido mais escuro (lilás suave ou creme com borda dourada)
- Aumentar opacidade do texto para `text-foreground` (100%)
- Dar mais destaque ao fundo da secção com um gradiente lilás mais visível
- Aumentar o tamanho do texto do testemunho

### B. Services — Títulos maiores
- Subir títulos dos cards para `text-2xl md:text-3xl`
- Aumentar o tamanho da descrição de `text-sm` para `text-base`
- Dar mais peso visual aos cards com fundo mais definido

### C. SpaceHarmony — Imagem correcta
- Substituir `cheque-oferta-pt.jpg` por uma imagem de interior harmonioso / natureza serena (usar uma imagem do Unsplash ou similar de espaço zen/interior)
- Manter o overlay escuro para legibilidade do texto

### D. Section Dividers — Simplificar ou remover
- Remover TODOS os `SectionDivider` do `Index.tsx`
- Substituir por transições de gradiente suaves directamente nos backgrounds das secções (usando padding e gradientes que se fundem naturalmente)

### Ficheiros a modificar
1. `src/pages/Index.tsx` — Remover todos os SectionDivider
2. `src/components/Testimonials.tsx` — Fix contraste, card mais visível
3. `src/components/Services.tsx` — Títulos e texto maiores
4. `src/components/SpaceHarmony.tsx` — Substituir imagem de fundo

