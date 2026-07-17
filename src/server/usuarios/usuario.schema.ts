import { z } from "zod";

export const criarAdministradorSchema = z
  .object({
    empresaId: z
      .string()
      .trim()
      .min(1, "A empresa vinculada é obrigatória."),

    nome: z
      .string()
      .trim()
      .min(3, "O nome deve possuir pelo menos 3 caracteres.")
      .max(120, "O nome deve possuir no máximo 120 caracteres."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Informe um endereço de e-mail válido.")
      .max(160, "O e-mail deve possuir no máximo 160 caracteres."),

    senha: z
      .string()
      .min(8, "A senha deve possuir pelo menos 8 caracteres.")
      .max(128, "A senha deve possuir no máximo 128 caracteres."),

    confirmarSenha: z.string(),
  })
  .superRefine((dados, contexto) => {
    if (dados.senha !== dados.confirmarSenha) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmarSenha"],
        message: "As senhas informadas não são iguais.",
      });
    }
  })
  .transform(({ confirmarSenha: _confirmarSenha, ...dados }) => dados);

export type CriarAdministradorInput = z.infer<
  typeof criarAdministradorSchema
>;