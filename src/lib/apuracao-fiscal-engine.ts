/* ═══════════════════════════════════════════════════════════════
   MOTOR DE APURAÇÃO FISCAL
   Calculadora real — não é catálogo, é apuração de verdade a
   partir dos parâmetros informados. Cobre os 3 regimes (Simples
   Nacional, Lucro Presumido, Lucro Real) para os 4 segmentos
   pedidos (Comércio/Varejo, Indústria, Serviços — Lei 116/2003,
   E-commerce), incluindo CBS/IBS na fase de teste da Reforma.

   IMPORTANTE — limite de escopo, dito com honestidade:
   Isto é uma apuração GERENCIAL/SIMPLIFICADA, com as tabelas e
   fórmulas oficiais públicas (Simples Nacional LC 123/2006, IRPJ/
   CSLL/PIS/COFINS regulamentação vigente, Lei Complementar 116/2003
   para ISS). NÃO substitui o SPED/EFD homologado nem a apuração
   de um contador — serve para o gestor ter uma visão de carga
   tributária real e comparar regimes/cenários dentro do ERP.
   ═══════════════════════════════════════════════════════════════ */

export type RegimeApuracaoFiscal = "Simples Nacional" | "Lucro Presumido" | "Lucro Real" | "MEI";
export type SegmentoNegocio = "comercio_varejo" | "industria" | "servicos" | "ecommerce";

export const SEGMENTO_LABEL: Record<SegmentoNegocio, string> = {
  comercio_varejo: "Comércio / Varejo",
  industria: "Indústria",
  servicos: "Serviços (Lei 116/2003)",
  ecommerce: "E-commerce",
};

export interface ApuracaoInput {
  regime: RegimeApuracaoFiscal;
  segmento: SegmentoNegocio;
  competencia: string; // mm/aaaa
  receitaBruta: number; // do mês
  rbt12: number; // receita bruta últimos 12 meses (Simples Nacional)
  folhaPagamento: number; // total de folha do mês (base FGTS/INSS e Fator R)
  comprasComCredito: number; // compras que geram crédito de PIS/COFINS/ICMS (Lucro Real)
  aliquotaIcmsIssMedia: number; // % — alíquota efetiva média de ICMS (bens) ou ISS (serviços), informada pelo usuário
  lucroContabilAjustado?: number; // só Lucro Real — se vazio, assume margem presumida como proxy
}

export interface LinhaTributo {
  codigo: string;
  nome: string;
  base: number;
  aliquota: number; // %
  valor: number;
  observacao?: string;
}

export interface ApuracaoResultado {
  input: ApuracaoInput;
  linhas: LinhaTributo[];
  totalTributos: number;
  cargaTributariaPct: number; // total / receitaBruta
  detalhesSimples?: { anexo: string; faixa: number; aliqNominal: number; parcelaDeduzir: number; aliqEfetiva: number; fatorR?: number };
}

/* ═══════════════════════════════════════════════════════════════
   TABELAS OFICIAIS — SIMPLES NACIONAL (LC 123/2006, valores vigentes)
   ═══════════════════════════════════════════════════════════════ */

type FaixaSimples = { ateRbt12: number; aliquota: number; parcelaDeduzir: number };

/** Anexo I — Comércio */
const ANEXO_I: FaixaSimples[] = [
  { ateRbt12: 180000, aliquota: 4.0, parcelaDeduzir: 0 },
  { ateRbt12: 360000, aliquota: 7.3, parcelaDeduzir: 5940 },
  { ateRbt12: 720000, aliquota: 9.5, parcelaDeduzir: 13860 },
  { ateRbt12: 1800000, aliquota: 10.7, parcelaDeduzir: 22500 },
  { ateRbt12: 3600000, aliquota: 14.3, parcelaDeduzir: 87300 },
  { ateRbt12: 4800000, aliquota: 19.0, parcelaDeduzir: 378000 },
];

/** Anexo II — Indústria */
const ANEXO_II: FaixaSimples[] = [
  { ateRbt12: 180000, aliquota: 4.5, parcelaDeduzir: 0 },
  { ateRbt12: 360000, aliquota: 7.8, parcelaDeduzir: 5940 },
  { ateRbt12: 720000, aliquota: 10.0, parcelaDeduzir: 13860 },
  { ateRbt12: 1800000, aliquota: 11.2, parcelaDeduzir: 22500 },
  { ateRbt12: 3600000, aliquota: 14.7, parcelaDeduzir: 85500 },
  { ateRbt12: 4800000, aliquota: 30.0, parcelaDeduzir: 720000 },
];

