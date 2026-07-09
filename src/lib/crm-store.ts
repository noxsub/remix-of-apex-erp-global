import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   ENGENHARIA DE VENDAS (CRM interno)
   O time comercial cota itens de fornecedores e propõe preços a
   clientes, associando tudo a um NÚMERO DE PROJETO. Quando a
   cotação é marcada como GANHA, uma cascata automática roda:

     1. Cria o Centro de Custo do projeto (centro-custo-store)
     2. Pré-cadastra o cliente em Cadastros, se ainda não existir (erp-store)
     3. Pré-cadastra o(s) fornecedor(es) cotado(s), se ainda não existirem (erp-store)
     4. Pré-cadastra o(s) item(ns) cotados no cadastro fiscal, com o
        preço negociado já configurado (fiscal-store)

   Depois disso, ao lançar uma NF (entrada ou saída) e digitar/
   selecionar o Centro de Custo do projeto, tudo já está pronto —
   é essa a "amarração" pedida.
   ═══════════════════════════════════════════════════════════════ */

export type ItemCotado = {
  codigo: string;
  descricao: string;
  ncm?: string;
  unidade: string;
  quantidade: number;
  precoFornecedor: number; // custo cotado com o fornecedor
  precoVenda: number; // preço proposto ao cliente
  fornecedorNome?: string;
};

/** Etapa é uma string livre (id de EtapaCrm), exceto "ganho"/"perdido" que são reservadas e disparam lógica de negócio. */
export type StatusCotacao = string;

export type Cotacao = {
  id: string;
  numeroProjeto: string;
  titulo: string;
  clienteNome: string;
  clienteDocumento?: string;
  vendedorResponsavel: string;
  itens: ItemCotado[];
  status: StatusCotacao;
  criadoEm: string;
  observacoes?: string;
  centroCustoGeradoId?: string; // preenchido após ganhar
};

const KEY = "erp:crm:cotacoes";

function read<T>(k: string, f: T): T {
  if (typeof window === "undefined") return f;
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : f;
  } catch {
    return f;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("erp:store", { detail: { key: k } }));
}

export const cotacoesIniciais: Cotacao[] = [
  {
    id: "cot-001",
    numeroProjeto: "PRJ-2026-014",
    titulo: "Fornecimento de equipamentos — Obra Sabesp Etapa 2",
    clienteNome: "Sabesp",
    clienteDocumento: "43.776.517/0001-80",
    vendedorResponsavel: "João Silva",
    status: "negociacao",
    criadoEm: "28/06/2026",
    observacoes: "Cliente pediu revisão de prazo de entrega dos itens 2 e 3.",
    itens: [
      {
        codigo: "BOMBA-HD-500",
        descricao: "Bomba hidráulica de alta pressão 500L",
        ncm: "8413.60.19",
        unidade: "UN",
        quantidade: 4,
        precoFornecedor: 8200,
        precoVenda: 12800,
        fornecedorNome: "BRDrilling Equipamentos Ltda",
      },
      {
        codigo: "VALV-INOX-6",
        descricao: "Válvula industrial inox 6 polegadas",
        ncm: "8481.80.99",
        unidade: "UN",
        quantidade: 10,
        precoFornecedor: 1450,
        precoVenda: 2190,
        fornecedorNome: "BRDrilling Equipamentos Ltda",
      },
    ],
  },
  {
    id: "cot-002",
    numeroProjeto: "PRJ-2026-015",
    titulo: "Manutenção preventiva — Frota Norte",
    clienteNome: "Transportadora Rápida SA",
    vendedorResponsavel: "Maria Santos",
    status: "proposta",
    criadoEm: "30/06/2026",
    itens: [
      {
        codigo: "KIT-MANUT-CAM",
        descricao: "Kit de manutenção preventiva — caminhão pesado",
        unidade: "UN",
        quantidade: 8,
        precoFornecedor: 890,
        precoVenda: 1350,
        fornecedorNome: "AutoPeças Industrial Ltda",
      },
    ],
  },
];

export function useCotacoes() {
  const [state, setState] = useState<Cotacao[]>(() => read(KEY, cotacoesIniciais));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read<Cotacao[]>(KEY, cotacoesIniciais));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
  }, []);
  const update = (next: Cotacao[] | ((prev: Cotacao[]) => Cotacao[])) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: Cotacao[]) => Cotacao[])(prev) : next;
      write(KEY, v);
      return v;
    });
  };
  return [state, update] as const;
}

export function proximoNumeroProjeto(lista: Cotacao[]): string {
  const ano = new Date().getFullYear();
  const nums = lista
    .map((c) => c.numeroProjeto.match(new RegExp(`^PRJ-${ano}-(\\d+)$`)))
    .filter(Boolean)
    .map((m) => Number(m![1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PRJ-${ano}-${String(next).padStart(3, "0")}`;
}

export function valorTotalCotacao(c: Cotacao): number {
  return c.itens.reduce((s, i) => s + i.quantidade * i.precoVenda, 0);
}
export function custoTotalCotacao(c: Cotacao): number {
  return c.itens.reduce((s, i) => s + i.quantidade * i.precoFornecedor, 0);
}
