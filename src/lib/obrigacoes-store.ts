import { create } from "zustand";

/**
 * ÓBRIGAÇÕES ACESSÓRIAS
 * Sintera ERP — Módulo de Entregas de Obrigações ao Fisco
 * 
 * Responsabilidades:
 * - ECF (Escrituração Contábil Fiscal)
 * - e-Lalur (IRPJ/CSLL)
 * - ECD (Escrituração Contábil Digital)
 * - SPED Fiscal
 * - DACON (Declaração de Crédito e Débito)
 * - DARF / Guias de recolhimento
 */

export type TipoObrigacao =
  | "ecf"
  | "e-lalur"
  | "ecd"
  | "sped-fiscal"
  | "dacon"
  | "darf"
  | "rpa"
  | "gps"
  | "icms-ST"
  | "nfe-inutilizacao";

export type StatusObrigacao = "pendente" | "em_preparacao" | "pronto" | "enviado" | "rejeitado" | "aceito";

export interface Obrigacao {
  id: string;
  tipo: TipoObrigacao;
  periodo: string;
  descricao: string;
  vencimento: string;
  status: StatusObrigacao;
  arquivo?: {
    nome: string;
    tamanho: number;
    hash?: string;
    dataGeracao?: string;
  };
  protocolo?: string;
  observacoes?: string;
  dataUltAlteracao: string;
}

export interface GuiaRecolhimento {
  id: string;
  tipo: "darf" | "gps" | "rpa" | "icms-st";
  periodo: string;
  descricao: string;
  valor: number;
  vencimento: string;
  juros: number;
  multa: number;
  totalAPagar: number;
  codigoBarras?: string;
  dataPagamento?: string;
  comprovante?: string;
}

export interface ArquivoObrigacao {
  id: string;
  obrigacaoId: string;
  tipo: "xml" | "txt" | "zip" | "json" | "pdf";
  nome: string;
  conteudo: string;
  tamanho: number;
  hash: string;
  dataCriacao: string;
}

export interface ConfigObrigacoes {
  regime: "simplesnacional" | "lucro-real" | "lucro-presumido" | "mei";
  periodicidade: "mensal" | "trimestral" | "anual";
  cnpj: string;
  inscricaoEstadual: string;
  ambienteEnvio: "homologacao" | "producao";
  certificado?: {
    validade: string;
    tipo: "a1" | "a3";
  };
}

export interface RelatorioObrigacoes {
  periodo: string;
  totalObrigacoes: number;
  cumpridas: number;
  pendentes: number;
  atrasadas: number;
  proximosVencimentos: Obrigacao[];
  arquivosParaEnviar: ArquivoObrigacao[];
}

export interface ObrigacoesState {
  config: ConfigObrigacoes;
  obrigacoes: Obrigacao[];
  guias: GuiaRecolhimento[];
  arquivos: ArquivoObrigacao[];
  
  setConfig: (cfg: Partial<ConfigObrigacoes>) => void;
  criarObrigacao: (o: Omit<Obrigacao, "id" | "dataUltAlteracao">) => Obrigacao;
  atualizarObrigacao: (id: string, updates: Partial<Obrigacao>) => void;
  gerarArquivo: (obrigacaoId: string, tipo: ArquivoObrigacao["tipo"], conteudo: string) => Promise<ArquivoObrigacao>;
  criarGuia: (g: Omit<GuiaRecolhimento, "id">) => GuiaRecolhimento;
  obterRelatorio: (periodo: string) => RelatorioObrigacoes;
  marcarEnviado: (obrigacaoId: string, protocolo: string) => void;
  exportarPDF: (obrigacaoId: string) => Promise<Blob>;
  listarProximos: (dias?: number) => Obrigacao[];
}

export const configPadraoObrigacoes: ConfigObrigacoes = {
  regime: "lucro-real",
  periodicidade: "mensal",
  cnpj: "",
  inscricaoEstadual: "",
  ambienteEnvio: "homologacao",
};

// Calendário padrão de obrigações (Brasil)
const OBRIGACOES_PADRAO: Omit<Obrigacao, "id" | "dataUltAlteracao">[] = [
  {
    tipo: "sped-fiscal",
    periodo: "202606",
    descricao: "SPED Fiscal — junho/2026",
    vencimento: "2026-08-15",
    status: "pendente",
  },
  {
    tipo: "ecf",
    periodo: "202606",
    descricao: "ECF — Escrituração Contábil Fiscal — junho/2026",
    vencimento: "2026-08-31",
    status: "pendente",
  },
  {
    tipo: "ecd",
    periodo: "202606",
    descricao: "ECD — Escrituração Contábil Digital — junho/2026",
    vencimento: "2026-08-31",
    status: "pendente",
  },
  {
    tipo: "darf",
    periodo: "202606",
    descricao: "DARF — IRPJ/CSLL — junho/2026",
    vencimento: "2026-07-20",
    status: "pendente",
  },
  {
    tipo: "gps",
    periodo: "202606",
    descricao: "GPS — Contribuição Social — junho/2026",
    vencimento: "2026-07-20",
    status: "pendente",
  },
];

