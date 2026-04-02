# Premium Hardening Design

## Goal

Fechar os blockers reais de produção da Daniela Alves CRM e elevar os fluxos afetados a um nível premium de confiança e UX, sem alterar a lógica de negócio já validada para clientes, sessões, formulários e comunicações.

## Scope

Esta vaga cobre quatro áreas ligadas entre si:

1. paridade total de autenticação nos fluxos admin
2. robustez do cron de `pre-session-reminder`
3. reverse sync real do Google Calendar para sessões criadas pela app
4. polish operacional diretamente ligado a esses fluxos

Ficam fora desta vaga:

- SMS/WhatsApp provider real
- redesign amplo do questionário
- white-label total do site público

## Context

O estado atual já tem:

- Bearer token admin funcional em parte do frontend e em todos os handlers admin
- paginação consistente em clientes e sessões
- cron bundle a compilar
- inbox de reverse sync visível no dashboard

Mas continuam três problemas que bloqueiam ship:

1. vários `fetch("/api/...")` do admin não enviam `Authorization`, o que parte quick booking, OCR, importações, criação de tags e envio de emails/formulários a partir do admin
2. o cron de `pre-session-reminder` usa um estado `processing` que não existe na constraint da base de dados e, mesmo que existisse, pode prender sessões em runs que fazem claim e depois não enviam
3. o reverse sync ainda não atualiza sessões quando eventos da app são alterados/cancelados no Google Calendar; apenas marca timestamps e alimenta inbox

## Approaches Considered

### A. Patches localizados

Corrigir cada `fetch` em separado, trocar o estado do reminder no cron e fazer alguns `UPDATE sessions` no reverse sync.

Prós:

- rápido a curto prazo

Contras:

- deixa duplicação de auth no frontend
- mantém risco de regressão em novos fetches admin
- resolve sintomas mais do que contratos

### B. Hardening orientado a contratos `(recomendado)`

Criar uma camada única para admin fetch autenticado, alinhar o reminder state machine entre TS/cron/DB e separar claramente reverse sync de eventos criados pela app vs eventos manuais.

Prós:

- resolve a causa dos bugs
- melhora previsibilidade para futuras vagas
- reduz drift entre frontend, API e schema

Contras:

- mexe em mais ficheiros nesta vaga

### C. Refactor maior de auth/session infra

Trocar já Bearer token/localStorage por cookie httpOnly e refazer também a inbox numa arquitetura mais rica.

Prós:

- melhor segurança teórica

Contras:

- demasiado amplo para esta vaga
- risco alto de perturbar fluxos estáveis

## Chosen Design

Segue-se a abordagem B.

## Design

### 1. Auth Parity For Admin Flows

O frontend admin passa a ter uma única forma aprovada de chamar APIs protegidas:

- `getAuthHeaders()` continua a ser a fonte de verdade do Bearer token
- um helper reutilizável encapsula `fetch`, JSON parse, merge de headers e tratamento de `401`
- todos os `fetch("/api/...")` admin fora dos wrappers atuais são migrados para esse helper

O ciclo de autenticação fica assim:

- `login` continua a receber o token do backend
- `AuthContext` guarda o objeto auth atual em `localStorage`
- `admin fetch helper` lê o token através da mesma chave
- qualquer `401` em requests admin faz `logout` coordenado e redireciona para `/admin/login`
- `storage` events também limpam a sessão em tabs abertas

Isto evita o estado atual em que o layout ainda pensa que existe utilizador autenticado, mas os requests já falham por falta de token.

### 2. Reminder State Machine Safe

O reminder pré-sessão deixa de depender de um estado inválido e de claims que podem ficar presos.

A máquina de estados fica:

- `pending`
- `scheduled`
- `sent`
- `skipped`
- `processing`

`processing` passa a existir em todos os níveis:

- migration
- tipos TypeScript
- qualquer UI/admin label que apresente reminder status

O cron muda o fluxo:

