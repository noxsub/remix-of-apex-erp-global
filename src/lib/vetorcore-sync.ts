import { useEffect } from "react";
import { useKeyResults } from "@/lib/vetorcore-store";
import { useContasReceber } from "@/lib/financeiro-store";
import { useNotasEntrada } from "@/lib/entradas-store";
import { useCotacoes } from "@/lib/crm-store";
import { usePedidosMarketplace } from "@/lib/omnilink-store";

/* ═══════════════════════════════════════════════════════════════
   PONTE VETORCORE ↔ ERP
   Este hook simula, no cliente, o papel que em produção seria de
   um trigger de banco + worker de recálculo: sempre que Financeiro,
   Entradas, Engenharia de Vendas (CRM) ou Omnilink mudam, os Key
   Results marcados com origemAuto são recalculados automaticamente.
   Monte este hook uma vez perto da raiz do app (ex: __root.tsx)
   para o recálculo rodar em qualquer tela, não só dentro do
   VetorCore.
   ═══════════════════════════════════════════════════════════════ */
export function useVetorCoreSync() {
  const [krs, setKrs] = useKeyResults();
  const [contasReceber] = useContasReceber();
  const [notasEntrada] = useNotasEntrada();
  const [cotacoes] = useCotacoes();
  const [pedidosMarketplace] = usePedidosMarketplace();

  useEffect(() => {
    setKrs((prev) =>
      prev.map((kr) => {
        if (kr.origemAuto === "financeiro_receita") {
          const receita = contasReceber.reduce((s, t) => s + t.totalReceber, 0);
          if (receita === kr.atualValor) return kr;
          return { ...kr, atualValor: receita, atualizadoEm: new Date().toISOString() };
        }
        if (kr.origemAuto === "financeiro_inadimplencia") {
          const total = contasReceber.reduce((s, t) => s + t.totalReceber, 0);
          const vencido = contasReceber.filter((t) => t.status === "vencido").reduce((s, t) => s + t.totalReceber, 0);
          const pct = total > 0 ? Math.round((vencido / total) * 1000) / 10 : 0;
          if (pct === kr.atualValor) return kr;
          return { ...kr, atualValor: pct, atualizadoEm: new Date().toISOString() };
        }
        if (kr.origemAuto === "entradas_volume") {
          const total = notasEntrada.length;
          const lancadas = notasEntrada.filter((n) => n.status === "Lançada").length;
          const pct = total > 0 ? Math.round((lancadas / total) * 100) : 100;
          if (pct === kr.atualValor) return kr;
          return { ...kr, atualValor: pct, atualizadoEm: new Date().toISOString() };
        }
        if (kr.origemAuto === "crm_projetos_ganhos") {
          const ganhos = cotacoes.filter((c) => c.status === "ganho").length;
          if (ganhos === kr.atualValor) return kr;
          return { ...kr, atualValor: ganhos, atualizadoEm: new Date().toISOString() };
        }
        if (kr.origemAuto === "omnilink_vendas") {
          const faturado = pedidosMarketplace
            .filter((p) => p.status === "faturado" || p.status === "expedido" || p.status === "entregue")
            .reduce((s, p) => s + p.valorLiquido, 0);
          if (faturado === kr.atualValor) return kr;
          return { ...kr, atualValor: Math.round(faturado), atualizadoEm: new Date().toISOString() };
        }
        return kr;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contasReceber, notasEntrada, cotacoes, pedidosMarketplace]);

  return krs;
}
