import { create } from "zustand";

/**
 * ══════════════════════════════════════════════════════════════════════════
 * ENGENHARIA DE IMPACTOS — Motor Central do Sintera ERP
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Este é o CORAÇÃO do ERP. Toda regra de cálculo vive aqui.
 * Nenhum módulo calcula nada sozinho — todos consultam este motor.
 *
 * QUEM CONSULTA:
 *  → Saídas: ao emitir NF, puxa alíquotas, CFOP, CST, retenções
 *  → Entradas: ao dar entrada, calcula créditos, retenções, gera título
 *  → RH: ao calcular folha, usa tabelas INSS/IRRF/FGTS
 *  → Financeiro: recebe títulos automáticos, alimenta fluxo de caixa
 *  → Obrigações: sabe quais guias gerar e com qual valor
 *
 * PRINCÍPIO: Configure uma vez aqui → impacta tudo automaticamente
 * ══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 1: REGRAS FISCAIS (Impostos sobre operações)
// ═══════════════════════════════════════════════════════════════════════════

export interface RegraICMS {
  ufOrigem: string;
  ufDestino: string;
  aliquotaInterna: number;
  aliquotaInterestadual: number;
  difal: number;           // Diferencial de alíquota
  reducaoBase: number;     // % de redução da base de cálculo
  mva: number;             // MVA para ICMS-ST
  cst: string;             // Código de Situação Tributária
}

export interface RegraPISCOFINS {
  regime: "cumulativo" | "nao_cumulativo";
  // Cumulativo (Lucro Presumido)
  aliquotaPISCumulativo: number;       // 0.65%
  aliquotaCOFINSCumulativo: number;    // 3.00%
  // Não-cumulativo (Lucro Real)
  aliquotaPISNaoCumulativo: number;    // 1.65%
  aliquotaCOFINSNaoCumulativo: number; // 7.60%
  // Créditos permitidos (Lucro Real)
  creditoPermitido: boolean;
  baseCredito: "total" | "proporcional";
}

export interface RegraISS {
  codigoServico: string;       // LC 116
  descricao: string;
  aliquota: number;            // 2% a 5%
  municipio: string;
  retidoNaFonte: boolean;
  localIncidencia: "prestador" | "tomador";
}

export interface RegraIPI {
  ncm: string;
  descricao: string;
  aliquota: number;
  cstEntrada: string;
  cstSaida: string;
  creditoPermitido: boolean;
}

export interface RegraRetencao {
  tipo: "inss" | "irrf" | "csll" | "cofins" | "pis" | "iss";
  descricao: string;
  aliquota: number;
  baseCalculo: "total" | "percentual";
  percentualBase: number;       // Ex: INSS 11% sobre 35% para construção civil
  valorMinimo: number;          // Valor mínimo para retenção
  codigoReceita: string;        // Código DARF
  vencimentoDia: number;        // Dia do mês de vencimento
  tipoTituloFinanceiro: string; // Tipo de título gerado no financeiro
}

export interface RegraIRPJCSLL {
  regime: "presumido" | "real" | "simples";
  // Presumido
  presuncaoIRPJProduto: number;   // 8%
  presuncaoIRPJServico: number;   // 32%
  presuncaoCSLLProduto: number;   // 12%
  presuncaoCSLLServico: number;   // 32%
  // Alíquotas
  aliquotaIRPJ: number;          // 15%
  adicionalIRPJ: number;         // 10% sobre excedente R$ 20.000/mês
  limiteAdicionalMensal: number;  // R$ 20.000
  aliquotaCSLL: number;          // 9%
  // Real
  deducoes: string[];
  compensacaoPrejuizo: number;    // Limite 30%
}

export interface RegraReformaTributaria {
  anoVigencia: number;
  aliquotaCBS: number;           // Federal
  aliquotaIBS: number;           // Estadual + Municipal
  aliquotaTotal: number;
  creditoIntegral: boolean;
  splitPayment: boolean;
  cashback: boolean;
  regimeTransicao: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 2: REGRAS TRABALHISTAS (Folha de pagamento)
// ═══════════════════════════════════════════════════════════════════════════

export interface FaixaINSS {
  de: number;
  ate: number;
  aliquota: number;
}

export interface FaixaIRRF {
  de: number;
  ate: number;
  aliquota: number;
  deducao: number;
}

export interface RegrasTrabalhistas {
  // Tabela INSS empregado (progressiva)
  tabelaINSS: FaixaINSS[];
  tetoINSS: number;

  // Tabela IRRF (progressiva)
  tabelaIRRF: FaixaIRRF[];
  deducaoDependente: number;

  // INSS patronal
  inssPatronal: number;         // 20%
  rat: number;                  // 1% a 3% (risco ambiental)
  fap: number;                  // Fator Acidentário de Prevenção
  terceiros: number;            // SENAI, SESI, SEBRAE etc. (~5.8%)
  totalPatronal: number;        // Soma

  // FGTS
  fgts: number;                 // 8%
  fgtsRescisao: number;         // 40% multa

  // Benefícios obrigatórios
  valeTransporteDesconto: number; // 6% do salário
  salarioFamilia: FaixaSalarioFamilia[];

  // Férias
  adicionalFerias: number;        // 1/3 constitucional
  maximoDiasFracionamento: number; // 3 períodos (mín 14 + 5 + 5)

  // 13º Salário
  decimoTerceiroMeses: number;    // 12 avos

  // Horas extras
  horaExtra50: number;            // 50%
  horaExtra100: number;           // 100% (domingos/feriados)
  adicionalNoturno: number;       // 20%

  // Insalubridade/Periculosidade
  insalubridadeMinimo: number;    // 10%
  insalubridadeMedio: number;     // 20%
  insalubridadeMaximo: number;    // 40%
  periculosidade: number;         // 30%

  // Rescisão
  avisoPrevio: number;            // 30 dias + 3 por ano
  multaFGTS: number;              // 40%
  multaArt479: number;            // 50% dos dias restantes
}

export interface FaixaSalarioFamilia {
  ate: number;
  valor: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 3: REGRAS FINANCEIRAS (Títulos, fluxo de caixa)
// ═══════════════════════════════════════════════════════════════════════════

export interface RegrasFinanceiras {
  // Juros e multa padrão
  jurosMoraDia: number;           // % ao dia
  multaAtraso: number;            // % fixo

  // Regras de geração de títulos
  gerarTituloNaEmissaoNF: boolean;
  gerarTituloNaEntradaNF: boolean;
  gerarTituloRetencao: boolean;
  gerarTituloFolha: boolean;
  gerarTituloEncargos: boolean;

  // Fluxo de caixa
  alimentarFluxoAutomatico: boolean;
  projecaoDias: number;

  // Retenções → Títulos fixos
  retencoesMensais: RegraRetencaoFinanceira[];

  // Conciliação
  toleranciaConciliacao: number;  // R$ de tolerância
}

export interface RegraRetencaoFinanceira {
  tipo: string;
  descricao: string;
  vencimentoDia: number;
  codigoDARF: string;
  contaContabil: string;
  acumulaNotas: boolean;          // Acumula saldo de várias notas no mês
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 4: TABELA ICMS INTERESTADUAL
// ═══════════════════════════════════════════════════════════════════════════

const ICMS_INTERESTADUAL: Record<string, number> = {
  // Sul e Sudeste (exceto ES) → 12%
  "SP-RJ": 12, "SP-MG": 12, "SP-PR": 12, "SP-SC": 12, "SP-RS": 12,
  "RJ-SP": 12, "RJ-MG": 12, "MG-SP": 12, "MG-RJ": 12,
  // Sul/Sudeste → Norte/Nordeste/CO/ES → 7%
  "SP-BA": 7, "SP-CE": 7, "SP-PE": 7, "SP-GO": 7, "SP-MT": 7,
  "SP-MS": 7, "SP-PA": 7, "SP-AM": 7, "SP-MA": 7, "SP-PI": 7,
  "SP-RN": 7, "SP-PB": 7, "SP-SE": 7, "SP-AL": 7, "SP-ES": 7,
  "SP-TO": 7, "SP-RO": 7, "SP-AC": 7, "SP-AP": 7, "SP-RR": 7, "SP-DF": 7,
  // Norte/Nordeste/CO/ES → qualquer estado → 12%
  "BA-SP": 12, "CE-SP": 12, "PE-SP": 12, "GO-SP": 12,
};

const ICMS_INTERNO: Record<string, number> = {
  SP: 18, RJ: 20, MG: 18, PR: 19.5, SC: 17, RS: 17,
  BA: 20.5, CE: 20, PE: 20.5, GO: 17, MT: 17, MS: 17,
  PA: 19, AM: 20, MA: 22, PI: 21, RN: 20, PB: 20,
  SE: 19, AL: 19, ES: 17, TO: 20, RO: 19.5, AC: 19,
  AP: 18, RR: 20, DF: 20,
};

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 5: DADOS PADRÃO (Tabelas vigentes 2026)
// ═══════════════════════════════════════════════════════════════════════════

const TABELA_INSS_2026: FaixaINSS[] = [
  { de: 0, ate: 1518.00, aliquota: 7.5 },
  { de: 1518.01, ate: 2793.88, aliquota: 9 },
  { de: 2793.89, ate: 4190.83, aliquota: 12 },
  { de: 4190.84, ate: 8157.41, aliquota: 14 },
];

const TABELA_IRRF_2026: FaixaIRRF[] = [
  { de: 0, ate: 2259.20, aliquota: 0, deducao: 0 },
  { de: 2259.21, ate: 2826.65, aliquota: 7.5, deducao: 169.44 },
  { de: 2826.66, ate: 3751.05, aliquota: 15, deducao: 381.44 },
  { de: 3751.06, ate: 4664.68, aliquota: 22.5, deducao: 662.77 },
  { de: 4664.69, ate: Infinity, aliquota: 27.5, deducao: 896.00 },
];

const SALARIO_FAMILIA_2026: FaixaSalarioFamilia[] = [
  { ate: 1819.26, valor: 62.04 },
];

const REGRAS_TRABALHISTAS_PADRAO: RegrasTrabalhistas = {
  tabelaINSS: TABELA_INSS_2026,
  tetoINSS: 8157.41,
  tabelaIRRF: TABELA_IRRF_2026,
  deducaoDependente: 189.59,
  inssPatronal: 20,
  rat: 2,
  fap: 1.0,
  terceiros: 5.8,
  totalPatronal: 27.8,
  fgts: 8,
  fgtsRescisao: 40,
  valeTransporteDesconto: 6,
  salarioFamilia: SALARIO_FAMILIA_2026,
  adicionalFerias: 33.33,
  maximoDiasFracionamento: 3,
  decimoTerceiroMeses: 12,
  horaExtra50: 50,
  horaExtra100: 100,
  adicionalNoturno: 20,
  insalubridadeMinimo: 10,
  insalubridadeMedio: 20,
  insalubridadeMaximo: 40,
  periculosidade: 30,
  avisoPrevio: 30,
  multaFGTS: 40,
  multaArt479: 50,
};

const REGRAS_PIS_COFINS_PADRAO: RegraPISCOFINS = {
  regime: "nao_cumulativo",
  aliquotaPISCumulativo: 0.65,
  aliquotaCOFINSCumulativo: 3.0,
  aliquotaPISNaoCumulativo: 1.65,
  aliquotaCOFINSNaoCumulativo: 7.6,
  creditoPermitido: true,
  baseCredito: "total",
};

const REGRAS_IRPJ_CSLL_PADRAO: RegraIRPJCSLL = {
  regime: "real",
  presuncaoIRPJProduto: 8,
  presuncaoIRPJServico: 32,
  presuncaoCSLLProduto: 12,
  presuncaoCSLLServico: 32,
  aliquotaIRPJ: 15,
  adicionalIRPJ: 10,
  limiteAdicionalMensal: 20000,
  aliquotaCSLL: 9,
  deducoes: [],
  compensacaoPrejuizo: 30,
};

const RETENCOES_PADRAO: RegraRetencao[] = [
  { tipo: "inss", descricao: "INSS Retido (11%)", aliquota: 11, baseCalculo: "percentual", percentualBase: 100, valorMinimo: 0, codigoReceita: "2631", vencimentoDia: 20, tipoTituloFinanceiro: "INSS-RET" },
  { tipo: "irrf", descricao: "IR Retido (1.5%)", aliquota: 1.5, baseCalculo: "total", percentualBase: 100, valorMinimo: 10, codigoReceita: "1708", vencimentoDia: 20, tipoTituloFinanceiro: "IRRF-RET" },
  { tipo: "csll", descricao: "CSLL Retida (1%)", aliquota: 1, baseCalculo: "total", percentualBase: 100, valorMinimo: 10, codigoReceita: "5952", vencimentoDia: 20, tipoTituloFinanceiro: "CSLL-RET" },
  { tipo: "cofins", descricao: "COFINS Retida (3%)", aliquota: 3, baseCalculo: "total", percentualBase: 100, valorMinimo: 10, codigoReceita: "5952", vencimentoDia: 20, tipoTituloFinanceiro: "COFINS-RET" },
  { tipo: "pis", descricao: "PIS Retido (0.65%)", aliquota: 0.65, baseCalculo: "total", percentualBase: 100, valorMinimo: 10, codigoReceita: "5952", vencimentoDia: 20, tipoTituloFinanceiro: "PIS-RET" },
  { tipo: "iss", descricao: "ISS Retido", aliquota: 5, baseCalculo: "total", percentualBase: 100, valorMinimo: 0, codigoReceita: "ISS", vencimentoDia: 15, tipoTituloFinanceiro: "ISS-RET" },
];

const REGRAS_FINANCEIRAS_PADRAO: RegrasFinanceiras = {
  jurosMoraDia: 0.033,
  multaAtraso: 2,
  gerarTituloNaEmissaoNF: true,
  gerarTituloNaEntradaNF: true,
  gerarTituloRetencao: true,
  gerarTituloFolha: true,
  gerarTituloEncargos: true,
  alimentarFluxoAutomatico: true,
  projecaoDias: 90,
  toleranciaConciliacao: 0.50,
  retencoesMensais: [
    { tipo: "INSS-RET", descricao: "INSS Retido — Saldo acumulado do mês", vencimentoDia: 20, codigoDARF: "2631", contaContabil: "2.1.3.01", acumulaNotas: true },
    { tipo: "CSRF", descricao: "CSRF (IR+CSLL+COFINS+PIS) — Saldo acumulado", vencimentoDia: 20, codigoDARF: "5952", contaContabil: "2.1.3.02", acumulaNotas: true },
    { tipo: "ISS-RET", descricao: "ISS Retido — Saldo acumulado do mês", vencimentoDia: 15, codigoDARF: "ISS", contaContabil: "2.1.3.03", acumulaNotas: true },
    { tipo: "FGTS", descricao: "FGTS Folha — Recolhimento mensal", vencimentoDia: 7, codigoDARF: "FGTS", contaContabil: "2.1.4.01", acumulaNotas: false },
    { tipo: "GPS", descricao: "GPS — INSS Patronal + Empregado", vencimentoDia: 20, codigoDARF: "GPS", contaContabil: "2.1.4.02", acumulaNotas: false },
    { tipo: "IRRF-FOLHA", descricao: "IRRF Folha — Recolhimento mensal", vencimentoDia: 20, codigoDARF: "0561", contaContabil: "2.1.4.03", acumulaNotas: false },
  ],
};

const REFORMA_TRIBUTARIA_PADRAO: RegraReformaTributaria = {
  anoVigencia: 2026,
  aliquotaCBS: 0.9,
  aliquotaIBS: 0,
  aliquotaTotal: 0.9,
  creditoIntegral: true,
  splitPayment: false,
  cashback: false,
  regimeTransicao: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 6: FUNÇÕES DE CÁLCULO (O Motor)
// ═══════════════════════════════════════════════════════════════════════════

/** Calcula INSS empregado progressivo */
export function calcularINSSEmpregado(salarioBruto: number, tabela: FaixaINSS[]): number {
  let inss = 0;
  let salarioRestante = salarioBruto;

  for (const faixa of tabela) {
    if (salarioRestante <= 0) break;
    const base = Math.min(salarioRestante, faixa.ate - faixa.de + (faixa.de === 0 ? 0 : 0.01));
    const faixaBase = faixa.ate - faixa.de + (faixa.de === 0 ? faixa.ate : 0.01);
    const tributavel = Math.min(salarioRestante, faixaBase);
    inss += tributavel * (faixa.aliquota / 100);
    salarioRestante -= tributavel;
  }

  return Math.min(inss, tabela[tabela.length - 1].ate * (tabela[tabela.length - 1].aliquota / 100));
}