/** Anexo III — Serviços (locação, tecnologia, etc. — Fator R ≥ 28%) */
const ANEXO_III: FaixaSimples[] = [
  { ateRbt12: 180000, aliquota: 6.0, parcelaDeduzir: 0 },
  { ateRbt12: 360000, aliquota: 11.2, parcelaDeduzir: 9360 },
  { ateRbt12: 720000, aliquota: 13.5, parcelaDeduzir: 17640 },
  { ateRbt12: 1800000, aliquota: 16.0, parcelaDeduzir: 35640 },
  { ateRbt12: 3600000, aliquota: 21.0, parcelaDeduzir: 125640 },
  { ateRbt12: 4800000, aliquota: 33.0, parcelaDeduzir: 648000 },
];

/** Anexo V — Serviços intelectuais (Fator R < 28%) */
const ANEXO_V: FaixaSimples[] = [
  { ateRbt12: 180000, aliquota: 15.5, parcelaDeduzir: 0 },
  { ateRbt12: 360000, aliquota: 18.0, parcelaDeduzir: 4500 },
  { ateRbt12: 720000, aliquota: 19.5, parcelaDeduzir: 9900 },
  { ateRbt12: 1800000, aliquota: 20.5, parcelaDeduzir: 17100 },
  { ateRbt12: 3600000, aliquota: 23.0, parcelaDeduzir: 62100 },
  { ateRbt12: 4800000, aliquota: 30.5, parcelaDeduzir: 540000 },
];

function faixaDoSimples(rbt12: number, tabela: FaixaSimples[]): FaixaSimples {
  return tabela.find((f) => rbt12 <= f.ateRbt12) ?? tabela[tabela.length - 1];
}

