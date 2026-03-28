import { z } from "zod";

export const satisfactionSchema = z.object({
  nps_score: z
    .number()
    .int()
    .min(0, "Por favor, selecione uma pontuação")
    .max(10, "Por favor, selecione uma pontuação"),
  comfort_rating: z
    .number()
    .int()
    .min(1, "Por favor, avalie o seu conforto")
    .max(5),
  liked_most: z.string().optional(),
  improvement_suggestions: z.string().optional(),
  would_rebook: z.enum(["sim", "nao", "talvez"]),
});

export type SatisfactionInput = z.infer<typeof satisfactionSchema>;
export type WouldRebook = SatisfactionInput["would_rebook"];
