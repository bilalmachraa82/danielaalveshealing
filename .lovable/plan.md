

# Plano: Modais Premium + Barra Google legível + Auditoria visual

## Problemas identificados

1. **Build error**: `NodeJS` namespace em `Testimonials.tsx` linha 24 — precisa de `number` em vez de `NodeJS.Timeout`
2. **Modais dos serviços e Home Harmony**: Aspecto genérico — fundo branco plano, sem gradientes, sem textura. O botão WhatsApp verde vivo (`bg-whatsapp`) quebra o tom premium.
3. **Barra Google abaixo dos testemunhos**: `text-muted-foreground/60` sobre fundo lilás claro = ilegível (como mostra a screenshot do utilizador)
4. **Botão WhatsApp nos modais**: Verde forte, sem elegância — precisa de um tratamento mais subtil e alinhado com a paleta gold/lilás

## Correções

### 1. Fix build error — `Testimonials.tsx` linha 24
- Mudar `useRef<NodeJS.Timeout>` para `useRef<number | undefined>(undefined)`

### 2. Modais premium — `Services.tsx` e `SpaceHarmony.tsx`
Transformar os `DialogContent` com:
- **Fundo**: gradiente subtil `from-background via-cream to-mist` em vez de branco plano
- **Borda dourada lateral**: já existe `w-1 from-gold` — aumentar para `w-[3px]` com glow
- **Decoração**: adicionar aspas decorativas douradas no texto
- **Botão WhatsApp refinado**: trocar `bg-whatsapp` por um estilo mais premium — `bg-foreground text-background` (botão escuro elegante) com ícone WhatsApp subtil, ou `border-gold text-foreground` outline style
- **Tipografia do preço**: `font-serif text-lg text-gold` com `oldstyle-nums`

### 3. Barra Google legível — `Testimonials.tsx`
- Trocar `text-muted-foreground/60` por `text-foreground/70` para o texto
- Trocar `text-gold` por `text-gold` (manter) mas adicionar `drop-shadow` subtil
- Adicionar um fundo pill com `bg-white/60 backdrop-blur-sm` para garantir contraste em qualquer fundo

### 4. Ficheiros a modificar
1. `src/components/Testimonials.tsx` — fix TS error + barra Google legível
2. `src/components/Services.tsx` — modal premium + botão WhatsApp refinado
3. `src/components/SpaceHarmony.tsx` — modal premium + botão WhatsApp refinado

