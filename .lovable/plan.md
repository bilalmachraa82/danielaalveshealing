

## Auditoria Completa do Rebrand — Problemas Encontrados

### Problema 1: Logo NÃO foi substituído
Os ficheiros `public/images/logo.png` e `public/images/logo.webp` continuam a ser os antigos. As imagens do novo logo foram enviadas mas nunca copiadas para o projecto. O `Navigation.tsx` aponta para `/images/logo.webp` — o mesmo ficheiro antigo.

**Solução:** Converter as imagens enviadas (WhatsApp) para `logo.png` e `logo.webp` e substituir em `public/images/`.

### Problema 2: `theme-color` no index.html ainda é `#985F97` (antigo)
Linha 335 do `index.html` ainda tem `content="#985F97"` em vez do novo `#7B6B99`.

**Solução:** Actualizar para `#7B6B99`.

### Problema 3: Cores CSS já foram actualizadas mas a diferença é subtil
Os valores CSS em `index.css` já estão com os novos valores (`275 22% 55%`, `37 48% 56%`). A mudança de `301 23% 48%` → `275 22% 55%` é visualmente subtil (ligeira mudança de matiz). Se queres uma diferença mais notória, podemos ajustar a saturação ou luminosidade.

### Problema 4: Cores hardcoded nos dark backgrounds NÃO usam CSS vars
Vários componentes têm cores de fundo aubergine hardcoded que não mudam com o rebrand:
- `Index.tsx` linha 21: `bg-[hsl(295_22%_11%)]`
- `Hero.tsx` linha 56: `from-[hsl(295_22%_11%)]`
- `Index.tsx` linha 25: `hsl(295 22% 11%)`
- `Footer.tsx` linha 12: gradiente hardcoded
- `LoadingScreen.tsx` linha 25: gradiente hardcoded
- `TrustStrip.tsx` linha 11: gradiente hardcoded

Estes estão correctos para a paleta actual (aubergine escuro) — não precisam de mudar a menos que queiras alterar o tom escuro.

---

## Plano de Implementação

### 1. Substituir o logo (prioridade máxima)
- Processar a imagem do novo logo enviada pelo WhatsApp
- Criar versões optimizadas: `logo.png` (fallback) e `logo.webp` (principal)
- Substituir os ficheiros em `public/images/`
- O `Navigation.tsx`, `Footer.tsx` e `LoadingScreen.tsx` já apontam para estes paths — vão apanhar automaticamente

### 2. Corrigir theme-color no index.html
- Linha 335: `#985F97` → `#7B6B99`

### 3. Tornar as cores mais distintas (opcional mas recomendado)
Se queres ver uma diferença mais marcada, posso:
- Aumentar a saturação do lilás: `275 22% 55%` → `270 28% 52%` (mais roxo/saturado)
- Tornar o dourado mais quente: `37 48% 56%` → `38 52% 52%` (mais rico/intenso)
- Ou manter as cores actuais se preferes a subtileza

### Ficheiros a modificar

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 1 | `public/images/logo.png` | Novo logo |
| 2 | `public/images/logo.webp` | Novo logo |
| 3 | `index.html` | theme-color hex |
| 4 | `src/index.css` | Ajustar cores (se aprovado) |

