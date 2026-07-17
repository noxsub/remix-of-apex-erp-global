import type { FlokiActivity } from "../floki-activity";
import type { ModuleHealth } from "./type.ts";

const atividadesFinanceirasSimuladas: FlokiActivity[] = [
  {
    id: "financeiro-titulos-vencidos",
    area: "FINANCEIRO",
    priority: "ALTA",
    title: "Títulos vencidos exigem atenção",
    summary:
      "Existem recebimentos vencidos que podem impactar o fluxo de caixa.",
    recommendation:
      "Comece pelos clientes com maior valor vencido e histórico de atraso recorrente.",
    route: "/financeiro/receber",
    actionLabel: "Abrir Contas a Receber",
    metrics: [
      {
        label: "Títulos vencidos",
        value: "8",
        detail: "Pendências em aberto",
      },
      {
        label: "Valor total",
        value: "R$ 487 mil",
        detail: "Montante vencido",
      },
      {
        label: "Maior atraso",
        value: "27 dias",
        detail: "Título mais antigo",
      },
    ],
    items: [
      {
        title: "Cliente Horizonte",
        description: "Título vencido há 27 dias",
        primaryValue: "R$ 164.800",
        secondaryValue: "Prioridade crítica",
      },
      {
        title: "Grupo Vale Norte",
        description: "Título vencido há 18 dias",
        primaryValue: "R$ 121.350",
        secondaryValue: "Cobrança recomendada",
      },
      {
        title: "Comercial Atlântico",
        description: "Título vencido há 11 dias",
        primaryValue: "R$ 86.900",
        secondaryValue: "Acompanhar retorno",
      },
    ],
  },

  {
    id: "financeiro-conciliacao-pendente",
    area: "FINANCEIRO",
    priority: "MEDIA",
    title: "Conciliações bancárias pendentes",
    summary:
      "Algumas movimentações ainda não foram conciliadas com os extratos bancários.",
    recommendation:
      "Concilie primeiro as movimentações de maior valor e os lançamentos sem identificação.",
    route: "/financeiro/conciliacao",
    actionLabel: "Abrir Conciliação",
    metrics: [
      {
        label: "Pendências",
        value: "14",
        detail: "Movimentações sem conciliação",
      },
      {
        label: "Valor analisado",
        value: "R$ 193 mil",
        detail: "Total aguardando validação",
      },
      {
        label: "Contas bancárias",
        value: "3",
        detail: "Bancos com pendências",
      },
    ],
    items: [
      {
        title: "Banco Principal",
        description: "7 movimentações aguardando conciliação",
        primaryValue: "R$ 98.400",
        secondaryValue: "Maior impacto",
      },
      {
        title: "Banco Secundário",
        description: "4 movimentações aguardando conciliação",
        primaryValue: "R$ 61.200",
        secondaryValue: "Revisar identificação",
      },
      {
        title: "Conta de Recebimentos",
        description: "3 movimentações aguardando conciliação",
        primaryValue: "R$ 33.700",
        secondaryValue: "Baixa complexidade",
      },
    ],
  },
];

export function obterSaudeFinanceiro(): ModuleHealth {
  return {
    module: "Financeiro",
    score: 72,
    status: "ATENCAO",
    critical: 1,
    warning: 1,
    info: 0,
    activities: atividadesFinanceirasSimuladas,
  };
}