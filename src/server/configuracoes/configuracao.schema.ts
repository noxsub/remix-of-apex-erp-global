import { z } from "zod";

export const salvarConfiguracaoEmpresaSchema = z.object({
  empresaId: z
    .string()
    .trim()
    .min(1, "A empresa vinculada é obrigatória."),

  moeda: z.enum(["BRL"], {
    message: "Selecione uma moeda válida.",
  }),

  idioma: z.enum(["pt-BR"], {
    message: "Selecione um idioma válido.",
  }),

  fusoHorario: z.enum(
    [
      "America/Sao_Paulo",
      "America/Manaus",
      "America/Rio_Branco",
      "America/Noronha",
    ],
    {
      message: "Selecione um fuso horário válido.",
    },
  ),

  regimeTributario: z.enum(
    [
      "SIMPLES_NACIONAL",
      "LUCRO_PRESUMIDO",
      "LUCRO_REAL",
      "MEI",
    ],
    {
      message: "Selecione um regime tributário válido.",
    },
  ),
});

export type SalvarConfiguracaoEmpresaInput = z.infer<
  typeof salvarConfiguracaoEmpresaSchema
>;