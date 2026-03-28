import { z } from "zod";

// ============================================================
// Primitive schemas
// ============================================================

const healthQuestionSchema = z.object({
  has: z.boolean().default(false),
  details: z.string().default(""),
});

const lifestyleQuestionSchema = z.object({
  answer: z.string().default(""),
});

// ============================================================
// Health General — 17 questions
// ============================================================

export const healthGeneralSchema = z.object({
  medicacao: healthQuestionSchema,
  cirurgias: healthQuestionSchema,
  acidentes_fracturas_proteses: healthQuestionSchema,
  doenca_cronica: healthQuestionSchema,
  diabetes: healthQuestionSchema,
  sintomas_cardiacos: healthQuestionSchema,
  hipertensao_hipotensao: healthQuestionSchema,
  varizes_retencao_liquidos: healthQuestionSchema,
  sintomas_respiratorios: healthQuestionSchema,
  alergias_sensibilidades: healthQuestionSchema,
  sintomas_pele: healthQuestionSchema,
  sintomas_musculo_esqueleticos: healthQuestionSchema,
  sintomas_sistema_nervoso: healthQuestionSchema,
  sintomas_digestivos: healthQuestionSchema,
  boca_tratamentos: healthQuestionSchema,
  gravidez_filhos_hormonal: healthQuestionSchema,
  nascimento_amamentacao: healthQuestionSchema,
});

export type HealthGeneralInput = z.infer<typeof healthGeneralSchema>;

// ============================================================
// Lifestyle — 8 questions
// ============================================================

export const lifestyleSchema = z.object({
  ingestao_liquidos: lifestyleQuestionSchema,
  alimentacao_alcool: lifestyleQuestionSchema,
  tabaco_drogas: lifestyleQuestionSchema,
  actividade_fisica: lifestyleQuestionSchema,
  qualidade_sono: lifestyleQuestionSchema,
  ciclo_menstrual: lifestyleQuestionSchema,
  sexualidade: lifestyleQuestionSchema,
  funcionamento_intestinal: lifestyleQuestionSchema,
});

export type LifestyleInput = z.infer<typeof lifestyleSchema>;

// ============================================================
// Body map marker
// ============================================================

export const bodyMapMarkerSchema = z.object({
  muscle: z.string().min(1),
  side: z.enum(["left", "right"]).optional(),
  intensity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  notes: z.string().optional(),
});

// ============================================================
// Full anamnesis form schema
// ============================================================

export const anamnesisFormSchema = z.object({
  // Step 1 — personal info (pre-filled / read-only)
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),

  // Step 2 — health general
  health_general: healthGeneralSchema,

  // Step 3 — lifestyle
  lifestyle: lifestyleSchema,

  // Step 4 — body map + pain trigger
  body_map_data: z.array(bodyMapMarkerSchema).default([]),
  has_pain_trigger: z.boolean().default(false),
  pain_trigger_task: z.string().default(""),

  // Step 5 — session goals
  previous_massage_experience: z.boolean().default(false),
  previous_massage_details: z.string().default(""),
  session_objectives: z.string().default(""),

  // Step 6 — declaration
  declaration_accepted: z
    .boolean()
    .refine((v) => v === true, {
      message: "A declaração deve ser aceite para continuar.",
    }),
});

export type AnamnesisFormInput = z.infer<typeof anamnesisFormSchema>;

// ============================================================
// Default values helper
// ============================================================

const defaultHealthQuestion = (): z.infer<typeof healthQuestionSchema> => ({
  has: false,
  details: "",
});

const defaultLifestyleQuestion = (): z.infer<
  typeof lifestyleQuestionSchema
> => ({
  answer: "",
});

export const anamnesisDefaultValues: AnamnesisFormInput = {
  first_name: "",
  last_name: "",
  email: "",

  health_general: {
    medicacao: defaultHealthQuestion(),
    cirurgias: defaultHealthQuestion(),
    acidentes_fracturas_proteses: defaultHealthQuestion(),
    doenca_cronica: defaultHealthQuestion(),
    diabetes: defaultHealthQuestion(),
    sintomas_cardiacos: defaultHealthQuestion(),
    hipertensao_hipotensao: defaultHealthQuestion(),
    varizes_retencao_liquidos: defaultHealthQuestion(),
    sintomas_respiratorios: defaultHealthQuestion(),
    alergias_sensibilidades: defaultHealthQuestion(),
    sintomas_pele: defaultHealthQuestion(),
    sintomas_musculo_esqueleticos: defaultHealthQuestion(),
    sintomas_sistema_nervoso: defaultHealthQuestion(),
    sintomas_digestivos: defaultHealthQuestion(),
    boca_tratamentos: defaultHealthQuestion(),
    gravidez_filhos_hormonal: defaultHealthQuestion(),
    nascimento_amamentacao: defaultHealthQuestion(),
  },

  lifestyle: {
    ingestao_liquidos: defaultLifestyleQuestion(),
    alimentacao_alcool: defaultLifestyleQuestion(),
    tabaco_drogas: defaultLifestyleQuestion(),
    actividade_fisica: defaultLifestyleQuestion(),
    qualidade_sono: defaultLifestyleQuestion(),
    ciclo_menstrual: defaultLifestyleQuestion(),
    sexualidade: defaultLifestyleQuestion(),
    funcionamento_intestinal: defaultLifestyleQuestion(),
  },

  body_map_data: [],
  has_pain_trigger: false,
  pain_trigger_task: "",

  previous_massage_experience: false,
  previous_massage_details: "",
  session_objectives: "",

  declaration_accepted: false,
};