function calcularDAS(input: ApuracaoInput): { linhas: LinhaTributo[]; detalhes: ApuracaoResultado["detalhesSimples"] } {
  const fatorR = input.segmento === "servicos" && input.folhaPagamento > 0 ? (input.folhaPagamento / input.receitaBruta) * 100 : undefined;

  let tabela: FaixaSimples[];
  let anexo: string;
  if (input.segmento === "comercio_varejo" || input.segmento === "ecommerce") {
    tabela = ANEXO_I;
    anexo = "Anexo I (Comércio)";
  } else if (input.segmento === "industria") {
    tabela = ANEXO_II;
    anexo = "Anexo II (Indústria)";
  } else {
    // serviços — Fator R decide entre Anexo III e V
    if (fatorR !== undefined && fatorR >= 28) {
      tabela = ANEXO_III;
      anexo = "Anexo III (Serviços — Fator R ≥ 28%)";
    } else {
      tabela = ANEXO_V;
      anexo = "Anexo V (Serviços — Fator R < 28%)";
    }
  }

  const faixa = faixaDoSimples(input.rbt12, tabela);
  const faixaIdx = tabela.indexOf(faixa) + 1;
  const aliqEfetiva = input.rbt12 > 0 ? ((input.rbt12 * (faixa.aliquota / 100) - faixa.parcelaDeduzir) / input.rbt12) * 100 : faixa.aliquota;
  const valorDas = input.receitaBruta * (aliqEfetiva / 100);

  return {
    linhas: [
      {
        codigo: "DAS",
        nome: `DAS — ${anexo}`,
        base: input.receitaBruta,
        aliquota: Math.round(aliqEfetiva * 100) / 100,
        valor: Math.round(valorDas * 100) / 100,
        observacao: "Guia única — já inclui IRPJ, CSLL, PIS, COFINS, ICMS/ISS e, salvo Anexo IV, a CPP patronal.",
      },
    ],
    detalhes: {
      anexo,
      faixa: faixaIdx,
      aliqNominal: faixa.aliquota,
      parcelaDeduzir: faixa.parcelaDeduzir,
      aliqEfetiva: Math.round(aliqEfetiva * 100) / 100,
      fatorR: fatorR !== undefined ? Math.round(fatorR * 100) / 100 : undefined,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════
   LUCRO PRESUMIDO
   ═══════════════════════════════════════════════════════════════ */

const MARGEM_PRESUMIDA_IRPJ: Record<SegmentoNegocio, number> = {
  comercio_varejo: 8,
  ecommerce: 8,
  industria: 8,
  servicos: 32,
};
const MARGEM_PRESUMIDA_CSLL: Record<SegmentoNegocio, number> = {
  comercio_varejo: 12,
  ecommerce: 12,
  industria: 12,
  servicos: 32,
};
const ADICIONAL_IRPJ_LIMITE_MENSAL = 20000;

function calcularPresumido(input: ApuracaoInput): LinhaTributo[] {
  const baseIrpj = input.receitaBruta * (MARGEM_PRESUMIDA_IRPJ[input.segmento] / 100);
  const baseCsll = input.receitaBruta * (MARGEM_PRESUMIDA_CSLL[input.segmento] / 100);
  const irpjNormal = baseIrpj * 0.15;
  const excedente = Math.max(0, baseIrpj - ADICIONAL_IRPJ_LIMITE_MENSAL);
  const irpjAdicional = excedente * 0.10;
  const csll = baseCsll * 0.09;
  const pis = input.receitaBruta * 0.0065;
  const cofins = input.receitaBruta * 0.03;
  const icmsIss = input.receitaBruta * (input.aliquotaIcmsIssMedia / 100);

  const linhas: LinhaTributo[] = [
    { codigo: "IRPJ", nome: "IRPJ (15% sobre base presumida)", base: baseIrpj, aliquota: 15, valor: round2(irpjNormal) },
    { codigo: "CSLL", nome: "CSLL (9% sobre base presumida)", base: baseCsll, aliquota: 9, valor: round2(csll) },
    { codigo: "PIS", nome: "PIS (cumulativo)", base: input.receitaBruta, aliquota: 0.65, valor: round2(pis) },
    { codigo: "COFINS", nome: "COFINS (cumulativo)", base: input.receitaBruta, aliquota: 3, valor: round2(cofins) },
    {
      codigo: input.segmento === "servicos" ? "ISS" : "ICMS",
      nome: input.segmento === "servicos" ? "ISS (Lei Complementar 116/2003)" : "ICMS",
      base: input.receitaBruta,
      aliquota: input.aliquotaIcmsIssMedia,
      valor: round2(icmsIss),
    },
  ];
  if (irpjAdicional > 0) {
    linhas.push({
      codigo: "IRPJ-ADIC",
      nome: "IRPJ Adicional (10% sobre o excedente de R$ 20.000/mês)",
      base: excedente,
      aliquota: 10,
      valor: round2(irpjAdicional),
    });
  }
  return linhas;
}

/* ═══════════════════════════════════════════════════════════════
   LUCRO REAL
   ═══════════════════════════════════════════════════════════════ */

function calcularReal(input: ApuracaoInput): LinhaTributo[] {
  // Sem lucro contábil informado, usa a margem presumida como proxy — deixado explícito na observação.
  const usaProxy = !input.lucroContabilAjustado;
  const lucroBase = input.lucroContabilAjustado ?? input.receitaBruta * (MARGEM_PRESUMIDA_IRPJ[input.segmento] / 100);

  const irpjNormal = lucroBase * 0.15;
  const excedente = Math.max(0, lucroBase - ADICIONAL_IRPJ_LIMITE_MENSAL);
  const irpjAdicional = excedente * 0.10;
  const csll = lucroBase * 0.09;

  const pisDebito = input.receitaBruta * 0.0165;
  const cofinsDebito = input.receitaBruta * 0.076;
  const pisCredito = input.comprasComCredito * 0.0165;
  const cofinsCredito = input.comprasComCredito * 0.076;
  const pis = Math.max(0, pisDebito - pisCredito);
  const cofins = Math.max(0, cofinsDebito - cofinsCredito);

  const icmsIss = input.receitaBruta * (input.aliquotaIcmsIssMedia / 100);

  const linhas: LinhaTributo[] = [
    {
      codigo: "IRPJ",
      nome: "IRPJ (15% sobre lucro real)",
      base: lucroBase,
      aliquota: 15,
      valor: round2(irpjNormal),
      observacao: usaProxy ? "Lucro contábil não informado — usando margem presumida como referência." : undefined,
    },
    { codigo: "CSLL", nome: "CSLL (9% sobre lucro real)", base: lucroBase, aliquota: 9, valor: round2(csll) },
    { codigo: "PIS", nome: "PIS (não-cumulativo, líquido de créditos)", base: input.receitaBruta - input.comprasComCredito, aliquota: 1.65, valor: round2(pis) },
    { codigo: "COFINS", nome: "COFINS (não-cumulativo, líquido de créditos)", base: input.receitaBruta - input.comprasComCredito, aliquota: 7.6, valor: round2(cofins) },
    {
      codigo: input.segmento === "servicos" ? "ISS" : "ICMS",
      nome: input.segmento === "servicos" ? "ISS (Lei Complementar 116/2003)" : "ICMS",
      base: input.receitaBruta,
      aliquota: input.aliquotaIcmsIssMedia,
      valor: round2(icmsIss),
    },
  ];
  if (irpjAdicional > 0) {
    linhas.push({
      codigo: "IRPJ-ADIC",
      nome: "IRPJ Adicional (10% sobre o excedente de R$ 20.000/mês)",
      base: excedente,
      aliquota: 10,
      valor: round2(irpjAdicional),
    });
  }
  return linhas;
}

/* ═══════════════════════════════════════════════════════════════
   CBS / IBS — REFORMA TRIBUTÁRIA (fase de teste 2026)
   Alíquotas de teste conforme já usadas no restante do Syntera
   (ver reforma-tributaria-store.ts): CBS 0,9% / IBS 0,1% em 2026.
   ═══════════════════════════════════════════════════════════════ */
function calcularCbsIbs(input: ApuracaoInput): LinhaTributo[] {
  const baseCbsIbs = Math.max(0, input.receitaBruta - input.comprasComCredito);
  const cbs = baseCbsIbs * 0.009;
  const ibs = baseCbsIbs * 0.001;
  return [
    { codigo: "CBS", nome: "CBS (fase de teste 2026 — 0,9%)", base: round2(baseCbsIbs), aliquota: 0.9, valor: round2(cbs) },
    { codigo: "IBS", nome: "IBS (fase de teste 2026 — 0,1%)", base: round2(baseCbsIbs), aliquota: 0.1, valor: round2(ibs) },
  ];
}

/* ═══════════════════════════════════════════════════════════════
   ENCARGOS SOBRE FOLHA (fora do DAS, exceto Simples que já inclui CPP)
   ═══════════════════════════════════════════════════════════════ */
function calcularEncargosFolha(input: ApuracaoInput): LinhaTributo[] {
  if (input.folhaPagamento <= 0) return [];
  const fgts = input.folhaPagamento * 0.08;
  const linhas: LinhaTributo[] = [
    { codigo: "FGTS", nome: "FGTS (8% sobre a folha)", base: input.folhaPagamento, aliquota: 8, valor: round2(fgts) },
  ];
  if (input.regime !== "Simples Nacional" && input.regime !== "MEI") {
    const cpp = input.folhaPagamento * 0.20;
    linhas.push({ codigo: "INSS-CPP", nome: "INSS Patronal / CPP (20% sobre a folha)", base: input.folhaPagamento, aliquota: 20, valor: round2(cpp) });
  } else {
    linhas.push({ codigo: "INSS-CPP", nome: "INSS Patronal / CPP", base: input.folhaPagamento, aliquota: 0, valor: 0, observacao: "Já incluído no DAS (exceto Anexo IV)." });
  }
  return linhas;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ═══════════════════════════════════════════════════════════════
   FUNÇÃO PRINCIPAL — apuração completa
   ═══════════════════════════════════════════════════════════════ */
export function apurarTributos(input: ApuracaoInput): ApuracaoResultado {
  let linhas: LinhaTributo[] = [];
  let detalhesSimples: ApuracaoResultado["detalhesSimples"];

  if (input.regime === "Simples Nacional" || input.regime === "MEI") {
    if (input.regime === "MEI") {
      linhas = [{ codigo: "DAS-MEI", nome: "DAS-MEI (valor fixo mensal)", base: input.receitaBruta, aliquota: 0, valor: 71.6, observacao: "INSS + ICMS/ISS fixos — não proporcional à receita." }];
    } else {
      const { linhas: l, detalhes } = calcularDAS(input);
      linhas = l;
      detalhesSimples = detalhes;
    }
  } else if (input.regime === "Lucro Presumido") {
    linhas = calcularPresumido(input);
  } else {
    linhas = calcularReal(input);
  }

  // CBS/IBS e encargos de folha se aplicam a todos os regimes (Reforma é sobre-regime; folha é sempre devida)
  linhas = [...linhas, ...calcularCbsIbs(input), ...calcularEncargosFolha(input)];

  const totalTributos = round2(linhas.reduce((s, l) => s + l.valor, 0));
  const cargaTributariaPct = input.receitaBruta > 0 ? round2((totalTributos / input.receitaBruta) * 100) : 0;

  return { input, linhas, totalTributos, cargaTributariaPct, detalhesSimples };
}
