import type { FlokiActivity } from "./floki-activity";

export const flokiActivitiesMock: FlokiActivity[] = [
  {
    id: "financeiro-titulos-vencidos",
    area: "FINANCEIRO",
    priority: "ALTA",
    title: "Existem 8 títulos vencidos sem tratativa.",
    summary:
      "Há clientes com valores em atraso que ainda não possuem cobrança, observação ou promessa de pagamento registrada.",
    recommendation:
      "Comece pelos títulos de maior valor e pelos clientes com histórico recorrente de atraso.",
    route: "/financeiro",
    actionLabel: "Abrir Contas a Receber",
    metrics: [
      {
        label: "Títulos",
        value: "8",
        detail: "sem tratativa",
      },
      {
        label: "Valor total",
        value: "R$ 42.780",
        detail: "em atraso",
      },
      {
        label: "Maior atraso",
        value: "19 dias",
        detail: "cliente prioritário",
      },
    ],
    items: [
      {
        title: "Cliente Horizonte Ltda.",
        description: "Título sem registro de cobrança",
        primaryValue: "R$ 14.250",
        secondaryValue: "19 dias de atraso",
      },
      {
        title: "Grupo Atlântico Serviços",
        description: "Título sem registro de cobrança",
        primaryValue: "R$ 9.880",
        secondaryValue: "11 dias de atraso",
      },
      {
        title: "Comercial Nova Era",
        description: "Título sem registro de cobrança",
        primaryValue: "R$ 7.400",
        secondaryValue: "8 dias de atraso",
      },
    ],
  },
  {
    id: "rh-ferias-pendentes",
    area: "RH",
    priority: "MEDIA",
    title: "Existem 3 solicitações de férias aguardando análise.",
    summary:
      "As solicitações precisam ser revisadas para evitar conflito com o planejamento das equipes.",
    recommendation:
      "Analise primeiro os colaboradores com férias previstas para os próximos 30 dias.",
    route: "/rh",
    actionLabel: "Abrir solicitações de férias",
    metrics: [
      {
        label: "Solicitações",
        value: "3",
        detail: "aguardando análise",
      },
      {
        label: "Mais próxima",
        value: "18 dias",
        detail: "até o início",
      },
      {
        label: "Áreas afetadas",
        value: "2",
        detail: "departamentos",
      },
    ],
    items: [
      {
        title: "Juliana Martins",
        description: "Financeiro",
        primaryValue: "15 dias",
        secondaryValue: "início em 18 dias",
      },
      {
        title: "Carlos Souza",
        description: "Comercial",
        primaryValue: "20 dias",
        secondaryValue: "início em 26 dias",
      },
      {
        title: "Patrícia Lima",
        description: "Comercial",
        primaryValue: "10 dias",
        secondaryValue: "início em 29 dias",
      },
    ],
  },
  {
    id: "estoque-itens-criticos",
    area: "ESTOQUE",
    priority: "CRITICA",
    title: "Três produtos podem atingir estoque crítico.",
    summary:
      "A projeção considera o saldo atual e o ritmo recente de saída dos produtos.",
    recommendation:
      "Revise os pedidos em aberto e avalie uma reposição antes do próximo ciclo de vendas.",
    route: "/estoque",
    actionLabel: "Abrir análise de estoque",
    metrics: [
      {
        label: "Produtos",
        value: "3",
        detail: "em risco",
      },
      {
        label: "Mais urgente",
        value: "2 dias",
        detail: "até ruptura",
      },
      {
        label: "Valor estimado",
        value: "R$ 18.600",
        detail: "para reposição",
      },
    ],
    items: [
      {
        title: "Produto Alfa",
        description: "Saldo atual: 12 unidades",
        primaryValue: "2 dias",
        secondaryValue: "até ruptura",
      },
      {
        title: "Produto Beta",
        description: "Saldo atual: 19 unidades",
        primaryValue: "4 dias",
        secondaryValue: "até ruptura",
      },
      {
        title: "Produto Gama",
        description: "Saldo atual: 25 unidades",
        primaryValue: "6 dias",
        secondaryValue: "até ruptura",
      },
    ],
  },
];