// Compat layer — as alíquotas vivem agora no módulo Fiscal (`fiscal-store`).
// Mantemos o shape antigo (CBS/IBS/IS/IRRF/CSLL) para não quebrar `vendas.tsx`.

import { useAliquotasPadrao, type AliquotasPadrao } from "./fiscal-store";

export type TaxRates = {
  cbs: number;
  ibs: number;
  is: number;
  irrf: number;
  csll: number;
};

export type TipoOperacao = "produto" | "servico";

export type TaxConfig = Record<TipoOperacao, TaxRates>;

export const taxDescriptions: Record<keyof TaxRates, { label: string; descricao: string }> = {
  cbs: { label: "CBS", descricao: "Contribuição sobre Bens e Serviços (federal) — Reforma Tributária" },
  ibs: { label: "IBS", descricao: "Imposto sobre Bens e Serviços (estadual/municipal) — Reforma Tributária" },
  is: { label: "IS", descricao: "Imposto Seletivo — bens/serviços específicos" },
  irrf: { label: "IRRF", descricao: "Imposto de Renda Retido na Fonte" },
  csll: { label: "CSLL", descricao: "Contribuição Social sobre o Lucro Líquido" },
};

function toTaxConfig(a: AliquotasPadrao): TaxConfig {
  return {
    produto: { cbs: a.produto.cbs, ibs: a.produto.ibs, is: a.produto.is, irrf: a.produto.irrf, csll: a.produto.csll },
    servico: { cbs: a.servico.cbs, ibs: a.servico.ibs, is: a.servico.is, irrf: a.servico.irrf, csll: a.servico.csll },
  };
}

export function useTaxConfig() {
  const [aliquotas, setAliquotas] = useAliquotasPadrao();
  const config = toTaxConfig(aliquotas);
  const update = (next: TaxConfig | ((prev: TaxConfig) => TaxConfig)) => {
    const v = typeof next === "function" ? (next as (p: TaxConfig) => TaxConfig)(config) : next;
    setAliquotas((prev) => ({
      produto: { ...prev.produto, ...v.produto },
      servico: { ...prev.servico, ...v.servico },
    }));
  };
  return [config, update] as const;
}
