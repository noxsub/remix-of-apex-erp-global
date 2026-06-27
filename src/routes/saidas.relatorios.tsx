import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, FileBarChart2, Printer, TrendingUp, TrendingDown, Users, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saidas/relatorios")({ component: RelatoriosSaidasPage });

const vendasMensal = [
  { mes: "Jan", vendas: 125000, meta: 130000 }, { mes: "Fev", vendas: 118000, meta: 130000 },
  { mes: "Mar", vendas: 142000, meta: 135000 }, { mes: "Abr", vendas: 155000, meta: 140000 },
  { mes: "Mai", vendas: 138000, meta: 145000 }, { mes: "Jun", vendas: 167000, meta: 150000 },
];

const topClientes = [
  { nome: "Contoso Ltd.", valor: 127800 }, { nome: "Acme Global", valor: 98420 },
  { nome: "Northwind", valor: 67890 }, { nome: "Fabrikam", valor: 45250 },
  { nome: "Initech LLC", valor: 38150 },
];

const topProdutos = [
  { nome: "Tubo HDD 4\"", qtd: 150, valor: 180000 }, { nome: "Cabeça perfuração", qtd: 45, valor: 144450 },
  { nome: "Fluido bentonita", qtd: 200, valor: 60000 }, { nome: "Localizador sonda", qtd: 12, valor: 48000 },
  { nome: "Broca piloto", qtd: 80, valor: 40000 },
];

const vendasPorVendedor = [
  { name: "João Silva", value: 45 }, { name: "Maria Santos", value: 30 },
  { name: "Pedro Costa", value: 25 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function RelatoriosSaidasPage() {
  const [periodo, setPeriodo] = useState("mes");

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-3 items-end justify-between">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Este Mês</SelectItem>
            <SelectItem value="trimestre">Este Trimestre</SelectItem>
            <SelectItem value="semestre">Este Semestre</SelectItem>
            <SelectItem value="ano">Este Ano</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Relatório exportado!")}><Download className="h-3.5 w-3.5" />Excel</Button>
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success("PDF gerado!")}><Printer className="h-3.5 w-3.5" />PDF</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-muted-foreground">Faturamento Total</p><p className="mt-2 text-xl font-bold">R$ 845.000</p></div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-1 text-xs text-green-600">+15% vs. período anterior</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-muted-foreground">Pedidos</p><p className="mt-2 text-xl font-bold">284</p></div>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-1 text-xs text-blue-600">+8% vs. período anterior</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-muted-foreground">Ticket Médio</p><p className="mt-2 text-xl font-bold">R$ 2.975</p></div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-1 text-xs text-green-600">+6% vs. período anterior</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between">
            <div><p className="text-xs text-muted-foreground">Clientes Ativos</p><p className="mt-2 text-xl font-bold">42</p></div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">+3 novos este mês</p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Vendas vs. Meta</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vendasMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Bar dataKey="vendas" fill="#3b82f6" name="Vendas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" fill="#e5e7eb" name="Meta" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Vendas por Vendedor</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={vendasPorVendedor} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {vendasPorVendedor.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Top 5 Clientes</h3>
          <div className="space-y-3">
            {topClientes.map((c, i) => (
              <div key={c.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{i + 1}</span>
                  <span className="text-sm">{c.nome}</span>
                </div>
                <span className="text-sm font-semibold">{fmt(c.valor)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border-border">
          <h3 className="text-sm font-semibold mb-4">Top 5 Produtos</h3>
          <div className="space-y-3">
            {topProdutos.map((p, i) => (
              <div key={p.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{i + 1}</span>
                  <div>
                    <span className="text-sm">{p.nome}</span>
                    <span className="text-xs text-muted-foreground ml-2">({p.qtd} un)</span>
                  </div>
                </div>
                <span className="text-sm font-semibold">{fmt(p.valor)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