/** Calcula IRRF com deduções */
export function calcularIRRF(
  salarioBruto: number,
  inss: number,
  dependentes: number,
  tabela: FaixaIRRF[],
  deducaoDependente: number
): number {
  const base = salarioBruto - inss - (dependentes * deducaoDependente);
  if (base <= 0) return 0;

  for (const faixa of tabela) {
    if (base >= faixa.de && base <= faixa.ate) {
      const irrf = (base * (faixa.aliquota / 100)) - faixa.deducao;
      return Math.max(0, irrf);
    }
  }
  return 0;
}

/** Calcula folha completa de um funcionário */
export function calcularFolhaCompleta(
  salarioBruto: number,
  horasExtras50: number,
  horasExtras100: number,
  adicionalNoturnoHoras: number,
  insalubridade: "nenhum" | "minimo" | "medio" | "maximo",
  periculosidade: boolean,
  dependentes: number,
  valeTransporte: boolean,
  regras: RegrasTrabalhistas,
  salarioMinimo: number = 1518
): FolhaCalculada {
  // Proventos
  const valorHora = salarioBruto / 220;
  const he50 = horasExtras50 * valorHora * 1.5;
  const he100 = horasExtras100 * valorHora * 2;
  const adNoturno = adicionalNoturnoHoras * valorHora * (regras.adicionalNoturno / 100);

  let adInsalubridade = 0;
  if (insalubridade === "minimo") adInsalubridade = salarioMinimo * (regras.insalubridadeMinimo / 100);
  if (insalubridade === "medio") adInsalubridade = salarioMinimo * (regras.insalubridadeMedio / 100);
  if (insalubridade === "maximo") adInsalubridade = salarioMinimo * (regras.insalubridadeMaximo / 100);

  const adPericulosidade = periculosidade ? salarioBruto * (regras.periculosidade / 100) : 0;

  const totalProventos = salarioBruto + he50 + he100 + adNoturno + adInsalubridade + adPericulosidade;

  // Descontos
  const inss = calcularINSSEmpregado(totalProventos, regras.tabelaINSS);
  const irrf = calcularIRRF(totalProventos, inss, dependentes, regras.tabelaIRRF, regras.deducaoDependente);
  const descVT = valeTransporte ? salarioBruto * (regras.valeTransporteDesconto / 100) : 0;
  const totalDescontos = inss + irrf + descVT;

  // Líquido
  const liquido = totalProventos - totalDescontos;

  // Encargos patronais
  const baseEncargos = totalProventos;
  const inssPatronal = baseEncargos * (regras.inssPatronal / 100);
  const ratFap = baseEncargos * ((regras.rat * regras.fap) / 100);
  const terceiros = baseEncargos * (regras.terceiros / 100);
  const fgts = baseEncargos * (regras.fgts / 100);
  const totalEncargos = inssPatronal + ratFap + terceiros + fgts;

  // Provisões (férias e 13º)
  const provisaoFerias = totalProventos / 12 * (1 + regras.adicionalFerias / 100);
  const provisao13 = totalProventos / 12;

  // Custo total do funcionário
  const custoTotal = totalProventos + totalEncargos + provisaoFerias + provisao13;

  return {
    proventos: {
      salarioBruto, he50, he100, adNoturno, adInsalubridade, adPericulosidade, totalProventos,
    },
    descontos: {
      inss, irrf, valeTransporte: descVT, totalDescontos,
    },
    encargos: {
      inssPatronal, ratFap, terceiros, fgts, totalEncargos,
    },
    provisoes: {
      ferias: provisaoFerias, decimoTerceiro: provisao13,
    },
    liquido,
    custoTotal,
  };
}

