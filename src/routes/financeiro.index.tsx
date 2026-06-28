import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export const Route = createFileRoute("/financeiro/")({ component: FinanceiroIndex });

const fluxoData = [
  { mes: "Jan", entradas: 145000, saidas: 128000, saldo: 17000 },
  { mes: "Fev", entradas: 132000, saidas: 135000, saldo: -3000 },
  { mes: "Mar", entradas: 168000, saidas: 142000, saldo: 26000 },
  { mes: "Abr", entradas: 155000, saidas: 148000, saldo: 7000 },
  { mes: "Mai", entradas: 178000, saidas: 162000, saldo: 16000 },
  { mes: "Jun", entradas: 192000, saidas: 171000, saldo: 21000 },
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function FinanceiroIndex() {
  const totalEntradas = fluxoData.reduce((s, d) => s + d.entradas, 0);
  const totalSaidas = fluxoData.reduce((s, d) => s + d.saidas, 0);
  const saldoAtual = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Saldo Atual</p><p className="mt-2 text-xl font-bold text-green-600">{fmt(saldoAtual)}</p></div><DollarSign className="h-5 w-5 text-green-600" /></div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">A Receber (30d)</p><p className="mt-2 text-xl font-bold">{fmt(87500)}</p></div><ArrowUpCircle className="h-5 w-5 text-blue-600" /></div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">A Pagar (30d)</p><p className="mt-2 text-xl font-bold text-red-600">{fmt(72300)}</p></div><ArrowDownCircle className="h-5 w-5 text-red-500" /></div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">Inadimplência</p><p className="mt-2 text-xl font-bold text-amber-600">{fmt(12400)}</p></div><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
        </Card>
      </div>

      <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">Títulos de retenção pendentes</p>
          <p className="text-xs text-muted-foreground mt-1">INSS Retido (R$ 8.450), CSRF (R$ 4.230), ISS Retido (R$ 2.100) — vencimento dia 20/07. GPS Folha (R$ 15.800) — vencimento dia 20/07.</p>
        </div>
      </div>

      <Card className="p-4 border-border">
        <h3 className="text-sm font-semibold mb-4">Fluxo de Caixa — Semestre</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={fluxoData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip formatter={(v: any) => fmt(v)} />
            <Legend />
            <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[4,4,0,0]} />
            <Bar dataKey="saidas" fill="#ef4444" name="Saídas" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
