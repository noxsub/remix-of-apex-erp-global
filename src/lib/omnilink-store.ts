import { useEffect, useState } from "react";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type CanalTipo =
  | "mercadolivre"
  | "shopee"
  | "amazon"
  | "shopify"
  | "woocommerce"
  | "outro";

export type CanalVenda = {
  id: string;
  nome: string;
  tipo: CanalTipo;
  ativo: boolean;
  configuracoesJson: Record<string, string>; // apiKey, sellerId, webhookSecret...
  estoqueSegurancaPct: number; // 0–100
  prazoRecebimentoDias: number;
  taxaComissaoPadrao: number; // %
  taxaGatewayPadrao: number; // %
  taxaFretePadrao: number; // % do bruto (média)
};

export type AnuncioMarketplace = {
  id: string;
  canalId: string;
  itemFiscalId?: string;
  skuExterno: string;
  tituloExterno: string;
  precoExterno: number;
  estoqueExposto: number;
  status: "ativo" | "pausado" | "erro";
  variacao?: string;
};

export type PedidoItem = { itemFiscalId: string; sku: string; nome: string; qtd: number; precoUnit: number };

export type LancamentoComposto = {
  tipo: "bruto" | "comissao" | "frete" | "pagamento" | "imposto" | "cmv" | "liquido";
  descricao: string;
  valor: number; // positivo receita, negativo despesa
};

export type PedidoMarketplace = {
  id: string;
  canalId: string;
  numeroExterno: string;
  data: string;
  clienteNome: string;
  itens: PedidoItem[];
  valorBruto: number;
  taxaComissao: number;
  taxaFrete: number;
  taxaPagamento: number;
  valorLiquido: number;
  cmv: number;
  imposto: number;
  status: "novo" | "faturado" | "expedido" | "entregue" | "cancelado";
  codigoRastreio?: string;
  etiquetaUrl?: string;
  nfNumero?: string;
  dataPrevistaRecebimento?: string;
  lancamentos: LancamentoComposto[];
  metadata: {
    origemCanalId: string;
    meioPagamentoId: string;
    pedidoOrigemId: string;
  };
};

export type FilaSincronizacao = {
  id: string;
  tipo: "estoque" | "preco" | "anuncio" | "rastreio";
  canalId: string;
  payload: Record<string, unknown>;
  status: "pendente" | "processando" | "ok" | "erro";
  tentativas: number;
  criadoEm: string;
  ultimoErro?: string;
};

// ─── Persistência ───────────────────────────────────────────────────────────

const KEYS = {
  canais: "erp:omni:canais",
  anuncios: "erp:omni:anuncios",
  pedidos: "erp:omni:pedidos",
  fila: "erp:omni:fila",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("erp:store", { detail: { key } }));
}

function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => read<T>(key, initial));
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === key) setState(read<T>(key, initial));
    };
    window.addEventListener("erp:store", on);
    return () => window.removeEventListener("erp:store", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = (next: T | ((prev: T) => T)) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, v);
      return v;
    });
  };
  return [state, update] as const;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export const canaisIniciais: CanalVenda[] = [
  {
    id: "canal-ml",
    nome: "Mercado Livre",
    tipo: "mercadolivre",
    ativo: true,
    configuracoesJson: { sellerId: "DEMO", appId: "DEMO" },
    estoqueSegurancaPct: 5,
    prazoRecebimentoDias: 14,
    taxaComissaoPadrao: 14,
    taxaGatewayPadrao: 0,
    taxaFretePadrao: 4,
  },
  {
    id: "canal-shopee",
    nome: "Shopee",
    tipo: "shopee",
    ativo: true,
    configuracoesJson: { shopId: "DEMO" },
    estoqueSegurancaPct: 10,
    prazoRecebimentoDias: 7,
    taxaComissaoPadrao: 20,
    taxaGatewayPadrao: 0,
    taxaFretePadrao: 6,
  },
  {
    id: "canal-amz",
    nome: "Amazon",
    tipo: "amazon",
    ativo: false,
    configuracoesJson: {},
    estoqueSegurancaPct: 5,
    prazoRecebimentoDias: 21,
    taxaComissaoPadrao: 15,
    taxaGatewayPadrao: 0,
    taxaFretePadrao: 3,
  },
];

export function useCanais() {
  return usePersisted<CanalVenda[]>(KEYS.canais, canaisIniciais);
}
export function useAnuncios() {
  return usePersisted<AnuncioMarketplace[]>(KEYS.anuncios, []);
}
export function usePedidosMarketplace() {
  return usePersisted<PedidoMarketplace[]>(KEYS.pedidos, []);
}
export function useFilaSync() {
  return usePersisted<FilaSincronizacao[]>(KEYS.fila, []);
}

// ─── Helpers de domínio ─────────────────────────────────────────────────────

export function enfileirar(evento: Omit<FilaSincronizacao, "id" | "criadoEm" | "tentativas" | "status">) {
  const atual = read<FilaSincronizacao[]>(KEYS.fila, []);
  const novo: FilaSincronizacao = {
    ...evento,
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    criadoEm: new Date().toISOString(),
    tentativas: 0,
    status: "pendente",
  };
  write(KEYS.fila, [novo, ...atual]);
  return novo;
}

export function calcularLancamentosCompostos(pedido: Omit<PedidoMarketplace, "lancamentos" | "metadata" | "id">): LancamentoComposto[] {
  return [
    { tipo: "bruto", descricao: "Valor bruto da venda", valor: pedido.valorBruto },
    { tipo: "comissao", descricao: "Comissão da plataforma", valor: -pedido.taxaComissao },
    { tipo: "frete", descricao: "Frete / envio", valor: -pedido.taxaFrete },
    { tipo: "pagamento", descricao: "Meio de pagamento", valor: -pedido.taxaPagamento },
    { tipo: "imposto", descricao: "Tributos sobre venda", valor: -pedido.imposto },
    { tipo: "cmv", descricao: "Custo da mercadoria (CMV)", valor: -pedido.cmv },
    { tipo: "liquido", descricao: "Margem líquida", valor: pedido.valorLiquido - pedido.cmv - pedido.imposto },
  ];
}
