-- ============================================================
-- Daniela Alves CRM - Initial Database Schema
-- Neon PostgreSQL (eu-central-1)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  profession TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'PT',
  source TEXT CHECK (source IN ('manual', 'website', 'referral')) DEFAULT 'manual',
  status TEXT CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  consent_data_processing BOOLEAN DEFAULT false,
  consent_marketing BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(first_name, last_name);

-- ============================================================
-- ANAMNESIS FORMS (1 per client, updated periodically)
-- ============================================================
CREATE TABLE anamnesis_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  -- Saude Geral: 17 perguntas, cada = { has: bool, details: text }
  health_general JSONB NOT NULL DEFAULT '{}',
  -- Estilo Vida: 8 perguntas, cada = { answer: text }
  lifestyle JSONB NOT NULL DEFAULT '{}',
  -- Mapa corporal: [{ muscle, side, intensity, notes }]
  body_map_data JSONB DEFAULT '[]',
  -- Sessao
  pain_trigger_task TEXT,
  has_pain_trigger BOOLEAN,
  previous_massage_experience BOOLEAN,
  previous_massage_details TEXT,
  session_objectives TEXT,
  -- Declaracao
  declaration_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_date DATE,
  -- Acesso publico por token
  token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'sent', 'completed', 'expired')) DEFAULT 'draft',
  version INT DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_anamnesis_client ON anamnesis_forms(client_id);
CREATE INDEX idx_anamnesis_token ON anamnesis_forms(token);
CREATE INDEX idx_anamnesis_status ON anamnesis_forms(status);

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 120,
  service_type TEXT CHECK (service_type IN ('healing_wellness', 'pura_radiancia', 'pure_earth_love', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  price_cents INT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  satisfaction_sent BOOLEAN DEFAULT false,
  satisfaction_sent_at TIMESTAMPTZ,
  review_request_sent BOOLEAN DEFAULT false,
  review_request_sent_at TIMESTAMPTZ,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_client ON sessions(client_id);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_client_scheduled ON sessions(client_id, scheduled_at);

-- ============================================================
-- SESSION INTAKE FORMS (1 per session, type varies)
-- ============================================================
CREATE TABLE session_intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  form_type TEXT CHECK (form_type IN ('healing_touch', 'pura_radiancia')) NOT NULL,
  -- Dados comuns
  referral_source TEXT,
  motivation TEXT,
  main_objective TEXT,
  health_conditions TEXT,
  current_treatment TEXT,
  pregnant_breastfeeding TEXT,
  allergies_sensitivities TEXT,
  -- Escalas 1-10 (Healing Touch)
  feeling_physically INT CHECK (feeling_physically BETWEEN 1 AND 10),
  feeling_psychologically INT CHECK (feeling_psychologically BETWEEN 1 AND 10),
  feeling_emotionally INT CHECK (feeling_emotionally BETWEEN 1 AND 10),
  feeling_energetically INT CHECK (feeling_energetically BETWEEN 1 AND 10),
  -- Pura Radiancia extras
  meditation_practice TEXT,
  current_challenges TEXT,
  immersion_motivation TEXT,
  main_intention TEXT,
  wishlist TEXT,
  aroma_preferences TEXT,
  music_preferences TEXT,
  beverage_preference TEXT,
  dietary_restrictions TEXT,
  color_preferences TEXT,
  -- Geral
  additional_observations TEXT,
  -- Acesso publico por token
  token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'sent', 'completed', 'expired')) DEFAULT 'draft',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_intake_client ON session_intake_forms(client_id);
CREATE INDEX idx_intake_session ON session_intake_forms(session_id);
CREATE INDEX idx_intake_token ON session_intake_forms(token);
CREATE INDEX idx_intake_status ON session_intake_forms(status);

-- ============================================================
-- SESSION NOTES (SOAP format)
-- ============================================================
CREATE TABLE session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  body_map_data JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notes_session ON session_notes(session_id);

-- ============================================================
-- SATISFACTION RESPONSES
-- ============================================================
CREATE TABLE satisfaction_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nps_score INT CHECK (nps_score BETWEEN 0 AND 10),
  comfort_rating INT CHECK (comfort_rating BETWEEN 1 AND 5),
  liked_most TEXT,
  improvement_suggestions TEXT,
  would_rebook TEXT CHECK (would_rebook IN ('yes', 'no', 'maybe')),
  token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_satisfaction_session ON satisfaction_responses(session_id);
CREATE INDEX idx_satisfaction_client ON satisfaction_responses(client_id);
CREATE INDEX idx_satisfaction_token ON satisfaction_responses(token);

-- ============================================================
-- TAGS & CLIENT_TAGS
-- ============================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('status', 'service', 'segment', 'custom')) DEFAULT 'custom',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, tag_id)
);

CREATE INDEX idx_client_tags_client ON client_tags(client_id);
CREATE INDEX idx_client_tags_tag ON client_tags(tag_id);

-- ============================================================
-- EMAIL LOG
-- ============================================================
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  email_type TEXT CHECK (email_type IN (
    'anamnesis', 'intake_healing', 'intake_immersion',
    'satisfaction', 'review_request', 'reminder',
    'rebooking', 'reactivation'
  )) NOT NULL,
  resend_id TEXT,
  status TEXT CHECK (status IN ('sent', 'delivered', 'opened', 'bounced', 'failed')) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_client ON email_log(client_id);
CREATE INDEX idx_email_session ON email_log(session_id);
CREATE INDEX idx_email_type ON email_log(email_type);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_anamnesis_updated_at
  BEFORE UPDATE ON anamnesis_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: Default tags
-- ============================================================
INSERT INTO tags (name, category, color) VALUES
  ('Novo Cliente', 'status', '#8B5CF6'),
  ('Ativo', 'status', '#10B981'),
  ('Inativo', 'status', '#6B7280'),
  ('VIP', 'status', '#F59E0B'),
  ('Healing & Wellness', 'service', '#985F97'),
  ('Pura Radiância', 'service', '#D9AA4F'),
  ('Pure Earth Love', 'service', '#059669'),
  ('Newsletter', 'segment', '#3B82F6'),
  ('Gravidez', 'segment', '#EC4899'),
  ('Dor Crónica', 'segment', '#EF4444'),
  ('Stress', 'segment', '#F97316');
