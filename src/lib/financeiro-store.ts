import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   FINANCEIRO — store compartilhado (Contas a Pagar / Receber)
   Segue o mesmo padrão usePersisted de erp-store.ts e fiscal-store.ts.

   Este store existe para fechar o ciclo Compra → Venda → Financeiro:
   - Entradas (compras) grava aqui via useContasPagar()
   - Saídas (faturamento) grava aqui via useContasReceber()
   - RH (folha) grava aqui via useContasPagar()
   - Financeiro lê e escreve os mesmos dados (baixa de título, etc.)
   ═══════════════════════════════════════════════════════════════ */

export type CategoriaPagar = "fornecedores" | "impostos" | "folha" | "encargos" | "utilidades" | "outros";
export type FormaPgtoPagar = "boleto" | "pix" | "ted" | "debito" | "darf" | "gps";
export type StatusTitulo = "aberto" | "vencido" | "pago" | "recebido" | "parcial" | "cancelado";

export type TituloPagar = {
  id: string;
  documento: string;
  fornecedor: string;
  categoria: CategoriaPagar;
  emissao: string;
  vencimento: string;
  valor: number;
  juros: number;
  multa: number;
  totalPagar: number;
  formaPgto: FormaPgtoPagar;
  centroCusto?: string;
  status: StatusTitulo;
  origemAuto?: string;
};

export type FormaPgtoReceber = "boleto" | "pix" | "ted" | "cartao" | "cheque";

export type TituloReceber = {
  id: string;
  documento: string;
  cliente: string;
  emissao: string;
  vencimento: string;
  valor: number;
  juros: number;
  multa: number;
  totalReceber: number;
  formaPgto: FormaPgtoReceber;
  centroCusto?: string;
  status: StatusTitulo;
  origemAuto?: string;
};

const KEYS = {
  pagar: "erp:financeiro:pagar",
  receber: "erp:financeiro:receber",
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
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === key) setState(read<T>(key, initial));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
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

export const titulosPagarIniciais: TituloPagar[] = [
  { id: "CP-001", documento: "NF 45210", fornecedor: "BRDrilling Equipamentos", categoria: "fornecedores", emissao: "25/06/2026", vencimento: "25/07/2026", valor: 120000, juros: 0, multa: 0, totalPagar: 120000, formaPgto: "boleto", centroCusto: "Operações", status: "aberto", origemAuto: "Entrada NF" },
  { id: "CP-002", documento: "INSS-RET Jun/26", fornecedor: "Receita Federal", categoria: "impostos", emissao: "30/06/2026", vencimento: "20/07/2026", valor: 8450, juros: 0, multa: 0, totalPagar: 8450, formaPgto: "darf", centroCusto: "Fiscal", status: "aberto", origemAuto: "Retenção NFS-e" },
  { id: "CP-003", documento: "CSRF Jun/26", fornecedor: "Receita Federal", categoria: "impostos", emissao: "30/06/2026", vencimento: "20/07/2026", valor: 4230, juros: 0, multa: 0, totalPagar: 4230, formaPgto: "darf", centroCusto: "Fiscal", status: "aberto", origemAuto: "Retenção NFS-e" },
  { id: "CP-004", documento: "GPS Jun/26", fornecedor: "INSS", categoria: "encargos", emissao: "30/06/2026", vencimento: "20/07/2026", valor: 15800, juros: 0, multa: 0, totalPagar: 15800, formaPgto: "gps", centroCusto: "RH", status: "aberto", origemAuto: "Folha de Pagamento" },
  { id: "CP-005", documento: "FGTS Jun/26", fornecedor: "Caixa Econômica", categoria: "encargos", emissao: "30/06/2026", vencimento: "07/07/2026", valor: 5280, juros: 0, multa: 0, totalPagar: 5280, formaPgto: "ted", centroCusto: "RH", status: "aberto", origemAuto: "Folha de Pagamento" },
  { id: "CP-006", documento: "Folha Jun/26", fornecedor: "Funcionários", categoria: "folha", emissao: "30/06/2026", vencimento: "05/07/2026", valor: 21140, juros: 0, multa: 0, totalPagar: 21140, formaPgto: "ted", centroCusto: "RH", status: "aberto", origemAuto: "Folha de Pagamento" },
  { id: "CP-007", documento: "Fatura Energia", fornecedor: "CPFL Energia", categoria: "utilidades", emissao: "10/06/2026", vencimento: "10/07/2026", valor: 7000, juros: 0, multa: 0, totalPagar: 7000, formaPgto: "boleto", centroCusto: "Administrativo", status: "aberto" },
  { id: "CP-008", documento: "NF 45190", fornecedor: "Fornecedor ABC", categoria: "fornecedores", emissao: "01/06/2026", vencimento: "01/07/2026", valor: 12000, juros: 0, multa: 0, totalPagar: 12000, formaPgto: "boleto", centroCusto: "Operações", status: "aberto", origemAuto: "Entrada NF" },
  { id: "CP-009", documento: "ISS-RET Jun/26", fornecedor: "Prefeitura", categoria: "impostos", emissao: "30/06/2026", vencimento: "15/07/2026", valor: 2100, juros: 0, multa: 0, totalPagar: 2100, formaPgto: "darf", centroCusto: "Fiscal", status: "aberto", origemAuto: "Retenção NFS-e" },
];

export const titulosReceberIniciais: TituloReceber[] = [
  { id: "CR-001", documento: "NF 000184", cliente: "Acme Global Ltd.", emissao: "26/06/2026", vencimento: "26/07/2026", valor: 18420, juros: 0, multa: 0, totalReceber: 18420, formaPgto: "boleto", centroCusto: "Comercial", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-002", documento: "NF 000183", cliente: "Northwind Trading", emissao: "25/06/2026", vencimento: "25/07/2026", valor: 9890.5, juros: 0, multa: 0, totalReceber: 9890.5, formaPgto: "pix", centroCusto: "Comercial", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-003", documento: "NF 000181", cliente: "Contoso Ltd.", emissao: "23/06/2026", vencimento: "23/07/2026", valor: 27800, juros: 0, multa: 0, totalReceber: 27800, formaPgto: "boleto", centroCusto: "Projetos", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-004", documento: "NF 000170", cliente: "Initech LLC", emissao: "10/06/2026", vencimento: "10/07/2026", valor: 15150, juros: 0, multa: 0, totalReceber: 15150, formaPgto: "ted", centroCusto: "Projetos", status: "aberto", origemAuto: "Faturamento NF" },
  { id: "CR-005", documento: "NF 000160", cliente: "Sabesp", emissao: "01/06/2026", vencimento: "01/07/2026", valor: 45000, juros: 495, multa: 900, totalReceber: 46395, formaPgto: "ted", centroCusto: "Projetos", status: "vencido", origemAuto: "Medição Sabesp" },
];

export function useContasPagar() {
  return usePersisted<TituloPagar[]>(KEYS.pagar, titulosPagarIniciais);
}
export function useContasReceber() {
  return usePersisted<TituloReceber[]>(KEYS.receber, titulosReceberIniciais);
}

/** Gera o próximo ID sequencial (CP-010, CR-006, ...) a partir da lista atual. */
export function proximoId(lista: { id: string }[], prefixo: string) {
  const nums = lista
    .map((t) => t.id.match(new RegExp(`^${prefixo}-(\\d+)$`)))
    .filter(Boolean)
    .map((m) => Number(m![1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefixo}-${String(next).padStart(3, "0")}`;
}
