# Plano de Revenda — CRM para Terapeutas

## Estado Atual

Tudo está no repositório GitHub: https://github.com/bilalmachraa82/danielaalveshealing

O projeto tem **22 ficheiros com valores hardcoded** específicos da Daniela (nome, cores, morada, telefone, serviços, preços, poesia). Para revender, há duas abordagens:

---

## Abordagem A: Clone & Configure (5-10 clientes)

**Tempo por cliente novo: ~2-3 horas**
**Custo operacional por cliente: 0€/mês**

### Passos para cada novo terapeuta:

1. **Fork do repo** no GitHub (repo privado para cada cliente)
2. **Editar ficheiro de configuração** (criar um `config/therapist.ts`)
3. **Alterar 22 ficheiros** com nome, cores, serviços, contactos
4. **Criar conta Neon** (free tier — DB separado por cliente)
5. **Criar projeto Vercel** (free tier — deploy separado)
6. **Configurar domínio** (Cloudflare DNS)
7. **Setup Google Calendar** (service account por cliente)
8. **Setup Resend** (adicionar domínio do cliente)

### Prós:
- Simples de implementar
- Cada cliente tem dados 100% isolados (RGPD)
- Personalização total por cliente

### Contras:
- Manutenção: atualizar 10 repos quando há uma correção
- Não escala para 50+ clientes
- Trabalho manual repetitivo

---

## Abordagem B: SaaS Multi-Tenant (10-50+ clientes) — RECOMENDADO

**Tempo de desenvolvimento: ~2-3 semanas**
**Custo operacional: ~25-50€/mês (infra partilhada)**

### Arquitetura

```
                    ┌─────────────────────────┐
                    │   app.healercrm.com     │
                    │   (ou domínio custom)    │
                    └──────────┬──────────────┘
                               │
                    ┌──────────┴──────────────┐
                    │    Vercel (1 deploy)     │
                    │    React + API Routes    │
                    └──────────┬──────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────┴───┐  ┌────────┴────┐  ┌────────┴────┐
    │  Neon DB    │  │   Resend    │  │  Google     │
    │ (1 DB,     │  │  (1 conta)  │  │  Calendar   │
    │  multi-    │  │             │  │  (por       │
    │  tenant)   │  │             │  │   cliente)  │
    └─────────────┘  └─────────────┘  └─────────────┘
```

### O que muda:

1. **Tabela `tenants`** (terapeutas):
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,        -- "daniela-alves", "joana-silva"
  business_name TEXT NOT NULL,       -- "Daniela Alves"
  tagline TEXT,                      -- "Healing & Wellness"
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'PT',
  -- Branding
  color_primary TEXT DEFAULT '#985F97',
  color_secondary TEXT DEFAULT '#D9AA4F',
  color_background TEXT DEFAULT '#FAF7F5',
  font_heading TEXT DEFAULT 'Cormorant Garamond',
  font_body TEXT DEFAULT 'DM Sans',
  logo_url TEXT,
  -- Services (JSON)
  services JSONB DEFAULT '[]',
  -- Integration
  google_calendar_id TEXT,
  google_service_account_json TEXT,
  google_review_url TEXT,
  resend_domain TEXT,
  -- Config
  whatsapp_number TEXT,
  admin_email TEXT,
  admin_password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

2. **Todas as tabelas ganham `tenant_id`**:
```sql
ALTER TABLE clients ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE sessions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- etc. para todas as tabelas
```

3. **React BrandingProvider** — context que carrega cores, nome, logo do tenant

4. **Routing por subdomínio ou slug**:
   - `daniela.healercrm.com` ou `healercrm.com/daniela`
   - Ou domínio custom: `danielaalveshealing.com`

5. **Admin de onboarding** — formulário para registar novo terapeuta

### Modelo de negócio sugerido:

| Plano | Preço/mês | Inclui |
|-------|-----------|--------|
| Starter | 29€ | CRM + formulários + email + 50 clientes |
| Pro | 49€ | + Google Calendar + OCR + 200 clientes |
| Premium | 79€ | + domínio custom + branding total + ilimitado |

