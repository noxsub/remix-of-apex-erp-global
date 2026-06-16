import { useEffect, useState } from "react";

export type TaxRates = {
  cbs: number;
  ibs: number;
  is: number;
  irrf: number;
  csll: number;
};

export type TipoOperacao = "produto" | "servico";

export type TaxConfig = Record<TipoOperacao, TaxRates>;

export const taxConfigDefault: TaxConfig = {
  produto: { cbs: 0.9, ibs: 0.1, is: 0.0, irrf: 1.5, csll: 1.0 },
  servico: { cbs: 0.9, ibs: 0.1, is: 0.0, irrf: 1.5, csll: 1.0 },
};

export const taxDescriptions: Record<keyof TaxRates, { label: string; descricao: string }> = {
  cbs: { label: "CBS", descricao: "Contribuição sobre Bens e Serviços (federal) — Reforma Tributária" },
  ibs: { label: "IBS", descricao: "Imposto sobre Bens e Serviços (estadual/municipal) — Reforma Tributária" },
  is: { label: "IS", descricao: "Imposto Seletivo — bens/serviços específicos" },
  irrf: { label: "IRRF", descricao: "Imposto de Renda Retido na Fonte" },
  csll: { label: "CSLL", descricao: "Contribuição Social sobre o Lucro Líquido" },
};

const KEY = "erp:tax-config";

function read(): TaxConfig {
  if (typeof window === "undefined") return taxConfigDefault;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...taxConfigDefault, ...JSON.parse(raw) } : taxConfigDefault;
  } catch {
    return taxConfigDefault;
  }
}

function write(value: TaxConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("erp:store", { detail: { key: KEY } }));
}

export function useTaxConfig() {
  const [state, setState] = useState<TaxConfig>(read);
  useEffect(() => {
    const onStore = (e: Event) => {
      const d = (e as CustomEvent).detail as { key?: string } | undefined;
      if (d?.key === KEY) setState(read());
    };
    window.addEventListener("erp:store", onStore);
    return () => window.removeEventListener("erp:store", onStore);
  }, []);
  const update = (next: TaxConfig | ((prev: TaxConfig) => TaxConfig)) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as (p: TaxConfig) => TaxConfig)(prev) : next;
      write(v);
      return v;
    });
  };
  return [state, update] as const;
}