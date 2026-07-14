import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   VETORCORE — módulo nativo de OKRs
   Sincronização em tempo real via o mesmo barramento de eventos
   (CustomEvent "erp:store") já usado por todo o Syntera. Em
   produção, esse papel seria de WebSocket + Redis Pub/Sub — a
   lógica de "recalcular e notificar" é a mesma, só a camada de
   transporte muda. Ver ARQUITETURA.md para o mapeamento completo.
   ═══════════════════════════════════════════════════════════════ */

export type SaudeStatus = "saudavel" | "atencao" | "critico";

export type KeyResult = {
  id: string;
  titulo: string;
  responsavelNome: string;
  responsavelMatricula: string;
  areaId: string;
  metaValor: number;
  atualValor: number;
  unidade: "moeda" | "percentual" | "numero";
  /** Fonte real do dado — usada para o cálculo automático quando aplicável */
  origemAuto?: "financeiro_receita" | "financeiro_inadimplencia" | "entradas_volume" | "manual";
  prazo: string; // dd/mm/aaaa
  atualizadoEm: string; // ISO timestamp
  /** Preenchido pelo colaborador ao fazer check-in manual */
  ultimoComentario?: string;
};

export type Objetivo = {
  id: string;
  titulo: string;
  areaId: string;
  trimestre: string; // "Q3-2026"
  krIds: string[];
};

export type AreaOkr = {
  id: string;
  nome: string;
  responsavelNome: string;
  cor: string;
};

const KEY_OBJETIVOS = "erp:vetorcore:objetivos";
const KEY_KRS = "erp:vetorcore:krs";
const KEY_AREAS = "erp:vetorcore:areas";

export const AREAS_INICIAIS: AreaOkr[] = [
  { id: "comercial", nome: "Comercial", responsavelNome: "Maria Santos", cor: "#1E3A5F" },
  { id: "financeiro", nome: "Financeiro", responsavelNome: "Ana Oliveira", cor: "#2C5F6F" },
  { id: "operacoes", nome: "Operações", responsavelNome: "Pedro Costa", cor: "#3D6B4F" },
  { id: "rh", nome: "RH", responsavelNome: "Luciana Ferreira", cor: "#5F4A3D" },
  { id: "fiscal", nome: "Fiscal", responsavelNome: "João Silva", cor: "#4A3D5F" },
];

export const OBJETIVOS_INICIAIS: Objetivo[] = [
  { id: "obj-1", titulo: "Acelerar receita recorrente", areaId: "comercial", trimestre: "Q3-2026", krIds: ["kr-1", "kr-2"] },
  { id: "obj-2", titulo: "Saúde financeira sob controle", areaId: "financeiro", trimestre: "Q3-2026", krIds: ["kr-3", "kr-4"] },
  { id: "obj-3", titulo: "Eficiência operacional de entradas", areaId: "operacoes", trimestre: "Q3-2026", krIds: ["kr-5"] },
  { id: "obj-4", titulo: "Retenção e engajamento de equipe", areaId: "rh", trimestre: "Q3-2026", krIds: ["kr-6"] },
  { id: "obj-5", titulo: "Conformidade fiscal impecável", areaId: "fiscal", trimestre: "Q3-2026", krIds: ["kr-7", "kr-8"] },
];

export const KRS_INICIAIS: KeyResult[] = [
  { id: "kr-1", titulo: "Faturar R$ 500k no trimestre", responsavelNome: "Maria Santos", responsavelMatricula: "002", areaId: "comercial", metaValor: 500000, atualValor: 0, unidade: "moeda", origemAuto: "financeiro_receita", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-2", titulo: "Fechar 8 novos projetos via CRM", responsavelNome: "Maria Santos", responsavelMatricula: "002", areaId: "comercial", metaValor: 8, atualValor: 2, unidade: "numero", origemAuto: "manual", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-3", titulo: "Reduzir inadimplência para < 5%", responsavelNome: "Ana Oliveira", responsavelMatricula: "004", areaId: "financeiro", metaValor: 5, atualValor: 0, unidade: "percentual", origemAuto: "financeiro_inadimplencia", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-4", titulo: "Zerar títulos vencidos > 60 dias", responsavelNome: "Ana Oliveira", responsavelMatricula: "004", areaId: "financeiro", metaValor: 0, atualValor: 3, unidade: "numero", origemAuto: "manual", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-5", titulo: "Processar 100% das NFs em até 24h", responsavelNome: "Pedro Costa", responsavelMatricula: "003", areaId: "operacoes", metaValor: 100, atualValor: 78, unidade: "percentual", origemAuto: "entradas_volume", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-6", titulo: "Manter turnover abaixo de 8%", responsavelNome: "Luciana Ferreira", responsavelMatricula: "006", areaId: "rh", metaValor: 8, atualValor: 6.2, unidade: "percentual", origemAuto: "manual", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-7", titulo: "Zerar pendências de obrigações acessórias", responsavelNome: "João Silva", responsavelMatricula: "001", areaId: "fiscal", metaValor: 0, atualValor: 2, unidade: "numero", origemAuto: "manual", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
  { id: "kr-8", titulo: "Revisar 100% dos CFOPs de itens novos", responsavelNome: "João Silva", responsavelMatricula: "001", areaId: "fiscal", metaValor: 100, atualValor: 64, unidade: "percentual", origemAuto: "manual", prazo: "30/09/2026", atualizadoEm: new Date().toISOString() },
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

function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => read(key, initial));
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

export function useObjetivos() {
  return usePersisted<Objetivo[]>(KEY_OBJETIVOS, OBJETIVOS_INICIAIS);
}
export function useKeyResults() {
  return usePersisted<KeyResult[]>(KEY_KRS, KRS_INICIAIS);
}
export function useAreasOkr() {
  return usePersisted<AreaOkr[]>(KEY_AREAS, AREAS_INICIAIS);
}

/** Progresso 0–100. Metas de "reduzir" (meta < ponto de partida) invertem a lógica. */
export function progressoKr(kr: KeyResult): number {
  if (kr.metaValor === 0) {
    return kr.atualValor === 0 ? 100 : 0;
  }
  const pct = (kr.atualValor / kr.metaValor) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function saudeDoProgresso(progresso: number): SaudeStatus {
  if (progresso >= 80) return "saudavel";
  if (progresso >= 50) return "atencao";
  return "critico";
}

export const SAUDE_COR: Record<SaudeStatus, string> = {
  saudavel: "#2F7D5C",
  atencao: "#B8863B",
  critico: "#B54B3F",
};
export const SAUDE_LABEL: Record<SaudeStatus, string> = {
  saudavel: "Saudável",
  atencao: "Atenção",
  critico: "Crítico",
};
