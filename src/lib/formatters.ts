/**
 * Formata CNPJ numérico ou alfanumérico.
 *
 * Exemplos:
 * 12345678000195 -> 12.345.678/0001-95
 * YCZH2STC000115 -> YC.ZH2.STC/0001-15
 */
export function formatarCnpj(valor: string): string {
  const documento = valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14);

  if (documento.length <= 2) {
    return documento;
  }

  if (documento.length <= 5) {
    return `${documento.slice(0, 2)}.${documento.slice(2)}`;
  }

  if (documento.length <= 8) {
    return `${documento.slice(0, 2)}.${documento.slice(
      2,
      5,
    )}.${documento.slice(5)}`;
  }

  if (documento.length <= 12) {
    return `${documento.slice(0, 2)}.${documento.slice(
      2,
      5,
    )}.${documento.slice(5, 8)}/${documento.slice(8)}`;
  }

  return `${documento.slice(0, 2)}.${documento.slice(
    2,
    5,
  )}.${documento.slice(5, 8)}/${documento.slice(
    8,
    12,
  )}-${documento.slice(12, 14)}`;
}

/**
 * Formata telefone brasileiro.
 *
 * Fixo:
 * 1133334444 -> (11) 3333-4444
 *
 * Celular:
 * 11999998888 -> (11) 99999-8888
 */
export function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length === 0) {
    return "";
  }

  if (numeros.length <= 2) {
    return `(${numeros}`;
  }

  const ddd = numeros.slice(0, 2);
  const telefone = numeros.slice(2);

  if (telefone.length === 0) {
    return `(${ddd})`;
  }

  if (numeros.length <= 6) {
    return `(${ddd}) ${telefone}`;
  }

  if (numeros.length <= 10) {
    return `(${ddd}) ${telefone.slice(0, 4)}-${telefone.slice(
      4,
    )}`;
  }

  return `(${ddd}) ${telefone.slice(0, 5)}-${telefone.slice(5)}`;
}