import { create } from "zustand";

/**
 * REFORMA TRIBUTÁRIA - IBS/CBS
 * Sintera ERP — Módulo de Apuração da Reforma Tributária
 * 
 * Responsabilidades:
 * - Controle de crédito de IBS e CBS
 * - Cálculo de alíquota efetiva (2026+)
 * - Sincronização com ambiente nacional (RFB)
 * - Apuração periódica
 */

export type RegimeIBS = "normal" | "beneficiado" | "isento";
export type StatusApuracao = "aberto" | "processando" | "calculado" | "enviado" | "rejeitado";

export interface CreditoIBS {
  id: string;
  periodo: string;
  tipo: "entrada" | "ativo" | "servico";
  descricao: string;
  baseCalculo: number;
  aliquota: number;
  credito: number;
  dataRegistro: string;
  status: "pendente" | "validado" | "compensado";
  sincronizado?: boolean;
}

export interface ApuracaoIBS {
  id: string;
  periodo: string;
  regime: RegimeIBS;
  
  // Débitos
  debitoOperacoes: number;
  debitoOutras: number;
  totalDebitos: number;
  
  // Créditos
  creditoEntradas: number;
  creditoAtivos: number;
  creditoServicos: number;
  creditoBeneficio: number;
  totalCreditos: number;
  
  // Apuração
  saldoCredor: number;
  saldoDevedor: number;
  aliquotaEfetiva: number;
  
  // Transferência/Recuperação
  transferenciaPeriodoAnterior: number;
  compensacao: number;
  parcelamento: number;
  
  status: StatusApuracao;
  dataCalculo?: string;
  dataEnvio?: string;
  sincronizadoRFB: boolean;
}

export interface ConfigReformaFiscal {
  aliquotaTestePrincipal: number; // 2026 = 0.9%
  aliquotaTransicao: Record<string, number>; // 2026-2035
  regimeAdotado: RegimeIBS;
  dataSincronizacaoUltima?: string;
  ambienteRFB: "homologacao" | "producao";
  chaveAcesso?: string;
}

export interface TributacaoProgressiva {
  ano: number;
  aliquota: number;
  coeficiente: number;
  descricao: string;
}

const PROGRESSAO_IBS_2026_2035: TributacaoProgressiva[] = [
  { ano: 2026, aliquota: 0.9, coeficiente: 0.5, descricao: "Fase 1 — 50% de alíquota" },
  { ano: 2027, aliquota: 1.8, coeficiente: 1.0, descricao: "Fase 2 — Alíquota integral" },
  { ano: 2028, aliquota: 2.9, coeficiente: 1.0, descricao: "Fase 3 — Alíquota máxima esperada" },
];

export interface ReformaTributariaState {
  config: ConfigReformaFiscal;
  apuracoes: ApuracaoIBS[];
  creditos: CreditoIBS[];
  setConfig: (cfg: Partial<ConfigReformaFiscal>) => void;
  adicionarCredito: (c: Omit<CreditoIBS, "id">) => void;
  removerCredito: (id: string) => void;
  calcularApuracao: (periodo: string) => ApuracaoIBS | null;
  sincronizarRFB: (periodo: string) => Promise<boolean>;
  obterProgresso: () => TributacaoProgressiva[];
  obterSaldoAtual: () => { devedor: number; credor: number };
}

const configPadrao: ConfigReformaFiscal = {
  aliquotaTestePrincipal: 0.9,
  aliquotaTransicao: {
    "2026": 0.9,
    "2027": 1.8,
    "2028": 2.9,
  },
  regimeAdotado: "normal",
  ambienteRFB: "homologacao",
};

export const useReformaTributaria = create<ReformaTributariaState>((set, get) => ({
  config: configPadrao,
  apuracoes: [],
  creditos: [],

  setConfig: (cfg) => {
    set((state) => ({
      config: { ...state.config, ...cfg },
    }));
  },

  adicionarCredito: (c) => {
    set((state) => ({
      creditos: [
        ...state.creditos,
        {
          ...c,
          id: `CRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      ],
    }));
  },

  removerCredito: (id) => {
    set((state) => ({
      creditos: state.creditos.filter((c) => c.id !== id),
    }));
  },

  calcularApuracao: (periodo) => {
    const state = get();
    const creditosPeriodo = state.creditos.filter((c) => c.periodo === periodo);

    const totalDebitos = state.apuracoes
      .filter((a) => a.periodo === periodo)
      .reduce((s, a) => s + a.totalDebitos, 0) || 50000; // dummy

    const totalCreditos = creditosPeriodo.reduce((s, c) => s + c.credito, 0);
    const saldoCredor = totalCreditos > totalDebitos ? totalCreditos - totalDebitos : 0;
    const saldoDevedor = totalDebitos > totalCreditos ? totalDebitos - totalCreditos : 0;
    const aliquotaEfetiva = totalDebitos > 0 ? (totalDebitos - totalCreditos) / totalDebitos : 0;

    const apuracao: ApuracaoIBS = {
      id: `APU-${periodo}-${Date.now()}`,
      periodo,
      regime: state.config.regimeAdotado,
      debitoOperacoes: totalDebitos * 0.7,
      debitoOutras: totalDebitos * 0.3,
      totalDebitos,
      creditoEntradas: creditosPeriodo.filter((c) => c.tipo === "entrada").reduce((s, c) => s + c.credito, 0),
      creditoAtivos: creditosPeriodo.filter((c) => c.tipo === "ativo").reduce((s, c) => s + c.credito, 0),
      creditoServicos: creditosPeriodo.filter((c) => c.tipo === "servico").reduce((s, c) => s + c.credito, 0),
      creditoBeneficio: 0,
      totalCreditos,
      saldoCredor,
      saldoDevedor,
      aliquotaEfetiva,
      transferenciaPeriodoAnterior: 0,
      compensacao: 0,
      parcelamento: 0,
      status: "calculado",
      dataCalculo: new Date().toISOString(),
      sincronizadoRFB: false,
    };

    set((state) => ({
      apuracoes: [...state.apuracoes, apuracao],
    }));

    return apuracao;
  },

  sincronizarRFB: async (periodo) => {
    // Simulação de sincronização com RFB
    // Em produção, isso conectaria via API REST com a Receita Federal
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set((state) => ({
      config: {
        ...state.config,
        dataSincronizacaoUltima: new Date().toISOString(),
      },
      apuracoes: state.apuracoes.map((a) =>
        a.periodo === periodo ? { ...a, sincronizadoRFB: true, status: "enviado" as StatusApuracao } : a
      ),
    }));
    return true;
  },

  obterProgresso: () => PROGRESSAO_IBS_2026_2035,

  obterSaldoAtual: () => {
    const state = get();
    const ultimaApuracao = state.apuracoes.sort((a, b) => 
      new Date(b.dataCalculo || 0).getTime() - new Date(a.dataCalculo || 0).getTime()
    )[0];
    
    return {
      devedor: ultimaApuracao?.saldoDevedor || 0,
      credor: ultimaApuracao?.saldoCredor || 0,
    };
  },
}));