export interface FolhaCalculada {
  proventos: {
    salarioBruto: number; he50: number; he100: number; adNoturno: number;
    adInsalubridade: number; adPericulosidade: number; totalProventos: number;
  };
  descontos: {
    inss: number; irrf: number; valeTransporte: number; totalDescontos: number;
  };
  encargos: {
    inssPatronal: number; ratFap: number; terceiros: number; fgts: number; totalEncargos: number;
  };
  provisoes: { ferias: number; decimoTerceiro: number };
  liquido: number;
  custoTotal: number;
}

/** Calcula impostos de uma nota fiscal de saída */
export function calcularImpostosNFSaida(
  valorTotal: number,
  tipo: "produto" | "servico",
  ufOrigem: string,
  ufDestino: string,
  regimePisCofins: RegraPISCOFINS,
  regraIrpjCsll: RegraIRPJCSLL,
  codigoServicoISS?: string,
  aliquotaISS?: number,
  ncm?: string,
  aliquotaIPI?: number,
): ImpostosNF {
  // ICMS
  let icms = 0;
  let icmsST = 0;
  if (tipo === "produto") {
    const chaveInterestadual = `${ufOrigem}-${ufDestino}`;
    const aliquota = ufOrigem === ufDestino
      ? (ICMS_INTERNO[ufOrigem] || 18)
      : (ICMS_INTERESTADUAL[chaveInterestadual] || 12);
    icms = valorTotal * (aliquota / 100);
  }

  // IPI
  const ipi = tipo === "produto" ? valorTotal * ((aliquotaIPI || 0) / 100) : 0;

  // PIS/COFINS
  const pisCofins = regimePisCofins.regime === "cumulativo"
    ? {
        pis: valorTotal * (regimePisCofins.aliquotaPISCumulativo / 100),
        cofins: valorTotal * (regimePisCofins.aliquotaCOFINSCumulativo / 100),
      }
    : {
        pis: valorTotal * (regimePisCofins.aliquotaPISNaoCumulativo / 100),
        cofins: valorTotal * (regimePisCofins.aliquotaCOFINSNaoCumulativo / 100),
      };

  // ISS (serviço)
  const iss = tipo === "servico" ? valorTotal * ((aliquotaISS || 5) / 100) : 0;

  // IRPJ/CSLL (estimativa proporcional)
  const presuncaoIRPJ = tipo === "produto" ? regraIrpjCsll.presuncaoIRPJProduto : regraIrpjCsll.presuncaoIRPJServico;
  const presuncaoCSLL = tipo === "produto" ? regraIrpjCsll.presuncaoCSLLProduto : regraIrpjCsll.presuncaoCSLLServico;
  const irpjEstimado = (valorTotal * presuncaoIRPJ / 100) * (regraIrpjCsll.aliquotaIRPJ / 100);
  const csllEstimado = (valorTotal * presuncaoCSLL / 100) * (regraIrpjCsll.aliquotaCSLL / 100);

  const totalImpostos = icms + icmsST + ipi + pisCofins.pis + pisCofins.cofins + iss + irpjEstimado + csllEstimado;

  return {
    icms, icmsST, ipi,
    pis: pisCofins.pis, cofins: pisCofins.cofins,
    iss, irpjEstimado, csllEstimado,
    totalImpostos,
    aliquotaEfetiva: (totalImpostos / valorTotal) * 100,
    valorLiquido: valorTotal - totalImpostos,
  };
}

