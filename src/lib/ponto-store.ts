import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   SYNTERA PONTO — store compartilhado
   Liga o aplicativo de ponto (rota /ponto-app, tela independente)
   ao módulo RH (rh.ponto.tsx). Registros são eventos imutáveis;
   correções passam por ajuste manual do gestor no RH.
   ═══════════════════════════════════════════════════════════════ */

export type TipoMarcacao = "entrada" | "inicio_pausa" | "fim_pausa" | "saida";

export type MarcacaoPonto = {
  id: string;
  matricula: string;
  nome: string;
  tipo: TipoMarcacao;
  /** ISO 8601 — gerado no momento do registro */
  timestamp: string;
  origem: "app" | "ajuste_manual";
  observacao?: string;
};

export type ColaboradorPonto = {
  matricula: string;
  nome: string;
  cargo: string;
  pin: string; // PIN de 4 dígitos para o quiosque (protótipo)
};

/** Colaboradores habilitados no app (espelha o cadastro do RH). */
export const COLABORADORES_PONTO: ColaboradorPonto[] = [
  { matricula: "001", nome: "João Silva", cargo: "Analista Fiscal", pin: "1111" },
  { matricula: "002", nome: "Maria Santos", cargo: "Vendedora", pin: "2222" },
  { matricula: "003", nome: "Pedro Costa", cargo: "Estoquista", pin: "3333" },
  { matricula: "004", nome: "Ana Oliveira", cargo: "Financeiro", pin: "4444" },
  { matricula: "005", nome: "Carlos Souza", cargo: "Motorista", pin: "5555" },
  { matricula: "006", nome: "Luciana Ferreira", cargo: "RH", pin: "6666" },
];

export const TIPO_LABEL: Record<TipoMarcacao, string> = {
  entrada: "Entrada",
  inicio_pausa: "Início da Pausa",
  fim_pausa: "Fim da Pausa",
  saida: "Saída",
};

/** Próxima marcação esperada dada a última do dia. */
export function proximaMarcacao(ultima: TipoMarcacao | null): TipoMarcacao {
  switch (ultima) {
    case null:
      return "entrada";
    case "entrada":
      return "inicio_pausa";
    case "inicio_pausa":
      return "fim_pausa";
    case "fim_pausa":
      return "saida";
    case "saida":
      return "entrada";
  }
}

const KEY = "erp:ponto:marcacoes";

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

export function useMarcacoesPonto() {
  const [state, setState] = useState<MarcacaoPonto[]>(() => read(KEY, []));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read<MarcacaoPonto[]>(KEY, []));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
  }, []);
  const update = (next: MarcacaoPonto[] | ((prev: MarcacaoPonto[]) => MarcacaoPonto[])) => {
    setState((prev) => {
      const v = typeof next === "function" ? next(prev) : next;
      write(KEY, v);
      return v;
    });
  };
  return [state, update] as const;
}

/** Marcações de um colaborador em uma data (YYYY-MM-DD, fuso local). */
export function marcacoesDoDia(todas: MarcacaoPonto[], matricula: string, dataISO: string) {
  return todas
    .filter((m) => m.matricula === matricula && m.timestamp.slice(0, 10) === dataISO)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/** Total trabalhado no dia em minutos (pares entrada→pausa e retorno→saída). */
export function minutosTrabalhados(doDia: MarcacaoPonto[]): number {
  let total = 0;
  let aberto: Date | null = null;
  for (const m of doDia) {
    const t = new Date(m.timestamp);
    if (m.tipo === "entrada" || m.tipo === "fim_pausa") {
      aberto = t;
    } else if ((m.tipo === "inicio_pausa" || m.tipo === "saida") && aberto) {
      total += (t.getTime() - aberto.getTime()) / 60000;
      aberto = null;
    }
  }
  return Math.round(total);
}

export function fmtMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
