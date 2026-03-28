import { z } from "zod";

// Common fields shared between both service types
const commonIntakeFields = {
  referral_source: z.enum([
    "amigo_familiar",
    "redes_sociais",
    "cheque_oferta",
    "pesquisa_google",
    "outra",
  ]),
  motivation: z.string().min(1, "Por favor, partilhe a sua motivação"),
  main_objective: z.string().min(1, "Por favor, indique o seu principal objectivo"),
  health_conditions: z.string().optional(),
  current_treatment: z.string().optional(),
  pregnant_breastfeeding: z.string().optional(),
  allergies_sensitivities: z.string().optional(),
  additional_observations: z.string().optional(),
};

// Healing Touch specific fields
const healingTouchFields = {
  feeling_physically: z.number().int().min(1).max(10),
  feeling_psychologically: z.number().int().min(1).max(10),
  feeling_emotionally: z.number().int().min(1).max(10),
  feeling_energetically: z.number().int().min(1).max(10),
};

// Pura Radiância specific fields
const puraRadianciaFields = {
  meditation_practice: z.string().optional(),
  current_challenges: z.string().optional(),
  immersion_motivation: z.string().min(1, "Por favor, partilhe a sua motivação"),
  main_intention: z.string().min(1, "Por favor, indique a sua intenção principal"),
  wishlist: z.string().optional(),
  aroma_preferences: z.string().optional(),
  music_preferences: z.string().optional(),
  beverage_preference: z.enum([
    "cha_ervas_simples",
    "cha_especiarias",
    "todos",
    "nao_gosto",
    "outra",
  ]).optional(),
  dietary_restrictions: z.string().optional(),
  color_preferences: z.string().optional(),
};

export const healingTouchIntakeSchema = z.object({
  ...commonIntakeFields,
  ...healingTouchFields,
});

export const puraRadianciaIntakeSchema = z.object({
  ...commonIntakeFields,
  ...puraRadianciaFields,
});

// Union type for form submission
export const intakeSchema = z.discriminatedUnion("form_type", [
  z.object({ form_type: z.literal("healing_touch"), ...commonIntakeFields, ...healingTouchFields }),
  z.object({ form_type: z.literal("pura_radiancia"), ...commonIntakeFields, ...puraRadianciaFields }),
]);

export type HealingTouchIntakeInput = z.infer<typeof healingTouchIntakeSchema>;
export type PuraRadianciaIntakeInput = z.infer<typeof puraRadianciaIntakeSchema>;
export type IntakeInput = z.infer<typeof intakeSchema>;

export type ReferralSource = HealingTouchIntakeInput["referral_source"];
export type BeveragePreference = PuraRadianciaIntakeInput["beverage_preference"];
