import { create } from "zustand";

/**
 * SINCRONIZAÇÃO CASCATA
 * Sintera ERP — Sistema de Sincronização em Cascata
 * 
 * Quando um evento ocorre em um módulo, ele se propaga para os outros:
 * - Fiscal → Financeiro (geração de guias)
 * - Vendas → Fiscal (geração de NF, imposto)
 * - Compras → Fiscal (apuração de crédito)
 * - Reforma Tributária → Financeiro (impacto no fluxo de caixa)
 */

export type EventoSincronizacao =
  | "nf-emitida"
  | "compra-registrada"
  | "venda-registrada"
  | "imposto-apurado"
  | "credito-ibs-adicionado"
  | "guia-gerada"
  | "obrigacao-vencida"
  | "config-fiscal-alterada";

export interface EventoSync {
  id: string;
  tipo: EventoSincronizacao;
  origem: string;
  destinos: string[];
  dados: Record<string, any>;
  timestamp: string;
  status: "pendente" | "processando" | "concluido" | "erro";
  erro?: string;
}

export interface SincronizacaoCascata {
  evento: EventoSync;
  etapas: EtapaSincronizacao[];
}

export interface EtapaSincronizacao {
  id: string;
  modulo: string;
  descricao: string;
  status: "pendente" | "processando" | "concluido" | "erro";
  resultado?: Record<string, any>;
  erro?: string;
  tempo?: number;
}

export interface ConfigSincronizacao {
  automatica: boolean;
  velocidade: "lenta" | "media" | "rapida";
  tentativasErro: number;
  intervaloPersistencia: number;
  logDetalhado: boolean;
}

export interface SincronizacaoState {
  config: ConfigSincronizacao;
  eventos: EventoSync[];
  cascatas: SincronizacaoCascata[];
  erros: Array<{ evento: string; erro: string; timestamp: string }>;
  
  // Métodos
  setConfig: (cfg: Partial<ConfigSincronizacao>) => void;
  dispararEvento: (tipo: EventoSincronizacao, origem: string, dados: any) => Promise<EventoSync>;
  processarCascata: (evento: EventoSync) => Promise<SincronizacaoCascata>;
  obterStatus: () => { processando: number; erros: number; sucesso: number };
  listarErros: () => Array<any>;
  reprocessarEvento: (eventoId: string) => Promise<boolean>;
  mapearDestinos: (tipo: EventoSincronizacao) => string[];
}

const configPadrao: ConfigSincronizacao = {
  automatica: true,
  velocidade: "media",
  tentativasErro: 3,
  intervaloPersistencia: 5000,
  logDetalhado: true,
};

// Mapeamento de eventos para destinos
const MAPA_PROPAGACAO: Record<EventoSincronizacao, string[]> = {
  "nf-emitida": ["fiscal", "financeiro", "estoque", "obrigacoes"],
  "compra-registrada": ["fiscal", "estoque", "financeiro", "reforma-tributaria"],
  "venda-registrada": ["fiscal", "financeiro", "estoque"],
  "imposto-apurado": ["financeiro", "obrigacoes", "reforma-tributaria"],
  "credito-ibs-adicionado": ["financeiro", "reforma-tributaria"],
  "guia-gerada": ["financeiro", "obrigacoes"],
  "obrigacao-vencida": ["financeiro", "floki"],
  "config-fiscal-alterada": ["fiscal", "financeiro", "reforma-tributaria"],
};

// Simulação de processamento em cada módulo
async function processarEmModulo(
  modulo: string,
  evento: EventoSync
): Promise<EtapaSincronizacao> {
  const tempo = Math.random() * 500 + 100;
  await new Promise((resolve) => setTimeout(resolve, tempo));

  const etapa: EtapaSincronizacao = {
    id: `ETAPA-${modulo}-${Date.now()}`,
    modulo,
    descricao: `Sincronizando ${evento.tipo} em ${modulo}`,
    status: "concluido",
    resultado: gerarResultado(modulo, evento),
    tempo: Math.round(tempo),
  };

  return etapa;
}