export interface ImpostosNF {
  icms: number; icmsST: number; ipi: number;
  pis: number; cofins: number;
  iss: number; irpjEstimado: number; csllEstimado: number;
  totalImpostos: number; aliquotaEfetiva: number; valorLiquido: number;
}

/** Calcula retenções de uma nota de serviço recebida */
export function calcularRetencoes(
  valorNota: number,
  retencoes: RegraRetencao[],
  tipoServico: "construcao_civil" | "servico_geral" | "cessao_mao_obra"
): RetencaoCalculada[] {
  return retencoes.map(r => {
    let base = valorNota;
    if (r.tipo === "inss" && tipoServico === "construcao_civil") {
      base = valorNota * 0.35; // Base reduzida para construção civil
    }
    const valor = base * (r.aliquota / 100);
    return {
      tipo: r.tipo,
      descricao: r.descricao,
      base,
      aliquota: r.aliquota,
      valor: valor >= r.valorMinimo ? valor : 0,
      codigoReceita: r.codigoReceita,
      vencimentoDia: r.vencimentoDia,
      tipoTitulo: r.tipoTituloFinanceiro,
    };
  }).filter(r => r.valor > 0);
}

export interface RetencaoCalculada {
  tipo: string; descricao: string; base: number;
  aliquota: number; valor: number;
  codigoReceita: string; vencimentoDia: number; tipoTitulo: string;
}

