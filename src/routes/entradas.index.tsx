import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useNotasEntrada } from "@/lib/entradas-store";
import { useItensFiscais } from "@/lib/fiscal-store";
import { DataTable, type Column } from "@/components/data-table";
import type { NotaEntrada } from "@/lib/entradas-store";
import { ArrowRight, FileText, Package, ShoppingCart, Receipt } from "lucide-react";

export const Route = createFileRoute("/entradas/")({
  component: EntradasOverview,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function EntradasOverview() {
  const [notas] = useNotasEntrada();
  const [itens] = useItensFiscais();

  const k = useMemo(() => {
    const totalCompras = notas.reduce((a, n) => a + n.valorTotal, 0);
    const totalIcms = notas.reduce((a, n) => a + n.valorIcms, 0);
    const totalPisCofins = notas.reduce((a, n) => a + n.valorPis + n.valorCofins, 0);
    const saldoValorizado = itens.reduce(
      (a, i) => a + (i.estoqueAtual ?? 0) * (i.custoMedio ?? i.preco * 0.6),
      0,
    );
    return { totalCompras, totalIcms, totalPisCofins, saldoValorizado, qtdNotas: notas.length };
  }, [notas, itens]);

  const cols: Column<NotaEntrada>[] = [
    { key: "numero", header: "NF" },
    { key: "fornecedorRazao", header: "Fornecedor" },
    { key: "dataEntrada", header: "Entrada" },
    { key: "cfopPrincipal", header: "CFOP" },
    { key: "valorTotal", header: "Total", align: "right", render: (r) => brl(r.valorTotal) },
    { key: "origem", header: "Origem" },
  ];

  const cards = [
    { label: "Notas de entrada", value: String(k.qtdNotas), icon: FileText },
    { label: "Compras (R$)", value: brl(k.totalCompras), icon: ShoppingCart },
    { label: "ICMS creditável", value: brl(k.totalIcms), icon: Receipt },
    { label: "Estoque valorizado", value: brl(k.saldoValorizado), icon: Package },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        title="Últimas notas de entrada"
        description="Compras, devoluções e transferências recebidas."
        columns={cols}
        data={notas.slice(0, 10)}
        filename="entradas-recentes"
        toolbar={
          <Link
            to="/entradas/compras"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium hover:border-gold"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    </div>
  );
}