function gerarResultado(modulo: string, evento: EventoSync): Record<string, any> {
  const resultados: Record<string, any> = {
    fiscal: {
      nfGerada: true,
      serie: "1",
      numero: Math.floor(Math.random() * 10000) + 1000,
    },
    financeiro: {
      lancamentoGerado: true,
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      valor: evento.dados.valor || 1000,
    },
    estoque: {
      atualizacaoRealizada: true,
      saldoAnterior: 100,
      saldoNovo: 95,
    },
    "reforma-tributaria": {
      creditoCalculado: true,
      valorCredito: (evento.dados.valor || 1000) * 0.009,
    },
    obrigacoes: {
      obrigacaoCriada: true,
      tipo: evento.tipo === "nf-emitida" ? "sped-fiscal" : "ecf",
      vencimento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    floki: {
      alerta: true,
      mensagem: `Obrigação vencendo em breve`,
      prioridade: "alta",
    },
  };

  return resultados[modulo] || { sincronizado: true };
}

export const useSincronizacao = create<SincronizacaoState>((set, get) => ({
  config: configPadrao,
  eventos: [],
  cascatas: [],
  erros: [],

  setConfig: (cfg) => {
    set((state) => ({
      config: { ...state.config, ...cfg },
    }));
  },

  dispararEvento: async (tipo, origem, dados) => {
    const evento: EventoSync = {
      id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tipo,
      origem,
      destinos: get().mapearDestinos(tipo),
      dados,
      timestamp: new Date().toISOString(),
      status: "pendente",
    };

    set((state) => ({
      eventos: [...state.eventos, evento],
    }));

    // Processá-lo em cascata se automático
    if (get().config.automatica) {
      await get().processarCascata(evento);
    }

    return evento;
  },

  processarCascata: async (evento) => {
    const destinos = evento.destinos;
    const etapas: EtapaSincronizacao[] = [];

    // Marca o evento como processando
    set((state) => ({
      eventos: state.eventos.map((e) =>
        e.id === evento.id ? { ...e, status: "processando" } : e
      ),
    }));

    // Processa cada destino em sequência
    for (const modulo of destinos) {
      try {
        const etapa = await processarEmModulo(modulo, evento);
        etapas.push(etapa);
      } catch (erro) {
        const etapa: EtapaSincronizacao = {
          id: `ETAPA-${modulo}-${Date.now()}`,
          modulo,
          descricao: `Erro sincronizando ${evento.tipo} em ${modulo}`,
          status: "erro",
          erro: String(erro),
        };
        etapas.push(etapa);

        // Registra o erro
        set((state) => ({
          erros: [
            ...state.erros,
            {
              evento: evento.id,
              erro: String(erro),
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    }

    // Marca evento como completo
    const cascata: SincronizacaoCascata = {
      evento: { ...evento, status: "concluido" },
      etapas,
    };

    set((state) => ({
      cascatas: [...state.cascatas, cascata],
      eventos: state.eventos.map((e) =>
        e.id === evento.id ? { ...e, status: "concluido" } : e
      ),
    }));

    return cascata;
  },

  obterStatus: () => {
    const state = get();
    const processando = state.eventos.filter((e) => e.status === "processando").length;
    const erros = state.erros.length;
    const sucesso = state.cascatas.filter((c) =>
      c.etapas.every((e) => e.status === "concluido")
    ).length;

    return { processando, erros, sucesso };
  },

  listarErros: () => {
    return get().erros;
  },

  reprocessarEvento: async (eventoId) => {
    const evento = get().eventos.find((e) => e.id === eventoId);
    if (!evento) return false;

    await get().processarCascata(evento);
    return true;
  },

  mapearDestinos: (tipo) => {
    return MAPA_PROPAGACAO[tipo] || [];
  },
}));
