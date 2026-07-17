import { z } from "zod";

export const statusContaReceberSchema = z.enum([
  "PENDENTE",
  "PARCIAL",
  "RECEBIDO",
  "VENCIDO",
  "CANCELADO",
]);

export const criarContaReceberSchema = z
  .object({
    empresaId: z.string().min(1, "A empresa é obrigatória."),

    clienteId: z.string().min(1, "O cliente é obrigatório."),

    numeroDocumento: z
      .string()
      .trim()
      .min(1, "O número do documento é obrigatório.")
      .max(100, "O número do documento deve ter até 100 caracteres."),

    descricao: z
      .string()
      .trim()
      .max(255, "A descrição deve ter até 255 caracteres.")
      .optional()
      .nullable(),

    dataEmissao: z.coerce.date({
      errorMap: () => ({
        message: "Informe uma data de emissão válida.",
      }),
    }),

    dataVencimento: z.coerce.date({
      errorMap: () => ({
        message: "Informe uma data de vencimento válida.",
      }),
    }),

    valorOriginal: z.coerce
      .number()
      .positive("O valor original deve ser maior que zero."),

    observacao: z
      .string()
      .trim()
      .max(1000, "A observação deve ter até 1.000 caracteres.")
      .optional()
      .nullable(),
  })
  .refine(
    (dados) => dados.dataVencimento >= dados.dataEmissao,
    {
      message:
        "A data de vencimento não pode ser anterior à data de emissão.",
      path: ["dataVencimento"],
    },
  );

export const listarContasReceberSchema = z.object({
  empresaId: z.string().min(1, "A empresa é obrigatória."),

  clienteId: z.string().optional(),

  status: statusContaReceberSchema.optional(),

  dataVencimentoInicial: z.coerce.date().optional(),

  dataVencimentoFinal: z.coerce.date().optional(),

  busca: z.string().trim().optional(),
});

export type CriarContaReceberInput = z.infer<
  typeof criarContaReceberSchema
>;

export type ListarContasReceberInput = z.infer<
  typeof listarContasReceberSchema
>;