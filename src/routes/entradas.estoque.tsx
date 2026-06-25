import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useItensFiscais } from "@/lib/fiscal-store";
import { useNotasEntrada } from "@/lib/entradas-store";
import { DataTable, type Column } from "@/components/data-table";

export const Route = createFileRoute("/entradas/estoque")({
  component: EstoquePosicao,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Linha = {
  sku: string;
  nome: string;
  ncm: string;
  unidade: string;
  estoque: number;
  custoMedio: number;
  ultimoCusto: number;
  valorEstoque: number;
  status: string;
};

function EstoquePosicao() {
  const [itens] = useItensFiscais();
  const [notas] = useNotasEntrada();

  const linhas = useMemo<Linha[]>(() => {
    // último custo por SKU pelas notas mais recentes
    const ultimo = new Map<string, number>();
    [...notas]
      .sort((a, b) => a.dataEntrada.localeCompare(b.dataEntrada))
      .forEach((n) => n.itens.forEach((it) => ultimo.set(it.sku, it.valorUnitario)));

    return itens
      .filter((i) => i.tipo === "produto")
      .map((i) => {
        const custoMedio = i.custoMedio ?? i.preco * 0.6;
        const ultimoC = ultimo.get(i.sku) ?? custoMedio;
        const est = i.estoqueAtual ?? 0;
        return {
          sku: i.sku,
          nome: i.nome,
          ncm: i.ncm ?? "—",
          unidade: i.unidade,
          estoque: est,
          custoMedio,
          ultimoCusto: ultimoC,
          valorEstoque: est * custoMedio,
          status: est <= (i.estoqueMinimo ?? 10) ? "Baixo" : "Ativo",
        };
      });
  }, [itens, notas]);

  const totalValorizado = linhas.reduce((a, l) => a + l.valorEstoque, 0);
  const totalUnidades = linhas.reduce((a, l) => a + l.estoque, 0);

  const cols: Column<Linha>[] = [
    { key: "sku", header: "SKU" },
    { key: "nome", header: "Produto" },
    { key: "ncm", header: "NCM" },
    { key: "unidade", header: "UN", align: "center" },
    { key: "estoque", header: "Saldo", align: "right" },
    { key: "custoMedio", header: "Custo médio", align: "right", render: (r) => brl(r.custoMedio) },
    { key: "ultimoCusto", header: "Último custo", align: "right", render: (r) => brl(r.ultimoCusto) },
    { key: "valorEstoque", header: "Valor estoque", align: "right", render: (r) => brl(r.valorEstoque) },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="SKUs ativos" value={String(linhas.length)} />
        <Kpi label="Unidades em estoque" value={totalUnidades.toLocaleString("pt-BR")} />
        <Kpi label="Estoque valorizado" value={brl(totalValorizado)} />
      </div>
      <DataTable
        title="Posição de estoque"
        description="Saldo, custo médio, último custo e valor — base para Bloco H do SPED."
        columns={cols}
        data={linhas}
        filename="posicao-estoque"
      />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
