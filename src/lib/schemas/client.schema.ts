import { z } from "zod";

export const createClientSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório"),
  last_name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  gender: z.enum(["female", "male"]).optional(),
  preferred_language: z.enum(["pt", "en"]).default("pt"),
  preferred_channel: z.enum(["email", "sms", "whatsapp"]).default("email"),
  date_of_birth: z.string().optional(),
  height_cm: z.number().positive().optional(),
  weight_kg: z.number().positive().optional(),
  profession: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("PT"),
  source: z.enum(["manual", "website", "referral"]).default("manual"),
  consent_data_processing: z.boolean().default(false),
  consent_health_data: z.boolean().default(false),
  service_consent_email: z.boolean().default(false),
  service_consent_sms: z.boolean().default(false),
  service_consent_whatsapp: z.boolean().default(false),
  consent_marketing: z.boolean().default(false),
  marketing_consent_email: z.boolean().default(false),
  marketing_consent_sms: z.boolean().default(false),
  marketing_consent_whatsapp: z.boolean().default(false),
  notes: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial();

export type UpdateClientInput = z.infer<typeof updateClientSchema>;