/** Gera títulos financeiros a partir de uma nota */
export function gerarTitulosFinanceiros(
  tipoNota: "entrada" | "saida",
  valorNota: number,
  parceiro: string,
  condicaoPagamento: string,
  retencoes: RetencaoCalculada[],
  regras: RegrasFinanceiras,
): TituloGerado[] {
  const titulos: TituloGerado[] = [];
  const hoje = new Date();

  // Título principal (a pagar ou a receber)
  if (tipoNota === "entrada" && regras.gerarTituloNaEntradaNF) {
    const totalRetencoes = retencoes.reduce((s, r) => s + r.valor, 0);
    titulos.push({
      tipo: "pagar",
      descricao: `NF de ${parceiro}`,
      valor: valorNota - totalRetencoes,
      vencimento: calcularVencimento(hoje, condicaoPagamento),
      categoria: "fornecedores",
      status: "aberto",
    });
  }

  if (tipoNota === "saida" && regras.gerarTituloNaEmissaoNF) {
    titulos.push({
      tipo: "receber",
      descricao: `NF para ${parceiro}`,
      valor: valorNota,
      vencimento: calcularVencimento(hoje, condicaoPagamento),
      categoria: "clientes",
      status: "aberto",
    });
  }

  // Títulos de retenção (acumulam no mês)
  if (regras.gerarTituloRetencao) {
    for (const ret of retencoes) {
      titulos.push({
        tipo: "pagar",
        descricao: ret.descricao,
        valor: ret.valor,
        vencimento: proximoVencimento(ret.vencimentoDia),
        categoria: "impostos",
        status: "aberto",
      });
    }
  }

  return titulos;
}

