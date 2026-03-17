

# Auditoria Premium — O que falta para elevar o site

Analisei cada componente do site em detalhe. Eis o que falta para atingir um verdadeiro look premium editorial:

---

## 1. Micro-interações e animações (falta vida ao scroll)
**Problema**: Todos os elementos usam a mesma animação básica `translate-y + opacity`. Não há variação — parece estático.
**Solução**: 
- Adicionar **staggered animations** nos cards de serviço (cada card entra com delay crescente + leve rotação)
- Parallax subtil nos elementos decorativos (SVGs botânicos, glows) via scroll listener
- Transição suave entre testemunhos (fade crossfade em vez de corte seco)
- Hover nos cards de serviço com **scale + shadow elevation** mais pronunciado

## 2. Tipografia — falta hierarquia e "luxo tipográfico"
**Problema**: Os subtítulos e body text são todos `text-sm` ou `text-base` sem variação. Falta drama tipográfico.
**Solução**:
- Adicionar **números estilizados** nos preços (font-variant-numeric: oldstyle-nums)
- Citações com aspas decorativas maiores e mais visíveis (atualmente `text-gold/[0.06]` — invisível)
- **Pull quotes** com barra lateral dourada nos testemunhos
- Letra capitular (drop-cap) mais dramática no About

## 3. Secção "Sobre Mim" — falta uma "assinatura pessoal"
**Problema**: A foto está bem mas falta um toque pessoal premium.
**Solução**:
- Adicionar uma **assinatura manuscrita** da Daniela (SVG ou imagem) abaixo dos parágrafos
- Usar uma imagem de assinatura do GitHub repo ou criar um SVG elegante

## 4. Cards de serviço — parecem flat
**Problema**: Os cards usam `glass-card` mas sem profundidade real. Falta textura.
**Solução**:
- Adicionar **borda superior dourada com gradiente** (já existe `h-px` mas é subtil demais)
- Background com gradiente interno subtil (de cream para lilás suave)
- **Ícone com background gradiente** em vez de apenas border circle
- Número do serviço em romano (I, II, III) como detalhe editorial

## 5. Transições entre secções — cortes abruptos
**Problema**: As secções terminam e começam com cores diferentes sem transição suave.
**Solução**:
- Adicionar **dividers orgânicos** entre secções (não ondas, mas gradientes de fade com 80-120px de height)
- Ou usar `mix-blend-mode: multiply` nos limites

## 6. Footer — falta um CTA final (última oportunidade)
**Problema**: O footer tem informação mas não convida à ação.
**Solução**:
- Adicionar um **banner CTA premium** acima do footer: "Pronta para começar a tua jornada?" com botão WhatsApp
- Estilo: fundo com gradiente gold-to-lilac, tipografia serifada grande

## 7. Mapa ou localização visual (falta confiança)
**Problema**: O endereço está no footer mas sem contexto visual.
**Solução**:
- Adicionar um **mini-mapa estilizado** ou imagem do espaço terapêutico na secção de contacto/footer

## 8. Loading/Page transition (primeira impressão)
**Problema**: A página carrega de golpe sem elegância.
**Solução**:
- Adicionar um **loading screen mínimo** com o logo + fade-out (2-3 segundos) para dar uma entrada cinematográfica

---

## Ficheiros a modificar
1. **`src/components/Services.tsx`** — Cards com numeração romana, gradiente interno, ícones mais ricos, hover elevado
2. **`src/components/Testimonials.tsx`** — Crossfade transition, aspas mais visíveis, pull-quote styling
3. **`src/components/About.tsx`** — Assinatura manuscrita SVG, drop-cap mais dramático
4. **`src/components/Footer.tsx`** — CTA banner premium antes do footer
5. **`src/pages/Index.tsx`** — Novo componente CTABanner + dividers entre secções
6. **`src/components/Hero.tsx`** — Aspas decorativas mais visíveis no quote
7. **`src/index.css`** — Novas animações (crossfade, stagger) e utilitários tipográficos
8. **Novo: `src/components/CTABanner.tsx`** — Banner final de chamada à ação
9. **Novo: `src/components/LoadingScreen.tsx`** — Ecrã de loading premium com logo

## Prioridade de impacto
1. **CTA Banner** — converte visitantes (alto impacto)
2. **Loading Screen** — primeira impressão cinematográfica
3. **Cards mais ricos** — elimina o aspecto flat
4. **Transições entre secções** — fluidez visual
5. **Tipografia premium** — detalhes que fazem a diferença

