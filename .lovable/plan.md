

# Correções Visuais & Elevação Premium

## Problemas Identificados

1. **Gift Voucher — imagem não muda com idioma**: Usa sempre `cheque-oferta-pt.jpg`, mas o repo tem `cheque-oferta-en.jpg`
2. **Footer preto**: Fundo `bg-foreground` (preto/escuro) desalinhado com a estética lilás/dourado/cream do site
3. **Services ("Cuidar de Ti") — vazio**: Fundo quase branco sem presença visual forte, cards sem imagem de fundo
4. **Gift Voucher — sem background**: Fundo simples, falta atmosfera
5. **Sensação geral de vazio**: Secções precisam de mais camadas visuais para manter o aspecto premium

---

## Correções a Implementar

### 1. GiftVoucher.tsx — Imagem bilíngue + background atmosférico
- Usar `lang` do contexto para alternar entre `cheque-oferta-pt.jpg` e `cheque-oferta-en.jpg`
- Adicionar uma imagem de fundo suave (natureza/flores do Unsplash, very low opacity ~3-4%) com blur para dar atmosfera à secção

### 2. Footer.tsx — Cor premium em vez de preto
- Substituir `bg-foreground` por um gradiente lilás escuro profundo (usando `--primary` em tons escuros)
- Algo como `from-[#2A1A2A] via-[#231525] to-[#1C101D]` — tons de lilás escuro que continuam a paleta do site
- Manter o texto claro e os acentos dourados

### 3. Services.tsx — Background mais rico
- Substituir o blur extremo da imagem de fundo (opacity 0.04) por uma imagem de natureza/wellness do Unsplash com opacity mais visível (~6-8%) e blur moderado
- Adicionar um gradiente radial suave como camada extra de profundidade

### 4. GiftVoucher.tsx — Fundo atmosférico
- Adicionar uma imagem de fundo de natureza serena (flores, pétalas, natureza de Sintra) com opacity muito baixa e blur, para dar riqueza visual sem distrair

### 5. About.tsx — Reforçar presença visual
- Aumentar ligeiramente a opacidade do background blur de 0.03 para 0.05
- Manter o resto como está (funciona bem)

---

## Ficheiros a modificar
1. **`src/components/GiftVoucher.tsx`** — Switch imagem PT/EN + background atmosférico
2. **`src/components/Footer.tsx`** — Gradiente lilás escuro em vez de preto
3. **`src/components/Services.tsx`** — Background imagery mais visível
4. **`src/components/About.tsx`** — Ajuste subtil de opacidade