export interface TituloGerado {
  tipo: "pagar" | "receber";
  descricao: string;
  valor: number;
  vencimento: string;
  categoria: string;
  status: string;
}

function calcularVencimento(dataBase: Date, condicao: string): string {
  const d = new Date(dataBase);
  if (condicao === "À vista") return d.toISOString().split("T")[0];
  const match = condicao.match(/(\d+)/);
  if (match) d.setDate(d.getDate() + parseInt(match[1]));
  return d.toISOString().split("T")[0];
}

function proximoVencimento(dia: number): string {
  const hoje = new Date();
  const venc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia);
  return venc.toISOString().split("T")[0];
}

// ═══════════════════════════════════════════════════════════════════════════
// SEÇÃO 7: STORE (Estado global)
// ═══════════════════════════════════════════════════════════════════════════

export interface EngenhariaState {
  // Regras
  trabalhistas: RegrasTrabalhistas;
  pisCofins: RegraPISCOFINS;
  irpjCsll: RegraIRPJCSLL;
  retencoes: RegraRetencao[];
  financeiras: RegrasFinanceiras;
  reformaTributaria: RegraReformaTributaria;
  issServicos: RegraISS[];

  // Setters
  setTrabalhistas: (r: Partial<RegrasTrabalhistas>) => void;
  setPisCofins: (r: Partial<RegraPISCOFINS>) => void;
  setIrpjCsll: (r: Partial<RegraIRPJCSLL>) => void;
  setRetencoes: (r: RegraRetencao[]) => void;
  setFinanceiras: (r: Partial<RegrasFinanceiras>) => void;
  setReformaTributaria: (r: Partial<RegraReformaTributaria>) => void;

