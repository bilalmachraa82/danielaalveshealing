

# Auditoria Completa & Plano de Correções Reais

## Diagnóstico — Porque é que os fundos não aparecem

O problema raiz é simples: **todas as cores de fundo do site são praticamente brancas**.

- `--background: 300 100% 100%` = branco puro
- `--mist: 300 43% 97%` = 97% branco
- `--cream: 40 60% 98%` = 98% branco

As imagens do Unsplash estão a 10-12% de opacidade com blur pesado, em cima de gradientes brancos, cobertos por mais gradientes brancos (`from-background/60`). O resultado: **invisível**.

Abordagem anterior (imagens com 4-12% opacidade + blur + overlay) **nunca vai funcionar** com esta paleta clara. Precisamos de uma abordagem diferente.

---

## Plano Real — Fundos com cor e presença

### 1. Services ("Cuidar de Ti") — Fundo lilás/cream sólido com textura
- **Remover** a imagem Unsplash e o overlay gradiente (não funcionam)
- **Substituir** por um fundo sólido com cor real: `bg-[hsl(300_30%_95%)]` (lilás suave mas VISÍVEL)
- Adicionar um gradiente radial de `primary/[0.08]` ao centro para dar profundidade
- Manter a `noise-overlay` para textura
- Resultado: fundo com presença visual real, não branco

### 2. GiftVoucher ("Cheque-Oferta") — Fundo dourado/cream quente
- **Remover** a imagem Unsplash e overlays
- **Substituir** por gradiente sólido quente: `from-[hsl(37_40%_94%)] via-[hsl(300_20%_96%)] to-[hsl(37_35%_95%)]`
- Gradiente radial dourado (`gold/[0.08]`) no centro
- Resultado: secção com tom dourado quente que complementa o cheque-oferta

### 3. Testimonials — Reforçar presença
- Aumentar opacidade do gradiente lilás de `0.08/0.12/0.06` para `0.12/0.18/0.10`
- Fundo visivelmente lilás, não quase-branco

### 4. About — Tom cream mais visível  
- Mudar `from-cream via-cream to-mist` para cores mais saturadas: `from-[hsl(40_50%_95%)] via-[hsl(35_45%_96%)] to-[hsl(300_30%_96%)]`

### 5. FAQ — Adicionar presença
- Trocar `from-mist via-background to-cream` por `from-[hsl(300_25%_96%)] via-[hsl(300_20%_97%)] to-[hsl(40_40%_96%)]`

---

## Ficheiros a modificar
1. `src/components/Services.tsx` — Remover Unsplash, fundo lilás sólido
2. `src/components/GiftVoucher.tsx` — Remover Unsplash, fundo dourado sólido
3. `src/components/Testimonials.tsx` — Gradiente lilás mais forte
4. `src/components/About.tsx` — Cream mais saturado
5. `src/components/FAQ.tsx` — Cores mais presentes

