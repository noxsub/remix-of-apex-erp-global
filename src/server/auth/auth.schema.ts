import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um endereço de e-mail válido.")
    .max(160, "O e-mail deve possuir no máximo 160 caracteres."),

  senha: z
    .string()
    .min(1, "Informe sua senha.")
    .max(128, "A senha deve possuir no máximo 128 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;