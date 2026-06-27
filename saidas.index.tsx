import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  FileText, Package, AlertTriangle, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/saidas/")({
  component: SaidasIndex,
});

const faturamentoMensal = [
  { mes: "Jan", valor: 125000 }, { mes: "Fev", valor: 118000 },
  { mes: "Mar", valor: 142000 }, { mes: "Abr", valor: 155000 },
  { mes: "Mai", valor: 138000 }, { mes: "Jun", valor: 167000 },
];

const vendasPorCategoria = [
  { name: "Produtos", value: 65 }, { name: "Serviços", value: 25 },
  { name: "Revenda", value: 10 },
];

const ultimosPedidos = [
  { id: "PV-2026-0184", cliente: "Acme Global Ltd.", data: "26/06/2026", valor: "R$ 18.420,00", status: "Faturado" },
  { id: "PV-2026-0183", cliente: "Northwind Trading", data: "25/06/2026", valor: "R$ 9.890,50", status: "Aguardando" },
  { id: "PV-2026-0182", cliente: "Fabrikam Inc.", data: "24/06/2026", valor: "R$ 3.250,00", status: "Faturado" },
  { id: "PV-2026-0181", cliente: "Contoso Ltd.", data: "23/06/2026", valor: "R$ 27.800,00", status: "Em separação" },
  { id: "PV-2026-0180", cliente: "Globex Corp.", data: "22/06/2026", valor: "R$ 4.320,00", status: "Cancelado" },
];

const cols: Column<typeof ultimosPedidos[0]>[] = [
  { key: "id", header: "Pedido" },
  { key: "cliente", header: "Cliente" },
  { key: "data", header: "Data" },
  { key: "valor", header: "Valor", align: "right" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function SaidasIndex() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={DollarSign} label="Faturamento Mês" valor="R$ 167.000" variacao={+21} />
        <KpiCard icon={ShoppingCart} label="Pedidos Mês" valor="47" variacao={+12} />
        <KpiCard icon={FileText} label="NFs Emitidas" valor="42" variacao={+8} />
        <KpiCard icon={Package} label="Ticket Médio" valor="R$ 3.553" variacao={-3} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Faturamento Mensal</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={faturamentoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Bar dataKey="valor" fill="oklch(0.78 0.09 85)" radius={[4, 4, 0, 0]} name="Faturamento" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Vendas por Categoria</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={vendasPorCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {vendasPorCategoria.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alertas */}
      <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">3 pedidos aguardando faturamento</p>
          <p className="text-xs text-muted-foreground mt-1">Pedidos PV-0183, PV-0181 e PV-0179 estão pendentes há mais de 24h.</p>
        </div>
      </div>

      {/* Últimos Pedidos */}
      <Card className="border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">Últimos Pedidos</h3>
        <DataTable columns={cols} data={ultimosPedidos} />
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, valor, variacao }: { icon: any; label: string; valor: string; variacao: number }) {
  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 text-xl font-bold">{valor}</p>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className={`mt-2 flex items-center gap-1 text-xs ${variacao >= 0 ? "text-green-600" : "text-red-500"}`}>
        {variacao >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{variacao >= 0 ? "+" : ""}{variacao}% vs. mês anterior</span>
      </div>
    </Card>
  );
}
