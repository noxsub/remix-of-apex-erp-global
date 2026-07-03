import type { RegimeTributario } from "@/lib/fiscal-store";

/* ═══════════════════════════════════════════════════════════════
   OBRIGAÇÕES FISCAIS POR REGIME TRIBUTÁRIO
   Catálogo de conformidade — Simples Nacional, Lucro Presumido,
   Lucro Real e MEI. Cada obrigação declara a quais regimes se
   aplica, periodicidade, âmbito e regra de vencimento.
   ═══════════════════════════════════════════════════════════════ */

export type Periodicidade = "mensal" | "trimestral" | "anual" | "eventual";
export type Ambito = "federal" | "estadual" | "municipal" | "trabalhista";

export interface ObrigacaoRegime {
  codigo: string;
  nome: string;
  descricao: string;
  ambito: Ambito;
  periodicidade: Periodicidade;
  vencimentoRegra: string;
  regimes: RegimeTributario[];
  condicao?: string;
}

export const CATALOGO_OBRIGACOES: ObrigacaoRegime[] = [
  /* ── Federais — Simples Nacional ── */
  {
    codigo: "DAS",
    nome: "DAS — Documento de Arrecadação do Simples",
    descricao: "Guia unificada que recolhe IRPJ, CSLL, PIS, COFINS, IPI, ICMS, ISS e CPP em um único pagamento.",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 20 do mês seguinte ao período de apuração",
    regimes: ["Simples Nacional"],
  },
  {
    codigo: "PGDAS-D",
    nome: "PGDAS-D — Declaração Mensal do Simples",
    descricao: "Apuração mensal da receita bruta e cálculo do DAS no portal do Simples Nacional.",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "Até o vencimento do DAS (dia 20)",
    regimes: ["Simples Nacional"],
  },
  {
    codigo: "DEFIS",
    nome: "DEFIS — Declaração de Informações Socioeconômicas e Fiscais",
    descricao: "Declaração anual do Simples Nacional, substitui a antiga DASN.",
    ambito: "federal",
    periodicidade: "anual",
    vencimentoRegra: "Até 31 de março do ano seguinte",
    regimes: ["Simples Nacional"],
  },
  {
    codigo: "DASN-SIMEI",
    nome: "DASN-SIMEI — Declaração Anual do MEI",
    descricao: "Declaração anual simplificada do faturamento do Microempreendedor Individual.",
    ambito: "federal",
    periodicidade: "anual",
    vencimentoRegra: "Até 31 de maio do ano seguinte",
    regimes: ["MEI"],
  },
  {
    codigo: "DAS-MEI",
    nome: "DAS-MEI — Guia Mensal do MEI",
    descricao: "Valor fixo mensal (INSS + ICMS/ISS conforme atividade).",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 20 de cada mês",
    regimes: ["MEI"],
  },

  /* ── Federais — Lucro Presumido / Lucro Real ── */
  {
    codigo: "DARF-IRPJ",
    nome: "DARF IRPJ",
    descricao: "Imposto de Renda Pessoa Jurídica. Presumido: trimestral sobre base presumida. Real: trimestral ou estimativa mensal sobre lucro contábil ajustado.",
    ambito: "federal",
    periodicidade: "trimestral",
    vencimentoRegra: "Último dia útil do mês seguinte ao trimestre (quota única) ou em 3 quotas",
    regimes: ["Lucro Presumido", "Lucro Real"],
  },
  {
    codigo: "DARF-CSLL",
    nome: "DARF CSLL",
    descricao: "Contribuição Social sobre o Lucro Líquido — acompanha a sistemática do IRPJ.",
    ambito: "federal",
    periodicidade: "trimestral",
    vencimentoRegra: "Último dia útil do mês seguinte ao trimestre",
    regimes: ["Lucro Presumido", "Lucro Real"],
  },
  {
    codigo: "DARF-PIS-COFINS",
    nome: "DARF PIS/COFINS",
    descricao: "Presumido: regime cumulativo (0,65% + 3%). Real: não-cumulativo (1,65% + 7,6%) com apropriação de créditos.",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 25 do mês seguinte ao fato gerador",
    regimes: ["Lucro Presumido", "Lucro Real"],
  },
  {
    codigo: "DCTF",
    nome: "DCTFWeb / DCTF",
    descricao: "Declaração de Débitos e Créditos Tributários Federais — confissão de dívida dos tributos federais apurados.",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 15 do 2º mês subsequente à competência",
    regimes: ["Lucro Presumido", "Lucro Real"],
  },
  {
    codigo: "EFD-CONTRIB",
    nome: "EFD-Contribuições",
    descricao: "Escrituração digital do PIS/COFINS (e CPRB quando aplicável) no ambiente SPED.",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "10º dia útil do 2º mês subsequente",
    regimes: ["Lucro Presumido", "Lucro Real"],
  },
  {
    codigo: "ECF",
    nome: "ECF — Escrituração Contábil Fiscal",
    descricao: "Substitui a antiga DIPJ; demonstra a apuração do IRPJ e da CSLL (inclui e-Lalur/e-Lacs para o Lucro Real).",
    ambito: "federal",
    periodicidade: "anual",
    vencimentoRegra: "Último dia útil de julho do ano seguinte",
    regimes: ["Lucro Presumido", "Lucro Real"],
  },
  {
    codigo: "ECD",
    nome: "ECD — Escrituração Contábil Digital",
    descricao: "Livro Diário/Razão digitais no SPED. Obrigatória no Lucro Real; no Presumido, quando distribui lucros acima da presunção sem escrituração.",
    ambito: "federal",
    periodicidade: "anual",
    vencimentoRegra: "Último dia útil de junho do ano seguinte",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "Presumido: obrigatória se distribuir lucros acima da base presumida",
  },

  /* ── Estaduais ── */
  {
    codigo: "SPED-ICMS-IPI",
    nome: "EFD ICMS/IPI (SPED Fiscal)",
    descricao: "Escrituração fiscal digital das operações de ICMS e IPI — livros de entrada, saída, apuração e inventário.",
    ambito: "estadual",
    periodicidade: "mensal",
    vencimentoRegra: "Conforme UF (SP: dia 20 do mês seguinte)",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "Contribuintes de ICMS/IPI",
  },
  {
    codigo: "GIA",
    nome: "GIA — Guia de Informação e Apuração do ICMS",
    descricao: "Declaração estadual do ICMS (em extinção gradual nos estados que migraram 100% para a EFD).",
    ambito: "estadual",
    periodicidade: "mensal",
    vencimentoRegra: "Conforme calendário da SEFAZ estadual",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "Somente nas UFs que ainda exigem",
  },
  {
    codigo: "ICMS-GUIA",
    nome: "Recolhimento de ICMS",
    descricao: "Guia de recolhimento do ICMS próprio e ICMS-ST quando substituto tributário.",
    ambito: "estadual",
    periodicidade: "mensal",
    vencimentoRegra: "Conforme CNAE e UF (SP comércio: dia 20)",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "Contribuintes de ICMS",
  },

  /* ── Municipais ── */
  {
    codigo: "ISS",
    nome: "Recolhimento de ISS",
    descricao: "Imposto sobre Serviços — próprio e retido de terceiros (ISS-RF).",
    ambito: "municipal",
    periodicidade: "mensal",
    vencimentoRegra: "Conforme legislação municipal (SP: dia 10)",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "Prestadores de serviços",
  },
  {
    codigo: "DES",
    nome: "Declaração Eletrônica de Serviços",
    descricao: "Declaração municipal dos serviços prestados/tomados (nome varia por município: DES, DMS, REST).",
    ambito: "municipal",
    periodicidade: "mensal",
    vencimentoRegra: "Conforme legislação municipal",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "Conforme município",
  },

  /* ── Trabalhistas / Previdenciárias (todos os regimes com folha) ── */
  {
    codigo: "ESOCIAL",
    nome: "eSocial — Folha Digital",
    descricao: "Eventos periódicos de folha de pagamento (S-1200/S-1299) transmitidos ao ambiente nacional.",
    ambito: "trabalhista",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 15 do mês seguinte à competência",
    regimes: ["Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI"],
    condicao: "Empresas com empregados",
  },
  {
    codigo: "FGTS-DIGITAL",
    nome: "FGTS Digital",
    descricao: "Recolhimento do FGTS via guia gerada a partir dos eventos do eSocial.",
    ambito: "trabalhista",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 20 do mês seguinte à competência",
    regimes: ["Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI"],
    condicao: "Empresas com empregados",
  },
  {
    codigo: "DARF-INSS",
    nome: "DARF Previdenciário (via DCTFWeb)",
    descricao: "Contribuições previdenciárias patronais e retidas dos segurados, apuradas pelo eSocial.",
    ambito: "trabalhista",
    periodicidade: "mensal",
    vencimentoRegra: "Dia 20 do mês seguinte à competência",
    regimes: ["Lucro Presumido", "Lucro Real"],
    condicao: "No Simples, a CPP integra o DAS (exceto Anexo IV)",
  },
  {
    codigo: "DIRF-SUBST",
    nome: "Retenções na Fonte (IRRF/CSRF)",
    descricao: "Retenções de IR e contribuições sobre serviços tomados — informadas via EFD-Reinf/DCTFWeb (a DIRF foi substituída).",
    ambito: "federal",
    periodicidade: "mensal",
    vencimentoRegra: "EFD-Reinf: dia 15 do mês seguinte",
    regimes: ["Simples Nacional", "Lucro Presumido", "Lucro Real"],
    condicao: "Quando houver retenções",
  },
];

/** Retorna as obrigações aplicáveis a um regime tributário. */
export function obrigacoesDoRegime(regime: RegimeTributario): ObrigacaoRegime[] {
  return CATALOGO_OBRIGACOES.filter((o) => o.regimes.includes(regime));
}

export const AMBITO_LABEL: Record<Ambito, string> = {
  federal: "Federal",
  estadual: "Estadual",
  municipal: "Municipal",
  trabalhista: "Trabalhista",
};

export const PERIODICIDADE_LABEL: Record<Periodicidade, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  anual: "Anual",
  eventual: "Eventual",
};