export const useObrigacoes = create<ObrigacoesState>((set, get) => ({
  config: configPadraoObrigacoes,
  obrigacoes: OBRIGACOES_PADRAO.map((o, i) => ({
    ...o,
    id: `OBG-${i + 1}`,
    dataUltAlteracao: new Date().toISOString(),
  })),
  guias: [],
  arquivos: [],

  setConfig: (cfg) => {
    set((state) => ({
      config: { ...state.config, ...cfg },
    }));
  },

  criarObrigacao: (o) => {
    const nova: Obrigacao = {
      ...o,
      id: `OBG-${Date.now()}`,
      dataUltAlteracao: new Date().toISOString(),
    };
    set((state) => ({
      obrigacoes: [...state.obrigacoes, nova],
    }));
    return nova;
  },

  atualizarObrigacao: (id, updates) => {
    set((state) => ({
      obrigacoes: state.obrigacoes.map((o) =>
        o.id === id
          ? { ...o, ...updates, dataUltAlteracao: new Date().toISOString() }
          : o
      ),
    }));
  },

  gerarArquivo: async (obrigacaoId, tipo, conteudo) => {
    const arquivo: ArquivoObrigacao = {
      id: `ARQ-${Date.now()}`,
      obrigacaoId,
      tipo,
      nome: `${obrigacaoId}-${Date.now()}.${tipo}`,
      conteudo,
      tamanho: new Blob([conteudo]).size,
      hash: await hashSHA256(conteudo),
      dataCriacao: new Date().toISOString(),
    };
    set((state) => ({
      arquivos: [...state.arquivos, arquivo],
    }));
    get().atualizarObrigacao(obrigacaoId, { status: "pronto" });
    return arquivo;
  },

  criarGuia: (g) => {
    const guia: GuiaRecolhimento = {
      ...g,
      id: `GUIA-${Date.now()}`,
    };
    set((state) => ({
      guias: [...state.guias, guia],
    }));
    return guia;
  },

  obterRelatorio: (periodo) => {
    const state = get();
    const obs = state.obrigacoes.filter((o) => o.periodo === periodo);
    const hoje = new Date();
    const atrasadas = obs.filter((o) => new Date(o.vencimento) < hoje && o.status !== "aceito");

    return {
      periodo,
      totalObrigacoes: obs.length,
      cumpridas: obs.filter((o) => o.status === "aceito").length,
      pendentes: obs.filter((o) => o.status === "pendente").length,
      atrasadas: atrasadas.length,
      proximosVencimentos: obs
        .filter((o) => new Date(o.vencimento) >= hoje)
        .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
        .slice(0, 5),
      arquivosParaEnviar: state.arquivos.filter((a) =>
        obs.some((o) => o.id === a.obrigacaoId && o.status === "pronto")
      ),
    };
  },

  marcarEnviado: (obrigacaoId, protocolo) => {
    get().atualizarObrigacao(obrigacaoId, {
      status: "enviado",
      protocolo,
    });
  },

  exportarPDF: async (obrigacaoId) => {
    // Simulação — em produção usaria biblioteca como pdfkit ou pdfrw
    const obrigacao = get().obrigacoes.find((o) => o.id === obrigacaoId);
    if (!obrigacao) throw new Error("Obrigação não encontrada");
    
    const conteudo = `
      Obrigação: ${obrigacao.descricao}
      Tipo: ${obrigacao.tipo}
      Vencimento: ${obrigacao.vencimento}
      Status: ${obrigacao.status}
      Protocolo: ${obrigacao.protocolo || "N/A"}
    `;
    return new Blob([conteudo], { type: "application/pdf" });
  },

  listarProximos: (dias = 30) => {
    const state = get();
    const hoje = new Date();
    const limite = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000);
    
    return state.obrigacoes
      .filter(
        (o) =>
          new Date(o.vencimento) >= hoje &&
          new Date(o.vencimento) <= limite &&
          o.status !== "aceito"
      )
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
  },
}));

// Helper: simulação de hash SHA-256
async function hashSHA256(conteudo: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    return `HASH-${Math.random().toString(36).substr(2, 9)}`;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(conteudo);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
