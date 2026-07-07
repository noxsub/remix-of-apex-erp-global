import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   USUÁRIO LOGADO — sessão e perfil
   Único usuário no protótipo (login ADM/123 na landing), mas já
   modelado como registro completo para suportar multiusuário no
   futuro. O PIN aqui é o MESMO usado no Syntera Ponto — o campo
   de perfil "meu PIN" lê e grava neste único lugar.
   ═══════════════════════════════════════════════════════════════ */

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  matricula: string; // referencia o colaborador no ponto-store
  senha: string; // texto puro só porque é protótipo — nunca fazer isso em produção
  pinPonto: string;
  avatarIniciais: string;
  papel: "administrador" | "financeiro" | "vendas" | "rh" | "operacional";
};

const KEY = "erp:usuario:atual";

const usuarioPadrao: Usuario = {
  id: "u-001",
  nome: "Administrador",
  email: "admin@syntera.com.br",
  cargo: "Administrador do Sistema",
  matricula: "001",
  senha: "123",
  pinPonto: "1111",
  avatarIniciais: "AD",
  papel: "administrador",
};

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

export function useUsuarioAtual() {
  const [state, setState] = useState<Usuario>(() => read(KEY, usuarioPadrao));
  useEffect(() => {
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read<Usuario>(KEY, usuarioPadrao));
    };
    window.addEventListener("erp:store", onChange);
    return () => window.removeEventListener("erp:store", onChange);
  }, []);
  const update = (next: Usuario | ((prev: Usuario) => Usuario)) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: Usuario) => Usuario)(prev) : next;
      write(KEY, v);
      return v;
    });
  };
  return [state, update] as const;
}

export const PAPEL_LABEL: Record<Usuario["papel"], string> = {
  administrador: "Administrador",
  financeiro: "Financeiro",
  vendas: "Comercial / Vendas",
  rh: "Recursos Humanos",
  operacional: "Operacional",
};
