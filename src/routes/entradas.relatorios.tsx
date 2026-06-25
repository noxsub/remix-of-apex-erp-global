import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useNotasEntrada } from "@/lib/entradas-store";
import { useItensFiscais } from "@/lib/fiscal-store";
import { DataTable, type Column } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FileBarChart2, Package2, Truck, Tags, Receipt, BookOpen } from "lucide-react";

export const Route = createFileRoute("/entradas/relatorios")({
  component: RelatoriosFiscais,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type RelKey =
  | "saldo"
  | "custoCompra"
  | "porFornecedor"
  | "porNcm"
  | "livroEntradas"
  | "creditos";

const REL: { key: RelKey; label: string; desc: string; icon: typeof Package2 }[] = [
  { key: "saldo", label: "Saldo de estoque valorizado", desc: "Posição + valor (Bloco H SPED).", icon: Package2 },
  { key: "custoCompra", label: "Custo por compra", desc: "Custo unitário e total por NF.", icon: Tags },
  { key: "porFornecedor", label: "Compras por fornecedor", desc: "Consolidado por CNPJ.", icon: Truck },
  { key: "porNcm", label: "Consolidado por NCM", desc: "Quantidade e valor agrupados.", icon: Receipt },
  { key: "livroEntradas", label: "Livro de entradas", desc: "Registro fiscal modelo P1.", icon: BookOpen },
  { key: "creditos", label: "Créditos de ICMS/PIS/COFINS", desc: "Apuração para obrigações acessórias.", icon: FileBarChart2 },
];

function RelatoriosFiscais() {
  const [notas] = useNotasEntrada();
  const [itens] = useItensFiscais();
  const [sel, setSel] = useState<RelKey>("saldo");

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-1">
        {REL.map((r) => {
          const active = sel === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setSel(r.key)}
              className={`flex w-full items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                active
                  ? "border-gold/40 bg-gold/5"
                  : "border-border bg-card hover:border-gold/30"
              }`}
            >
              <r.icon className={`mt-0.5 h-4 w-4 ${active ? "text-gold" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-[11px] text-muted-foreground">{r.desc}</p>
              </div>
            </button>
          );
        })}
      </aside>

      <div>
        <RelView relKey={sel} notas={notas} itens={itens} />
      </div>
    </div>
  );
}

function RelView({
  relKey,
  notas,
  itens,
}: {
  relKey: RelKey;
  notas: ReturnType<typeof useNotasEntrada>[0];
  itens: ReturnType<typeof useItensFiscais>[0];
}) {
  if (relKey === "saldo") {
    type R = { sku: string; nome: string; saldo: number; custo: number; valor: number };
    const data = useMemo<R[]>(
      () =>
        itens
          .filter((i) => i.tipo === "produto")
          .map((i) => {
            const custo = i.custoMedio ?? i.preco * 0.6;
            const saldo = i.estoqueAtual ?? 0;
            return { sku: i.sku, nome: i.nome, saldo, custo, valor: saldo * custo };
          }),
      [itens],
    );
    const cols: Column<R>[] = [
      { key: "sku", header: "SKU" },
      { key: "nome", header: "Produto" },
      { key: "saldo", header: "Saldo", align: "right" },
      { key: "custo", header: "Custo médio", align: "right", render: (r) => brl(r.custo) },
      { key: "valor", header: "Valor", align: "right", render: (r) => brl(r.valor) },
    ];
    return <DataTable title="Saldo de estoque valorizado" columns={cols} data={data} filename="saldo-estoque" />;
  }

  if (relKey === "custoCompra") {
    type R = { nf: string; sku: string; desc: string; qtd: number; unit: number; total: number };
    const data: R[] = notas.flatMap((n) =>
      n.itens.map((it) => ({
        nf: n.numero,
        sku: it.sku,
        desc: it.descricao,
        qtd: it.quantidade,
        unit: it.valorUnitario,
        total: it.valorTotal,
      })),
    );
    const cols: Column<R>[] = [
      { key: "nf", header: "NF" },
      { key: "sku", header: "SKU" },
      { key: "desc", header: "Descrição" },
      { key: "qtd", header: "Qtd", align: "right" },
      { key: "unit", header: "Vl. Unit.", align: "right", render: (r) => brl(r.unit) },
      { key: "total", header: "Total", align: "right", render: (r) => brl(r.total) },
    ];
    return <DataTable title="Custo por compra" columns={cols} data={data} filename="custo-por-compra" />;
  }

  if (relKey === "porFornecedor") {
    type R = { cnpj: string; razao: string; notas: number; total: number };
    const map = new Map<string, R>();
    notas.forEach((n) => {
      const cur = map.get(n.fornecedorCnpj) ?? {
        cnpj: n.fornecedorCnpj,
        razao: n.fornecedorRazao,
        notas: 0,
        total: 0,
      };
      cur.notas += 1;
      cur.total += n.valorTotal;
      map.set(n.fornecedorCnpj, cur);
    });
    const data = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const cols: Column<R>[] = [
      { key: "cnpj", header: "CNPJ" },
      { key: "razao", header: "Razão social" },
      { key: "notas", header: "Nº NFs", align: "right" },
      { key: "total", header: "Total comprado", align: "right", render: (r) => brl(r.total) },
    ];
    return <DataTable title="Compras por fornecedor" columns={cols} data={data} filename="compras-fornecedor" />;
  }

  if (relKey === "porNcm") {
    type R = { ncm: string; qtd: number; total: number };
    const map = new Map<string, R>();
    notas.forEach((n) =>
      n.itens.forEach((it) => {
        const k = it.ncm ?? "—";
        const cur = map.get(k) ?? { ncm: k, qtd: 0, total: 0 };
        cur.qtd += it.quantidade;
        cur.total += it.valorTotal;
        map.set(k, cur);
      }),
    );
    const data = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const cols: Column<R>[] = [
      { key: "ncm", header: "NCM" },
      { key: "qtd", header: "Qtd", align: "right" },
      { key: "total", header: "Valor", align: "right", render: (r) => brl(r.total) },
    ];
    return <DataTable title="Consolidado por NCM" columns={cols} data={data} filename="entradas-ncm" />;
  }

  if (relKey === "livroEntradas") {
    type R = {
      data: string;
      nf: string;
      forn: string;
      cfop: string;
      base: number;
      icms: number;
      pis: number;
      cofins: number;
      total: number;
    };
    const data: R[] = notas.map((n) => ({
      data: n.dataEntrada,
      nf: n.numero,
      forn: n.fornecedorRazao,
      cfop: n.cfopPrincipal,
      base: n.valorProdutos,
      icms: n.valorIcms,
      pis: n.valorPis,
      cofins: n.valorCofins,
      total: n.valorTotal,
    }));
    const cols: Column<R>[] = [
      { key: "data", header: "Data" },
      { key: "nf", header: "NF" },
      { key: "forn", header: "Fornecedor" },
      { key: "cfop", header: "CFOP" },
      { key: "base", header: "Base", align: "right", render: (r) => brl(r.base) },
      { key: "icms", header: "ICMS", align: "right", render: (r) => brl(r.icms) },
      { key: "pis", header: "PIS", align: "right", render: (r) => brl(r.pis) },
      { key: "cofins", header: "COFINS", align: "right", render: (r) => brl(r.cofins) },
      { key: "total", header: "Total", align: "right", render: (r) => brl(r.total) },
    ];
    return <DataTable title="Livro de entradas (modelo P1)" columns={cols} data={data} filename="livro-entradas" />;
  }

  // creditos
  type R = { tributo: string; base: number; valor: number };
  const base = notas.reduce((a, n) => a + n.valorProdutos, 0);
  const data: R[] = [
    { tributo: "ICMS creditável", base, valor: notas.reduce((a, n) => a + n.valorIcms, 0) },
    { tributo: "PIS creditável", base, valor: notas.reduce((a, n) => a + n.valorPis, 0) },
    { tributo: "COFINS creditável", base, valor: notas.reduce((a, n) => a + n.valorCofins, 0) },
    { tributo: "IPI", base, valor: notas.reduce((a, n) => a + n.valorIpi, 0) },
  ];
  const cols: Column<R>[] = [
    { key: "tributo", header: "Tributo" },
    { key: "base", header: "Base", align: "right", render: (r) => brl(r.base) },
    { key: "valor", header: "Crédito", align: "right", render: (r) => brl(r.valor) },
  ];
  return (
    <div className="space-y-3">
      <DataTable title="Créditos apurados" columns={cols} data={data} filename="creditos-entrada" />
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-8 border-border">
          Gerar SPED Contribuições (mock)
        </Button>
      </div>
    </div>
  );
}