1. seleciona apenas sessões elegíveis para envio
2. faz claim atómico para `processing`
3. envia
4. fecha em `sent`
5. em qualquer falha ou decisão de não envio, liberta explicitamente o estado para `pending` ou `skipped`

O objetivo não é só evitar duplicados; é garantir que uma sessão nunca fica órfã num estado intermédio.

### 3. Reverse Sync Real

O reverse sync passa a distinguir dois universos:

- eventos criados pela app
- eventos manuais/externos

Para eventos criados pela app:

- match por `google_calendar_event_id`
- se o evento mudou de data/hora, a sessão é remarcada no CRM
- se o evento foi cancelado no Google Calendar, a sessão é cancelada no CRM
- o histórico fica registado como alteração vinda de `system`
- reminders são recalculados
- `calendar_sync_status` e `calendar_last_synced_at` são atualizados

Para eventos manuais:

- continuam a entrar na `calendar_inbox`
- não criam sessões automaticamente
- o dashboard pode pedir o payload com `get_for_create` e pré-preencher quick booking

Isto mantém segurança operacional: sync bidirecional automático só para eventos da app; tudo o que é ambíguo continua com revisão assistida.

### 4. Premium UX Polish Tied To These Flows

Sem redesenhar o produto inteiro, esta vaga fecha os pontos de atrito mais visíveis:

- botão `Criar Sessão` na inbox usa `get_for_create` e abre Quick Booking pré-preenchido
- inbox mostra `loading`, `error`, vazio e ação em curso
- `Settings`, `SessionCreate`, `QuickBooking`, `ClientImport` e `ClientOCRImport` deixam de falhar silenciosamente por auth
- quando a sessão expira localmente, o admin não fica preso num dashboard meio quebrado; volta ao login de forma clara

## Files Likely To Change

### Frontend

- `src/lib/api/auth-headers.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/admin/SessionCreate.tsx`
- `src/pages/admin/Settings.tsx`
- `src/pages/admin/ClientImport.tsx`
- `src/pages/admin/ClientOCRImport.tsx`
- `src/components/admin/QuickBooking.tsx`
- `src/hooks/useDashboard.ts`
- `src/pages/admin/Dashboard.tsx`
- `src/components/admin/layout/AdminLayout.tsx`

### Backend

- `api/cron/index.ts`
- `api/sessions/index.ts`
- `src/lib/calendar/reverse-sync.ts`
- `api/_calendar.ts`

### Schema / Types / Tests

- `supabase/migrations/007_premium_hardening.sql`
- `src/lib/communications/types.ts`
- `src/lib/communications/reminders.ts`
- `src/lib/calendar/reverse-sync.test.ts`
- novos testes para auth helper / reminder state / reverse sync mutation rules

## Error Handling

- requests admin protegidos devolvem erro normalizado e fazem logout em `401`
- cron deixa de devolver mensagens internas cruas ao cliente
- reverse sync ignora eventos malformados sem rebentar a run inteira
- cancelamentos/remarcações vindos do calendário só afetam sessões com correspondência segura

## Testing Strategy

Antes de qualquer implementação:

- teste a falhar para auth helper/calls admin sem token
- teste a falhar para `processing` como estado suportado
- teste a falhar para libertação de claim em non-send/failure path
- teste a falhar para reverse sync que remarca/cancela sessões app-owned
- teste a falhar para `get_for_create` consumido pelo dashboard/quick booking

Depois:

- `npx vitest run`
- `npx tsc --noEmit`
- bundle check do cron
- smoke manual local dos fluxos admin tocados

## Success Criteria

Esta vaga fica pronta quando:

1. todos os fluxos admin protegidos enviam auth e deixam de falhar com `401`
2. o pre-session reminder não viola a constraint do DB e não deixa sessões presas
3. mudanças feitas a eventos da app no Google Calendar atualizam a sessão correspondente no CRM
4. a inbox do dashboard fica operacional e previsível
5. a verificação final volta a não ter blockers reais de produção nestes três blocos
