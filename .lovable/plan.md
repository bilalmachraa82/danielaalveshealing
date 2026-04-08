# Plano de Desenvolvimento — Daniela Alves Healing (Aurikaa)

> Última revisão: Abril 2026 · Brandbook Aurikaa v1

---

## 🎨 Sistema de Design — Brandbook Aurikaa

### Tipografia oficial (do Brandbook)

| Função | Fonte | Uso |
|--------|-------|-----|
| **Display / Títulos** | **Quincy CF** (serifada vintage) | Headings (h1, h2, h3), hero text |
| **Corpo / UI** | **Museo / Museo Sans** (geométrica humanista) | Parágrafos, botões, navegação, labels |

#### ⚠️ Incoerência Atual no Código
O `tailwind.config.ts` usa `Cormorant Garamond` (serif) + `DM Sans` (sans) — estas são fontes provisórias que **não correspondem ao brandbook**. Precisam ser substituídas por Quincy CF + Museo.

### Estratégia de Implementação de Fontes (Custo Zero)

**Opção recomendada — Adobe Fonts (se houver subscrição CC):**
- Ambas as fontes (Quincy CF e Museo) estão disponíveis gratuitamente em [fonts.adobe.com](https://fonts.adobe.com)
- Criar um "Web Project" em fonts.adobe.com e copiar o link de incorporação
- Adicionar o `<link>` da Adobe no `index.html` e atualizar o `tailwind.config.ts`

**Alternativa gratuita — se não houver Adobe CC:**
- `Quincy CF` → substituir por **Fraunces** (Google Fonts, serifada expressiva e similar)
- `Museo Sans` → substituir por **Nunito Sans** (Google Fonts, geométrica humanista similar)
- Carga via Google Fonts no `index.html` com `font-display: swap`

**Pesos gratuitos da Museo:**
- Os pesos 300, 500 e 700 da Museo original são gratuitos (download em [exljbris.com](https://www.exljbris.com/museo.html))
- Se o brandbook usar apenas estes pesos, pode usar ficheiros `.woff2` diretamente sem custo

---

## 🔧 Tarefas Pendentes

### 1. Substituição de Fontes (PRIORIDADE ALTA)

**Ficheiros a modificar:**

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 1 | `index.html` | Substituir link de Google Fonts (Cormorant/DM Sans) pelo link da Adobe Fonts OU Fraunces+Nunito Sans |
| 2 | `tailwind.config.ts` | Atualizar `fontFamily.serif` para `'quincy-cf'` (ou `'Fraunces'`) e `fontFamily.sans` para `'museo-sans'` (ou `'Nunito Sans'`) |
| 3 | `src/index.css` | Verificar e atualizar variáveis CSS de fontes se existirem |

**Prompt para usar no Lovable:**
```
Substitui as fontes do projeto:
- font-serif: muda de "Cormorant Garamond" para "Fraunces" (Google Fonts)
- font-sans: muda de "DM Sans" para "Nunito Sans" (Google Fonts)
Atualiza o index.html para carregar as novas fontes via Google Fonts com font-display:swap
e atualiza o tailwind.config.ts correspondentemente.
```

---

### 2. Melhorar Legibilidade do Logo no Header (PENDENTE)

#### Problema
O logo actual tem `h-10` (40px) — demasiado pequeno para um logo com ícone + nome + tagline. Os detalhes da mão com ramo e o texto "Healing & Harmony" ficam ilegíveis, especialmente no estado scrolled (fundo branco com versão lilás).

#### Plano de Correção

- **Hero (sem scroll):** `h-14` (56px) — logo dourado grande e impactante
- **Scrolled (fundo branco):** `h-11` (44px) — ligeiramente mais compacto mas ainda legível
- Transição suave com `transition-all duration-300` (já está preparada)
- Regenerar `logo-dark.png`/`.webp` com lilás mais escuro: `#5A3D8F` (garante contraste WCAG AA > 4.5:1 sobre fundo branco)
- Adicionar `drop-shadow(0 1px 3px rgba(0,0,0,0.3))` ao logo no estado hero (sobre vídeo)

#### Ficheiros a modificar

| # | Ficheiro | Alteração |
|---|----------|-----------|
| 1 | `src/components/Navigation.tsx` | Ajustar classes de tamanho (h-14/h-11), adicionar drop-shadow condicional |
| 2 | `public/images/logo-dark.png` | Regenerar com lilás mais escuro (#5A3D8F) |
| 3 | `public/images/logo-dark.webp` | Regenerar com lilás mais escuro (#5A3D8F) |

---

## 📋 Referências do Brandbook

- **Nome da marca:** Aurikaa
- **Fonte display:** Quincy CF (Connary Fagen) — estilo serifado vintage/elegante
- **Fonte corpo:** Museo / Museo Sans (exljbris) — estilo geométrico humanista
- **Tom:** Wellness, luxo acessível, cura, feminino, sofisticado
- **Logo cores:** dourado (hero) + lilás #5A3D8F (scrolled/dark backgrounds)