### Custos operacionais:
- Neon Pro: ~25€/mês (partilhado por todos)
- Vercel Pro: ~20€/mês (1 deploy)
- Resend: ~18€/mês (partilhado)
- **Total infra: ~63€/mês** — rentável a partir de 3 clientes

---

## Ficheiros a Refatorar (Abordagem B)

### Fase 1: Configuração Centralizada (~3 dias)

Criar `src/lib/config.ts` que exporta todas as constantes configuráveis:
```typescript
interface TherapistConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: { street: string; city: string; postal: string; country: string };
  colors: { primary: string; secondary: string; background: string };
  fonts: { heading: string; body: string };
  logo: string;
  services: Array<{ id: string; name: string; namePt: string; nameEn: string; price: number; duration: number }>;
  googleReviewUrl: string;
  socialLinks: { instagram?: string; youtube?: string; maps?: string };
}
```

### Ficheiros a alterar (22 ficheiros):

**Frontend — Landing Page (10 ficheiros):**
- `index.html` — meta tags, structured data
- `src/components/Navigation.tsx` — logo, phone, WhatsApp
- `src/components/Footer.tsx` — name, email, phone, address
- `src/components/Services.tsx` — service names, prices, descriptions
- `src/components/About.tsx` — bio, photo
- `src/components/CTABanner.tsx` — WhatsApp link
- `src/components/WhatsAppFloat.tsx` — phone number
- `src/components/GiftVoucher.tsx` — WhatsApp link
- `src/components/SpaceHarmony.tsx` — WhatsApp link
- `src/components/TrustStrip.tsx` — reviews, years, location

**Frontend — Admin (4 ficheiros):**
- `src/pages/admin/Login.tsx` — name, tagline
- `src/pages/admin/Dashboard.tsx` — service labels
- `src/components/admin/layout/AdminSidebar.tsx` — name
- `src/components/admin/QuickBooking.tsx` — services, prices

**Frontend — Public Forms (3 ficheiros):**
- `src/pages/public/PreparePage.tsx` — address, instructions, quotes
- `src/pages/public/IntakePage.tsx` — brand text
- `src/pages/public/SatisfactionPage.tsx` — brand text

**Backend (3 ficheiros):**
- `api/auth/login.ts` — admin email/password
- `api/_email.ts` — FROM address, email templates, colors
- `api/_calendar.ts` — service labels, location

**Config (2 ficheiros):**
- `vite.config.ts` — PWA manifest
- `tailwind.config.ts` — font families

### Fase 2: Multi-Tenant DB (~2 dias)
- Adicionar tenant_id a todas as tabelas
- Criar tabela tenants
- Middleware de tenant resolution (por subdomínio ou slug)
- RLS por tenant_id

### Fase 3: Onboarding Flow (~2 dias)
- Formulário de registo para novos terapeutas
- Upload de logo
- Configuração de cores (color picker)
- Configuração de serviços (nome, preço, duração)
- Setup automático de Resend domain
- Instruções para Google Calendar

### Fase 4: Landing Page Dinâmica (~1 dia)
- Gerar landing page a partir dos dados do tenant
- Template system para secções (About, Services, FAQ)

---

## Quick Start — Para Vender Amanhã (Abordagem A)

Se quiseres vender amanhã com a abordagem clone:

1. **Criar um template README** com os passos de configuração
2. **Criar um script de setup** que substitui os valores hardcoded automaticamente
3. **Documentar o processo** de onboarding

Tempo estimado para preparar: ~4 horas.
Tempo por novo cliente depois: ~2-3 horas.

---

## Valor de Mercado

Ferramentas equivalentes para terapeutas:
- Jane App: 54€/mês
- SimplePractice: 49€/mês
- Cliniko: 45€/mês
- TherapyNotes: 59€/mês

O teu CRM tem funcionalidades equivalentes + é personalizado + custo 0€/mês para o terapeuta.

**Sugestão de pricing:**
- Setup fee: 300-500€ (one-time)
- Manutenção: 30-50€/mês (opcional)
- Ou: 49€/mês all-inclusive (sem setup fee)
