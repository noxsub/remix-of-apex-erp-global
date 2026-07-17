export type FlokiActivityArea =
  | "FINANCEIRO"
  | "RH"
  | "COMPRAS"
  | "ESTOQUE"
  | "FISCAL"
  | "COMERCIAL"
  | "GESTAO";

export type FlokiActivityPriority =
  | "BAIXA"
  | "MEDIA"
  | "ALTA"
  | "CRITICA";

export type FlokiActivityMetric = {
  label: string;
  value: string;
  detail: string;
};

export type FlokiActivityItem = {
  title: string;
  description: string;
  primaryValue?: string;
  secondaryValue?: string;
};

export type FlokiActivity = {
  id: string;
  area: FlokiActivityArea;
  priority: FlokiActivityPriority;
  title: string;
  summary: string;
  recommendation: string;
  route: string;
  actionLabel: string;
  metrics: FlokiActivityMetric[];
  items: FlokiActivityItem[];
};