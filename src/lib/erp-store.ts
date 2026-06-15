import { useEffect, useState } from "react";

export type Cliente = {
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  tipo: string;
  status: string;
};

export type Fornecedor = {
  razao: string;
  fantasia?: string;
  cnpj: string;
  ie: string;
  cidade: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  telefone?: string;
  email?: string;
};

export type OrcamentoItem = { sku: string; qtd: number };

export type Orcamento = {
  id: string;
  criadoEm: string;
  clienteNome: string;
  condicao: string;
  items: OrcamentoItem[];
  total: number;
};

const KEYS = {
  clientes: "erp:clientes",
  fornecedores: "erp:fornecedores",
  orcamentos: "erp:orcamentos",
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
    const onStorage = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (detail?.key === key) setState(read<T>(key, initial));
    };
    window.addEventListener("erp:store", onStorage);
    return () => window.removeEventListener("erp:store", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = (next: T | ((prev: T) => T)) => {
    setState((prev) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, value);
      return value;
    });
  };
  return [state, update] as const;
}

export const clientesIniciais: Cliente[] = [
  { nome: "Acme Global Ltd.", documento: "12.345.678/0001-90", telefone: "(11) 4002-8922", email: "compras@acme.com", tipo: "Revendedor", status: "Ativo" },
  { nome: "Maria Silva", documento: "123.456.789-00", telefone: "(11) 99876-5432", email: "maria@email.com", tipo: "Consumidor Final", status: "Ativo" },
  { nome: "Northwind Trading", documento: "98.765.432/0001-10", telefone: "(21) 3030-4040", email: "ops@northwind.com", tipo: "Revendedor", status: "Ativo" },
  { nome: "João Pereira", documento: "987.654.321-00", telefone: "(31) 98765-1122", email: "joao.p@email.com", tipo: "Consumidor Final", status: "Ativo" },
];

export const fornecedoresIniciais: Fornecedor[] = [
  { razao: "Fornecedor Alpha S.A.", cnpj: "11.222.333/0001-44", ie: "123.456.789.110", cidade: "São Paulo / SP" },
  { razao: "Distribuidora Beta Ltda", cnpj: "22.333.444/0001-55", ie: "987.654.321.000", cidade: "Curitiba / PR" },
  { razao: "Logística Express ME", cnpj: "33.444.555/0001-66", ie: "ISENTO", cidade: "Belo Horizonte / MG" },
];

export function useClientes() {
  return usePersisted<Cliente[]>(KEYS.clientes, clientesIniciais);
}
export function useFornecedores() {
  return usePersisted<Fornecedor[]>(KEYS.fornecedores, fornecedoresIniciais);
}
export function useOrcamentos() {
  return usePersisted<Orcamento[]>(KEYS.orcamentos, []);
}