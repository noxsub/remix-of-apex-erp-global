import { create } from "zustand";

/**
 * FLOKI — Assistente IA do Sintera ERP
 * 
 * Floki é o assistente de IA que:
 * - Guia o usuário pela plataforma
 * - Sugere ações baseadas em contexto
 * - Analisa dados e fornece insights
 * - Automatiza tarefas repetitivas
 * - Alerta sobre pontos críticos
 */

export type FlokiTone = "formal" | "casual" | "consultivo";
export type AlertType = "info" | "warning" | "critical" | "success";

export interface FlokiMessage {
  id: string;
  tipo: "assistente" | "usuario";
  conteudo: string;
  timestamp: string;
  contexto?: {
    rota?: string;
    modulo?: string;
    periodo?: string;
  };
  sugestoes?: FlokiSuggestao[];
}

export interface FlokiSuggestao {
  id: string;
  titulo: string;
  descricao: string;
  acao: string;
  prioridade: "baixa" | "media" | "alta";
  icone?: string;
}

export interface FlokiAlert {
  id: string;
  tipo: AlertType;
  titulo: string;
  mensagem: string;
  modulo: string;
  acao?: {
    titulo: string;
    url: string;
  };
  timestamp: string;
  lido: boolean;
}

export interface FlokiInsight {
  id: string;
  titulo: string;
  descricao: string;
  metrica: number;
  tendencia: "up" | "down" | "stable";
  recomendacao: string;
  modulo: string;
}

export interface ConfigFloki {
  tone: FlokiTone;
  nivelDetalhe: "conciso" | "normal" | "detalhado";
  sugestoesAutomaticas: boolean;
  alertasAtivos: boolean;
  idioma: "pt-BR" | "en-US" | "es";
}

export interface FlokiState {
  config: ConfigFloki;
  mensagens: FlokiMessage[];
  alerts: FlokiAlert[];
  insights: FlokiInsight[];
  contextoAtual: {
    rota?: string;
    modulo?: string;
    usuario?: string;
  };
  
  // Métodos
  setConfig: (cfg: Partial<ConfigFloki>) => void;
  enviarMensagem: (msg: string, contexto?: FlokiMessage["contexto"]) => Promise<void>;
  adicionarAlert: (alert: Omit<FlokiAlert, "id" | "timestamp" | "lido">) => void;
  removerAlert: (id: string) => void;
  marcarAlertLido: (id: string) => void;
  obterSugestoes: (contexto: any) => FlokiSuggestao[];
  atualizarContexto: (ctx: any) => void;
  gerarInsight: (modulo: string, dados: any) => FlokiInsight | null;
  obterAlertsNaoLidos: () => FlokiAlert[];
}

const configPadrao: ConfigFloki = {
  tone: "consultivo",
  nivelDetalhe: "normal",
  sugestoesAutomaticas: true,
  alertasAtivos: true,
  idioma: "pt-BR",
};

