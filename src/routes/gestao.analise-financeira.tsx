import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react";
import { useContasPagar, useContasReceber, type CategoriaPagar } from "@/lib/financeiro-store";

export const Route = createFileRoute("/gestao/analise-financeira")({
  head: () => ({ meta: [{ title: "Análise Financeira — Syntera ERP" }] }),
  component: AnaliseFinanceiraPage,
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* Classificação simplificada de categoria de despesa -> grupo de DRE */
const GRUPO_CUSTO: CategoriaPagar[] = ["fornecedores"];
const GRUPO_DESPESA_OPERACIONAL: CategoriaPagar[] = ["folha", "encargos", "utilidades", "outros"];
const GRUPO_TRIBUTOS: CategoriaPagar[] = ["impostos"];

function AnaliseFinanceiraPage() {
  const [titulosPagar] = useContasPagar();
  const [titulosReceber] = useContasReceber();

  const dre = useMemo(() => {
    const receitaBruta = titulosReceber.reduce((s, t) => s + t.totalReceber, 0);
    const custos = titulosPagar
      .filter((t) => GRUPO_CUSTO.includes(t.categoria))
      .reduce((s, t) => s + t.totalPagar, 0);
    const despesasOperacionais = titulosPagar
      .filter((t) => GRUPO_DESPESA_OPERACIONAL.includes(t.categoria))
      .reduce((s, t) => s + t.totalPagar, 0);
    const tributos = titulosPagar
      .filter((t) => GRUPO_TRIBUTOS.includes(t.categoria))
      .reduce((s, t) => s + t.totalPagar, 0);

    const lucroBruto = receitaBruta - custos;
    const resultadoOperacional = lucroBruto - despesasOperacionais;
    const resultadoLiquido = resultadoOperacional - tributos;
    const margemLiquida = receitaBruta > 0 ? (resultadoLiquido / receitaBruta) * 100 : 0;
    const margemBruta = receitaBruta > 0 ? (lucroBruto / receitaBruta) * 100 : 0;

    return { receitaBruta, custos, despesasOperacionais, tributos, lucroBruto, resultadoOperacional, resultadoLiquido, margemLiquida, margemBruta };
  }, [titulosPagar, titulosReceber]);

  const inadimplencia = useMemo(() => {
    const vencidos = titulosReceber.filter((t) => t.status === "vencido").reduce((s, t) => s + t.totalReceber, 0);
    const total = titulosReceber.reduce((s, t) => s + t.totalReceber, 0);
    return total > 0 ? (vencidos / total) * 100 : 0;
  }, [titulosReceber]);

  const cascata = [
    { nome: "Receita Bruta", valor: dre.receitaBruta },
    { nome: "(-) Custos", valor: -dre.custos },
    { nome: "Lucro Bruto", valor: dre.lucroBruto },
    { nome: "(-) Despesas Oper.", valor: -dre.despesasOperacionais },
    { nome: "Result. Operacional", valor: dre.resultadoOperacional },
    { nome: "(-) Tributos", valor: -dre.tributos },
    { nome: "Result. Líquido", valor: dre.resultadoLiquido },
  ];

  return (
    <AppShell title="Análise Financeira" subtitle="Demonstrativo de Resultado (DRE) consolidado a partir dos lançamentos reais de Contas a Pagar e Contas a Receber.">
      <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Receita Bruta</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-1 text-xl font-semibold">{brl(dre.receitaBruta)}</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Resultado Líquido</p>
            {dre.resultadoLiquido >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          </div>
          <p className={`mt-1 text-xl font-semibold ${dre.resultadoLiquido >= 0 ? "text-green-600" : "text-red-600"}`}>
            {brl(dre.resultadoLiquido)}
          </p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Margem Líquida</p>
            <Percent className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-1 text-xl font-semibold">{dre.margemLiquida.toFixed(1)}%</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase text-muted-foreground">Inadimplência</p>
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-1 text-xl font-semibold">{inadimplencia.toFixed(1)}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-4 border-border lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Cascata do Resultado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cascata} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => brl(v)} fontSize={11} />
              <YAxis type="category" dataKey="nome" width={130} fontSize={11} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {cascata.map((c, i) => (
                  <Cell key={i} fill={c.valor >= 0 ? "#22c55e" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 border-border">
          <h3 className="mb-3 text-sm font-semibold">Demonstrativo (DRE)</h3>
          <div className="space-y-2 text-sm">
            <LinhaDre label="Receita Bruta" valor={dre.receitaBruta} />
            <LinhaDre label="(-) Custos" valor={-dre.custos} />
            <LinhaDre label="= Lucro Bruto" valor={dre.lucroBruto} bold />
            <div className="border-t border-border" />
            <LinhaDre label="(-) Despesas Operacionais" valor={-dre.despesasOperacionais} />
            <LinhaDre label="= Resultado Operacional" valor={dre.resultadoOperacional} bold />
            <div className="border-t border-border" />
            <LinhaDre label="(-) Tributos sobre o Lucro" valor={-dre.tributos} />
            <div className="border-t-2 border-foreground/20 pt-2" />
            <LinhaDre label="= Resultado Líquido" valor={dre.resultadoLiquido} bold big />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">Margem bruta: {dre.margemBruta.toFixed(1)}%</Badge>
            <Badge variant="outline" className="text-[10px]">Margem líquida: {dre.margemLiquida.toFixed(1)}%</Badge>
          </div>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Os valores acima somam todos os títulos lançados em Contas a Pagar e Contas a Receber (independente de status —
        aberto, pago ou vencido), classificados por categoria. Para uma apuração por regime de competência/caixa e por
        período, use os filtros de Financeiro → Fluxo de Caixa.
      </p>
      </div>
    </AppShell>
  );
}

function LinhaDre({ label, valor, bold, big }: { label: string; valor: number; bold?: boolean; big?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : ""} ${big ? "text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className={valor < 0 ? "text-red-600" : big ? "text-green-600" : ""}>{brl(valor)}</span>
    </div>
  );
}
