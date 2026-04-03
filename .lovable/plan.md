

## Fix: Remover tagline duplicada na Splash Screen

### Problema
O logo (`/images/logo.webp`) já inclui o texto "Healing & Harmony" na própria imagem. Abaixo, a linha 67 do `LoadingScreen.tsx` renderiza `DEFAULT_CONFIG.tagline` que também é "Healing & Harmony" — duplicação.

### Solução
Remover o parágrafo da tagline (linhas 58-68) do `LoadingScreen.tsx`. O logo já comunica a marca completa. A splash screen fica mais limpa: apenas logo + linha dourada.

Alternativa: substituir a tagline por algo complementar como "Massagem Terapêutica & Holística" ou o slogan curto — mas o mais elegante (best practice luxury) é manter apenas o logo + linha decorativa, sem texto adicional.

### Ficheiro a modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/LoadingScreen.tsx` | Remover bloco da tagline (linhas 58-68), ajustar margin do logo |