export const useFloki = create<FlokiState>((set, get) => ({
  config: configPadrao,
  mensagens: [
    {
      id: "floki-init",
      tipo: "assistente",
      conteudo:
        "Olá! Sou Floki, seu assistente no Sintera ERP. Estou aqui para guiá-lo na melhor experiência possível. Como posso ajudar?",
      timestamp: new Date().toISOString(),
      sugestoes: [
        {
          id: "sugg-1",
          titulo: "Iniciar Cadastro",
          descricao: "Configure sua empresa e regime tributário",
          acao: "/fiscal",
          prioridade: "alta",
          icone: "Building2",
        },
        {
          id: "sugg-2",
          titulo: "Entender Reforma Tributária",
          descricao: "Saiba como IBS/CBS impactará seu negócio",
          acao: "/reforma-tributaria",
          prioridade: "media",
          icone: "TrendingUp",
        },
        {
          id: "sugg-3",
          titulo: "Ver Dashboard",
          descricao: "Análise consolidada do seu negócio",
          acao: "/",
          prioridade: "media",
          icone: "LayoutGrid",
        },
      ],
    },
  ],
  alerts: [],
  insights: [],
  contextoAtual: {},

  setConfig: (cfg) => {
    set((state) => ({
      config: { ...state.config, ...cfg },
    }));
  },

  enviarMensagem: async (msg, contexto) => {
    const userMsg: FlokiMessage = {
      id: `msg-${Date.now()}`,
      tipo: "usuario",
      conteudo: msg,
      timestamp: new Date().toISOString(),
      contexto,
    };

    set((state) => ({
      mensagens: [...state.mensagens, userMsg],
    }));

    // Simular resposta de Floki (em produção, chamaria Claude/API)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const respostas: Record<string, string> = {
      reforma: "A reforma tributária (IBS/CBS) entrará em vigor em 2026 com alíquota de 0,9%. Posso ajudá-lo com a estrutura de créditos?",
      obrigacoes:
        "Você tem 5 obrigações vencidas e 12 próximas de vencer. Quer que eu gere os arquivos para envio ao fisco?",
      fluxocaixa:
        "Seu fluxo de caixa está equilibrado para este mês, mas há picos de pagamento no próximo período. Recomendo criar uma reserva.",
      default:
        "Entendi sua pergunta. Posso ajudá-lo com análise de dados, geração de relatórios ou automação de tarefas. O que você gostaria de fazer?",
    };

    const resposta = Object.keys(respostas).find((k) => msg.toLowerCase().includes(k))
      ? respostas[Object.keys(respostas).find((k) => msg.toLowerCase().includes(k))!]
      : respostas.default;

    const assistantMsg: FlokiMessage = {
      id: `msg-${Date.now() + 1}`,
      tipo: "assistente",
      conteudo: resposta,
      timestamp: new Date().toISOString(),
      contexto,
    };

    set((state) => ({
      mensagens: [...state.mensagens, assistantMsg],
    }));
  },

  adicionarAlert: (alert) => {
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          ...alert,
          id: `ALT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          lido: false,
        },
      ],
    }));
  },

  removerAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    }));
  },

  marcarAlertLido: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, lido: true } : a)),
    }));
  },

  obterSugestoes: (contexto) => {
    const sugestoes: FlokiSuggestao[] = [];

    if (contexto.modulo === "fiscal" && !contexto.empresaConfigured) {
      sugestoes.push({
        id: "sugg-empresa",
        titulo: "Completar Cadastro da Empresa",
        descricao: "Configure regime, CNAEs e dados tributários",
        acao: "/fiscal?tab=empresa",
        prioridade: "alta",
        icone: "Building2",
      });
    }

    if (contexto.modulo === "financeiro" && contexto.acertosPendentes > 0) {
      sugestoes.push({
        id: "sugg-acertos",
        titulo: "Resolver Divergências",
        descricao: `Você tem ${contexto.acertosPendentes} divergências para revisar`,
        acao: "/financeiro?filter=divergentes",
        prioridade: "alta",
        icone: "AlertTriangle",
      });
    }

    if (!contexto.reformaTributariaEntendida) {
      sugestoes.push({
        id: "sugg-reforma",
        titulo: "Entender Impacto de IBS/CBS",
        descricao: "Veja como a reforma tributária afeta seu fluxo de caixa",
        acao: "/reforma-tributaria",
        prioridade: "media",
        icone: "TrendingUp",
      });
    }

    return sugestoes;
  },

  atualizarContexto: (ctx) => {
    set((state) => ({
      contextoAtual: { ...state.contextoAtual, ...ctx },
    }));
  },

  gerarInsight: (modulo, dados) => {
    let insight: FlokiInsight | null = null;

    if (modulo === "financeiro" && dados.fluxoCaixa) {
      const variacao =
        ((dados.fluxoCaixa.atual - dados.fluxoCaixa.anterior) / dados.fluxoCaixa.anterior) * 100;
      insight = {
        id: `INS-${Date.now()}`,
        titulo: "Tendência de Fluxo de Caixa",
        descricao: `Fluxo de caixa variou ${variacao > 0 ? "+" : ""}${variacao.toFixed(1)}% em relação ao período anterior`,
        metrica: variacao,
        tendencia: variacao > 5 ? "up" : variacao < -5 ? "down" : "stable",
        recomendacao:
          variacao < -10
            ? "Considere renegociar prazos com fornecedores"
            : "Mantenha a política atual de crédito",
        modulo,
      };
    }

    if (modulo === "fiscal" && dados.impostosDev) {
      const aliquotaMedia = dados.impostosDev.total / dados.impostosDev.base;
      insight = {
        id: `INS-${Date.now()}`,
        titulo: "Alíquota Média de Impostos",
        descricao: `Alíquota efetiva atual: ${(aliquotaMedia * 100).toFixed(2)}%`,
        metrica: aliquotaMedia * 100,
        tendencia: aliquotaMedia > 0.35 ? "up" : "stable",
        recomendacao:
          aliquotaMedia > 0.35
            ? "Analise oportunidades de planejamento tributário"
            : "Alíquota dentro dos patamares esperados",
        modulo,
      };
    }

    if (insight) {
      set((state) => ({
        insights: [...state.insights, insight as FlokiInsight],
      }));
    }

    return insight;
  },

  obterAlertsNaoLidos: () => {
    return get().alerts.filter((a) => !a.lido);
  },
}));
