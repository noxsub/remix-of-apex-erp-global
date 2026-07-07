/* ═══════════════════════════════════════════════════════════════
   CONFERE FISCAL — motor de validação e cruzamento
   Inspirado no conceito do módulo Confere C100/D100 (mercado):
   cruza os documentos autorizados na SEFAZ contra a escrituração
   própria (NF-e de entrada e saída já lançadas no Syntera),
   identificando omissões, divergências e chaves inválidas.

   A validação estrutural da chave de acesso segue o padrão público
   da NF-e/CT-e (Manual de Orientação do Contribuinte — SEFAZ),
   não é lógica proprietária de terceiros.
   ═══════════════════════════════════════════════════════════════ */

export type MotivoChaveInvalida =
  | "Formatação inválida — número de caracteres não suportado"
  | "Formatação inválida — caracteres não numéricos"
  | "Código de UF inválido"
  | "Mês de emissão inválido"
  | "CNPJ do emitente inválido (dígito verificador)"
  | "Modelo de documento não suportado"
  | "Tipo de emissão inválido"
  | "Dígito verificador da chave incorreto";

const UFS_VALIDAS = new Set([
  "11","12","13","14","15","16","17","21","22","23","24","25","26","27","28","29",
  "31","32","33","35","41","42","43","50","51","52","53",
]);
const MODELOS_VALIDOS = new Set(["55", "57", "65", "67", "59"]);

/** Calcula o dígito verificador (módulo 11) dos 43 primeiros dígitos da chave. */
function calcularDvChave(chave43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += Number(chave43[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  const dv = 11 - resto;
  return dv >= 10 ? 0 : dv;
}

/** Valida CNPJ via dígitos verificadores (algoritmo público da Receita Federal). */
function cnpjValido(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj)) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (base: string, pesos: number[]) => {
    const soma = base.split("").reduce((s, d, i) => s + Number(d) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calc(cnpj.slice(0, 12), p1);
  const dv2 = calc(cnpj.slice(0, 12) + dv1, p2);
  return cnpj.slice(12) === `${dv1}${dv2}`;
}

export function validarChaveAcesso(chave: string): { valida: boolean; motivo?: MotivoChaveInvalida } {
  if (!chave || chave.length !== 44) {
    return { valida: false, motivo: "Formatação inválida — número de caracteres não suportado" };
  }
  if (!/^\d{44}$/.test(chave)) {
    return { valida: false, motivo: "Formatação inválida — caracteres não numéricos" };
  }
  const uf = chave.slice(0, 2);
  const mes = chave.slice(4, 6);
  const cnpj = chave.slice(6, 20);
  const modelo = chave.slice(20, 22);
  const tpEmis = chave.slice(34, 35);
  const dvInformado = Number(chave[43]);

  if (!UFS_VALIDAS.has(uf)) return { valida: false, motivo: "Código de UF inválido" };
  if (Number(mes) < 1 || Number(mes) > 12) return { valida: false, motivo: "Mês de emissão inválido" };
  if (!cnpjValido(cnpj)) return { valida: false, motivo: "CNPJ do emitente inválido (dígito verificador)" };
  if (!MODELOS_VALIDOS.has(modelo)) return { valida: false, motivo: "Modelo de documento não suportado" };
  if (Number(tpEmis) < 1 || Number(tpEmis) > 7) return { valida: false, motivo: "Tipo de emissão inválido" };

  const dvCalculado = calcularDvChave(chave.slice(0, 43));
  if (dvCalculado !== dvInformado) return { valida: false, motivo: "Dígito verificador da chave incorreto" };

  return { valida: true };
}

/* ═══════════════════════════════════════════════════════════════
   REGRA DE CFOP DE USO E CONSUMO
   Itens com esses CFOPs não geram crédito de ICMS — por isso são
   excluídos do cálculo de divergência de ICMS creditável (regra
   documentada de mercado, replicada aqui como conhecimento fiscal
   público, não código proprietário de terceiros).
   ═══════════════════════════════════════════════════════════════ */
export const CFOPS_USO_CONSUMO = new Set(["1556", "2556", "3556", "1407", "2407"]);

export function icmsDivergente(cfop: string, icmsEscriturado: number, icmsSefaz: number): boolean {
  if (CFOPS_USO_CONSUMO.has(cfop)) return false; // desconsiderado propositalmente
  return Math.abs(icmsEscriturado - icmsSefaz) > 0.01;
}

/* ═══════════════════════════════════════════════════════════════
   MOTOR DE CRUZAMENTO — Escrituração × SEFAZ
   ═══════════════════════════════════════════════════════════════ */

export type DocConferencia = {
  chave: string;
  numero: string;
  emitenteCnpj: string;
  emitenteRazao: string;
  dataEmissao: string;
  valorTotal: number;
  valorIcms?: number;
  cfop?: string;
};

export type ResultadoConvergente = {
  chave: string;
  numero: string;
  emitenteRazao: string;
  valorEscriturado: number;
  valorSefaz: number;
  divergente: boolean;
  motivoDivergencia?: string;
};

export type ResultadoConferencia = {
  convergentes: ResultadoConvergente[];
  apenasEscrituracao: DocConferencia[];
  apenasSefaz: DocConferencia[];
  chavesInvalidas: { chave: string; numero: string; motivo: MotivoChaveInvalida }[];
};

export function conferirDocumentos(
  escriturados: DocConferencia[],
  sefaz: DocConferencia[],
): ResultadoConferencia {
  const chavesInvalidas: ResultadoConferencia["chavesInvalidas"] = [];

  const validar = (docs: DocConferencia[]) =>
    docs.filter((d) => {
      if (!d.chave) return false;
      const r = validarChaveAcesso(d.chave);
      if (!r.valida) {
        chavesInvalidas.push({ chave: d.chave, numero: d.numero, motivo: r.motivo! });
        return false;
      }
      return true;
    });

  const escrValidos = validar(escriturados);
  const sefazValidos = validar(sefaz);

  const mapaSefaz = new Map(sefazValidos.map((d) => [d.chave, d]));
  const mapaEscr = new Map(escrValidos.map((d) => [d.chave, d]));

  const convergentes: ResultadoConvergente[] = [];
  const apenasEscrituracao: DocConferencia[] = [];
  const apenasSefaz: DocConferencia[] = [];

  for (const doc of escrValidos) {
    const match = mapaSefaz.get(doc.chave);
    if (!match) {
      apenasEscrituracao.push(doc);
      continue;
    }
    const divergenteValor = Math.abs(doc.valorTotal - match.valorTotal) > 0.01;
    const divergenteIcms =
      doc.cfop && doc.valorIcms !== undefined && match.valorIcms !== undefined
        ? icmsDivergente(doc.cfop, doc.valorIcms, match.valorIcms)
        : false;
    convergentes.push({
      chave: doc.chave,
      numero: doc.numero,
      emitenteRazao: doc.emitenteRazao,
      valorEscriturado: doc.valorTotal,
      valorSefaz: match.valorTotal,
      divergente: divergenteValor || divergenteIcms,
      motivoDivergencia: divergenteValor
        ? "Valor total divergente"
        : divergenteIcms
          ? "ICMS creditável divergente"
          : undefined,
    });
  }

  for (const doc of sefazValidos) {
    if (!mapaEscr.has(doc.chave)) apenasSefaz.push(doc);
  }

  return { convergentes, apenasEscrituracao, apenasSefaz, chavesInvalidas };
}
