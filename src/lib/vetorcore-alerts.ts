import { useEffect, useState } from "react";
import { useKeyResults, saudeDoProgresso, progressoKr, type SaudeStatus } from "@/lib/vetorcore-store";

/* ═══════════════════════════════════════════════════════════════
   ALERTAS DE DESVIO CRÍTICO
   Um alerta nasce quando um Key Result TRANSICIONA para "crítico"
   (não simplesmente "está crítico" a cada render — isso evitaria
   duplicar alerta a cada recálculo). Guardamos o último estado de
   saúde conhecido de cada KR para detectar a transição de forma
   confiável entre sessões.
   ═══════════════════════════════════════════════════════════════ */

export type AlertaVetorCore = {
  id: string;
  krId: string;
  krTitulo: string;
  progresso: number;
  criadoEm: string; // ISO
  lido: boolean;
};

const KEY_ALERTAS = "erp:vetorcore:alertas";
const KEY_ESTADO_ANTERIOR = "erp:vetorcore:estado-saude";

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

export function useAlertasVetorCore() {
  return usePersisted<AlertaVetorCore[]>(KEY_ALERTAS, []);
}

/**
 * Roda ao lado de useVetorCoreSync (ou depois dele). Compara o estado de
 * saúde atual de cada KR com o último estado conhecido; ao detectar a
 * transição para "crítico", cria um alerta novo.
 */
export function useDetectorDeAlertasVetorCore() {
  const [krs] = useKeyResults();
  const [, setAlertas] = useAlertasVetorCore();
  const [estadoAnterior, setEstadoAnterior] = usePersisted<Record<string, SaudeStatus>>(KEY_ESTADO_ANTERIOR, {});

  useEffect(() => {
    const novosAlertas: AlertaVetorCore[] = [];
    const proximoEstado: Record<string, SaudeStatus> = { ...estadoAnterior };

    for (const kr of krs) {
      const progresso = progressoKr(kr);
      const saudeAtual = saudeDoProgresso(progresso);
      const saudeAnterior = estadoAnterior[kr.id];

      if (saudeAtual === "critico" && saudeAnterior !== "critico") {
        novosAlertas.push({
          id: `alerta-${kr.id}-${Date.now()}`,
          krId: kr.id,
          krTitulo: kr.titulo,
          progresso,
          criadoEm: new Date().toISOString(),
          lido: false,
        });
      }
      proximoEstado[kr.id] = saudeAtual;
    }

    if (novosAlertas.length > 0) {
      setAlertas((prev) => [...novosAlertas, ...prev]);
    }
    const mudou = krs.some((kr) => proximoEstado[kr.id] !== estadoAnterior[kr.id]);
    if (mudou) {
      setEstadoAnterior(proximoEstado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [krs]);
}

export function marcarAlertaComoLido(
  setAlertas: ReturnType<typeof useAlertasVetorCore>[1],
  id: string,
) {
  setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, lido: true } : a)));
}

export function marcarTodosComoLidos(setAlertas: ReturnType<typeof useAlertasVetorCore>[1]) {
  setAlertas((prev) => prev.map((a) => ({ ...a, lido: true })));
}