  // Métodos de cálculo (delegates)
  calcularFolha: (params: {
    salarioBruto: number; horasExtras50?: number; horasExtras100?: number;
    adicionalNoturnoHoras?: number; insalubridade?: "nenhum" | "minimo" | "medio" | "maximo";
    periculosidade?: boolean; dependentes?: number; valeTransporte?: boolean;
  }) => FolhaCalculada;

  calcularImpostosSaida: (params: {
    valorTotal: number; tipo: "produto" | "servico";
    ufOrigem: string; ufDestino: string;
    aliquotaISS?: number; aliquotaIPI?: number;
  }) => ImpostosNF;

  calcularRetencoesEntrada: (params: {
    valorNota: number; tipoServico: "construcao_civil" | "servico_geral" | "cessao_mao_obra";
  }) => RetencaoCalculada[];

  gerarTitulos: (params: {
    tipoNota: "entrada" | "saida"; valorNota: number; parceiro: string;
    condicaoPagamento: string; retencoes: RetencaoCalculada[];
  }) => TituloGerado[];

  // Utilitários
  obterICMSInterestadual: (ufOrigem: string, ufDestino: string) => number;
  obterICMSInterno: (uf: string) => number;
}

export const useEngenharia = create<EngenhariaState>((set, get) => ({
  trabalhistas: REGRAS_TRABALHISTAS_PADRAO,
  pisCofins: REGRAS_PIS_COFINS_PADRAO,
  irpjCsll: REGRAS_IRPJ_CSLL_PADRAO,
  retencoes: RETENCOES_PADRAO,
  financeiras: REGRAS_FINANCEIRAS_PADRAO,
  reformaTributaria: REFORMA_TRIBUTARIA_PADRAO,
  issServicos: [],

  setTrabalhistas: (r) => set(s => ({ trabalhistas: { ...s.trabalhistas, ...r } })),
  setPisCofins: (r) => set(s => ({ pisCofins: { ...s.pisCofins, ...r } })),
  setIrpjCsll: (r) => set(s => ({ irpjCsll: { ...s.irpjCsll, ...r } })),
  setRetencoes: (r) => set({ retencoes: r }),
  setFinanceiras: (r) => set(s => ({ financeiras: { ...s.financeiras, ...r } })),
  setReformaTributaria: (r) => set(s => ({ reformaTributaria: { ...s.reformaTributaria, ...r } })),

  calcularFolha: (params) => {
    const regras = get().trabalhistas;
    return calcularFolhaCompleta(
      params.salarioBruto, params.horasExtras50 || 0, params.horasExtras100 || 0,
      params.adicionalNoturnoHoras || 0, params.insalubridade || "nenhum",
      params.periculosidade || false, params.dependentes || 0,
      params.valeTransporte !== false, regras,
    );
  },

  calcularImpostosSaida: (params) => {
    const s = get();
    return calcularImpostosNFSaida(
      params.valorTotal, params.tipo, params.ufOrigem, params.ufDestino,
      s.pisCofins, s.irpjCsll, undefined, params.aliquotaISS, undefined, params.aliquotaIPI,
    );
  },

  calcularRetencoesEntrada: (params) => {
    return calcularRetencoes(params.valorNota, get().retencoes, params.tipoServico);
  },

  gerarTitulos: (params) => {
    return gerarTitulosFinanceiros(
      params.tipoNota, params.valorNota, params.parceiro,
      params.condicaoPagamento, params.retencoes, get().financeiras,
    );
  },

  obterICMSInterestadual: (ufOrigem, ufDestino) => {
    return ICMS_INTERESTADUAL[`${ufOrigem}-${ufDestino}`] || 12;
  },

  obterICMSInterno: (uf) => {
    return ICMS_INTERNO[uf] || 18;
  },
}));
