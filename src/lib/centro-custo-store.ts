import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   CENTRO DE CUSTO — entidade compartilhada
   Deixa de ser texto livre / mock estático e passa a ser um
   cadastro real com ID, referenciável por Financeiro, Entradas,
   Saídas e — a peça nova — pela Engenharia de Vendas (CRM):
   toda cotação ganha vira automaticamente um Centro de Custo.
   ═══════════════════════════════════════════════════════════════ */

export type CentroCusto = {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  clienteNome?: string;
  responsavelComercial?: string;
  orcamento: number;
  realizado: number;
  origem: "manual" | "crm";
  cotacaoOrigemId?: string;
  ativo: boolean;
  criadoEm: string;
};

const KEY = "erp:financeiro:centros-custo";

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

export const centrosCustoIniciais: CentroCusto[] = [
  { id: "cc-01", codigo: "CC-01", nome: "Operações", responsavelComercial: "Ana Oliveira", orcamento: 250000, realizado: 218000, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
  { id: "cc-02", codigo: "CC-02", nome: "Administrativo", responsavelComercial: "Luciana Ferreira", orcamento: 80000, realizado: 72000, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
  { id: "cc-03", codigo: "CC-03", nome: "Comercial", responsavelComercial: "João Silva", orcamento: 45000, realizado: 38000, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
  { id: "cc-04", codigo: "CC-04", nome: "RH / Pessoal", responsavelComercial: "Maria Santos", orcamento: 180000, realizado: 166800, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
  { id: "cc-05", codigo: "CC-05", nome: "Fiscal / Tributário", responsavelComercial: "Mateus", orcamento: 35000, realizado: 30580, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
  { id: "cc-06", codigo: "CC-06", nome: "Projetos (Sabesp)", clienteNome: "Sabesp", responsavelComercial: "Ana Oliveira", orcamento: 320000, realizado: 298000, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
  { id: "cc-07", codigo: "CC-07", nome: "Logística", responsavelComercial: "Carlos Souza", orcamento: 60000, realizado: 67000, origem: "manual", ativo: true, criadoEm: "01/01/2026" },
];

export function useCentrosCusto() {
  const [state, setState] = useState<CentroCusto[]>(() => read(KEY, centrosCustoIniciais));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read<CentroCusto[]>(KEY, centrosCustoIniciais));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
  }, []);
  const update = (next: CentroCusto[] | ((prev: CentroCusto[]) => CentroCusto[])) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: CentroCusto[]) => CentroCusto[])(prev) : next;
      write(KEY, v);
      return v;
    });
  };
  return [state, update] as const;
}

export function proximoCodigoCC(lista: CentroCusto[]): string {
  const nums = lista
    .map((c) => c.codigo.match(/^CC-(\d+)$/))
    .filter(Boolean)
    .map((m) => Number(m![1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `CC-${String(next).padStart(2, "0")}`;
}
