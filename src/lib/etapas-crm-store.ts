import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   ETAPAS DO CRM — colunas parametrizáveis do Kanban
   "ganho" e "perdido" são etapas reservadas: soltar um card nelas
   dispara a cascata de ganho (Centro de Custo + pré-cadastros) ou
   a marcação de perda. As demais etapas são livres — o usuário
   pode criar, renomear e reordenar.
   ═══════════════════════════════════════════════════════════════ */

export type EtapaCrm = {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  reservada?: "ganho" | "perdido";
};

const KEY = "erp:crm:etapas";

export const etapasIniciais: EtapaCrm[] = [
  { id: "lead", nome: "Lead", cor: "#94a3b8", ordem: 0 },
  { id: "contato", nome: "Contato", cor: "#60a5fa", ordem: 1 },
  { id: "qualificacao", nome: "Qualificação", cor: "#38bdf8", ordem: 2 },
  { id: "diagnostico", nome: "Diagnóstico", cor: "#22d3ee", ordem: 3 },
  { id: "proposta", nome: "Proposta", cor: "#a78bfa", ordem: 4 },
  { id: "negociacao", nome: "Negociação", cor: "#f59e0b", ordem: 5 },
  { id: "contrato", nome: "Contrato", cor: "#fb923c", ordem: 6 },
  { id: "implantacao", nome: "Implantação", cor: "#facc15", ordem: 7 },
  { id: "ganho", nome: "Projeto Ganho", cor: "#22c55e", ordem: 8, reservada: "ganho" },
  { id: "perdido", nome: "Projeto Perdido", cor: "#ef4444", ordem: 9, reservada: "perdido" },
];

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

export function useEtapasCrm() {
  const [state, setState] = useState<EtapaCrm[]>(() => read(KEY, etapasIniciais));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read<EtapaCrm[]>(KEY, etapasIniciais));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
  }, []);
  const update = (next: EtapaCrm[] | ((prev: EtapaCrm[]) => EtapaCrm[])) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: EtapaCrm[]) => EtapaCrm[])(prev) : next;
      write(KEY, v.sort((a, b) => a.ordem - b.ordem));
      return v;
    });
  };
  return [state, update] as const;
}

const CORES_DISPONIVEIS = ["#94a3b8", "#60a5fa", "#38bdf8", "#22d3ee", "#a78bfa", "#f59e0b", "#fb923c", "#facc15", "#ec4899", "#14b8a6"];

export function corParaNovaEtapa(existentes: EtapaCrm[]): string {
  return CORES_DISPONIVEIS[existentes.length % CORES_DISPONIVEIS.length];
}
