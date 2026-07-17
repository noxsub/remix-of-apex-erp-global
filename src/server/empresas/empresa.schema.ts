import { z } from "zod";

/**
 * Remove a pontuação e padroniza o documento em letras maiúsculas.
 *
 * Exemplos:
 * "12.345.678/0001-90" -> "12345678000190"
 * "YC.ZH2.STC/0001-15" -> "YCZH2STC000115"
 */
function normalizarCnpj(valor: string): string {
  return valor
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Converte cada caractere conforme a regra do CNPJ alfanumérico:
 * valor do caractere = código ASCII - 48.
 *
 * Números continuam valendo de 0 a 9.
 * Letras de A a Z passam a valer de 17 a 42.
 */
function valorDoCaractere(caractere: string): number {
  return caractere.charCodeAt(0) - 48;
}

function calcularDigito(base: string, pesos: number[]): number {
  const soma = base
    .split("")
    .reduce((total, caractere, indice) => {
      return total + valorDoCaractere(caractere) * pesos[indice];
    }, 0);

  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

/**
 * Aceita:
 * - CNPJ numérico tradicional;
 * - CNPJ alfanumérico com letras ou números nas 12 primeiras posições;
 * - dois dígitos verificadores finais obrigatoriamente numéricos.
 */
function cnpjValido(valor: string): boolean {
  const cnpj = normalizarCnpj(valor);

  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const primeiroDigito = calcularDigito(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  if (primeiroDigito !== Number(cnpj[12])) {
    return false;
  }

  const segundoDigito = calcularDigito(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return segundoDigito === Number(cnpj[13]);
}

function somenteNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

export const criarEmpresaSchema = z.object({
  razaoSocial: z
    .string()
    .trim()
    .min(3, "A razão social deve possuir pelo menos 3 caracteres.")
    .max(150, "A razão social deve possuir no máximo 150 caracteres."),

  nomeFantasia: z
    .string()
    .trim()
    .max(150, "O nome fantasia deve possuir no máximo 150 caracteres.")
    .optional()
    .transform((valor) => valor || undefined),

  cnpj: z
    .string()
    .trim()
    .transform(normalizarCnpj)
    .refine(cnpjValido, "Informe um CNPJ válido."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um endereço de e-mail válido.")
    .optional()
    .or(z.literal(""))
    .transform((valor) => valor || undefined),

  telefone: z
    .string()
    .trim()
    .transform(somenteNumeros)
    .refine(
      (valor) => valor.length === 0 || valor.length === 10 || valor.length === 11,
      "O telefone deve conter 10 ou 11 números.",
    )
    .optional()
    .transform((valor) => valor || undefined),
});

export const atualizarEmpresaSchema = criarEmpresaSchema
  .partial()
  .extend({
    id: z.string().trim().min(1, "O identificador da empresa é obrigatório."),
  });

export const empresaIdSchema = z.object({
  id: z.string().trim().min(1, "O identificador da empresa é obrigatório."),
});

export type CriarEmpresaInput = z.infer<typeof criarEmpresaSchema>;
export type AtualizarEmpresaInput = z.infer<
  typeof atualizarEmpresaSchema
>;
export type EmpresaIdInput = z.infer<typeof empresaIdSchema>;