import { useEffect, useState } from "react";

export type ItemEntrada = {
  sku: string;
  descricao: string;
  ncm?: string;
  cfop: string;
  cst?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  baseIcms?: number;
  icms?: number;
  ipi?: number;
  pis?: number;
  cofins?: number;
};

export type NotaEntrada = {
  id: string;
  numero: string; // ex.: 000123
  serie: string;
  modelo: "55" | "65";
  chave?: string;
  fornecedorCnpj: string;
  fornecedorRazao: string;
  dataEmissao: string;
  dataEntrada: string;
  natureza: string;
  cfopPrincipal: string;
  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  valorIcms: number;
  valorIpi: number;
  valorPis: number;
  valorCofins: number;
  valorTotal: number;
  status: "Lançada" | "Pendente" | "Cancelada";
  origem: "Manual" | "XML" | "Importação";
  itens: ItemEntrada[];
};

const KEY = "erp:entradas:notas";

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

const seed: NotaEntrada[] = [
  {
    id: "ne-0001",
    numero: "000458",
    serie: "1",
    modelo: "55",
    chave: "35240611222333000144550010000004581234567890",
    fornecedorCnpj: "11.222.333/0001-44",
    fornecedorRazao: "Fornecedor Alpha S.A.",
    dataEmissao: "2026-06-05",
    dataEntrada: "2026-06-08",
    natureza: "Compra para revenda",
    cfopPrincipal: "1102",
    valorProdutos: 48200,
    valorFrete: 320,
    valorDesconto: 0,
    valorIcms: 8676,
    valorIpi: 0,
    valorPis: 795,
    valorCofins: 3661,
    valorTotal: 48520,
    status: "Lançada",
    origem: "XML",
    itens: [
      {
        sku: "SKU-10042",
        descricao: 'Notebook Pro 14" M3',
        ncm: "84713012",
        cfop: "1102",
        cst: "00",
        unidade: "un",
        quantidade: 10,
        valorUnitario: 4820,
        valorTotal: 48200,
        baseIcms: 48200,
        icms: 8676,
        pis: 795,
        cofins: 3661,
      },
    ],
  },
  {
    id: "ne-0002",
    numero: "000122",
    serie: "1",
    modelo: "55",
    fornecedorCnpj: "22.333.444/0001-55",
    fornecedorRazao: "Distribuidora Beta Ltda",
    dataEmissao: "2026-06-03",
    dataEntrada: "2026-06-04",
    natureza: "Compra para revenda",
    cfopPrincipal: "2102",
    valorProdutos: 10900,
    valorFrete: 0,
    valorDesconto: 100,
    valorIcms: 1308,
    valorIpi: 0,
    valorPis: 178,
    valorCofins: 820,
    valorTotal: 10800,
    status: "Lançada",
    origem: "XML",
    itens: [
      {
        sku: "SKU-10043",
        descricao: 'Monitor UltraWide 34"',
        ncm: "85285200",
        cfop: "2102",
        cst: "00",
        unidade: "un",
        quantidade: 5,
        valorUnitario: 2180,
        valorTotal: 10900,
        baseIcms: 10900,
        icms: 1308,
        pis: 178,
        cofins: 820,
      },
    ],
  },
];

export function useNotasEntrada() {
  const [state, setState] = useState<NotaEntrada[]>(() => read(KEY, seed));
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read(KEY, seed));
    };
    window.addEventListener("erp:store", h);
    return () => window.removeEventListener("erp:store", h);
  }, []);
  const update = (next: NotaEntrada[] | ((p: NotaEntrada[]) => NotaEntrada[])) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: NotaEntrada[]) => NotaEntrada[])(prev) : next;
      write(KEY, v);
      return v;
    });
  };
  return [state, update] as const;
}
