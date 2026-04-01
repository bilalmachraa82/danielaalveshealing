import { z } from "zod";

export const createSessionSchema = z.object({
  client_id: z.string().uuid("Cliente é obrigatório"),
  scheduled_at: z.string().min(1, "Data e hora são obrigatórias"),
  duration_minutes: z.number().int().positive().default(120),
  service_type: z.enum([
    "healing_wellness",
    "pura_radiancia",
    "pure_earth_love",
    "home_harmony",
    "other",
  ]),
  price_cents: z.number().int().nonnegative().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  scheduled_at: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  service_type: z
    .enum([
      "healing_wellness",
      "pura_radiancia",
      "pure_earth_love",
      "home_harmony",
      "other",
    ])
    .optional(),
  status: z
    .enum([
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .optional(),
  price_cents: z.number().int().nonnegative().optional(),
  payment_status: z.enum(["pending", "paid", "refunded"]).optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  cancellation_reason: z.string().optional(),
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export const sessionNoteSchema = z.object({
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  body_map_data: z
    .array(
      z.object({
        muscle: z.string(),
        side: z.enum(["left", "right"]).optional(),
        intensity: z.number().int().min(1).max(5),
        notes: z.string().optional(),
      })
    )
    .default([]),
});

export type SessionNoteInput = z.infer<typeof sessionNoteSchema>;
